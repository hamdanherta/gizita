import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Calendar, User, Eye, Trash2 } from 'lucide-react';
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

const PemeriksaanList = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [pemeriksaanList, setPemeriksaanList] = useState([]);
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
    keluhan: '',
    diagnosa: '',
    tindakan: '',
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

  const fetchPemeriksaan = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/pemeriksaan?page=${page}&limit=10`);
      if (res.data.success) {
        setPemeriksaanList(res.data.data.pemeriksaan || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil catatan pemeriksaan dokter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchPemeriksaan();
  }, [page]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await api.post('/pemeriksaan', formData);
      if (res.data.success) {
        toast.success('Catatan pemeriksaan dokter berhasil disimpan.');
        setIsModalOpen(false);
        fetchPemeriksaan();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan catatan pemeriksaan.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/pemeriksaan/${selectedItem.id}`);
      if (res.data.success) {
        toast.success('Catatan pemeriksaan berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchPemeriksaan();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pemeriksaan.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setFormData({
      balita_id: balitas[0]?.id || '',
      tanggal: new Date().toISOString().split('T')[0],
      keluhan: '',
      diagnosa: '',
      tindakan: '',
      catatan: ''
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Tanggal Periksa',
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
      header: 'Keluhan Pasien',
      render: (r) => <span className="text-xs text-slate-600 block max-w-xs">{r.keluhan || '-'}</span>
    },
    {
      header: 'Diagnosa Medis',
      render: (r) => (
        <span className="text-xs font-semibold text-teal-800 block max-w-xs">
          {r.diagnosa || '-'}
        </span>
      )
    },
    {
      header: 'Tindakan & Resep Terapi',
      render: (r) => <span className="text-xs text-slate-600 block max-w-xs">{r.tindakan || '-'}</span>
    },
    {
      header: 'Dokter Pemeriksa',
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
            <Stethoscope className="w-5 h-5 text-teal-600" /> Catatan Pemeriksaan Kesehatan Balita
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekam medis pemeriksaan klinis balita oleh dokter Puskesmas Kebun Kopi
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>
          Catat Pemeriksaan Baru
        </Button>
      </div>

      <Table
        columns={columns}
        data={pemeriksaanList}
        loading={loading}
        emptyMessage="Belum ada riwayat catatan pemeriksaan dokter"
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
        title="Catat Pemeriksaan Kesehatan Baru"
        subtitle="Dokter memasukkan hasil diagnosa dan arahan terapi balita"
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
            label="Tanggal Pemeriksaan"
            type="date"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            required
          />

          <Input
            label="Keluhan Utama Balita"
            value={formData.keluhan}
            onChange={(e) => setFormData({ ...formData, keluhan: e.target.value })}
            placeholder="Nafsu makan menurun, diare berulang..."
          />

          <Input
            label="Diagnosa Medis"
            value={formData.diagnosa}
            onChange={(e) => setFormData({ ...formData, diagnosa: e.target.value })}
            placeholder="Gizi kurang dengan riwayat ISPA..."
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tindakan, Resep Obat, & Suplementasi
            </label>
            <textarea
              rows={2}
              value={formData.tindakan}
              onChange={(e) => setFormData({ ...formData, tindakan: e.target.value })}
              placeholder="Zinc tablet 20mg 1x1 selama 10 hari, vitamin A..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Dokter Lainnya
            </label>
            <textarea
              rows={2}
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              placeholder="Kondisi umum sadar, reevaluasi dalam 2 minggu..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Simpan Pemeriksaan
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
        title="Hapus Catatan Pemeriksaan"
        message="Apakah Anda yakin ingin menghapus catatan pemeriksaan dokter ini?"
      />
    </div>
  );
};

export default PemeriksaanList;

