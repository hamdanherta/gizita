import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LineChart, Search, Scale, Baby, Download, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Skeleton from '../../components/common/Skeleton';
import KmsChart from '../../components/charts/KmsChart';

const GrowthMonitoring = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [balitas, setBalitas] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('balita_id') || '');
  const [indicator, setIndicator] = useState('BBU'); // BBU, TBU, BBTB

  const [kmsData, setKmsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBalitas, setLoadingBalitas] = useState(true);

  // Fetch list of balitas
  useEffect(() => {
    const fetchBalitas = async () => {
      try {
        setLoadingBalitas(true);
        const res = await api.get('/balita?limit=100');
        if (res.data.success) {
          const list = res.data.data.balita || [];
          setBalitas(list);
          if (!selectedId && list.length > 0) {
            setSelectedId(String(list[0].id));
          }
        }
      } catch {
        toast.error('Gagal mengambil daftar balita.');
      } finally {
        setLoadingBalitas(false);
      }
    };
    fetchBalitas();
  }, []);

  // Fetch KMS Curves & Data for selected child
  useEffect(() => {
    if (!selectedId) return;

    const fetchKms = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/growth/kms/${selectedId}?indicator=${indicator}`);
        if (res.data.success) {
          setKmsData(res.data.data);
          setSearchParams({ balita_id: selectedId });
        }
      } catch {
        toast.error('Gagal mengambil data kurva pertumbuhan KMS.');
      } finally {
        setLoading(false);
      }
    };

    fetchKms();
  }, [selectedId, indicator]);

  const riwayatColumns = [
    {
      header: 'Tanggal Ukur',
      render: (r) => (
        <span className="font-semibold text-slate-800 text-xs">{r.tanggal_ukur}</span>
      )
    },
    {
      header: 'Umur',
      render: (r) => <span className="text-xs text-slate-600">{r.umur_bulan} Bulan</span>
    },
    {
      header: 'Berat Badan',
      render: (r) => <span className="text-xs font-bold text-slate-900">{r.berat_badan} kg</span>
    },
    {
      header: 'Tinggi Badan',
      render: (r) => <span className="text-xs font-bold text-slate-900">{r.tinggi_badan} cm</span>
    },
    {
      header: 'Cara Ukur',
      render: (r) => <span className="text-xs text-slate-500 capitalize">{r.cara_ukur}</span>
    },
    {
      header: 'Z-Score BB/U',
      render: (r) => (
        <span className="font-mono text-xs">{r.statusGizi?.zscore_bbu ?? '-'} SD</span>
      )
    },
    {
      header: 'Z-Score TB/U',
      render: (r) => (
        <span className="font-mono text-xs">{r.statusGizi?.zscore_tbu ?? '-'} SD</span>
      )
    },
    {
      header: 'Z-Score BB/TB',
      render: (r) => (
        <span className="font-mono text-xs">{r.statusGizi?.zscore_bbtb ?? '-'} SD</span>
      )
    },
    {
      header: 'Status Gizi',
      render: (r) => (
        <Badge status={r.statusGizi?.status_final}>{r.statusGizi?.status_final || '-'}</Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-teal-600" /> Pantau Pertumbuhan Balita (Grafik KMS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kurva pertumbuhan standar WHO dengan garis batas -3 SD, -2 SD, Median, +1 SD, +2 SD, +3 SD
          </p>
        </div>
      </div>

      {/* Select Balita & Indicators */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <Select
            label="Pilih Balita yang Dipantau"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            options={balitas.map((b) => ({
              value: b.id,
              label: `${b.nama} (${b.jenis_kelamin === 'L' ? 'L' : 'P'}, NIK: ${b.nik || '-'})`
            }))}
            disabled={loadingBalitas}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pilih Indikator Antropometri
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'BBU', label: 'Berat Badan / Umur (BB/U)' },
              { id: 'TBU', label: 'Tinggi Badan / Umur (TB/U)' },
              { id: 'BBTB', label: 'Berat / Tinggi Badan (BB/TB)' }
            ].map((ind) => (
              <Button
                key={ind.id}
                variant={indicator === ind.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setIndicator(ind.id)}
              >
                {ind.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Balita Brief Info */}
      {kmsData?.balita && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-100 flex flex-wrap items-center justify-between gap-4 text-xs text-teal-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block text-teal-950">{kmsData.balita.nama}</span>
              <span className="text-teal-700">
                Lahir: {kmsData.balita.tanggal_lahir} • {kmsData.balita.jenis_kelamin === 'L' ? 'Laki-laki (Standar WHO Biru)' : 'Perempuan (Standar WHO Merah Muda)'}
              </span>
            </div>
          </div>
          <div>
            <span className="text-teal-700 font-semibold">{kmsData.balita.posyandu}</span>
          </div>
        </div>
      )}

      {/* KMS Chart */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : kmsData ? (
        <KmsChart
          curves={kmsData.curves}
          actualPoints={kmsData.actualPoints}
          indicator={indicator}
          title={`Kurva Pertumbuhan Antropometri KMS: ${kmsData.balita?.nama} (${indicator})`}
        />
      ) : null}

      {/* Measurement History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Tabel Riwayat Pengukuran Balita</h3>
        <Table
          columns={riwayatColumns}
          data={kmsData?.riwayatPengukuran || []}
          loading={loading}
          emptyMessage="Belum ada riwayat pengukuran balita ini"
        />
      </div>
    </div>
  );
};

export default GrowthMonitoring;

