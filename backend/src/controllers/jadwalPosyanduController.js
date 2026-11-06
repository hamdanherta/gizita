const { Op } = require('sequelize');
const { JadwalPosyandu, KunjunganPosyandu, WilayahPosyandu, Balita, Pengukuran, StatusGizi } = require('../models');
const NotificationService = require('../services/notificationService');
const { logActivity } = require('../middlewares/activityLogger');

class JadwalPosyanduController {
  static async listJadwal(req, res, next) {
    try {
      const { posyandu_id = '', status = '', bulan = '', tahun = '', page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (posyandu_id) where.wilayah_posyandu_id = posyandu_id;
      if (status) where.status = status;
      if (bulan && tahun) {
        const start = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
        const end = `${tahun}-${String(bulan).padStart(2, '0')}-31`;
        where.tanggal = { [Op.between]: [start, end] };
      }

      const { count, rows } = await JadwalPosyandu.findAndCountAll({
        where,
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu' },
          { model: KunjunganPosyandu, as: 'kunjunganList', attributes: ['id', 'balita_id'] }
        ],
        order: [['tanggal', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Daftar jadwal posyandu berhasil diambil.',
        data: {
          jadwal: rows,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDetailJadwal(req, res, next) {
    try {
      const { id } = req.params;
      const jadwal = await JadwalPosyandu.findByPk(id, {
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu' },
          {
            model: KunjunganPosyandu,
            as: 'kunjunganList',
            include: [
              { model: Balita, as: 'balita', attributes: ['id', 'nama', 'nik', 'jenis_kelamin', 'tanggal_lahir'] },
              {
                model: Pengukuran,
                as: 'pengukuran',
                include: [{ model: StatusGizi, as: 'statusGizi' }]
              }
            ]
          }
        ]
      });

      if (!jadwal) {
        return res.status(404).json({ success: false, message: 'Jadwal posyandu tidak ditemukan.' });
      }

      return res.json({
        success: true,
        message: 'Detail jadwal posyandu berhasil diambil.',
        data: jadwal
      });
    } catch (err) {
      next(err);
    }
  }

  static async createJadwal(req, res, next) {
    try {
      const { wilayah_posyandu_id, tanggal, jam_mulai, jam_selesai, lokasi, kegiatan, keterangan, status = 'terjadwal' } = req.body;

      if (!wilayah_posyandu_id || !tanggal) {
        return res.status(400).json({ success: false, message: 'Wilayah posyandu dan tanggal pelaksanaan wajib diisi.' });
      }

      const posyandu = await WilayahPosyandu.findByPk(wilayah_posyandu_id);
      if (!posyandu) {
        return res.status(404).json({ success: false, message: 'Wilayah posyandu tidak ditemukan.' });
      }

      const jadwal = await JadwalPosyandu.create({
        wilayah_posyandu_id,
        tanggal,
        jam_mulai,
        jam_selesai,
        lokasi: lokasi || posyandu.alamat,
        kegiatan,
        keterangan,
        status
      });

      // Kirim notifikasi ke Dokter & Petugas Gizi
      await NotificationService.notifyPosyanduSchedule({
        jadwal,
        posyanduNama: posyandu.nama_posyandu,
        action: 'dibuat'
      });

      await logActivity(req, 'TAMBAH_JADWAL_POSYANDU', 'POSYANDU', `Menambahkan jadwal posyandu ${posyandu.nama_posyandu} (${tanggal}).`);

      return res.status(201).json({
        success: true,
        message: 'Jadwal posyandu berhasil dibuat dan notifikasi telah dikirim.',
        data: jadwal
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateJadwal(req, res, next) {
    try {
      const { id } = req.params;
      const { wilayah_posyandu_id, tanggal, jam_mulai, jam_selesai, lokasi, kegiatan, keterangan, status } = req.body;

      const jadwal = await JadwalPosyandu.findByPk(id, {
        include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu' }]
      });

      if (!jadwal) {
        return res.status(404).json({ success: false, message: 'Jadwal posyandu tidak ditemukan.' });
      }

      if (wilayah_posyandu_id) jadwal.wilayah_posyandu_id = wilayah_posyandu_id;
      if (tanggal) jadwal.tanggal = tanggal;
      if (jam_mulai !== undefined) jadwal.jam_mulai = jam_mulai;
      if (jam_selesai !== undefined) jadwal.jam_selesai = jam_selesai;
      if (lokasi !== undefined) jadwal.lokasi = lokasi;
      if (kegiatan !== undefined) jadwal.kegiatan = kegiatan;
      if (keterangan !== undefined) jadwal.keterangan = keterangan;
      if (status !== undefined) jadwal.status = status;

      await jadwal.save();

      // Notifikasi pembaruan
      await NotificationService.notifyPosyanduSchedule({
        jadwal,
        posyanduNama: jadwal.wilayahPosyandu?.nama_posyandu || 'Posyandu',
        action: 'diperbarui'
      });

      await logActivity(req, 'UBAH_JADWAL_POSYANDU', 'POSYANDU', `Memperbarui jadwal posyandu ID #${jadwal.id}.`);

      return res.json({
        success: true,
        message: 'Jadwal posyandu berhasil diperbarui.',
        data: jadwal
      });
    } catch (err) {
      next(err);
    }
  }

  static async catatKunjungan(req, res, next) {
    try {
      const { id: jadwal_posyandu_id } = req.params;
      const { balita_id, pengukuran_id, catatan } = req.body;

      if (!balita_id) {
        return res.status(400).json({ success: false, message: 'Balita wajib dipilih.' });
      }

      const exist = await KunjunganPosyandu.findOne({
        where: { jadwal_posyandu_id, balita_id }
      });

      if (exist) {
        exist.pengukuran_id = pengukuran_id || exist.pengukuran_id;
        if (catatan !== undefined) exist.catatan = catatan;
        await exist.save();
        return res.json({
          success: true,
          message: 'Data kunjungan balita diperbarui.',
          data: exist
        });
      }

      const kunjungan = await KunjunganPosyandu.create({
        jadwal_posyandu_id,
        balita_id,
        pengukuran_id: pengukuran_id || null,
        catatan: catatan || null
      });

      return res.status(201).json({
        success: true,
        message: 'Kehadiran kunjungan posyandu balita berhasil dicatat.',
        data: kunjungan
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteJadwal(req, res, next) {
    try {
      const { id } = req.params;
      const jadwal = await JadwalPosyandu.findByPk(id);
      if (!jadwal) {
        return res.status(404).json({ success: false, message: 'Jadwal posyandu tidak ditemukan.' });
      }

      await KunjunganPosyandu.destroy({ where: { jadwal_posyandu_id: id } });
      await jadwal.destroy();

      await logActivity(req, 'HAPUS_JADWAL_POSYANDU', 'POSYANDU', `Menghapus jadwal posyandu ID #${id}.`);

      return res.json({
        success: true,
        message: 'Jadwal posyandu berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = JadwalPosyanduController;

