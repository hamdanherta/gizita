const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KunjunganPosyandu = sequelize.define('kunjungan_posyandu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  jadwal_posyandu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pengukuran_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = KunjunganPosyandu;

