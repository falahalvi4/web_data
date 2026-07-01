export interface Penjualan {
  id: string;
  tanggal: string;
  noFaktur: string;
  namaPelanggan: string;
  produk: string;
  jumlah: number;
  hargaSatuan: number;
  total: number;
  metodePembayaran: string;
}

export interface PembelianStock {
  id: string;
  tanggal: string;
  noPO: string;
  supplier: string;
  namaBarang: string;
  jumlah: number;
  hargaBeli: number;
  total: number;
  status: string;
}

export interface PengeluaranOperasional {
  id: string;
  tanggal: string;
  kategori: string;
  keterangan: string;
  jumlah: number;
  metodePembayaran: string;
  penanggungJawab: string;
}

export interface SpreadsheetConfig {
  penjualanId: string;
  penjualanSheet: string;
  pembelianId: string;
  pembelianSheet: string;
  pengeluaranId: string;
  pengeluaranSheet: string;
}
