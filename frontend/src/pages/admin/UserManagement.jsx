import React, { useState, useEffect } from 'react';
import { Users, UserPlus, KeyRound, Edit, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';

const UserManagement = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    role: 'petugas_gizi',
    no_hp: '',
    status_aktif: true
  });
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users?page=${page}&limit=10&search=${search}&role=${roleFilter}`);
      if (res.data.success) {
        setUsers(res.data.data.users || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await api.post('/users', formData);
      if (res.data.success) {
        toast.success('Pengguna baru berhasil dibuat.');
        setIsCreateOpen(false);
        setFormData({ nama: '', username: '', email: '', password: '', role: 'petugas_gizi', no_hp: '', status_aktif: true });
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pengguna.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await api.put(`/users/${selectedUser.id}`, formData);
      if (res.data.success) {
        toast.success('Data pengguna berhasil diperbarui.');
        setIsEditOpen(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui pengguna.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      const res = await api.put(`/users/${selectedUser.id}/reset-password`, { password_baru: newPassword });
      if (res.data.success) {
        toast.success(`Password untuk ${selectedUser.nama} berhasil direset.`);
        setIsResetOpen(false);
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset kata sandi.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setModalLoading(true);
      const res = await api.delete(`/users/${selectedUser.id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Pengguna berhasil dihapus.');
        setIsDeleteOpen(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pengguna.');
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormData({
      nama: u.nama,
      username: u.username,
      email: u.email,
      role: u.role,
      no_hp: u.no_hp || '',
      status_aktif: u.status_aktif
    });
    setIsEditOpen(true);
  };

  const openResetModal = (u) => {
    setSelectedUser(u);
    setNewPassword('');
    setIsResetOpen(true);
  };

  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setIsDeleteOpen(true);
  };

  const columns = [
    {
      header: 'Pengguna',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.nama}</span>
          <span className="text-xs text-slate-400">@{r.username} • {r.email}</span>
        </div>
      )
    },
    {
      header: 'Peran (Role)',
      render: (r) => (
        <Badge variant={r.role === 'admin' ? 'info' : r.role === 'dokter' ? 'purple' : 'success'}>
          {r.role === 'admin' ? 'Administrator' : r.role === 'dokter' ? 'Dokter' : 'Petugas Gizi'}
        </Badge>
      )
    },
    {
      header: 'Kontak',
      render: (r) => <span className="text-xs text-slate-600">{r.no_hp || '-'}</span>
    },
    {
      header: 'Status',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${r.status_aktif ? 'text-emerald-600' : 'text-slate-400'}`}>
          {r.status_aktif ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {r.status_aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    },
    {
      header: 'Login Terakhir',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.last_login ? new Date(r.last_login).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belum pernah'}
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
            onClick={() => openResetModal(r)}
            title="Reset Password"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(r)}
            title="Edit Pengguna"
          >
            <Edit className="w-3.5 h-3.5 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openDeleteModal(r)}
            title="Hapus Pengguna"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </Button>
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
            <Users className="w-5 h-5 text-teal-600" /> Kelola Akun & Pengguna
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen akun administrator, petugas gizi, dan dokter Puskesmas Kebun Kopi
          </p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => {
            setFormData({ nama: '', username: '', email: '', password: '', role: 'petugas_gizi', no_hp: '', status_aktif: true });
            setIsCreateOpen(true);
          }}
        >
          Tambah Pengguna
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Cari berdasarkan nama, username, atau email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Semua Peran (Role)"
            options={[
              { value: '', label: 'Semua Peran' },
              { value: 'admin', label: 'Administrator' },
              { value: 'petugas_gizi', label: 'Petugas Gizi' },
              { value: 'dokter', label: 'Dokter' }
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="Tidak ada pengguna ditemukan"
      />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={10}
        onPageChange={setPage}
      />

      {/* Modal Tambah Pengguna */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Pengguna Baru"
        subtitle="Buat akun untuk petugas atau dokter puskesmas"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="dr. Contoh Sp.A / Petugas Gizi"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username_login"
              required
            />
            <Input
              label="Alamat Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@puskesmas.id"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kata Sandi Awal"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimal 6 karakter"
              required
            />
            <Select
              label="Peran (Role)"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'petugas_gizi', label: 'Petugas Gizi' },
                { value: 'dokter', label: 'Dokter' },
                { value: 'admin', label: 'Administrator' }
              ]}
              required
            />
          </div>
          <Input
            label="Nomor Telepon / WhatsApp"
            value={formData.no_hp}
            onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
            placeholder="081234567890"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Pengguna */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Ubah Data Pengguna"
        subtitle={`Mengubah akun ${selectedUser?.nama}`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username (Readonly)"
              value={formData.username}
              disabled
            />
            <Input
              label="Alamat Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Peran (Role)"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'petugas_gizi', label: 'Petugas Gizi' },
                { value: 'dokter', label: 'Dokter' },
                { value: 'admin', label: 'Administrator' }
              ]}
              required
            />
            <Select
              label="Status Akun"
              value={formData.status_aktif ? '1' : '0'}
              onChange={(e) => setFormData({ ...formData, status_aktif: e.target.value === '1' })}
              options={[
                { value: '1', label: 'Aktif' },
                { value: '0', label: 'Nonaktif' }
              ]}
            />
          </div>
          <Input
            label="Nomor Telepon / WhatsApp"
            value={formData.no_hp}
            onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Perbarui Pengguna
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Reset Kata Sandi Pengguna"
        subtitle={`Reset kata sandi untuk akun ${selectedUser?.nama}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="Kata Sandi Baru"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsResetOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              Simpan Kata Sandi Baru
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={modalLoading}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun ${selectedUser?.nama}? Jika akun memiliki riwayat transaksi, status akan dinonaktifkan demi integritas data.`}
      />
    </div>
  );
};

export default UserManagement;

