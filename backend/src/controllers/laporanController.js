const { Op } = require('sequelize');
const {
  Balita,
  Pengukuran,
  StatusGizi,
  WilayahPosyandu,
  OrangTua,
  JadwalPmt,
  KonsumsiPmt,
  MenuMakanan,
  JadwalPosyandu,
  KunjunganPosyandu,
  Puskesmas
} = require('../models');
const ReportService = require('../services/reportService');
const { logActivity } = require('../middlewares/activityLogger');

class LaporanController {
  static async getReportData({ jenis, posyandu_id, bulan, tahun, tgl_mulai, tgl_selesai }) {
    const puskesmas = await Puskesmas.findOne();
    let posyanduName = 'Semua Posyandu';
    if (posyandu_id) {
      const pos = await WilayahPosyandu.findByPk(posyandu_id);
      if (pos) posyanduName = pos.nama_posyandu;
    }

    const filterInfo = `${posyanduName} | Periode: ${bulan ? `Bulan ${bulan}/${tahun}` : (tgl_mulai ? `${tgl_mulai} s.d ${tgl_selesai}` : 'Semua')}`;

    if (jenis === 'rekap_status_gizi') {
      const balitaWhere = { status_aktif: true };
      if (posyandu_id) balitaWhere.wilayah_posyandu_id = posyandu_id;

      const balitas = await Balita.findAll({
        where: balitaWhere,
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu' },
          {
            model: Pengukuran,
            as: 'pengukuranList',
            limit: 1,
            order: [['tanggal_ukur', 'DESC']],
            include: [{ model: StatusGizi, as: 'statusGizi' }]
          }
        ],
        order: [['nama', 'ASC']]
      });

      const headers = [
        { key: '_no', label: 'No', width: 6 },
        { key: 'nama', label: 'Nama Balita', width: 22, align: 'left' },
        { key: 'jk', label: 'JK', width: 8 },
        { key: 'posyandu', label: 'Posyandu', width: 18, align: 'left' },
        { key: 'tgl_ukur', label: 'Tgl Ukur', width: 14 },
        { key: 'umur', label: 'Umur (bln)', width: 12 },
        { key: 'bb', label: 'BB (kg)', width: 10 },
        { key: 'tb', label: 'TB (cm)', width: 10 },
        { key: 'z_bbu', label: 'Z BB/U', width: 10 },
        { key: 'kat_bbu', label: 'Kategori BB/U', width: 20 },
        { key: 'z_tbu', label: 'Z TB/U', width: 10 },
        { key: 'kat_tbu', label: 'Kategori TB/U', width: 18 },
        { key: 'z_bbtb', label: 'Z BB/TB', width: 10 },
        { key: 'kat_bbtb', label: 'Kategori BB/TB', width: 18 },
        { key: 'status_final', label: 'Status Final', width: 22, isStatus: true }
      ];

      const rows = balitas.map(b => {
        const p = b.pengukuranList?.[0];
        const s = p?.statusGizi;
        return {
          nama: b.nama,
          jk: b.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
          posyandu: b.wilayahPosyandu?.nama_posyandu || '-',
          tgl_ukur: p?.tanggal_ukur || '-',
          umur: p?.umur_bulan ?? '-',
          bb: p?.berat_badan ?? '-',
          tb: p?.tinggi_badan ?? '-',
          z_bbu: s?.zscore_bbu ?? '-',
          kat_bbu: s?.kategori_bbu ?? '-',
          z_tbu: s?.zscore_tbu ?? '-',
          kat_tbu: s?.kategori_tbu ?? '-',
          z_bbtb: s?.zscore_bbtb ?? '-',
          kat_bbtb: s?.kategori_bbtb ?? '-',
          status_final: s?.status_final ?? 'Belum Diukur'
        };
      });

      return {
        title: 'Rekapitulasi Pemantauan Status Gizi Balita',
        headers,
        rows,
        puskesmasInfo: puskesmas,
        filterInfo
      };
    }

    if (jenis === 'balita_bermasalah') {
      const balitaWhere = { status_aktif: true };
      if (posyandu_id) balitaWhere.wilayah_posyandu_id = posyandu_id;

      const balitas = await Balita.findAll({
        where: balitaWhere,
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu' },
          { model: OrangTua, as: 'orangTua' },
          {
            model: Pengukuran,
            as: 'pengukuranList',
            limit: 1,
            order: [['tanggal_ukur', 'DESC']],
            include: [{ model: StatusGizi, as: 'statusGizi' }]
          }
        ],
        order: [['nama', 'ASC']]
      });

