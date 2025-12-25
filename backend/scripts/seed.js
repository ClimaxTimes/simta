/**
 * ===========================================
 * Database Seeder - Initial Data
 * ===========================================
 * Script untuk membuat data awal di database:
 * - Admin user
 * - Sample dosen
 * - Sample mahasiswa
 * 
 * Usage: node scripts/seed.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Seed data
const seedData = {
    admin: {
        nim_nip: 'admin001',
        password: 'admin123',
        name: 'Administrator SIMTA',
        email: 'admin@iteba.ac.id',
        role: 'admin',
        status: 'aktif'
    },
    dosen: [
        {
            nim_nip: '198501012010011001',
            password: 'dosen123',
            name: 'Dr. Ahmad Sudrajat, M.Kom.',
            email: 'ahmad.sudrajat@iteba.ac.id',
            role: 'dosen',
            status: 'aktif'
        },
        {
            nim_nip: '198702152012012002',
            password: 'dosen123',
            name: 'Dr. Sri Wahyuni, M.T.',
            email: 'sri.wahyuni@iteba.ac.id',
            role: 'dosen',
            status: 'aktif'
        },
        {
            nim_nip: '199003201015013003',
            password: 'dosen123',
            name: 'Ir. Budi Santoso, M.Eng.',
            email: 'budi.santoso@iteba.ac.id',
            role: 'dosen',
            status: 'aktif'
        }
    ],
    mahasiswa: [
        {
            nim_nip: '2021001001',
            password: 'mahasiswa123',
            name: 'Andi Pratama',
            email: 'andi.pratama@student.iteba.ac.id',
            role: 'mahasiswa',
            prodi: 'Teknik Informatika',
            semester: '8',
            judulTA: 'Sistem Informasi Manajemen Tugas Akhir Berbasis Web',
            currentProgress: 'BAB III',
            status: 'aktif'
        },
        {
            nim_nip: '2021001002',
            password: 'mahasiswa123',
            name: 'Siti Nurhaliza',
            email: 'siti.nurhaliza@student.iteba.ac.id',
            role: 'mahasiswa',
            prodi: 'Teknik Informatika',
            semester: '8',
            judulTA: 'Implementasi Machine Learning untuk Prediksi Cuaca',
            currentProgress: 'BAB II',
            status: 'aktif'
        },
        {
            nim_nip: '2021001003',
            password: 'mahasiswa123',
            name: 'Rudi Hermawan',
            email: 'rudi.hermawan@student.iteba.ac.id',
            role: 'mahasiswa',
            prodi: 'Sistem Informasi',
            semester: '7',
            judulTA: 'Aplikasi E-Commerce dengan React Native',
            currentProgress: 'BAB I',
            status: 'aktif'
        }
    ]
};

/**
 * Seed database with initial data
 */
async function seedDatabase() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🌱 SIMTA Database Seeder                                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    try {
        // Connect to database
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('');

        // Clear existing data (optional - comment out in production)
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        console.log('✅ Existing data cleared');
        console.log('');

        // Create Admin
        console.log('👤 Creating Admin user...');
        const admin = await User.create(seedData.admin);
        console.log(`   ✅ Admin created: ${admin.name} (${admin.nim_nip})`);

        // Create Dosen
        console.log('');
        console.log('👨‍🏫 Creating Dosen users...');
        const dosenList = [];
        for (const dosenData of seedData.dosen) {
            const dosen = await User.create(dosenData);
            dosenList.push(dosen);
            console.log(`   ✅ Dosen created: ${dosen.name} (${dosen.nim_nip})`);
        }

        // Create Mahasiswa with dospem assignment
        console.log('');
        console.log('👨‍🎓 Creating Mahasiswa users...');
        for (let i = 0; i < seedData.mahasiswa.length; i++) {
            const mhsData = seedData.mahasiswa[i];

            // Assign dosen pembimbing
            mhsData.dospem_1 = dosenList[0]._id; // All mahasiswa get first dosen as dospem_1
            mhsData.dospem_2 = dosenList[i % 2 === 0 ? 1 : 2]._id; // Alternate dospem_2

            const mahasiswa = await User.create(mhsData);
            console.log(`   ✅ Mahasiswa created: ${mahasiswa.name} (${mahasiswa.nim_nip})`);
            console.log(`      Dospem 1: ${dosenList[0].name}`);
            console.log(`      Dospem 2: ${dosenList[i % 2 === 0 ? 1 : 2].name}`);
        }

        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   ✅ SEEDING COMPLETED SUCCESSFULLY!                       ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('📋 Login Credentials:');
        console.log('');
        console.log('   ADMIN:');
        console.log('   └─ NIM/NIP: admin001');
        console.log('   └─ Password: admin123');
        console.log('');
        console.log('   DOSEN (all):');
        console.log('   └─ Password: dosen123');
        console.log('');
        console.log('   MAHASISWA (all):');
        console.log('   └─ Password: mahasiswa123');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ SEEDING FAILED!');
        console.error('Error:', error.message);
        console.error('');
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('📴 Database connection closed');
        process.exit(0);
    }
}

// Run seeder
seedDatabase();
