import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Filter, Inbox } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

const Notifications = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotif = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifikasi?page=${page}&limit=12&unread_only=${unreadOnly}`);
      if (res.data.success) {
        setNotifications(res.data.data.notifikasi || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil daftar notifikasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotif();
  }, [page, unreadOnly]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifikasi/${id}/read`);
      fetchNotif();
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifikasi/read-all');
      toast.success('Semua notifikasi ditandai sudah dibaca.');
      fetchNotif();
    } catch {
      toast.error('Gagal menandai notifikasi.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" /> Notifikasi Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberitahuan peringatan status gizi, jadwal kegiatan, dan rekomendasi medis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={unreadOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setUnreadOnly(!unreadOnly);
              setPage(1);
            }}
          >
            {unreadOnly ? 'Tampilkan Semua' : 'Hanya Belum Dibaca'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
          >
            Tandai Semua Dibaca
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
          <EmptyState
            icon={Inbox}
            title="Tidak Ada Notifikasi"
            subtitle={unreadOnly ? 'Tidak ada notifikasi yang belum dibaca saat ini.' : 'Belum ada notifikasi yang masuk ke akun Anda.'}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden divide-y divide-slate-100">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.sudah_dibaca && handleMarkRead(item.id)}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !item.sudah_dibaca ? 'bg-teal-50/40 hover:bg-teal-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  !item.sudah_dibaca ? 'bg-teal-500 ring-4 ring-teal-100' : 'bg-transparent'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <h4 className={`text-sm font-bold ${!item.sudah_dibaca ? 'text-teal-950' : 'text-slate-800'}`}>
                    {item.judul}
                  </h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.pesan}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={item.tipe === 'danger' ? 'danger' : item.tipe === 'warning' ? 'warning' : 'info'}>
                    {item.tipe ? item.tipe.toUpperCase() : 'INFO'}
                  </Badge>
                  {item.sudah_dibaca && (
                    <span className="text-[10px] text-slate-400 italic">Sudah dibaca</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={12}
        onPageChange={setPage}
      />
    </div>
  );
};

export default Notifications;

