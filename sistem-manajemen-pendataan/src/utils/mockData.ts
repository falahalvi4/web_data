import { Penjualan, PembelianStock, PengeluaranOperasional } from '../types';

export const COLUMNS_PENJUALAN = [
  'Tanggal',
  'No Faktur',
  'Nama Pelanggan',
  'Produk',
  'Jumlah',
  'Harga Satuan',
  'Total',
  'Metode Pembayaran'
];

export const COLUMNS_PEMBELIAN = [
  'Tanggal',
  'No PO',
  'Supplier',
  'Nama Barang',
  'Jumlah',
  'Harga Beli',
  'Total',
  'Status'
];

export const COLUMNS_PENGELUARAN = [
  'Tanggal',
  'Kategori',
  'Keterangan',
  'Jumlah',
  'Metode Pembayaran',
  'Penanggung Jawab'
];

export const INITIAL_PENJUALAN: Penjualan[] = [
  {
    id: 'sale-1',
    tanggal: '2026-06-15',
    noFaktur: 'INV-2026-001',
    namaPelanggan: 'PT Semesta Raya',
    produk: 'Semen Portland Premium (Sack)',
    jumlah: 150,
    hargaSatuan: 65000,
    total: 9750000,
    metodePembayaran: 'Transfer Bank'
  },
  {
    id: 'sale-2',
    tanggal: '2026-06-16',
    noFaktur: 'INV-2026-002',
    namaPelanggan: 'Bapak Hendra Wijaya',
    produk: 'Besi Beton 10mm',
    jumlah: 80,
    hargaSatuan: 85000,
    total: 6800000,
    metodePembayaran: 'Cash'
  },
  {
    id: 'sale-3',
    tanggal: '2026-06-18',
    noFaktur: 'INV-2026-003',
    namaPelanggan: 'CV Bangun Jaya',
    produk: 'Pasir Beton Premium (m3)',
    jumlah: 15,
    hargaSatuan: 280000,
    total: 4200000,
    metodePembayaran: 'Transfer Bank'
  },
  {
    id: 'sale-4',
    tanggal: '2026-06-20',
    noFaktur: 'INV-2026-004',
    namaPelanggan: 'Ibu Ratna Sari',
    produk: 'Cat Tembok Eksterior 20kg',
    jumlah: 10,
    hargaSatuan: 450000,
    total: 4500000,
    metodePembayaran: 'E-Wallet'
  },
  {
    id: 'sale-5',
    tanggal: '2026-06-22',
    noFaktur: 'INV-2026-005',
    namaPelanggan: 'Developer Alam Sutra',
    produk: 'Genteng Keramik Glazur',
    jumlah: 1200,
    hargaSatuan: 12000,
    total: 14400000,
    metodePembayaran: 'Transfer Bank'
  },
  {
    id: 'sale-6',
    tanggal: '2026-06-25',
    noFaktur: 'INV-2026-006',
    namaPelanggan: 'Toko Bangunan Berkah',
    produk: 'Baja Ringan C75',
    jumlah: 200,
    hargaSatuan: 95000,
    total: 19000000,
    metodePembayaran: 'Transfer Bank'
  },
  {
    id: 'sale-7',
    tanggal: '2026-06-28',
    noFaktur: 'INV-2026-007',
    namaPelanggan: 'Bapak Ahmad Faisal',
    produk: 'Keramik Lantai 60x60',
    jumlah: 50,
    hargaSatuan: 135000,
    total: 6750000,
    metodePembayaran: 'Cash'
  }
];

export const INITIAL_PEMBELIAN: PembelianStock[] = [
  {
    id: 'purch-1',
    tanggal: '2026-06-10',
    noPO: 'PO-2026-001',
    supplier: 'PT Indocement Tunggal',
    namaBarang: 'Semen Portland Premium (Sack)',
    jumlah: 500,
    hargaBeli: 52000,
    total: 26000000,
    status: 'Diterima'
  },
  {
    id: 'purch-2',
    tanggal: '2026-06-12',
    noPO: 'PO-2026-002',
    supplier: 'PT Krakatau Steel',
    namaBarang: 'Besi Beton 10mm',
    jumlah: 300,
    hargaBeli: 68000,
    total: 20400000,
    status: 'Diterima'
  },
  {
    id: 'purch-3',
    tanggal: '2026-06-15',
    noPO: 'PO-2026-003',
    supplier: 'Galian Pasir Merapi',
    namaBarang: 'Pasir Beton Premium (m3)',
    jumlah: 40,
    hargaBeli: 190000,
    total: 7600000,
    status: 'Diterima'
  },
  {
    id: 'purch-4',
    tanggal: '2026-06-22',
    noPO: 'PO-2026-004',
    supplier: 'Distributor Jotun Indo',
    namaBarang: 'Cat Tembok Eksterior 20kg',
    jumlah: 30,
    hargaBeli: 360000,
    total: 10800000,
    status: 'Diterima'
  },
  {
    id: 'purch-5',
    tanggal: '2026-06-26',
    noPO: 'PO-2026-005',
    supplier: 'PT Kanmuri Genteng',
    namaBarang: 'Genteng Keramik Glazur',
    jumlah: 2000,
    hargaBeli: 8500,
    total: 17000000,
    status: 'Pending'
  }
];

export const INITIAL_PENGELUARAN: PengeluaranOperasional[] = [
  {
    id: 'exp-1',
    tanggal: '2026-06-05',
    kategori: 'Gaji',
    keterangan: 'Gaji Bulanan Staf Toko & Gudang',
    jumlah: 12500000,
    metodePembayaran: 'Transfer Bank',
    penanggungJawab: 'Ibu Diana (HRD)'
  },
  {
    id: 'exp-2',
    tanggal: '2026-06-08',
    kategori: 'Sewa',
    keterangan: 'Sewa Gudang Penyimpanan Tambahan',
    jumlah: 3500000,
    metodePembayaran: 'Transfer Bank',
    penanggungJawab: 'Bapak Rudi (Operasional)'
  },
  {
    id: 'exp-3',
    tanggal: '2026-06-12',
    kategori: 'Utilitas',
    keterangan: 'Pembayaran Tagihan Listrik PLN & Air PDAM',
    jumlah: 1850000,
    metodePembayaran: 'Kas Kecil',
    penanggungJawab: 'Fitri (Kasir)'
  },
  {
    id: 'exp-4',
    tanggal: '2026-06-14',
    kategori: 'Transport',
    keterangan: 'Bahan Bakar Solar Truk Kirim Barang',
    jumlah: 950000,
    metodePembayaran: 'Kas Kecil',
    penanggungJawab: 'Bambang (Driver)'
  },
  {
    id: 'exp-5',
    tanggal: '2026-06-20',
    kategori: 'Pemasaran',
    keterangan: 'Cetak Brosur & Banner Promosi Toko Baru',
    jumlah: 1200000,
    metodePembayaran: 'Kas Kecil',
    penanggungJawab: 'Andi (Marketing)'
  },
  {
    id: 'exp-6',
    tanggal: '2026-06-24',
    kategori: 'Lain-lain',
    keterangan: 'Makan Siang Bersama & Rapat Bulanan Staf',
    jumlah: 650000,
    metodePembayaran: 'Cash',
    penanggungJawab: 'Bapak Rudi (Operasional)'
  }
];
