# BAB 4: ANALISIS DAN PERANCANGAN SISTEM
## SIMTA - Sistem Informasi Manajemen Tugas Akhir
### Institut Teknologi Batam

---

# 4.1 ANALISIS SISTEM

## 4.1.2 Analisis Sistem yang Diusulkan

### A. Transformasi dari Sistem Konvensional ke Sistem Digital

Sistem Informasi Manajemen Tugas Akhir (SIMTA) dikembangkan sebagai solusi untuk mengatasi permasalahan proses bimbingan tugas akhir yang selama ini dilakukan secara konvensional. Pada sistem konvensional, mahasiswa harus melakukan bimbingan secara tatap muka dengan membawa dokumen fisik berupa cetakan draft bab tugas akhir. Proses ini memiliki berbagai kelemahan, antara lain:

1. **Keterbatasan Waktu dan Tempat**: Mahasiswa harus menyesuaikan jadwal dengan dosen pembimbing untuk melakukan bimbingan tatap muka, yang seringkali sulit dilakukan karena kesibukan masing-masing pihak.

2. **Kehilangan Dokumen Revisi**: Dokumen fisik revisi sering tercecer atau hilang, sehingga sulit untuk melacak perubahan yang telah dilakukan dari versi sebelumnya.

3. **Tidak Ada Rekam Jejak (Audit Trail)**: Tidak terdapat pencatatan sistematis mengenai kapan bimbingan dilakukan, feedback apa yang diberikan, dan bagaimana respons mahasiswa terhadap feedback tersebut.

4. **Komunikasi Tidak Terdokumentasi**: Diskusi verbal saat bimbingan tatap muka tidak tercatat, sehingga mahasiswa sering lupa instruksi yang diberikan dosen.

SIMTA mengubah paradigma bimbingan konvensional menjadi sistem digital dengan pendekatan **Asynchronous Communication** yang memungkinkan mahasiswa dan dosen berinteraksi tanpa harus berada di waktu dan tempat yang sama. Sistem ini mengadopsi konsep **Document Versioning** dan **Contextual Thread Discussion** sebagai fitur unggulan.

### B. Alur Kerja Sistem SIMTA

Berikut adalah narasi alur kerja sistem SIMTA dari hulu ke hilir:

#### 1. Proses Autentikasi (Login)
Pengguna mengakses sistem melalui browser dan melakukan autentikasi dengan memasukkan NIM/NIP dan password. Sistem memvalidasi kredensial terhadap database MongoDB menggunakan mekanisme **JSON Web Token (JWT)**. Setelah autentikasi berhasil, token JWT disimpan di LocalStorage browser dan dikirimkan melalui header `Authorization` pada setiap request berikutnya. Berdasarkan atribut `role` pengguna (mahasiswa/dosen/admin), sistem melakukan redirect ke dashboard yang sesuai.

```
Frontend: Cookie/LocalStorage menyimpan JWT Token
Backend: Middleware authMiddleware.js memverifikasi token setiap request
```

#### 2. Dashboard dan Informasi Kontekstual
Dashboard menampilkan informasi kontekstual berdasarkan role pengguna:
- **Mahasiswa**: Melihat informasi dosen pembimbing (dospem 1 dan dospem 2), status progress tugas akhir saat ini (BAB I s/d BAB V), dan statistik jumlah bimbingan yang telah dikirim.
- **Dosen**: Melihat daftar mahasiswa bimbingan, statistik jumlah bimbingan yang menunggu review, dan akses cepat ke fitur review.

#### 3. Proses Upload Revisi dengan Document Versioning
Mahasiswa mengakses halaman "Bimbingan Skripsi" dan memilih tab dosen pembimbing yang dituju (Dospem 1 atau Dospem 2). Sistem menerapkan mekanisme versioning otomatis dengan algoritma sebagai berikut:

**Logika Versioning (Implementasi pada bimbinganController.js dan Bimbingan.js):**
```javascript
// Static method pada Bimbingan Model (lines 221-231)
bimbinganSchema.statics.getNextVersion = async function (mahasiswaId, dosenId) {
    const lastBimbingan = await this.findOne({
        mahasiswa: mahasiswaId,
        dosen: dosenId
    }).sort({ createdAt: -1 });

    if (!lastBimbingan) return 'V1';  // Jika belum ada, mulai dari V1

    const lastVersion = parseInt(lastBimbingan.version.replace('V', ''));
    return `V${lastVersion + 1}`;  // Increment versi
};
```

