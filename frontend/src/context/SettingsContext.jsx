import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    nama_aplikasi: 'Gizita',
    logo_url: '/logo.png',
    nama_puskesmas: 'Puskesmas Kebun Kopi',
    alamat_puskesmas: 'Jl. Kebun Kopi No. 45, Kota Jambi',
    kontak_puskesmas: '0741-654321',
    hari_pengingat_notifikasi: '1'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/pengaturan');
      if (res.data.success && res.data.data) {
        setSettings(prev => ({ ...prev, ...res.data.data }));
        // Update document title dynamically
        if (res.data.data.nama_aplikasi) {
          document.title = `${res.data.data.nama_aplikasi} - Pemantauan & Perencanaan Gizi Balita`;
        }
      }
    } catch (err) {
      console.error('Gagal mengambil pengaturan sistem:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

