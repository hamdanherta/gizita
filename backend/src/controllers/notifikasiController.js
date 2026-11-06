const { Notifikasi } = require('../models');

class NotifikasiController {
  static async getMyNotifications(req, res, next) {
    try {
      const { page = 1, limit = 20, unread_only = 'false' } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = { user_id: req.user.id };
      if (unread_only === 'true') {
        where.sudah_dibaca = false;
      }

      const { count, rows } = await Notifikasi.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      const unreadCount = await Notifikasi.count({
        where: { user_id: req.user.id, sudah_dibaca: false }
      });

      return res.json({
        success: true,
        message: 'Daftar notifikasi berhasil diambil.',
        data: {
          notifikasi: rows,
          unread_count: unreadCount,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notif = await Notifikasi.findOne({
        where: { id, user_id: req.user.id }
      });

      if (!notif) {
        return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });
      }

      notif.sudah_dibaca = true;
      await notif.save();

      return res.json({
        success: true,
        message: 'Notifikasi ditandai sudah dibaca.',
        data: notif
      });
    } catch (err) {
      next(err);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await Notifikasi.update(
        { sudah_dibaca: true },
        { where: { user_id: req.user.id, sudah_dibaca: false } }
      );

      return res.json({
        success: true,
        message: 'Semua notifikasi ditandai sudah dibaca.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NotifikasiController;