**Syarat Upload Baru:**
Sistem menerapkan constraint bahwa mahasiswa hanya dapat mengirim bimbingan baru jika bimbingan sebelumnya sudah mendapat feedback dari dosen. Pengecekan dilakukan melalui method `hasPendingBimbingan()`:

```javascript
// Cek apakah ada bimbingan dengan status 'menunggu' (lines 239-246)
bimbinganSchema.statics.hasPendingBimbingan = async function (mahasiswaId, dosenType) {
    const pending = await this.findOne({
        mahasiswa: mahasiswaId,
        dosenType: dosenType,
        status: 'menunggu'
    });
    return !!pending;
};
```

Jika masih ada bimbingan dengan status "menunggu", sistem akan menolak upload baru dengan pesan: *"Anda masih memiliki bimbingan yang menunggu feedback dari dosen ini. Tunggu hingga dosen memberikan feedback sebelum mengirim yang baru."*

#### 4. Notifikasi dan Review Dosen
Setelah mahasiswa mengirim bimbingan, status awal adalah "Menunggu Review". Dosen dapat melihat daftar bimbingan yang perlu direview melalui dashboard. Sistem menggunakan query `status: 'menunggu'` untuk menampilkan antrian bimbingan yang belum direview. Dosen dapat:
- Mengunduh file PDF yang diunggah mahasiswa
- Memberikan feedback tertulis (maksimal 2000 karakter)
- Mengunggah file tambahan sebagai lampiran feedback
- Menetapkan status: **Revisi**, **ACC**, atau **Lanjut BAB**

Ketika dosen memberikan status "Lanjut BAB", sistem secara otomatis memperbarui field `currentProgress` mahasiswa ke BAB berikutnya:

```javascript
// Update progress mahasiswa (lines 226-236)
if (status === 'lanjut_bab') {
    const progressOrder = ['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'Selesai'];
    const currentIndex = progressOrder.indexOf(mahasiswa.currentProgress);
    if (currentIndex < progressOrder.length - 1) {
        mahasiswa.currentProgress = progressOrder[currentIndex + 1];
        await mahasiswa.save();
    }
}
```

#### 5. Contextual Thread Discussion
Sistem menerapkan fitur **Contextual Thread** yang memungkinkan diskusi terikat pada versi dokumen spesifik. Implementasi ini menggunakan Collection terpisah bernama `Reply` yang berelasi dengan Collection `Bimbingan` melalui foreign key `bimbingan`:

```javascript
// Reply Model (lines 18-48)
const replySchema = new Schema({
    bimbingan: {
        type: Schema.Types.ObjectId,
        ref: 'Bimbingan',  // Relasi ke dokumen bimbingan spesifik
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderRole: {
        type: String,
        enum: ['mahasiswa', 'dosen'],  // Identifikasi pengirim
        required: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 2000
    }
}, { timestamps: true });
```

Dengan arsitektur ini, setiap komentar/balasan terikat pada satu dokumen bimbingan tertentu, sehingga tidak tercampur dengan diskusi pada versi dokumen lainnya. Ketika mahasiswa membuka detail bimbingan V2, sistem hanya menampilkan replies yang memiliki `bimbingan._id` sesuai dengan ID bimbingan V2 tersebut.

### C. Keunggulan Sistem yang Diusulkan

| Aspek | Sistem Konvensional | Sistem SIMTA |
|-------|---------------------|--------------|
| Waktu Bimbingan | Terbatas jam kerja | 24/7 asinkron |
| Pelacakan Revisi | Manual, rawan hilang | Versioning otomatis (V1, V2, V3, ...) |
| Diskusi | Verbal, tidak tercatat | Contextual Thread terdokumentasi |
| Progress Tracking | Manual oleh admin | Otomatis update saat "Lanjut BAB" |
| Audit Trail | Tidak ada | Timestamp lengkap setiap aktivitas |

---

# 4.2 ANALISIS KEBUTUHAN FUNGSIONAL

## A. Kebutuhan Fungsional Administrator

Berdasarkan implementasi pada modul `userController.js`, `userRoutes.js`, dan halaman `ManajemenUser.tsx`, kebutuhan fungsional Administrator meliputi:

