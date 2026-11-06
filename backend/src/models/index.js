const sequelize = require('../config/database');

const Puskesmas = require('./Puskesmas');
const WilayahPosyandu = require('./WilayahPosyandu');
const User = require('./User');
const OrangTua = require('./OrangTua');
const Balita = require('./Balita');
const Pengukuran = require('./Pengukuran');
const StatusGizi = require('./StatusGizi');
const WhoLms = require('./WhoLms');
const RencanaIntervensi = require('./RencanaIntervensi');
const JadwalPmt = require('./JadwalPmt');
const KonsumsiPmt = require('./KonsumsiPmt');
const MenuMakanan = require('./MenuMakanan');
const JadwalPosyandu = require('./JadwalPosyandu');
const KunjunganPosyandu = require('./KunjunganPosyandu');
const CatatanPemeriksaan = require('./CatatanPemeriksaan');
const RekomendasiDokter = require('./RekomendasiDokter');
const Notifikasi = require('./Notifikasi');
const LogAktivitas = require('./LogAktivitas');
const PengaturanSistem = require('./PengaturanSistem');

// Relasi Puskesmas & Wilayah Posyandu & User
Puskesmas.hasMany(WilayahPosyandu, { foreignKey: 'puskesmas_id', as: 'posyanduList' });
WilayahPosyandu.belongsTo(Puskesmas, { foreignKey: 'puskesmas_id', as: 'puskesmas' });

Puskesmas.hasMany(User, { foreignKey: 'puskesmas_id', as: 'users' });
User.belongsTo(Puskesmas, { foreignKey: 'puskesmas_id', as: 'puskesmas' });

// Relasi Wilayah Posyandu & Orang Tua & Balita
WilayahPosyandu.hasMany(OrangTua, { foreignKey: 'wilayah_posyandu_id', as: 'orangTuaList' });
OrangTua.belongsTo(WilayahPosyandu, { foreignKey: 'wilayah_posyandu_id', as: 'wilayahPosyandu' });

WilayahPosyandu.hasMany(Balita, { foreignKey: 'wilayah_posyandu_id', as: 'balitaList' });
Balita.belongsTo(WilayahPosyandu, { foreignKey: 'wilayah_posyandu_id', as: 'wilayahPosyandu' });

OrangTua.hasMany(Balita, { foreignKey: 'orang_tua_id', as: 'anak' });
Balita.belongsTo(OrangTua, { foreignKey: 'orang_tua_id', as: 'orangTua' });

// Relasi Balita & Pengukuran & Status Gizi
Balita.hasMany(Pengukuran, { foreignKey: 'balita_id', as: 'pengukuranList' });
Pengukuran.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });

Pengukuran.belongsTo(User, { foreignKey: 'petugas_id', as: 'petugas' });
Pengukuran.belongsTo(WilayahPosyandu, { foreignKey: 'posyandu_id', as: 'posyandu' });

Pengukuran.hasOne(StatusGizi, { foreignKey: 'pengukuran_id', as: 'statusGizi' });
StatusGizi.belongsTo(Pengukuran, { foreignKey: 'pengukuran_id', as: 'pengukuran' });

Balita.hasMany(StatusGizi, { foreignKey: 'balita_id', as: 'statusGiziList' });
StatusGizi.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });

// Relasi Rencana Intervensi & Jadwal PMT & Konsumsi PMT
Balita.hasMany(RencanaIntervensi, { foreignKey: 'balita_id', as: 'intervensiList' });
RencanaIntervensi.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
RencanaIntervensi.belongsTo(StatusGizi, { foreignKey: 'status_gizi_id', as: 'statusGizi' });
RencanaIntervensi.belongsTo(User, { foreignKey: 'dibuat_oleh', as: 'pembuat' });

RencanaIntervensi.hasMany(JadwalPmt, { foreignKey: 'rencana_intervensi_id', as: 'jadwalPmtList' });
JadwalPmt.belongsTo(RencanaIntervensi, { foreignKey: 'rencana_intervensi_id', as: 'rencanaIntervensi' });

Balita.hasMany(JadwalPmt, { foreignKey: 'balita_id', as: 'jadwalPmtList' });
JadwalPmt.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
JadwalPmt.belongsTo(MenuMakanan, { foreignKey: 'menu_id', as: 'menu' });

JadwalPmt.hasOne(KonsumsiPmt, { foreignKey: 'jadwal_pmt_id', as: 'konsumsi' });
KonsumsiPmt.belongsTo(JadwalPmt, { foreignKey: 'jadwal_pmt_id', as: 'jadwalPmt' });
KonsumsiPmt.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
KonsumsiPmt.belongsTo(User, { foreignKey: 'dicatat_oleh', as: 'pencatat' });

// Relasi Jadwal Posyandu & Kunjungan Posyandu
WilayahPosyandu.hasMany(JadwalPosyandu, { foreignKey: 'wilayah_posyandu_id', as: 'jadwalList' });
JadwalPosyandu.belongsTo(WilayahPosyandu, { foreignKey: 'wilayah_posyandu_id', as: 'wilayahPosyandu' });

JadwalPosyandu.hasMany(KunjunganPosyandu, { foreignKey: 'jadwal_posyandu_id', as: 'kunjunganList' });
KunjunganPosyandu.belongsTo(JadwalPosyandu, { foreignKey: 'jadwal_posyandu_id', as: 'jadwalPosyandu' });

Balita.hasMany(KunjunganPosyandu, { foreignKey: 'balita_id', as: 'kunjunganList' });
KunjunganPosyandu.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
KunjunganPosyandu.belongsTo(Pengukuran, { foreignKey: 'pengukuran_id', as: 'pengukuran' });

// Relasi Dokter (Pemeriksaan & Rekomendasi)
Balita.hasMany(CatatanPemeriksaan, { foreignKey: 'balita_id', as: 'pemeriksaanList' });
CatatanPemeriksaan.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
CatatanPemeriksaan.belongsTo(User, { foreignKey: 'dokter_id', as: 'dokter' });

Balita.hasMany(RekomendasiDokter, { foreignKey: 'balita_id', as: 'rekomendasiList' });
RekomendasiDokter.belongsTo(Balita, { foreignKey: 'balita_id', as: 'balita' });
RekomendasiDokter.belongsTo(User, { foreignKey: 'dokter_id', as: 'dokter' });
RekomendasiDokter.belongsTo(StatusGizi, { foreignKey: 'status_gizi_id', as: 'statusGizi' });

// Notifikasi & Log Aktivitas
User.hasMany(Notifikasi, { foreignKey: 'user_id', as: 'notifikasiList' });
Notifikasi.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(LogAktivitas, { foreignKey: 'user_id', as: 'logList' });
LogAktivitas.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
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
};

