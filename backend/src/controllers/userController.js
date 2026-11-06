const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Puskesmas } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class UserController {
  static async listUsers(req, res, next) {
    try {
      const { search = '', role = '', status = '', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (search) {
        where[Op.or] = [
          { nama: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      if (role) {
        where.role = role;
      }
      if (status !== '') {
        where.status_aktif = status === 'true' || status === '1';
      }

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: ['id', 'nama', 'username', 'email', 'role', 'puskesmas_id', 'no_hp', 'status_aktif', 'last_login', 'created_at'],
        include: [{ model: Puskesmas, as: 'puskesmas', attributes: ['id', 'nama'] }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Daftar pengguna berhasil diambil.',
        data: {
          users: rows,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req, res, next) {
    try {
      const { nama, username, email, password, role, no_hp, puskesmas_id } = req.body;

      if (!nama || !username || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Nama, username, email, password, dan role wajib diisi.' });
      }

      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username atau email sudah digunakan.' });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        nama,
        username,
        email,
        password_hash,
        role,
        no_hp,
        puskesmas_id: puskesmas_id || 1,
        status_aktif: true
      });

      await logActivity(req, 'TAMBAH_PENGGUNA', 'PENGGUNA', `Admin membuat akun baru: ${newUser.nama} (${newUser.role}).`);

      return res.status(201).json({
        success: true,
        message: 'Pengguna berhasil dibuat.',
        data: {
          id: newUser.id,
          nama: newUser.nama,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { nama, email, role, no_hp, status_aktif } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      if (email && email !== user.email) {
        const exist = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
        if (exist) {
          return res.status(400).json({ success: false, message: 'Email sudah digunakan pengguna lain.' });
        }
        user.email = email;
      }

      if (nama) user.nama = nama;
      if (role) user.role = role;
      if (no_hp !== undefined) user.no_hp = no_hp;
      if (status_aktif !== undefined) user.status_aktif = status_aktif;

      await user.save();
      await logActivity(req, 'UBAH_PENGGUNA', 'PENGGUNA', `Admin mengubah data pengguna: ${user.nama}.`);

      return res.json({
        success: true,
        message: 'Data pengguna berhasil diperbarui.',
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password_baru } = req.body;

      if (!password_baru || password_baru.length < 6) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password_baru, salt);
      await user.save();

      await logActivity(req, 'RESET_PASSWORD', 'PENGGUNA', `Admin mereset password pengguna: ${user.nama}.`);

      return res.json({
        success: true,
        message: `Password pengguna ${user.nama} berhasil direset.`
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      }

      if (user.id === req.user.id) {
        return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun sendiri.' });
      }

      // Aman: nonaktifkan akun atau hapus jika belum ada relasi
      await user.destroy();
      await logActivity(req, 'HAPUS_PENGGUNA', 'PENGGUNA', `Admin menghapus pengguna ${user.nama}.`);

      return res.json({
        success: true,
        message: 'Pengguna berhasil dihapus.'
      });
    } catch (err) {
      // Jika foreign key restriction
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        const user = await User.findByPk(req.params.id);
        if (user) {
          user.status_aktif = false;
          await user.save();
          return res.json({
            success: true,
            message: 'Pengguna memiliki relasi data riwayat, status akun diubah menjadi NONAKTIF.'
          });
        }
      }
      next(err);
    }
  }
}

module.exports = UserController;

