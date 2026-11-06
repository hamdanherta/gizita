import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  History,
  Settings,
  Baby,
  UserCheck,
  Scale,
  LineChart,
  Activity,
  HeartHandshake,
  CalendarDays,
  Utensils,
  FileText,
  Stethoscope,
  ClipboardList,
  CheckSquare,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { settings } = useSettings();

  const appName = settings.nama_aplikasi || 'Gizita';

  // Daftar menu terbagi per role
  const adminMenus = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Kelola Pengguna', path: '/admin/pengguna', icon: Users },
    { title: 'Data Puskesmas', path: '/admin/puskesmas', icon: Building2 },
    { title: 'Data Posyandu', path: '/admin/posyandu', icon: MapPin },
    { title: 'Log Aktivitas', path: '/admin/logs', icon: History },
    { title: 'Pengaturan Sistem', path: '/admin/pengaturan', icon: Settings }
  ];

  const petugasMenus = [
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Data Balita', path: '/balita', icon: Baby },
    { title: 'Data Orang Tua', path: '/orang-tua', icon: UserCheck },
    { title: 'Input Pengukuran', path: '/pengukuran/input', icon: Scale },
    { title: 'Grafik KMS', path: '/pantau-pertumbuhan', icon: LineChart },
    { title: 'Status Gizi Balita', path: '/status-gizi', icon: Activity },
    { title: 'Rencana Intervensi', path: '/intervensi', icon: HeartHandshake },
    { title: 'Jadwal PMT', path: '/pmt/jadwal', icon: CalendarDays },
    { title: 'Catat Konsumsi PMT', path: '/pmt/konsumsi', icon: CheckSquare },
    { title: 'Menu Makanan PMT', path: '/menu', icon: Utensils },
    { title: 'Jadwal Posyandu', path: '/jadwal-posyandu', icon: MapPin },
    { title: 'Cetak Laporan', path: '/laporan', icon: FileText }
  ];

  const dokterMenus = [
    { title: 'Dashboard Dokter', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Data Balita & Status', path: '/balita', icon: Baby },
    { title: 'Grafik KMS Balita', path: '/pantau-pertumbuhan', icon: LineChart },
    { title: 'Pemeriksaan Kesehatan', path: '/dokter/pemeriksaan', icon: Stethoscope },
    { title: 'Rekomendasi Medis', path: '/dokter/rekomendasi', icon: ClipboardList },
    { title: 'Rencana Intervensi', path: '/intervensi', icon: HeartHandshake },
    { title: 'Jadwal Posyandu', path: '/jadwal-posyandu', icon: CalendarDays },
    { title: 'Laporan Pemantauan', path: '/laporan', icon: FileText }
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
              className="h-10 w-auto max-w-[46px] object-contain shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                {appName}
              </h1>
              <p className="text-[10px] font-semibold text-teal-600 tracking-wide uppercase">
                {settings?.nama_puskesmas || 'Puskesmas Kebun Kopi'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu Utama ({role === 'admin' ? 'Admin' : role === 'dokter' ? 'Dokter' : 'Petugas Gizi'})
          </div>
          {currentMenus.map((item, idx) => (
            <NavItem key={idx} item={item} />
          ))}
        </div>

        {/* Footer Puskesmas info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-500 font-medium">
            <p className="font-semibold text-slate-700">Puskesmas Kebun Kopi</p>
            <p className="truncate">Kota Jambi, Indonesia</p>
            <p className="text-[10px] text-slate-400 mt-1">Standar Permenkes No. 2/2020</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

