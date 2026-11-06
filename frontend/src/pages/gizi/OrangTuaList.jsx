import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Edit, Trash2, Phone, MapPin, Baby } from 'lucide-react';
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

const OrangTuaList = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [orangTua, setOrangTua] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posyanduList, setPosyanduList] = useState([]);

  const [search, setSearch] = useState('');
  const [posyanduId, setPosyanduId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrtu, setSelectedOrtu] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_ibu: '',
    nama_ayah: '',
    nik: '',
    no_hp: '',
    alamat: '',
    pekerjaan: '',
    wilayah_posyandu_id: ''
  });

  const fetchDependencies = async () => {
    try {
      const res = await api.get('/posyandu');
      if (res.data.success) setPosyanduList(res.data.data || []);
    } catch {
      // Ignore
    }
  };

  const fetchOrangTua = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/orang-tua?page=${page}&limit=10&search=${search}&posyandu_id=${posyanduId}`
      );
      if (res.data.success) {
        setOrangTua(res.data.data.orang_tua || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil data orang tua.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchOrangTua();
  }, [page, search, posyanduId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (selectedOrtu) {
        const res = await api.put(`/orang-tua/${selectedOrtu.id}`, formData);
        if (res.data.success) {
          toast.success('Data orang tua berhasil diperbarui.');
          setIsModalOpen(false);
          fetchOrangTua();
        }
      } else {
        const res = await api.post('/orang-tua', formData);
        if (res.data.success) {
          toast.success('Data orang tua baru berhasil disimpan.');
          setIsModalOpen(false);
          fetchOrangTua();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data orang tua.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/orang-tua/${selectedOrtu.id}`);
      if (res.data.success) {
        toast.success('Data orang tua berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchOrangTua();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data orang tua.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedOrtu(null);
    setFormData({
      nama_ibu: '',
      nama_ayah: '',
      nik: '',
      no_hp: '',
      alamat: '',
      pekerjaan: '',
      wilayah_posyandu_id: posyanduList[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (o) => {
    setSelectedOrtu(o);
    setFormData({
      nama_ibu: o.nama_ibu,
      nama_ayah: o.nama_ayah || '',
      nik: o.nik || '',
      no_hp: o.no_hp || '',
      alamat: o.alamat || '',
      pekerjaan: o.pekerjaan || '',
      wilayah_posyandu_id: o.wilayah_posyandu_id || ''
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Nama Orang Tua',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">Ibu {r.nama_ibu}</span>
          <span className="text-xs text-slate-500">
            Ayah: {r.nama_ayah || '-'} • NIK: {r.nik || '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Kontak & Alamat',
      render: (r) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
            <Phone className="w-3 h-3 text-teal-600" /> {r.no_hp || '-'}
          </span>
          <span className="text-[11px] text-slate-500 truncate block max-w-xs">{r.alamat || '-'}</span>
        </div>
      )
    },
    {
      header: 'Posyandu',
      render: (r) => (
        <span className="text-xs text-slate-700 font-medium">
          {r.wilayahPosyandu?.nama_posyandu || '-'}
        </span>
      )
    },
    {
      header: 'Anak Balita Terhubung',
      render: (r) => {
        const anak = r.anak || [];
        if (anak.length === 0) return <span className="text-xs text-slate-400 italic">Belum ada</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {anak.map((a) => (
              <span
                key={a.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-100"
              >
                <Baby className="w-3 h-3 text-teal-600" /> {a.nama}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
            <Edit className="w-3.5 h-3.5 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedOrtu(r);
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
            <UserCheck className="w-5 h-5 text-teal-600" /> Data Orang Tua / Wali
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar orang tua dan keluarga balita terdaftar di Posyandu Puskesmas Kebun Kopi
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>
          Tambah Orang Tua
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Cari nama ibu, ayah, atau NIK..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-64">
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
        </div>
      </div>

      <Table
        columns={columns}
        data={orangTua}
        loading={loading}
        emptyMessage="Tidak ada data orang tua ditemukan"
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
        title={selectedOrtu ? 'Ubah Data Orang Tua' : 'Tambah Orang Tua Baru'}
        subtitle="Identitas orang tua dan domisili balita"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Ibu"
              value={formData.nama_ibu}
              onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
              placeholder="Ibu Siti"
              required
            />
            <Input
              label="Nama Ayah"
              value={formData.nama_ayah}
              onChange={(e) => setFormData({ ...formData, nama_ayah: e.target.value })}
              placeholder="Bapak Ahmad"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor Induk Kependudukan (NIK)"
              value={formData.nik}
              onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
              placeholder="16 digit NIK"
            />
            <Input
              label="Nomor Telepon / WhatsApp"
              value={formData.no_hp}
              onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
              placeholder="081234567890"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Posyandu Domisili"
              value={formData.wilayah_posyandu_id}
              onChange={(e) => setFormData({ ...formData, wilayah_posyandu_id: e.target.value })}
              options={posyanduList.map((p) => ({ value: p.id, label: p.nama_posyandu }))}
              placeholder="Pilih Posyandu"
            />
            <Input
              label="Pekerjaan"
              value={formData.pekerjaan}
              onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
              placeholder="Wiraswasta / IRT"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Tempat Tinggal
            </label>
            <textarea
              rows={2}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="RT 04 Kelurahan Thehok"
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedOrtu ? 'Perbarui Data' : 'Simpan Data'}
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
        title="Hapus Data Orang Tua"
        message={`Apakah Anda yakin ingin menghapus data orang tua Ibu ${selectedOrtu?.nama_ibu}? Pastikan tidak ada balita yang masih terhubung.`}
      />
    </div>
  );
};

export default OrangTuaList;

