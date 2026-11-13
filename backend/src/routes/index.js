const express = require('express');
const router = express.Router();

const { verifyToken, requireRoles } = require('../middlewares/authMiddleware');

const AuthController = require('../controllers/authController');
const UserController = require('../controllers/userController');
const PuskesmasController = require('../controllers/puskesmasController');
const PosyanduController = require('../controllers/posyanduController');
const OrangTuaController = require('../controllers/orangTuaController');
const BalitaController = require('../controllers/balitaController');
const PengukuranController = require('../controllers/pengukuranController');
const GrowthController = require('../controllers/growthController');
const StatusGiziController = require('../controllers/statusGiziController');
const IntervensiController = require('../controllers/intervensiController');
const PmtController = require('../controllers/pmtController');
const MenuController = require('../controllers/menuController');
const JadwalPosyanduController = require('../controllers/jadwalPosyanduController');
const PemeriksaanController = require('../controllers/pemeriksaanController');
const RekomendasiController = require('../controllers/rekomendasiController');
const NotifikasiController = require('../controllers/notifikasiController');
const LogAktivitasController = require('../controllers/logAktivitasController');
const PengaturanController = require('../controllers/pengaturanController');
const LaporanController = require('../controllers/laporanController');
const DashboardController = require('../controllers/dashboardController');

// ==========================================
// 1. AUTH & PROFIL (Semua role)
// ==========================================
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/logout', verifyToken, AuthController.logout);
router.get('/auth/me', verifyToken, AuthController.getMe);
router.put('/auth/profile', verifyToken, AuthController.updateProfile);
router.put('/auth/change-password', verifyToken, AuthController.changePassword);

// ==========================================
// 2. DASHBOARD (Semua role)
// ==========================================
router.get('/dashboard/stats', verifyToken, DashboardController.getStats);

// ==========================================
// 3. PENGATURAN SISTEM (Publik read, Admin write)
// ==========================================
router.get('/pengaturan', PengaturanController.getSettings);
router.put('/pengaturan', verifyToken, requireRoles('admin'), PengaturanController.updateSettings);

// ==========================================
// 4. KELOLA PENGGUNA (Admin only)
// ==========================================
router.get('/users', verifyToken, requireRoles('admin'), UserController.listUsers);
router.post('/users', verifyToken, requireRoles('admin'), UserController.createUser);
router.put('/users/:id', verifyToken, requireRoles('admin'), UserController.updateUser);
router.put('/users/:id/reset-password', verifyToken, requireRoles('admin'), UserController.resetPassword);
router.delete('/users/:id', verifyToken, requireRoles('admin'), UserController.deleteUser);

// ==========================================
// 5. PUSKESMAS & POSYANDU
// ==========================================
router.get('/puskesmas', verifyToken, PuskesmasController.getPuskesmas);
router.put('/puskesmas', verifyToken, requireRoles('admin'), PuskesmasController.updatePuskesmas);

router.get('/posyandu', verifyToken, PosyanduController.listPosyandu);
router.post('/posyandu', verifyToken, requireRoles('admin'), PosyanduController.createPosyandu);
router.put('/posyandu/:id', verifyToken, requireRoles('admin'), PosyanduController.updatePosyandu);
router.delete('/posyandu/:id', verifyToken, requireRoles('admin'), PosyanduController.deletePosyandu);

