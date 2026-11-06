const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notifikasi = sequelize.define('notifikasi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  judul: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  pesan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipe: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'info, warning, danger, jadwal'
  },
  referensi_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  sudah_dibaca: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Notifikasi;