| Kode | Kebutuhan Fungsional | Deskripsi | Implementasi (Endpoint) |
|------|----------------------|-----------|-------------------------|
| FA-01 | **Login Administrator** | Admin dapat masuk ke sistem dengan NIM/NIP dan password | `POST /api/auth/login` |
| FA-02 | **Melihat Dashboard Statistik** | Admin dapat melihat statistik jumlah user (mahasiswa, dosen, admin) | `GET /api/users/statistics` |
| FA-03 | **Melihat Daftar User** | Admin dapat melihat seluruh user dengan fitur search, filter role, dan pagination | `GET /api/users` |
| FA-04 | **Menambah User Baru** | Admin dapat menambah user baru (mahasiswa/dosen) dengan mengisi NIM/NIP, nama, email, password, program studi, dan judul TA (opsional) | `POST /api/users` |
| FA-05 | **Melihat Detail User** | Admin dapat melihat detail lengkap mahasiswa/dosen termasuk informasi dosen pembimbing | `GET /api/users/:id` |
| FA-06 | **Assign Dosen Pembimbing** | Admin dapat menugaskan/mengubah dosen pembimbing 1 dan 2 untuk mahasiswa | `PUT /api/users/:id/assign-dospem` |
| FA-07 | **Reset Password User** | Admin dapat mereset password user dan melihat password baru | `PUT /api/users/:id/reset-password` |
| FA-08 | **Menonaktifkan User (Soft Delete)** | Admin dapat menonaktifkan akun user tanpa menghapus data dari database | `DELETE /api/users/:id` |
| FA-09 | **Melihat Password User** | Admin dapat melihat password plain text untuk keperluan support | Field `plainPassword` pada response `GET /api/users/:id` |
| FA-10 | **Logout** | Admin dapat keluar dari sistem dan menghapus token | `POST /api/auth/logout` |

## B. Kebutuhan Fungsional Dosen

Berdasarkan implementasi pada modul `bimbinganController.js`, `DashboardDosen.tsx`, dan `BimbinganDosen.tsx`, kebutuhan fungsional Dosen meliputi:

| Kode | Kebutuhan Fungsional | Deskripsi | Implementasi (Endpoint) |
|------|----------------------|-----------|-------------------------|
| FD-01 | **Login Dosen** | Dosen dapat masuk ke sistem dengan NIP dan password | `POST /api/auth/login` |
| FD-02 | **Melihat Dashboard** | Dosen dapat melihat statistik mahasiswa bimbingan dan bimbingan yang menunggu review | `GET /api/users/mahasiswa-bimbingan`, `GET /api/bimbingan` |
| FD-03 | **Melihat Daftar Mahasiswa Bimbingan** | Dosen dapat melihat seluruh mahasiswa yang dibimbingnya beserta progress masing-masing | `GET /api/users/mahasiswa-bimbingan` |
| FD-04 | **Melihat Daftar Bimbingan** | Dosen dapat melihat seluruh submission bimbingan dari mahasiswa dengan filter status | `GET /api/bimbingan?status=menunggu` |
| FD-05 | **Download File Bimbingan** | Dosen dapat mengunduh file PDF yang diunggah mahasiswa | `GET /api/bimbingan/:id/download` |
| FD-06 | **Memberikan Feedback** | Dosen dapat memberikan feedback tertulis dan menetapkan status (Revisi/ACC/Lanjut BAB) | `PUT /api/bimbingan/:id/feedback` |
| FD-07 | **Upload File Feedback** | Dosen dapat melampirkan file pada feedback (opsional) | Field `feedbackFile` pada `PUT /api/bimbingan/:id/feedback` |
| FD-08 | **Membalas Diskusi** | Dosen dapat membalas komentar pada thread diskusi bimbingan | `POST /api/bimbingan/:id/reply` |
| FD-09 | **Melihat Profile** | Dosen dapat melihat informasi profile dan daftar mahasiswa bimbingan | `GET /api/auth/me` |
| FD-10 | **Edit Profile** | Dosen dapat mengubah informasi personal (nama, email, whatsapp, foto) | `PUT /api/users/profile` |
| FD-11 | **Ubah Password** | Dosen dapat mengubah password akun | `PUT /api/auth/change-password` |
| FD-12 | **Logout** | Dosen dapat keluar dari sistem | `POST /api/auth/logout` |

## C. Kebutuhan Fungsional Mahasiswa

Berdasarkan implementasi pada modul `BimbinganMahasiswa.tsx`, `bimbinganService.ts`, dan `bimbinganController.js`, kebutuhan fungsional Mahasiswa meliputi:

