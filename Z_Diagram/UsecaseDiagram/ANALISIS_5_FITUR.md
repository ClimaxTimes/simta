# ANALISIS ACTIVITY DIAGRAM - 5 FITUR UTAMA SIMTA
## Berdasarkan Kode Controller Backend

---

# FITUR 1: ADMIN KELOLA DATA USER (CREATE USER)

## 📋 Alur Logika dari Kode (userController.js: line 111-141):

```
1. Admin mengisi form data user (NIM/NIP, Password, Nama, Email, Role, Prodi, Semester)
2. SISTEM memeriksa kelengkapan data (express-validator)
3. DATABASE mencari user dengan NIM/NIP yang sama
4. VALIDASI: User.findOne({ nim_nip })
   - Jika sudah ada → Error: "NIM/NIP sudah terdaftar"
   - Jika belum ada → Lanjut
5. DATABASE membuat user baru: User.create({...})
6. Password di-hash otomatis (bcrypt - Model pre-save)
7. SISTEM menampilkan pesan sukses
```

### Validasi yang Dilakukan:
| No | Validasi | Lokasi |
|----|----------|--------|
| 1 | NIM/NIP tidak boleh duplikat | Line 115-122 |
| 2 | Password di-hash otomatis | Model User (pre-save) |

### Tabel yang Di-update:
- **Collection: `users`** → INSERT 1 document baru

---

# FITUR 2: ADMIN PLOTTING DOSEN PEMBIMBING

## 📋 Alur Logika dari Kode (userController.js: line 226-273):

```
1. Admin memilih mahasiswa dan dosen pembimbing
2. SISTEM menerima data (mahasiswa_id, dospem_1, dospem_2)
3. DATABASE mencari mahasiswa: User.findById(id)
   - Jika tidak ditemukan → Error: "Mahasiswa tidak ditemukan"
4. VALIDASI: Cek role = 'mahasiswa'
   - Jika bukan mahasiswa → Error: "Hanya mahasiswa yang dapat di-assign"
5. VALIDASI dospem_1: User.findById(dospem_1)
   - Cek role = 'dosen'
   - Jika bukan dosen → Error: "Dosen tidak valid"
6. VALIDASI dospem_2: User.findById(dospem_2)
   - Cek role = 'dosen'
7. VALIDASI: dospem_1 !== dospem_2
   - Jika sama → Error: "Dosen pembimbing 1 dan 2 tidak boleh sama"
8. DATABASE update: mahasiswa.save()
9. SISTEM menampilkan pesan sukses
```

### Validasi yang Dilakukan:
| No | Validasi | Lokasi |
|----|----------|--------|
| 1 | Target harus role 'mahasiswa' | Line 235-237 |
| 2 | Dospem 1 harus role 'dosen' | Line 240-244 |
| 3 | Dospem 2 harus role 'dosen' | Line 251-255 |
| 4 | Dospem 1 ≠ Dospem 2 | Line 262-264 |

### Tabel yang Di-update:
- **Collection: `users`** → UPDATE field `dospem_1` dan `dospem_2` pada document mahasiswa

---

# FITUR 3: MAHASISWA UPLOAD BIMBINGAN

## 📋 Alur Logika dari Kode (bimbinganController.js: line 115-182):

```
1. Mahasiswa mengisi form (judul, catatan, dosen tujuan) + upload file
2. VALIDASI FILE:
   - File wajib ada → Error: "File dokumen wajib diunggah"
   - Tipe file harus PDF → Error: "Hanya file PDF yang diperbolehkan"
3. DATABASE mencari dosen pembimbing:
   - Jika dosenType = 'dospem_1' → ambil mahasiswa.dospem_1
   - Jika dosenType = 'dospem_2' → ambil mahasiswa.dospem_2
   - Jika dosen belum di-assign → Error: "Dosen pembimbing belum di-assign"
4. **VALIDASI PENTING - CEK PENDING:**
   - Bimbingan.hasPendingBimbingan(mahasiswa_id, dosenType)
   - Jika ada status 'menunggu' → Error: "Masih ada bimbingan yang menunggu feedback"
   - **KESIMPULAN: TIDAK BISA UPLOAD jika masih ada yang PENDING**
5. HITUNG VERSION OTOMATIS:
   - Bimbingan.getNextVersion(mahasiswa_id, dosen_id)
   - Ambil bimbingan terakhir → V1 menjadi V2, V2 menjadi V3, dst.
6. DATABASE insert: Bimbingan.create({...status: 'menunggu'})
7. SISTEM menampilkan pesan sukses
```