      const problematic = balitas.filter(b => {
        const s = b.pengukuranList?.[0]?.statusGizi;
        if (!s) return false;
        return !(
          s.kategori_bbu === 'Berat badan normal' &&
          (s.kategori_tbu === 'Normal' || s.kategori_tbu === 'Tinggi') &&
          s.kategori_bbtb === 'Gizi baik'
        );
      });

      const headers = [
        { key: '_no', label: 'No', width: 6 },
        { key: 'nama', label: 'Nama Balita', width: 22, align: 'left' },
        { key: 'nik', label: 'NIK Balita', width: 18 },
        { key: 'ibu', label: 'Nama Ibu', width: 18, align: 'left' },
        { key: 'no_hp', label: 'No HP Ortu', width: 16 },
        { key: 'posyandu', label: 'Posyandu', width: 18, align: 'left' },
        { key: 'bb', label: 'BB (kg)', width: 10 },
        { key: 'tb', label: 'TB (cm)', width: 10 },
        { key: 'status_final', label: 'Masalah Gizi', width: 24, isStatus: true },
        { key: 'rekomendasi', label: 'Tindak Lanjut', width: 26, align: 'left' }
      ];

      const rows = problematic.map(b => {
        const p = b.pengukuranList?.[0];
        const s = p?.statusGizi;
        return {
          nama: b.nama,
          nik: b.nik || '-',
          ibu: b.orangTua?.nama_ibu || '-',
          no_hp: b.orangTua?.no_hp || '-',
          posyandu: b.wilayahPosyandu?.nama_posyandu || '-',
          bb: p?.berat_badan ?? '-',
          tb: p?.tinggi_badan ?? '-',
          status_final: s?.status_final || '-',
          rekomendasi: 'PMT Pemulihan & Konseling Gizi'
        };
      });

