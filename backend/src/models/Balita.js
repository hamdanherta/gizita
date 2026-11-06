const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Balita = sequelize.define('balita', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orang_tua_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  wilayah_posyandu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nik: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  nama: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false
  },
  tanggal_lahir: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  berat_lahir: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  panjang_lahir: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  anak_ke: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  status_aktif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Balita;

