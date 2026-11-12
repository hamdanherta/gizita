import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  Users,
  MapPin,
  Building2,
  ArrowRight,
  Plus,
  UserCheck,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [balitaList, setBalitaList] = useState([]);
  const [posyanduList, setPosyanduList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, balitaRes, posyanduRes] = await Promise.all([
        api.get('/dashboard/stats').catch(() => ({ data: { success: false } })),
        api.get('/balita?limit=5').catch(() => ({ data: { success: false } })),
        api.get('/posyandu').catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data?.success) {
        setData(statsRes.data.data);
      }
      if (balitaRes.data?.success) {
        const raw = balitaRes.data.data;
        if (Array.isArray(raw)) {
          setBalitaList(raw);
        } else if (raw && Array.isArray(raw.balita)) {
          setBalitaList(raw.balita);
        } else if (raw && Array.isArray(raw.rows)) {
          setBalitaList(raw.rows);
        } else {
          setBalitaList([]);
        }
      }
      if (posyanduRes.data?.success) {
        const pRaw = posyanduRes.data.data;
        setPosyanduList(Array.isArray(pRaw) ? pRaw : []);
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { ringkasan } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-soft-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/90 border border-lime-400/60 text-lime-300 text-xs font-semibold mb-3 shadow-xs">
            {role === 'admin' ? 'Hak Akses: Administrator' : role === 'dokter' ? 'Hak Akses: Dokter Puskesmas' : 'Hak Akses: Petugas Gizi'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {user?.nama}!
          </h1>
          <p className="mt-2 text-sm text-teal-100/90 leading-relaxed">
            Sistem Informasi Pemantauan dan Perencanaan Gizi Balita (Gizita) Puskesmas Kebun Kopi.
            Kelola master data balita, orang tua, dan wilayah posyandu secara terpadu.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-lime-400/15 blur-3xl pointer-events-none" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balita"
          value={ringkasan?.totalBalita || 0}
          subtitle="Terdata di sistem"
          icon={Baby}
        />
        <StatCard
          title="Pengguna Sistem"
          value={ringkasan?.totalPengguna || 3}
          subtitle="Admin, Petugas & Dokter"
          icon={Users}
        />
        <StatCard
          title="Posyandu Aktif"
          value={ringkasan?.totalPosyandu || posyanduList.length || 4}
          subtitle="Wilayah kerja Kebun Kopi"
          icon={MapPin}
        />
        <StatCard
          title="Fasilitas Puskesmas"
          value={1}
          subtitle="PKM Kebun Kopi"
          icon={Building2}
        />
      </div>

      {/* Main Grid: Data Balita & Posyandu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Balita Terdaftar Terbaru (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Data Balita Terdaftar
                </h2>
                <p className="text-xs text-slate-700 mt-0.5">
                  Daftar balita yang baru didata di wilayah kerja Puskesmas Kebun Kopi
                </p>
              </div>
              <Link
                to="/balita"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
              >
                Lihat Semua
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!Array.isArray(balitaList) || balitaList.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3 border border-teal-100/60 shadow-xs">
                  <Baby className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                  Belum Ada Data Balita
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Sistem saat ini belum memiliki data balita terdaftar. Silakan mulai pendataan data balita baru.
                </p>
                <div className="mt-4">
                  <Link to="/balita">
                    <Button variant="primary" size="sm" icon={Plus}>
                      Daftarkan Balita Baru
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Nama Balita</th>
                      <th className="py-2.5 px-3">Jenis Kelamin</th>
                      <th className="py-2.5 px-3">Tanggal Lahir</th>
                      <th className="py-2.5 px-3">Posyandu</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {balitaList.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {b.nama}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={b.jenis_kelamin === 'L' ? 'info' : 'secondary'}>
                            {b.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          {b.tanggal_lahir ? new Date(b.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {b.wilayah_posyandu?.nama_posyandu || b.posyandu?.nama_posyandu || '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/balita/${b.id}`}
                            className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                          >
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Akses cepat pendataan keluarga:</span>
            <Link
              to="/orang-tua"
              className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Kelola Data Orang Tua &rarr;
            </Link>
          </div>
        </div>

        {/* Kolom Kanan: Wilayah Posyandu Terintegrasi (1 Kolom) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Wilayah Posyandu
                  </h2>
                  <p className="text-xs text-slate-700">Posyandu Binaan PKM Kebun Kopi</p>
                </div>
              </div>
              {role === 'admin' && (
                <Link
                  to="/admin/posyandu"
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Kelola
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {posyanduList.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-slate-200/70 hover:border-teal-300 hover:bg-teal-50/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{p.nama_posyandu}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                      {p.kelurahan_desa || 'Kebun Kopi'}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="truncate max-w-[150px]">{p.nama_kader || 'Kader Posyandu'}</span>
                    {p.telepon_kader && (
                      <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <Phone className="w-3 h-3 text-teal-600" />
                        {p.telepon_kader}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-500">
              Puskesmas Kebun Kopi &bull; Terhubung Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
