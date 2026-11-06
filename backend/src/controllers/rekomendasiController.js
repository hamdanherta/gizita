const { RekomendasiDokter, Balita, StatusGizi, User, WilayahPosyandu } = require('../models');
const NotificationService = require('../services/notificationService');
const { logActivity } = require('../middlewares/activityLogger');

class RekomendasiController {
  static async listRekomendasi(req, res, next) {
    try {
      const { balita_id = '', dokter_id = '', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (balita_id) where.balita_id = balita_id;
      if (dokter_id) where.dokter_id = dokter_id;

      const { count, rows } = await RekomendasiDokter.findAndCountAll({
        where,
        include: [
          {
            model: Balita,
            as: 'balita',
            attributes: ['id', 'nama', 'nik', 'jenis_kelamin', 'tanggal_lahir'],
            include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] }]
          },
          { model: StatusGizi, as: 'statusGizi' },
          { model: User, as: 'dokter', attributes: ['id', 'nama', 'role'] }
        ],
        order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Daftar rekomendasi dokter berhasil diambil.',
        data: {
          rekomendasi: rows,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createRekomendasi(req, res, next) {
    try {
      const { balita_id, status_gizi_id, isi_rekomendasi, tanggal } = req.body;

      if (!balita_id || !isi_rekomendasi) {
        return res.status(400).json({ success: false, message: 'Balita dan isi rekomendasi wajib diisi.' });
      }

      const balita = await Balita.findByPk(balita_id);
      if (!balita) {
        return res.status(404).json({ success: false, message: 'Balita tidak ditemukan.' });
      }

      let finalStatusGiziId = status_gizi_id;
      if (!finalStatusGiziId) {
        const lastSt = await StatusGizi.findOne({
          where: { balita_id },
          order: [['created_at', 'DESC']]
        });
        if (lastSt) finalStatusGiziId = lastSt.id;
      }

      const rekomendasi = await RekomendasiDokter.create({
        balita_id,
        status_gizi_id: finalStatusGiziId,
        dokter_id: req.user.id,
        isi_rekomendasi,
        tanggal: tanggal || new Date().toISOString().split('T')[0]
      });

      // Kirim notifikasi ke Petugas Gizi
      await NotificationService.notifyNewRecommendation({
        balita,
        dokter: req.user,
        rekomendasiId: rekomendasi.id
      });

      await logActivity(req, 'TAMBAH_REKOMENDASI', 'REKOMENDASI', `Dokter ${req.user.nama} memberikan rekomendasi medis untuk balita ${balita.nama}.`);

      return res.status(201).json({
        success: true,
        message: 'Rekomendasi dokter berhasil disimpan dan notifikasi telah dikirim ke petugas gizi.',
        data: rekomendasi
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteRekomendasi(req, res, next) {
    try {
      const { id } = req.params;
      const item = await RekomendasiDokter.findByPk(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Rekomendasi tidak ditemukan.' });
      }

      await item.destroy();
      await logActivity(req, 'HAPUS_REKOMENDASI', 'REKOMENDASI', `Menghapus rekomendasi ID #${id}.`);

      return res.json({
        success: true,
        message: 'Rekomendasi berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RekomendasiController;

