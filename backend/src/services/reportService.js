const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ReportService {
  /**
   * Helper format tanggal Indonesia
   */
  static formatTanggalIndo(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  // ==========================================
  // EXCEL GENERATION
  // ==========================================

  static async generateExcel({ type, title, headers, rows, puskesmasInfo, filterInfo }) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title.slice(0, 30));

    // Header Puskesmas
    sheet.mergeCells('A1:L1');
    sheet.getCell('A1').value = (puskesmasInfo?.nama || 'PUSKESMAS KEBUN KOPI').toUpperCase();
    sheet.getCell('A1').font = { size: 14, bold: true, color: { argb: '00AD9A' } };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    sheet.mergeCells('A2:L2');
    sheet.getCell('A2').value = `Sistem Informasi Pemantauan & Perencanaan Gizi Balita (Gizita) - ${puskesmasInfo?.alamat || 'Kota Jambi'}`;
    sheet.getCell('A2').font = { size: 10, italic: true };
    sheet.getCell('A2').alignment = { horizontal: 'center' };

    sheet.mergeCells('A3:L3');
    sheet.getCell('A3').value = title.toUpperCase();
    sheet.getCell('A3').font = { size: 12, bold: true };
    sheet.getCell('A3').alignment = { horizontal: 'center' };

    sheet.mergeCells('A4:L4');
    sheet.getCell('A4').value = `Periode / Filter: ${filterInfo || 'Semua Data'} | Dicetak: ${this.formatTanggalIndo(new Date())}`;
    sheet.getCell('A4').font = { size: 9, color: { argb: '555555' } };
    sheet.getCell('A4').alignment = { horizontal: 'center' };

    sheet.addRow([]); // Blank row at row 5

    // Table Header at row 6
    const headerRow = sheet.addRow(headers.map(h => h.label));
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '00AD9A' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Data rows
    rows.forEach((row, idx) => {
      const dataValues = headers.map(h => {
        if (h.key === '_no') return idx + 1;
        return row[h.key] ?? '-';
      });

      const excelRow = sheet.addRow(dataValues);
      excelRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
        // Status color highlights if column is status
        if (headers[colNumber - 1]?.isStatus) {
          cell.font = { bold: true };
        }
      });
    });

    // Set column widths
    headers.forEach((h, i) => {
      sheet.getColumn(i + 1).width = h.width || 18;
    });

    return await workbook.xlsx.writeBuffer();
  }

  // ==========================================
  // PDF GENERATION
  // ==========================================

  static generatePdf({ title, headers, rows, puskesmasInfo, filterInfo }, res) {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 30
    });

    doc.pipe(res);

    // Render Logo jika ada
    const logoCandidates = [
      path.join(__dirname, '../assets/logo.png'),
      path.join(__dirname, '../../uploads/logo.png'),
      path.join(process.cwd(), 'logo.png')
    ];
    for (const p of logoCandidates) {
      if (fs.existsSync(p)) {
        try {
          doc.image(p, 45, 20, { fit: [48, 48] });
          break;
        } catch (e) {}
      }
    }

    // Header KOP Puskesmas
    doc.fillColor('#00AD9A')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(puskesmasInfo?.nama || 'PUSKESMAS KEBUN KOPI', { align: 'center' });

    doc.fillColor('#475569')
      .fontSize(9)
      .font('Helvetica')
      .text(`Sistem Informasi Pemantauan & Perencanaan Gizi Balita (Gizita)`, { align: 'center' })
      .text(`${puskesmasInfo?.alamat || 'Jl. Kebun Kopi No. 45, Kota Jambi'} | Telp: ${puskesmasInfo?.telepon || '0741-654321'}`, { align: 'center' });

    doc.moveTo(30, 75).lineTo(812, 75).lineWidth(1.5).strokeColor('#00AD9A').stroke();
    doc.moveTo(30, 77).lineTo(812, 77).lineWidth(0.5).strokeColor('#00AD9A').stroke();

    doc.moveDown(1);
    doc.fillColor('#0F172A')
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(title.toUpperCase(), 30, 88, { align: 'center' });

    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#64748B')
      .text(`Filter / Posyandu: ${filterInfo || 'Semua Data'}   |   Tanggal Cetak: ${this.formatTanggalIndo(new Date())}`, { align: 'center' });

    doc.moveDown(1);

    // Render Table
    let currentY = 120;
    const pageWidth = 782; // 842 - 60
    const colWidth = pageWidth / headers.length;

    // Header Table
    doc.rect(30, currentY, pageWidth, 20).fill('#00AD9A');
    doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');

    headers.forEach((h, i) => {
      doc.text(h.label, 32 + (i * colWidth), currentY + 6, {
        width: colWidth - 4,
        align: 'center'
      });
    });

    currentY += 20;

    // Data Rows
    rows.forEach((row, index) => {
      if (currentY > 520) {
        doc.addPage({ size: 'A4', layout: 'landscape', margin: 30 });
        currentY = 40;
        // Repeat Header
        doc.rect(30, currentY, pageWidth, 20).fill('#0D9488');
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
        headers.forEach((h, i) => {
          doc.text(h.label, 32 + (i * colWidth), currentY + 6, {
            width: colWidth - 4,
            align: 'center'
          });
        });
        currentY += 20;
      }

      // Alternate background
      if (index % 2 === 1) {
        doc.rect(30, currentY, pageWidth, 18).fill('#F8FAFC');
      }

      doc.fillColor('#1E293B').fontSize(7.5).font('Helvetica');

      headers.forEach((h, i) => {
        let val = h.key === '_no' ? String(index + 1) : String(row[h.key] ?? '-');
        if (val.length > 28) val = val.substring(0, 25) + '...';

        doc.text(val, 32 + (i * colWidth), currentY + 5, {
          width: colWidth - 4,
          align: h.align || 'center'
        });
      });

      // Bottom border
      doc.moveTo(30, currentY + 18).lineTo(30 + pageWidth, currentY + 18).lineWidth(0.5).strokeColor('#E2E8F0').stroke();
      currentY += 18;
    });

    // Signature Area
    if (currentY > 440) {
      doc.addPage({ size: 'A4', layout: 'landscape', margin: 30 });
      currentY = 40;
    }

    currentY += 20;
    const signX = 600;
    doc.fillColor('#0F172A').fontSize(8).font('Helvetica');
    doc.text(`Kota Jambi, ${this.formatTanggalIndo(new Date())}`, signX, currentY);
    doc.text(`Petugas Gizi / Penanggung Jawab,`, signX, currentY + 12);
    doc.moveDown(4);
    doc.font('Helvetica-Bold').text(`( ${puskesmasInfo?.kepala || 'dr. Hj. Siti Rahma, M.Kes'} )`, signX, currentY + 60);
    doc.font('Helvetica').text(`NIP. 19780512 200501 2 008`, signX, currentY + 72);

    doc.end();
  }
}

module.exports = ReportService;

