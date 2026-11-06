const { CatatanPemeriksaan, Balita, User, WilayahPosyandu } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class PemeriksaanController {
  static async listPemeriksaan(req, res, next) {
    try {
      const { balita_id = '', dokter_id = '', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (balita_id) where.balita_id = balita_id;
      if (dokter_id) where.dokter_id = dokter_id;

      const { count, rows } = await CatatanPemeriksaan.findAndCountAll({
        where,
        include: [
          {
            model: Balita,
            as: 'balita',
            attributes: ['id', 'nama', 'nik', 'jenis_kelamin', 'tanggal_lahir'],
            include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] }]
          },
          { model: User, as: 'dokter', attributes: ['id', 'nama', 'role'] }
        ],
        order: [['tanggal', 'DESC'], ['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Daftar catatan pemeriksaan dokter berhasil diambil.',
        data: {
          pemeriksaan: rows,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createPemeriksaan(req, res, next) {
    try {
      const { balita_id, tanggal, keluhan, diagnosa, tindakan, catatan } = req.body;

      if (!balita_id || !tanggal) {
        return res.status(400).json({ success: false, message: 'Balita dan tanggal pemeriksaan wajib diisi.' });
      }

      const balita = await Balita.findByPk(balita_id);
      if (!balita) {
        return res.status(404).json({ success: false, message: 'Balita tidak ditemukan.' });
      }

      const pemeriksaan = await CatatanPemeriksaan.create({
        balita_id,
        dokter_id: req.user.id,
        tanggal,
        keluhan,
        diagnosa,
        tindakan,
        catatan
      });

      await logActivity(req, 'TAMBAH_PEMERIKSAAN', 'PEMERIKSAAN', `Dokter ${req.user.nama} memeriksa balita ${balita.nama}.`);

      return res.status(201).json({
        success: true,
        message: 'Catatan pemeriksaan dokter berhasil disimpan.',
        data: pemeriksaan
      });
    } catch (err) {
      next(err);
    }
  }

  static async updatePemeriksaan(req, res, next) {
    try {
      const { id } = req.params;
      const { tanggal, keluhan, diagnosa, tindakan, catatan } = req.body;

      const item = await CatatanPemeriksaan.findByPk(id, {
        include: [{ model: Balita, as: 'balita' }]
      });

      if (!item) {
        return res.status(404).json({ success: false, message: 'Catatan pemeriksaan tidak ditemukan.' });
      }

      if (tanggal) item.tanggal = tanggal;
      if (keluhan !== undefined) item.keluhan = keluhan;
      if (diagnosa !== undefined) item.diagnosa = diagnosa;
      if (tindakan !== undefined) item.tindakan = tindakan;
      if (catatan !== undefined) item.catatan = catatan;

      await item.save();
      await logActivity(req, 'UBAH_PEMERIKSAAN', 'PEMERIKSAAN', `Memperbarui pemeriksaan balita ${item.balita?.nama}.`);

      return res.json({
        success: true,
        message: 'Catatan pemeriksaan berhasil diperbarui.',
        data: item
      });
    } catch (err) {
      next(err);
    }
  }

  static async deletePemeriksaan(req, res, next) {
    try {
      const { id } = req.params;
      const item = await CatatanPemeriksaan.findByPk(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Catatan pemeriksaan tidak ditemukan.' });
      }

      await item.destroy();
      await logActivity(req, 'HAPUS_PEMERIKSAAN', 'PEMERIKSAAN', `Menghapus catatan pemeriksaan ID #${id}.`);

      return res.json({
        success: true,
        message: 'Catatan pemeriksaan berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PemeriksaanController;

