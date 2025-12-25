# 📚 SIMTA - Sistem Informasi Manajemen Tugas Akhir

<p align="center">
  <img src="frontend/public/LOGO-ITEBA-TOPBAR.png" alt="ITEBA Logo" width="200"/>
</p>

<p align="center">
  <strong>Sistem Informasi Manajemen Tugas Akhir</strong><br>
  Institut Teknologi Batam
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-6.x-47A248?logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript"/>
</p>

---

## 📋 Deskripsi

SIMTA adalah sistem informasi berbasis web untuk mengelola proses bimbingan tugas akhir/skripsi. Sistem ini memfasilitasi interaksi antara mahasiswa, dosen pembimbing, dan admin dalam proses penyelesaian tugas akhir.

## ✨ Fitur Utama

### 👨‍🎓 Mahasiswa
- Dashboard dengan progress bimbingan
- Upload dokumen bimbingan (PDF)
- Melihat feedback dari dosen
- Membalas/diskusi dengan dosen
- Melihat jadwal sidang

### 👨‍🏫 Dosen
- Dashboard dengan daftar mahasiswa bimbingan
- Review dokumen bimbingan
- Memberikan feedback (ACC/Revisi/Lanjut Bab)
- Upload file feedback
- Melihat jadwal sidang sebagai penguji

### 👨‍💼 Admin
- Manajemen user (Mahasiswa, Dosen, Admin)
- Plotting dosen pembimbing
- Kelola jadwal sidang
- Dashboard statistik

## 🛠️ Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components
- **Framer Motion** - Animations
- **Redux Toolkit** - State Management
- **React Router** - Routing

### Backend
- **Node.js** + Express.js
- **MongoDB** + Mongoose
- **JWT** - Authentication
- **Multer** - File Upload
- **bcrypt** - Password Hashing

## 📁 Struktur Project

```
Program_Website/
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── store/      # Redux store
│   │   ├── lib/        # Utilities
│   │   └── services/   # API services
│   └── public/         # Static assets
│
├── backend/            # Node.js Backend
│   ├── controller/     # Route controllers
│   ├── models/         # Mongoose models
│   ├── middleware/     # Express middlewares
│   ├── router/         # API routes
│   ├── utils/          # Helper functions
│   └── uploads/        # Uploaded files
│
└── Z_Diagram/          # Documentation & Diagrams
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local atau Atlas)
- npm atau yarn

### Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/username/simta.git
   cd simta
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env dengan konfigurasi database
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env dengan URL backend
   npm run dev
   ```

4. **Seed Database (Optional)**
   ```bash
   cd backend
   npm run seed
   ```

### Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/simta
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 Screenshots

| Login | Dashboard Mahasiswa |
|-------|---------------------|
| ![Login](Z_Diagram/screenshots/login.png) | ![Dashboard](Z_Diagram/screenshots/dashboard.png) |

| Bimbingan | Jadwal Sidang |
|-----------|---------------|
| ![Bimbingan](Z_Diagram/screenshots/bimbingan.png) | ![Jadwal](Z_Diagram/screenshots/jadwal.png) |

## 🔐 Default Accounts

| Role | NIM/NIP | Password |
|------|---------|----------|
| Admin | 1234567891234 | admin123 |
| Dosen | 1234567890003 | admin123 |
| Mahasiswa | 2321053 | admin123 |

## 📄 API Documentation

API tersedia di `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login user |
| GET | `/users` | Get all users |
| GET | `/bimbingan` | Get bimbingan list |
| POST | `/bimbingan` | Submit bimbingan |
| GET | `/jadwal` | Get jadwal sidang |

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 👨‍💻 Author

**Andhika Laksmana Putra Alka**
- NIM: 2321053
- Program Studi: Sistem Informasi
- Institut Teknologi Batam

## 📝 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with ❤️ for Skripsi @ Institut Teknologi Batam 2025
</p>