const { Op } = require('sequelize');
const {
  Balita,
  OrangTua,
  WilayahPosyandu,
  Pengukuran,
  StatusGizi,
  RencanaIntervensi,
  CatatanPemeriksaan,
  RekomendasiDokter,
  User,
  MenuMakanan
} = require('../models');
const { logActivity } = require('../middlewares/activityLogger');

class BalitaController {
  static async listBalita(req, res, next) {
    try {
      const {
        search = '',
        posyandu_id = '',
        status_gizi = '',
        jenis_kelamin = '',
        status_aktif = 'true',
        page = 1,
        limit = 10
      } = req.query;

      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const where = {};

      if (search) {
        where[Op.or] = [
          { nama: { [Op.like]: `%${search}%` } },
          { nik: { [Op.like]: `%${search}%` } }
        ];
      }
      if (posyandu_id) {
        where.wilayah_posyandu_id = posyandu_id;
      }
      if (jenis_kelamin) {
        where.jenis_kelamin = jenis_kelamin;
      }
      if (status_aktif !== '') {
        where.status_aktif = status_aktif === 'true' || status_aktif === '1';
      }

      const { count, rows } = await Balita.findAndCountAll({
        where,
        include: [
          {
            model: OrangTua,
            as: 'orangTua',
            attributes: ['id', 'nama_ibu', 'nama_ayah', 'no_hp', 'alamat']
          },
          {
            model: WilayahPosyandu,
            as: 'wilayahPosyandu',
            attributes: ['id', 'nama_posyandu', 'kelurahan_desa']
          },
          {
            model: Pengukuran,
            as: 'pengukuranList',
            limit: 1,
            order: [['tanggal_ukur', 'DESC']],
            include: [{ model: StatusGizi, as: 'statusGizi' }]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      // Filter status gizi jika ada filter parameter
      let formatted = rows.map(b => {
        const lastPengukuran = b.pengukuranList && b.pengukuranList.length > 0 ? b.pengukuranList[0] : null;
        const lastStatus = lastPengukuran ? lastPengukuran.statusGizi : null;

        // Hitung umur sekarang
        const birth = new Date(b.tanggal_lahir);
        const now = new Date();
        const days = Math.floor((now - birth) / (1000 * 60 * 60 * 24));
        const umurBulanSekarang = Math.floor(days / 30.4375);

        return {
          id: b.id,
          nik: b.nik,
          nama: b.nama,
          jenis_kelamin: b.jenis_kelamin,
          tanggal_lahir: b.tanggal_lahir,
          berat_lahir: b.berat_lahir,
          panjang_lahir: b.panjang_lahir,
          anak_ke: b.anak_ke,
          status_aktif: b.status_aktif,
          wilayah_posyandu: b.wilayahPosyandu,
          orang_tua: b.orangTua,
          umur_bulan_sekarang: umurBulanSekarang,
          pengukuran_terakhir: lastPengukuran ? {
            id: lastPengukuran.id,
            tanggal_ukur: lastPengukuran.tanggal_ukur,
            umur_bulan: lastPengukuran.umur_bulan,
            berat_badan: lastPengukuran.berat_badan,
            tinggi_badan: lastPengukuran.tinggi_badan,
            status_gizi: lastStatus ? {
              zscore_bbu: lastStatus.zscore_bbu,
              zscore_tbu: lastStatus.zscore_tbu,
              zscore_bbtb: lastStatus.zscore_bbtb,
              kategori_bbu: lastStatus.kategori_bbu,
              kategori_tbu: lastStatus.kategori_tbu,
              kategori_bbtb: lastStatus.kategori_bbtb,
              status_final: lastStatus.status_final
            } : null
          } : null
        };
      });

      if (status_gizi) {
        formatted = formatted.filter(item => {
          const st = item.pengukuran_terakhir?.status_gizi?.status_final;
          return st && st.toLowerCase().includes(status_gizi.toLowerCase());
        });
      }

      return res.json({
        success: true,
        message: 'Daftar balita berhasil diambil.',
        data: {
          balita: formatted,
          total: count,
          page: parseInt(page, 10),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getBalitaDetail(req, res, next) {
    try {
      const { id } = req.params;

      const balita = await Balita.findByPk(id, {
        include: [
          { model: OrangTua, as: 'orangTua' },
          { model: WilayahPosyandu, as: 'wilayahPosyandu' },
          {
            model: Pengukuran,
            as: 'pengukuranList',
            include: [
              { model: StatusGizi, as: 'statusGizi' },
              { model: User, as: 'petugas', attributes: ['id', 'nama'] }
            ],
            order: [['tanggal_ukur', 'ASC']]
          },
          {
            model: RencanaIntervensi,
            as: 'intervensiList',
            include: [{ model: User, as: 'pembuat', attributes: ['id', 'nama'] }],
            order: [['created_at', 'DESC']]
          },
          {
            model: CatatanPemeriksaan,
            as: 'pemeriksaanList',
            include: [{ model: User, as: 'dokter', attributes: ['id', 'nama'] }],
            order: [['tanggal', 'DESC']]
          },
          {
            model: RekomendasiDokter,
            as: 'rekomendasiList',
            include: [{ model: User, as: 'dokter', attributes: ['id', 'nama'] }],
            order: [['tanggal', 'DESC']]
          }
        ]
      });

      if (!balita) {
        return res.status(404).json({ success: false, message: 'Data balita tidak ditemukan.' });
      }

      // Hitung umur bulan saat ini
      const birth = new Date(balita.tanggal_lahir);
      const now = new Date();
      const umurBulan = Math.floor((now - birth) / (1000 * 60 * 60 * 24 * 30.4375));

      return res.json({
        success: true,
        message: 'Detail balita berhasil diambil.',
        data: {
          ...balita.toJSON(),
          umur_bulan_sekarang: umurBulan
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async createBalita(req, res, next) {
    try {
      const {
        nama,
        nik,
        jenis_kelamin,
        tanggal_lahir,
        berat_lahir,
        panjang_lahir,
        anak_ke,
        orang_tua_id,
        wilayah_posyandu_id
      } = req.body;

      if (!nama || !jenis_kelamin || !tanggal_lahir || !wilayah_posyandu_id) {
        return res.status(400).json({
          success: false,
          message: 'Nama, jenis kelamin, tanggal lahir, dan posyandu wajib diisi.'
        });
      }

      if (nik) {
        const exist = await Balita.findOne({ where: { nik } });
        if (exist) {
          return res.status(400).json({ success: false, message: 'NIK balita sudah terdaftar.' });
        }
      }

      const balita = await Balita.create({
        nama,
        nik,
        jenis_kelamin,
        tanggal_lahir,
        berat_lahir: berat_lahir || null,
        panjang_lahir: panjang_lahir || null,
        anak_ke: anak_ke || 1,
        orang_tua_id: orang_tua_id || null,
        wilayah_posyandu_id,
        status_aktif: true
      });

      await logActivity(req, 'TAMBAH_BALITA', 'BALITA', `Menambahkan data balita: ${balita.nama}.`);

      return res.status(201).json({
        success: true,
        message: 'Data balita berhasil ditambahkan.',
        data: balita
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateBalita(req, res, next) {
    try {
      const { id } = req.params;
      const {
        nama,
        nik,
        jenis_kelamin,
        tanggal_lahir,
        berat_lahir,
        panjang_lahir,
        anak_ke,
        orang_tua_id,
        wilayah_posyandu_id,
        status_aktif
      } = req.body;

      const balita = await Balita.findByPk(id);
      if (!balita) {
        return res.status(404).json({ success: false, message: 'Data balita tidak ditemukan.' });
      }

      if (nik && nik !== balita.nik) {
        const exist = await Balita.findOne({ where: { nik, id: { [Op.ne]: id } } });
        if (exist) {
          return res.status(400).json({ success: false, message: 'NIK balita sudah terdaftar pada data lain.' });
        }
        balita.nik = nik;
      }

      if (nama) balita.nama = nama;
      if (jenis_kelamin) balita.jenis_kelamin = jenis_kelamin;
      if (tanggal_lahir) balita.tanggal_lahir = tanggal_lahir;
      if (berat_lahir !== undefined) balita.berat_lahir = berat_lahir;
      if (panjang_lahir !== undefined) balita.panjang_lahir = panjang_lahir;
      if (anak_ke !== undefined) balita.anak_ke = anak_ke;
      if (orang_tua_id !== undefined) balita.orang_tua_id = orang_tua_id;
      if (wilayah_posyandu_id !== undefined) balita.wilayah_posyandu_id = wilayah_posyandu_id;
      if (status_aktif !== undefined) balita.status_aktif = status_aktif;

      await balita.save();
      await logActivity(req, 'UBAH_BALITA', 'BALITA', `Memperbarui data balita: ${balita.nama}.`);

      return res.json({
        success: true,
        message: 'Data balita berhasil diperbarui.',
        data: balita
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteBalita(req, res, next) {
    try {
      const { id } = req.params;
      const balita = await Balita.findByPk(id);
      if (!balita) {
        return res.status(404).json({ success: false, message: 'Data balita tidak ditemukan.' });
      }

      // Aman: hapus jika tidak ada relasi atau cascade
      await balita.destroy();
      await logActivity(req, 'HAPUS_BALITA', 'BALITA', `Menghapus data balita: ${balita.nama}.`);

      return res.json({
        success: true,
        message: 'Data balita berhasil dihapus.'
      });
    } catch (err) {
      if (err.name === 'SequelizeForeignKeyConstraintError') {
        const balita = await Balita.findByPk(req.params.id);
        if (balita) {
          balita.status_aktif = false;
          await balita.save();
          return res.json({
            success: true,
            message: 'Balita memiliki riwayat pemeriksaan, status balita diubah menjadi NONAKTIF.'
          });
        }
      }
      next(err);
    }
  }
}

module.exports = BalitaController;

