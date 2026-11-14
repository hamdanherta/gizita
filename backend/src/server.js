const app = require('./app');
const { sequelize, Puskesmas, WilayahPosyandu, PengaturanSistem, WhoLms } = require('./models');
const CronService = require('./services/cronService');
const whoStandards = require('who-growth-standards');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

// Pastikan direktori uploads tersedia
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function ensureDatabaseAndSchema() {
  const dbName = process.env.DB_NAME || 'gizita_db';
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASS || '';

  // 1. Buat database gizita_db jika belum ada di MySQL
  try {
    const rawConn = await mysql.createConnection({ host, port, user, password });
    await rawConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rawConn.end();
  } catch (err) {
    console.warn('⚠️ Peringatan koneksi awal database:', err.message);
  }

  // 2. Buat seluruh tabel otomatis jika belum ada di database
  await sequelize.sync();
  console.log('✅ Skema tabel database (19 tabel) siap dan sinkron!');

  // 3. Pastikan data profil Puskesmas default ada
  try {
    let pusk = await Puskesmas.findOne();
    if (!pusk) {
      pusk = await Puskesmas.create({
        nama: 'Puskesmas Kebun Kopi',
        alamat: 'Jl. Kebun Kopi No. 45, Kel. Thehok, Kec. Jambi Selatan, Kota Jambi',
        telepon: '0741-654321',
        email: 'kebunkopi.pusk@gmail.com',
        kepala: 'dr. Hj. Siti Rahma, M.Kes'
      });

      await WilayahPosyandu.bulkCreate([
        { puskesmas_id: pusk.id, nama_posyandu: 'Posyandu Mawar', kelurahan_desa: 'Thehok', alamat: 'RT 04 Kelurahan Thehok' },
        { puskesmas_id: pusk.id, nama_posyandu: 'Posyandu Melati', kelurahan_desa: 'Handil Jaya', alamat: 'RT 12 Kelurahan Handil Jaya' },
        { puskesmas_id: pusk.id, nama_posyandu: 'Posyandu Anggrek', kelurahan_desa: 'Paal Merah', alamat: 'RT 08 Kelurahan Paal Merah' },
        { puskesmas_id: pusk.id, nama_posyandu: 'Posyandu Kamboja', kelurahan_desa: 'Kebun Kopi', alamat: 'RT 15 Kelurahan Kebun Kopi' }
      ]);
    }

    const pSettings = await PengaturanSistem.count();
    if (pSettings === 0) {
      await PengaturanSistem.bulkCreate([
        { key: 'nama_aplikasi', value: 'Gizita' },
        { key: 'logo_url', value: '/logo.png' },
        { key: 'nama_puskesmas', value: 'Puskesmas Kebun Kopi' },
        { key: 'alamat_puskesmas', value: 'Jl. Kebun Kopi No. 45, Kota Jambi' },
        { key: 'kontak_puskesmas', value: '0741-654321 / 0812-7890-1234' },
        { key: 'hari_pengingat_notifikasi', value: '1' }
      ]);
    }

    const uCount = await User.count();
    if (uCount === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      await User.bulkCreate([
        {
          nama: 'Administrator Sara',
          username: 'saragizi',
          email: 'saragizi@gizita.id',
          password_hash: await bcrypt.hash('saragizi', salt),
          role: 'admin',
          puskesmas_id: pusk.id,
          no_hp: '081111111111',
          status_aktif: true
        },
        {
          nama: 'Dita, S.Gz (Petugas Gizi)',
          username: 'ditagizi',
          email: 'ditagizi@gizita.id',
          password_hash: await bcrypt.hash('ditagizi', salt),
          role: 'petugas_gizi',
          puskesmas_id: pusk.id,
          no_hp: '082222222222',
          status_aktif: true
        },
        {
          nama: 'dr. Rasyid (Dokter Puskesmas)',
          username: 'rasyidgizi',
          email: 'rasyidgizi@gizita.id',
          password_hash: await bcrypt.hash('rasyidgizi', salt),
          role: 'dokter',
          puskesmas_id: pusk.id,
          no_hp: '083333333333',
          status_aktif: true
        }
      ]);
      console.log('✅ Akun demo awal (saragizi, ditagizi, rasyidgizi) berhasil dibuat otomatis.');
    }

    const whoCount = await WhoLms.count();
    if (whoCount === 0) {
      const whoRows = [];
      for (const sex of ['male', 'female']) {
        const table = whoStandards.getTable('wfa', sex);
        const genderKey = sex === 'male' ? 'L' : 'P';
        for (let month = 0; month <= 60; month++) {
          const day = Math.min(Math.round(month * 30.4375), table.lms.length - 1);
          const lms = table.lms[day];
          if (lms) whoRows.push({ indikator: 'BBU', jenis_kelamin: genderKey, umur_bulan_atau_tinggi: month, L: lms[0], M: lms[1], S: lms[2] });
        }
      }
      for (const sex of ['male', 'female']) {
        const table = whoStandards.getTable('lhfa', sex);
        const genderKey = sex === 'male' ? 'L' : 'P';
        for (let month = 0; month <= 60; month++) {
          const day = Math.min(Math.round(month * 30.4375), table.lms.length - 1);
          const lms = table.lms[day];
          if (lms) whoRows.push({ indikator: 'TBU', jenis_kelamin: genderKey, umur_bulan_atau_tinggi: month, L: lms[0], M: lms[1], S: lms[2] });
        }
      }
      for (const sex of ['male', 'female']) {
        const table = whoStandards.getTable('wfl', sex);
        const genderKey = sex === 'male' ? 'L' : 'P';
        for (let cm = 45.0; cm <= 110.0; cm += 0.5) {
          const idx = Math.min(Math.round((cm - table.start) / table.step), table.lms.length - 1);
          const lms = table.lms[idx];
          if (lms) whoRows.push({ indikator: 'BBPB', jenis_kelamin: genderKey, umur_bulan_atau_tinggi: cm, L: lms[0], M: lms[1], S: lms[2] });
        }
      }
      for (const sex of ['male', 'female']) {
        const table = whoStandards.getTable('wfh', sex);
        const genderKey = sex === 'male' ? 'L' : 'P';
        for (let cm = 65.0; cm <= 120.0; cm += 0.5) {
          const idx = Math.min(Math.round((cm - table.start) / table.step), table.lms.length - 1);
          const lms = table.lms[idx];
          if (lms) whoRows.push({ indikator: 'BBTB', jenis_kelamin: genderKey, umur_bulan_atau_tinggi: cm, L: lms[0], M: lms[1], S: lms[2] });
        }
      }
      await WhoLms.bulkCreate(whoRows);
    }
  } catch (err) {
    console.warn('⚠️ Catatan inisialisasi master data awal:', err.message);
  }
}

async function startServer() {
  try {
    await ensureDatabaseAndSchema();
    console.log('✅ Koneksi ke MySQL Database (gizita_db) berhasil terhubung!');

    // Mulai Scheduler Cron Job
    CronService.startScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Gizita Backend API berjalan di http://localhost:${PORT}`);
      console.log(`🩺 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Gagal menyambung ke database MySQL:', err.message);
    process.exit(1);
  }
}

startServer();
