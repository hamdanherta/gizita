import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Baby,
  UserCheck,
  Clock,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { settings } = useSettings();

  const appName = settings.nama_aplikasi || 'Gizita';

  // =========================================================================
  // TAHAP 1 (Progres Bimbingan Skripsi - Modul Master Data & Autentikasi)
  // Fitur Antropometri, KMS, PMT, dan Laporan sedang dikerjakan pada Tahap 2 & 3
  // =========================================================================

  const adminMenus = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Kelola Pengguna', path: '/admin/pengguna', icon: Users },
    { title: 'Data Puskesmas', path: '/admin/puskesmas', icon: Building2 },
    { title: 'Data Posyandu', path: '/admin/posyandu', icon: MapPin },
    // TODO (Tahap 3): Log Aktivitas & Pengaturan Sistem Lanjutan
  ];

  const petugasMenus = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Data Balita', path: '/balita', icon: Baby },
    { title: 'Data Orang Tua', path: '/orang-tua', icon: UserCheck },
    // -------------------------------------------------------------
    // // TAHAP 2 (Dalam Pengembangan: Antropometri & Grafik KMS):
    // { title: 'Input Pengukuran', path: '/pengukuran/input', icon: Scale },
    // { title: 'Grafik KMS', path: '/pantau-pertumbuhan', icon: LineChart },
    // { title: 'Status Gizi Balita', path: '/status-gizi', icon: Activity },
    // -------------------------------------------------------------
    // // TAHAP 3 (Akan Datang: Intervensi PMT & Cetak Laporan):
    // { title: 'Rencana Intervensi', path: '/intervensi', icon: HeartHandshake },
    // { title: 'Jadwal PMT', path: '/pmt/jadwal', icon: CalendarDays },
    // { title: 'Menu Makanan PMT', path: '/menu', icon: Utensils },
    // { title: 'Cetak Laporan', path: '/laporan', icon: FileText }
  ];

  const dokterMenus = [
    { title: 'Dashboard Dokter', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Data Balita', path: '/balita', icon: Baby },
    // TODO (Tahap 2 & 3): Modul Rekam Medis & Rekomendasi Gizi Dokter
  ];

  let currentMenus = [];
  if (role === 'admin') currentMenus = adminMenus;
  else if (role === 'petugas_gizi') currentMenus = petugasMenus;
  else if (role === 'dokter') currentMenus = dokterMenus;

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={() => onClose && onClose()}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-teal-50 text-teal-800 font-semibold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`w-4 h-4 transition-colors ${
              isActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span>{item.title}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={settings?.logo_url || '/logo.png'}
              alt="Logo Gizita"
              className="w-9 h-9 object-contain rounded-xl p-0.5 border border-slate-100"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
            <div>
              <span className="font-bold text-slate-800 text-base tracking-tight block">
                {appName}
              </span>
              <span className="text-[10px] text-teal-700 font-medium block">
                Puskesmas Kebun Kopi
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menus */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Menu Utama (Tahap 1)
            </p>
            <nav className="space-y-1">
              {currentMenus.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </nav>
          </div>

          {/* Development Roadmap Indicator for Thesis */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Target Tahap 2</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              Kalkulasi Antropometri Z-Score WHO & Grafik KMS digital sedang dikembangkan.
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-600 text-center">
          <p className="font-semibold text-slate-700">Gizita v0.4 (Tahap 1)</p>
          <p className="text-[10px] text-slate-600">Sistem Informasi Gizi Balita</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
