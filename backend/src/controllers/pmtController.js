const { Op } = require('sequelize');
const { JadwalPmt, KonsumsiPmt, Balita, MenuMakanan, RencanaIntervensi, WilayahPosyandu, User } = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class PmtController {
  static async listJadwal(req, res, next) {
    try {
      const { balita_id = '', posyandu_id = '', tanggal = '', bulan = '', tahun = '', status = '', page = 1, limit = 15 } = req.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const where = {};
      if (balita_id) where.balita_id = balita_id;
      if (status) where.status = status;
      if (tanggal) where.tanggal = tanggal;
      if (bulan && tahun) {
        const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
        const endDate = `${tahun}-${String(bulan).padStart(2, '0')}-31`;
        where.tanggal = { [Op.between]: [startDate, endDate] };
      }

      const balitaInclude = {
        model: Balita,
        as: 'balita',
        attributes: ['id', 'nama', 'nik', 'wilayah_posyandu_id'],
        include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] }]
      };

      if (posyandu_id) {
        balitaInclude.where = { wilayah_posyandu_id: posyandu_id };
      }

      const { count, rows } = await JadwalPmt.findAndCountAll({
        where,
        include: [
          balitaInclude,
          { model: MenuMakanan, as: 'menu' },
          {
            model: KonsumsiPmt,
            as: 'konsumsi',
            include: [{ model: User, as: 'pencatat', attributes: ['id', 'nama'] }]
          },
          { model: RencanaIntervensi, as: 'rencanaIntervensi', attributes: ['id', 'tujuan', 'jenis_intervensi'] }
        ],
        order: [['tanggal', 'DESC'], ['id', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return res.json({
        success: true,
        message: 'Daftar jadwal PMT berhasil diambil.',
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

  static async createJadwal(req, res, next) {
    try {
      const { balita_id, rencana_intervensi_id, tanggal, menu_id, jumlah_porsi = 1, status = 'terjadwal' } = req.body;

      if (!balita_id || !tanggal || !menu_id) {
        return res.status(400).json({ success: false, message: 'Balita, tanggal, dan menu wajib diisi.' });
      }

      const balita = await Balita.findByPk(balita_id);
      if (!balita) {
        return res.status(404).json({ success: false, message: 'Balita tidak ditemukan.' });
      }

      const jadwal = await JadwalPmt.create({
        balita_id,
        rencana_intervensi_id: rencana_intervensi_id || null,
        tanggal,
        menu_id,
        jumlah_porsi,
        status
      });

      await logActivity(req, 'TAMBAH_JADWAL_PMT', 'PMT', `Membuat jadwal PMT untuk ${balita.nama} pada tanggal ${tanggal}.`);

      return res.status(201).json({
        success: true,
        message: 'Jadwal PMT berhasil dibuat.',
        data: jadwal
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateJadwal(req, res, next) {
    try {
      const { id } = req.params;
      const { tanggal, menu_id, jumlah_porsi, status } = req.body;

      const jadwal = await JadwalPmt.findByPk(id);
      if (!jadwal) {
        return res.status(404).json({ success: false, message: 'Jadwal PMT tidak ditemukan.' });
      }

      if (tanggal) jadwal.tanggal = tanggal;
      if (menu_id) jadwal.menu_id = menu_id;
      if (jumlah_porsi) jadwal.jumlah_porsi = jumlah_porsi;
      if (status) jadwal.status = status;

      await jadwal.save();
      await logActivity(req, 'UBAH_JADWAL_PMT', 'PMT', `Mengubah jadwal PMT ID #${jadwal.id}.`);

      return res.json({
        success: true,
        message: 'Jadwal PMT berhasil diperbarui.',
        data: jadwal
      });
    } catch (err) {
      next(err);
    }
  }

  static async catatKonsumsi(req, res, next) {
    try {
      const { jadwal_pmt_id, porsi_dihabiskan, catatan, tanggal } = req.body;

      if (!jadwal_pmt_id || !porsi_dihabiskan) {
        return res.status(400).json({ success: false, message: 'Jadwal PMT dan status porsi wajib diisi.' });
      }

      const jadwal = await JadwalPmt.findByPk(jadwal_pmt_id, {
        include: [{ model: Balita, as: 'balita' }]
      });

      if (!jadwal) {
        return res.status(404).json({ success: false, message: 'Jadwal PMT tidak ditemukan.' });
      }

      let konsumsi = await KonsumsiPmt.findOne({ where: { jadwal_pmt_id } });

      if (konsumsi) {
        konsumsi.porsi_dihabiskan = porsi_dihabiskan;
        if (catatan !== undefined) konsumsi.catatan = catatan;
        if (tanggal) konsumsi.tanggal = tanggal;
        konsumsi.dicatat_oleh = req.user.id;
        await konsumsi.save();
      } else {
        konsumsi = await KonsumsiPmt.create({
          jadwal_pmt_id,
          balita_id: jadwal.balita_id,
          tanggal: tanggal || jadwal.tanggal,
          porsi_dihabiskan,
          catatan,
          dicatat_oleh: req.user.id
        });
      }

      // Update status jadwal menjadi 'diberikan'
      jadwal.status = porsi_dihabiskan === 'tidak' ? 'tidak_diberikan' : 'diberikan';
      await jadwal.save();

      await logActivity(
        req,
        'CATAT_KONSUMSI_PMT',
        'PMT',
        `Mencatat konsumsi PMT balita ${jadwal.balita?.nama} (${porsi_dihabiskan}).`
      );

      return res.json({
        success: true,
        message: 'Pencatatan konsumsi PMT berhasil disimpan.',
        data: konsumsi
      });
    } catch (err) {
      next(err);
    }
  }

  static async getComplianceSummary(req, res, next) {
    try {
      const { balita_id = '', posyandu_id = '' } = req.query;

      const where = {};
      if (balita_id) where.balita_id = balita_id;

      const balitaInclude = {
        model: Balita,
        as: 'balita',
        attributes: ['id', 'nama', 'wilayah_posyandu_id']
      };

      if (posyandu_id) {
        balitaInclude.where = { wilayah_posyandu_id: posyandu_id };
      }

      const records = await KonsumsiPmt.findAll({
        where,
        include: [balitaInclude]
      });

      const summary = {
        total: records.length,
        habis: 0,
        sebagian: 0,
        tidak: 0,
        persenKepatuhan: 0
      };

      records.forEach(r => {
        if (r.porsi_dihabiskan === 'habis') summary.habis++;
        else if (r.porsi_dihabiskan === 'sebagian') summary.sebagian++;
        else if (r.porsi_dihabiskan === 'tidak') summary.tidak++;
      });

      if (summary.total > 0) {
        summary.persenKepatuhan = Math.round(((summary.habis + summary.sebagian * 0.5) / summary.total) * 100);
      }

      return res.json({
        success: true,
        message: 'Ringkasan kepatuhan PMT berhasil diambil.',
        data: summary
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteJadwal(req, res, next) {
    try {
      const { id } = req.params;
      const jadwal = await JadwalPmt.findByPk(id);
      if (!jadwal) {
        return res.status(404).json({ success: false, message: 'Jadwal PMT tidak ditemukan.' });
      }

      await KonsumsiPmt.destroy({ where: { jadwal_pmt_id: id } });
      await jadwal.destroy();

      await logActivity(req, 'HAPUS_JADWAL_PMT', 'PMT', `Menghapus jadwal PMT ID #${id}.`);

      return res.json({
        success: true,
        message: 'Jadwal PMT berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PmtController;

