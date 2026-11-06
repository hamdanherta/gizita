import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';

const MenuMakanan = () => {
  const { role } = useAuth();
  const toast = useToast();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jenisFilter, setJenisFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama_menu: '',
    jenis: 'PMT',
    kelompok_umur: '6-11 bulan',
    bahan: '',
    energi_kkal: '',
    protein_g: '',
    lemak_g: '',
    karbohidrat_g: '',
    deskripsi: '',
    aktif: true
  });

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/menu?search=${search}&jenis=${jenisFilter}`);
      if (res.data.success) {
        setMenus(res.data.data || []);
      }
    } catch {
      toast.error('Gagal mengambil data menu makanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [search, jenisFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      if (selectedMenu) {
        const res = await api.put(`/menu/${selectedMenu.id}`, formData);
        if (res.data.success) {
          toast.success('Menu makanan berhasil diperbarui.');
          setIsModalOpen(false);
          fetchMenus();
        }
      } else {
        const res = await api.post('/menu', formData);
        if (res.data.success) {
          toast.success('Menu makanan baru berhasil ditambahkan.');
          setIsModalOpen(false);
          fetchMenus();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu makanan.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/menu/${selectedMenu.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Menu makanan berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchMenus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus menu.');
    } finally {
      setModalLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedMenu(null);
    setFormData({
      nama_menu: '',
      jenis: 'PMT',
      kelompok_umur: '6-11 bulan',
      bahan: '',
      energi_kkal: '',
      protein_g: '',
      lemak_g: '',
      karbohidrat_g: '',
      deskripsi: '',
      aktif: true
    });
    setIsModalOpen(true);
  };

  const openEdit = (m) => {
    setSelectedMenu(m);
    setFormData({
      nama_menu: m.nama_menu,
      jenis: m.jenis,
      kelompok_umur: m.kelompok_umur || '',
      bahan: m.bahan || '',
      energi_kkal: m.energi_kkal || '',
      protein_g: m.protein_g || '',
      lemak_g: m.lemak_g || '',
      karbohidrat_g: m.karbohidrat_g || '',
      deskripsi: m.deskripsi || '',
      aktif: m.aktif
    });
    setIsModalOpen(true);
  };

  const columns = [
    {
      header: 'Nama Menu',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.nama_menu}</span>
          <span className="text-[11px] text-slate-500">Usia sasaran: {r.kelompok_umur || '-'}</span>
        </div>
      )
    },
    {
      header: 'Kategori Jenis',
      render: (r) => <Badge variant="info">{r.jenis}</Badge>
    },
    {
      header: 'Kandungan Nilai Gizi',
      render: (r) => (
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-teal-800">{r.energi_kkal || 0} kkal</span>
          <span className="block text-[11px] text-slate-500">
            Prot: {r.protein_g || 0}g • Lemak: {r.lemak_g || 0}g • Karbo: {r.karbohidrat_g || 0}g
          </span>
        </div>
      )
    },
    {
      header: 'Bahan Pokok Pangan Lokal',
      render: (r) => <span className="text-xs text-slate-600 block max-w-xs truncate">{r.bahan || '-'}</span>
    },
    {
      header: 'Status',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${r.aktif ? 'text-emerald-600' : 'text-slate-400'}`}>
          {r.aktif ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {r.aktif ? 'Tersedia' : 'Nonaktif'}
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
              <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                <Edit className="w-3.5 h-3.5 text-blue-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedMenu(r);
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
            <Utensils className="w-5 h-5 text-teal-600" /> Kelola Menu Makanan Balita
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar resep menu PMT pemulihan, MPASI, dan makanan keluarga berbasis pangan lokal
          </p>
        </div>
        {role !== 'dokter' && (
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            Tambah Menu Makanan
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Cari nama menu atau bahan pangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={jenisFilter}
            onChange={(e) => setJenisFilter(e.target.value)}
            options={[
              { value: '', label: 'Semua Kategori' },
              { value: 'PMT', label: 'PMT Pemulihan' },
              { value: 'MPASI', label: 'MPASI' },
              { value: 'makanan_keluarga', label: 'Makanan Keluarga' }
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={menus}
        loading={loading}
        emptyMessage="Tidak ada menu makanan ditemukan"
      />

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMenu ? 'Ubah Data Menu Makanan' : 'Tambah Menu Makanan Baru'}
        subtitle="Rincian resep, takaran bahan, dan estimasi nilai gizi"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Menu Makanan"
              value={formData.nama_menu}
              onChange={(e) => setFormData({ ...formData, nama_menu: e.target.value })}
              placeholder="Contoh: Sup Ikan Tenggiri Sayuran"
              required
            />
            <Select
              label="Kategori Jenis Menu"
              value={formData.jenis}
              onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
              options={[
                { value: 'PMT', label: 'PMT Pemulihan' },
                { value: 'MPASI', label: 'MPASI' },
                { value: 'makanan_keluarga', label: 'Makanan Keluarga' }
              ]}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Kelompok Umur Sasaran"
              value={formData.kelompok_umur}
              onChange={(e) => setFormData({ ...formData, kelompok_umur: e.target.value })}
              options={[
                { value: '6-11 bulan', label: '6 - 11 Bulan' },
                { value: '12-23 bulan', label: '12 - 23 Bulan' },
                { value: '24-59 bulan', label: '24 - 59 Bulan' },
                { value: '12-59 bulan', label: '12 - 59 Bulan' }
              ]}
            />
            <Select
              label="Status Ketersediaan"
              value={formData.aktif ? '1' : '0'}
              onChange={(e) => setFormData({ ...formData, aktif: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Tersedia (Aktif)' },
                { value: '0', label: 'Nonaktif' }
              ]}
            />
          </div>

          {/* Kandungan Nutrisi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Input
              label="Energi (kkal)"
              type="number"
              step="0.1"
              value={formData.energi_kkal}
              onChange={(e) => setFormData({ ...formData, energi_kkal: e.target.value })}
              placeholder="250"
            />
            <Input
              label="Protein (g)"
              type="number"
              step="0.1"
              value={formData.protein_g}
              onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
              placeholder="10.5"
            />
            <Input
              label="Lemak (g)"
              type="number"
              step="0.1"
              value={formData.lemak_g}
              onChange={(e) => setFormData({ ...formData, lemak_g: e.target.value })}
              placeholder="8.0"
            />
            <Input
              label="Karbohidrat (g)"
              type="number"
              step="0.1"
              value={formData.karbohidrat_g}
              onChange={(e) => setFormData({ ...formData, karbohidrat_g: e.target.value })}
              placeholder="30.0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Bahan-Bahan Utama
            </label>
            <textarea
              rows={2}
              value={formData.bahan}
              onChange={(e) => setFormData({ ...formData, bahan: e.target.value })}
              placeholder="Ikan tenggiri cincang, tahu, wortel, santan kelapa..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Deskripsi Singkat & Manfaat Gizi
            </label>
            <textarea
              rows={2}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Kaya asam lemak omega-3 dan protein hewani lengkap untuk percepatan kejar tumbuh..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {selectedMenu ? 'Perbarui Menu' : 'Simpan Menu'}
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
        title="Hapus Menu Makanan"
        message={`Apakah Anda yakin ingin menghapus menu makanan "${selectedMenu?.nama_menu}"?`}
      />
    </div>
  );
};

export default MenuMakanan;

