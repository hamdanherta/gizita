import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Download, Printer, Eye, Filter, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Skeleton from '../../components/common/Skeleton';

const Laporan = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [jenisLaporan, setJenisLaporan] = useState(searchParams.get('jenis') || 'rekap_status_gizi');
  const [posyanduId, setPosyanduId] = useState('');
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');

  const [posyanduList, setPosyanduList] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    const fetchPosyandu = async () => {
      try {
        const res = await api.get('/posyandu');
        if (res.data.success) setPosyanduList(res.data.data || []);
      } catch {
        // Ignore
      }
    };
    fetchPosyandu();
  }, []);

  const handlePreview = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/laporan/preview?jenis=${jenisLaporan}&posyandu_id=${posyanduId}&tgl_mulai=${tglMulai}&tgl_selesai=${tglSelesai}`
      );
      if (res.data.success) {
        setPreviewData(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal menghasilkan preview laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePreview();
  }, [jenisLaporan, posyanduId]);

  const handleExportPdf = () => {
    try {
      setExportingPdf(true);
      const url = `/api/laporan/export-pdf?jenis=${jenisLaporan}&posyandu_id=${posyanduId}&tgl_mulai=${tglMulai}&tgl_selesai=${tglSelesai}`;
      window.open(url, '_blank');
      toast.success('Laporan PDF berhasil dibuka / diunduh.');
    } catch {
      toast.error('Gagal mengekspor PDF.');
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const res = await api.get(
        `/laporan/export-excel?jenis=${jenisLaporan}&posyandu_id=${posyanduId}&tgl_mulai=${tglMulai}&tgl_selesai=${tglSelesai}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Gizita-${jenisLaporan}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Laporan Excel berhasil diunduh.');
    } catch {
      toast.error('Gagal mengekspor Excel.');
    } finally {
      setExportingExcel(false);
    }
  };

  const reportColumns = previewData?.headers
    ? previewData.headers.map((h) => ({
        header: h.label,
        accessor: h.key,
        align: h.align || 'center',
        render: (row, idx) => {
          if (h.key === '_no') return idx + 1;
          const val = row[h.key] ?? '-';
          if (h.isStatus) return <Badge status={val}>{val}</Badge>;
          return val;
        }
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" /> Cetak & Rekapitulasi Laporan Gizi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Laporan resmi pemantauan gizi, stunting, wasting, dan PMT Puskesmas Kebun Kopi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleExportExcel}
            loading={exportingExcel}
          >
            Unduh Excel (.xlsx)
          </Button>
          <Button
            variant="primary"
            icon={Printer}
            onClick={handleExportPdf}
            loading={exportingPdf}
          >
            Cetak PDF (.pdf)
          </Button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <Select
          label="Jenis Laporan"
          value={jenisLaporan}
          onChange={(e) => setJenisLaporan(e.target.value)}
          options={[
            { value: 'rekap_status_gizi', label: '1. Rekapitulasi Status Gizi Balita' },
            { value: 'balita_bermasalah', label: '2. Daftar Balita Bermasalah Gizi' },
            { value: 'rekap_pmt', label: '3. Rekapitulasi Pemberian & Konsumsi PMT' },
            { value: 'rekap_kunjungan', label: '4. Rekapitulasi Kunjungan Posyandu' }
          ]}
          required
        />

        <Select
          label="Wilayah Posyandu"
          value={posyanduId}
          onChange={(e) => setPosyanduId(e.target.value)}
          options={[
            { value: '', label: 'Semua Posyandu Binaan' },
            ...posyanduList.map((p) => ({ value: p.id, label: p.nama_posyandu }))
          ]}
        />

        <Input
          label="Tanggal Mulai"
          type="date"
          value={tglMulai}
          onChange={(e) => setTglMulai(e.target.value)}
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="Tanggal Selesai"
              type="date"
              value={tglSelesai}
              onChange={(e) => setTglSelesai(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            onClick={handlePreview}
            loading={loading}
            className="mb-0.5"
          >
            Terapkan
          </Button>
        </div>
      </div>

      {/* Report Preview Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8 space-y-6">
        {/* Kop Surat Puskesmas Preview */}
        <div className="border-b-2 border-teal-700 pb-4 text-center space-y-1">
          <h2 className="text-base sm:text-lg font-extrabold text-teal-800 tracking-wide uppercase">
            {previewData?.puskesmasInfo?.nama || 'PUSKESMAS KEBUN KOPI'}
          </h2>
          <p className="text-xs text-slate-600">
            Sistem Informasi Pemantauan & Perencanaan Gizi Balita (Gizita)
          </p>
          <p className="text-[11px] text-slate-500">
            {previewData?.puskesmasInfo?.alamat || 'Jl. Kebun Kopi No. 45, Kota Jambi'} • Telp: {previewData?.puskesmasInfo?.telepon || '0741-654321'}
          </p>
        </div>

        {/* Title */}
        <div className="text-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {previewData?.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{previewData?.filterInfo}</p>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Table
            columns={reportColumns}
            data={previewData?.rows || []}
            emptyMessage="Tidak ada data untuk laporan yang dipilih"
          />
        )}

        {/* Signature Area */}
        <div className="flex justify-end pt-8">
          <div className="text-center text-xs text-slate-800 space-y-1 min-w-[200px]">
            <p>Kota Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-medium text-slate-600">Kepala Puskesmas Kebun Kopi,</p>
            <div className="h-14" />
            <p className="font-bold underline text-slate-900">
              {previewData?.puskesmasInfo?.kepala || 'dr. Hj. Siti Rahma, M.Kes'}
            </p>
            <p className="text-[11px] text-slate-500">NIP. 19780512 200501 2 008</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laporan;

