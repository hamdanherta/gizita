const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RekomendasiDokter = sequelize.define('rekomendasi_dokter', {
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
  dokter_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isi_rekomendasi: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = RekomendasiDokter;

