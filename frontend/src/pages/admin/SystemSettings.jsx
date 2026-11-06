import React, { useState, useEffect } from 'react';
import { Settings, Save, BellRing, Building, Globe, Image } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Skeleton from '../../components/common/Skeleton';

const SystemSettings = () => {
  const toast = useToast();
  const { settings, refreshSettings } = useSettings();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_aplikasi: 'Gizita',
    logo_url: '',
    nama_puskesmas: 'Puskesmas Kebun Kopi',
    alamat_puskesmas: 'Jl. Kebun Kopi No. 45, Kota Jambi',
    kontak_puskesmas: '0741-654321',
    hari_pengingat_notifikasi: '1'
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        nama_aplikasi: settings.nama_aplikasi || 'Gizita',
        logo_url: settings.logo_url || '',
        nama_puskesmas: settings.nama_puskesmas || 'Puskesmas Kebun Kopi',
        alamat_puskesmas: settings.alamat_puskesmas || 'Jl. Kebun Kopi No. 45, Kota Jambi',
        kontak_puskesmas: settings.kontak_puskesmas || '0741-654321',
        hari_pengingat_notifikasi: settings.hari_pengingat_notifikasi || '1'
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/pengaturan', formData);
      if (res.data.success) {
        toast.success('Pengaturan sistem berhasil disimpan dan diterapkan.');
        refreshSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-600" /> Pengaturan Sistem Aplikasi
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Sesuaikan konfigurasi nama aplikasi, identitas instansi, dan otomatisasi pengingat notifikasi
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identitas Tampilan Aplikasi */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-600" /> Identitas Tampilan & Merek
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nama ini akan langsung tampil pada judul tab browser, sidebar, dan judul laporan cetak.
            </p>

            <div className="space-y-4">
              <Input
                label="Nama Aplikasi"
                value={formData.nama_aplikasi}
                onChange={(e) => setFormData({ ...formData, nama_aplikasi: e.target.value })}
                placeholder="Gizita"
                helperText="Nilai awal default: Gizita"
                required
              />

              <div>
                <Input
                  label="URL / Lokasi Logo Aplikasi"
                  icon={Image}
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="/logo.png atau URL logo"
                  helperText="Default: /logo.png (logo resmi Puskesmas Kebun Kopi)"
                />
                <div className="mt-3 flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <img
                    src={formData.logo_url || '/logo.png'}
                    alt="Pratinjau Logo"
                    className="h-12 w-auto max-w-[60px] object-contain drop-shadow-xs shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/logo.png';
                    }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Pratinjau Logo Aktif</span>
                    <span className="text-[11px] text-slate-500 block">
                      Logo ini ditampilkan pada tab browser, sidebar, halaman login, dan kop laporan resmi.
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_url: '/logo.png' })}
                      className="mt-1 text-xs text-teal-600 hover:text-teal-700 font-medium underline"
                    >
                      Gunakan logo bawaan (/logo.png)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-600" /> Kontak & Alamat Instansi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Akan dimuat dalam dokumen kop surat cetak PDF & Excel
            </p>

            <div className="space-y-4">
              <Input
                label="Nama Puskesmas"
                value={formData.nama_puskesmas}
                onChange={(e) => setFormData({ ...formData, nama_puskesmas: e.target.value })}
                required
              />
              <Input
                label="Alamat Puskesmas"
                value={formData.alamat_puskesmas}
                onChange={(e) => setFormData({ ...formData, alamat_puskesmas: e.target.value })}
                required
              />
              <Input
                label="Kontak / Telepon"
                value={formData.kontak_puskesmas}
                onChange={(e) => setFormData({ ...formData, kontak_puskesmas: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-teal-600" /> Otomatisasi Pengingat (Reminder)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sistem akan memicu cron job notifikasi sebelum jadwal posyandu atau PMT dilaksanakan
            </p>

            <Select
              label="Waktu Pemicu Pengingat Jadwal"
              value={formData.hari_pengingat_notifikasi}
              onChange={(e) => setFormData({ ...formData, hari_pengingat_notifikasi: e.target.value })}
              options={[
                { value: '1', label: 'H-1 (Satu hari sebelum jadwal)' },
                { value: '2', label: 'H-2 (Dua hari sebelum jadwal)' },
                { value: '3', label: 'H-3 (Tiga hari sebelum jadwal)' }
              ]}
              helperText="Default rekomendasi: H-1 jadwal pelaksanaan kegiatan"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={loading}
              className="w-full sm:w-auto"
            >
              Simpan & Terapkan Pengaturan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;

