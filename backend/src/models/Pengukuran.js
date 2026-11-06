const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pengukuran = sequelize.define('pengukuran', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tanggal_ukur: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  umur_bulan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  berat_badan: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Berat badan dalam kilogram (kg)'
  },
  tinggi_badan: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Tinggi atau panjang badan dalam cm'
  },
  cara_ukur: {
    type: DataTypes.ENUM('terlentang', 'berdiri'),
    allowNull: false,
    defaultValue: 'terlentang'
  },
  lingkar_kepala: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Lingkar kepala dalam cm'
  },
  lila: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Lingkar lengan atas dalam cm'
  },
  petugas_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  posyandu_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  catatan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Pengukuran;

