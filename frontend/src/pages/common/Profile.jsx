import React, { useState } from 'react';
import { User, Lock, Mail, Phone, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [nama, setNama] = useState(user?.nama || '');
  const [email, setEmail] = useState(user?.email || '');
  const [noHp, setNoHp] = useState(user?.no_hp || '');
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoadingProfile(true);
      const res = await api.put('/auth/profile', { nama, email, no_hp: noHp });
      if (res.data.success) {
        updateUser(res.data.data);
        toast.success('Profil berhasil diperbarui.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordBaru !== konfirmasiPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }
    if (passwordBaru.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter.');
      return;
    }

    try {
      setLoadingPassword(true);
      const res = await api.put('/auth/change-password', {
        password_lama: passwordLama,
        password_baru: passwordBaru
      });
      if (res.data.success) {
        toast.success('Kata sandi berhasil diubah.');
        setPasswordLama('');
        setPasswordBaru('');
        setKonfirmasiPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah kata sandi.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Profil & Pengaturan Akun</h1>
        <p className="text-xs text-slate-500 mt-0.5">Kelola identitas akun dan keamanan kata sandi Anda</p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-teal-600/20">
          {user?.nama?.charAt(0) || 'U'}
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{user?.nama}</h2>
            <div>
              <Badge variant="info">{user?.role?.toUpperCase()}</Badge>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Username: @{user?.username} • Puskesmas Kebun Kopi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Biodata */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" /> Informasi Pribadi
          </h3>
          <p className="text-xs text-slate-500 mb-5">Perbarui nama dan kontak aktif Anda</p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
            />
            <Input
              label="Alamat Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Nomor WhatsApp / HP"
              icon={Phone}
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="081234567890"
            />
            <Button
              type="submit"
              variant="primary"
              loading={loadingProfile}
              className="w-full mt-2"
            >
              Simpan Profil
            </Button>
          </form>
        </div>

        {/* Form Ubah Password */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" /> Ganti Kata Sandi
          </h3>
          <p className="text-xs text-slate-500 mb-5">Gunakan kombinasi minimal 6 karakter demi keamanan akun</p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Kata Sandi Lama"
              type="password"
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              placeholder="Masukkan kata sandi saat ini"
              required
            />
            <Input
              label="Kata Sandi Baru"
              type="password"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              value={konfirmasiPassword}
              onChange={(e) => setKonfirmasiPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              required
            />
            <Button
              type="submit"
              variant="secondary"
              loading={loadingPassword}
              className="w-full mt-2"
            >
              Perbarui Kata Sandi
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

