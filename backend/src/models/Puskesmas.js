const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Puskesmas = sequelize.define('puskesmas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nama: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  telepon: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  kepala: {
    type: DataTypes.STRING(150),
    allowNull: true
  }
});

module.exports = Puskesmas;

