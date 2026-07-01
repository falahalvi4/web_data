import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Penjualan, PembelianStock, PengeluaranOperasional } from '../types';

/**
 * Format date for display
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
};

/**
 * Format currency to IDR
 */
export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Export data to Excel
 */
export function exportSalesToExcel(data: Penjualan[]) {
  const formatted = data.map((item) => ({
    'Tanggal': item.tanggal,
    'No Faktur': item.noFaktur,
    'Nama Pelanggan': item.namaPelanggan,
    'Produk': item.produk,
    'Jumlah': item.jumlah,
    'Harga Satuan (IDR)': item.hargaSatuan,
    'Total (IDR)': item.total,
    'Metode Pembayaran': item.metodePembayaran,
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Penjualan');
  XLSX.writeFile(wb, 'Laporan_Penjualan_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

export function exportPurchasesToExcel(data: PembelianStock[]) {
  const formatted = data.map((item) => ({
    'Tanggal': item.tanggal,
    'No PO': item.noPO,
    'Supplier': item.supplier,
    'Nama Barang': item.namaBarang,
    'Jumlah': item.jumlah,
    'Harga Beli (IDR)': item.hargaBeli,
    'Total (IDR)': item.total,
    'Status': item.status,
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pembelian_Stok');
  XLSX.writeFile(wb, 'Laporan_Pembelian_Stok_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

export function exportExpensesToExcel(data: PengeluaranOperasional[]) {
  const formatted = data.map((item) => ({
    'Tanggal': item.tanggal,
    'Kategori': item.kategori,
    'Keterangan': item.keterangan,
    'Jumlah (IDR)': item.jumlah,
    'Metode Pembayaran': item.metodePembayaran,
    'Penanggung Jawab': item.penanggungJawab,
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pengeluaran_Operasional');
  XLSX.writeFile(wb, 'Laporan_Pengeluaran_Operasional_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

/**
 * Export overall dashboard / summary reports to Excel
 */
export function exportConsolidatedToExcel(
  sales: Penjualan[],
  purchases: PembelianStock[],
  expenses: PengeluaranOperasional[]
) {
  const wb = XLSX.utils.book_new();

  // Tab 1: Ringkasan / Summary
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.jumlah, 0);
  const netProfit = totalSales - totalPurchases - totalExpenses;

  const summaryData = [
    { 'Parameter Keuangan': 'Total Penjualan (Pendapatan)', 'Nilai (IDR)': totalSales },
    { 'Parameter Keuangan': 'Total Pembelian Stock (HPP)', 'Nilai (IDR)': totalPurchases },
    { 'Parameter Keuangan': 'Total Pengeluaran Operasional', 'Nilai (IDR)': totalExpenses },
    { 'Parameter Keuangan': 'Keuntungan Bersih (Net Profit)', 'Nilai (IDR)': netProfit },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  // Tab 2: Penjualan Detailed
  const wsSales = XLSX.utils.json_to_sheet(sales.map(s => ({
    'Tanggal': s.tanggal,
    'No Faktur': s.noFaktur,
    'Nama Pelanggan': s.namaPelanggan,
    'Produk': s.produk,
    'Jumlah': s.jumlah,
    'Harga Satuan': s.hargaSatuan,
    'Total': s.total,
    'Metode Pembayaran': s.metodePembayaran
  })));
  XLSX.utils.book_append_sheet(wb, wsSales, 'Detail Penjualan');

  // Tab 3: Pembelian Detailed
  const wsPurchases = XLSX.utils.json_to_sheet(purchases.map(p => ({
    'Tanggal': p.tanggal,
    'No PO': p.noPO,
    'Supplier': p.supplier,
    'Nama Barang': p.namaBarang,
    'Jumlah': p.jumlah,
    'Harga Beli': p.hargaBeli,
    'Total': p.total,
    'Status': p.status
  })));
  XLSX.utils.book_append_sheet(wb, wsPurchases, 'Detail Pembelian');

  // Tab 4: Pengeluaran Detailed
  const wsExpenses = XLSX.utils.json_to_sheet(expenses.map(e => ({
    'Tanggal': e.tanggal,
    'Kategori': e.kategori,
    'Keterangan': e.keterangan,
    'Jumlah': e.jumlah,
    'Metode Pembayaran': e.metodePembayaran,
    'Penanggung Jawab': e.penanggungJawab
  })));
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Detail Pengeluaran');

  XLSX.writeFile(wb, 'Laporan_Konsolidasi_Perusahaan_' + new Date().toISOString().split('T')[0] + '.xlsx');
}

/**
 * Export to PDF
 */
export function exportToPdf(
  title: string,
  headers: string[],
  rows: any[][],
  fileName: string,
  summaryNotes?: { label: string; value: string }[]
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BERTUMBUH BERSAMA - SISTEM PENDATAAN', 14, 18);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Dashboard Prototype & Sinkronisasi Google Sheets', 14, 25);
  doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 32);

  // Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title.toUpperCase(), 14, 52);

  // Summary widgets
  if (summaryNotes && summaryNotes.length > 0) {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, 58, 182, 18, 'F');
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    
    let xOffset = 18;
    summaryNotes.forEach((note) => {
      doc.text(note.label, xOffset, 65);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(note.value, xOffset, 71);
      doc.setTextColor(71, 85, 105);
      xOffset += 55;
    });
  }

  // Draw Table
  const startY = summaryNotes && summaryNotes.length > 0 ? 84 : 60;
  
  autoTable(doc, {
    startY: startY,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 22 }, // Tanggal
    },
    didDrawPage: (data) => {
      // Footer
      const str = 'Halaman ' + data.pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(str, 180, 285);
      doc.text('Dokumen ini digenerate secara otomatis oleh Sistem Pendataaan Bertumbuh Bersama.', 14, 285);
    }
  });

  doc.save(`${fileName}.pdf`);
}
