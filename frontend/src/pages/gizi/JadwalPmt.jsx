import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Search, CheckSquare, Edit, Trash2, Utensils, User } from 'lucide-react';
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

const JadwalPmt = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balitas, setBalitas] = useState([]);
  const [menus, setMenus] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [tanggalFilter, setTanggalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Catat Konsumsi Modal
  const [isKonsumsiOpen, setIsKonsumsiOpen] = useState(false);
  const [konsumsiForm, setKonsumsiForm] = useState({
    porsi_dihabiskan: 'habis',
    catatan: ''
  });

  const [formData, setFormData] = useState({
    balita_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    menu_id: '',
    jumlah_porsi: 1,
    status: 'terjadwal'
  });

  const fetchDependencies = async () => {
    try {
      const [resB, resM] = await Promise.all([
        api.get('/balita?limit=100'),
        api.get('/menu?aktif=true')
      ]);
      if (resB.data.success) setBalitas(resB.data.data.balita || []);
      if (resM.data.success) setMenus(resM.data.data || []);
    } catch {
      // Ignore
    }
  };

  const fetchJadwal = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/pmt/jadwal?page=${page}&limit=12&status=${statusFilter}&tanggal=${tanggalFilter}`
      );
      if (res.data.success) {
        setJadwalList(res.data.data.jadwal || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil daftar jadwal PMT.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [page, statusFilter, tanggalFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (selectedJadwal) {
        const res = await api.put(`/pmt/jadwal/${selectedJadwal.id}`, formData);
        if (res.data.success) {
          toast.success('Jadwal PMT berhasil diperbarui.');
          setIsModalOpen(false);
          fetchJadwal();
        }
      } else {
        const res = await api.post('/pmt/jadwal', formData);
        if (res.data.success) {
          toast.success('Jadwal PMT baru berhasil dibuat.');
          setIsModalOpen(false);
          fetchJadwal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan jadwal PMT.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSimpanKonsumsi = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await api.post('/pmt/konsumsi', {
        jadwal_pmt_id: selectedJadwal.id,
        porsi_dihabiskan: konsumsiForm.porsi_dihabiskan,
        catatan: konsumsiForm.catatan,
        tanggal: selectedJadwal.tanggal
      });
      if (res.data.success) {
        toast.success('Konsumsi PMT berhasil dicatat.');
        setIsKonsumsiOpen(false);
        fetchJadwal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mencatat konsumsi PMT.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/pmt/jadwal/${selectedJadwal.id}`);
      if (res.data.success) {
        toast.success('Jadwal PMT berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchJadwal();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus jadwal PMT.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedJadwal(null);
    setFormData({
      balita_id: balitas[0]?.id || '',
      tanggal: new Date().toISOString().split('T')[0],
      menu_id: menus[0]?.id || '',
      jumlah_porsi: 1,
      status: 'terjadwal'
    });
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setSelectedJadwal(item);
    setFormData({
      balita_id: item.balita_id,
      tanggal: item.tanggal,
      menu_id: item.menu_id,
      jumlah_porsi: item.jumlah_porsi,
      status: item.status
    });
    setIsModalOpen(true);
  };

  const openCatatKonsumsi = (item) => {
    setSelectedJadwal(item);
    setKonsumsiForm({
      porsi_dihabiskan: item.konsumsi?.porsi_dihabiskan || 'habis',
      catatan: item.konsumsi?.catatan || ''
    });
    setIsKonsumsiOpen(true);
  };

  const columns = [
    {
      header: 'Tanggal Jadwal',
      render: (r) => (
        <span className="font-semibold text-slate-800 text-xs">{r.tanggal}</span>
      )
    },
    {
      header: 'Balita',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.balita?.nama}</span>
          <span className="text-xs text-slate-500">
            {r.balita?.wilayahPosyandu?.nama_posyandu || '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Menu Makanan PMT',
      render: (r) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block flex items-center gap-1">
            <Utensils className="w-3 h-3 text-teal-600" /> {r.menu?.nama_menu || '-'}
          </span>
          <span className="text-[11px] text-slate-500">
            {r.menu?.energi_kkal || 0} kkal • Protein: {r.menu?.protein_g || 0} g
          </span>
        </div>
      )
    },
    {
      header: 'Status Pemberian',
      render: (r) => <Badge status={r.status}>{r.status}</Badge>
    },
    {
      header: 'Status Konsumsi Balita',
      render: (r) => {
        const k = r.konsumsi;
        if (!k) return <span className="text-xs text-slate-400 italic">Belum dicatat</span>;
        return (
          <div>
            <Badge status={k.porsi_dihabiskan}>Habis: {k.porsi_dihabiskan.toUpperCase()}</Badge>
            {k.catatan && <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">{k.catatan}</span>}
          </div>
        );
      }
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
                icon={CheckSquare}
                onClick={() => openCatatKonsumsi(r)}
                title="Catat Konsumsi Balita"
              >
                Catat
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
            <CalendarDays className="w-5 h-5 text-teal-600" /> Jadwal Pemberian Makanan Tambahan (PMT)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agenda distribusi PMT pemulihan berbasis pangan lokal untuk balita stunting & gizi kurang
          </p>
        </div>
        {role !== 'dokter' && (
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            Buat Jadwal PMT
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-64">
          <Input
            label="Filter Tanggal"
            type="date"
            value={tanggalFilter}
            onChange={(e) => {
              setTanggalFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
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
              { value: 'terjadwal', label: 'Terjadwal' },
              { value: 'diberikan', label: 'Diberikan' },
              { value: 'tidak_diberikan', label: 'Tidak Diberikan' }
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={jadwalList}
        loading={loading}
        emptyMessage="Tidak ada jadwal PMT ditemukan"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={12}
        onPageChange={setPage}
      />

      {/* Modal Buat / Edit Jadwal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedJadwal ? 'Ubah Jadwal PMT' : 'Buat Jadwal PMT Baru'}
        subtitle="Tetapkan penerima balita, tanggal, dan menu makanan"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Balita Penerima"
            value={formData.balita_id}
            onChange={(e) => setFormData({ ...formData, balita_id: e.target.value })}
            options={balitas.map((b) => ({
              value: b.id,
              label: `${b.nama} (${b.wilayah_posyandu?.nama_posyandu || '-'})`
            }))}
            disabled={!!selectedJadwal}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Penjadwalan"
              type="date"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              required
            />
            <Input
              label="Jumlah Porsi"
              type="number"
              min={1}
              value={formData.jumlah_porsi}
              onChange={(e) => setFormData({ ...formData, jumlah_porsi: e.target.value })}
              required
            />
          </div>

          <Select
            label="Pilih Menu Makanan PMT"
            value={formData.menu_id}
            onChange={(e) => setFormData({ ...formData, menu_id: e.target.value })}
            options={menus.map((m) => ({
              value: m.id,
              label: `${m.nama_menu} (${m.energi_kkal || 0} kkal, Prot: ${m.protein_g || 0}g)`
            }))}
            required
          />

          <Select
            label="Status Jadwal"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'terjadwal', label: 'Terjadwal' },
              { value: 'diberikan', label: 'Diberikan' },
              { value: 'tidak_diberikan', label: 'Tidak Diberikan' }
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedJadwal ? 'Perbarui Jadwal' : 'Simpan Jadwal'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Catat Konsumsi PMT */}
      <Modal
        isOpen={isKonsumsiOpen}
        onClose={() => setIsKonsumsiOpen(false)}
        title="Catat Konsumsi PMT Balita"
        subtitle={`Balita: ${selectedJadwal?.balita?.nama} • Tanggal: ${selectedJadwal?.tanggal}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSimpanKonsumsi} className="space-y-4">
          <Select
            label="Porsi Makanan yang Dihabiskan"
            value={konsumsiForm.porsi_dihabiskan}
            onChange={(e) => setKonsumsiForm({ ...konsumsiForm, porsi_dihabiskan: e.target.value })}
            options={[
              { value: 'habis', label: 'Habis (100% dihabiskan balita)' },
              { value: 'sebagian', label: 'Sebagian (Hanya dimakan sebagian)' },
              { value: 'tidak', label: 'Tidak Dimakan / Ditolak balita' }
            ]}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Catatan Respons / Daya Terima Balita
            </label>
            <textarea
              rows={3}
              value={konsumsiForm.catatan}
              onChange={(e) => setKonsumsiForm({ ...konsumsiForm, catatan: e.target.value })}
              placeholder="Contoh: Balita sangat antusias makan bubur, tidak ada reaksi alergi..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsKonsumsiOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Simpan Konsumsi
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
        title="Hapus Jadwal PMT"
        message="Apakah Anda yakin ingin menghapus jadwal PMT ini?"
      />
    </div>
  );
};

export default JadwalPmt;

