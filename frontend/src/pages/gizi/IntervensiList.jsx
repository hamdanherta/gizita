import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Search, Edit, Trash2, Calendar, CheckCircle } from 'lucide-react';
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

const IntervensiList = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [intervensiList, setIntervensiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balitas, setBalitas] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [jenisFilter, setJenisFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedIntervensi, setSelectedIntervensi] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    balita_id: '',
    jenis_intervensi: 'PMT',
    tujuan: '',
    target: '',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: '',
    status: 'berjalan',
    catatan: ''
  });

  const fetchDependencies = async () => {
    try {
      const res = await api.get('/balita?limit=100');
      if (res.data.success) setBalitas(res.data.data.balita || []);
    } catch {
      // Ignore
    }
  };

  const fetchIntervensi = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/intervensi?page=${page}&limit=10&status=${statusFilter}&jenis=${jenisFilter}`
      );
      if (res.data.success) {
        setIntervensiList(res.data.data.intervensi || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil daftar rencana intervensi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchIntervensi();
  }, [page, statusFilter, jenisFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (selectedIntervensi) {
        const res = await api.put(`/intervensi/${selectedIntervensi.id}`, formData);
        if (res.data.success) {
          toast.success('Rencana intervensi berhasil diperbarui.');
          setIsModalOpen(false);
          fetchIntervensi();
        }
      } else {
        const res = await api.post('/intervensi', formData);
        if (res.data.success) {
          toast.success('Rencana intervensi baru berhasil dibuat.');
          setIsModalOpen(false);
          fetchIntervensi();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan rencana intervensi.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/intervensi/${selectedIntervensi.id}`);
      if (res.data.success) {
        toast.success('Rencana intervensi berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchIntervensi();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus intervensi.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedIntervensi(null);
    setFormData({
      balita_id: balitas[0]?.id || '',
      jenis_intervensi: 'PMT',
      tujuan: 'Meningkatkan asupan energi dan protein untuk kejar tumbuh.',
      target: 'Kenaikan BB minimal 500 gram/bulan',
      tanggal_mulai: new Date().toISOString().split('T')[0],
      tanggal_selesai: '',
      status: 'berjalan',
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setSelectedIntervensi(item);
    setFormData({
      balita_id: item.balita_id,
      jenis_intervensi: item.jenis_intervensi,
      tujuan: item.tujuan || '',
      target: item.target || '',
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai || '',
      status: item.status,
      catatan: item.catatan || ''
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Balita Penerima',
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
      header: 'Jenis Intervensi',
      render: (r) => (
        <Badge variant={r.jenis_intervensi === 'PMT' ? 'success' : 'info'}>
          {r.jenis_intervensi}
        </Badge>
      )
    },
    {
      header: 'Tujuan & Target',
      render: (r) => (
        <div className="max-w-xs">
          <span className="font-semibold text-slate-800 text-xs block truncate">{r.tujuan || '-'}</span>
          <span className="text-[11px] text-slate-500 truncate block">{r.target || '-'}</span>
        </div>
      )
    },
    {
      header: 'Periode Pelaksanaan',
      render: (r) => (
        <span className="text-xs text-slate-600 block">
          {r.tanggal_mulai} s.d {r.tanggal_selesai || 'Selesai'}
        </span>
      )
    },
    {
      header: 'Status',
      render: (r) => <Badge status={r.status}>{r.status}</Badge>
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {role !== 'dokter' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                <Edit className="w-3.5 h-3.5 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedIntervensi(r);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-teal-600" /> Rencana & Riwayat Intervensi Gizi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan program pemulihan gizi (PMT, konseling, rujukan, suplementasi mikro) balita
          </p>
        </div>
        {role !== 'dokter' && (
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            Susun Rencana Intervensi
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'direncanakan', label: 'Direncanakan' },
              { value: 'berjalan', label: 'Sedang Berjalan' },
              { value: 'selesai', label: 'Selesai' },
              { value: 'dibatalkan', label: 'Dibatalkan' }
            ]}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            label="Filter Jenis Intervensi"
            value={jenisFilter}
            onChange={(e) => {
              setJenisFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Jenis' },
              { value: 'PMT', label: 'Pemberian PMT' },
              { value: 'konseling', label: 'Konseling Gizi' },
              { value: 'rujukan', label: 'Rujukan Medis' },
              { value: 'suplemen', label: 'Suplementasi (Vitamin/Zinc)' },
              { value: 'lainnya', label: 'Lainnya' }
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={intervensiList}
        loading={loading}
        emptyMessage="Tidak ada rencana intervensi ditemukan"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedIntervensi ? 'Ubah Rencana Intervensi' : 'Susun Rencana Intervensi Baru'}
        subtitle="Rencana tindakan pemulihan gizi balita"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Balita Penerima"
            value={formData.balita_id}
            onChange={(e) => setFormData({ ...formData, balita_id: e.target.value })}
            options={balitas.map((b) => ({
              value: b.id,
              label: `${b.nama} (${b.jenis_kelamin === 'L' ? 'L' : 'P'}, ${b.wilayah_posyandu?.nama_posyandu || '-'})`
            }))}
            disabled={!!selectedIntervensi}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Jenis Intervensi"
              value={formData.jenis_intervensi}
              onChange={(e) => setFormData({ ...formData, jenis_intervensi: e.target.value })}
              options={[
                { value: 'PMT', label: 'Pemberian Makanan Tambahan (PMT)' },
                { value: 'konseling', label: 'Konseling Gizi' },
                { value: 'rujukan', label: 'Rujukan ke RS / Dokter Spesialis' },
                { value: 'suplemen', label: 'Suplementasi Tabur Gizi/Vitamin' },
                { value: 'lainnya', label: 'Lainnya' }
              ]}
              required
            />
            <Select
              label="Status Rencana"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'direncanakan', label: 'Direncanakan' },
                { value: 'berjalan', label: 'Sedang Berjalan' },
                { value: 'selesai', label: 'Selesai' },
                { value: 'dibatalkan', label: 'Dibatalkan' }
              ]}
            />
          </div>

          <Input
            label="Tujuan Intervensi"
            value={formData.tujuan}
            onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
            placeholder="Contoh: Mengatasi wasting dan memacu kenaikan berat badan balita..."
            required
          />

          <Input
            label="Target Capaian"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
            placeholder="Contoh: Kenaikan BB 500g/bulan, Z-Score BB/TB > -2 SD..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={formData.tanggal_mulai}
              onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
              required
            />
            <Input
              label="Tanggal Selesai (Target)"
              type="date"
              value={formData.tanggal_selesai}
              onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Khusus
            </label>
            <textarea
              rows={2}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Catatan pelaksanaan program intervensi..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedIntervensi ? 'Perbarui Intervensi' : 'Simpan Rencana'}
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
        title="Hapus Rencana Intervensi"
        message="Apakah Anda yakin ingin menghapus rencana intervensi ini? Jadwal PMT yang terhubung juga akan terhapus."
      />
    </div>
  );
};

export default IntervensiList;

