const { Pengukuran, StatusGizi, Balita, WilayahPosyandu, User } = require('../models');
const ZscoreService = require('../services/zscoreService');
const NotificationService = require('./../services/notificationService');
const { logActivity } = require('../middlewares/activityLogger');

class PengukuranController {
  static async previewCalculation(req, res, next) {
    try {
      const { balita_id, tanggal_ukur, berat_badan, tinggi_badan, cara_ukur = 'terlentang' } = req.body;

      if (!balita_id || !tanggal_ukur || !berat_badan || !tinggi_badan) {
        return res.status(400).json({ success: false, message: 'Balita, tanggal ukur, BB, dan TB wajib diisi.' });
      }

      const balita = await Balita.findByPk(balita_id);
      if (!balita) {
        return res.status(404).json({ success: false, message: 'Balita tidak ditemukan.' });
      }

      const analysis = ZscoreService.analyzeMeasurement({
        tanggalLahir: balita.tanggal_lahir,
        tanggalUkur: tanggal_ukur,
        jenisKelamin: balita.jenis_kelamin,
        beratBadan: parseFloat(berat_badan),
        tinggiBadan: parseFloat(tinggi_badan),
        caraUkur
      });

      return res.json({
        success: true,
        message: 'Kalkulasi status gizi berhasil.',
        data: analysis
      });
    } catch (err) {
      next(err);
    }
  }

