import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, Calendar, User, Trash2 } from 'lucide-react';
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

const RekomendasiList = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [rekomendasiList, setRekomendasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balitas, setBalitas] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    balita_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    isi_rekomendasi: ''
  });

  const fetchDependencies = async () => {
    try {
      const res = await api.get('/balita?limit=100');
      if (res.data.success) setBalitas(res.data.data.balita || []);
    } catch {
      // Ignore
    }
  };

  const fetchRekomendasi = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rekomendasi?page=${page}&limit=10`);
      if (res.data.success) {
        setRekomendasiList(res.data.data.rekomendasi || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil daftar rekomendasi dokter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchRekomendasi();
  }, [page]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await api.post('/rekomendasi', formData);
      if (res.data.success) {
        toast.success('Rekomendasi dokter berhasil disimpan & dinotifikasikan ke petugas gizi.');
        setIsModalOpen(false);
        fetchRekomendasi();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan rekomendasi.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/rekomendasi/${selectedItem.id}`);
      if (res.data.success) {
        toast.success('Rekomendasi berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchRekomendasi();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus rekomendasi.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setFormData({
      balita_id: balitas[0]?.id || '',
      tanggal: new Date().toISOString().split('T')[0],
      isi_rekomendasi: ''
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Tanggal Rekomendasi',
      render: (r) => <span className="font-semibold text-slate-800 text-xs">{r.tanggal}</span>
    },
    {
      header: 'Balita Pasien',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.balita?.nama}</span>
          <span className="text-xs text-slate-500">
            {r.balita?.wilayahPosyandu?.nama_posyandu || '-'} • NIK: {r.balita?.nik || '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Status Gizi Terkini',
      render: (r) => (
        <Badge status={r.statusGizi?.status_final}>
          {r.statusGizi?.status_final || 'Belum Diukur'}
        </Badge>
      )
    },
    {
      header: 'Isi Rekomendasi Dokter',
      render: (r) => (
        <p className="text-xs text-slate-700 leading-relaxed max-w-md bg-teal-50/50 p-2.5 rounded-lg border border-teal-100">
          "{r.isi_rekomendasi}"
        </p>
      )
    },
    {
      header: 'Dokter',
      render: (r) => (
        <span className="text-xs font-semibold text-slate-800 block">
          {r.dokter?.nama || 'dr. Puskesmas'}
        </span>
      )
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedItem(r);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" /> Rekomendasi Medis Gizi Balita
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Arahan dan rekomendasi tata laksana nutrisi dokter puskesmas untuk ditindaklanjuti oleh petugas gizi
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>
          Beri Rekomendasi Baru
        </Button>
      </div>

      <Table
        columns={columns}
        data={rekomendasiList}
        loading={loading}
        emptyMessage="Belum ada rekomendasi dokter yang tersimpan"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Modal Tambah */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Beri Rekomendasi Medis Gizi"
        subtitle="Rekomendasi ini akan secara otomatis mengirimkan notifikasi ke seluruh petugas gizi"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Pilih Balita"
            value={formData.balita_id}
            onChange={(e) => setFormData({ ...formData, balita_id: e.target.value })}
            options={balitas.map((b) => ({
              value: b.id,
              label: `${b.nama} (${b.wilayah_posyandu?.nama_posyandu || '-'})`
            }))}
            required
          />

          <Input
            label="Tanggal"
            type="date"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Isi Rekomendasi & Arahan Terapi Gizi <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.isi_rekomendasi}
              onChange={(e) => setFormData({ ...formData, isi_rekomendasi: e.target.value })}
              placeholder="Contoh: Balita mengalami indikasi stunting. Rekomendasikan pemberian PMT tinggi protein hewani (ikan/telur), suplementasi mikronutrien, dan evaluasi asupan MPASI orang tua..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Kirim Rekomendasi
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
        title="Hapus Rekomendasi Dokter"
        message="Apakah Anda yakin ingin menghapus rekomendasi medis ini?"
      />
    </div>
  );
};

export default RekomendasiList;

