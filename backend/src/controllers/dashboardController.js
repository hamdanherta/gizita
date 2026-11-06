const { Op } = require('sequelize');
const {
  User,
  Balita,
  WilayahPosyandu,
  Pengukuran,
  StatusGizi,
  JadwalPosyandu,
  JadwalPmt,
  RencanaIntervensi,
  LogAktivitas,
  Notifikasi,
  Puskesmas
} = require('../models');

class DashboardController {
  static async getStats(req, res, next) {
    try {
      const user = req.user;
      const role = user.role;

      // 1. Data Umum
      const totalBalita = await Balita.count({ where: { status_aktif: true } });
      const totalPosyandu = await WilayahPosyandu.count();
      const totalPengguna = await User.count({ where: { status_aktif: true } });
      const totalIntervensi = await RencanaIntervensi.count({ where: { status: 'berjalan' } });

      // 2. Data Balita & Status Gizi Terkini
      const allBalita = await Balita.findAll({
        where: { status_aktif: true },
        include: [
          { model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] },
          {
            model: Pengukuran,
            as: 'pengukuranList',
            limit: 1,
            order: [['tanggal_ukur', 'DESC']],
            include: [{ model: StatusGizi, as: 'statusGizi' }]
          }
        ]
      });

      const giziCounts = {
        giziBaik: 0,
        giziKurang: 0,
        giziBuruk: 0,
        stunting: 0,
        stuntingBerat: 0,
        obesitas: 0,
        giziLebih: 0,
        beratBadanKurang: 0
      };

      const balitaPerluPerhatian = [];

      allBalita.forEach(b => {
        const lastP = b.pengukuranList?.[0];
        const st = lastP?.statusGizi;
        if (!st) return;

        // Klasifikasi status final
        if (st.kategori_bbtb === 'Gizi buruk') giziCounts.giziBuruk++;
        else if (st.kategori_bbtb === 'Gizi kurang') giziCounts.giziKurang++;
        else if (st.kategori_bbtb === 'Obesitas') giziCounts.obesitas++;
        else if (st.kategori_bbtb === 'Gizi lebih' || st.kategori_bbtb === 'Berisiko gizi lebih') giziCounts.giziLebih++;
        else giziCounts.giziBaik++;

        if (st.kategori_tbu === 'Sangat pendek') giziCounts.stuntingBerat++;
        else if (st.kategori_tbu === 'Pendek') giziCounts.stunting++;

        if (st.kategori_bbu === 'Berat badan kurang' || st.kategori_bbu === 'Berat badan sangat kurang') {
          giziCounts.beratBadanKurang++;
        }

        const isAttention = !(
          st.kategori_bbu === 'Berat badan normal' &&
          (st.kategori_tbu === 'Normal' || st.kategori_tbu === 'Tinggi') &&
          st.kategori_bbtb === 'Gizi baik'
        );

        if (isAttention) {
          balitaPerluPerhatian.push({
            id: b.id,
            nama: b.nama,
            nik: b.nik,
            jenis_kelamin: b.jenis_kelamin,
            posyandu: b.wilayahPosyandu?.nama_posyandu || '-',
            umur_bulan: lastP.umur_bulan,
            berat_badan: lastP.berat_badan,
            tinggi_badan: lastP.tinggi_badan,
            tanggal_ukur: lastP.tanggal_ukur,
            status_final: st.status_final,
            kategori_bbtb: st.kategori_bbtb,
            kategori_tbu: st.kategori_tbu,
            kategori_bbu: st.kategori_bbu
          });
        }
      });

      // 3. Jadwal Posyandu Mendatang (7 hari ke depan atau terdekat)
      const jadwalPosyanduTerdekat = await JadwalPosyandu.findAll({
        where: {
          tanggal: { [Op.gte]: new Date().toISOString().split('T')[0] },
          status: 'terjadwal'
        },
        include: [{ model: WilayahPosyandu, as: 'wilayahPosyandu', attributes: ['id', 'nama_posyandu'] }],
        order: [['tanggal', 'ASC']],
        limit: 5
      });

      // 4. Jadwal PMT Terdekat
      const jadwalPmtTerdekat = await JadwalPmt.findAll({
        where: {
          tanggal: { [Op.gte]: new Date().toISOString().split('T')[0] },
          status: 'terjadwal'
        },
        include: [{ model: Balita, as: 'balita', attributes: ['id', 'nama'] }],
        order: [['tanggal', 'ASC']],
        limit: 5
      });

      // 5. Aktivitas Terbaru (untuk Admin)
      const aktivitasTerbaru = await LogAktivitas.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'nama', 'role'] }],
        order: [['created_at', 'DESC']],
        limit: 6
      });

      // 6. Notifikasi Belum Dibaca (untuk User aktif)
      const notifikasiTerbaru = await Notifikasi.findAll({
        where: { user_id: user.id },
        order: [['created_at', 'DESC']],
        limit: 5
      });

      return res.json({
        success: true,
        message: 'Data dashboard berhasil diambil.',
        data: {
          role,
          ringkasan: {
            totalBalita,
            totalPosyandu,
            totalPengguna,
            totalIntervensi,
            totalPerluPerhatian: balitaPerluPerhatian.length
          },
          giziCounts,
          balitaPerluPerhatian: balitaPerluPerhatian.slice(0, 10),
          jadwalPosyanduTerdekat,
          jadwalPmtTerdekat,
          aktivitasTerbaru,
          notifikasiTerbaru
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = DashboardController;

