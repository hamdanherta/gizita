import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut, ChevronDown, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Badge from '../common/Badge';

const Topbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifikasi?limit=5');
      if (res.data.success) {
        setNotifications(res.data.data.notifikasi || []);
        setUnreadCount(res.data.data.unread_count || 0);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling notifikasi setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifikasi/${id}/read`);
      fetchNotifications();
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifikasi/read-all');
      fetchNotifications();
      toast.success('Semua notifikasi ditandai sudah dibaca.');
    } catch {
      // Ignore
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Anda telah keluar dari aplikasi.');
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Administrator',
    petugas_gizi: 'Petugas Gizi',
    dokter: 'Dokter Puskesmas'
  }[user?.role] || user?.role;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Welcome */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Puskesmas Kebun Kopi</span>
          <h2 className="text-sm font-bold text-slate-800">
            Halo, <span className="text-teal-700">{user?.nama || 'Pengguna'}</span>
          </h2>
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/80 shadow-soft-lg py-2 z-50 animate-scale-up">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifikasi</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Tidak ada notifikasi
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left ${
                        !n.sudah_dibaca ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold ${!n.sudah_dibaca ? 'text-teal-900' : 'text-slate-800'}`}>
                          {n.judul}
                        </p>
                        {!n.sudah_dibaca && (
                          <span className="w-2 h-2 rounded-full bg-teal-500 mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{n.pesan}</p>
                      <span className="text-[10px] text-slate-400 mt-1.5 block">
                        {new Date(n.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center bg-slate-50/50">
                <Link
                  to="/notifikasi"
                  onClick={() => setShowNotifDropdown(false)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 block py-1"
                >
                  Lihat Semua Notifikasi &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
              {user?.nama?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user?.nama}</p>
              <p className="text-[10px] text-teal-700 font-medium">{roleLabel}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200/80 shadow-soft-lg py-2 z-50 animate-scale-up">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.nama}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <Badge variant="info">{roleLabel}</Badge>
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/profil"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Profil & Ubah Password
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Keluar (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

