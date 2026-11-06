const { spawn, exec } = require('child_process');
const path = require('path');
const http = require('http');

console.log('\x1b[36m%s\x1b[0m', '==============================================================');
console.log('\x1b[32m%s\x1b[0m', '   GIZITA - PUSKESMAS KEBUN KOPI KOTA JAMBI');
console.log('\x1b[37m%s\x1b[0m', '   Sistem Informasi Pemantauan & Perencanaan Gizi Balita');
console.log('\x1b[36m%s\x1b[0m', '==============================================================');
console.log('\x1b[33m%s\x1b[0m', '🚀 Memulai Server Backend (Port 5000) & Frontend (Port 3000)...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Jalankan Backend Express
const backend = spawn('node', ['backend/src/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: isWin
});

// 2. Jalankan Frontend Vite
const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: isWin
});

// 3. Tunggu frontend dan backend siap, lalu buka browser otomatis
let opened = false;
function checkAndOpenBrowser() {
  if (opened) return;
  http.get('http://localhost:3000', (res) => {
    if (!opened) {
      opened = true;
      console.log('\n\x1b[35m%s\x1b[0m', '✨ Semua server Gizita siap digunakan!');
      console.log('\x1b[32m%s\x1b[0m', '👉 Aplikasi Web : http://localhost:3000');
      console.log('\x1b[36m%s\x1b[0m', '👉 Backend API  : http://localhost:5000\n');
      console.log('\x1b[90m%s\x1b[0m', 'Tekan Ctrl+C untuk menghentikan server kapan saja.\n');

      const openCmd = isWin ? 'start http://localhost:3000' : 'xdg-open http://localhost:3000 || open http://localhost:3000';
      exec(openCmd);
    }
  }).on('error', () => {
    setTimeout(checkAndOpenBrowser, 500);
  });
}

// Mulai pengecekan setelah 1 detik
setTimeout(checkAndOpenBrowser, 1000);

// Graceful cleanup saat dihentikan (Ctrl+C)
function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', '🛑 Menghentikan semua server Gizita...');
  try {
    if (isWin) {
      if (backend.pid) exec(`taskkill /pid ${backend.pid} /T /F`, () => {});
      if (frontend.pid) exec(`taskkill /pid ${frontend.pid} /T /F`, () => {});
    } else {
      backend.kill('SIGINT');
      frontend.kill('SIGINT');
    }
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