### Validasi yang Dilakukan:
| No | Validasi | Lokasi |
|----|----------|--------|
| 1 | File wajib ada | Line 121-123 |
| 2 | File harus PDF | Line 126-130 |
| 3 | Dosen pembimbing sudah di-assign | Line 140-146 |
| 4 | **Tidak ada bimbingan PENDING** | Line 149-156 |
| 5 | Versioning otomatis (V1, V2, V3...) | Line 159 |

### Tabel yang Di-update:
- **Collection: `bimbingans`** → INSERT 1 document baru

---

# FITUR 4: DOSEN REVIEW BIMBINGAN

## 📋 Alur Logika dari Kode (bimbinganController.js: line 189-244):

```
1. Dosen memilih bimbingan dan mengisi form review (status, feedback)
2. DATABASE mencari bimbingan: Bimbingan.findById(id)
   - Jika tidak ditemukan → Error: "Bimbingan tidak ditemukan"
3. VALIDASI OTORISASI: bimbingan.dosen === logged_in_dosen
   - Jika bukan → Error: "Anda tidak memiliki akses"
4. VALIDASI STATUS: bimbingan.status === 'menunggu'
   - Jika sudah direview → Error: "Bimbingan sudah direview"
5. DATABASE update bimbingan:
   - status = 'revisi' / 'acc' / 'lanjut_bab'
   - feedback = catatan dosen
   - feedbackDate = new Date()
   - feedbackFile = file (opsional)
6. **JIKA STATUS = 'lanjut_bab':**
   - DATABASE cari mahasiswa: User.findById(bimbingan.mahasiswa)
   - UPDATE progress: currentProgress = next BAB
   - Urutan: BAB I → BAB II → BAB III → BAB IV → BAB V → Selesai
7. SISTEM menampilkan pesan sukses
```

### Validasi yang Dilakukan:
| No | Validasi | Lokasi |
|----|----------|--------|
| 1 | Bimbingan harus ada | Line 195-197 |
| 2 | Dosen harus pemilik bimbingan | Line 200-202 |
| 3 | Status harus 'menunggu' | Line 205-210 |

### Tabel yang Di-update:
- **Collection: `bimbingans`** → UPDATE field status, feedback, feedbackDate
- **Collection: `users`** → UPDATE field `currentProgress` (jika lanjut_bab)

---

# FITUR 5: DISKUSI / REPLY KOMENTAR

## 📋 Alur Logika dari Kode (bimbinganController.js: line 251-283):

```
1. User (Mahasiswa/Dosen) mengetik pesan balasan
2. DATABASE mencari bimbingan: Bimbingan.findById(id)
   - Jika tidak ditemukan → Error: "Bimbingan tidak ditemukan"
3. VALIDASI OTORISASI:
   - Jika mahasiswa → cek bimbingan.mahasiswa === user_id
   - Jika dosen → cek bimbingan.dosen === user_id
   - Jika bukan keduanya dan bukan admin → Error: "Tidak memiliki akses"
4. DATABASE insert reply: Reply.create({
     bimbingan: bimbingan_id,  ← TERHUBUNG VIA ID
     sender: user_id,
     senderRole: role,
     message: pesan
   })
5. SISTEM menampilkan pesan sukses
```

### Cara Kaitan dengan Bimbingan:
- **Foreign Key:** Field `bimbingan` di collection `replies` menyimpan ObjectId dari document `bimbingans`
- **Relasi:** 1 Bimbingan : Many Replies

### Validasi yang Dilakukan:
| No | Validasi | Lokasi |
|----|----------|--------|
| 1 | Bimbingan harus ada | Line 258-260 |
| 2 | User harus terkait dengan bimbingan | Line 263-268 |

### Tabel yang Di-update:
- **Collection: `replies`** → INSERT 1 document baru

---

# RINGKASAN TABEL YANG DI-UPDATE

| Fitur | Collection | Operation |
|-------|------------|-----------|
| Create User | `users` | INSERT |
| Plotting Dospem | `users` | UPDATE (dospem_1, dospem_2) |
| Upload Bimbingan | `bimbingans` | INSERT |
| Review Bimbingan | `bimbingans`, `users` | UPDATE |
| Diskusi Reply | `replies` | INSERT |

---

*Dokumen analisis untuk BAB 4 Skripsi SIMTA*
*Berdasarkan kode backend controller*
