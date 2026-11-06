const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalPosyandu = sequelize.define('jadwal_posyandu', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  wilayah_posyandu_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  jam_mulai: {
    type: DataTypes.TIME,
    allowNull: true
  },
  jam_selesai: {
    type: DataTypes.TIME,
    allowNull: true
  },
  lokasi: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  kegiatan: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('terjadwal', 'selesai', 'dibatalkan'),
    allowNull: false,
    defaultValue: 'terjadwal'
  }
});

module.exports = JadwalPosyandu;

