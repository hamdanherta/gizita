const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const KonsumsiPmt = sequelize.define('konsumsi_pmt', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  jadwal_pmt_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  porsi_dihabiskan: {
    type: DataTypes.ENUM('habis', 'sebagian', 'tidak'),
    allowNull: false,
    defaultValue: 'habis'
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dicatat_oleh: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = KonsumsiPmt;

