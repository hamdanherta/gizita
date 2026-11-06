const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrangTua = sequelize.define('orang_tua', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama_ayah: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  nama_ibu: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  nik: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  no_hp: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pekerjaan: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  wilayah_posyandu_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = OrangTua;

