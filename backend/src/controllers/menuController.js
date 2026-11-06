const { Op } = require('sequelize');
const { MenuMakanan, JadwalPmt } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class MenuController {
  static async listMenu(req, res, next) {
    try {
      const { search = '', jenis = '', aktif = '' } = req.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { nama_menu: { [Op.like]: `%${search}%` } },
          { bahan: { [Op.like]: `%${search}%` } }
        ];
      }
      if (jenis) where.jenis = jenis;
      if (aktif !== '') where.aktif = aktif === 'true' || aktif === '1';

      const menus = await MenuMakanan.findAll({
        where,
        order: [['created_at', 'DESC']]
      });

      return res.json({
        success: true,
        message: 'Daftar menu makanan berhasil diambil.',
        data: menus
      });
    } catch (err) {
      next(err);
    }
  }

  static async createMenu(req, res, next) {
    try {
      const {
        nama_menu,
        jenis = 'PMT',
        kelompok_umur,
        bahan,
        energi_kkal,
        protein_g,
        lemak_g,
        karbohidrat_g,
        deskripsi,
        aktif = true
      } = req.body;

      if (!nama_menu) {
        return res.status(400).json({ success: false, message: 'Nama menu wajib diisi.' });
      }

      const menu = await MenuMakanan.create({
        nama_menu,
        jenis,
        kelompok_umur,
        bahan,
        energi_kkal: energi_kkal ? parseFloat(energi_kkal) : null,
        protein_g: protein_g ? parseFloat(protein_g) : null,
        lemak_g: lemak_g ? parseFloat(lemak_g) : null,
        karbohidrat_g: karbohidrat_g ? parseFloat(karbohidrat_g) : null,
        deskripsi,
        aktif
      });

      await logActivity(req, 'TAMBAH_MENU', 'MENU', `Menambahkan menu: ${menu.nama_menu} (${menu.jenis}).`);

      return res.status(201).json({
        success: true,
        message: 'Menu makanan berhasil ditambahkan.',
        data: menu
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateMenu(req, res, next) {
    try {
      const { id } = req.params;
      const {
        nama_menu,
        jenis,
        kelompok_umur,
        bahan,
        energi_kkal,
        protein_g,
        lemak_g,
        karbohidrat_g,
        deskripsi,
        aktif
      } = req.body;

      const menu = await MenuMakanan.findByPk(id);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu makanan tidak ditemukan.' });
      }

      if (nama_menu) menu.nama_menu = nama_menu;
      if (jenis) menu.jenis = jenis;
      if (kelompok_umur !== undefined) menu.kelompok_umur = kelompok_umur;
      if (bahan !== undefined) menu.bahan = bahan;
      if (energi_kkal !== undefined) menu.energi_kkal = energi_kkal ? parseFloat(energi_kkal) : null;
      if (protein_g !== undefined) menu.protein_g = protein_g ? parseFloat(protein_g) : null;
      if (lemak_g !== undefined) menu.lemak_g = lemak_g ? parseFloat(lemak_g) : null;
      if (karbohidrat_g !== undefined) menu.karbohidrat_g = karbohidrat_g ? parseFloat(karbohidrat_g) : null;
      if (deskripsi !== undefined) menu.deskripsi = deskripsi;
      if (aktif !== undefined) menu.aktif = aktif;

      await menu.save();
      await logActivity(req, 'UBAH_MENU', 'MENU', `Memperbarui menu: ${menu.nama_menu}.`);

      return res.json({
        success: true,
        message: 'Menu makanan berhasil diperbarui.',
        data: menu
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteMenu(req, res, next) {
    try {
      const { id } = req.params;
      const menu = await MenuMakanan.findByPk(id);
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Menu makanan tidak ditemukan.' });
      }

      const inUse = await JadwalPmt.count({ where: { menu_id: id } });
      if (inUse > 0) {
        menu.aktif = false;
        await menu.save();
        return res.json({
          success: true,
          message: 'Menu ini telah digunakan dalam jadwal PMT, status dinonaktifkan.'
        });
      }

      await menu.destroy();
      await logActivity(req, 'HAPUS_MENU', 'MENU', `Menghapus menu: ${menu.nama_menu}.`);

      return res.json({
        success: true,
        message: 'Menu makanan berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MenuController;