| Kode | Kebutuhan Fungsional | Deskripsi | Implementasi (Endpoint) |
|------|----------------------|-----------|-------------------------|
| FM-01 | **Login Mahasiswa** | Mahasiswa dapat masuk ke sistem dengan NIM dan password | `POST /api/auth/login` |
| FM-02 | **Melihat Dashboard** | Mahasiswa dapat melihat info dosen pembimbing, progress saat ini, dan status terakhir | `GET /api/auth/me` |
| FM-03 | **Memilih Tab Dosen Pembimbing** | Mahasiswa dapat memilih untuk mengirim bimbingan ke Dospem 1 atau Dospem 2 | Parameter `dosenType` pada frontend |
| FM-04 | **Mengirim Bimbingan Baru** | Mahasiswa dapat mengisi judul bimbingan, upload file PDF (maks. 10MB), dan menambahkan catatan | `POST /api/bimbingan` dengan `multipart/form-data` |
| FM-05 | **Melihat Riwayat Bimbingan** | Mahasiswa dapat melihat seluruh history bimbingan dengan masing-masing dosen pembimbing | `GET /api/bimbingan?dosenType=dospem_1` |
| FM-06 | **Melihat Detail Bimbingan** | Mahasiswa dapat melihat detail bimbingan termasuk feedback dosen dan thread diskusi | `GET /api/bimbingan/:id` |
| FM-07 | **Download File Bimbingan** | Mahasiswa dapat mengunduh file yang telah diunggah | `GET /api/bimbingan/:id/download` |
| FM-08 | **Download File Feedback** | Mahasiswa dapat mengunduh file lampiran feedback dari dosen | `GET /api/bimbingan/:id/download-feedback` |
| FM-09 | **Membalas Feedback** | Mahasiswa dapat membalas feedback dosen melalui thread diskusi | `POST /api/bimbingan/:id/reply` |
| FM-10 | **Melihat Status Bimbingan** | Mahasiswa dapat melihat status bimbingan (Menunggu/Revisi/ACC/Lanjut BAB) dengan badge warna | Field `status` dan `statusColor` pada response |
| FM-11 | **Melihat Versi Dokumen** | Mahasiswa dapat melihat versi dokumen (V1, V2, V3, ...) untuk tracking revisi | Field `version` pada response |
| FM-12 | **Melihat Profile** | Mahasiswa dapat melihat informasi profile, judul TA, dan dosen pembimbing | `GET /api/auth/me` dengan populate `dospem_1` dan `dospem_2` |
| FM-13 | **Edit Profile** | Mahasiswa dapat mengubah informasi personal | `PUT /api/users/profile` |
| FM-14 | **Logout** | Mahasiswa dapat keluar dari sistem | `POST /api/auth/logout` |

---

# 4.3 PERANCANGAN LOGIKA DAN ALUR

## 4.3.1 Logika Upload dan Versioning Document

Berikut adalah algoritma untuk proses upload bimbingan dengan versioning otomatis:

### Pseudocode: Upload Bimbingan

```
ALGORITMA UploadBimbingan

INPUT:
  - mahasiswa_id: ID mahasiswa yang login
  - dosen_type: 'dospem_1' atau 'dospem_2'
  - judul: Judul bimbingan
  - catatan: Catatan tambahan (opsional)
  - file: File PDF yang diunggah

OUTPUT:
  - Bimbingan baru dengan versi otomatis

PROSES:
1. VALIDASI file
   IF file IS NULL THEN
     RETURN ERROR "File dokumen wajib diunggah"
   END IF
   IF file.type != 'application/pdf' THEN
     DELETE file
     RETURN ERROR "Hanya file PDF yang diperbolehkan"
   END IF

2. DAPATKAN dosen_id berdasarkan dosen_type
   IF dosen_type == 'dospem_1' THEN
     dosen_id = mahasiswa.dospem_1
   ELSE
     dosen_id = mahasiswa.dospem_2
   END IF
   
   IF dosen_id IS NULL THEN
     DELETE file
     RETURN ERROR "Dosen pembimbing belum di-assign"
   END IF

3. CEK apakah ada bimbingan yang masih menunggu feedback
   pending = QUERY Bimbingan WHERE 
     mahasiswa = mahasiswa_id AND
     dosenType = dosen_type AND
     status = 'menunggu'
   
   IF pending EXISTS THEN
     DELETE file
     RETURN ERROR "Masih ada bimbingan yang menunggu feedback"
   END IF

4. HITUNG versi berikutnya
   last_bimbingan = QUERY Bimbingan WHERE
     mahasiswa = mahasiswa_id AND
     dosen = dosen_id
   ORDER BY createdAt DESC
   LIMIT 1
   
   IF last_bimbingan IS NULL THEN
     version = 'V1'
   ELSE
     last_version = PARSE_INT(last_bimbingan.version.replace('V', ''))
     version = 'V' + (last_version + 1)
   END IF

5. SIMPAN bimbingan baru
   bimbingan = CREATE Bimbingan {
     mahasiswa: mahasiswa_id,
     dosen: dosen_id,
     dosenType: dosen_type,
     version: version,
     judul: judul,
     catatan: catatan,
     fileName: file.filename,
     filePath: file.path,
     fileSize: file.size,
     status: 'menunggu'
   }

6. RETURN SUCCESS dengan data bimbingan
```

