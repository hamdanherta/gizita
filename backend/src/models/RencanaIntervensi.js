const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RencanaIntervensi = sequelize.define('rencana_intervensi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status_gizi_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  jenis_intervensi: {
    type: DataTypes.ENUM('PMT', 'konseling', 'rujukan', 'suplemen', 'lainnya'),
    allowNull: false,
    defaultValue: 'PMT'
  },
  tujuan: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  target: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tanggal_mulai: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tanggal_selesai: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('direncanakan', 'berjalan', 'selesai', 'dibatalkan'),
    allowNull: false,
    defaultValue: 'direncanakan'
  },
  dibuat_oleh: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = RencanaIntervensi;

