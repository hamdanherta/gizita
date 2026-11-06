import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Baby, Plus, Search, Filter, Eye, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';

const BalitaList = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [balitas, setBalitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posyanduList, setPosyanduList] = useState([]);
  const [orangTuaList, setOrangTuaList] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [posyanduId, setPosyanduId] = useState('');
  const [statusGizi, setStatusGizi] = useState('');
  const [gender, setGender] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBalita, setSelectedBalita] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    berat_lahir: '',
    panjang_lahir: '',
    anak_ke: 1,
    orang_tua_id: '',
    wilayah_posyandu_id: ''
  });

  const fetchDependencies = async () => {
    try {
      const [resPos, resOrtu] = await Promise.all([
        api.get('/posyandu'),
        api.get('/orang-tua?limit=100')
      ]);
      if (resPos.data.success) setPosyanduList(resPos.data.data || []);
      if (resOrtu.data.success) setOrangTuaList(resOrtu.data.data.orang_tua || []);
    } catch {
      // Ignore
    }
  };

  const fetchBalitas = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/balita?page=${page}&limit=10&search=${search}&posyandu_id=${posyanduId}&status_gizi=${statusGizi}&jenis_kelamin=${gender}`
      );
      if (res.data.success) {
        setBalitas(res.data.data.balita || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil data balita.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchBalitas();
  }, [page, search, posyanduId, statusGizi, gender]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (selectedBalita) {
        const res = await api.put(`/balita/${selectedBalita.id}`, formData);
        if (res.data.success) {
          toast.success('Data balita berhasil diperbarui.');
          setIsModalOpen(false);
          fetchBalitas();
        }
      } else {
        const res = await api.post('/balita', formData);
        if (res.data.success) {
          toast.success('Balita baru berhasil didaftarkan.');
          setIsModalOpen(false);
          fetchBalitas();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data balita.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/balita/${selectedBalita.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Data balita berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchBalitas();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data balita.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedBalita(null);
    setFormData({
      nama: '',
      nik: '',
      jenis_kelamin: 'L',
      tanggal_lahir: '',
      berat_lahir: '',
      panjang_lahir: '',
      anak_ke: 1,
      orang_tua_id: orangTuaList[0]?.id || '',
      wilayah_posyandu_id: posyanduList[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (b) => {
    setSelectedBalita(b);
    setFormData({
      nama: b.nama,
      nik: b.nik || '',
      jenis_kelamin: b.jenis_kelamin,
      tanggal_lahir: b.tanggal_lahir,
      berat_lahir: b.berat_lahir || '',
      panjang_lahir: b.panjang_lahir || '',
      anak_ke: b.anak_ke || 1,
      orang_tua_id: b.orang_tua?.id || '',
      wilayah_posyandu_id: b.wilayah_posyandu?.id || ''
    });
    setIsModalOpen(true);
  };

  const openDelete = (b) => {
    setSelectedBalita(b);
    setIsDeleteOpen(true);
  };

  const columns = [
    {
      header: 'Nama Balita',
      render: (r) => (
        <div>
          <Link
            to={`/balita/${r.id}`}
            className="font-bold text-slate-900 hover:text-teal-700 transition-colors block"
          >
            {r.nama}
          </Link>
          <span className="text-xs text-slate-500">
            NIK: {r.nik || '-'} • {r.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
          </span>
        </div>
      )
    },
    {
      header: 'Usia (Bulan)',
      render: (r) => (
        <span className="font-semibold text-slate-800 text-xs">
          {r.umur_bulan_sekarang} Bulan
          <span className="block text-[10px] text-slate-400 font-normal">
            Lahir: {r.tanggal_lahir}
          </span>
        </span>
      )
    },
    {
      header: 'Posyandu / Ibu',
      render: (r) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">
            {r.wilayah_posyandu?.nama_posyandu || '-'}
          </span>
          <span className="text-[11px] text-slate-500">
            Ibu: {r.orang_tua?.nama_ibu || '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Pengukuran Terakhir',
      render: (r) => {
        const p = r.pengukuran_terakhir;
        if (!p) return <span className="text-xs text-slate-400 italic">Belum diukur</span>;
        return (
          <span className="text-xs font-medium text-slate-700">
            {p.berat_badan} kg / {p.tinggi_badan} cm
            <span className="block text-[10px] text-slate-400">Tgl: {p.tanggal_ukur}</span>
          </span>
        );
      }
    },
    {
      header: 'Status Gizi Terkini',
      render: (r) => {
        const status = r.pengukuran_terakhir?.status_gizi?.status_final;
        if (!status) return <span className="text-xs text-slate-400">-</span>;
        return <Badge status={status}>{status}</Badge>;
      }
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/balita/${r.id}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors"
            title="Lihat Detail & KMS"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {role !== 'dokter' && (
            <>
              <button
                onClick={() => openEdit(r)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                title="Edit Data"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDelete(r)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Hapus Data"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-teal-600" /> Data Balita Binaan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar anak balita (0-60 bulan) dalam pemantauan gizi Puskesmas Kebun Kopi
          </p>
        </div>
        {role !== 'dokter' && (
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            Daftarkan Balita Baru
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          icon={Search}
          placeholder="Cari nama balita atau NIK..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <Select
          value={posyanduId}
          onChange={(e) => {
            setPosyanduId(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Semua Posyandu' },
            ...posyanduList.map((p) => ({ value: p.id, label: p.nama_posyandu }))
          ]}
        />

        <Select
          value={statusGizi}
          onChange={(e) => {
            setStatusGizi(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Semua Status Gizi' },
            { value: 'Normal', label: 'Gizi Baik (Normal)' },
            { value: 'Kurang', label: 'Gizi Kurang' },
            { value: 'Buruk', label: 'Gizi Buruk' },
            { value: 'Stunting', label: 'Stunting / Pendek' },
            { value: 'Lebih', label: 'Gizi Lebih / Obesitas' }
          ]}
        />

        <Select
          value={gender}
          onChange={(e) => {
            setGender(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Semua Jenis Kelamin' },
            { value: 'L', label: 'Laki-laki (L)' },
            { value: 'P', label: 'Perempuan (P)' }
          ]}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={balitas}
        loading={loading}
        emptyMessage="Tidak ada data balita ditemukan"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Modal Tambah / Edit Balita */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBalita ? 'Ubah Data Balita' : 'Pendaftaran Balita Baru'}
        subtitle="Identitas balita dan data orang tua/posyandu"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap Balita"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Contoh: Kenzo Alfarizqi"
              required
            />
            <Input
              label="Nomor Induk Kependudukan (NIK)"
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              placeholder="16 digit NIK balita"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Jenis Kelamin"
              value={formData.jenis_kelamin}
              onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
              options={[
                { value: 'L', label: 'Laki-laki (L)' },
                { value: 'P', label: 'Perempuan (P)' }
              ]}
              required
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              value={formData.tanggal_lahir}
              onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
              required
            />
            <Input
              label="Anak Ke-"
              type="number"
              min={1}
              value={formData.anak_ke}
              onChange={(e) => setFormData({ ...formData, anak_ke: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Berat Badan Lahir (kg)"
              type="number"
              step="0.01"
              value={formData.berat_lahir}
              onChange={(e) => setFormData({ ...formData, berat_lahir: e.target.value })}
              placeholder="Contoh: 3.2"
            />
            <Input
              label="Panjang Badan Lahir (cm)"
              type="number"
              step="0.1"
              value={formData.panjang_lahir}
              onChange={(e) => setFormData({ ...formData, panjang_lahir: e.target.value })}
              placeholder="Contoh: 49.5"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Wilayah Posyandu"
              value={formData.wilayah_posyandu_id}
              onChange={(e) => setFormData({ ...formData, wilayah_posyandu_id: e.target.value })}
              options={posyanduList.map((p) => ({ value: p.id, label: p.nama_posyandu }))}
              placeholder="Pilih Posyandu"
              required
            />
            <Select
              label="Orang Tua / Ibu"
              value={formData.orang_tua_id}
              onChange={(e) => setFormData({ ...formData, orang_tua_id: e.target.value })}
              options={orangTuaList.map((o) => ({
                value: o.id,
                label: `Ibu ${o.nama_ibu} (${o.nama_ayah || 'Ayah'})`
              }))}
              placeholder="Pilih Data Orang Tua"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedBalita ? 'Perbarui Balita' : 'Simpan Balita'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={modalLoading}
        title="Hapus Data Balita"
        message={`Apakah Anda yakin ingin menghapus data balita ${selectedBalita?.nama}? Jika balita memiliki riwayat pengukuran, statusnya akan dinonaktifkan demi keutuhan data.`}
      />
    </div>
  );
};

export default BalitaList;

