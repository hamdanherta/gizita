const { Op } = require('sequelize');
const { Balita, Pengukuran, StatusGizi, WilayahPosyandu, OrangTua } = require('../models');

class StatusGiziController {
  static async listStatusGizi(req, res, next) {
    try {
      const {
        posyandu_id = '',
        kategori_bbu = '',
        kategori_tbu = '',
        kategori_bbtb = '',
        status_final = '',
        search = '',
        perlu_perhatian = '',
        page = 1,
        limit = 10
      } = req.query;

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      const balitaWhere = { status_aktif: true };
      if (search) {
        balitaWhere[Op.or] = [
          { nama: { [Op.like]: `%${search}%` } },
          { nik: { [Op.like]: `%${search}%` } }
        ];
      }
      if (posyandu_id) {
        balitaWhere.wilayah_posyandu_id = posyandu_id;
      }

      // Ambil balita dengan pengukuran terakhir
      const balitas = await Balita.findAll({
        where: balitaWhere,
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] },
          { model: OrangTua, as: 'orangTua', attributes: ['id', 'nama_ibu', 'nama_ayah', 'no_hp'] },
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

      // Filter berdasarkan kriteria status gizi
      let filtered = balitas.map(b => {
        const lastP = b.pengukuranList && b.pengukuranList.length > 0 ? b.pengukuranList[0] : null;
        const lastSt = lastP ? lastP.statusGizi : null;

        const isAttention = lastSt ? !(
          lastSt.kategori_bbu === 'Berat badan normal' &&
          (lastSt.kategori_tbu === 'Normal' || lastSt.kategori_tbu === 'Tinggi') &&
          lastSt.kategori_bbtb === 'Gizi baik'
        ) : false;

        return {
          balita_id: b.id,
          nik: b.nik,
          nama: b.nama,
          jenis_kelamin: b.jenis_kelamin,
          tanggal_lahir: b.tanggal_lahir,
          posyandu: b.wilayahPosyandu?.nama_posyandu || '-',
          orang_tua: b.orangTua ? `${b.orangTua.nama_ibu} / ${b.orangTua.nama_ayah || '-'}` : '-',
          no_hp: b.orangTua?.no_hp || '-',
          pengukuran_terakhir: lastP ? {
            id: lastP.id,
            tanggal_ukur: lastP.tanggal_ukur,
            umur_bulan: lastP.umur_bulan,
            berat_badan: lastP.berat_badan,
            tinggi_badan: lastP.tinggi_badan,
            zscore_bbu: lastSt ? parseFloat(lastSt.zscore_bbu) : null,
            zscore_tbu: lastSt ? parseFloat(lastSt.zscore_tbu) : null,
            zscore_bbtb: lastSt ? parseFloat(lastSt.zscore_bbtb) : null,
            kategori_bbu: lastSt?.kategori_bbu || '-',
            kategori_tbu: lastSt?.kategori_tbu || '-',
            kategori_bbtb: lastSt?.kategori_bbtb || '-',
            status_final: lastSt?.status_final || 'Belum Diukur',
            perlu_perhatian: isAttention
          } : null
        };
      });

      // Apply filter
      if (kategori_bbu) {
        filtered = filtered.filter(f => f.pengukuran_terakhir?.kategori_bbu === kategori_bbu);
      }
      if (kategori_tbu) {
        filtered = filtered.filter(f => f.pengukuran_terakhir?.kategori_tbu === kategori_tbu);
      }
      if (kategori_bbtb) {
        filtered = filtered.filter(f => f.pengukuran_terakhir?.kategori_bbtb === kategori_bbtb);
      }
      if (status_final) {
        filtered = filtered.filter(f => f.pengukuran_terakhir?.status_final === status_final);
      }
      if (perlu_perhatian === 'true') {
        filtered = filtered.filter(f => f.pengukuran_terakhir?.perlu_perhatian === true);
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + parseInt(limit, 10));

      return res.json({
        success: true,
        message: 'Daftar status gizi balita berhasil diambil.',
        data: {
          items: paginated,
          total,
          page: parseInt(page, 10),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSummaryCategories(req, res, next) {
    try {
      const { posyandu_id = '' } = req.query;
      const where = { status_aktif: true };
      if (posyandu_id) where.wilayah_posyandu_id = posyandu_id;

      const balitas = await Balita.findAll({
        where,
        include: [
          {
            model: Pengukuran,
            as: 'pengukuranList',
            limit: 1,
            order: [['tanggal_ukur', 'DESC']],
            include: [{ model: StatusGizi, as: 'statusGizi' }]
          }
        ]
      });

      const stats = {
        totalBalita: balitas.length,
        perluPerhatian: 0,
        bbu: { normal: 0, kurang: 0, sangatKurang: 0, risikoLebih: 0 },
        tbu: { normal: 0, pendek: 0, sangatPendek: 0, tinggi: 0 },
        bbtb: { giziBaik: 0, giziKurang: 0, giziBuruk: 0, risikoLebih: 0, giziLebih: 0, obesitas: 0 }
      };

      balitas.forEach(b => {
        const lastP = b.pengukuranList?.[0];
        const st = lastP?.statusGizi;
        if (!st) return;

        // BBU
        if (st.kategori_bbu === 'Berat badan normal') stats.bbu.normal++;
        else if (st.kategori_bbu === 'Berat badan kurang') stats.bbu.kurang++;
        else if (st.kategori_bbu === 'Berat badan sangat kurang') stats.bbu.sangatKurang++;
        else if (st.kategori_bbu === 'Risiko berat badan lebih') stats.bbu.risikoLebih++;

        // TBU
        if (st.kategori_tbu === 'Normal') stats.tbu.normal++;
        else if (st.kategori_tbu === 'Pendek') stats.tbu.pendek++;
        else if (st.kategori_tbu === 'Sangat pendek') stats.tbu.sangatPendek++;
        else if (st.kategori_tbu === 'Tinggi') stats.tbu.tinggi++;

        // BBTB
        if (st.kategori_bbtb === 'Gizi baik') stats.bbtb.giziBaik++;
        else if (st.kategori_bbtb === 'Gizi kurang') stats.bbtb.giziKurang++;
        else if (st.kategori_bbtb === 'Gizi buruk') stats.bbtb.giziBuruk++;
        else if (st.kategori_bbtb === 'Berisiko gizi lebih') stats.bbtb.risikoLebih++;
        else if (st.kategori_bbtb === 'Gizi lebih') stats.bbtb.giziLebih++;
        else if (st.kategori_bbtb === 'Obesitas') stats.bbtb.obesitas++;

        const isAtt = !(
          st.kategori_bbu === 'Berat badan normal' &&
          (st.kategori_tbu === 'Normal' || st.kategori_tbu === 'Tinggi') &&
          st.kategori_bbtb === 'Gizi baik'
        );
        if (isAtt) stats.perluPerhatian++;
      });

      return res.json({
        success: true,
        message: 'Ringkasan kategori status gizi berhasil diambil.',
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = StatusGiziController;

