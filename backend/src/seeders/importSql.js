const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function run() {
  const sqlPath = path.resolve(__dirname, '../../../gizita_db.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('File gizita_db.sql tidak ditemukan di:', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Menghubungkan ke MySQL...');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true
  });

  console.log('Memasukkan database gizita_db.sql...');
  await conn.query(sql);
  await conn.end();

  console.log('\nBERHASIL! Database, seluruh tabel, dan akun login sudah masuk.');
  process.exit(0);
}

run().catch(err => {
  console.error('\nGagal:', err.message);
  process.exit(1);
});
