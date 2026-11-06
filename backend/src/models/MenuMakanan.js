const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuMakanan = sequelize.define('menu_makanan', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama_menu: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  jenis: {
    type: DataTypes.ENUM('PMT', 'MPASI', 'makanan_keluarga'),
    allowNull: false,
    defaultValue: 'PMT'
  },
  kelompok_umur: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Contoh: 6-11 bulan, 12-23 bulan, 24-59 bulan'
  },
  bahan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  energi_kkal: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  protein_g: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  lemak_g: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  karbohidrat_g: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  aktif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = MenuMakanan;

