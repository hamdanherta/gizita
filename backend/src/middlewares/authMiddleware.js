const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { User, Puskesmas } = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizita_secret_jwt_key_2026_kebun_kopi');

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Puskesmas, as: 'puskesmas' }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid. Pengguna tidak ditemukan.'
      });
    }

    if (!user.status_aktif) {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi Anda telah kedaluwarsa. Silakan masuk kembali.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token otentikasi tidak valid.'
    });
  }
};

const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Otentikasi diperlukan.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRoles
};

