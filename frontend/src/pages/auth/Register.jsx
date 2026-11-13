import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  UserCheck,
  Stethoscope,
  Shield,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    no_hp: '',
    password: '',
    confirm_password: '',
    role: 'petugas_gizi' // Default
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const appName = settings.nama_aplikasi || 'Gizita';

  const roleOptions = [
    {
      id: 'admin',
      title: 'Administrator',
      desc: 'Kelola pengguna, data puskesmas, dan master posyandu',
      icon: Shield,
      color: 'teal'
    },
    {
      id: 'petugas_gizi',
      title: 'Petugas Gizi',
      desc: 'Pendataan balita, orang tua, dan pemantauan posyandu',
      icon: UserCheck,
      color: 'emerald'
    },
    {
      id: 'dokter',
      title: 'Dokter Puskesmas',
      desc: 'Monitoring status balita dan pemeriksaan medis',
      icon: Stethoscope,
      color: 'blue'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.username || !formData.email || !formData.password) {
      setErrorMsg('Harap lengkapi semua kolom bertanda bintang (*).');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await api.post('/auth/register', {
        nama: formData.nama,
        username: formData.username,
        email: formData.email,
        no_hp: formData.no_hp,
        password: formData.password,
        role: formData.role
      });

      if (res.data.success) {
        toast.success('Pendaftaran akun berhasil! Silakan masuk.');
        navigate('/login');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Pendaftaran gagal. Silakan coba lagi.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Masuk
          </Link>
          <div className="flex items-center justify-center gap-3">
            <img
              src={settings?.logo_url || '/logo.png'}
              alt="Logo Gizita"
              className="h-12 w-auto max-w-[50px] object-contain drop-shadow-xs"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
            <div className="text-left">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{appName}</h1>
              <p className="text-xs text-teal-700 font-semibold uppercase tracking-wider">
                {settings?.nama_puskesmas || 'Puskesmas Kebun Kopi'}
              </p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-4 tracking-tight">
            Daftar Akun Pengguna Baru
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pilih hak akses (role) dan isi formulir pendaftaran untuk mengaktifkan akun Anda.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-shake">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Pilih Hak Akses (Role) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Pilih Hak Akses (Role) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = formData.role === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleRoleSelect(opt.id)}
                      className={`cursor-pointer rounded-2xl p-3 border text-left transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-600/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {opt.title}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                          {opt.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Informasi Pribadi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <Input
                  label="Nama Lengkap"
                  name="nama"
                  placeholder="cth: Sara Maulidia, S.Gz"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Username"
                  name="username"
                  placeholder="cth: saragizi"
                  icon={User}
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Alamat Email"
                  name="email"
                  type="email"
                  placeholder="cth: sara@puskesmas.id"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Nomor WhatsApp / HP"
                  name="no_hp"
                  placeholder="cth: 081234567890"
                  icon={Phone}
                  value={formData.no_hp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 3. Kata Sandi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kata Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl py-2.5 pl-10 pr-10 hover:border-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Konfirmasi Sandi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirm_password"
                    placeholder="Ulangi kata sandi"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl py-2.5 pl-10 pr-10 hover:border-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-sm"
              >
                Daftarkan Akun Sekarang
              </Button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Sudah memiliki akun?{' '}
            <Link
              to="/login"
              className="font-bold text-teal-700 hover:text-teal-800 transition-colors ml-1"
            >
              Masuk ke Sistem &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
