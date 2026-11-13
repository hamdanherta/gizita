import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Baby, Lock, User, Eye, EyeOff, ShieldCheck, HeartPulse, Activity, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const { settings } = useSettings();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const appName = settings.nama_aplikasi || 'Gizita';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg('Harap masukkan username/email dan kata sandi.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const loggedUser = await login(username, password);
      toast.success(`Selamat datang kembali, ${loggedUser.nama}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login gagal. Periksa kembali akun Anda.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-surface-light flex flex-col justify-center">
      <div className="flex-1 flex w-full">
        {/* Left Side: Branding / Info (Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/2 bg-teal-700 text-white flex-col justify-between p-12 relative overflow-hidden">
          {/* Subtle decoration circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-600/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-teal-800/40 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3.5 z-10">
            <img
              src={settings?.logo_url || '/logo.png'}
              alt="Logo Gizita"
              className="h-14 w-auto max-w-[64px] object-contain drop-shadow-md shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{appName}</h1>
              <p className="text-xs text-lime-300 uppercase tracking-wider font-semibold">
                {settings?.nama_puskesmas || 'Puskesmas Kebun Kopi'}
              </p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-md z-10 my-auto py-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/80 border border-lime-400/60 text-lime-300 text-xs font-semibold mb-6 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" /> Standar Permenkes No. 2 Tahun 2020
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Pemantauan & Perencanaan Gizi Balita Terpadu
            </h2>
            <p className="mt-4 text-sm text-teal-100/90 leading-relaxed">
              Sistem informasi cerdas untuk pemantauan antropometri, deteksi dini stunting dan wasting dengan Z-Score WHO, serta tata laksana intervensi gizi tepat sasaran.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3 mt-8 text-xs font-medium text-teal-100">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-800/40 border border-teal-600/50">
                <Activity className="w-4 h-4 text-lime-400" />
                <span>Kalkulasi Z-Score Otomatis</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-800/40 border border-teal-600/50">
                <HeartPulse className="w-4 h-4 text-lime-400" />
                <span>Kurva Pertumbuhan KMS</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-teal-200/80 z-10 border-t border-teal-600/50 pt-4 flex justify-between items-center">
            <span>© 2026 Puskesmas Kebun Kopi - Kota Jambi</span>
            <span>Versi 1.0.0</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Mobile Header */}
            <div className="text-center lg:text-left">
              <img
                src={settings?.logo_url || '/logo.png'}
                alt="Logo Gizita"
                className="inline-block lg:hidden h-14 w-auto max-w-[60px] object-contain mb-3 drop-shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
              />
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Sistem</h2>
              <p className="text-sm text-slate-500 mt-1">
                Silakan masuk dengan akun terdaftar di {settings?.nama_puskesmas || 'Puskesmas Kebun Kopi'}.
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Username atau Email"
                  placeholder="Masukkan username atau email"
                  icon={User}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

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
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl py-2.5 pl-10 pr-10 hover:border-slate-400 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none transition-colors"
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                Masuk Sekarang
              </Button>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-500 mb-2">Belum memiliki akun terdaftar?</p>
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-teal-600/30 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-600 text-teal-700 text-xs font-bold transition-all shadow-2xs active:scale-[0.98]"
                >
                  <UserPlus className="w-4 h-4" />
                  Daftar Akun Baru (Admin, Petugas, Dokter)
                </Link>
              </div>
            </form>

            {/* Demo Accounts Box for Rapid Testing */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
                Akun Demo Pengujian Cepat
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 transition-all text-center group"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">Admin</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">admin123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('petugas', 'petugas123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 transition-all text-center group"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">Petugas Gizi</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">petugas123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('dokter', 'dokter123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 transition-all text-center group"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">Dokter</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">dokter123</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