  static async createPengukuran(req, res, next) {
    try {
      const {
        balita_id,
        tanggal_ukur,
        berat_badan,
        tinggi_badan,
        cara_ukur = 'terlentang',
        lingkar_kepala,
        lila,
        posyandu_id,
        catatan
      } = req.body;

      if (!balita_id || !tanggal_ukur || !berat_badan || !tinggi_badan) {
        return res.status(400).json({
          success: false,
          message: 'Data balita, tanggal ukur, berat badan, dan tinggi badan wajib diisi.'
        });
      }

      const balita = await Balita.findByPk(balita_id, {
        include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu' }]
      });

      if (!balita) {
        return res.status(404).json({ success: false, message: 'Balita tidak ditemukan.' });
      }

      // Analisis Status Gizi dengan Z-Score WHO & Permenkes No. 2 Tahun 2020
      const analysis = ZscoreService.analyzeMeasurement({
        tanggalLahir: balita.tanggal_lahir,
        tanggalUkur: tanggal_ukur,
        jenisKelamin: balita.jenis_kelamin,
        beratBadan: parseFloat(berat_badan),
        tinggiBadan: parseFloat(tinggi_badan),
        caraUkur
      });

      // Simpan Pengukuran
      const pengukuran = await Pengukuran.create({
        balita_id,
        tanggal_ukur,
        umur_bulan: analysis.umurBulan,
        berat_badan: parseFloat(berat_badan),
        tinggi_badan: parseFloat(tinggi_badan),
        cara_ukur,
        lingkar_kepala: lingkar_kepala ? parseFloat(lingkar_kepala) : null,
        lila: lila ? parseFloat(lila) : null,
        petugas_id: req.user.id,
        posyandu_id: posyandu_id || balita.wilayah_posyandu_id,
        catatan: catatan || null
      });

      // Simpan Status Gizi
      const statusGizi = await StatusGizi.create({
        pengukuran_id: pengukuran.id,
        balita_id,
        zscore_bbu: analysis.zscoreBBU,
        zscore_tbu: analysis.zscoreTBU,
        zscore_bbtb: analysis.zscoreBBTB,
        kategori_bbu: analysis.kategoriBBU,
        kategori_tbu: analysis.kategoriTBU,
        kategori_bbtb: analysis.kategoriBBTB,
        status_final: analysis.statusFinal
      });

      // Jika status gizi bermasalah, kirim notifikasi ke semua dokter!
      if (analysis.perluPerhatian) {
        await NotificationService.notifyNutritionAlert({
          balita,
          statusFinal: analysis.statusFinal,
          pengukuranId: pengukuran.id
        });
      }

      await logActivity(
        req,
        'INPUT_PENGUKURAN',
        'PENGUKURAN',
        `Input pengukuran balita ${balita.nama} (BB: ${berat_badan} kg, TB: ${tinggi_badan} cm, Status: ${analysis.statusFinal}).`
      );

      return res.status(201).json({
        success: true,
        message: 'Pengukuran dan status gizi berhasil disimpan.',
        data: {
          pengukuran,
          status_gizi: statusGizi,
          analisis: analysis
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async listByBalita(req, res, next) {
    try {
      const { balitaId } = req.params;
      const list = await Pengukuran.findAll({
        where: { balita_id: balitaId },
        include: [
          { model: StatusGizi, as: 'statusGizi' },
          { model: User, as: 'petugas', attributes: ['id', 'nama'] },
          { model: WilayahPosyandu, as: 'posyandu', attributes: ['id', 'nama_posyandu'] }
        ],
        order: [['tanggal_ukur', 'DESC']]
      });

      return res.json({
        success: true,
        message: 'Riwayat pengukuran balita berhasil diambil.',
        data: list
      });
    } catch (err) {
      next(err);
    }
  }

  static async updatePengukuran(req, res, next) {
    try {
      const { id } = req.params;
      const {
        tanggal_ukur,
        berat_badan,
        tinggi_badan,
        cara_ukur,
        lingkar_kepala,
        lila,
        catatan
      } = req.body;

      const pengukuran = await Pengukuran.findByPk(id, {
        include: [{ model: Balita, as: 'balita' }, { model: StatusGizi, as: 'statusGizi' }]
      });

      if (!pengukuran) {
        return res.status(404).json({ success: false, message: 'Data pengukuran tidak ditemukan.' });
      }

      const balita = pengukuran.balita;

      if (tanggal_ukur) pengukuran.tanggal_ukur = tanggal_ukur;
      if (berat_badan) pengukuran.berat_badan = parseFloat(berat_badan);
      if (tinggi_badan) pengukuran.tinggi_badan = parseFloat(tinggi_badan);
      if (cara_ukur) pengukuran.cara_ukur = cara_ukur;
      if (lingkar_kepala !== undefined) pengukuran.lingkar_kepala = lingkar_kepala ? parseFloat(lingkar_kepala) : null;
      if (lila !== undefined) pengukuran.lila = lila ? parseFloat(lila) : null;
      if (catatan !== undefined) pengukuran.catatan = catatan;

      // Hitung ulang z-score
      const analysis = ZscoreService.analyzeMeasurement({
        tanggalLahir: balita.tanggal_lahir,
        tanggalUkur: pengukuran.tanggal_ukur,
        jenisKelamin: balita.jenis_kelamin,
        beratBadan: pengukuran.berat_badan,
        tinggiBadan: pengukuran.tinggi_badan,
        caraUkur: pengukuran.cara_ukur
      });

      pengukuran.umur_bulan = analysis.umurBulan;
      await pengukuran.save();

      // Perbarui status gizi
      if (pengukuran.statusGizi) {
        pengukuran.statusGizi.zscore_bbu = analysis.zscoreBBU;
        pengukuran.statusGizi.zscore_tbu = analysis.zscoreTBU;
        pengukuran.statusGizi.zscore_bbtb = analysis.zscoreBBTB;
        pengukuran.statusGizi.kategori_bbu = analysis.kategoriBBU;
        pengukuran.statusGizi.kategori_tbu = analysis.kategoriTBU;
        pengukuran.statusGizi.kategori_bbtb = analysis.kategoriBBTB;
        pengukuran.statusGizi.status_final = analysis.statusFinal;
        await pengukuran.statusGizi.save();
      }

      await logActivity(req, 'UBAH_PENGUKURAN', 'PENGUKURAN', `Memperbarui pengukuran balita ${balita.nama}.`);

      return res.json({
        success: true,
        message: 'Pengukuran berhasil diperbarui.',
        data: {
          pengukuran,
          status_gizi: pengukuran.statusGizi,
          analisis: analysis
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deletePengukuran(req, res, next) {
    try {
      const { id } = req.params;
      const pengukuran = await Pengukuran.findByPk(id, {
        include: [{ model: Balita, as: 'balita' }]
      });

      if (!pengukuran) {
        return res.status(404).json({ success: false, message: 'Data pengukuran tidak ditemukan.' });
      }

      // Hapus status gizi terkait terlebih dahulu
      await StatusGizi.destroy({ where: { pengukuran_id: id } });
      await pengukuran.destroy();

      await logActivity(req, 'HAPUS_PENGUKURAN', 'PENGUKURAN', `Menghapus data pengukuran balita ${pengukuran.balita?.nama}.`);

      return res.json({
        success: true,
        message: 'Data pengukuran berhasil dihapus.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PengukuranController;

