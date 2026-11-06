const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogAktivitas = sequelize.define('log_aktivitas', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  aksi: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  modul: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
});

module.exports = LogAktivitas;

