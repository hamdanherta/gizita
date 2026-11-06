const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PengaturanSistem = sequelize.define('pengaturan_sistem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = PengaturanSistem;

