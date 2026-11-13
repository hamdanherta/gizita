const bcrypt = require('bcryptjs');
const whoStandards = require('who-growth-standards');
const {
  sequelize,
  Puskesmas,
  WilayahPosyandu,
  User,
  OrangTua,
  Balita,
  Pengukuran,
  StatusGizi,
  WhoLms,
  RencanaIntervensi,
  JadwalPmt,
  KonsumsiPmt,
  MenuMakanan,
  JadwalPosyandu,
  KunjunganPosyandu,
  CatatanPemeriksaan,
  RekomendasiDokter,
  Notifikasi,
  LogAktivitas,
  PengaturanSistem
} = require('../models');
const ZscoreService = require('../services/zscoreService');

async function seedDatabase() {
  console.log('🔄 Melakukan sinkronisasi skema database...');
  await sequelize.sync({ force: true });
  console.log('✅ Skema 19 tabel berhasil dibuat di database!\n');

  // 1. Pengaturan Sistem
  console.log('🌱 Menyiapkan pengaturan sistem...');
  await PengaturanSistem.bulkCreate([
    { key: 'nama_aplikasi', value: 'Gizita' },
    { key: 'logo_url', value: '/logo.png' },
    { key: 'nama_puskesmas', value: 'Puskesmas Kebun Kopi' },
    { key: 'alamat_puskesmas', value: 'Jl. Kebun Kopi No. 45, Kota Jambi' },
    { key: 'kontak_puskesmas', value: '0741-654321 / 0812-7890-1234' },
    { key: 'hari_pengingat_notifikasi', value: '1' }
  ]);

  // 2. Puskesmas
  console.log('🌱 Menyiapkan data Puskesmas...');
  const puskesmas = await Puskesmas.create({
    nama: 'Puskesmas Kebun Kopi',
    alamat: 'Jl. Kebun Kopi No. 45, Kel. Thehok, Kec. Jambi Selatan, Kota Jambi',
    telepon: '0741-654321',
    email: 'kebunkopi.pusk@gmail.com',
    kepala: 'dr. Hj. Siti Rahma, M.Kes'
  });

  // 3. Wilayah Posyandu
  console.log('🌱 Menyiapkan 4 Wilayah Posyandu...');
  const posyanduList = await WilayahPosyandu.bulkCreate([
    {
      puskesmas_id: puskesmas.id,
      nama_posyandu: 'Posyandu Mawar',
      kelurahan_desa: 'Thehok',
      alamat: 'RT 04 Kelurahan Thehok',
      nama_kader: 'Ibu Sri Wahyuni',
      telepon_kader: '081234567801'
    },
    {
      puskesmas_id: puskesmas.id,
      nama_posyandu: 'Posyandu Melati',
      kelurahan_desa: 'Handil Jaya',
      alamat: 'RT 12 Kelurahan Handil Jaya',
      nama_kader: 'Ibu Nurhayati',
      telepon_kader: '081234567802'
    },
    {
      puskesmas_id: puskesmas.id,
      nama_posyandu: 'Posyandu Anggrek',
      kelurahan_desa: 'Paal Merah',
      alamat: 'RT 08 Kelurahan Paal Merah',
      nama_kader: 'Ibu Ratna Dewi',
      telepon_kader: '081234567803'
    },
    {
      puskesmas_id: puskesmas.id,
      nama_posyandu: 'Posyandu Kamboja',
      kelurahan_desa: 'Kebun Kopi',
      alamat: 'RT 15 Kelurahan Kebun Kopi',
      nama_kader: 'Ibu Mariana',
      telepon_kader: '081234567804'
    }
  ]);

  // 4. Users (Demo Accounts)
  console.log('🌱 Menyiapkan akun demo (admin, petugas, dokter)...');
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin123', salt);
  const petugasPass = await bcrypt.hash('petugas123', salt);
  const dokterPass = await bcrypt.hash('dokter123', salt);

  const adminUser = await User.create({
    nama: 'Administrator Gizita',
    username: 'admin',
    email: 'admin@gizita.id',
    password_hash: adminPass,
    role: 'admin',
    puskesmas_id: puskesmas.id,
    no_hp: '081111111111',
    status_aktif: true
  });

  const petugasUser = await User.create({
    nama: 'Sara Maulidia, S.Gz',
    username: 'petugas',
    email: 'petugas@gizita.id',
    password_hash: petugasPass,
    role: 'petugas_gizi',
    puskesmas_id: puskesmas.id,
    no_hp: '082222222222',
    status_aktif: true
  });

  const dokterUser = await User.create({
    nama: 'dr. Budi Santoso, Sp.A',
    username: 'dokter',
    email: 'dokter@gizita.id',
    password_hash: dokterPass,
    role: 'dokter',
    puskesmas_id: puskesmas.id,
    no_hp: '083333333333',
    status_aktif: true
  });

  // 5. Seed WHO LMS Reference Data
  console.log('🌱 Mengisi tabel referensi WHO LMS (BB/U, TB/U, BB/PB, BB/TB)...');
  const whoLmsRows = [];

  // BBU (0-60 bulan)
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('wfa', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let month = 0; month <= 60; month++) {
      const day = Math.min(Math.round(month * 30.4375), table.lms.length - 1);
      const lms = table.lms[day];
      if (lms) {
        whoLmsRows.push({
          indikator: 'BBU',
          jenis_kelamin: genderKey,
          umur_bulan_atau_tinggi: month,
          L: lms[0],
          M: lms[1],
          S: lms[2]
        });
      }
    }
  }

  // TBU (0-60 bulan)
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('lhfa', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let month = 0; month <= 60; month++) {
      const day = Math.min(Math.round(month * 30.4375), table.lms.length - 1);
      const lms = table.lms[day];
      if (lms) {
        whoLmsRows.push({
          indikator: 'TBU',
          jenis_kelamin: genderKey,
          umur_bulan_atau_tinggi: month,
          L: lms[0],
          M: lms[1],
          S: lms[2]
        });
      }
    }
  }

  // BBPB (45 - 110 cm)
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('wfl', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let cm = 45.0; cm <= 110.0; cm += 0.5) {
      const idx = Math.min(Math.round((cm - table.start) / table.step), table.lms.length - 1);
      const lms = table.lms[idx];
      if (lms) {
        whoLmsRows.push({
          indikator: 'BBPB',
          jenis_kelamin: genderKey,
          umur_bulan_atau_tinggi: cm,
          L: lms[0],
          M: lms[1],
          S: lms[2]
        });
      }
    }
  }

  // BBTB (65 - 120 cm)
  for (const sex of ['male', 'female']) {
    const table = whoStandards.getTable('wfh', sex);
    const genderKey = sex === 'male' ? 'L' : 'P';
    for (let cm = 65.0; cm <= 120.0; cm += 0.5) {
      const idx = Math.min(Math.round((cm - table.start) / table.step), table.lms.length - 1);
      const lms = table.lms[idx];
      if (lms) {
        whoLmsRows.push({
          indikator: 'BBTB',
          jenis_kelamin: genderKey,
          umur_bulan_atau_tinggi: cm,
          L: lms[0],
          M: lms[1],
          S: lms[2]
        });
      }
    }
  }

  await WhoLms.bulkCreate(whoLmsRows);
  console.log(`✅ Berhasil menyimpan ${whoLmsRows.length} baris data referensi WHO LMS.`);

  // 6. Menu Makanan PMT
  console.log('🌱 Menyiapkan menu makanan PMT...');
  const menuList = await MenuMakanan.bulkCreate([
    {
      nama_menu: 'Bubur Singkong Sup Ikan Tenggiri',
      jenis: 'PMT',
      kelompok_umur: '6-11 bulan',
      bahan: 'Singkong putih, ikan tenggiri giling, santan cair, daun salam, wortel parut, minyak kelapa',
      energi_kkal: 185.0,
      protein_g: 7.2,
      lemak_g: 6.8,
      karbohidrat_g: 22.4,
      deskripsi: 'PMT pemulihan berbasis pangan lokal kaya protein hewani dan asam lemak omega-3 untuk tumbuh kembang otak balita.',
      aktif: true
    },
    {
      nama_menu: 'Nasi Tim Telur Puyuh & Hati Ayam',
      jenis: 'PMT',
      kelompok_umur: '12-23 bulan',
      bahan: 'Beras putih, hati ayam rebus cincang, telur puyuh, buncis halus, minyak kelapa, kaldu ayam',
      energi_kkal: 260.0,
      protein_g: 10.5,
      lemak_g: 8.5,
      karbohidrat_g: 34.0,
      deskripsi: 'Sangat kaya zat besi (heme) dan vitamin A untuk pencegahan anemia dan percepatan kenaikan berat badan balita wasting/underweight.',
      aktif: true
    },
    {
      nama_menu: 'Sup Bola Ayam Sayuran Makaroni',
      jenis: 'PMT',
      kelompok_umur: '24-59 bulan',
      bahan: 'Daging ayam giling, tahu sutra, wortel, makaroni gandum, brokoli, kaldu sayur',
      energi_kkal: 320.0,
      protein_g: 14.2,
      lemak_g: 9.0,
      karbohidrat_g: 45.0,
      deskripsi: 'Menu kaya mikronutrien, seng, dan protein hewani lengkap untuk balita stunting guna mengejar pertambahan tinggi badan.',
      aktif: true
    },
    {
      nama_menu: 'Puree Pisang Raja & Alpukat Madu',
      jenis: 'MPASI',
      kelompok_umur: '6-11 bulan',
      bahan: 'Pisang raja matang, daging alpukat mentega, ASI / susu formula',
      energi_kkal: 160.0,
      protein_g: 2.8,
      lemak_g: 7.5,
      karbohidrat_g: 21.0,
      deskripsi: 'Camilan padat energi untuk balita yang sulit makan atau berat badan seret.',
      aktif: true
    },
    {
      nama_menu: 'Puding Daun Kelor Susu Kedelai',
      jenis: 'PMT',
      kelompok_umur: '12-59 bulan',
      bahan: 'Ekstrak daun kelor, susu kedelai murni, agar-agar plain, gula aren sedikit',
      energi_kkal: 140.0,
      protein_g: 5.6,
      lemak_g: 3.2,
      karbohidrat_g: 20.0,
      deskripsi: 'Pangan fungsional kaya kalsium dan antioksidan untuk penguatan tulang dan gigi.',
      aktif: true
    },
    {
      nama_menu: 'Biskuit Balita Fortifikasi Vitamin & Mineral',
      jenis: 'PMT',
      kelompok_umur: '12-59 bulan',
      bahan: 'Tepung terigu, tepung kacang hijau, minyak nabati, premiks vitamin dan mineral',
      energi_kkal: 220.0,
      protein_g: 6.0,
      lemak_g: 8.0,
      karbohidrat_g: 30.0,
      deskripsi: 'Biskuit standar Kementerian Kesehatan untuk cadangan energi tambahan harian.',
      aktif: true
    }
  ]);

  // 7. Data Balita & Orang Tua (Dikosongkan secara default untuk bimbingan/bersih)
  const withDummy = process.argv.includes('--with-dummy');
  if (!withDummy) {
    console.log('\n✨ Database siap! Akun resmi (admin, petugas, dokter), Posyandu, dan standar WHO LMS telah aktif.');
    console.log('💡 Data balita dan riwayat pengukuran dibiarkan kosong (0 data) agar siap untuk demonstrasi bimbingan.');
    console.log('\n====================================================');
    console.log('🎉 SEED DATABASE BERHASIL (AKUN RESMI & MASTER DATA AKTIF)!');
    console.log('====================================================\n');
    return;
  }

  console.log('🌱 Menyiapkan 20 balita, orang tua, dan riwayat pengukuran multi-bulan...');

  const sampleParents = [
    { ayah: 'Ahmad Fauzi', ibu: 'Siti Rohimah', nik: '1571010101850001', hp: '085211110001', alamat: 'RT 04 Thehok' },
    { ayah: 'Bambang Irawan', ibu: 'Dewi Lestari', nik: '1571010202860002', hp: '085211110002', alamat: 'RT 05 Thehok' },
    { ayah: 'Chairul Anwar', ibu: 'Rina Mayasari', nik: '1571010303870003', hp: '085211110003', alamat: 'RT 12 Handil Jaya' },
    { ayah: 'Dedi Kurniawan', ibu: 'Fitri Handayani', nik: '1571010404880004', hp: '085211110004', alamat: 'RT 13 Handil Jaya' },
    { ayah: 'Eko Prasetyo', ibu: 'Tri Wahyuni', nik: '1571010505890005', hp: '085211110005', alamat: 'RT 08 Paal Merah' },
    { ayah: 'Ferry Hermawan', ibu: 'Nurul Hidayah', nik: '1571010606900006', hp: '085211110006', alamat: 'RT 09 Paal Merah' },
    { ayah: 'Gunawan Susanto', ibu: 'Mega Puspita', nik: '1571010707910007', hp: '085211110007', alamat: 'RT 15 Kebun Kopi' },
    { ayah: 'Hendra Saputra', ibu: 'Yuli Astuti', nik: '1571010808920008', hp: '085211110008', alamat: 'RT 16 Kebun Kopi' },
    { ayah: 'Indra Jaya', ibu: 'Wulandari', nik: '1571010909930009', hp: '085211110009', alamat: 'RT 04 Thehok' },
    { ayah: 'Joko Widodo', ibu: 'Anisa Rahmawati', nik: '1571011010940010', hp: '085211110010', alamat: 'RT 12 Handil Jaya' },
    { ayah: 'Kurniawan Dwi', ibu: 'Dina Marlina', nik: '1571011111950011', hp: '085211110011', alamat: 'RT 08 Paal Merah' },
    { ayah: 'Lukman Hakim', ibu: 'Sari Indah', nik: '1571011212960012', hp: '085211110012', alamat: 'RT 15 Kebun Kopi' },
    { ayah: 'Muhammad Ridwan', ibu: 'Lilis Suryani', nik: '1571011313970013', hp: '085211110013', alamat: 'RT 05 Thehok' },
    { ayah: 'Nugroho Adi', ibu: 'Tari Septiana', nik: '1571011414980014', hp: '085211110014', alamat: 'RT 13 Handil Jaya' },
    { ayah: 'Oki Setiawan', ibu: 'Putri Ayu', nik: '1571011515990015', hp: '085211110015', alamat: 'RT 09 Paal Merah' },
    { ayah: 'Panji Gumilang', ibu: 'Endang Purwanti', nik: '1571011616000016', hp: '085211110016', alamat: 'RT 16 Kebun Kopi' },
    { ayah: 'Rian Hidayat', ibu: 'Kiki Fatmala', nik: '1571011717010017', hp: '085211110017', alamat: 'RT 04 Thehok' },
    { ayah: 'Surya Kencana', ibu: 'Melisa Anggraini', nik: '1571011818020018', hp: '085211110018', alamat: 'RT 12 Handil Jaya' },
    { ayah: 'Teguh Prakoso', ibu: 'Desi Ratnasari', nik: '1571011919030019', hp: '085211110019', alamat: 'RT 08 Paal Merah' },
    { ayah: 'Untung Suropati', ibu: 'Maya Rosita', nik: '1571012020040020', hp: '085211110020', alamat: 'RT 15 Kebun Kopi' }
  ];

  const sampleChildrenData = [
    // 1-5 di Posyandu Mawar
    { nama: 'Kenzo Alfarizqi', jk: 'L', tglLahir: '2024-02-10', bbLahir: 3.2, tbLahir: 49.5, anakKe: 1, posId: posyanduList[0].id, tipe: 'normal' },
    { nama: 'Alula Farzana', jk: 'P', tglLahir: '2023-08-15', bbLahir: 2.8, tbLahir: 48.0, anakKe: 2, posId: posyanduList[0].id, tipe: 'stunting' },
    { nama: 'Raffa Danendra', jk: 'L', tglLahir: '2024-05-20', bbLahir: 3.1, tbLahir: 49.0, anakKe: 1, posId: posyanduList[0].id, tipe: 'wasting' },
    { nama: 'Shaqueena Humaira', jk: 'P', tglLahir: '2023-02-12', bbLahir: 3.3, tbLahir: 50.0, anakKe: 1, posId: posyanduList[0].id, tipe: 'obesitas' },
    { nama: 'Arka Zayyan', jk: 'L', tglLahir: '2023-11-05', bbLahir: 3.0, tbLahir: 48.5, anakKe: 2, posId: posyanduList[0].id, tipe: 'normal' },

    // 6-10 di Posyandu Melati
    { nama: 'Zahra Bilqis', jk: 'P', tglLahir: '2024-01-18', bbLahir: 2.9, tbLahir: 48.0, anakKe: 1, posId: posyanduList[1].id, tipe: 'normal' },
    { nama: 'Muhammad Rayyan', jk: 'L', tglLahir: '2022-10-08', bbLahir: 2.6, tbLahir: 46.5, anakKe: 3, posId: posyanduList[1].id, tipe: 'stunting_berat' },
    { nama: 'Naura Ayudia', jk: 'P', tglLahir: '2023-09-25', bbLahir: 2.7, tbLahir: 47.0, anakKe: 1, posId: posyanduList[1].id, tipe: 'gizi_buruk' },
    { nama: 'Fattan Alvaro', jk: 'L', tglLahir: '2024-03-30', bbLahir: 3.4, tbLahir: 50.5, anakKe: 2, posId: posyanduList[1].id, tipe: 'normal' },
    { nama: 'Adiba Shakila', jk: 'P', tglLahir: '2023-04-14', bbLahir: 3.0, tbLahir: 49.0, anakKe: 1, posId: posyanduList[1].id, tipe: 'normal' },

    // 11-15 di Posyandu Anggrek
    { nama: 'Daffa Ibnu Hafiz', jk: 'L', tglLahir: '2023-07-07', bbLahir: 3.1, tbLahir: 49.0, anakKe: 1, posId: posyanduList[2].id, tipe: 'kurang' },
    { nama: 'Aqeela Kanza', jk: 'P', tglLahir: '2024-04-02', bbLahir: 3.2, tbLahir: 49.5, anakKe: 1, posId: posyanduList[2].id, tipe: 'normal' },
    { nama: 'Gibran Rakha', jk: 'L', tglLahir: '2022-12-19', bbLahir: 2.9, tbLahir: 48.0, anakKe: 2, posId: posyanduList[2].id, tipe: 'stunting' },
    { nama: 'Syifa Nadira', jk: 'P', tglLahir: '2023-06-11', bbLahir: 3.5, tbLahir: 51.0, anakKe: 1, posId: posyanduList[2].id, tipe: 'gizi_lebih' },
    { nama: 'Malik Al-Ghifari', jk: 'L', tglLahir: '2024-06-01', bbLahir: 3.3, tbLahir: 50.0, anakKe: 1, posId: posyanduList[2].id, tipe: 'normal' },

    // 16-20 di Posyandu Kamboja
    { nama: 'Inara Syakira', jk: 'P', tglLahir: '2023-03-03', bbLahir: 2.8, tbLahir: 47.5, anakKe: 2, posId: posyanduList[3].id, tipe: 'normal' },
    { nama: 'Azka Aldric', jk: 'L', tglLahir: '2023-12-22', bbLahir: 2.5, tbLahir: 46.0, anakKe: 1, posId: posyanduList[3].id, tipe: 'wasting' },
    { nama: 'Zivanna Letisha', jk: 'P', tglLahir: '2024-02-28', bbLahir: 3.1, tbLahir: 49.0, anakKe: 1, posId: posyanduList[3].id, tipe: 'normal' },
    { nama: 'Fathan Athariz', jk: 'L', tglLahir: '2022-08-14', bbLahir: 3.2, tbLahir: 49.0, anakKe: 1, posId: posyanduList[3].id, tipe: 'normal' },
    { nama: 'Kiandra Alesha', jk: 'P', tglLahir: '2023-05-19', bbLahir: 2.7, tbLahir: 47.0, anakKe: 2, posId: posyanduList[3].id, tipe: 'stunting' }
  ];

  const createdBalitas = [];
  const problematicBalitas = [];

  for (let i = 0; i < sampleChildrenData.length; i++) {
    const pData = sampleParents[i];
    const cData = sampleChildrenData[i];

    const ortu = await OrangTua.create({
      nama_ayah: pData.ayah,
      nama_ibu: pData.ibu,
      nik: pData.nik,
      no_hp: pData.hp,
      alamat: pData.alamat,
      pekerjaan: 'Wiraswasta / Ibu Rumah Tangga',
      wilayah_posyandu_id: cData.posId
    });

    const balita = await Balita.create({
      orang_tua_id: ortu.id,
      wilayah_posyandu_id: cData.posId,
      nik: `157101${cData.tglLahir.replace(/-/g, '').slice(2)}000${i + 1}`,
      nama: cData.nama,
      jenis_kelamin: cData.jk,
      tanggal_lahir: cData.tglLahir,
      berat_lahir: cData.bbLahir,
      panjang_lahir: cData.tbLahir,
      anak_ke: cData.anakKe,
      status_aktif: true
    });

    createdBalitas.push(balita);

    // Buat riwayat pengukuran multi-bulan (misal 3-4 kali ukur ke belakang)
    const birth = new Date(cData.tglLahir);
    const monthsDiff = Math.min(
      Math.max(Math.floor((new Date('2025-02-01') - birth) / (1000 * 60 * 60 * 24 * 30.4375)), 2),
      36
    );

    // Titik-titik tanggal ukur
    const measureDates = [];
    for (let m = Math.max(1, monthsDiff - 3); m <= monthsDiff; m++) {
      const d = new Date(birth);
      d.setMonth(d.getMonth() + m);
      measureDates.push({ month: m, date: d.toISOString().split('T')[0] });
    }

    let lastStatusGizi = null;

    for (let idx = 0; idx < measureDates.length; idx++) {
      const item = measureDates[idx];
      const mAge = item.month;
      const isLatest = idx === measureDates.length - 1;

      // Variasikan BB & TB sesuai profil tipe balita
      let bb, tb;
      if (cData.tipe === 'normal') {
        bb = (cData.jk === 'L' ? 3.3 + mAge * 0.55 : 3.2 + mAge * 0.52);
        tb = (cData.jk === 'L' ? 50 + mAge * 1.5 : 49 + mAge * 1.45);
      } else if (cData.tipe === 'stunting' || cData.tipe === 'stunting_berat') {
        bb = (3.0 + mAge * 0.40);
        tb = (48 + mAge * 0.95); // Pertambahan tinggi sangat lambat
      } else if (cData.tipe === 'wasting' || cData.tipe === 'gizi_buruk') {
        bb = (2.8 + mAge * 0.28); // Berat badan drop jauh
        tb = (49 + mAge * 1.4);   // Tinggi normal tapi kurus
      } else if (cData.tipe === 'obesitas' || cData.tipe === 'gizi_lebih') {
        bb = (3.5 + mAge * 0.85); // Berat badan naik drastis
        tb = (50 + mAge * 1.5);
      } else {
        bb = (3.1 + mAge * 0.42);
        tb = (49 + mAge * 1.3);
      }

      bb = Math.round(bb * 10) / 10;
      tb = Math.round(tb * 10) / 10;
      const caraUkur = mAge < 24 ? 'terlentang' : 'berdiri';

      const analysis = ZscoreService.analyzeMeasurement({
        tanggalLahir: cData.tglLahir,
        tanggalUkur: item.date,
        jenisKelamin: cData.jk,
        beratBadan: bb,
        tinggiBadan: tb,
        caraUkur
      });

      const ukur = await Pengukuran.create({
        balita_id: balita.id,
        tanggal_ukur: item.date,
        umur_bulan: analysis.umurBulan,
        berat_badan: bb,
        tinggi_badan: tb,
        cara_ukur: caraUkur,
        lingkar_kepala: Math.round((35 + mAge * 0.35) * 10) / 10,
        lila: Math.round((11 + mAge * 0.15) * 10) / 10,
        petugas_id: petugasUser.id,
        posyandu_id: cData.posId,
        catatan: `Pengukuran rutin Posyandu bulan ke-${mAge}.`
      });

      lastStatusGizi = await StatusGizi.create({
        pengukuran_id: ukur.id,
        balita_id: balita.id,
        zscore_bbu: analysis.zscoreBBU,
        zscore_tbu: analysis.zscoreTBU,
        zscore_bbtb: analysis.zscoreBBTB,
        kategori_bbu: analysis.kategoriBBU,
        kategori_tbu: analysis.kategoriTBU,
        kategori_bbtb: analysis.kategoriBBTB,
        status_final: analysis.statusFinal
      });

      if (isLatest && analysis.perluPerhatian) {
        problematicBalitas.push({ balita, statusGizi: lastStatusGizi, analysis });
      }
    }
  }

  console.log(`✅ Terbuat 20 balita, ${problematicBalitas.length} balita berstatus perlu perhatian (stunting/wasting/obesitas/kurang).`);

  // 8. Buat Rencana Intervensi, Jadwal PMT, dan Catat Konsumsi untuk Balita Bermasalah
  console.log('🌱 Menyiapkan rencana intervensi gizi & jadwal PMT...');
  for (let i = 0; i < Math.min(problematicBalitas.length, 5); i++) {
    const item = problematicBalitas[i];
    const intervensi = await RencanaIntervensi.create({
      balita_id: item.balita.id,
      status_gizi_id: item.statusGizi.id,
      jenis_intervensi: 'PMT',
      tujuan: 'Meningkatkan asupan energi dan protein balita untuk menaikkan berat/tinggi badan.',
      target: 'Kenaikan BB minimal 500 gram/bulan dan perbaikan skor Z antropometri.',
      tanggal_mulai: '2025-02-01',
      tanggal_selesai: '2025-05-01',
      status: 'berjalan',
      dibuat_oleh: petugasUser.id,
      catatan: 'Program PMT Pemulihan Pangan Lokal 90 hari sesuai standar Kemenkes.'
    });

    // Buat jadwal PMT beberapa hari
    for (let day = 1; day <= 5; day++) {
      const tgl = `2025-02-0${day}`;
      const menu = menuList[day % menuList.length];
      const jpmt = await JadwalPmt.create({
        rencana_intervensi_id: intervensi.id,
        balita_id: item.balita.id,
        tanggal: tgl,
        menu_id: menu.id,
        jumlah_porsi: 1,
        status: day <= 3 ? 'diberikan' : 'terjadwal'
      });

      if (day <= 3) {
        await KonsumsiPmt.create({
          jadwal_pmt_id: jpmt.id,
          balita_id: item.balita.id,
          tanggal: tgl,
          porsi_dihabiskan: day === 1 ? 'habis' : 'sebagian',
          catatan: day === 1 ? 'Balita sangat menyukai menunya.' : 'Dihabiskan separuh, nafsu makan agak menurun.',
          dicatat_oleh: petugasUser.id
        });
      }
    }

    // Buat Rekomendasi Dokter & Catatan Pemeriksaan
    await RekomendasiDokter.create({
      balita_id: item.balita.id,
      status_gizi_id: item.statusGizi.id,
      dokter_id: dokterUser.id,
      isi_rekomendasi: `Ditemukan indikasi ${item.analysis.statusFinal}. Berikan PMT tinggi protein hewani (telur/ikan), suplementasi zat besi & vitamin A, serta evaluasi riwayat ISPA/diare secara berkala.`,
      tanggal: '2025-02-02'
    });

    await CatatanPemeriksaan.create({
      balita_id: item.balita.id,
      dokter_id: dokterUser.id,
      tanggal: '2025-02-02',
      keluhan: 'Nafsu makan menurun dalam 2 minggu terakhir, berat badan sulit naik.',
      diagnosa: `${item.analysis.statusFinal} e.c asupan nutrisi suboptimal`,
      tindakan: 'Edukasi gizi seimbang orang tua, resep suplemen multivitamin dan zinc, monitoring ketat di Posyandu.',
      catatan: 'Kondisi klinis sadar aktif, tidak ada tanda kegawatdaruratan dehidrasi atau edema.'
    });
  }

  // 9. Buat Jadwal Posyandu Mendatang
  console.log('🌱 Menyiapkan jadwal posyandu mendatang...');
  await JadwalPosyandu.bulkCreate([
    {
      wilayah_posyandu_id: posyanduList[0].id,
      tanggal: '2025-03-10',
      jam_mulai: '08:30:00',
      jam_selesai: '11:30:00',
      lokasi: 'Balai RW 04 Kel. Thehok',
      kegiatan: 'Penimbangan BB, Pengukuran TB, Pembagian PMT Pemulihan, Imunisasi Rutin',
      keterangan: 'Harap orang tua membawa Buku KIA/KMS.',
      status: 'terjadwal'
    },
    {
      wilayah_posyandu_id: posyanduList[1].id,
      tanggal: '2025-03-12',
      jam_mulai: '08:30:00',
      jam_selesai: '11:30:00',
      lokasi: 'Pos Posyandu Melati Handil Jaya',
      kegiatan: 'Pemantauan Antropometri, Konseling Gizi Ibu Hamil & Balita',
      keterangan: 'Dihadiri Tim Petugas Gizi Puskesmas Kebun Kopi.',
      status: 'terjadwal'
    },
    {
      wilayah_posyandu_id: posyanduList[2].id,
      tanggal: '2025-03-15',
      jam_mulai: '09:00:00',
      jam_selesai: '12:00:00',
      lokasi: 'Rumah Kader Ibu Ratna RT 08 Paal Merah',
      kegiatan: 'Pemeriksaan Kesehatan Anak oleh Dokter Puskesmas & Distribusi Vitamin A',
      keterangan: 'Pemeriksaan khusus bagi balita dengan grafik garis kuning/merah KMS.',
      status: 'terjadwal'
    },
    {
      wilayah_posyandu_id: posyanduList[3].id,
      tanggal: '2025-03-18',
      jam_mulai: '08:30:00',
      jam_selesai: '11:30:00',
      lokasi: 'Gedung Serbaguna RT 15 Kebun Kopi',
      kegiatan: 'Penimbangan dan Edukasi MPASI Pangan Lokal',
      keterangan: 'Demo memasak bubur padat gizi untuk orang tua balita.',
      status: 'terjadwal'
    }
  ]);

  // 10. Notifikasi Otomatis
  console.log('🌱 Menyiapkan notifikasi demo...');
  await Notifikasi.bulkCreate([
    {
      user_id: dokterUser.id,
      judul: 'Peringatan Status Gizi Balita',
      pesan: 'Balita Naura Ayudia terdeteksi berstatus Gizi Buruk pada penimbangan terakhir di Posyandu Melati. Mohon tindak lanjut rekomendasi dokter.',
      tipe: 'danger',
      referensi_id: 'balita-8',
      sudah_dibaca: false
    },
    {
      user_id: dokterUser.id,
      judul: 'Peringatan Stunting Balita',
      pesan: 'Balita Muhammad Rayyan terdeteksi berstatus Sangat Pendek (Stunting Berat). Mohon pemeriksaan lanjutan.',
      tipe: 'warning',
      referensi_id: 'balita-7',
      sudah_dibaca: false
    },
    {
      user_id: petugasUser.id,
      judul: 'Rekomendasi Dokter Diterima',
      pesan: 'dr. Budi Santoso, Sp.A telah memberikan rekomendasi medis gizi untuk balita Alula Farzana.',
      tipe: 'info',
      referensi_id: 'rekomendasi-1',
      sudah_dibaca: false
    },
    {
      user_id: petugasUser.id,
      judul: 'Pengingat Jadwal Posyandu H-1',
      pesan: 'Besok terdapat Jadwal Posyandu Mawar di Balai RW 04 Kel. Thehok pukul 08:30 WIB.',
      tipe: 'jadwal',
      referensi_id: 'jadwal-1',
      sudah_dibaca: true
    }
  ]);

  // 11. Log Aktivitas
  console.log('🌱 Menyiapkan data awal log aktivitas...');
  await LogAktivitas.bulkCreate([
    {
      user_id: adminUser.id,
      aksi: 'LOGIN',
      modul: 'AUTH',
      detail: 'Admin berhasil masuk ke dalam sistem',
      ip_address: '127.0.0.1'
    },
    {
      user_id: petugasUser.id,
      aksi: 'INPUT_PENGUKURAN',
      modul: 'PENGUKURAN',
      detail: 'Petugas gizi menginput pengukuran balita Kenzo Alfarizqi',
      ip_address: '127.0.0.1'
    },
    {
      user_id: dokterUser.id,
      aksi: 'TAMBAH_REKOMENDASI',
      modul: 'REKOMENDASI',
      detail: 'Dokter menambahkan rekomendasi medis untuk balita Naura Ayudia',
      ip_address: '127.0.0.1'
    }
  ]);

  console.log('\n====================================================');
  console.log('🎉 SEED DATABASE BERHASIL LENGKAP & SEMPURNA!');
  console.log('====================================================\n');
}

seedDatabase()
  .then(() => {
    console.log('✅ Proses seeder selesai.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Gagal menjalankan seeder:', err);
    process.exit(1);
  });

