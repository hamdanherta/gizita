const { Notifikasi, User } = require('../models');

class NotificationService {
  /**
   * Kirim notifikasi ke user tertentu
   */
  static async notifyUser({ userId, judul, pesan, tipe = 'info', referensiId = null }) {
    try {
      return await Notifikasi.create({
        user_id: userId,
        judul,
        pesan,
        tipe,
        referensi_id: referensiId ? String(referensiId) : null,
        sudah_dibaca: false
      });
    } catch (err) {
      console.error('Gagal mengirim notifikasi:', err.message);
    }
  }

  /**
   * Kirim notifikasi ke semua pengguna dengan role tertentu
   */
  static async notifyRole({ role, judul, pesan, tipe = 'info', referensiId = null }) {
    try {
      const users = await User.findAll({ where: { role, status_aktif: true } });
      const notifications = users.map(user => ({
        user_id: user.id,
        judul,
        pesan,
        tipe,
        referensi_id: referensiId ? String(referensiId) : null,
        sudah_dibaca: false
      }));

      if (notifications.length > 0) {
        await Notifikasi.bulkCreate(notifications);
      }
    } catch (err) {
      console.error(`Gagal mengirim notifikasi ke role ${role}:`, err.message);
    }
  }

  /**
   * Kirim notifikasi peringatan status gizi ke semua dokter
   */
  static async notifyNutritionAlert({ balita, statusFinal, pengukuranId }) {
    const judul = `Peringatan Status Gizi Balita: ${balita.nama}`;
    const pesan = `Balita ${balita.nama} (NIK: ${balita.nik || '-'}) terdeteksi berstatus "${statusFinal}". Mohon ditinjau dan diberikan arahan/rekomendasi medis.`;
    await this.notifyRole({
      role: 'dokter',
      judul,
      pesan,
      tipe: 'danger',
      referensiId: `balita-${balita.id}`
    });
  }

  /**
   * Kirim notifikasi saat dokter memberikan rekomendasi medis gizi
   */
  static async notifyNewRecommendation({ balita, dokter, rekomendasiId }) {
    const judul = `Rekomendasi Medis untuk ${balita.nama}`;
    const pesan = `${dokter.nama} telah menambahkan rekomendasi medis terkait gizi balita ${balita.nama}.`;
    await this.notifyRole({
      role: 'petugas_gizi',
      judul,
      pesan,
      tipe: 'info',
      referensiId: `rekomendasi-${rekomendasiId}`
    });
  }

  /**
   * Kirim notifikasi saat jadwal Posyandu dibuat/diubah
   */
  static async notifyPosyanduSchedule({ jadwal, posyanduNama, action = 'dibuat' }) {
    const judul = `Jadwal Posyandu ${posyanduNama} ${action === 'dibuat' ? 'Baru' : 'Diperbarui'}`;
    const pesan = `Terdapat kegiatan Posyandu pada tanggal ${jadwal.tanggal} pukul ${jadwal.jam_mulai || '08:00'} di ${jadwal.lokasi || posyanduNama}.`;
    
    // Kirim ke dokter dan petugas gizi
    await this.notifyRole({ role: 'dokter', judul, pesan, tipe: 'jadwal', referensiId: `jadwal-${jadwal.id}` });
    await this.notifyRole({ role: 'petugas_gizi', judul, pesan, tipe: 'jadwal', referensiId: `jadwal-${jadwal.id}` });
  }
}

module.exports = NotificationService;

