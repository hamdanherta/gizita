const { Op } = require('sequelize');
const { OrangTua, Balita, WilayahPosyandu } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class OrangTuaController {
  static async listOrangTua(req, res, next) {
    try {
      const { search = '', posyandu_id = '', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (search) {
        where[Op.or] = [
          { nama_ibu: { [Op.like]: `%${search}%` } },
          { nama_ayah: { [Op.like]: `%${search}%` } },
          { nik: { [Op.like]: `%${search}%` } }
        ];
      }
      if (posyandu_id) {
        where.wilayah_posyandu_id = posyandu_id;
      }

      const { count, rows } = await OrangTua.findAndCountAll({
        where,
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] },
          { model: Balita, as: 'anak', attributes: ['id', 'nama', 'jenis_kelamin', 'tanggal_lahir'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Daftar orang tua berhasil diambil.',
        data: {
          orang_tua: rows,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createOrangTua(req, res, next) {
    try {
      const { nama_ibu, nama_ayah, nik, no_hp, alamat, pekerjaan, wilayah_posyandu_id } = req.body;

      if (!nama_ibu) {
        return res.status(400).json({ success: false, message: 'Nama ibu wajib diisi.' });
      }

      const ortu = await OrangTua.create({
        nama_ibu,
        nama_ayah,
        nik,
        no_hp,
        alamat,
        pekerjaan,
        wilayah_posyandu_id: wilayah_posyandu_id || null
      });

      await logActivity(req, 'TAMBAH_ORANG_TUA', 'ORANG_TUA', `Menambahkan data orang tua: Ibu ${ortu.nama_ibu}.`);

      return res.status(201).json({
        success: true,
        message: 'Data orang tua berhasil ditambahkan.',
        data: ortu
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateOrangTua(req, res, next) {
    try {
      const { id } = req.params;
      const { nama_ibu, nama_ayah, nik, no_hp, alamat, pekerjaan, wilayah_posyandu_id } = req.body;

      const ortu = await OrangTua.findByPk(id);
      if (!ortu) {
        return res.status(404).json({ success: false, message: 'Data orang tua tidak ditemukan.' });
      }

      if (nama_ibu) ortu.nama_ibu = nama_ibu;
      if (nama_ayah !== undefined) ortu.nama_ayah = nama_ayah;
      if (nik !== undefined) ortu.nik = nik;
      if (no_hp !== undefined) ortu.no_hp = no_hp;
      if (alamat !== undefined) ortu.alamat = alamat;
      if (pekerjaan !== undefined) ortu.pekerjaan = pekerjaan;
      if (wilayah_posyandu_id !== undefined) ortu.wilayah_posyandu_id = wilayah_posyandu_id;

      await ortu.save();
      await logActivity(req, 'UBAH_ORANG_TUA', 'ORANG_TUA', `Memperbarui data orang tua: Ibu ${ortu.nama_ibu}.`);

      return res.json({
        success: true,
        message: 'Data orang tua berhasil diperbarui.',
        data: ortu
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteOrangTua(req, res, next) {
    try {
      const { id } = req.params;
      const ortu = await OrangTua.findByPk(id);
      if (!ortu) {
        return res.status(404).json({ success: false, message: 'Data orang tua tidak ditemukan.' });
      }

      const totalAnak = await Balita.count({ where: { orang_tua_id: id } });
      if (totalAnak > 0) {
        return res.status(400).json({
          success: false,
          message: `Tidak dapat menghapus orang tua karena terhubung dengan ${totalAnak} data balita.`
        });
      }

      await ortu.destroy();
      await logActivity(req, 'HAPUS_ORANG_TUA', 'ORANG_TUA', `Menghapus orang tua Ibu ${ortu.nama_ibu}.`);

      return res.json({
        success: true,
        message: 'Data orang tua berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrangTuaController;