// ==========================================
// 6. ORANG TUA / WALI
// ==========================================
router.get('/orang-tua', verifyToken, OrangTuaController.listOrangTua);
router.post('/orang-tua', verifyToken, requireRoles('admin', 'petugas_gizi'), OrangTuaController.createOrangTua);
router.put('/orang-tua/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), OrangTuaController.updateOrangTua);
router.delete('/orang-tua/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), OrangTuaController.deleteOrangTua);

// ==========================================
// 7. BALITA
// ==========================================
router.get('/balita', verifyToken, BalitaController.listBalita);
router.get('/balita/:id', verifyToken, BalitaController.getBalitaDetail);
router.post('/balita', verifyToken, requireRoles('admin', 'petugas_gizi'), BalitaController.createBalita);
router.put('/balita/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), BalitaController.updateBalita);
router.delete('/balita/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), BalitaController.deleteBalita);

// ==========================================
// 8. PENGUKURAN & STATUS GIZI
// ==========================================
router.post('/pengukuran/preview', verifyToken, PengukuranController.previewCalculation);
router.post('/pengukuran', verifyToken, requireRoles('admin', 'petugas_gizi'), PengukuranController.createPengukuran);
router.get('/pengukuran/balita/:balitaId', verifyToken, PengukuranController.listByBalita);
router.put('/pengukuran/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), PengukuranController.updatePengukuran);
router.delete('/pengukuran/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), PengukuranController.deletePengukuran);

router.get('/status-gizi', verifyToken, StatusGiziController.listStatusGizi);
router.get('/status-gizi/summary', verifyToken, StatusGiziController.getSummaryCategories);

// KMS Growth Chart
router.get('/growth/kms/:balitaId', verifyToken, GrowthController.getKmsChartData);

// ==========================================
// 9. RENCANA INTERVENSI GIZI
// ==========================================
router.get('/intervensi', verifyToken, IntervensiController.listIntervensi);
router.post('/intervensi', verifyToken, requireRoles('admin', 'petugas_gizi'), IntervensiController.createIntervensi);
router.put('/intervensi/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), IntervensiController.updateIntervensi);
router.delete('/intervensi/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), IntervensiController.deleteIntervensi);

// ==========================================
// 10. JADWAL & KONSUMSI PMT
// ==========================================
router.get('/pmt/jadwal', verifyToken, PmtController.listJadwal);
router.post('/pmt/jadwal', verifyToken, requireRoles('admin', 'petugas_gizi'), PmtController.createJadwal);
router.put('/pmt/jadwal/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), PmtController.updateJadwal);
router.delete('/pmt/jadwal/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), PmtController.deleteJadwal);
router.post('/pmt/konsumsi', verifyToken, requireRoles('admin', 'petugas_gizi'), PmtController.catatKonsumsi);
router.get('/pmt/compliance', verifyToken, PmtController.getComplianceSummary);

// ==========================================
// 11. MENU MAKANAN
// ==========================================
router.get('/menu', verifyToken, MenuController.listMenu);
router.post('/menu', verifyToken, requireRoles('admin', 'petugas_gizi'), MenuController.createMenu);
router.put('/menu/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), MenuController.updateMenu);
router.delete('/menu/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), MenuController.deleteMenu);

// ==========================================
// 12. JADWAL & KUNJUNGAN POSYANDU
// ==========================================
router.get('/jadwal-posyandu', verifyToken, JadwalPosyanduController.listJadwal);
router.get('/jadwal-posyandu/:id', verifyToken, JadwalPosyanduController.getDetailJadwal);
router.post('/jadwal-posyandu', verifyToken, requireRoles('admin', 'petugas_gizi'), JadwalPosyanduController.createJadwal);
router.put('/jadwal-posyandu/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), JadwalPosyanduController.updateJadwal);
router.delete('/jadwal-posyandu/:id', verifyToken, requireRoles('admin', 'petugas_gizi'), JadwalPosyanduController.deleteJadwal);
router.post('/jadwal-posyandu/:id/kunjungan', verifyToken, requireRoles('admin', 'petugas_gizi'), JadwalPosyanduController.catatKunjungan);

// ==========================================
// 13. DOKTER: PEMERIKSAAN & REKOMENDASI
// ==========================================
router.get('/pemeriksaan', verifyToken, PemeriksaanController.listPemeriksaan);
router.post('/pemeriksaan', verifyToken, requireRoles('dokter', 'admin'), PemeriksaanController.createPemeriksaan);
router.put('/pemeriksaan/:id', verifyToken, requireRoles('dokter', 'admin'), PemeriksaanController.updatePemeriksaan);
router.delete('/pemeriksaan/:id', verifyToken, requireRoles('dokter', 'admin'), PemeriksaanController.deletePemeriksaan);

router.get('/rekomendasi', verifyToken, RekomendasiController.listRekomendasi);
router.post('/rekomendasi', verifyToken, requireRoles('dokter', 'admin'), RekomendasiController.createRekomendasi);
router.delete('/rekomendasi/:id', verifyToken, requireRoles('dokter', 'admin'), RekomendasiController.deleteRekomendasi);

// ==========================================
// 14. NOTIFIKASI (Semua role)
// ==========================================
router.get('/notifikasi', verifyToken, NotifikasiController.getMyNotifications);
router.put('/notifikasi/:id/read', verifyToken, NotifikasiController.markAsRead);
router.put('/notifikasi/read-all', verifyToken, NotifikasiController.markAllAsRead);

// ==========================================
// 15. LOG AKTIVITAS (Admin only)
// ==========================================
router.get('/logs', verifyToken, requireRoles('admin'), LogAktivitasController.listLogs);

// ==========================================
// 16. LAPORAN & CETAK
// ==========================================
router.get('/laporan/preview', verifyToken, LaporanController.preview);
router.get('/laporan/export-excel', verifyToken, LaporanController.exportExcel);
router.get('/laporan/export-pdf', verifyToken, LaporanController.exportPdf);

module.exports = router;

