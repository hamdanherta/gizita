const app = require('./app');
const { sequelize } = require('./models');
const CronService = require('./services/cronService');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

// Pastikan direktori uploads tersedia
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi ke MySQL Database (gizita_db) berhasil terhubung!');

    // Mulai Scheduler Cron Job
    CronService.startScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Gizita Backend API berjalan di http://localhost:${PORT}`);
      console.log(`🩺 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Gagal menyambung ke database MySQL:', err.message);
    process.exit(1);
  }
}

startServer();

