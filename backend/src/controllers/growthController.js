const whoStandards = require('who-growth-standards');
const { Balita, Pengukuran, StatusGizi, WilayahPosyandu } = require('../models');

class GrowthController {
  static async getKmsChartData(req, res, next) {
    try {
      const { balitaId } = req.params;
      const { indicator = 'BBU' } = req.query; // BBU, TBU, BBTB

      const balita = await Balita.findByPk(balitaId, {
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] },
          {
            model: Pengukuran,
            as: 'pengukuranList',
            include: [{ model: StatusGizi, as: 'statusGizi' }],
            order: [['tanggal_ukur', 'ASC']]
          }
        ]
      });

      if (!balita) {
        return res.status(404).json({ success: false, message: 'Balita tidak ditemukan.' });
      }

      const sex = balita.jenis_kelamin === 'L' ? 'male' : 'female';
      const curves = [];
      const actualPoints = [];

      if (indicator === 'BBU') {
        // Berat Badan menurut Umur (0 - 60 bulan)
        for (let month = 0; month <= 60; month++) {
          const days = Math.min(Math.round(month * 30.4375), 1856);
          curves.push({
            month,
            sdNeg3: Math.round(whoStandards.valueAtZScore('wfa', sex, -3, days) * 100) / 100,
            sdNeg2: Math.round(whoStandards.valueAtZScore('wfa', sex, -2, days) * 100) / 100,
            median: Math.round(whoStandards.valueAtZScore('wfa', sex, 0, days) * 100) / 100,
            sdPos1: Math.round(whoStandards.valueAtZScore('wfa', sex, 1, days) * 100) / 100,
            sdPos2: Math.round(whoStandards.valueAtZScore('wfa', sex, 2, days) * 100) / 100,
            sdPos3: Math.round(whoStandards.valueAtZScore('wfa', sex, 3, days) * 100) / 100
          });
        }

        balita.pengukuranList.forEach(p => {
          actualPoints.push({
            month: p.umur_bulan,
            actual: parseFloat(p.berat_badan),
            tanggal_ukur: p.tanggal_ukur,
            zscore: p.statusGizi ? parseFloat(p.statusGizi.zscore_bbu) : null,
            kategori: p.statusGizi?.kategori_bbu || '-'
          });
        });
      } else if (indicator === 'TBU') {
        // Tinggi / Panjang Badan menurut Umur (0 - 60 bulan)
        for (let month = 0; month <= 60; month++) {
          const days = Math.min(Math.round(month * 30.4375), 1856);
          curves.push({
            month,
            sdNeg3: Math.round(whoStandards.valueAtZScore('lhfa', sex, -3, days) * 10) / 10,
            sdNeg2: Math.round(whoStandards.valueAtZScore('lhfa', sex, -2, days) * 10) / 10,
            median: Math.round(whoStandards.valueAtZScore('lhfa', sex, 0, days) * 10) / 10,
            sdPos1: Math.round(whoStandards.valueAtZScore('lhfa', sex, 1, days) * 10) / 10,
            sdPos2: Math.round(whoStandards.valueAtZScore('lhfa', sex, 2, days) * 10) / 10,
            sdPos3: Math.round(whoStandards.valueAtZScore('lhfa', sex, 3, days) * 10) / 10
          });
        }

        balita.pengukuranList.forEach(p => {
          actualPoints.push({
            month: p.umur_bulan,
            actual: parseFloat(p.tinggi_badan),
            tanggal_ukur: p.tanggal_ukur,
            zscore: p.statusGizi ? parseFloat(p.statusGizi.zscore_tbu) : null,
            kategori: p.statusGizi?.kategori_tbu || '-'
          });
        });
      } else if (indicator === 'BBTB') {
        // Berat Badan menurut Tinggi/Panjang Badan (45 - 120 cm)
        for (let cm = 45; cm <= 120; cm++) {
          let ind = cm < 85 ? 'wfl' : 'wfh';
          curves.push({
            height: cm,
            sdNeg3: Math.round(whoStandards.valueAtZScore(ind, sex, -3, cm) * 100) / 100,
            sdNeg2: Math.round(whoStandards.valueAtZScore(ind, sex, -2, cm) * 100) / 100,
            median: Math.round(whoStandards.valueAtZScore(ind, sex, 0, cm) * 100) / 100,
            sdPos1: Math.round(whoStandards.valueAtZScore(ind, sex, 1, cm) * 100) / 100,
            sdPos2: Math.round(whoStandards.valueAtZScore(ind, sex, 2, cm) * 100) / 100,
            sdPos3: Math.round(whoStandards.valueAtZScore(ind, sex, 3, cm) * 100) / 100
          });
        }

        balita.pengukuranList.forEach(p => {
          actualPoints.push({
            height: Math.round(parseFloat(p.tinggi_badan) * 10) / 10,
            actual: parseFloat(p.berat_badan),
            tanggal_ukur: p.tanggal_ukur,
            zscore: p.statusGizi ? parseFloat(p.statusGizi.zscore_bbtb) : null,
            kategori: p.statusGizi?.kategori_bbtb || '-'
          });
        });
      }

      return res.json({
        success: true,
        message: 'Data grafik pertumbuhan KMS berhasil diambil.',
        data: {
          balita: {
            id: balita.id,
            nama: balita.nama,
            nik: balita.nik,
            jenis_kelamin: balita.jenis_kelamin,
            tanggal_lahir: balita.tanggal_lahir,
            posyandu: balita.wilayahPosyandu?.nama_posyandu
          },
          indicator,
          curves,
          actualPoints,
          riwayatPengukuran: balita.pengukuranList
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GrowthController;

