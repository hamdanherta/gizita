import React, { useState, useEffect } from 'react';
import { Building2, Save, MapPin, Phone, Mail, UserCheck } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Skeleton from '../../components/common/Skeleton';

const PuskesmasManagement = () => {
  const toast = useToast();
  const { refreshSettings } = useSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    kepala: ''
  });

  const fetchPuskesmas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/puskesmas');
      if (res.data.success && res.data.data) {
        setFormData({
          nama: res.data.data.nama || '',
          alamat: res.data.data.alamat || '',
          telepon: res.data.data.telepon || '',
          email: res.data.data.email || '',
          kepala: res.data.data.kepala || ''
        });
      }
    } catch {
      toast.error('Gagal mengambil data puskesmas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPuskesmas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/puskesmas', formData);
      if (res.data.success) {
        toast.success('Informasi Puskesmas berhasil diperbarui.');
        refreshSettings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data puskesmas.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" /> Profil & Data Puskesmas
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Data instansi puskesmas induk yang akan ditampilkan pada kop surat laporan dan header sistem
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama Puskesmas"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Puskesmas Kebun Kopi"
            required
          />

          <Input
            label="Kepala Puskesmas (Beserta Gelar)"
            icon={UserCheck}
            value={formData.kepala}
            onChange={(e) => setFormData({ ...formData, kepala: e.target.value })}
            placeholder="dr. Hj. Siti Rahma, M.Kes"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor Telepon Kantor"
              icon={Phone}
              value={formData.telepon}
              onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
              placeholder="0741-654321"
            />
            <Input
              label="Alamat Email Resmi"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="kebunkopi.pusk@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alamat Lengkap Puskesmas
            </label>
            <textarea
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Jl. Kebun Kopi No. 45, Kel. Thehok, Kec. Jambi Selatan, Kota Jambi"
              className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl p-3.5 hover:border-slate-400 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={saving}
              className="w-full sm:w-auto"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PuskesmasManagement;