### Diagram Alir: Syarat Upload Bimbingan Baru

```
[Start]
    ↓
[User klik "Kirim Bimbingan"]
    ↓
[Validasi file PDF?] --NO--> [Tampilkan error] --> [End]
    |
   YES
    ↓
[Dosen pembimbing sudah di-assign?] --NO--> [Tampilkan error] --> [End]
    |
   YES
    ↓
[Ada bimbingan status "Menunggu"?] --YES--> [Tampilkan error: Tunggu feedback] --> [End]
    |
   NO
    ↓
[Hitung versi berikutnya (V1/V2/V3...)]
    ↓
[Simpan bimbingan dengan status "Menunggu"]
    ↓
[Tampilkan pesan sukses]
    ↓
[End]
```

## 4.3.2 Logika Contextual Thread Discussion

Berikut adalah algoritma untuk sistem diskusi yang terikat pada versi dokumen spesifik:

### Pseudocode: Add Reply to Bimbingan

```
ALGORITMA AddReplyToBimbingan

INPUT:
  - bimbingan_id: ID bimbingan target
  - user_id: ID user yang mengirim reply
  - user_role: 'mahasiswa' atau 'dosen'
  - message: Isi pesan

OUTPUT:
  - Reply baru yang terikat pada bimbingan tertentu

PROSES:
1. VALIDASI bimbingan
   bimbingan = QUERY Bimbingan WHERE _id = bimbingan_id
   
   IF bimbingan IS NULL THEN
     RETURN ERROR "Bimbingan tidak ditemukan"
   END IF

2. VALIDASI otorisasi
   IF user_role == 'mahasiswa' THEN
     IF bimbingan.mahasiswa != user_id THEN
       RETURN ERROR "Anda tidak memiliki akses"
     END IF
   ELSE IF user_role == 'dosen' THEN
     IF bimbingan.dosen != user_id THEN
       RETURN ERROR "Anda tidak memiliki akses"
     END IF
   END IF

3. VALIDASI pesan
   IF message IS EMPTY THEN
     RETURN ERROR "Pesan tidak boleh kosong"
   END IF
   IF LENGTH(message) > 2000 THEN
     RETURN ERROR "Pesan maksimal 2000 karakter"
   END IF

4. SIMPAN reply
   reply = CREATE Reply {
     bimbingan: bimbingan_id,  // Foreign key ke bimbingan spesifik
     sender: user_id,
     senderRole: user_role,
     message: message,
     createdAt: NOW()
   }

5. RETURN SUCCESS dengan data reply
```

### Mekanisme Pengikatan Reply ke Bimbingan Spesifik

```
Collection: Bimbingan
┌──────────────────────────────────────────┐
│ _id: ObjectId("bimb001")                 │
│ mahasiswa: ObjectId("mhs001")            │
│ dosen: ObjectId("dos001")                │
│ version: "V1"                            │
│ judul: "Draft BAB I"                     │
│ status: "revisi"                         │
└──────────────────────────────────────────┘
            │
            │ Foreign Key Reference
            ↓
Collection: Reply
┌──────────────────────────────────────────┐
│ _id: ObjectId("rep001")                  │
│ bimbingan: ObjectId("bimb001") ←────────── Terikat ke V1
│ sender: ObjectId("dos001")               │
│ senderRole: "dosen"                      │
│ message: "Tolong perbaiki latar belakang"│
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐
│ _id: ObjectId("rep002")                  │
│ bimbingan: ObjectId("bimb001") ←────────── Terikat ke V1
│ sender: ObjectId("mhs001")               │
│ senderRole: "mahasiswa"                  │
│ message: "Baik pak, akan saya perbaiki"  │
└──────────────────────────────────────────┘

Collection: Bimbingan (Versi selanjutnya)
┌──────────────────────────────────────────┐
│ _id: ObjectId("bimb002")                 │
│ mahasiswa: ObjectId("mhs001")            │
│ dosen: ObjectId("dos001")                │
│ version: "V2" ───────────────────────────── Thread diskusi terpisah
│ judul: "Revisi BAB I"                    │
│ status: "menunggu"                       │
└──────────────────────────────────────────┘
```

