import React, { useState } from 'react';
import { Penjualan } from '../types';
import { formatRupiah, formatDate, exportSalesToExcel, exportToPdf } from '../utils/exportUtils';
import { 
  Plus, 
  Search, 
  Download, 
  FileSpreadsheet, 
  RefreshCw, 
  Trash2, 
  X,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

interface PenjualanTabProps {
  data: Penjualan[];
  onAddSale: (newSale: Omit<Penjualan, 'id' | 'total'>) => Promise<void>;
  onDeleteSale: (id: string) => void;
  isGoogleConnected: boolean;
  onSyncGoogleSheets: () => void;
}

export default function PenjualanTab({
  data,
  onAddSale,
  onDeleteSale,
  isGoogleConnected,
  onSyncGoogleSheets
}: PenjualanTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [noFaktur, setNoFaktur] = useState(`INV-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`);
  const [namaPelanggan, setNamaPelanggan] = useState('');
  const [produk, setProduk] = useState('');
  const [jumlah, setJumlah] = useState<number>(1);
  const [hargaSatuan, setHargaSatuan] = useState<number>(0);
  const [metodePembayaran, setMetodePembayaran] = useState('Transfer Bank');

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      (item.noFaktur?.toLowerCase() || '').includes(search) ||
      (item.namaPelanggan?.toLowerCase() || '').includes(search) ||
      (item.produk?.toLowerCase() || '').includes(search)
    );
  });

  const handleOpenAddModal = () => {
    setNoFaktur(`INV-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, '0')}`);
    setNamaPelanggan('');
    setProduk('');
    setJumlah(1);
    setHargaSatuan(0);
    setTanggal(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPelanggan || !produk || jumlah <= 0 || hargaSatuan <= 0) {
      alert('Mohon lengkapi seluruh field dengan data yang valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddSale({
        tanggal,
        noFaktur,
        namaPelanggan,
        produk,
        jumlah,
        hargaSatuan,
        metodePembayaran
      });
      setShowAddModal(false);
    } catch (e: any) {
      alert(`Terjadi kesalahan saat menambahkan penjualan: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    exportSalesToExcel(filteredData);
  };

  const handleExportPdf = () => {
    const title = 'Laporan Detail Penjualan';
    const headers = ['Tanggal', 'No Faktur', 'Nama Pelanggan', 'Produk', 'Jumlah', 'Harga Satuan', 'Total', 'Pembayaran'];
    const rows = filteredData.map((s) => [
      s.tanggal,
      s.noFaktur,
      s.namaPelanggan,
      s.produk,
      s.jumlah.toString(),
      formatRupiah(s.hargaSatuan),
      formatRupiah(s.total),
      s.metodePembayaran
    ]);

    const totalRevenue = filteredData.reduce((sum, item) => sum + item.total, 0);
    const summary = [
      { label: 'Total Penjualan:', value: formatRupiah(totalRevenue) },
      { label: 'Jumlah Transaksi:', value: `${filteredData.length} Faktur` }
    ];

    exportToPdf(title, headers, rows, 'Laporan_Penjualan', summary);
  };

  return (
    <div id="penjualan-tab-root" className="space-y-6">
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 border border-slate-200 rounded-none gap-4 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Cari faktur, pelanggan, produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-none border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isGoogleConnected && (
            <button
              onClick={onSyncGoogleSheets}
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 rounded-none shadow-sm transition-colors cursor-pointer"
              title="Tarik Data Terkini dari Google Sheets"
            >
              <RefreshCw size={12} className="mr-1.5" />
              SINKRONISASI SHEETS
            </button>
          )}

          <button
            onClick={handleExportPdf}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-none shadow-sm transition-colors cursor-pointer"
          >
            <Download size={12} className="mr-1.5" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 hover:bg-green-100 rounded-none shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet size={12} className="mr-1.5" />
            EXCEL
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-blue-600 text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-none shadow shadow-blue-100 transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus size={14} className="mr-1.5" />
            TAMBAH PENJUALAN
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">No Faktur</th>
                <th className="px-6 py-4">Nama Pelanggan</th>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4 text-center">Jumlah</th>
                <th className="px-6 py-4 text-right">Harga Satuan</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4">Pembayaran</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-mono uppercase tracking-wider">
                    Data penjualan tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold uppercase tracking-wide whitespace-nowrap">{formatDate(item.tanggal)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{item.noFaktur}</td>
                    <td className="px-6 py-4 font-semibold max-w-[150px] truncate" title={item.namaPelanggan}>{item.namaPelanggan}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-500" title={item.produk}>{item.produk}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{item.jumlah}</td>
                    <td className="px-6 py-4 text-right font-mono">{formatRupiah(item.hargaSatuan)}</td>
                    <td className="px-6 py-4 text-right font-mono font-black text-slate-900">{formatRupiah(item.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-widest border ${
                        item.metodePembayaran === 'Cash' 
                          ? 'bg-blue-50 text-blue-700 border-blue-100' 
                          : item.metodePembayaran === 'Transfer Bank'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {item.metodePembayaran}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus transaksi penjualan ${item.noFaktur}?`)) {
                            onDeleteSale(item.id);
                          }
                        }}
                        className="p-1.5 rounded-none text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table summary stats footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-4">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            MENAMPILKAN <span className="font-black text-slate-900">{filteredData.length}</span> DARI <span className="font-black text-slate-900">{data.length}</span> BARIS PENJUALAN.
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 uppercase tracking-widest font-black text-[10px]">Omset Terfilter:</span>
            <span className="text-sm font-black text-blue-600 font-mono">
              {formatRupiah(filteredData.reduce((sum, item) => sum + item.total, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Add Sale Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="add-modal" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAddModal(false)} />

            {/* Trick for alignment */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-none text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-200">
              <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-950 flex items-center">
                    <PlusCircle size={18} className="text-blue-500 mr-2" />
                    Tambah Transaksi Penjualan
                  </h3>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
                  {isGoogleConnected && (
                    <div className="p-4 bg-blue-50 border border-blue-200 text-[10px] text-blue-800 flex items-start space-x-1.5 leading-relaxed uppercase tracking-wider font-semibold">
                      <AlertCircle size={14} className="shrink-0 text-blue-500 mt-0.5" />
                      <span>
                        <strong className="font-bold">Info:</strong> Transaksi baru akan langsung otomatis dikirim ke Google Sheets Anda secara real-time.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sale-tanggal" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tanggal</label>
                      <input
                        type="date"
                        id="sale-tanggal"
                        required
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="sale-faktur" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">No Faktur</label>
                      <input
                        type="text"
                        id="sale-faktur"
                        required
                        value={noFaktur}
                        onChange={(e) => setNoFaktur(e.target.value)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sale-pelanggan" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Nama Pelanggan</label>
                    <input
                      type="text"
                      id="sale-pelanggan"
                      required
                      placeholder="Masukkan nama pelanggan"
                      value={namaPelanggan}
                      onChange={(e) => setNamaPelanggan(e.target.value)}
                      className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="sale-produk" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Produk</label>
                    <input
                      type="text"
                      id="sale-produk"
                      required
                      placeholder="Contoh: Semen Portland, Besi Beton..."
                      value={produk}
                      onChange={(e) => setProduk(e.target.value)}
                      className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="sale-jumlah" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Jumlah (Pcs/Box)</label>
                      <input
                        type="number"
                        id="sale-jumlah"
                        required
                        min="1"
                        value={jumlah}
                        onChange={(e) => setJumlah(parseInt(e.target.value) || 1)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="sale-harga" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Harga Satuan (IDR)</label>
                      <input
                        type="number"
                        id="sale-harga"
                        required
                        min="0"
                        placeholder="Contoh: 65000"
                        value={hargaSatuan || ''}
                        onChange={(e) => setHargaSatuan(parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <label htmlFor="sale-metode" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Metode Pembayaran</label>
                      <select
                        id="sale-metode"
                        value={metodePembayaran}
                        onChange={(e) => setMetodePembayaran(e.target.value)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      >
                        <option value="Transfer Bank">Transfer Bank</option>
                        <option value="Cash">Cash</option>
                        <option value="E-Wallet">E-Wallet</option>
                      </select>
                    </div>
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-none text-right mt-3 sm:mt-0">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimasi Total:</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{formatRupiah(jumlah * hargaSatuan)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-50 rounded-none transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 border border-blue-600 text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-none shadow transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN TRANSAKSI'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
