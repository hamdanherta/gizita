const { Op } = require('sequelize');
const { WilayahPosyandu, Balita, OrangTua, JadwalPosyandu, Puskesmas } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class PosyanduController {
  static async listPosyandu(req, res, next) {
    try {
      const { search = '' } = req.query;
      const where = {};
      if (search) {
        where[Op.or] = [
          { nama_posyandu: { [Op.like]: `%${search}%` } },
          { kelurahan_desa: { [Op.like]: `%${search}%` } },
          { nama_kader: { [Op.like]: `%${search}%` } }
        ];
      }

      const list = await WilayahPosyandu.findAll({
        where,
        include: [
          { model: Balita, as: 'balitaList', attributes: ['id'] },
          { model: JadwalPosyandu, as: 'jadwalList', attributes: ['id', 'tanggal', 'status'] }
        ],
        order: [['nama_posyandu', 'ASC']]
      });

      const formatted = list.map(item => ({
        id: item.id,
        puskesmas_id: item.puskesmas_id,
        nama_posyandu: item.nama_posyandu,
        kelurahan_desa: item.kelurahan_desa,
        alamat: item.alamat,
        nama_kader: item.nama_kader,
        telepon_kader: item.telepon_kader,
        total_balita: item.balitaList?.length || 0,
        total_jadwal: item.jadwalList?.length || 0,
        created_at: item.created_at
      }));

      return res.json({
        success: true,
        message: 'Daftar wilayah posyandu berhasil diambil.',
        data: formatted
      });
    } catch (err) {
      next(err);
    }
  }

  static async createPosyandu(req, res, next) {
    try {
      const { nama_posyandu, kelurahan_desa, alamat, nama_kader, telepon_kader, puskesmas_id } = req.body;

      if (!nama_posyandu) {
        return res.status(400).json({ success: false, message: 'Nama posyandu wajib diisi.' });
      }

      const item = await WilayahPosyandu.create({
        puskesmas_id: puskesmas_id || 1,
        nama_posyandu,
        kelurahan_desa,
        alamat,
        nama_kader,
        telepon_kader
      });

      await logActivity(req, 'TAMBAH_POSYANDU', 'POSYANDU', `Menambahkan wilayah Posyandu: ${item.nama_posyandu}.`);

      return res.status(201).json({
        success: true,
        message: 'Posyandu berhasil ditambahkan.',
        data: item
      });
    } catch (err) {
      next(err);
    }
  }

  static async updatePosyandu(req, res, next) {
    try {
      const { id } = req.params;
      const { nama_posyandu, kelurahan_desa, alamat, nama_kader, telepon_kader } = req.body;

      const item = await WilayahPosyandu.findByPk(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Posyandu tidak ditemukan.' });
      }

      if (nama_posyandu) item.nama_posyandu = nama_posyandu;
      if (kelurahan_desa !== undefined) item.kelurahan_desa = kelurahan_desa;
      if (alamat !== undefined) item.alamat = alamat;
      if (nama_kader !== undefined) item.nama_kader = nama_kader;
      if (telepon_kader !== undefined) item.telepon_kader = telepon_kader;

      await item.save();
      await logActivity(req, 'UBAH_POSYANDU', 'POSYANDU', `Memperbarui wilayah Posyandu: ${item.nama_posyandu}.`);

      return res.json({
        success: true,
        message: 'Posyandu berhasil diperbarui.',
        data: item
      });
    } catch (err) {
      next(err);
    }
  }

  static async deletePosyandu(req, res, next) {
    try {
      const { id } = req.params;
      const item = await WilayahPosyandu.findByPk(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Posyandu tidak ditemukan.' });
      }

      // Periksa apakah terdapat balita binaan
      const totalBalita = await Balita.count({ where: { wilayah_posyandu_id: id } });
      if (totalBalita > 0) {
        return res.status(400).json({
          success: false,
          message: `Tidak dapat menghapus. Masih terdapat ${totalBalita} data balita yang terdaftar di posyandu ini.`
        });
      }

      await item.destroy();
      await logActivity(req, 'HAPUS_POSYANDU', 'POSYANDU', `Menghapus Posyandu ${item.nama_posyandu}.`);

      return res.json({
        success: true,
        message: 'Posyandu berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PosyanduController;