      return {
        title: 'Daftar Balita Perlu Perhatian / Bermasalah Gizi',
        headers,
        rows,
        puskesmasInfo: puskesmas,
        filterInfo
      };
    }

    if (jenis === 'rekap_pmt') {
      const pmtWhere = {};
      if (tgl_mulai && tgl_selesai) {
        pmtWhere.tanggal = { [Op.between]: [tgl_mulai, tgl_selesai] };
      }

      const balitaInclude = {
        model: Balita,
        as: 'balita',
        include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu' }]
      };
      if (posyandu_id) {
        balitaInclude.where = { wilayah_posyandu_id: posyandu_id };
      }

      const items = await JadwalPmt.findAll({
        where: pmtWhere,
        include: [
          balitaInclude,
          { model: MenuMakanan, as: 'menu' },
          { model: KonsumsiPmt, as: 'konsumsi' }
        ],
        order: [['tanggal', 'DESC']]
      });

      const headers = [
        { key: '_no', label: 'No', width: 6 },
        { key: 'tanggal', label: 'Tanggal', width: 14 },
        { key: 'nama_balita', label: 'Nama Balita', width: 22, align: 'left' },
        { key: 'posyandu', label: 'Posyandu', width: 18, align: 'left' },
        { key: 'menu', label: 'Menu PMT', width: 26, align: 'left' },
        { key: 'kalori', label: 'Energi (kkal)', width: 14 },
        { key: 'protein', label: 'Protein (g)', width: 12 },
        { key: 'status_pemberian', label: 'Status Pemberian', width: 18 },
        { key: 'konsumsi', label: 'Konsumsi Balita', width: 18, isStatus: true }
      ];

      const rows = items.map(item => ({
        tanggal: item.tanggal,
        nama_balita: item.balita?.nama || '-',
        posyandu: item.balita?.wilayahPosyandu?.nama_posyandu || '-',
        menu: item.menu?.nama_menu || '-',
        kalori: item.menu?.energi_kkal || '-',
        protein: item.menu?.protein_g || '-',
        status_pemberian: item.status.toUpperCase(),
        konsumsi: item.konsumsi?.porsi_dihabiskan ? item.konsumsi.porsi_dihabiskan.toUpperCase() : 'BELUM DICATAT'
      }));

      return {
        title: 'Rekapitulasi Pemberian Makanan Tambahan (PMT)',
        headers,
        rows,
        puskesmasInfo: puskesmas,
        filterInfo
      };
    }

    if (jenis === 'rekap_kunjungan') {
      const posWhere = {};
      if (posyandu_id) posWhere.wilayah_posyandu_id = posyandu_id;
      if (tgl_mulai && tgl_selesai) {
        posWhere.tanggal = { [Op.between]: [tgl_mulai, tgl_selesai] };
      }

      const schedules = await JadwalPosyandu.findAll({
        where: posWhere,
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu' },
          {
            model: KunjunganPosyandu,
            as: 'kunjunganList',
            include: [
              { model: Balita, as: 'balita' },
              {
                model: Pengukuran,
                as: 'pengukuran',
                include: [{ model: StatusGizi, as: 'statusGizi' }]
              }
            ]
          }
        ],
        order: [['tanggal', 'DESC']]
      });

      const headers = [
        { key: '_no', label: 'No', width: 6 },
        { key: 'tanggal', label: 'Tanggal Posyandu', width: 16 },
        { key: 'posyandu', label: 'Posyandu', width: 20, align: 'left' },
        { key: 'lokasi', label: 'Lokasi Kegiatan', width: 22, align: 'left' },
        { key: 'balita', label: 'Nama Balita Hadir', width: 22, align: 'left' },
        { key: 'bb', label: 'BB (kg)', width: 10 },
        { key: 'tb', label: 'TB (cm)', width: 10 },
        { key: 'status_gizi', label: 'Status Gizi', width: 22, isStatus: true },
        { key: 'catatan', label: 'Catatan Kunjungan', width: 24, align: 'left' }
      ];

      const rows = [];
      schedules.forEach(sc => {
        if (!sc.kunjunganList || sc.kunjunganList.length === 0) {
          rows.push({
            tanggal: sc.tanggal,
            posyandu: sc.wilayahPosyandu?.nama_posyandu || '-',
            lokasi: sc.lokasi || '-',
            balita: '(Belum ada balita dicatat)',
            bb: '-',
            tb: '-',
            status_gizi: '-',
            catatan: sc.kegiatan || '-'
          });
        } else {
          sc.kunjunganList.forEach(k => {
            const p = k.pengukuran;
            const s = p?.statusGizi;
            rows.push({
              tanggal: sc.tanggal,
              posyandu: sc.wilayahPosyandu?.nama_posyandu || '-',
              lokasi: sc.lokasi || '-',
              balita: k.balita?.nama || '-',
              bb: p?.berat_badan ?? '-',
              tb: p?.tinggi_badan ?? '-',
              status_gizi: s?.status_final ?? 'Belum Diukur',
              catatan: k.catatan || '-'
            });
          });
        }
      });

      return {
        title: 'Rekapitulasi Kunjungan Posyandu',
        headers,
        rows,
        puskesmasInfo: puskesmas,
        filterInfo
      };
    }

    throw new Error('Jenis laporan tidak valid.');
  }

  static async preview(req, res, next) {
    try {
      const data = await LaporanController.getReportData(req.query);
      return res.json({
        success: true,
        message: 'Preview laporan berhasil dihasilkan.',
        data
      });
    } catch (err) {
      next(err);
    }
  }

  static async exportExcel(req, res, next) {
    try {
      const report = await LaporanController.getReportData(req.query);
      const buffer = await ReportService.generateExcel(report);

      await logActivity(req, 'CETAK_EXCEL', 'LAPORAN', `Mengunduh laporan Excel: ${report.title}.`);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Gizita-${req.query.jenis || 'Laporan'}-${Date.now()}.xlsx`);
      return res.send(buffer);
    } catch (err) {
      next(err);
    }
  }

  static async exportPdf(req, res, next) {
    try {
      const report = await LaporanController.getReportData(req.query);

      await logActivity(req, 'CETAK_PDF', 'LAPORAN', `Mengunduh laporan PDF: ${report.title}.`);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=Gizita-${req.query.jenis || 'Laporan'}-${Date.now()}.pdf`);
      return ReportService.generatePdf(report, res);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LaporanController;

