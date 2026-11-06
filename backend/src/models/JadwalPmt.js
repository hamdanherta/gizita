const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalPmt = sequelize.define('jadwal_pmt', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  rencana_intervensi_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  balita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  menu_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  jumlah_porsi: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('terjadwal', 'diberikan', 'tidak_diberikan'),
    allowNull: false,
    defaultValue: 'terjadwal'
  }
});

module.exports = JadwalPmt;

