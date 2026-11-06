const { Op } = require('sequelize');
const { RencanaIntervensi, Balita, StatusGizi, User, WilayahPosyandu, JadwalPmt, KonsumsiPmt } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class IntervensiController {
  static async listIntervensi(req, res, next) {
    try {
      const { status = '', jenis = '', balita_id = '', posyandu_id = '', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (status) where.status = status;
      if (jenis) where.jenis_intervensi = jenis;
      if (balita_id) where.balita_id = balita_id;

      const balitaInclude = {
        model: Balita,
        as: 'balita',
        attributes: ['id', 'nama', 'nik', 'jenis_kelamin', 'tanggal_lahir', 'wilayah_posyandu_id'],
        include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] }]
      };

      if (posyandu_id) {
        balitaInclude.where = { wilayah_posyandu_id: posyandu_id };
      }

      const { count, rows } = await RencanaIntervensi.findAndCountAll({
        where,
        include: [
          balitaInclude,
          { model: StatusGizi, as: 'statusGizi' },
          { model: User, as: 'pembuat', attributes: ['id', 'nama', 'role'] },
          { model: JadwalPmt, as: 'jadwalPmtList', attributes: ['id', 'status'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Daftar rencana intervensi berhasil diambil.',
        data: {
          intervensi: rows,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createIntervensi(req, res, next) {
    try {
      const {
        balita_id,
        status_gizi_id,
        jenis_intervensi = 'PMT',
        tujuan,
        target,
        tanggal_mulai,
        tanggal_selesai,
        status = 'direncanakan',
        catatan
      } = req.body;

      if (!balita_id || !tanggal_mulai) {
        return res.status(400).json({ success: false, message: 'Balita dan tanggal mulai wajib diisi.' });
      }

      const balita = await Balita.findByPk(balita_id);
      if (!balita) {
        return res.status(404).json({ success: false, message: 'Balita tidak ditemukan.' });
      }

      // Jika status_gizi_id tidak diisi, ambil status gizi terakhir balita
      let finalStatusGiziId = status_gizi_id;
      if (!finalStatusGiziId) {
        const lastStatus = await StatusGizi.findOne({
          where: { balita_id },
          order: [['created_at', 'DESC']]
        });
        if (lastStatus) finalStatusGiziId = lastStatus.id;
      }

      const intervensi = await RencanaIntervensi.create({
        balita_id,
        status_gizi_id: finalStatusGiziId,
        jenis_intervensi,
        tujuan,
        target,
        tanggal_mulai,
        tanggal_selesai,
        status,
        dibuat_oleh: req.user.id,
        catatan
      });

      await logActivity(req, 'TAMBAH_INTERVENSI', 'INTERVENSI', `Menyusun intervensi ${jenis_intervensi} untuk ${balita.nama}.`);

      return res.status(201).json({
        success: true,
        message: 'Rencana intervensi berhasil dibuat.',
        data: intervensi
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateIntervensi(req, res, next) {
    try {
      const { id } = req.params;
      const { jenis_intervensi, tujuan, target, tanggal_mulai, tanggal_selesai, status, catatan } = req.body;

      const intervensi = await RencanaIntervensi.findByPk(id, {
        include: [{ model: Balita, as: 'balita' }]
      });

      if (!intervensi) {
        return res.status(404).json({ success: false, message: 'Rencana intervensi tidak ditemukan.' });
      }

      if (jenis_intervensi) intervensi.jenis_intervensi = jenis_intervensi;
      if (tujuan !== undefined) intervensi.tujuan = tujuan;
      if (target !== undefined) intervensi.target = target;
      if (tanggal_mulai) intervensi.tanggal_mulai = tanggal_mulai;
      if (tanggal_selesai !== undefined) intervensi.tanggal_selesai = tanggal_selesai;
      if (status) intervensi.status = status;
      if (catatan !== undefined) intervensi.catatan = catatan;

      await intervensi.save();
      await logActivity(req, 'UBAH_INTERVENSI', 'INTERVENSI', `Memperbarui rencana intervensi balita ${intervensi.balita?.nama}.`);

      return res.json({
        success: true,
        message: 'Rencana intervensi berhasil diperbarui.',
        data: intervensi
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteIntervensi(req, res, next) {
    try {
      const { id } = req.params;
      const intervensi = await RencanaIntervensi.findByPk(id, {
        include: [{ model: Balita, as: 'balita' }]
      });

      if (!intervensi) {
        return res.status(404).json({ success: false, message: 'Rencana intervensi tidak ditemukan.' });
      }

      await intervensi.destroy();
      await logActivity(req, 'HAPUS_INTERVENSI', 'INTERVENSI', `Menghapus intervensi untuk ${intervensi.balita?.nama}.`);

      return res.json({
        success: true,
        message: 'Rencana intervensi berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = IntervensiController;

