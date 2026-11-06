import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Scale, Activity, CheckCircle2, AlertTriangle, ArrowRight, User } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

const PengukuranInput = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const preselectedBalitaId = searchParams.get('balita_id') || '';

  const [balitas, setBalitas] = useState([]);
  const [loadingBalitas, setLoadingBalitas] = useState(true);

  const [selectedBalita, setSelectedBalita] = useState(null);
  const [formData, setFormData] = useState({
    balita_id: preselectedBalitaId,
    tanggal_ukur: new Date().toISOString().split('T')[0],
    berat_badan: '',
    tinggi_badan: '',
    cara_ukur: 'terlentang',
    lingkar_kepala: '',
    lila: '',
    catatan: ''
  });

  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultSaved, setResultSaved] = useState(null);

  // Fetch daftar balita untuk dropdown
  useEffect(() => {
    const fetchBalitas = async () => {
      try {
        setLoadingBalitas(true);
        const res = await api.get('/balita?limit=100');
        if (res.data.success) {
          const list = res.data.data.balita || [];
          setBalitas(list);
          if (preselectedBalitaId) {
            const found = list.find((b) => String(b.id) === String(preselectedBalitaId));
            if (found) setSelectedBalita(found);
          }
        }
      } catch {
        toast.error('Gagal mengambil daftar balita.');
      } finally {
        setLoadingBalitas(false);
      }
    };
    fetchBalitas();
  }, [preselectedBalitaId]);

  // Saat balita dipilih
  const handleBalitaChange = (id) => {
    setFormData({ ...formData, balita_id: id });
    const found = balitas.find((b) => String(b.id) === String(id));
    setSelectedBalita(found || null);
    // Sesuaikan cara ukur default berdasarkan umur
    if (found) {
      const birth = new Date(found.tanggal_lahir);
      const now = new Date(formData.tanggal_ukur);
      const mAge = Math.floor((now - birth) / (1000 * 60 * 60 * 24 * 30.4375));
      setFormData((prev) => ({
        ...prev,
        balita_id: id,
        cara_ukur: mAge < 24 ? 'terlentang' : 'berdiri'
      }));
    }
  };

  // Live Preview Perhitungan Z-Score
  useEffect(() => {
    const calcPreview = async () => {
      if (
        formData.balita_id &&
        formData.tanggal_ukur &&
        formData.berat_badan &&
        formData.tinggi_badan &&
        parseFloat(formData.berat_badan) >= 1 &&
        parseFloat(formData.tinggi_badan) >= 40
      ) {
        try {
          setLoadingPreview(true);
          const res = await api.post('/pengukuran/preview', {
            balita_id: formData.balita_id,
            tanggal_ukur: formData.tanggal_ukur,
            berat_badan: formData.berat_badan,
            tinggi_badan: formData.tinggi_badan,
            cara_ukur: formData.cara_ukur
          });
          if (res.data.success) {
            setPreview(res.data.data);
          }
        } catch {
          setPreview(null);
        } finally {
          setLoadingPreview(false);
        }
      } else {
        setPreview(null);
      }
    };

    const timer = setTimeout(calcPreview, 400);
    return () => clearTimeout(timer);
  }, [formData.balita_id, formData.tanggal_ukur, formData.berat_badan, formData.tinggi_badan, formData.cara_ukur]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.balita_id || !formData.berat_badan || !formData.tinggi_badan) {
      toast.error('Harap lengkapi balita, berat badan, dan tinggi badan.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/pengukuran', formData);
      if (res.data.success) {
        toast.success('Pengukuran & kalkulasi status gizi berhasil disimpan!');
        setResultSaved(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan hasil pengukuran.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-600" /> Input Penimbangan & Pengukuran Antropometri
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pencatatan hasil penimbangan berat badan, tinggi badan, LK, LILA, dan perhitungan otomatis Z-Score WHO
        </p>
      </div>

      {/* Result Display Banner if just saved */}
      {resultSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-950 space-y-4 animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-emerald-900">Hasil Pengukuran Berhasil Disimpan</h3>
                <p className="text-xs text-emerald-700">Status gizi telah dihitung secara otomatis sesuai Permenkes No. 2/2020</p>
              </div>
            </div>
            <Badge status={resultSaved.status_gizi?.status_final}>
              {resultSaved.status_gizi?.status_final}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-emerald-100 text-xs text-center">
            <div>
              <span className="text-slate-500 block">BB/U (Berat / Umur)</span>
              <span className="font-bold text-slate-800 text-sm">{resultSaved.status_gizi?.zscore_bbu} SD</span>
              <span className="block text-[11px] text-emerald-700">{resultSaved.status_gizi?.kategori_bbu}</span>
            </div>
            <div>
              <span className="text-slate-500 block">TB/U (Tinggi / Umur)</span>
              <span className="font-bold text-slate-800 text-sm">{resultSaved.status_gizi?.zscore_tbu} SD</span>
              <span className="block text-[11px] text-emerald-700">{resultSaved.status_gizi?.kategori_tbu}</span>
            </div>
            <div>
              <span className="text-slate-500 block">BB/TB (Berat / Tinggi)</span>
              <span className="font-bold text-slate-800 text-sm">{resultSaved.status_gizi?.zscore_bbtb} SD</span>
              <span className="block text-[11px] text-emerald-700">{resultSaved.status_gizi?.kategori_bbtb}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setResultSaved(null);
                setFormData({
                  ...formData,
                  berat_badan: '',
                  tinggi_badan: '',
                  lingkar_kepala: '',
                  lila: '',
                  catatan: ''
                });
                setPreview(null);
              }}
            >
              Input Pengukuran Baru Lagi
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate(`/balita/${formData.balita_id}`)}
            >
              Lihat Detail & KMS Balita
            </Button>
          </div>
        </div>
      )}

      {/* Main Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Pilih Balita"
              value={formData.balita_id}
              onChange={(e) => handleBalitaChange(e.target.value)}
              placeholder="-- Pilih Nama Balita --"
              options={balitas.map((b) => ({
                value: b.id,
                label: `${b.nama} (${b.jenis_kelamin === 'L' ? 'L' : 'P'}, NIK: ${b.nik || '-'})`
              }))}
              required
            />

            {/* Selected Balita Mini Banner */}
            {selectedBalita && (
              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs flex justify-between items-center text-teal-900">
                <div>
                  <span className="font-bold block">{selectedBalita.nama}</span>
                  <span className="text-slate-600">
                    Lahir: {selectedBalita.tanggal_lahir} • {selectedBalita.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-teal-800 font-semibold">{selectedBalita.wilayah_posyandu?.nama_posyandu}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Tanggal Penimbangan"
                type="date"
                value={formData.tanggal_ukur}
                onChange={(e) => setFormData({ ...formData, tanggal_ukur: e.target.value })}
                required
              />

              <Select
                label="Posisi / Cara Ukur"
                value={formData.cara_ukur}
                onChange={(e) => setFormData({ ...formData, cara_ukur: e.target.value })}
                options={[
                  { value: 'terlentang', label: 'Terlentang (Standar < 24 Bulan)' },
                  { value: 'berdiri', label: 'Berdiri (Standar >= 24 Bulan)' }
                ]}
                helperText="Koreksi ±0.7 cm otomatis diterapkan jika posisi ukur tidak sesuai standar umur"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Berat Badan (kg)"
                type="number"
                step="0.01"
                min="1"
                max="30"
                value={formData.berat_badan}
                onChange={(e) => setFormData({ ...formData, berat_badan: e.target.value })}
                placeholder="Contoh: 9.60"
                helperText="Rentang wajar: 1 - 30 kg"
                required
              />

              <Input
                label="Panjang / Tinggi Badan (cm)"
                type="number"
                step="0.1"
                min="40"
                max="130"
                value={formData.tinggi_badan}
                onChange={(e) => setFormData({ ...formData, tinggi_badan: e.target.value })}
                placeholder="Contoh: 75.7"
                helperText="Rentang wajar: 40 - 130 cm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Lingkar Kepala (cm) - Opsional"
                type="number"
                step="0.1"
                value={formData.lingkar_kepala}
                onChange={(e) => setFormData({ ...formData, lingkar_kepala: e.target.value })}
                placeholder="Contoh: 44.5"
              />

              <Input
                label="Lingkar Lengan Atas (LiLA) (cm) - Opsional"
                type="number"
                step="0.1"
                value={formData.lila}
                onChange={(e) => setFormData({ ...formData, lila: e.target.value })}
                placeholder="Contoh: 14.0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Catatan Pengukuran Posyandu (Opsional)
              </label>
              <textarea
                rows={2}
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Kondisi balita saat ditimbang (misal: aktif, rewel, memakai pakaian tipis)..."
                className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3 focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full sm:w-auto"
              >
                Simpan Hasil Pengukuran
              </Button>
            </div>
          </form>
        </div>

        {/* Live Z-Score Preview Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 sticky top-20">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" /> Kalkulator Z-Score Otomatis
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Hasil perhitungan seketika berdasarkan standar WHO & Permenkes No. 2/2020
            </p>

            {loadingPreview ? (
              <div className="py-8 text-center text-xs text-slate-400">Menghitung z-score...</div>
            ) : preview ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">Umur Dihitung</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {preview.umurBulan} Bulan ({preview.umurHari} Hari)
                  </span>
                  {preview.tinggiKoreksi !== parseFloat(formData.tinggi_badan) && (
                    <span className="text-[10px] text-teal-700 block mt-0.5">
                      TB terkoreksi: {preview.tinggiKoreksi} cm
                    </span>
                  )}
                </div>

                {/* Indikator 1: BB/U */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">BB/U (Berat / Umur)</span>
                    <span className="font-bold text-slate-900">{preview.zscoreBBU} SD</span>
                  </div>
                  <Badge status={preview.kategoriBBU}>{preview.kategoriBBU}</Badge>
                </div>

                {/* Indikator 2: TB/U */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">TB/U (Tinggi / Umur)</span>
                    <span className="font-bold text-slate-900">{preview.zscoreTBU} SD</span>
                  </div>
                  <Badge status={preview.kategoriTBU}>{preview.kategoriTBU}</Badge>
                </div>

                {/* Indikator 3: BB/TB */}
                <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">BB/TB (Berat / Tinggi)</span>
                    <span className="font-bold text-slate-900">{preview.zscoreBBTB} SD</span>
                  </div>
                  <Badge status={preview.kategoriBBTB}>{preview.kategoriBBTB}</Badge>
                </div>

                {/* Status Final */}
                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                  <span className="text-slate-600 block text-[11px] font-semibold">KESIMPULAN STATUS GIZI:</span>
                  <p className="font-extrabold text-teal-950 text-sm">{preview.statusFinal}</p>
                  {preview.perluPerhatian && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Peringatan: Balita Perlu Perhatian Khusus
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-4">
                Pilih balita serta masukkan nilai Berat Badan dan Tinggi Badan untuk melihat kalkulasi status gizi otomatis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengukuranInput;

