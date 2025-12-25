# 📋 RANGKUMAN FITUR APLIKASI SIMTA
## Sistem Informasi Manajemen Tugas Akhir
### Institut Teknologi Batam

---

## 1. INFORMASI UMUM APLIKASI

### 1.1 Identitas Aplikasi
| Aspek | Keterangan |
|-------|------------|
| **Nama Aplikasi** | SIMTA (Sistem Informasi Manajemen Tugas Akhir) |
| **Jenis** | Aplikasi Web |
| **Arsitektur** | Client-Server dengan REST API |
| **Frontend** | React.js + TypeScript + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (NoSQL) |
| **Autentikasi** | JWT (JSON Web Token) |

### 1.2 Role Pengguna
1. **Admin** - Mengelola seluruh sistem
2. **Dosen** - Dosen pembimbing tugas akhir
3. **Mahasiswa** - Mahasiswa yang sedang mengerjakan tugas akhir

---

## 2. FITUR BERDASARKAN ROLE

### 2.1 FITUR ADMIN

#### A. Dashboard Admin
- Menampilkan statistik jumlah user (mahasiswa, dosen, admin)
- Menampilkan ringkasan aktivitas sistem
- Quick action buttons untuk navigasi cepat

#### B. Manajemen User
| Fitur | Deskripsi |
|-------|-----------|
| **Lihat Daftar User** | Menampilkan tabel semua user dengan filter, search, dan pagination |
| **Tambah User** | Form modal untuk menambah user baru (mahasiswa/dosen) |
| **Edit Dosen Pembimbing** | Assign/ubah dosen pembimbing 1 dan 2 untuk mahasiswa |
| **Hapus User (Soft Delete)** | Menonaktifkan user tanpa menghapus data |
| **Reset Password** | Admin dapat mereset password user |
| **Lihat Detail Mahasiswa** | Halaman detail informasi mahasiswa, judul TA, dosen pembimbing |
| **Lihat Detail Dosen** | Halaman detail dosen beserta daftar mahasiswa bimbingan |
| **Lihat Password User** | Admin dapat melihat password plain untuk keperluan support |

#### C. Kelola Jadwal Sidang
- Membuat jadwal sidang proposal/skripsi
- Menentukan tanggal, waktu, ruangan
- Assign penguji sidang

---

### 2.2 FITUR DOSEN

#### A. Dashboard Dosen
- Melihat statistik mahasiswa bimbingan
- Menampilkan progress bimbingan terakhir
- Quick access ke fitur bimbingan

#### B. Bimbingan Skripsi (Dosen)
| Fitur | Deskripsi |
|-------|-----------|
| **Lihat Daftar Mahasiswa Bimbingan** | Melihat semua mahasiswa yang dibimbing |
| **Review Bimbingan** | Melihat submission bimbingan dari mahasiswa |
| **Download File Bimbingan** | Mengunduh file PDF yang diupload mahasiswa |
| **Beri Feedback** | Memberikan feedback dengan status (Revisi/ACC/Lanjut BAB) |
| **Upload File Feedback** | Melampirkan file pada feedback (opsional) |
| **Balas Pesan** | Sistem reply untuk komunikasi dengan mahasiswa |

#### C. Profile Dosen
- Melihat informasi profile
- Edit informasi personal (nama, email, whatsapp, foto)
- Ubah password

---

### 2.3 FITUR MAHASISWA

#### A. Dashboard Mahasiswa
- Melihat informasi dosen pembimbing
- Status progress tugas akhir saat ini
- Quick access ke fitur bimbingan

#### B. Bimbingan Skripsi (Mahasiswa)
| Fitur | Deskripsi |
|-------|-----------|
| **Pilih Dosen Pembimbing** | Tab untuk memilih Dospem 1 atau Dospem 2 |
| **Kirim Bimbingan Baru** | Form untuk submit bimbingan baru |
| **Upload File PDF** | Upload dokumen bimbingan (maksimal 10MB) |
| **Tambah Catatan** | Menambahkan catatan/keterangan bimbingan |
| **Lihat Riwayat Bimbingan** | Melihat semua history bimbingan |
| **Lihat Feedback Dosen** | Melihat feedback dan status dari dosen |
| **Download File Feedback** | Mengunduh file feedback dari dosen |
| **Balas Feedback** | Membalas feedback dosen (sistem reply) |
| **Status Tracking** | Melihat status bimbingan (Menunggu/Revisi/ACC/Lanjut BAB) |

