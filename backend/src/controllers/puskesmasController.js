const { Puskesmas, WilayahPosyandu, User } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class PuskesmasController {
  static async getPuskesmas(req, res, next) {
    try {
      const puskesmas = await Puskesmas.findOne({
        include: [
          { model: WilayahPosyandu, as: 'posyanduList' },
          { model: User, as: 'users', attributes: ['id', 'nama', 'role'] }
        ]
      });

      return res.json({
        success: true,
        message: 'Data Puskesmas berhasil diambil.',
        data: puskesmas
      });
    } catch (err) {
      next(err);
    }
  }

  static async updatePuskesmas(req, res, next) {
    try {
      const { nama, alamat, telepon, email, kepala } = req.body;
      let puskesmas = await Puskesmas.findOne();

      if (!puskesmas) {
        puskesmas = await Puskesmas.create({ nama, alamat, telepon, email, kepala });
      } else {
        if (nama) puskesmas.nama = nama;
        if (alamat !== undefined) puskesmas.alamat = alamat;
        if (telepon !== undefined) puskesmas.telepon = telepon;
        if (email !== undefined) puskesmas.email = email;
        if (kepala !== undefined) puskesmas.kepala = kepala;
        await puskesmas.save();
      }

      await logActivity(req, 'UBAH_PUSKESMAS', 'PUSKESMAS', `Memperbarui data Puskesmas: ${puskesmas.nama}.`);

      return res.json({
        success: true,
        message: 'Data Puskesmas berhasil diperbarui.',
        data: puskesmas
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PuskesmasController;

