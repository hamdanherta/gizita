const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const whoStandards = require('who-growth-standards');
const { sequelize } = require('../models');

async function generateSqlDump() {
  const qg = sequelize.getQueryInterface().queryGenerator;
  let sql = '-- =============================================================\n';
  sql += '-- GIZITA DATABASE DUMP (PUSKESMAS KEBUN KOPI)\n';
  sql += '-- Dibuat otomatis untuk sinkronisasi GitHub & import lokal\n';
  sql += '-- =============================================================\n\n';
  sql += 'CREATE DATABASE IF NOT EXISTS `gizita_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
  sql += 'USE `gizita_db`;\n\n';
  sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

  const tableOrder = [
    'pengaturan_sistem',
    'puskesmas',
    'wilayah_posyandu',
    'users',
    'who_lms',
    'menu_makanan',
    'orang_tua',
    'balita',
    'pengukuran',
    'status_gizi',
    'rencana_intervensi',
    'jadwal_pmt',
    'konsumsi_pmt',
    'jadwal_posyandu',
    'kunjungan_posyandu',
    'catatan_pemeriksaan',
    'rekomendasi_dokter',
    'notifikasi',
    'log_aktivitas'
  ];

  for (const tName of tableOrder) {
    const model = Object.values(sequelize.models).find(m => m.getTableName() === tName);
    if (!model) continue;
    sql += `DROP TABLE IF EXISTS \`${tName}\`;\n`;
    const attr = qg.attributesToSQL(model.getAttributes());
    const createQuery = qg.createTableQuery(tName, attr);
    sql += createQuery + ';\n\n';
  }

  // 1. Pengaturan Sistem
  sql += '-- -------------------------------------------------------------\n';
  sql += '-- Data: Pengaturan Sistem\n';
  sql += '-- -------------------------------------------------------------\n';
  sql += 'INSERT INTO `pengaturan_sistem` (`key`, `value`, `createdAt`, `updatedAt`) VALUES\n';
  sql += "('nama_aplikasi', 'Gizita', NOW(), NOW()),\n";
  sql += "('logo_url', '/logo.png', NOW(), NOW()),\n";
  sql += "('nama_puskesmas', 'Puskesmas Kebun Kopi', NOW(), NOW()),\n";
  sql += "('alamat_puskesmas', 'Jl. Kebun Kopi No. 45, Kota Jambi', NOW(), NOW()),\n";
  sql += "('kontak_puskesmas', '0741-654321 / 0812-7890-1234', NOW(), NOW()),\n";
  sql += "('hari_pengingat_notifikasi', '1', NOW(), NOW());\n\n";

  // 2. Puskesmas
  sql += '-- -------------------------------------------------------------\n';
  sql += '-- Data: Puskesmas\n';
  sql += '-- -------------------------------------------------------------\n';
  sql += 'INSERT INTO `puskesmas` (`id`, `nama`, `alamat`, `telepon`, `email`, `kepala`, `createdAt`, `updatedAt`) VALUES\n';
  sql += "(1, 'Puskesmas Kebun Kopi', 'Jl. Kebun Kopi No. 45, Kel. Thehok, Kec. Jambi Selatan, Kota Jambi', '0741-654321', 'kebunkopi.pusk@gmail.com', 'dr. Hj. Siti Rahma, M.Kes', NOW(), NOW());\n\n";

  // 3. Wilayah Posyandu
  sql += '-- -------------------------------------------------------------\n';
  sql += '-- Data: Wilayah Posyandu\n';
  sql += '-- -------------------------------------------------------------\n';
  sql += 'INSERT INTO `wilayah_posyandu` (`id`, `puskesmas_id`, `nama_posyandu`, `kelurahan_desa`, `alamat`, `nama_kader`, `telepon_kader`, `createdAt`, `updatedAt`) VALUES\n';
  sql += "(1, 1, 'Posyandu Mawar', 'Thehok', 'RT 04 Kelurahan Thehok', 'Ibu Sri Wahyuni', '081234567801', NOW(), NOW()),\n";
  sql += "(2, 1, 'Posyandu Melati', 'Handil Jaya', 'RT 12 Kelurahan Handil Jaya', 'Ibu Nurhayati', '081234567802', NOW(), NOW()),\n";
  sql += "(3, 1, 'Posyandu Anggrek', 'Paal Merah', 'RT 08 Kelurahan Paal Merah', 'Ibu Ratna Dewi', '081234567803', NOW(), NOW()),\n";
  sql += "(4, 1, 'Posyandu Kamboja', 'Kebun Kopi', 'RT 15 Kelurahan Kebun Kopi', 'Ibu Mariana', '081234567804', NOW(), NOW());\n\n";

  // 4. Users (admin, petugas, dokter)
  sql += '-- -------------------------------------------------------------\n';
  sql += '-- Data: Akun Pengguna Resmi (Password: admin123, petugas123, dokter123)\n';
  sql += '-- -------------------------------------------------------------\n';
  const salt = await bcrypt.genSalt(10);
  const pAdmin = await bcrypt.hash('admin123', salt);
  const pPetugas = await bcrypt.hash('petugas123', salt);
  const pDokter = await bcrypt.hash('dokter123', salt);
  sql += 'INSERT INTO `users` (`id`, `nama`, `username`, `email`, `password_hash`, `role`, `puskesmas_id`, `no_hp`, `status_aktif`, `createdAt`, `updatedAt`) VALUES\n';
  sql += `(1, 'Administrator Gizita', 'admin', 'admin@gizita.id', '${pAdmin}', 'admin', 1, '081111111111', 1, NOW(), NOW()),\n`;
  sql += `(2, 'Sara Maulidia, S.Gz', 'petugas', 'petugas@gizita.id', '${pPetugas}', 'petugas_gizi', 1, '082222222222', 1, NOW(), NOW()),\n`;
  sql += `(3, 'dr. Budi Santoso, Sp.A', 'dokter', 'dokter@gizita.id', '${pDokter}', 'dokter', 1, '083333333333', 1, NOW(), NOW());\n\n`;

  // 5. Standar WHO LMS
  sql += '-- -------------------------------------------------------------\n';
  sql += '-- Data: Standar Pertumbuhan WHO LMS (728 Baris)\n';
  sql += '-- -------------------------------------------------------------\n';
  const whoRows = [];
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('wfa', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let month = 0; month <= 60; month++) {
      const day = Math.min(Math.round(month * 30.4375), table.lms.length - 1);
      const lms = table.lms[day];
      if (lms) whoRows.push(`('BBU', '${genderKey}', ${month}, ${lms[0]}, ${lms[1]}, ${lms[2]}, NOW(), NOW())`);
    }
  }
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('lhfa', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let month = 0; month <= 60; month++) {
      const day = Math.min(Math.round(month * 30.4375), table.lms.length - 1);
      const lms = table.lms[day];
      if (lms) whoRows.push(`('TBU', '${genderKey}', ${month}, ${lms[0]}, ${lms[1]}, ${lms[2]}, NOW(), NOW())`);
    }
  }
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('wfl', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let cm = 45.0; cm <= 110.0; cm += 0.5) {
      const idx = Math.min(Math.round((cm - table.start) / table.step), table.lms.length - 1);
      const lms = table.lms[idx];
      if (lms) whoRows.push(`('BBPB', '${genderKey}', ${cm}, ${lms[0]}, ${lms[1]}, ${lms[2]}, NOW(), NOW())`);
    }
  }
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('wfh', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let cm = 65.0; cm <= 120.0; cm += 0.5) {
      const idx = Math.min(Math.round((cm - table.start) / table.step), table.lms.length - 1);
      const lms = table.lms[idx];
      if (lms) whoRows.push(`('BBTB', '${genderKey}', ${cm}, ${lms[0]}, ${lms[1]}, ${lms[2]}, NOW(), NOW())`);
    }
  }
  sql += 'INSERT INTO `who_lms` (`indikator`, `jenis_kelamin`, `umur_bulan_atau_tinggi`, `L`, `M`, `S`, `createdAt`, `updatedAt`) VALUES\n';
  sql += whoRows.join(',\n') + ';\n\n';

  // 6. Menu Makanan PMT
  sql += '-- -------------------------------------------------------------\n';
  sql += '-- Data: Menu Makanan PMT\n';
  sql += '-- -------------------------------------------------------------\n';
  sql += 'INSERT INTO `menu_makanan` (`id`, `nama_menu`, `jenis`, `kelompok_umur`, `bahan`, `energi_kkal`, `protein_g`, `lemak_g`, `karbohidrat_g`, `deskripsi`, `aktif`, `createdAt`, `updatedAt`) VALUES\n';
  sql += "(1, 'Bubur Singkong Sup Ikan Tenggiri', 'PMT', '6-11 bulan', 'Singkong putih, ikan tenggiri giling, santan cair, daun salam, wortel parut, minyak kelapa', 185.0, 7.2, 6.8, 22.4, 'PMT pemulihan berbasis pangan lokal kaya protein hewani dan omega-3.', 1, NOW(), NOW()),\n";
  sql += "(2, 'Nasi Tim Telur Puyuh & Hati Ayam', 'PMT', '12-23 bulan', 'Beras putih, hati ayam rebus cincang, telur puyuh, buncis halus, minyak kelapa, kaldu ayam', 260.0, 10.5, 8.5, 34.0, 'Sangat kaya zat besi (heme) dan vitamin A untuk pencegahan anemia.', 1, NOW(), NOW()),\n";
  sql += "(3, 'Sup Bola Ayam Sayuran Makaroni', 'PMT', '24-59 bulan', 'Daging ayam giling, tahu sutra, wortel, makaroni gandum, brokoli, kaldu sayur', 320.0, 14.2, 9.0, 45.0, 'Menu kaya mikronutrien, seng, dan protein hewani lengkap.', 1, NOW(), NOW()),\n";
  sql += "(4, 'Puree Pisang Raja & Alpukat Madu', 'MPASI', '6-11 bulan', 'Pisang raja matang, daging alpukat mentega, ASI / susu formula', 160.0, 2.8, 7.5, 21.0, 'Camilan padat energi untuk balita yang sulit makan.', 1, NOW(), NOW()),\n";
  sql += "(5, 'Puding Daun Kelor Susu Kedelai', 'PMT', '12-59 bulan', 'Ekstrak daun kelor, susu kedelai murni, agar-agar plain, gula aren sedikit', 140.0, 5.6, 3.2, 20.0, 'Pangan fungsional kaya kalsium dan antioksidan.', 1, NOW(), NOW()),\n";
  sql += "(6, 'Biskuit Balita Fortifikasi Vitamin & Mineral', 'PMT', '12-59 bulan', 'Tepung terigu, tepung kacang hijau, minyak nabati, premiks vitamin dan mineral', 220.0, 6.0, 8.0, 30.0, 'Biskuit standar Kementerian Kesehatan untuk cadangan energi tambahan.', 1, NOW(), NOW());\n\n";

  sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';
  sql += '-- =============================================================\n';
  sql += '-- AKHIR DARI SQL DUMP\n';
  sql += '-- =============================================================\n';

  const rootDir = path.resolve(__dirname, '../../..');
  const dbDir = path.join(rootDir, 'database');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  fs.writeFileSync(path.join(dbDir, 'gizita_db.sql'), sql, 'utf8');
  fs.writeFileSync(path.join(rootDir, 'gizita_db.sql'), sql, 'utf8');

  console.log('✅ Berhasil membuat gizita_db.sql di root dan database/ folder!');
  console.log(` Ukuran file: ${(sql.length / 1024).toFixed(2)} KB`);
}

generateSqlDump()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Gagal:', err);
    process.exit(1);
  });
