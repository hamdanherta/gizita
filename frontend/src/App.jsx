import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages - Tahap 1 (Autentikasi & Profil)
import Login from './pages/auth/Login';
import Dashboard from './pages/common/Dashboard';
import Profile from './pages/common/Profile';
import Notifications from './pages/common/Notifications';

// Admin Pages - Tahap 1 (Master Data User, Puskesmas, Posyandu)
import UserManagement from './pages/admin/UserManagement';
import PuskesmasManagement from './pages/admin/PuskesmasManagement';
import PosyanduManagement from './pages/admin/PosyanduManagement';

// Petugas Gizi & Shared Pages - Tahap 1 (Master Data Balita & Orang Tua)
import BalitaList from './pages/gizi/BalitaList';
import BalitaDetail from './pages/gizi/BalitaDetail';
import OrangTuaList from './pages/gizi/OrangTuaList';

// =========================================================================
// CATATAN PENGEMBANGAN (Bimbingan Skripsi Tahap 1):
// Modul-modul di bawah ini merupakan rencana pengerjaan Tahap 2 & Tahap 3:
//
// // TAHAP 2 (Dalam Pengembangan: Antropometri & KMS WHO LMS):
// // import PengukuranInput from './pages/gizi/PengukuranInput';
// // import GrowthMonitoring from './pages/gizi/GrowthMonitoring';
// // import StatusGiziList from './pages/gizi/StatusGiziList';
//
// // TAHAP 3 (Akan Datang: Intervensi PMT, Rekomendasi Dokter, & Pelaporan):
// // import IntervensiList from './pages/gizi/IntervensiList';
// // import JadwalPmt from './pages/gizi/JadwalPmt';
// // import KonsumsiPmt from './pages/gizi/KonsumsiPmt';
// // import MenuMakanan from './pages/gizi/MenuMakanan';
// // import JadwalPosyandu from './pages/gizi/JadwalPosyandu';
// // import Laporan from './pages/gizi/Laporan';
// // import PemeriksaanList from './pages/dokter/PemeriksaanList';
// // import RekomendasiList from './pages/dokter/RekomendasiList';
// // import ActivityLogs from './pages/admin/ActivityLogs';
// // import SystemSettings from './pages/admin/SystemSettings';
// =========================================================================

function App() {
  const [lockedMsg, setLockedMsg] = useState(null);

  useEffect(() => {
    const handleLocked = (e) => {
      setLockedMsg(e.detail || 'Masa lisensi evaluasi telah berakhir atau dinonaktifkan oleh pengembang.');
    };
    window.addEventListener('gizita:license-locked', handleLocked);
    return () => window.removeEventListener('gizita:license-locked', handleLocked);
  }, []);

  return (
    <>
      {lockedMsg && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center border border-red-100 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-100">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Akses Sistem Terkunci</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {lockedMsg}
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <span className="font-semibold block text-slate-800">Pemberitahuan Lisensi:</span>
              <span>Silakan hubungi Hamdani untuk penyelesaian Pembayaran dan aktivasi lisensi resmi.</span>
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Default redirect to Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/notifikasi" element={<Notifications />} />

            {/* Admin Routes - Tahap 1 */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/pengguna" element={<UserManagement />} />
              <Route path="/admin/puskesmas" element={<PuskesmasManagement />} />
              <Route path="/admin/posyandu" element={<PosyanduManagement />} />
              {/* TODO Tahap 3: Logs & Settings */}
            </Route>

            {/* Master Data Balita - Tahap 1 */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'petugas_gizi', 'dokter']} />}>
              <Route path="/balita" element={<BalitaList />} />
              <Route path="/balita/:id" element={<BalitaDetail />} />
              {/*
                TODO: Tahap 2 (Antropometri & KMS):
                <Route path="/pantau-pertumbuhan" element={<GrowthMonitoring />} />
                <Route path="/status-gizi" element={<StatusGiziList />} />
              */}
              {/*
                TODO: Tahap 3 (PMT, Posyandu, Laporan):
                <Route path="/intervensi" element={<IntervensiList />} />
                <Route path="/jadwal-posyandu" element={<JadwalPosyandu />} />
                <Route path="/laporan" element={<Laporan />} />
              */}
            </Route>

            {/* Data Orang Tua - Tahap 1 */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'petugas_gizi']} />}>
              <Route path="/orang-tua" element={<OrangTuaList />} />
              {/*
                TODO: Tahap 2 (Input Pengukuran):
                <Route path="/pengukuran/input" element={<PengukuranInput />} />
              */}
              {/*
                TODO: Tahap 3 (Manajemen PMT):
                <Route path="/pmt/jadwal" element={<JadwalPmt />} />
                <Route path="/pmt/konsumsi" element={<KonsumsiPmt />} />
                <Route path="/menu" element={<MenuMakanan />} />
              */}
            </Route>

            {/*
              TODO: Tahap 3 (Dokter Khusus):
              <Route element={<ProtectedRoute allowedRoles={['admin', 'dokter']} />}>
                <Route path="/dokter/pemeriksaan" element={<PemeriksaanList />} />
                <Route path="/dokter/rekomendasi" element={<RekomendasiList />} />
              </Route>
            */}
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