---

# 4.4 PERANCANGAN DATABASE

## 4.4.1 Arsitektur Database

Sistem SIMTA menggunakan **MongoDB** sebagai Database Management System dengan pendekatan NoSQL Document-Oriented. Pemilihan MongoDB didasarkan pada:

1. **Fleksibilitas Schema**: Struktur data bimbingan dapat berkembang tanpa migrasi database yang kompleks
2. **Native JSON**: Data dapat langsung ditransformasi ke format JSON untuk API response
3. **Horizontal Scalability**: Kemampuan scaling horizontal untuk menangani pertumbuhan data
4. **Rich Query Language**: Mendukung query kompleks dengan aggregation pipeline

## 4.4.2 Struktur Collection dan Relasi

### Collection 1: Users

Collection ini menyimpan data seluruh pengguna sistem dengan pembedaan role.

| Field | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `_id` | ObjectId | Primary Key, Auto-generated | Identifier unik user |
| `nim_nip` | String | Required, Unique, 5-20 chars | Nomor Induk Mahasiswa atau NIP dosen |
| `password` | String | Required, Min 6 chars, Not Selected | Password ter-hash (bcrypt) |
| `plainPassword` | String | Not Selected | Password plain untuk admin (DEMO) |
| `name` | String | Required, 2-100 chars | Nama lengkap pengguna |
| `email` | String | Email format | Alamat email |
| `role` | String | Enum: mahasiswa, dosen, admin | Jenis pengguna |
| `prodi` | String | Optional | Program studi (untuk mahasiswa) |
| `semester` | String | Optional | Semester aktif (untuk mahasiswa) |
| `judulTA` | String | Optional | Judul tugas akhir (untuk mahasiswa) |
| `dospem_1` | ObjectId | Reference to Users | Dosen Pembimbing 1 (untuk mahasiswa) |
| `dospem_2` | ObjectId | Reference to Users | Dosen Pembimbing 2 (untuk mahasiswa) |
| `currentProgress` | String | Default: 'BAB I' | Progress saat ini (BAB I s/d Selesai) |
| `status` | String | Enum: aktif, nonaktif | Status akun |
| `whatsapp` | String | Optional | Nomor WhatsApp |
| `avatar` | String | Optional | Path foto profil |
| `createdAt` | Date | Auto-generated | Tanggal pembuatan |
| `updatedAt` | Date | Auto-generated | Tanggal update terakhir |

**Relasi Self-Reference:**
- Field `dospem_1` dan `dospem_2` pada document mahasiswa mereferensi document lain dalam collection Users yang memiliki `role: 'dosen'`.

### Collection 2: Bimbingans

Collection ini menyimpan data setiap submission bimbingan dari mahasiswa.

| Field | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `_id` | ObjectId | Primary Key | Identifier unik bimbingan |
| `mahasiswa` | ObjectId | Required, Ref: Users | Mahasiswa pengirim |
| `dosen` | ObjectId | Required, Ref: Users | Dosen penerima |
| `dosenType` | String | Enum: dospem_1, dospem_2 | Jenis dosen pembimbing |
| `version` | String | Required, Format: V1, V2, ... | Versi dokumen |
| `judul` | String | Required, 5-200 chars | Judul bimbingan |
| `catatan` | String | Max 1000 chars | Catatan dari mahasiswa |
| `fileName` | String | Required | Nama file tersimpan |
| `filePath` | String | Required | Path file di server |
| `fileSize` | String | Optional | Ukuran file (bytes) |
| `fileOriginalName` | String | Optional | Nama file asli |
| `status` | String | Enum: menunggu, revisi, acc, lanjut_bab | Status bimbingan |
| `feedback` | String | Max 2000 chars | Feedback dari dosen |
| `feedbackDate` | Date | Auto-set saat feedback | Tanggal feedback |
| `feedbackFile` | String | Optional | Path file feedback |
| `feedbackFileName` | String | Optional | Nama file feedback |
| `createdAt` | Date | Auto-generated | Tanggal kirim |
| `updatedAt` | Date | Auto-generated | Tanggal update |

**Virtual Field:**
- `replies`: Mengambil data dari collection Replies yang memiliki `bimbingan._id` sama dengan `_id` bimbingan ini.

