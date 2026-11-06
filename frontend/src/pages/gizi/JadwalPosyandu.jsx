import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, MapPin, Clock, Edit, Trash2, UserPlus, CheckCircle2 } from 'lucide-react';
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

const JadwalPosyandu = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posyanduList, setPosyanduList] = useState([]);
  const [balitas, setBalitas] = useState([]);

  // Filters
  const [posyanduId, setPosyanduId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Catat Kunjungan Balita Modal
  const [isKunjunganOpen, setIsKunjunganOpen] = useState(false);
  const [kunjunganForm, setKunjunganForm] = useState({
    balita_id: '',
    catatan: ''
  });

  const [formData, setFormData] = useState({
    wilayah_posyandu_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam_mulai: '08:30',
    jam_selesai: '11:30',
    lokasi: '',
    kegiatan: 'Penimbangan BB, Pengukuran TB/PB, Pemberian PMT, dan Konseling Gizi',
    keterangan: '',
    status: 'terjadwal'
  });

  const fetchDependencies = async () => {
    try {
      const [resP, resB] = await Promise.all([
        api.get('/posyandu'),
        api.get('/balita?limit=100')
      ]);
      if (resP.data.success) setPosyanduList(resP.data.data || []);
      if (resB.data.success) setBalitas(resB.data.data.balita || []);
    } catch {
      // Ignore
    }
  };

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/jadwal-posyandu?page=${page}&limit=10&posyandu_id=${posyanduId}&status=${statusFilter}`
      );
      if (res.data.success) {
        setJadwalList(res.data.data.jadwal || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil jadwal posyandu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [page, posyanduId, statusFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (selectedJadwal) {
        const res = await api.put(`/jadwal-posyandu/${selectedJadwal.id}`, formData);
        if (res.data.success) {
          toast.success('Jadwal posyandu berhasil diperbarui.');
          setIsModalOpen(false);
          fetchJadwal();
        }
      } else {
        const res = await api.post('/jadwal-posyandu', formData);
        if (res.data.success) {
          toast.success('Jadwal posyandu baru berhasil dibuat & notifikasi telah dikirim.');
          setIsModalOpen(false);
          fetchJadwal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan jadwal posyandu.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSimpanKunjungan = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await api.post(`/jadwal-posyandu/${selectedJadwal.id}/kunjungan`, kunjunganForm);
      if (res.data.success) {
        toast.success('Kehadiran balita di posyandu berhasil dicatat.');
        setIsKunjunganOpen(false);
        setKunjunganForm({ balita_id: '', catatan: '' });
        fetchJadwal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat kunjungan balita.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/jadwal-posyandu/${selectedJadwal.id}`);
      if (res.data.success) {
        toast.success('Jadwal posyandu berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchJadwal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus jadwal.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedJadwal(null);
    setFormData({
      wilayah_posyandu_id: posyanduList[0]?.id || '',
      tanggal: new Date().toISOString().split('T')[0],
      jam_mulai: '08:30',
      jam_selesai: '11:30',
      lokasi: posyanduList[0]?.alamat || '',
      kegiatan: 'Penimbangan BB, Pengukuran TB/PB, Pemberian PMT, dan Konseling Gizi',
      keterangan: 'Harap orang tua membawa buku KIA/KMS.',
      status: 'terjadwal'
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setSelectedJadwal(item);
    setFormData({
      wilayah_posyandu_id: item.wilayah_posyandu_id,
      tanggal: item.tanggal,
      jam_mulai: item.jam_mulai?.slice(0, 5) || '08:30',
      jam_selesai: item.jam_selesai?.slice(0, 5) || '11:30',
      lokasi: item.lokasi || '',
      kegiatan: item.kegiatan || '',
      keterangan: item.keterangan || '',
      status: item.status
    });
    setIsModalOpen(true);
  };

  const openCatatKunjungan = (item) => {
    setSelectedJadwal(item);
    setKunjunganForm({
      balita_id: balitas[0]?.id || '',
      catatan: 'Hadir posyandu rutin, kondisi aktif.'
    });
    setIsKunjunganOpen(true);
  };

  const columns = [
    {
      header: 'Waktu Pelaksanaan',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{r.tanggal}</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-teal-600" />
            {r.jam_mulai?.slice(0, 5) || '08:00'} - {r.jam_selesai?.slice(0, 5) || 'Selesai'} WIB
          </span>
        </div>
      )
    },
    {
      header: 'Wilayah Posyandu',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">
            {r.wilayahPosyandu?.nama_posyandu}
          </span>
          <span className="text-[11px] text-slate-500">Kelurahan: {r.wilayahPosyandu?.kelurahan_desa}</span>
        </div>
      )
    },
    {
      header: 'Lokasi & Agenda Kegiatan',
      render: (r) => (
        <div className="max-w-xs">
          <span className="text-xs font-semibold text-slate-700 block truncate flex items-center gap-1">
            <MapPin className="w-3 h-3 text-teal-600" /> {r.lokasi || '-'}
          </span>
          <span className="text-[11px] text-slate-500 truncate block">{r.kegiatan || '-'}</span>
        </div>
      )
    },
    {
      header: 'Status Kegiatan',
      render: (r) => <Badge status={r.status}>{r.status}</Badge>
    },
    {
      header: 'Kehadiran Balita',
      align: 'center',
      render: (r) => (
        <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-100">
          {r.kunjunganList?.length || 0} Hadir
        </span>
      )
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          {role !== 'dokter' && (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => openCatatKunjungan(r)}
                title="Catat Kehadiran Balita"
              >
                Kunjungan
              </Button>
              <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                <Edit className="w-3.5 h-3.5 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedJadwal(r);
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
            <Calendar className="w-5 h-5 text-teal-600" /> Jadwal Kegiatan Posyandu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal operasional posyandu terpadu bulanan wilayah Puskesmas Kebun Kopi
          </p>
        </div>
        {role !== 'dokter' && (
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            Buat Jadwal Posyandu
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Select
            label="Filter Posyandu"
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
        <div className="w-full sm:w-56">
          <Select
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'Semua Status' },
              { value: 'terjadwal', label: 'Terjadwal' },
              { value: 'selesai', label: 'Selesai' },
              { value: 'dibatalkan', label: 'Dibatalkan' }
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={jadwalList}
        loading={loading}
        emptyMessage="Tidak ada jadwal posyandu ditemukan"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Modal Buat / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedJadwal ? 'Ubah Jadwal Posyandu' : 'Buat Jadwal Posyandu Baru'}
        subtitle="Notifikasi akan dikirimkan otomatis ke dokter dan petugas puskesmas"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Wilayah Posyandu"
              value={formData.wilayah_posyandu_id}
              onChange={(e) => setFormData({ ...formData, wilayah_posyandu_id: e.target.value })}
              options={posyanduList.map((p) => ({ value: p.id, label: p.nama_posyandu }))}
              required
            />
            <Input
              label="Tanggal Pelaksanaan"
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Jam Mulai"
              type="time"
              value={formData.jam_mulai}
              onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })}
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={formData.jam_selesai}
              onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })}
            />
          </div>

          <Input
            label="Lokasi Tempat Kegiatan"
            value={formData.lokasi}
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            placeholder="Balai RT / Pos Posyandu..."
            required
          />

          <Input
            label="Agenda Kegiatan"
            value={formData.kegiatan}
            onChange={(e) => setFormData({ ...formData, kegiatan: e.target.value })}
            placeholder="Penimbangan, Pengukuran, Imunisasi, Penyuluhan..."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status Jadwal"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'terjadwal', label: 'Terjadwal' },
                { value: 'selesai', label: 'Selesai' },
                { value: 'dibatalkan', label: 'Dibatalkan' }
              ]}
            />
            <Input
              label="Keterangan Tambahan"
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              placeholder="Membawa buku KMS..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedJadwal ? 'Perbarui Jadwal' : 'Simpan & Kirim Notifikasi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Catat Kehadiran Balita */}
      <Modal
        isOpen={isKunjunganOpen}
        onClose={() => setIsKunjunganOpen(false)}
        title="Catat Kehadiran Kunjungan Balita"
        subtitle={`Posyandu: ${selectedJadwal?.wilayahPosyandu?.nama_posyandu} • ${selectedJadwal?.tanggal}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSimpanKunjungan} className="space-y-4">
          <Select
            label="Pilih Balita yang Hadir"
            value={kunjunganForm.balita_id}
            onChange={(e) => setKunjunganForm({ ...kunjunganForm, balita_id: e.target.value })}
            options={balitas.map((b) => ({
              value: b.id,
              label: `${b.nama} (${b.wilayah_posyandu?.nama_posyandu || '-'})`
            }))}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Kunjungan (Opsional)
            </label>
            <textarea
              rows={2}
              value={kunjunganForm.catatan}
              onChange={(e) => setKunjunganForm({ ...kunjunganForm, catatan: e.target.value })}
              placeholder="Catatan kehadiran..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsKunjunganOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Simpan Kehadiran
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
        title="Hapus Jadwal Posyandu"
        message="Apakah Anda yakin ingin menghapus jadwal posyandu ini?"
      />
    </div>
  );
};

export default JadwalPosyandu;