#### C. Profile Mahasiswa
- Melihat informasi profile
- Melihat judul tugas akhir
- Melihat dosen pembimbing yang ditugaskan
- Edit informasi personal

---

## 3. FITUR SISTEM (CROSS-CUTTING)

### 3.1 Autentikasi & Keamanan
| Fitur | Deskripsi |
|-------|-----------|
| **Login** | Autentikasi dengan NIM/NIP dan password |
| **Logout** | Keluar dari sistem dengan menghapus token |
| **JWT Token** | Token-based authentication dengan expiry |
| **Role-based Access Control** | Pembatasan akses berdasarkan role user |
| **Password Hashing** | Password di-hash menggunakan bcrypt |
| **Protected Routes** | Route dilindungi oleh middleware autentikasi |

### 3.2 File Management
| Fitur | Deskripsi |
|-------|-----------|
| **Upload File PDF** | Upload dokumen bimbingan |
| **Download File** | Download file yang diupload |
| **File Size Limit** | Maksimal 10MB per file |
| **Avatar Upload** | Upload foto profile user |

### 3.3 UI/UX Features
| Fitur | Deskripsi |
|-------|-----------|
| **Responsive Design** | Tampilan menyesuaikan ukuran layar |
| **Loading States** | Indikator loading saat fetch data |
| **Error Handling** | Pesan error yang informatif |
| **Animasi** | Framer Motion untuk transisi halus |
| **Toast/Alert** | Notifikasi feedback aksi user |

---

## 4. STRUKTUR DATABASE

### 4.1 Model User
```
- nim_nip (String, unique)
- password (String, hashed)
- plainPassword (String, untuk admin)
- name (String)
- email (String)
- role (enum: mahasiswa, dosen, admin)
- prodi (String)
- semester (String)
- judulTA (String)
- dospem_1 (Reference to User)
- dospem_2 (Reference to User)
- currentProgress (String)
- status (enum: aktif, nonaktif)
- whatsapp (String)
- avatar (String)
```

### 4.2 Model Bimbingan
```
- mahasiswa (Reference to User)
- dosen (Reference to User)
- dosenType (enum: dospem_1, dospem_2)
- version (String, auto-increment)
- judul (String)
- catatan (String)
- fileName (String)
- filePath (String)
- status (enum: menunggu, revisi, acc, lanjut_bab)
- feedback (String)
- feedbackFile (String)
- tanggalKirim (Date)
- tanggalFeedback (Date)
```

### 4.3 Model Reply
```
- bimbingan (Reference to Bimbingan)
- sender (Reference to User)
- senderRole (enum: mahasiswa, dosen)
- message (String)
- createdAt (Date)
```

### 4.4 Model Jadwal
```
- mahasiswa (Reference to User)
- dospem_1 (Reference to User)
- dospem_2 (Reference to User)
- penguji (Array of References to User)
- jenisJadwal (enum: sidang_proposal, sidang_skripsi)
- tanggal (Date)
- waktuMulai (String)
- waktuSelesai (String)
- ruangan (String)
- status (enum: dijadwalkan, berlangsung, selesai, dibatalkan)
- hasil (enum: lulus, lulus_revisi, tidak_lulus)
- nilaiSidang (Number)
- catatan (String)
```

---

## 5. API ENDPOINTS

### 5.1 Authentication API
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user info |
| PUT | `/api/auth/change-password` | Ubah password |

### 5.2 User API
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/users` | Get all users (Admin) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user (Admin) |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Soft delete user (Admin) |
| PUT | `/api/users/:id/assign-dospem` | Assign dosen pembimbing (Admin) |
| PUT | `/api/users/:id/reset-password` | Reset password (Admin) |
| GET | `/api/users/statistics` | Get user statistics |
| GET | `/api/users/dosen` | Get all dosen |
| GET | `/api/users/mahasiswa-bimbingan` | Get mahasiswa bimbingan |

### 5.3 Bimbingan API
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/bimbingan` | Get all bimbingan |
| GET | `/api/bimbingan/:id` | Get bimbingan by ID |
| POST | `/api/bimbingan` | Create new bimbingan (Mahasiswa) |
| PUT | `/api/bimbingan/:id/feedback` | Give feedback (Dosen) |
| POST | `/api/bimbingan/:id/reply` | Add reply |
| GET | `/api/bimbingan/:id/download` | Download file |

