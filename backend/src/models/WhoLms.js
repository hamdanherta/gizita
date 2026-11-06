const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WhoLms = sequelize.define('who_lms', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  indikator: {
    type: DataTypes.ENUM('BBU', 'TBU', 'BBPB', 'BBTB'),
    allowNull: false
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('L', 'P'),
    allowNull: false
  },
  umur_bulan_atau_tinggi: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    comment: 'Bulan (0-60) untuk BBU/TBU, atau cm (45-120) untuk BBPB/BBTB'
  },
  L: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  M: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  S: {
    type: DataTypes.DOUBLE,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['indikator', 'jenis_kelamin', 'umur_bulan_atau_tinggi']
    }
  ]
});

module.exports = WhoLms;

