import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  Users,
  MapPin,
  HeartHandshake,
  AlertTriangle,
  Calendar,
  Activity,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import NutritionDonutChart from '../../components/charts/NutritionDonutChart';
import Skeleton from '../../components/common/Skeleton';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data.data);
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

  const { ringkasan, giziCounts, balitaPerluPerhatian = [], jadwalPosyanduTerdekat = [], jadwalPmtTerdekat = [], aktivitasTerbaru = [] } = data || {};

  // Donut chart dataset
  const donutData = [
    { name: 'Gizi Baik (Normal)', value: giziCounts?.giziBaik || 0, color: '#10b981' },
    { name: 'Gizi Kurang', value: giziCounts?.giziKurang || 0, color: '#f59e0b' },
    { name: 'Gizi Buruk', value: giziCounts?.giziBuruk || 0, color: '#ef4444' },
    { name: 'Stunting / Pendek', value: (giziCounts?.stunting || 0) + (giziCounts?.stuntingBerat || 0), color: '#ec4899' },
    { name: 'Gizi Lebih / Obesitas', value: (giziCounts?.giziLebih || 0) + (giziCounts?.obesitas || 0), color: '#8b5cf6' }
  ];

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
            Sistem Informasi Pemantauan dan Perencanaan Gizi Balita (Gizita) Puskesmas Kebun Kopi. Pantau indikator pertumbuhan dan status gizi anak secara berkala.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-lime-400/15 blur-3xl pointer-events-none" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balita"
          value={ringkasan?.totalBalita || 0}
          subtitle="Terdaftar di 4 Posyandu"
          icon={Baby}
          color="brand"
        />
        <StatCard
          title="Perlu Perhatian"
          value={ringkasan?.totalPerluPerhatian || 0}
          subtitle="Gizi Kurang / Stunting / Wasting"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Intervensi Berjalan"
          value={ringkasan?.totalIntervensi || 0}
          subtitle="Program PMT & Konseling"
          icon={HeartHandshake}
          color="amber"
        />
        <StatCard
          title={role === 'admin' ? 'Total Pengguna' : 'Wilayah Posyandu'}
          value={role === 'admin' ? ringkasan?.totalPengguna : ringkasan?.totalPosyandu}
          subtitle={role === 'admin' ? 'Admin, Petugas, Dokter' : 'Puskesmas Kebun Kopi'}
          icon={role === 'admin' ? Users : MapPin}
          color="blue"
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Balita Perlu Perhatian or Activity Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balita Perlu Perhatian */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Balita Perlu Perhatian Khusus
                </h3>
                <p className="text-xs text-slate-500">Balita dengan indikasi status gizi kurang, buruk, stunting, atau obesitas</p>
              </div>
              <Link
                to="/status-gizi?perlu_perhatian=true"
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {balitaPerluPerhatian.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Alhamdulillah, tidak ada balita dengan status gizi kritis.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                      <th className="pb-2.5">Nama Balita</th>
                      <th className="pb-2.5">Posyandu</th>
                      <th className="pb-2.5">BB / TB</th>
                      <th className="pb-2.5">Status Gizi</th>
                      <th className="pb-2.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {balitaPerluPerhatian.slice(0, 5).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">
                          {b.nama}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {b.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}, {b.umur_bulan} bln
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">{b.posyandu}</td>
                        <td className="py-3 text-slate-700 font-medium">
                          {b.berat_badan} kg / {b.tinggi_badan} cm
                        </td>
                        <td className="py-3">
                          <Badge status={b.status_final}>{b.status_final}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/balita/${b.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-teal-700 hover:bg-teal-50 font-medium transition-colors text-xs"
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

          {/* Role specific: Admin sees Activity Logs, Petugas/Dokter sees PMT or Doctor Notes */}
          {role === 'admin' ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Aktivitas Sistem Terbaru</h3>
                <Link to="/admin/logs" className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1">
                  Semua Log <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {aktivitasTerbaru.map((log) => (
                  <div key={log.id} className="flex items-start justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-800">{log.user?.nama || 'Sistem'}</span>{' '}
                      <span className="text-slate-600">{log.detail}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Jadwal Distribusi PMT Terdekat</h3>
                <Link to="/pmt/jadwal" className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1">
                  Kelola PMT <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="space-y-2.5">
                {jadwalPmtTerdekat.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">Tidak ada jadwal PMT dalam waktu dekat.</div>
                ) : (
                  jadwalPmtTerdekat.map((j) => (
                    <div key={j.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <p className="font-semibold text-slate-800">{j.balita?.nama}</p>
                        <p className="text-[11px] text-slate-500">Tanggal: {j.tanggal}</p>
                      </div>
                      <Badge status={j.status}>{j.status}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Donut Chart & Jadwal Posyandu */}
        <div className="space-y-6">
          {/* Nutrition Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Proporsi Status Gizi Balita</h3>
            <p className="text-xs text-slate-500 mb-2">Berdasarkan penimbangan terkini</p>
            <NutritionDonutChart data={donutData} />
          </div>

          {/* Posyandu Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" /> Agenda Posyandu Mendatang
              </h3>
              <Link to="/jadwal-posyandu" className="text-xs font-semibold text-teal-700 hover:text-teal-900">
                Lihat
              </Link>
            </div>
            <div className="space-y-2.5">
              {jadwalPosyanduTerdekat.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">Belum ada agenda jadwal posyandu mendatang.</div>
              ) : (
                jadwalPosyanduTerdekat.map((sc) => (
                  <div key={sc.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-900">{sc.wilayahPosyandu?.nama_posyandu}</span>
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                        {sc.tanggal}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] truncate">{sc.kegiatan || 'Penimbangan & Imunisasi'}</p>
                    <p className="text-[10px] text-slate-400">Lokasi: {sc.lokasi || '-'}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

