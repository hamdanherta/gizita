import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Activity, Search, Filter, Download, ArrowRight, Eye, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';

const StatusGiziList = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const initialPerluPerhatian = searchParams.get('perlu_perhatian') || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posyanduList, setPosyanduList] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [posyanduId, setPosyanduId] = useState('');
  const [perluPerhatian, setPerluPerhatian] = useState(initialPerluPerhatian);
  const [statusFinalFilter, setStatusFinalFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchPosyandu = async () => {
    try {
      const res = await api.get('/posyandu');
      if (res.data.success) setPosyanduList(res.data.data || []);
    } catch {
      // Ignore
    }
  };

  const fetchStatusGizi = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/status-gizi?page=${page}&limit=12&search=${search}&posyandu_id=${posyanduId}&status_final=${statusFinalFilter}&perlu_perhatian=${perluPerhatian}`
      );
      if (res.data.success) {
        setItems(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalItems(res.data.data.total || 0);
      }
    } catch {
      toast.error('Gagal mengambil daftar status gizi balita.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosyandu();
  }, []);

  useEffect(() => {
    fetchStatusGizi();
  }, [page, search, posyanduId, statusFinalFilter, perluPerhatian]);

  const columns = [
    {
      header: 'Nama Balita',
      render: (r) => (
        <div>
          <Link
            to={`/balita/${r.balita_id}`}
            className="font-bold text-slate-900 hover:text-teal-700 transition-colors block"
          >
            {r.nama}
          </Link>
          <span className="text-xs text-slate-400">
            {r.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • NIK: {r.nik || '-'}
          </span>
        </div>
      )
    },
    {
      header: 'Posyandu / Ortu',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{r.posyandu}</span>
          <span className="text-[11px] text-slate-500">Ibu: {r.orang_tua}</span>
        </div>
      )
    },
    {
      header: 'Pengukuran (BB / TB)',
      render: (r) => {
        const p = r.pengukuran_terakhir;
        if (!p) return <span className="text-xs text-slate-400 italic">Belum diukur</span>;
        return (
          <span className="text-xs font-semibold text-slate-800">
            {p.berat_badan} kg / {p.tinggi_badan} cm
            <span className="block text-[10px] text-slate-400 font-normal">Usia: {p.umur_bulan} Bln</span>
          </span>
        );
      }
    },
    {
      header: 'Z-Score BB/U',
      render: (r) => {
        const p = r.pengukuran_terakhir;
        if (!p) return '-';
        return (
          <div>
            <span className="font-mono text-xs font-semibold">{p.zscore_bbu} SD</span>
            <span className="block text-[10px] text-slate-500">{p.kategori_bbu}</span>
          </div>
        );
      }
    },
    {
      header: 'Z-Score TB/U',
      render: (r) => {
        const p = r.pengukuran_terakhir;
        if (!p) return '-';
        return (
          <div>
            <span className="font-mono text-xs font-semibold">{p.zscore_tbu} SD</span>
            <span className="block text-[10px] text-slate-500">{p.kategori_tbu}</span>
          </div>
        );
      }
    },
    {
      header: 'Z-Score BB/TB',
      render: (r) => {
        const p = r.pengukuran_terakhir;
        if (!p) return '-';
        return (
          <div>
            <span className="font-mono text-xs font-semibold">{p.zscore_bbtb} SD</span>
            <span className="block text-[10px] text-slate-500">{p.kategori_bbtb}</span>
          </div>
        );
      }
    },
    {
      header: 'Status Akhir',
      render: (r) => {
        const p = r.pengukuran_terakhir;
        if (!p) return <span className="text-xs text-slate-400">-</span>;
        return <Badge status={p.status_final}>{p.status_final}</Badge>;
      }
    },
    {
      header: 'Aksi',
      align: 'right',
      render: (r) => (
        <Link
          to={`/balita/${r.balita_id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Detail
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" /> Rekapitulasi Status Gizi Balita
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap status gizi balita berdasarkan penimbangan terkini standar Permenkes No. 2 Tahun 2020
          </p>
        </div>
        <Link to="/laporan?jenis=rekap_status_gizi">
          <Button variant="outline" icon={Download}>
            Cetak / Ekspor Laporan
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          icon={Search}
          placeholder="Cari nama balita atau NIK..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <Select
          value={posyanduId}
          onChange={(e) => {
            setPosyanduId(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Semua Posyandu' },
            ...posyanduList.map((p) => ({ value: p.id, label: p.nama_posyandu }))
          ]}
        />

        <Select
          value={perluPerhatian}
          onChange={(e) => {
            setPerluPerhatian(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Semua Kondisi Balita' },
            { value: 'true', label: '⚠️ Hanya Perlu Perhatian' }
          ]}
        />

        <Select
          value={statusFinalFilter}
          onChange={(e) => {
            setStatusFinalFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Semua Status Final' },
            { value: 'Gizi Baik (Normal)', label: 'Gizi Baik (Normal)' },
            { value: 'Gizi Kurang', label: 'Gizi Kurang' },
            { value: 'Gizi Buruk', label: 'Gizi Buruk' },
            { value: 'Pendek (Stunting)', label: 'Pendek (Stunting)' },
            { value: 'Sangat Pendek (Stunting Berat)', label: 'Sangat Pendek (Stunting Berat)' },
            { value: 'Obesitas', label: 'Obesitas' },
            { value: 'Gizi Lebih', label: 'Gizi Lebih' }
          ]}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={items}
        loading={loading}
        emptyMessage="Tidak ada balita yang sesuai filter"
      />

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

export default StatusGiziList;

