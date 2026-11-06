const assert = require('assert');
const ZscoreService = require('../services/zscoreService');

console.log('====================================================');
console.log('RUNNING UNIT TESTS: WHO LMS & PERMENKES NO. 2 TAHUN 2020');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`[PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${description}`);
    console.error(`   Error: ${err.message}`);
    failed++;
  }
}

// 1. Uji Hitung Umur
test('Menghitung selisih umur hari dan bulan secara presisi', () => {
  const age = ZscoreService.calculateAge('2024-01-01', '2025-01-01');
  assert.strictEqual(age.days, 366); // 2024 kabisat
  assert.strictEqual(age.months, 12);
});

// 2. Uji Koreksi Cara Ukur
test('Koreksi tinggi/panjang badan: anak < 24 bln diukur berdiri ditambah 0.7 cm', () => {
  const corrected = ZscoreService.correctHeight(75.0, 18, 'berdiri');
  assert.strictEqual(corrected, 75.7);
});

test('Koreksi tinggi/panjang badan: anak >= 24 bln diukur terlentang dikurangi 0.7 cm', () => {
  const corrected = ZscoreService.correctHeight(87.7, 26, 'terlentang');
  assert.strictEqual(corrected, 87.0);
});

// 3. Uji Validasi Input
test('Validasi menolak input di luar rentang wajar', () => {
  assert.throws(() => ZscoreService.validateInput(0.5, 70, 12), /Berat badan/);
  assert.throws(() => ZscoreService.validateInput(10, 35, 12), /Tinggi\/panjang badan/);
  assert.throws(() => ZscoreService.validateInput(10, 70, 65), /Umur balita/);
});

// 4. Uji Kasus Balita Normal (Laki-laki 12 bulan ~365 hari, BB 9.6 kg, PB 75.7 cm)
test('Kasus Balita Gizi Baik & Normal (Laki-laki 12 bulan)', () => {
  const res = ZscoreService.analyzeMeasurement({
    tanggalLahir: '2024-01-01',
    tanggalUkur: '2025-01-01',
    jenisKelamin: 'L',
    beratBadan: 9.6,
    tinggiBadan: 75.7,
    caraUkur: 'terlentang'
  });

  console.log(`   Hasil: BB/U=${res.zscoreBBU} (${res.kategoriBBU}), TB/U=${res.zscoreTBU} (${res.kategoriTBU}), BB/TB=${res.zscoreBBTB} (${res.kategoriBBTB}), Final=${res.statusFinal}`);
  assert.strictEqual(res.kategoriBBU, 'Berat badan normal');
  assert.strictEqual(res.kategoriTBU, 'Normal');
  assert.strictEqual(res.kategoriBBTB, 'Gizi baik');
  assert.strictEqual(res.statusFinal, 'Gizi Baik (Normal)');
  assert.strictEqual(res.perluPerhatian, false);
});

// 5. Uji Kasus Balita Stunting / Sangat Pendek (Perempuan 24 bulan, TB 76 cm)
test('Kasus Balita Sangat Pendek / Stunting (Perempuan 24 bulan, TB 76 cm)', () => {
  const res = ZscoreService.analyzeMeasurement({
    tanggalLahir: '2023-01-01',
    tanggalUkur: '2025-01-01',
    jenisKelamin: 'P',
    beratBadan: 10.0,
    tinggiBadan: 76.0,
    caraUkur: 'berdiri'
  });

  console.log(`   Hasil: TB/U=${res.zscoreTBU} (${res.kategoriTBU}), Final=${res.statusFinal}`);
  assert.ok(res.zscoreTBU < -3.0, `Z-Score TB/U harus < -3, didapat ${res.zscoreTBU}`);
  assert.strictEqual(res.kategoriTBU, 'Sangat pendek');
  assert.strictEqual(res.perluPerhatian, true);
});

// 6. Uji Kasus Balita Gizi Buruk (Laki-laki 12 bulan, BB 6.2 kg, TB 75.7 cm)
test('Kasus Balita Gizi Buruk (Laki-laki 12 bulan, BB 6.2 kg, TB 75.7 cm)', () => {
  const res = ZscoreService.analyzeMeasurement({
    tanggalLahir: '2024-01-01',
    tanggalUkur: '2025-01-01',
    jenisKelamin: 'L',
    beratBadan: 6.2,
    tinggiBadan: 75.7,
    caraUkur: 'terlentang'
  });

  console.log(`   Hasil: BB/TB=${res.zscoreBBTB} (${res.kategoriBBTB}), Final=${res.statusFinal}`);
  assert.ok(res.zscoreBBTB < -3.0, `Z-Score BB/TB harus < -3, didapat ${res.zscoreBBTB}`);
  assert.strictEqual(res.kategoriBBTB, 'Gizi buruk');
  assert.strictEqual(res.statusFinal, 'Gizi Buruk');
  assert.strictEqual(res.perluPerhatian, true);
});

// 7. Uji Kasus Obesitas (Perempuan 36 bulan, BB 21.0 kg, TB 95 cm)
test('Kasus Balita Obesitas (Perempuan 36 bulan, BB 21.0 kg, TB 95 cm)', () => {
  const res = ZscoreService.analyzeMeasurement({
    tanggalLahir: '2022-01-01',
    tanggalUkur: '2025-01-01',
    jenisKelamin: 'P',
    beratBadan: 21.0,
    tinggiBadan: 95.0,
    caraUkur: 'berdiri'
  });

  console.log(`   Hasil: BB/TB=${res.zscoreBBTB} (${res.kategoriBBTB}), Final=${res.statusFinal}`);
  assert.ok(res.zscoreBBTB > 3.0, `Z-Score BB/TB harus > +3, didapat ${res.zscoreBBTB}`);
  assert.strictEqual(res.kategoriBBTB, 'Obesitas');
  assert.strictEqual(res.statusFinal, 'Obesitas');
  assert.strictEqual(res.perluPerhatian, true);
});

console.log('\n----------------------------------------------------');
console.log(`HASIL TEST: ${passed} Passed, ${failed} Failed`);
console.log('----------------------------------------------------');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('SEMUA KASUS UJI Z-SCORE WHO DAN PERMENKES BERHASIL 100%!\n');
}

