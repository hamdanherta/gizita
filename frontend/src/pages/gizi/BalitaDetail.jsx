import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Baby,
  Scale,
  LineChart,
  HeartHandshake,
  Stethoscope,
  ClipboardList,
  Calendar,
  MapPin,
  Phone,
  User,
  Plus,
  ArrowLeft,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Skeleton from '../../components/common/Skeleton';
import KmsChart from '../../components/charts/KmsChart';

const BalitaDetail = () => {
  const { id } = useParams();
  const { role, user } = useAuth();
  const toast = useToast();

  const [balita, setBalita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pengukuran'); // pengukuran, kms, intervensi, pemeriksaan, rekomendasi

  // KMS Chart State
  const [kmsIndicator, setKmsIndicator] = useState('BBU');
  const [kmsData, setKmsData] = useState(null);
  const [kmsLoading, setKmsLoading] = useState(false);

  // Doctor Modals
  const [isPeriksaOpen, setIsPeriksaOpen] = useState(false);
  const [isRekomendasiOpen, setIsRekomendasiOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Periksa
  const [periksaForm, setPeriksaForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    keluhan: '',
    diagnosa: '',
    tindakan: '',
    catatan: ''
  });

  // Form Rekomendasi
  const [rekomendasiForm, setRekomendasiForm] = useState({
    isi_rekomendasi: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/balita/${id}`);
      if (res.data.success) {
        setBalita(res.data.data);
      }
    } catch {
      toast.error('Gagal mengambil detail balita.');
    } finally {
      setLoading(false);
    }
  };

  const fetchKms = async () => {
    try {
      setKmsLoading(true);
      const res = await api.get(`/growth/kms/${id}?indicator=${kmsIndicator}`);
      if (res.data.success) {
        setKmsData(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setKmsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'kms') {
      fetchKms();
    }
  }, [activeTab, kmsIndicator]);

  const handleSimpanPemeriksaan = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post('/pemeriksaan', {
        ...periksaForm,
        balita_id: id
      });
      if (res.data.success) {
        toast.success('Catatan pemeriksaan dokter berhasil disimpan.');
        setIsPeriksaOpen(false);
        setPeriksaForm({
          tanggal: new Date().toISOString().split('T')[0],
          keluhan: '',
          diagnosa: '',
          tindakan: '',
          catatan: ''
        });
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan catatan pemeriksaan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimpanRekomendasi = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post('/rekomendasi', {
        ...rekomendasiForm,
        balita_id: id
      });
      if (res.data.success) {
        toast.success('Rekomendasi dokter berhasil dikirim ke petugas gizi.');
        setIsRekomendasiOpen(false);
        setRekomendasiForm({
          isi_rekomendasi: '',
          tanggal: new Date().toISOString().split('T')[0]
        });
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan rekomendasi.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!balita) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Balita tidak ditemukan.</p>
        <Link to="/balita" className="text-teal-600 font-semibold mt-2 inline-block">
          &larr; Kembali ke daftar balita
        </Link>
      </div>
    );
  }

  // Riwayat Pengukuran Columns
  const pengukuranColumns = [
    {
      header: 'Tanggal Ukur',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{r.tanggal_ukur}</span>
          <span className="text-[10px] text-slate-400">Umur: {r.umur_bulan} Bulan</span>
        </div>
      )
    },
    {
      header: 'Antropometri (BB / TB)',
      render: (r) => (
        <span className="text-xs font-bold text-slate-900">
          {r.berat_badan} kg <span className="text-slate-400 font-normal">/</span> {r.tinggi_badan} cm
          <span className="block text-[10px] text-slate-500 font-normal">Cara: {r.cara_ukur}</span>
        </span>
      )
    },
    {
      header: 'LK / LILA',
      render: (r) => (
        <span className="text-xs text-slate-600">
          {r.lingkar_kepala ? `${r.lingkar_kepala} cm` : '-'} / {r.lila ? `${r.lila} cm` : '-'}
        </span>
      )
    },
    {
      header: 'Z-Score BB/U',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800">{r.statusGizi?.zscore_bbu ?? '-'} SD</span>
          <span className="block text-[10px] text-slate-500">{r.statusGizi?.kategori_bbu || '-'}</span>
        </div>
      )
    },
    {
      header: 'Z-Score TB/U',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800">{r.statusGizi?.zscore_tbu ?? '-'} SD</span>
          <span className="block text-[10px] text-slate-500">{r.statusGizi?.kategori_tbu || '-'}</span>
        </div>
      )
    },
    {
      header: 'Z-Score BB/TB',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800">{r.statusGizi?.zscore_bbtb ?? '-'} SD</span>
          <span className="block text-[10px] text-slate-500">{r.statusGizi?.kategori_bbtb || '-'}</span>
        </div>
      )
    },
    {
      header: 'Status Final',
      render: (r) => (
        <Badge status={r.statusGizi?.status_final}>{r.statusGizi?.status_final || '-'}</Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/balita"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Balita
        </Link>

        {/* Action Buttons for Roles */}
        <div className="flex items-center gap-2">
          {role !== 'dokter' && (
            <Link to={`/pengukuran/input?balita_id=${balita.id}`}>
              <Button variant="primary" size="sm" icon={Scale}>
                Input Pengukuran
              </Button>
            </Link>
          )}

          {role === 'dokter' && (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={Stethoscope}
                onClick={() => setIsPeriksaOpen(true)}
              >
                Catat Pemeriksaan
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ClipboardList}
                onClick={() => setIsRekomendasiOpen(true)}
              >
                Beri Rekomendasi
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Child Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center font-bold text-2xl shadow-xs">
              <Baby className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{balita.nama}</h1>
                <Badge variant={balita.jenis_kelamin === 'L' ? 'info' : 'purple'}>
                  {balita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                NIK: <span className="font-mono font-semibold text-slate-700">{balita.nik || '-'}</span> • Lahir: {balita.tanggal_lahir} ({balita.umur_bulan_sekarang} Bulan)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Posyandu Binaan</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                {balita.wilayahPosyandu?.nama_posyandu || '-'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Orang Tua / Ibu</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Ibu {balita.orangTua?.nama_ibu || '-'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Riwayat Lahir</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {balita.berat_lahir || '-'} kg / {balita.panjang_lahir || '-'} cm (Anak ke-{balita.anak_ke || 1})
              </span>
            </div>
          </div>
        </div>

        {/* Tab Header */}
        <div className="flex items-center gap-2 pt-4 border-b border-slate-100 overflow-x-auto">
          {[
            { id: 'pengukuran', label: 'Riwayat Pengukuran', icon: Scale, count: balita.pengukuranList?.length },
            { id: 'kms', label: 'Grafik KMS WHO', icon: LineChart },
            { id: 'intervensi', label: 'Rencana Intervensi', icon: HeartHandshake, count: balita.intervensiList?.length },
            { id: 'pemeriksaan', label: 'Pemeriksaan Dokter', icon: Stethoscope, count: balita.pemeriksaanList?.length },
            { id: 'rekomendasi', label: 'Rekomendasi Medis', icon: ClipboardList, count: balita.rekomendasiList?.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  active
                    ? 'bg-teal-50 text-teal-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-teal-200/70 text-teal-900' : 'bg-slate-100 text-slate-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="pt-6">
          {/* TAB 1: PENGUKURAN */}
          {activeTab === 'pengukuran' && (
            <div className="space-y-4">
              <Table
                columns={pengukuranColumns}
                data={balita.pengukuranList || []}
                emptyMessage="Belum ada riwayat pengukuran balita"
                emptySubMessage="Tekan tombol 'Input Pengukuran' di atas untuk mencatat data penimbangan baru."
              />
            </div>
          )}

          {/* TAB 2: KMS CHART */}
          {activeTab === 'kms' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                {[
                  { id: 'BBU', label: 'Berat Badan / Umur (BB/U)' },
                  { id: 'TBU', label: 'Tinggi Badan / Umur (TB/U)' },
                  { id: 'BBTB', label: 'Berat Badan / Tinggi Badan (BB/TB)' }
                ].map((ind) => (
                  <Button
                    key={ind.id}
                    variant={kmsIndicator === ind.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setKmsIndicator(ind.id)}
                  >
                    {ind.label}
                  </Button>
                ))}
              </div>

              {kmsLoading ? (
                <Skeleton className="h-96 w-full rounded-2xl" />
              ) : kmsData ? (
                <KmsChart
                  curves={kmsData.curves}
                  actualPoints={kmsData.actualPoints}
                  indicator={kmsIndicator}
                  title={`Kartu Menuju Sehat (KMS) - ${balita.nama} (${kmsIndicator})`}
                />
              ) : null}
            </div>
          )}

          {/* TAB 3: INTERVENSI */}
          {activeTab === 'intervensi' && (
            <div className="space-y-3">
              {balita.intervensiList?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada rencana intervensi untuk balita ini.</p>
              ) : (
                balita.intervensiList.map((intv) => (
                  <div key={intv.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{intv.jenis_intervensi}</Badge>
                        <span className="text-xs font-bold text-slate-800">{intv.tujuan}</span>
                      </div>
                      <Badge status={intv.status}>{intv.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">Target: {intv.target || '-'}</p>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Periode: {intv.tanggal_mulai} s.d {intv.tanggal_selesai || 'Selesai'}</span>
                      <span>Dibuat oleh: {intv.pembuat?.nama || 'Petugas'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: PEMERIKSAAN DOKTER */}
          {activeTab === 'pemeriksaan' && (
            <div className="space-y-3">
              {balita.pemeriksaanList?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada catatan pemeriksaan kesehatan dokter.</p>
              ) : (
                balita.pemeriksaanList.map((pem) => (
                  <div key={pem.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                        Pemeriksaan oleh {pem.dokter?.nama || 'Dokter'}
                      </span>
                      <span className="text-slate-400 font-medium">{pem.tanggal}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="font-semibold text-slate-700 block">Keluhan:</span>
                        <p className="text-slate-600">{pem.keluhan || '-'}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 block">Diagnosa:</span>
                        <p className="text-teal-800 font-medium">{pem.diagnosa || '-'}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="font-semibold text-slate-700 block">Tindakan & Terapi:</span>
                      <p className="text-slate-600">{pem.tindakan || '-'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: REKOMENDASI DOKTER */}
          {activeTab === 'rekomendasi' && (
            <div className="space-y-3">
              {balita.rekomendasiList?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada rekomendasi medis dari dokter.</p>
              ) : (
                balita.rekomendasiList.map((rek) => (
                  <div key={rek.id} className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-950 flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4 text-teal-700" />
                        Rekomendasi dari {rek.dokter?.nama || 'Dokter Spesialis'}
                      </span>
                      <span className="text-teal-700 text-[11px] font-medium">{rek.tanggal}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1 bg-white p-3 rounded-lg border border-teal-100">
                      "{rek.isi_rekomendasi}"
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Dokter: Catat Pemeriksaan */}
      <Modal
        isOpen={isPeriksaOpen}
        onClose={() => setIsPeriksaOpen(false)}
        title="Catat Pemeriksaan Kesehatan Anak"
        subtitle={`Pemeriksaan klinis untuk ${balita.nama}`}
      >
        <form onSubmit={handleSimpanPemeriksaan} className="space-y-4">
          <Input
            label="Tanggal Pemeriksaan"
            type="date"
            value={periksaForm.tanggal}
            onChange={(e) => setPeriksaForm({ ...periksaForm, tanggal: e.target.value })}
            required
          />
          <Input
            label="Keluhan Orang Tua / Pasien"
            value={periksaForm.keluhan}
            onChange={(e) => setPeriksaForm({ ...periksaForm, keluhan: e.target.value })}
            placeholder="Nafsu makan menurun, batuk pilek, diare..."
          />
          <Input
            label="Diagnosa Medis"
            value={periksaForm.diagnosa}
            onChange={(e) => setPeriksaForm({ ...periksaForm, diagnosa: e.target.value })}
            placeholder="Gizi kurang e.c asupan suboptimal..."
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tindakan & Resep Medis
            </label>
            <textarea
              rows={2}
              value={periksaForm.tindakan}
              onChange={(e) => setPeriksaForm({ ...periksaForm, tindakan: e.target.value })}
              placeholder="Pemberian zinc 20mg, vitamin A, edukasi gizi seimbang..."
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsPeriksaOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Simpan Pemeriksaan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Dokter: Beri Rekomendasi */}
      <Modal
        isOpen={isRekomendasiOpen}
        onClose={() => setIsRekomendasiOpen(false)}
        title="Beri Rekomendasi Medis Gizi"
        subtitle={`Rekomendasi ini akan langsung dinotifikasikan ke petugas gizi`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSimpanRekomendasi} className="space-y-4">
          <Input
            label="Tanggal Rekomendasi"
            type="date"
            value={rekomendasiForm.tanggal}
            onChange={(e) => setRekomendasiForm({ ...rekomendasiForm, tanggal: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Isi Arahan / Rekomendasi Gizi <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={rekomendasiForm.isi_rekomendasi}
              onChange={(e) => setRekomendasiForm({ ...rekomendasiForm, isi_rekomendasi: e.target.value })}
              placeholder="Contoh: Balita mengalami gagal tumbuh (growth faltering). Wajib diberikan PMT tinggi protein hewani..."
              required
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsRekomendasiOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Kirim Rekomendasi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BalitaDetail;

