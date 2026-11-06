const { PengaturanSistem } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class PengaturanController {
  static async getSettings(req, res, next) {
    try {
      const items = await PengaturanSistem.findAll();
      const settings = {};
      items.forEach(item => {
        settings[item.key] = item.value;
      });

      // Default jika belum ada
      if (!settings.nama_aplikasi) settings.nama_aplikasi = 'Gizita';
      if (!settings.hari_pengingat_notifikasi) settings.hari_pengingat_notifikasi = '1';

      return res.json({
        success: true,
        message: 'Pengaturan sistem berhasil diambil.',
        data: settings
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const settingsPayload = req.body; // e.g. { nama_aplikasi: 'Gizita', logo_url: '...', ... }

      for (const [key, value] of Object.entries(settingsPayload)) {
        let item = await PengaturanSistem.findOne({ where: { key } });
        if (item) {
          item.value = String(value);
          await item.save();
        } else {
          await PengaturanSistem.create({ key, value: String(value) });
        }
      }

      await logActivity(req, 'UBAH_PENGATURAN', 'SISTEM', 'Admin memperbarui pengaturan sistem aplikasi.');

      const items = await PengaturanSistem.findAll();
      const settings = {};
      items.forEach(item => {
        settings[item.key] = item.value;
      });

      return res.json({
        success: true,
        message: 'Pengaturan sistem berhasil disimpan.',
        data: settings
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PengaturanController;