### 5.4 Jadwal API
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/jadwal` | Get all jadwal |
| GET | `/api/jadwal/:id` | Get jadwal by ID |
| POST | `/api/jadwal` | Create new jadwal (Admin) |
| PUT | `/api/jadwal/:id` | Update jadwal |
| DELETE | `/api/jadwal/:id` | Delete jadwal (Admin) |

---

## 6. TEKNOLOGI & LIBRARY YANG DIGUNAKAN

### 6.1 Frontend
| Library | Versi | Fungsi |
|---------|-------|--------|
| React | 18.x | Framework UI |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Styling |
| Shadcn/ui | - | Komponen UI |
| Framer Motion | 11.x | Animasi |
| React Router DOM | 6.x | Routing |
| Redux Toolkit | 2.x | State Management |
| Axios | 1.x | HTTP Client |
| Lucide React | - | Icon library |

### 6.2 Backend
| Library | Versi | Fungsi |
|---------|-------|--------|
| Express.js | 4.x | Web framework |
| Mongoose | 8.x | MongoDB ODM |
| bcryptjs | 2.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |
| multer | 1.x | File upload |
| express-validator | 7.x | Input validation |
| cors | 2.x | Cross-origin requests |
| dotenv | 17.x | Environment variables |

---

## 7. ALUR KERJA UTAMA

### 7.1 Alur Bimbingan
```
1. Mahasiswa login ke sistem
2. Mahasiswa pilih tab dosen pembimbing (Dospem 1 atau 2)
3. Mahasiswa isi judul bimbingan
4. Mahasiswa upload file PDF
5. Mahasiswa klik "Kirim Bimbingan"
6. Status bimbingan = "Menunggu Review"
7. Dosen menerima notifikasi bimbingan baru
8. Dosen download dan review file
9. Dosen beri feedback + status (Revisi/ACC/Lanjut BAB)
10. Mahasiswa melihat feedback
11. Jika revisi, mahasiswa kirim bimbingan baru (versi +1)
12. Proses berulang sampai ACC
```

### 7.2 Alur Admin Kelola User
```
1. Admin login ke sistem
2. Admin buka halaman Manajemen User
3. Admin dapat:
   - Menambah user baru (mahasiswa/dosen)
   - Melihat detail user
   - Edit dosen pembimbing mahasiswa
   - Reset password user
   - Menonaktifkan user
```

---

## 8. STRUKTUR FOLDER PROYEK

```
Program_Website/
├── frontend/
│   ├── src/
│   │   ├── components/ui/     # Komponen UI (shadcn)
│   │   ├── lib/               # API client, utilities
│   │   ├── pages/             # Halaman aplikasi
│   │   │   ├── Admin/         # Halaman admin
│   │   │   ├── Bimbingan/     # Halaman bimbingan
│   │   │   ├── Dashboard/     # Halaman dashboard
│   │   │   ├── Login/         # Halaman login
│   │   │   └── Profile/       # Halaman profile
│   │   ├── services/          # API service functions
│   │   ├── store/             # Redux store & slices
│   │   └── App.tsx            # Main app component
│   └── package.json
│
├── backend/
│   ├── config/                # Database config
│   ├── controller/            # Request handlers
│   ├── middleware/            # Auth & validation
│   ├── models/                # Database models
│   ├── router/                # API routes
│   ├── uploads/               # Uploaded files
│   ├── utils/                 # Helper functions
│   └── app.js                 # Entry point
│
└── README.md
```

---

## 9. KESIMPULAN

Aplikasi SIMTA (Sistem Informasi Manajemen Tugas Akhir) merupakan aplikasi web yang dirancang untuk mengelola proses bimbingan tugas akhir di Institut Teknologi Batam. Aplikasi ini memiliki 3 role utama (Admin, Dosen, Mahasiswa) dengan fitur-fitur yang disesuaikan dengan kebutuhan masing-masing role.

Fitur utama aplikasi meliputi:
1. **Manajemen User** - Pengelolaan data mahasiswa dan dosen
2. **Bimbingan Online** - Proses bimbingan digital dengan upload file dan feedback
3. **Tracking Progress** - Monitoring status bimbingan (Menunggu/Revisi/ACC/Lanjut BAB)
4. **Jadwal Sidang** - Penjadwalan sidang proposal dan skripsi

Aplikasi dibangun menggunakan teknologi modern (React, Node.js, MongoDB) dengan arsitektur REST API yang scalable dan maintainable.

---

*Dokumen ini dibuat untuk keperluan dokumentasi BAB 4 Skripsi*
*Tanggal: 21 Desember 2024*
