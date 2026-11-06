const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WilayahPosyandu = sequelize.define('wilayah_posyandu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  puskesmas_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nama_posyandu: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  kelurahan_desa: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nama_kader: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  telepon_kader: {
    type: DataTypes.STRING(30),
    allowNull: true
  }
});

module.exports = WilayahPosyandu;

