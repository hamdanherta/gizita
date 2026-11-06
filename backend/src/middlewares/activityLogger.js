const { LogAktivitas } = require('../models');

/**
 * Mencatat log aktivitas sistem
 * @param {object} req Express request
 * @param {string} aksi Nama aksi (LOGIN, LOGOUT, TAMBAH, UBAH, HAPUS, CETAK, dll)
 * @param {string} modul Nama modul (AUTH, BALITA, PENGUKURAN, INTERVENSI, POSYANDU, dll)
 * @param {string} detail Deskripsi detail aktivitas
 */
const logActivity = async (req, aksi, modul, detail) => {
  try {
    const userId = req.user ? req.user.id : null;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    await LogAktivitas.create({
      user_id: userId,
      aksi,
      modul,
      detail,
      ip_address: typeof ip === 'string' ? ip.replace('::ffff:', '') : '127.0.0.1'
    });
  } catch (err) {
    console.error('Gagal mencatat log aktivitas:', err.message);
  }
};

module.exports = { logActivity };

