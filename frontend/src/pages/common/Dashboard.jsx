import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  Users,
  MapPin,
  Building2,
  ArrowRight,
  Clock,
  CheckCircle2,
  CircleDashed,
  Layers,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [balitaList, setBalitaList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, balitaRes] = await Promise.all([
        api.get('/dashboard/stats').catch(() => ({ data: { success: false } })),
        api.get('/balita?limit=5').catch(() => ({ data: { success: false } }))
      ]);

      if (statsRes.data?.success) {
        setData(statsRes.data.data);
      }
      if (balitaRes.data?.success) {
        setBalitaList(balitaRes.data.data?.rows || balitaRes.data.data || []);
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard bimbingan:', err);
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
      {/* Welcome Banner - Tahap 1 Bimbingan */}
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
            Modul Master Data Balita, Orang Tua, dan Posyandu telah siap digunakan pada milestone Tahap 1.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-lime-400/15 blur-3xl pointer-events-none" />
      </div>

      {/* Stat Cards - Tahap 1 Focused */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balita"
          value={ringkasan?.totalBalita || 0}
          subtitle="Terdata di sistem"
          icon={Baby}
        />
        <StatCard
          title="Data Orang Tua"
          value={ringkasan?.totalOrangTua || 0}
          subtitle="Kepala keluarga / Wali"
          icon={Users}
        />
        <StatCard
          title="Posyandu Aktif"
          value={ringkasan?.totalPosyandu || 4}
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

      {/* Main Grid: Data Balita & Roadmap Progres Skripsi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Balita Terdaftar Terbaru (2 Kolom) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Data Balita Terdaftar (Tahap 1)
              </h2>
              <p className="text-xs text-slate-700 mt-0.5">
                Sampel pendataan balita di wilayah kerja Posyandu Kebun Kopi
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

          {balitaList.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              <Baby className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-700">Belum ada data balita yang dimasukkan.</p>
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
                        {b.posyandu?.nama_posyandu || '-'}
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

        {/* Kolom Kanan: Rencana Milestone Skripsi (1 Kolom) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Milestone Progres
                </h2>
                <p className="text-xs text-slate-700">Status Pengerjaan Sistem</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Milestone 1 */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 block text-[13px]">
                      Tahap 1: Fondasi & Master Data
                    </span>
                    <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                      Autentikasi JWT & Role (Admin, Petugas, Dokter), Database MySQL, Master Data Balita, Orang Tua, dan Posyandu.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-200/80 text-emerald-900">
                      SELESAI (100%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone 2 */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0 animate-spin" />
                  <div>
                    <span className="font-bold text-amber-950 block text-[13px]">
                      Tahap 2: Antropometri & KMS
                    </span>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Implementasi algoritma WHO LMS, perhitungan Z-Score BB/U, TB/U, BB/TB, serta grafik kurva pertumbuhan digital.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-200/80 text-amber-900">
                      SEDANG DIKERJAKAN
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <CircleDashed className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block text-[13px]">
                      Tahap 3: PMT & Pelaporan
                    </span>
                    <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                      Rencana intervensi gizi, jadwal distribusi PMT, rekam medis dokter, dan ekspor laporan PDF/Excel.
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-200 text-slate-700">
                      TAHAP BERIKUTNYA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Target Bimbingan Berikutnya
            </span>
            <span className="font-semibold text-slate-700">Minggu Ini</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