### Collection 3: Replies

Collection ini menyimpan data diskusi/balasan pada setiap bimbingan.

| Field | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `_id` | ObjectId | Primary Key | Identifier unik reply |
| `bimbingan` | ObjectId | Required, Ref: Bimbingans | Bimbingan target |
| `sender` | ObjectId | Required, Ref: Users | Pengirim pesan |
| `senderRole` | String | Enum: mahasiswa, dosen | Role pengirim |
| `message` | String | Required, 1-2000 chars | Isi pesan |
| `createdAt` | Date | Auto-generated | Timestamp pengiriman |

### Collection 4: Jadwals

Collection ini menyimpan data jadwal sidang.

| Field | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `_id` | ObjectId | Primary Key | Identifier unik jadwal |
| `mahasiswa` | ObjectId | Required, Ref: Users | Mahasiswa yang sidang |
| `dospem_1` | ObjectId | Ref: Users | Dosen Pembimbing 1 |
| `dospem_2` | ObjectId | Ref: Users | Dosen Pembimbing 2 |
| `penguji` | Array[ObjectId] | Ref: Users | Daftar dosen penguji |
| `jenisJadwal` | String | Enum: sidang_proposal, sidang_skripsi | Jenis sidang |
| `tanggal` | Date | Required | Tanggal sidang |
| `waktuMulai` | String | Format: HH:MM | Jam mulai |
| `waktuSelesai` | String | Format: HH:MM | Jam selesai |
| `ruangan` | String | Max 100 chars | Lokasi sidang |
| `status` | String | Enum: dijadwalkan, berlangsung, selesai, dibatalkan | Status jadwal |
| `hasil` | String | Enum: lulus, lulus_revisi, tidak_lulus | Hasil sidang |
| `nilaiSidang` | Number | 0-100 | Nilai sidang |
| `catatan` | String | Optional | Catatan tambahan |

## 4.4.3 Diagram Relasi Antar Collection

```
┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ _id (PK)            │
│ nim_nip             │
│ name                │
│ role                │
│ dospem_1 (FK) ──────┼────┐ (Self Reference)
│ dospem_2 (FK) ──────┼────┘
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐         ┌─────────────────────┐
│    BIMBINGANS       │         │      REPLIES        │
├─────────────────────┤         ├─────────────────────┤
│ _id (PK)            │←────────│ bimbingan (FK)      │
│ mahasiswa (FK) ─────┼─→Users  │ sender (FK) ────────┼─→Users
│ dosen (FK) ─────────┼─→Users  │ senderRole          │
│ version             │         │ message             │
│ status              │         │ createdAt           │
│ feedback            │         └─────────────────────┘
└─────────────────────┘                  │
         │                               │
         │                               │
         ↓                               ↓
   (Replies diambil              (Setiap Reply terikat
   via Virtual Field)             ke 1 Bimbingan)
```

---

# 4.5 IMPLEMENTASI ANTARMUKA

## 4.5.1 Halaman Dashboard Mahasiswa

**Fungsi Utama:**
Dashboard Mahasiswa berfungsi sebagai halaman utama setelah mahasiswa berhasil login ke sistem. Halaman ini menampilkan ringkasan informasi penting terkait proses bimbingan tugas akhir.

**Komponen Utama:**
1. **Header Navigation**: Menampilkan logo SIMTA, notifikasi, dan dropdown menu profil user
2. **Sidebar Menu**: Berisi navigasi ke Dashboard, Bimbingan, dan Jadwal Sidang
3. **Kartu Informasi Dosen Pembimbing**: Menampilkan nama Dosen Pembimbing 1 dan 2 beserta tombol akses langsung ke halaman bimbingan masing-masing
4. **Statistik Progress**: Menampilkan progress saat ini (BAB I - BAB V) dan status terakhir
5. **Quick Stats**: Kartu statistik jumlah total bimbingan, status ACC, dan status revisi

**Data yang Ditampilkan:**
- Nama lengkap mahasiswa dan NIM
- Informasi dosen pembimbing (diambil dari field `dospem_1` dan `dospem_2` dengan populate)
- Progress saat ini (field `currentProgress`)
- Statistik bimbingan (dihitung dari collection Bimbingans)

## 4.5.2 Halaman Ruang Bimbingan (Mahasiswa)

**Fungsi Utama:**
Halaman ini merupakan fitur inti sistem yang memungkinkan mahasiswa mengirimkan dokumen bimbingan dan berinteraksi dengan dosen pembimbing.

