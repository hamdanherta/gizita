const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StatusGizi = sequelize.define('status_gizi', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pengukuran_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  zscore_bbu: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  zscore_tbu: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  zscore_bbtb: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  kategori_bbu: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  kategori_tbu: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  kategori_bbtb: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  status_final: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
});

module.exports = StatusGizi;

