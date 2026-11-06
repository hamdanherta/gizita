import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Search, Phone, User, Users } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PosyanduManagement = () => {
  const toast = useToast();
  const [posyanduList, setPosyanduList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPosyandu, setSelectedPosyandu] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    nama_posyandu: '',
    kelurahan_desa: '',
    alamat: '',
    nama_kader: '',
    telepon_kader: ''
  });

  const fetchPosyandu = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/posyandu?search=${search}`);
      if (res.data.success) {
        setPosyanduList(res.data.data || []);
      }
    } catch {
      toast.error('Gagal mengambil data wilayah posyandu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosyandu();
  }, [search]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (selectedPosyandu) {
        // Update
        const res = await api.put(`/posyandu/${selectedPosyandu.id}`, formData);
        if (res.data.success) {
          toast.success('Data posyandu berhasil diperbarui.');
          setIsModalOpen(false);
          fetchPosyandu();
        }
      } else {
        // Create
        const res = await api.post('/posyandu', formData);
        if (res.data.success) {
          toast.success('Posyandu baru berhasil ditambahkan.');
          setIsModalOpen(false);
          fetchPosyandu();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data posyandu.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/posyandu/${selectedPosyandu.id}`);
      if (res.data.success) {
        toast.success('Posyandu berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchPosyandu();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus posyandu.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedPosyandu(null);
    setFormData({
      nama_posyandu: '',
      kelurahan_desa: '',
      alamat: '',
      nama_kader: '',
      telepon_kader: ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (p) => {
    setSelectedPosyandu(p);
    setFormData({
      nama_posyandu: p.nama_posyandu,
      kelurahan_desa: p.kelurahan_desa || '',
      alamat: p.alamat || '',
      nama_kader: p.nama_kader || '',
      telepon_kader: p.telepon_kader || ''
    });
    setIsModalOpen(true);
  };

  const openDelete = (p) => {
    setSelectedPosyandu(p);
    setIsDeleteOpen(true);
  };

  const columns = [
    {
      header: 'Nama Posyandu',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.nama_posyandu}</span>
          <span className="text-xs text-slate-500">Kelurahan: {r.kelurahan_desa || '-'}</span>
        </div>
      )
    },
    {
      header: 'Alamat / Lokasi',
      render: (r) => <span className="text-xs text-slate-600 max-w-xs block truncate">{r.alamat || '-'}</span>
    },
    {
      header: 'Kader Penanggung Jawab',
      render: (r) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{r.nama_kader || '-'}</span>
          <span className="text-[11px] text-slate-500">{r.telepon_kader || '-'}</span>
        </div>
      )
    },
    {
      header: 'Total Balita',
      align: 'center',
      render: (r) => (
        <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-100">
          {r.total_balita} Balita
        </span>
      )
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
            <Edit className="w-3.5 h-3.5 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openDelete(r)}>
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
            <MapPin className="w-5 h-5 text-teal-600" /> Kelola Wilayah & Posyandu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar posyandu binaan di wilayah kerja Puskesmas Kebun Kopi
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>
          Tambah Posyandu
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft">
        <Input
          icon={Search}
          placeholder="Cari nama posyandu, kelurahan, atau nama kader..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        data={posyanduList}
        loading={loading}
        emptyMessage="Tidak ada posyandu ditemukan"
      />

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPosyandu ? 'Ubah Data Posyandu' : 'Tambah Posyandu Baru'}
        subtitle="Masukkan rincian wilayah dan kontak kader posyandu"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nama Posyandu"
            value={formData.nama_posyandu}
            onChange={(e) => setFormData({ ...formData, nama_posyandu: e.target.value })}
            placeholder="Posyandu Mawar"
            required
          />
          <Input
            label="Kelurahan / Desa"
            value={formData.kelurahan_desa}
            onChange={(e) => setFormData({ ...formData, kelurahan_desa: e.target.value })}
            placeholder="Thehok"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Lengkap / Lokasi
            </label>
            <textarea
              rows={2}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="RT 04 Kelurahan Thehok"
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3.5 hover:border-slate-400 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Kader Penanggung Jawab"
              icon={User}
              value={formData.nama_kader}
              onChange={(e) => setFormData({ ...formData, nama_kader: e.target.value })}
              placeholder="Ibu Sri Wahyuni"
            />
            <Input
              label="Nomor Telepon / WA Kader"
              icon={Phone}
              value={formData.telepon_kader}
              onChange={(e) => setFormData({ ...formData, telepon_kader: e.target.value })}
              placeholder="081234567890"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedPosyandu ? 'Perbarui Posyandu' : 'Simpan Posyandu'}
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
        title="Hapus Data Posyandu"
        message={`Apakah Anda yakin ingin menghapus data ${selectedPosyandu?.nama_posyandu}? Pastikan tidak ada balita yang masih terdaftar di posyandu ini.`}
      />
    </div>
  );
};

export default PosyanduManagement;

