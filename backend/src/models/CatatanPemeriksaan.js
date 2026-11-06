const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CatatanPemeriksaan = sequelize.define('catatan_pemeriksaan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dokter_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  keluhan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnosa: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  tindakan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = CatatanPemeriksaan;

