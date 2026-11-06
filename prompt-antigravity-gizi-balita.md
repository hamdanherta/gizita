# Prompt Antigravity: Sistem Informasi Pemantauan dan Perencanaan Gizi Balita (Puskesmas Kebun Kopi)

## BAGIAN A. DAFTAR FITUR (hasil dari use case)

### Fitur umum (semua role)
- Login (email/username + password), Logout
- Dashboard sesuai role
- Notifikasi dalam aplikasi (ikon lonceng)
- Ubah profil dan ubah password sendiri

### Admin
1. Kelola data pengguna/akun (tambah, ubah, hapus/nonaktifkan, reset password, atur role)
2. Kelola data puskesmas
3. Kelola data wilayah/posyandu
4. Lihat log aktivitas pengguna (filter tanggal, pengguna, aksi)
5. Kelola pengaturan sistem (nama aplikasi, logo, kontak puskesmas, ambang batas notifikasi)

### Petugas Gizi
1. Kelola data balita
2. Kelola data orang tua/wali
3. Input hasil penimbangan dan pengukuran (BB, TB/PB, lingkar kepala, LILA)
4. Pantau pertumbuhan balita (grafik KMS)
5. Tentukan/lihat status gizi balita (otomatis hitung z-score standar WHO)
6. Susun rencana intervensi gizi
7. Kelola jadwal pemberian PMT
8. Catat konsumsi PMT
9. Kelola menu makanan balita
10. Kelola jadwal posyandu
11. Cetak laporan pemantauan gizi (PDF/Excel)
12. Lihat riwayat intervensi gizi

### Dokter
1. Lihat hasil pemantauan gizi balita
2. Beri rekomendasi terkait status gizi
3. Lihat riwayat intervensi gizi
4. Tambahkan catatan pemeriksaan kesehatan
5. Lihat data pertumbuhan anak/grafik KMS
6. Lihat status gizi anak
7. Lihat rencana intervensi gizi
8. Terima notifikasi jadwal posyandu/PMT
9. Lihat riwayat kunjungan posyandu

---

## BAGIAN B. PROMPT UNTUK ANTIGRAVITY (salin mulai dari sini)

