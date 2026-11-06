const { Op } = require('sequelize');
const { LogAktivitas, User } = require('../models');

class LogAktivitasController {
  static async listLogs(req, res, next) {
    try {
      const { user_id = '', modul = '', aksi = '', tgl_mulai = '', tgl_selesai = '', page = 1, limit = 15 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (user_id) where.user_id = user_id;
      if (modul) where.modul = modul;
      if (aksi) where.aksi = aksi;
      if (tgl_mulai && tgl_selesai) {
        where.created_at = {
          [Op.between]: [new Date(`${tgl_mulai}T00:00:00Z`), new Date(`${tgl_selesai}T23:59:59Z`)]
        };
      } else if (tgl_mulai) {
        where.created_at = { [Op.gte]: new Date(`${tgl_mulai}T00:00:00Z`) };
      }

      const { count, rows } = await LogAktivitas.findAndCountAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'nama', 'username', 'role'] }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Log aktivitas berhasil diambil.',
        data: {
          logs: rows,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LogAktivitasController;

