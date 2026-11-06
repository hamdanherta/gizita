const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*', // Dapat disesuaikan ke ['http://localhost:3000', 'http://127.0.0.1:3000']
  credentials: true
}));

// Rate limiter untuk mencegah brute-force login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 percobaan
  message: {
    success: false,
    message: 'Terlalu banyak percobaan masuk dari IP ini, silakan coba lagi dalam 15 menit.'
  }
});
app.use('/api/auth/login', loginLimiter);

// Parsing request body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static folder untuk upload logo / berkas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root endpoint check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gizita Puskesmas Kebun Kopi aktif dan berjalan optimal.',
    timestamp: new Date().toISOString()
  });
});

// Middleware Validasi Lisensi Sistem
const { checkLicenseMiddleware } = require('./services/zscoreService');
app.use('/api', checkLicenseMiddleware);

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan.`
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;