```
Kamu adalah senior full-stack engineer. Bangun aplikasi web lengkap dan siap jalan berjudul:

"Rancang Bangun Sistem Informasi Pemantauan dan Perencanaan Gizi Balita Berbasis Web di Puskesmas Kebun Kopi"

Nama aplikasi (tampilan): "Gizita" (tampil di judul tab browser, halaman login, sidebar, dan header laporan; nilai awal pengaturan_sistem nama_aplikasi = "Gizita" lewat seeder).

ATURAN KERJA (WAJIB)
1. Buat Implementation Plan dulu, lalu eksekusi sampai selesai tanpa berhenti di tengah.
2. Semua fitur di bawah HARUS berfungsi end-to-end (UI -> API -> database). Dilarang ada tombol/menu/halaman placeholder, "coming soon", data dummy hardcode di frontend, atau fungsi kosong.
3. Setelah selesai, jalankan backend dan frontend, lalu uji SETIAP fitur lewat browser (login tiap role, CRUD, hitung status gizi, grafik, notifikasi, cetak laporan, logout). Perbaiki semua error/bug yang ditemukan sampai bersih. Tidak boleh ada error di console browser maupun terminal.
4. Berikan laporan akhir berisi checklist hasil uji per fitur.

TECH STACK
- Backend: Node.js (LTS) + Express, struktur MVC (routes, controllers, services, middlewares, models)
- Database: MySQL 8, akses lewat Sequelize ORM (atau mysql2 + query terparameter). Wajib migration + seeder.
- Frontend: React + Vite, React Router, Axios, Tailwind CSS, Recharts (grafik), lucide-react (ikon)
- Auth: JWT (access token) + bcrypt untuk hash password, role-based access control (RBAC) di backend DAN frontend (route guard)
- Validasi: express-validator atau Zod di backend; validasi form di frontend
- Keamanan: helmet, cors, rate limit untuk login, query terparameter (anti SQL injection), sanitasi input
- Laporan: PDF (pdfkit atau jspdf) dan Excel (exceljs)
- Struktur monorepo: /backend dan /frontend, masing-masing punya package.json, .env.example, dan README.md utama berisi langkah instalasi lengkap

DESAIN UI/UX
- Tema WHITE MODE saja: latar putih/abu sangat terang (#F8FAFC), kartu putih, aksen warna hijau-teal (#0D9488) yang segar dan bernuansa kesehatan, teks gelap (#0F172A)
- Modern dan bersih: kartu rounded-xl, bayangan halus, spacing lega, font Inter/Poppins, ikon konsisten
- RESPONSIF penuh: desktop (sidebar tetap di kiri + topbar), tablet, mobile (sidebar jadi drawer dengan tombol hamburger; tabel berubah jadi tampilan kartu atau scroll horizontal rapi; form satu kolom; tombol mudah ditekan)
- Halaman login modern (split layout di desktop, satu kolom di mobile), ada tampilkan/sembunyikan password, pesan error jelas
- Komponen reusable: Button, Input, Select, Modal, ConfirmDialog, Table dengan search + pagination + sorting, Badge status, Toast notifikasi, Skeleton/loading state, EmptyState
- Setiap aksi memberi umpan balik (toast sukses/gagal), loading state, dan konfirmasi sebelum hapus
- Badge warna status gizi: merah (buruk/sangat kurang/sangat pendek), kuning (kurang/pendek/berisiko lebih), hijau (normal/baik), oranye (lebih), ungu (obesitas)

ROLE DAN HAK AKSES
- admin, petugas_gizi, dokter. Backend menolak (403) akses di luar hak role. Menu sidebar hanya menampilkan menu sesuai role.

DATABASE (minimal tabel berikut, tambahkan kolom created_at/updated_at, foreign key, dan index)
- puskesmas (id, nama, alamat, telepon, email, kepala)
- wilayah_posyandu (id, puskesmas_id, nama_posyandu, kelurahan_desa, alamat, nama_kader, telepon_kader)
- users (id, nama, username, email, password_hash, role, puskesmas_id, no_hp, status_aktif, last_login)
- orang_tua (id, nama_ayah, nama_ibu, nik, no_hp, alamat, pekerjaan, wilayah_posyandu_id)
- balita (id, orang_tua_id, wilayah_posyandu_id, nik, nama, jenis_kelamin, tanggal_lahir, berat_lahir, panjang_lahir, anak_ke, status_aktif)
- pengukuran (id, balita_id, tanggal_ukur, umur_bulan, berat_badan, tinggi_badan, cara_ukur [terlentang/berdiri], lingkar_kepala, lila, petugas_id, posyandu_id, catatan)
- status_gizi (id, pengukuran_id, balita_id, zscore_bbu, zscore_tbu, zscore_bbtb, kategori_bbu, kategori_tbu, kategori_bbtb, status_final)
- who_lms (indikator, jenis_kelamin, umur_bulan_atau_tinggi, L, M, S) berisi tabel referensi standar antropometri WHO untuk BB/U, TB/U (PB/U), BB/PB dan BB/TB usia 0-60 bulan; isi lewat seeder
- rencana_intervensi (id, balita_id, status_gizi_id, jenis_intervensi [PMT/konseling/rujukan/suplemen/lainnya], tujuan, target, tanggal_mulai, tanggal_selesai, status [direncanakan/berjalan/selesai/dibatalkan], dibuat_oleh, catatan)
- jadwal_pmt (id, rencana_intervensi_id, balita_id, tanggal, menu_id, jumlah_porsi, status [terjadwal/diberikan/tidak_diberikan])
- konsumsi_pmt (id, jadwal_pmt_id, balita_id, tanggal, porsi_dihabiskan [habis/sebagian/tidak], catatan, dicatat_oleh)
- menu_makanan (id, nama_menu, jenis [PMT/MPASI/makanan_keluarga], kelompok_umur, bahan, energi_kkal, protein_g, lemak_g, karbohidrat_g, deskripsi, aktif)
- jadwal_posyandu (id, wilayah_posyandu_id, tanggal, jam_mulai, jam_selesai, lokasi, kegiatan, keterangan, status [terjadwal/selesai/dibatalkan])
- kunjungan_posyandu (id, jadwal_posyandu_id, balita_id, pengukuran_id, catatan)
- catatan_pemeriksaan (id, balita_id, dokter_id, tanggal, keluhan, diagnosa, tindakan, catatan)
- rekomendasi_dokter (id, balita_id, status_gizi_id, dokter_id, isi_rekomendasi, tanggal)
- notifikasi (id, user_id, judul, pesan, tipe, referensi_id, sudah_dibaca, created_at)
- log_aktivitas (id, user_id, aksi, modul, detail, ip_address, created_at)
- pengaturan_sistem (key, value) untuk nama aplikasi, logo, alamat/kontak puskesmas, hari pengingat notifikasi sebelum jadwal (default 1 hari)

Sediakan seeder: 1 puskesmas (Puskesmas Kebun Kopi), 3-4 posyandu, akun demo (admin/admin123, petugas/petugas123, dokter/dokter123 — tampilkan di README), ±20 balita contoh dengan pengukuran beberapa bulan, menu makanan contoh, jadwal posyandu mendatang, dan seluruh data who_lms.

LOGIKA STATUS GIZI (HARUS AKURAT)
- Umur dihitung dalam bulan dari tanggal_lahir ke tanggal_ukur.
- Hitung z-score dengan metode LMS WHO: z = ((X/M)^L - 1) / (L*S) jika L != 0; z = ln(X/M)/S jika L = 0. Terapkan penyesuaian WHO untuk |z| > 3 (pakai SD3/SD2 hasil ekstrapolasi sesuai metode WHO).
- Indikator: BB/U, TB/U (PB/U untuk <24 bulan, TB/U untuk >=24 bulan; koreksi +/-0,7 cm sesuai cara ukur), BB/PB atau BB/TB.
- Kategori mengikuti Permenkes No. 2 Tahun 2020:
  * BB/U: sangat kurang (< -3 SD), kurang (-3 s.d. < -2 SD), normal (-2 s.d. +1 SD), risiko BB lebih (> +1 SD)
  * TB/U: sangat pendek (< -3), pendek (-3 s.d. < -2), normal (-2 s.d. +3), tinggi (> +3)
  * BB/TB: gizi buruk (< -3), gizi kurang (-3 s.d. < -2), gizi baik (-2 s.d. +1), berisiko gizi lebih (> +1 s.d. +2), gizi lebih (> +2 s.d. +3), obesitas (> +3)
- Status akhir ditentukan otomatis saat pengukuran disimpan; tampilkan semua indikator. Sediakan unit test untuk fungsi perhitungan ini dengan beberapa kasus uji, dan verifikasi hasilnya terhadap tabel resmi WHO/Permenkes.
- Validasi masuk akal untuk input (BB 1-30 kg, TB 40-130 cm, umur 0-60 bulan); tolak dan beri pesan jelas jika di luar rentang.
- Jika status gizi bermasalah (kurang/buruk/pendek/sangat pendek/lebih/obesitas), kirim notifikasi ke semua dokter dan tandai balita di dashboard sebagai "perlu perhatian".

HALAMAN DAN FITUR PER ROLE

[Semua role]
- /login (validasi, error jelas, redirect sesuai role, token kedaluwarsa -> logout otomatis), tombol Logout di topbar
- Dashboard per role (kartu ringkasan + grafik), ikon notifikasi dengan badge jumlah belum dibaca, halaman daftar notifikasi (tandai dibaca / tandai semua dibaca), halaman profil dan ubah password

[Admin]
- Dashboard: total pengguna, balita, posyandu, aktivitas terbaru
- Kelola Pengguna: tabel + cari + filter role; tambah/ubah/nonaktifkan/hapus; reset password
- Kelola Data Puskesmas: lihat dan ubah
- Kelola Data Wilayah/Posyandu: CRUD
- Log Aktivitas: tabel read-only, filter tanggal/pengguna/modul, pagination
- Pengaturan Sistem: form simpan pengaturan (benar-benar mempengaruhi tampilan, mis. nama aplikasi di sidebar/judul dan logo)

[Petugas Gizi]
- Dashboard: jumlah balita per kategori status gizi (grafik donat/batang), balita perlu perhatian, jadwal posyandu/PMT terdekat
- Data Balita: CRUD, pencarian (nama/NIK), filter posyandu dan status gizi, halaman detail balita (profil, riwayat pengukuran, status gizi terbaru, intervensi)
- Data Orang Tua/Wali: CRUD, tampilkan anak yang terhubung
- Input Penimbangan & Pengukuran: pilih balita, isi data, hitung otomatis umur dan status gizi, tampilkan hasil seketika setelah simpan; bisa ubah/hapus
- Pantau Pertumbuhan: pilih balita, grafik KMS/kurva WHO (BB/U, TB/U, BB/TB) dengan kurva -3SD, -2SD, median, +1SD, +2SD, +3SD dan titik pengukuran balita; tabel riwayat
- Status Gizi Balita: daftar semua balita dengan status gizi terbaru, filter, ekspor
- Rencana Intervensi: CRUD, otomatis terhubung ke status gizi balita, ubah status rencana
- Jadwal PMT: CRUD jadwal per balita/rencana, tampilan kalender atau daftar, ubah status
- Catat Konsumsi PMT: dari jadwal PMT, catat habis/sebagian/tidak, ringkasan kepatuhan
- Menu Makanan Balita: CRUD, kandungan gizi, filter jenis dan kelompok umur
- Jadwal Posyandu: CRUD; saat dibuat/diubah, kirim notifikasi ke dokter dan petugas; catat kunjungan balita pada jadwal tsb
- Cetak Laporan Pemantauan Gizi: pilih periode, posyandu, jenis laporan (rekap status gizi, daftar balita bermasalah, rekap PMT, rekap kunjungan posyandu); preview di layar lalu unduh PDF dan Excel
- Riwayat Intervensi Gizi: tabel riwayat semua intervensi dengan filter

[Dokter]
- Dashboard: balita perlu perhatian, ringkasan status gizi, notifikasi terbaru, jadwal terdekat
- Hasil Pemantauan Gizi: daftar dan detail pemantauan (read-only data pengukuran)
- Grafik Pertumbuhan/KMS: sama dengan petugas tetapi read-only
- Status Gizi Anak: daftar + detail, filter
- Rencana Intervensi: lihat (read-only) dan detail
- Riwayat Intervensi Gizi dan Riwayat Kunjungan Posyandu: lihat dengan filter
- Beri Rekomendasi: form rekomendasi terkait status gizi, tersimpan dan tampil di detail balita serta terlihat petugas gizi (notifikasi ke petugas gizi saat ada rekomendasi baru)
- Catatan Pemeriksaan Kesehatan: tambah/ubah/lihat riwayat per balita
- Notifikasi jadwal posyandu/PMT: notifikasi in-app otomatis (job terjadwal node-cron berjalan harian + saat jadwal dibuat) H-1 jadwal

REQUIREMENT TEKNIS TAMBAHAN
- Semua endpoint REST diawali /api, response JSON konsisten {success, message, data}, error handler global, kode HTTP benar
- Pagination, search, filter di sisi server untuk tabel besar
- Catat log aktivitas otomatis (login, logout, tambah/ubah/hapus data penting) lewat middleware/service
- Hapus data yang punya relasi harus aman (cegah error foreign key dengan pesan jelas atau soft delete)
- Format tanggal Indonesia (dd MMMM yyyy), zona waktu Asia/Jakarta, seluruh teks UI berbahasa Indonesia
- Skrip npm: backend (dev, start, migrate, seed, test), frontend (dev, build); satu perintah README untuk setup: buat database, copy .env, install, migrate, seed, jalankan
- Kode rapi, terkomentar seperlunya, tanpa dependency yang tidak dipakai

KRITERIA SELESAI (Definition of Done)
- npm run build frontend sukses tanpa warning/error
- Backend berjalan tanpa error, semua migration dan seeder sukses
- Setiap role berhasil login, hanya melihat menu yang sesuai, dan semua fitur di daftar di atas diuji lewat browser serta berfungsi (create, read, update, delete, filter, cetak, notifikasi)
- Tampilan diuji di lebar mobile (375px), tablet (768px), dan desktop (1440px) tanpa layout rusak
- Laporan akhir: daftar fitur beserta hasil uji (lulus/gagal) dan perbaikan yang dilakukan
```

---

## BAGIAN C. TIPS PAKAI DI ANTIGRAVITY
1. Buka workspace folder kosong, pilih mode **Planning**, tempel prompt di Bagian B, lalu setujui Implementation Plan.
2. Pastikan MySQL sudah terpasang dan jalan di komputer Anda sebelum agent mulai menguji.
3. Jika ada yang error, jangan buat prompt baru dari nol. Cukup tulis: "Fitur X error: [pesan error]. Perbaiki dan uji ulang lewat browser."
4. Untuk keperluan skripsi, periksa sendiri hasil hitung status gizi pada beberapa balita contoh terhadap tabel resmi WHO/Permenkes sebelum dipakai sebagai bahan pengujian.