**Komponen Utama:**

1. **Tab Dosen Pembimbing:**
   - Tab "Dosen Pembimbing 1" (aktif default)
   - Tab "Dosen Pembimbing 2"
   - Setiap tab menampilkan nama dosen dari data user yang login

2. **Form Kirim Bimbingan Baru:**
   - Input "Judul Bimbingan" (required, min 5 karakter)
   - Dropzone "Upload File PDF" (drag & drop atau klik, maks 10MB)
   - Textarea "Catatan Tambahan" (opsional)
   - Tombol "Kirim Bimbingan" (disabled jika ada bimbingan menunggu)

3. **Daftar Riwayat Bimbingan:**
   - List expandable dengan informasi setiap submission
   - Informasi yang ditampilkan: Judul, Versi (V1/V2/...), Tanggal, Status (badge warna)
   - Expanded view: Feedback dosen, File attachment, Thread diskusi
   - Input reply untuk membalas feedback

**Fitur Interaktif:**
- Validasi real-time pada form input
- Preview nama file setelah memilih file
- Loading state saat submit
- Alert/Toast notifikasi setelah berhasil/gagal

## 4.5.3 Halaman Dashboard Dosen

**Fungsi Utama:**
Dashboard Dosen berfungsi sebagai pusat monitoring untuk dosen pembimbing dalam memantau progress mahasiswa bimbingan.

**Komponen Utama:**

1. **Statistik Cards:**
   - Total Mahasiswa Bimbingan (count dari query `mahasiswa-bimbingan`)
   - Menunggu Review (count bimbingan dengan `status: 'menunggu'`)
   - Selesai ACC (count bimbingan dengan `status: 'acc'`)

2. **Tabel Monitoring Mahasiswa:**
   - Kolom: Nama, NIM, Program Studi, Progress (BAB I-V), Judul TA, Status Terakhir, Aksi
   - Filter dan search functionality
   - Tombol "Lihat Detail" untuk navigasi ke halaman bimbingan

3. **Quick Actions:**
   - Tombol akses cepat ke halaman review bimbingan
   - Notifikasi badge untuk bimbingan yang perlu diproses

**Data yang Ditampilkan:**
- List mahasiswa bimbingan (join antara Users dengan filter `dospem_1` atau `dospem_2` = ID dosen login)
- Statistik real-time dari collection Bimbingans

## 4.5.4 Halaman Review Bimbingan (Dosen)

**Fungsi Utama:**
Halaman ini memungkinkan dosen untuk mereview submission bimbingan dari mahasiswa dan memberikan feedback.

**Komponen Utama:**

1. **Informasi Mahasiswa:**
   - Avatar, nama, NIM mahasiswa
   - Judul tugas akhir
   - Progress saat ini

2. **Detail Submission:**
   - Judul bimbingan
   - Versi dokumen
   - Tanggal pengiriman
   - Catatan dari mahasiswa
   - Tombol "Download File" untuk mengunduh PDF

3. **Form Feedback:**
   - Dropdown Status: "Revisi", "ACC", "Lanjut BAB"
   - Textarea Feedback (required, min 5 karakter)
   - Upload File (opsional) untuk melampirkan dokumen
   - Tombol "Kirim Feedback"

4. **Thread Diskusi:**
   - Daftar chat/komentar terkait submission ini
   - Input untuk membalas

---

# PENUTUP BAB 4

Pada bab ini telah diuraikan analisis dan perancangan Sistem Informasi Manajemen Tugas Akhir (SIMTA) secara komprehensif. Sistem ini dirancang untuk mengubah paradigma bimbingan tugas akhir dari sistem konvensional menjadi sistem digital yang terintegrasi. Fitur unggulan berupa **Document Versioning** dan **Contextual Thread Discussion** menjadi solusi atas permasalahan pelacakan revisi dan dokumentasi diskusi pada sistem konvensional.

Perancangan database menggunakan MongoDB dengan 4 collection utama (Users, Bimbingans, Replies, Jadwals) yang saling berelasi untuk mendukung integritas data. Arsitektur sistem mengadopsi pola **RESTful API** dengan pemisahan concern antara frontend (React.js) dan backend (Express.js) untuk kemudahan pengembangan dan pemeliharaan.

---

*Dokumen ini disusun untuk keperluan Laporan Skripsi BAB 4*
*Program Studi Sistem Informasi - Institut Teknologi Batam*
*Tahun 2024*
