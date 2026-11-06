const cron = require('node-cron');
const { Op } = require('sequelize');
const { JadwalPosyandu, WilayahPosyandu, JadwalPmt, Balita, PengaturanSistem } = require('../models');
const NotificationService = require('./notificationService');

class CronService {
  static async getReminderDays() {
    try {
      const setting = await PengaturanSistem.findOne({ where: { key: 'hari_pengingat_notifikasi' } });
      return setting && setting.value ? parseInt(setting.value, 10) : 1;
    } catch {
      return 1;
    }
  }

  /**
   * Pengecekan H-1 (atau sesuai pengaturan) untuk jadwal Posyandu dan PMT
   */
  static async runDailyReminderCheck() {
    try {
      const days = await this.getReminderDays();
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // 1. Cek Jadwal Posyandu
      const posyanduSchedules = await JadwalPosyandu.findAll({
        where: {
          tanggal: targetDateStr,
          status: 'terjadwal'
        },
        include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu' }]
      });

      for (const item of posyanduSchedules) {
        const posName = item.wilayahPosyandu ? item.wilayahPosyandu.nama_posyandu : 'Posyandu';
        const judul = `Pengingat Jadwal Posyandu (H-${days}): ${posName}`;
        const pesan = `Besok (${targetDateStr}) terdapat agenda Posyandu ${posName} pada jam ${item.jam_mulai || '08:30'} WIB bertempat di ${item.lokasi || '-'}. Kegiatan: ${item.kegiatan || 'Pemeriksaan rutin'}.`;

        await NotificationService.notifyRole({
          role: 'dokter',
          judul,
          pesan,
          tipe: 'jadwal',
          referensiId: `jadwal-${item.id}`
        });

        await NotificationService.notifyRole({
          role: 'petugas_gizi',
          judul,
          pesan,
          tipe: 'jadwal',
          referensiId: `jadwal-${item.id}`
        });
      }

      // 2. Cek Jadwal PMT
      const pmtSchedules = await JadwalPmt.findAll({
        where: {
          tanggal: targetDateStr,
          status: 'terjadwal'
        },
        include: [{ model: Balita, as: 'balita' }]
      });

      if (pmtSchedules.length > 0) {
        const judul = `Pengingat Distribusi PMT (H-${days})`;
        const pesan = `Terdapat ${pmtSchedules.length} balita yang dijadwalkan menerima Pemberian Makanan Tambahan (PMT) besok (${targetDateStr}).`;

        await NotificationService.notifyRole({
          role: 'petugas_gizi',
          judul,
          pesan,
          tipe: 'jadwal',
          referensiId: `pmt-${targetDateStr}`
        });
      }

      console.log(`[CRON] Pengingat harian (H-${days}) selesai dijalankan untuk tanggal ${targetDateStr}.`);
    } catch (err) {
      console.error('[CRON ERROR] Gagal menjalankan pengingat harian:', err.message);
    }
  }

  /**
   * Mengaktifkan scheduler (berjalan setiap hari pukul 06:00 WIB)
   */
  static startScheduler() {
    // Run every day at 06:00
    cron.schedule('0 6 * * *', () => {
      console.log('[CRON] Menjalankan pengecekan harian jadwal Posyandu & PMT...');
      this.runDailyReminderCheck();
    });

    console.log('⏰ Cron Service aktif: Notifikasi pengingat Posyandu/PMT dijadwalkan setiap 06:00 WIB.');
  }
}

module.exports = CronService;

