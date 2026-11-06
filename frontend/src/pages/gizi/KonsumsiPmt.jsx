import React, { useState, useEffect } from 'react';
import { CheckSquare, Search, Filter, PieChart, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatCard from '../../components/common/StatCard';

const KonsumsiPmt = () => {
  const toast = useToast();

  const [compliance, setCompliance] = useState(null);
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posyanduList, setPosyanduList] = useState([]);
  const [posyanduId, setPosyanduId] = useState('');

  const fetchDependencies = async () => {
    try {
      const res = await api.get('/posyandu');
      if (res.data.success) setPosyanduList(res.data.data || []);
    } catch {
      // Ignore
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resC, resJ] = await Promise.all([
        api.get(`/pmt/compliance?posyandu_id=${posyanduId}`),
        api.get(`/pmt/jadwal?status=diberikan&limit=20&posyandu_id=${posyanduId}`)
      ]);
      if (resC.data.success) setCompliance(resC.data.data);
      if (resJ.data.success) setJadwalList(resJ.data.data.jadwal || []);
    } catch {
      toast.error('Gagal mengambil ringkasan kepatuhan PMT.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchData();
  }, [posyanduId]);

  const columns = [
    {
      header: 'Tanggal',
      render: (r) => <span className="font-semibold text-slate-800 text-xs">{r.tanggal}</span>
    },
    {
      header: 'Nama Balita',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 block">{r.balita?.nama}</span>
          <span className="text-[11px] text-slate-500">{r.balita?.wilayahPosyandu?.nama_posyandu}</span>
        </div>
      )
    },
    {
      header: 'Menu PMT',
      render: (r) => <span className="text-xs text-slate-700 font-medium">{r.menu?.nama_menu}</span>
    },
    {
      header: 'Porsi Dihabiskan',
      render: (r) => {
        const porsi = r.konsumsi?.porsi_dihabiskan || 'Belum Dicatat';
        return <Badge status={porsi}>{porsi.toUpperCase()}</Badge>;
      }
    },
    {
      header: 'Catatan Daya Terima',
      render: (r) => (
        <span className="text-xs text-slate-600 block max-w-sm">
          {r.konsumsi?.catatan || '-'}
        </span>
      )
    },
    {
      header: 'Dicatat Oleh',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.konsumsi?.pencatat?.nama || 'Petugas'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-teal-600" /> Pemantauan Kepatuhan Konsumsi PMT
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tingkat daya terima dan kepatuhan balita dalam menghabiskan menu makanan tambahan pemulihan
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={posyanduId}
            onChange={(e) => setPosyanduId(e.target.value)}
            options={[
              { value: '', label: 'Semua Posyandu' },
              ...posyanduList.map((p) => ({ value: p.id, label: p.nama_posyandu }))
            ]}
          />
        </div>
      </div>

      {/* Compliance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tingkat Kepatuhan"
          value={`${compliance?.persenKepatuhan || 0}%`}
          subtitle="Indeks konsumsi balita"
          icon={PieChart}
          color="brand"
        />
        <StatCard
          title="Porsi Dihabiskan"
          value={compliance?.habis || 0}
          subtitle="100% Porsi habis dimakan"
          icon={CheckCircle2}
          color="brand"
        />
        <StatCard
          title="Porsi Sebagian"
          value={compliance?.sebagian || 0}
          subtitle="Dihabiskan sebagian"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Tidak Dimakan"
          value={compliance?.tidak || 0}
          subtitle="Ditolak / tidak dikonsumsi"
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Riwayat Catatan Konsumsi Terkini</h3>
        <Table
          columns={columns}
          data={jadwalList}
          loading={loading}
          emptyMessage="Belum ada catatan konsumsi PMT tersimpan"
        />
      </div>
    </div>
  );
};

export default KonsumsiPmt;

