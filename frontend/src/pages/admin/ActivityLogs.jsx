import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, User, Shield } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const ActivityLogs = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modulFilter, setModulFilter] = useState('');
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/logs?page=${page}&limit=15&modul=${modulFilter}&tgl_mulai=${tglMulai}&tgl_selesai=${tglSelesai}`
      );
      if (res.data.success) {
        setLogs(res.data.data.logs || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil data log aktivitas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, modulFilter, tglMulai, tglSelesai]);

  const columns = [
    {
      header: 'Waktu (WIB)',
      width: '180px',
      render: (r) => (
        <span className="text-xs text-slate-500 font-mono">
          {new Date(r.created_at).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      )
    },
    {
      header: 'Pengguna',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">
            {r.user?.nama || 'Sistem / Anonim'}
          </span>
          <span className="text-[10px] text-slate-400">
            {r.user?.role ? r.user.role.toUpperCase() : '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Modul',
      render: (r) => <Badge variant="info">{r.modul}</Badge>
    },
    {
      header: 'Aksi',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          {r.aksi}
        </span>
      )
    },
    {
      header: 'Detail Aktivitas',
      render: (r) => <span className="text-xs text-slate-600 leading-relaxed">{r.detail}</span>
    },
    {
      header: 'IP Address',
      align: 'right',
      render: (r) => <span className="text-xs font-mono text-slate-400">{r.ip_address || '127.0.0.1'}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-teal-600" /> Log Aktivitas Pengguna
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rekaman jejak audit interaksi pengguna, perubahan data, dan sistem keamanan
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Filter Modul"
          value={modulFilter}
          onChange={(e) => {
            setModulFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Semua Modul' },
            { value: 'AUTH', label: 'Autentikasi (AUTH)' },
            { value: 'BALITA', label: 'Data Balita (BALITA)' },
            { value: 'PENGUKURAN', label: 'Pengukuran (PENGUKURAN)' },
            { value: 'INTERVENSI', label: 'Intervensi Gizi' },
            { value: 'PMT', label: 'Pemberian PMT' },
            { value: 'POSYANDU', label: 'Posyandu' },
            { value: 'PEMERIKSAAN', label: 'Pemeriksaan Dokter' },
            { value: 'REKOMENDASI', label: 'Rekomendasi Dokter' },
            { value: 'LAPORAN', label: 'Cetak Laporan' },
            { value: 'SISTEM', label: 'Pengaturan Sistem' }
          ]}
        />
        <Input
          label="Tanggal Mulai"
          type="date"
          value={tglMulai}
          onChange={(e) => {
            setTglMulai(e.target.value);
            setPage(1);
          }}
        />
        <Input
          label="Tanggal Selesai"
          type="date"
          value={tglSelesai}
          onChange={(e) => {
            setTglSelesai(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Table
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="Tidak ada catatan log aktivitas"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={15}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ActivityLogs;

