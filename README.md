# Gizita — Sistem Informasi Pemantauan & Perencanaan Gizi Balita
### Puskesmas Kebun Kopi Kota Jambi

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Express.js%20(MVC)-339933?logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%208%20%2F%20Sequelize-4479A1?logo=mysql)](https://mysql.com/)
[![Standard](https://img.shields.io/badge/Standard-WHO%20LMS%20%26%20Permenkes%202%2F2020-008080)](https://peraturan.bpk.go.id/Details/152505/permenkes-no-2-tahun-2020)

---

## 📌 Ringkasan Proyek

**Gizita** (*Sistem Informasi Pemantauan dan Perencanaan Gizi Balita Berbasis Web*) adalah sistem informasi kesehatan terpadu yang dirancang untuk **Puskesmas Kebun Kopi**, Kota Jambi. Sistem ini menyediakan pemantauan antropometri pertumbuhan balita secara akurat berbasis standar **WHO Child Growth Standards (LMS Method)** dan regulasi **Permenkes RI No. 2 Tahun 2020**.

Sistem mengintegrasikan peran **Admin**, **Petugas Gizi**, dan **Dokter** dalam satu alur kerja terotomatisasi:
- Pencatatan antropometri (BB, PB/TB, LK, LILA) dengan koreksi posisi ukur secara otomatis.
- Visualisasi Kartu Menuju Sehat (**KMS**) interaktif dengan kurva standar WHO (-3 SD s.d. +3 SD).
- Penilaian status gizi otomatis multi-indikator (BB/U, TB/U, BB/TB) dan peringatan gizi buruk/stunting.
- Rencana intervensi gizi terintegrasi, jadwal dan kepatuhan konsumsi Pemberian Makanan Tambahan (**PMT**).
- Penjadwalan posyandu dengan pengingat otomatis (**Cron Job H-1**).
- Pemberian rekomendasi dokter dan pencatatan riwayat medis/pemeriksaan kesehatan balita.
- Ekspor laporan resmi (PDF dan Excel) dengan kop Puskesmas Kebun Kopi.

---

## 🚀 Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (MVC Architecture)
- **ORM / Database:** Sequelize ORM, MySQL 8
- **Authentication:** JWT (JSON Web Tokens) & BCrypt password hashing
- **Security & Utility:** Helmet, CORS, Express Rate Limit, Express Validator
- **Z-Score Engine:** Formula WHO LMS + Penyesuaian Ekstrapolasi WHO $|z| > 3$ (`who-growth-standards`)
- **Reporting Engine:** PDFKit (Export PDF dengan kop Puskesmas resmi) & ExcelJS (Spreadsheet dengan format tabel rapi)
- **Scheduler:** Node-cron (Pengingat otomatis H-1 Posyandu & PMT setiap pukul 06:00 WIB)

### Frontend
- **Framework:** React 18, Vite SPA
- **Styling:** Tailwind CSS (Tema White Mode: `#F8FAFC`, aksen teal `#0D9488`, teks gelap `#0F172A`)
- **Routing:** React Router DOM v6 (RBAC Route Guard per role)
- **Icons:** Lucide React
- **Data Visualization:** Recharts (KMS Growth Chart WHO curve & Nutrition Donut Chart)
- **HTTP Client:** Axios (Interceptors token JWT otomatis & error handling)
- **Date Handling:** date-fns (Format tanggal bahasa Indonesia `dd MMMM yyyy`)

---

## 🔐 Akun Demo (Pre-configured)

Aplikasi telah dilengkapi seeder data awal dengan 3 role pengguna siap pakai:

| Role | Username | Password | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Kelola akun pengguna, puskesmas, wilayah posyandu, audit log aktivitas, pengaturan sistem. |
| **Petugas Gizi** | `petugas` | `petugas123` | Input antropometri, pantau grafik KMS, kelola intervensi, jadwal & konsumsi PMT, menu makanan, jadwal posyandu, ekspor laporan. |
| **Dokter** | `dokter` | `dokter123` | Lihat pemantauan gizi & grafik KMS, berikan rekomendasi gizi, catatan pemeriksaan kesehatan balita, pantau riwayat posyandu/PMT. |

> **Catatan:** Pada halaman login disediakan tombol **Quick Login** untuk memudahkan penguji beralih akun hanya dengan 1 kali klik.

---

## 📂 Struktur Direktori

```
gizita/
├── package.json                 # Root script runner (start, dev, build, test, seed)
├── README.md                    # Dokumentasi lengkap proyek
├── prompt-antigravity-gizi-balita.md
├── backend/
│   ├── .env                     # Konfigurasi database & JWT
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── app.js               # Inisialisasi Express, middleware, CORS, routes
│   │   ├── server.js            # Server listener & bootstrap
│   │   ├── config/
│   │   │   └── database.js      # Koneksi Sequelize MySQL
│   │   ├── models/              # 19 Sequelize Models (Users, Balita, Pengukuran, dll.)
│   │   ├── controllers/         # 20 Controller REST API
│   │   ├── routes/              # Routing REST API `/api/*`
│   │   ├── middlewares/         # authMiddleware (JWT & RBAC), activityLogger, errorHandler
│   │   ├── services/
│   │   │   ├── zscoreService.js        # Engine WHO LMS & Permenkes No. 2/2020
│   │   │   ├── notificationService.js  # Service notifikasi in-app
│   │   │   ├── cronService.js          # Scheduled cron jobs H-1
│   │   │   └── reportService.js        # Generator PDFKit & ExcelJS
│   │   ├── seeders/
│   │   │   └── seed.js          # Seeder master data, 20 balita, pengukuran, who_lms
│   │   └── tests/
│   │       └── runTests.js      # 8 Unit Tests perhitungan Z-Score
│   └── uploads/                 # Direktori berkas unggahan logo
└── frontend/
    ├── package.json
    ├── vite.config.js           # Vite config & API reverse proxy ke localhost:5000
    ├── tailwind.config.js       # Desain tema White Mode & palet warna kesehatan
    ├── index.html
    └── src/
        ├── main.jsx             # React DOM root & Providers
        ├── App.jsx              # RBAC Routes & Protected Router
        ├── index.css            # Tailwind directives
        ├── context/             # AuthContext, ToastContext, SettingsContext
        ├── services/            # Axios API instance
        ├── components/
        │   ├── common/          # Button, Input, Select, Modal, Table, Pagination, Badge, dll.
        │   ├── charts/          # KmsChart (WHO Lines), NutritionDonutChart
        │   └── layout/          # AppLayout, Sidebar (Desktop & Drawer), Topbar, ProtectedRoute
        └── pages/
            ├── auth/            # Login (Split Layout & Quick Login)
            ├── common/          # Dashboard per role, Profile, Notifikasi
            ├── admin/           # Pengguna, Puskesmas, Posyandu, Log Aktivitas, Pengaturan
            ├── gizi/            # Balita, Detail, Pengukuran, KMS, PMT, Menu, Posyandu, Laporan
            └── dokter/          # Catatan Pemeriksaan, Rekomendasi Dokter
```

---

## ⚙️ Panduan Instalasi & Menjalankan Sistem

### Prasyarat
1. **Node.js** (versi 18.x atau lebih baru) dan `npm`.
2. **MySQL Server** (Laragon, XAMPP, atau MySQL standalone).
   - Pastikan MySQL berjalan pada port `3306`.
   - Konfigurasi default di `backend/.env`:
     ```env
     PORT=5000
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=gizita_db
     DB_USER=root
     DB_PASS=hertacompany
     JWT_SECRET=gizita_secret_jwt_key_puskesmas_kebun_kopi_2026
     JWT_EXPIRES_IN=7d
     ```
     *(Sesuaikan `DB_PASS` dengan password MySQL komputer Anda jika berbeda)*.

### ⚡ Cara Cepat Menjalankan Semua Server (1 Kali Perintah)

Cukup buka terminal di folder proyek `gizita`, lalu ketik:
```bash
./gizita
```
Perintah ini akan secara otomatis:
1. Menjalankan **Backend Server** (Port 5000) dengan koneksi MySQL & cron scheduler.
2. Menjalankan **Frontend App** (Port 3000) dengan Vite dev server & proxy API.
3. Otomatis **membuka browser** Anda ke `http://localhost:3000` saat kedua server siap.
4. Menekan `Ctrl + C` akan mematikan kedua server secara bersih.

---

### Langkah Manual / Terpisah (Opsional)

#### 1. Setup Database & Jalankan Seeder
```bash
npm run seed
```

#### 2. Jalankan Backend & Frontend Manual
```bash
# Menjalankan backend saja:
npm run start:backend

# Menjalankan frontend saja:
npm run dev:frontend
```

Untuk build production frontend:
```bash
npm run build:frontend
```

---

## 🧮 Logika Perhitungan Status Gizi (WHO LMS & Permenkes No. 2/2020)

Perhitungan status gizi dilakukan secara komputasi presisi menggunakan rumus LMS Organisasi Kesehatan Dunia (WHO):
$$Z = \frac{(X / M)^L - 1}{L \times S} \quad (L \neq 0)$$
$$Z = \frac{\ln(X / M)}{S} \quad (L = 0)$$

### 1. Koreksi Cara Ukur Panjang/Tinggi Badan
- **Usia < 24 bulan diukur berdiri:** Nilai panjang badan dikoreksi dengan menambahkan $+0,7\text{ cm}$.
- **Usia $\ge$ 24 bulan diukur terlentang:** Nilai tinggi badan dikoreksi dengan mengurangi $-0,7\text{ cm}$.

### 2. Penyesuaian Ekstrapolasi Nilai Ekstrem ($|Z| > 3$)
Sesuai rekomendasi WHO, untuk nilai $|Z| > 3$, digunakan penyesuaian simpangan baku berbasis $SD3$ dan $SD2$ untuk menghindari distorsi kuadratik pada ekor distribusi.

### 3. Klasifikasi Status Gizi (Permenkes RI No. 2 Tahun 2020)
| Indikator | Kategori Status Gizi | Rentang Z-Score |
| :--- | :--- | :--- |
| **Berat Badan menurut Umur (BB/U)** | Berat badan sangat kurang | $< -3.0\text{ SD}$ |
| | Berat badan kurang | $-3.0\text{ SD}$ s.d. $< -2.0\text{ SD}$ |
| | Berat badan normal | $-2.0\text{ SD}$ s.d. $+1.0\text{ SD}$ |
| | Risiko berat badan lebih | $> +1.0\text{ SD}$ |
| **Tinggi Badan menurut Umur (TB/U)** | Sangat pendek (*Severely Stunted*) | $< -3.0\text{ SD}$ |
| | Pendek (*Stunted*) | $-3.0\text{ SD}$ s.d. $< -2.0\text{ SD}$ |
| | Normal | $-2.0\text{ SD}$ s.d. $+3.0\text{ SD}$ |
| | Tinggi | $> +3.0\text{ SD}$ |
| **BB menurut TB/PB (BB/TB)** | Gizi buruk (*Severely Wasted*) | $< -3.0\text{ SD}$ |
| | Gizi kurang (*Wasted*) | $-3.0\text{ SD}$ s.d. $< -2.0\text{ SD}$ |
| | Gizi baik (*Normal*) | $-2.0\text{ SD}$ s.d. $+1.0\text{ SD}$ |
| | Berisiko gizi lebih | $> +1.0\text{ SD}$ s.d. $+2.0\text{ SD}$ |
| | Gizi lebih (*Overweight*) | $> +2.0\text{ SD}$ s.d. $+3.0\text{ SD}$ |
| | Obesitas (*Obese*) | $> +3.0\text{ SD}$ |

---

## 📊 Fitur Lengkap Sesuai Use Case

### 1. Fitur Umum (Semua Role)
- [x] **Autentikasi:** Login dengan Username/Email dan Password, Show/Hide Password, Quick Demo Login, Auto Logout saat token kedaluwarsa.
- [x] **Dashboard Khusus Per Role:** Ringkasan statistik, bagan grafik gizi, balita perhatian khusus, jadwal terdekat.
- [x] **Sistem Notifikasi Real-time:** Ikon lonceng dengan badge jumlah notifikasi baru, dropdown ringkas, halaman notifikasi lengkap, tombol tandai telah dibaca.
- [x] **Manajemen Profil:** Ubah nama, email, nomor telepon, dan ganti password dengan konfirmasi password lama.

### 2. Fitur Administrator
- [x] **Kelola Pengguna:** CRUD user, aktivasi/nonaktifkan akun, reset password instan ke `password123`, pencarian & filter berdasarkan role.
- [x] **Kelola Puskesmas:** Update profil Puskesmas Kebun Kopi (nama, alamat, telepon, email, nama kepala puskesmas).
- [x] **Kelola Wilayah Posyandu:** CRUD wilayah posyandu, data kader, kontak, dan alamat terintegrasi dengan balita.
- [x] **Audit Log Aktivitas:** Riwayat aktivitas lengkap (Login, Pengukuran, Intervensi, Perubahan Akun) dengan filter pengguna, modul, tanggal, serta IP address.
- [x] **Pengaturan Sistem:** Konfigurasi dinamis nama aplikasi, logo, alamat/kontak puskesmas, dan ambang hari pengingat notifikasi (berefek langsung ke sidebar, title bar, dan laporan).

### 3. Fitur Petugas Gizi
- [x] **Data Balita:** CRUD balita, validasi NIK (16 digit), filter wilayah posyandu dan status gizi, pencarian nama/NIK.
- [x] **Detail Balita Terpadu:** Informasi orang tua, biodata balita, riwayat pengukuran lengkap, status gizi terkini, grafik perkembangan, rekomendasi dokter, dan rencana intervensi.
- [x] **Data Orang Tua/Wali:** CRUD orang tua dan daftar balita yang terhubung secara otomatis.
- [x] **Input Pengukuran & Penimbangan:** Form input BB, PB/TB, lingkar kepala, LILA, pemilihan cara ukur (terlentang/berdiri). Menghitung z-score dan status gizi seketika.
- [x] **Pantau Pertumbuhan Balita (KMS Interaktif):** Grafik kurva pertumbuhan standar WHO dengan 6 garis deviasi standar (-3SD, -2SD, Median, +1SD, +2SD, +3SD) dan titik plot riwayat anak.
- [x] **Status Gizi Terkini:** Rekapitulasi seluruh balita dengan badge warna indikator gizi.
- [x] **Rencana Intervensi Gizi:** CRUD intervensi (PMT, Konseling, Rujukan, Suplemen), target, tanggal mulai/selesai, serta status intervensi.
- [x] **Jadwal & Konsumsi PMT:** Kelola jadwal pemberian makanan tambahan, catat status kepatuhan konsumsi (Habis / Sebagian / Tidak), kalkulasi persentase kepatuhan.
- [x] **Manajemen Menu Makanan:** CRUD menu PMT / MPASI / Makanan Keluarga dengan rincian makronutrien (Energi kkal, Protein, Lemak, Karbohidrat).
- [x] **Jadwal Posyandu:** CRUD jadwal kegiatan posyandu dan pencatatan absensi kunjungan balita.
- [x] **Cetak & Ekspor Laporan:** Pratinjau data di layar, ekspor ke **PDF** resmi ber-kop surat dan file **Excel (.xlsx)** multi-kolom yang rapi.

### 4. Fitur Dokter
- [x] **Pemeriksaan Kesehatan:** Input keluhan, diagnosa, tindakan medis, dan catatan pemeriksaan anak.
- [x] **Rekomendasi Status Gizi:** Input rekomendasi medis dari dokter untuk balita dengan gizi kurang/buruk/stunting. Otomatis memicu notifikasi langsung ke akun Petugas Gizi.
- [x] **Akses Read-Only Data Gizi & KMS:** Dokter dapat memantau seluruh riwayat penimbangan, kurva KMS, status gizi balita, riwayat PMT, dan kunjungan posyandu.
- [x] **Peringatan Otomatis Balita Malnutrisi:** Setiap kali ada balita terdeteksi gizi buruk/kurang/stunting, sistem mengirimkan notifikasi prioritas tinggi ke dokter.

---

## 🧪 Hasil Pengujian Unit Test

```bash
====================================================
RUNNING UNIT TESTS: WHO LMS & PERMENKES NO. 2 TAHUN 2020
====================================================

[PASS] Menghitung selisih umur hari dan bulan secara presisi
[PASS] Koreksi tinggi/panjang badan: anak < 24 bln diukur berdiri ditambah 0.7 cm
[PASS] Koreksi tinggi/panjang badan: anak >= 24 bln diukur terlentang dikurangi 0.7 cm
[PASS] Validasi menolak input di luar rentang wajar
   Hasil: BB/U=-0.05 (Berat badan normal), TB/U=-0.03 (Normal), BB/TB=-0.06 (Gizi baik), Final=Gizi Baik (Normal)
[PASS] Kasus Balita Gizi Baik & Normal (Laki-laki 12 bulan)
   Hasil: TB/U=-3.02 (Sangat pendek), Final=Sangat Pendek (Stunting Berat)
[PASS] Kasus Balita Sangat Pendek / Stunting (Perempuan 24 bulan, TB 76 cm)
   Hasil: BB/TB=-5.76 (Gizi buruk), Final=Gizi Buruk
[PASS] Kasus Balita Gizi Buruk (Laki-laki 12 bulan, BB 6.2 kg, TB 75.7 cm)
   Hasil: BB/TB=4.26 (Obesitas), Final=Obesitas
[PASS] Kasus Balita Obesitas (Perempuan 36 bulan, BB 21.0 kg, TB 95 cm)

----------------------------------------------------
HASIL TEST: 8 Passed, 0 Failed (100% SUKSES)
----------------------------------------------------
```

---

## 📄 Lisensi & Hak Cipta

Dikembangkan untuk keperluan **Sistem Informasi Pemantauan dan Perencanaan Gizi Balita Berbasis Web di Puskesmas Kebun Kopi**.
Semua hak cipta dan kode sumber dilindungi untuk kepentingan operasional Puskesmas dan institusi terkait.

