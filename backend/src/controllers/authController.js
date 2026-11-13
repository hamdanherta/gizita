const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Puskesmas } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username/email dan kata sandi wajib diisi.'
        });
      }

      // Cari user berdasarkan username atau email
      const user = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email: username }]
        },
        include: [{ model: Puskesmas, as: 'puskesmas' }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Username atau kata sandi salah.'
        });
      }

      if (!user.status_aktif) {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda dinonaktifkan. Silakan hubungi administrator.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Username atau kata sandi salah.'
        });
      }

      // Update last login
      user.last_login = new Date();
      await user.save();

      // Sign JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'gizita_secret_jwt_key_2026_kebun_kopi',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Catat log login
      await logActivity(req, 'LOGIN', 'AUTH', `Pengguna ${user.nama} (${user.role}) berhasil masuk.`);

      return res.json({
        success: true,
        message: 'Login berhasil.',
        data: {
          token,
          user: {
            id: user.id,
            nama: user.nama,
            username: user.username,
            email: user.email,
            role: user.role,
            no_hp: user.no_hp,
            puskesmas: user.puskesmas
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const { nama, username, email, password, role, no_hp } = req.body;

      if (!nama || !username || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap, username, email, kata sandi, dan role wajib diisi.'
        });
      }

      const validRoles = ['admin', 'petugas_gizi', 'dokter'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role yang dipilih tidak valid. Pilihan: Administrator, Petugas Gizi, atau Dokter.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Kata sandi minimal 6 karakter.'
        });
      }

      // Cek apakah username atau email sudah terpakai
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.username.toLowerCase() === username.toLowerCase()
            ? 'Username sudah digunakan, silakan pilih username lain.'
            : 'Email sudah terdaftar, silakan gunakan email lain.'
        });
      }

      // Hubungkan ke puskesmas default jika ada
      const pusk = await Puskesmas.findOne();
      const puskesmas_id = pusk ? pusk.id : null;

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        nama,
        username,
        email,
        password_hash,
        role,
        no_hp: no_hp || null,
        puskesmas_id,
        status_aktif: true
      });

      await logActivity(req, 'REGISTER', 'AUTH', `Pengguna baru ${newUser.nama} mendaftar sebagai ${newUser.role}.`);

      return res.status(201).json({
        success: true,
        message: 'Registrasi akun berhasil! Silakan masuk dengan akun Anda.',
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

  static async getMe(req, res, next) {
    try {
      const user = req.user;
      return res.json({
        success: true,
        message: 'Data profil berhasil diambil.',
        data: {
          id: user.id,
          nama: user.nama,
          username: user.username,
          email: user.email,
          role: user.role,
          no_hp: user.no_hp,
          last_login: user.last_login,
          puskesmas: user.puskesmas
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const { nama, email, no_hp } = req.body;
      const user = req.user;

      if (email && email !== user.email) {
        const exist = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
        if (exist) {
          return res.status(400).json({ success: false, message: 'Email sudah digunakan pengguna lain.' });
        }
        user.email = email;
      }

      if (nama) user.nama = nama;
      if (no_hp !== undefined) user.no_hp = no_hp;

      await user.save();
      await logActivity(req, 'UBAH_PROFIL', 'AUTH', `Pengguna ${user.nama} memperbarui profil.`);

      return res.json({
        success: true,
        message: 'Profil berhasil diperbarui.',
        data: {
          id: user.id,
          nama: user.nama,
          username: user.username,
          email: user.email,
          role: user.role,
          no_hp: user.no_hp
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { password_lama, password_baru } = req.body;
      const user = req.user;

      if (!password_lama || !password_baru) {
        return res.status(400).json({ success: false, message: 'Kata sandi lama dan baru wajib diisi.' });
      }

      if (password_baru.length < 6) {
        return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter.' });
      }

      const isMatch = await bcrypt.compare(password_lama, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Kata sandi lama salah.' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password_baru, salt);
      await user.save();

      await logActivity(req, 'GANTI_PASSWORD', 'AUTH', `Pengguna ${user.nama} berhasil mengubah kata sandi.`);

      return res.json({
        success: true,
        message: 'Kata sandi berhasil diubah.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      if (req.user) {
        await logActivity(req, 'LOGOUT', 'AUTH', `Pengguna ${req.user.nama} keluar dari sistem.`);
      }
      return res.json({
        success: true,
        message: 'Logout berhasil.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;

