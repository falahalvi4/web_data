import React, { useState } from 'react';
import { PengeluaranOperasional } from '../types';
import { formatRupiah, formatDate, exportExpensesToExcel, exportToPdf } from '../utils/exportUtils';
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

interface PengeluaranTabProps {
  data: PengeluaranOperasional[];
  onAddExpense: (newExpense: Omit<PengeluaranOperasional, 'id'>) => Promise<void>;
  onDeleteExpense: (id: string) => void;
  isGoogleConnected: boolean;
  onSyncGoogleSheets: () => void;
}

export default function PengeluaranTab({
  data,
  onAddExpense,
  onDeleteExpense,
  isGoogleConnected,
  onSyncGoogleSheets
}: PengeluaranTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState('Gaji');
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState<number>(0);
  const [metodePembayaran, setMetodePembayaran] = useState('Kas Kecil');
  const [penanggungJawab, setPenanggungJawab] = useState('');

  const filteredData = data.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      (item.kategori?.toLowerCase() || '').includes(search) ||
      (item.keterangan?.toLowerCase() || '').includes(search) ||
      (item.penanggungJawab?.toLowerCase() || '').includes(search)
    );
  });

  const handleOpenAddModal = () => {
    setKeterangan('');
    setJumlah(0);
    setPenanggungJawab('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan || jumlah <= 0 || !penanggungJawab) {
      alert('Mohon lengkapi seluruh field dengan data yang valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddExpense({
        tanggal,
        kategori,
        keterangan,
        jumlah,
        metodePembayaran,
        penanggungJawab
      });
      setShowAddModal(false);
    } catch (e: any) {
      alert(`Terjadi kesalahan saat menambahkan pengeluaran operasional: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = () => {
    exportExpensesToExcel(filteredData);
  };

  const handleExportPdf = () => {
    const title = 'Laporan Detail Pengeluaran Operasional';
    const headers = ['Tanggal', 'Kategori', 'Keterangan', 'Jumlah', 'Metode Pembayaran', 'Penanggung Jawab'];
    const rows = filteredData.map((e) => [
      e.tanggal,
      e.kategori,
      e.keterangan,
      formatRupiah(e.jumlah),
      e.metodePembayaran,
      e.penanggungJawab
    ]);

    const totalCost = filteredData.reduce((sum, item) => sum + item.jumlah, 0);
    const summary = [
      { label: 'Total Operasional:', value: formatRupiah(totalCost) },
      { label: 'Banyak Pos Pengeluaran:', value: `${filteredData.length} Transaksi` }
    ];

    exportToPdf(title, headers, rows, 'Laporan_Pengeluaran_Operasional', summary);
  };

  return (
    <div id="pengeluaran-tab-root" className="space-y-6">
      {/* Search and control actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 border border-slate-200 rounded-none gap-4 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Cari kategori, keterangan, penanggung jawab..."
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
            TAMBAH PENGELUARAN
          </button>
        </div>
      </div>

      {/* Expense Data Table */}
      <div className="bg-white rounded-none border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Keterangan / Detil</th>
                <th className="px-6 py-4 text-right">Jumlah Pengeluaran</th>
                <th className="px-6 py-4">Metode Pembayaran</th>
                <th className="px-6 py-4">Penanggung Jawab</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-mono uppercase tracking-wider">
                    Data pengeluaran operasional tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold uppercase tracking-wide whitespace-nowrap">{formatDate(item.tanggal)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-none text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-widest">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold max-w-[250px] truncate" title={item.keterangan}>{item.keterangan}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-red-600">{formatRupiah(item.jumlah)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{item.metodePembayaran}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500">{item.penanggungJawab}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus pos pengeluaran "${item.keterangan}"?`)) {
                            onDeleteExpense(item.id);
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

        {/* Footer overview */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-4">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            MENAMPILKAN <span className="font-black text-slate-900">{filteredData.length}</span> DARI <span className="font-black text-slate-900">{data.length}</span> POS BIAYA.
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 uppercase tracking-widest font-black text-[10px]">Total Pengeluaran:</span>
            <span className="text-sm font-black text-red-600 font-mono">
              {formatRupiah(filteredData.reduce((sum, item) => sum + item.jumlah, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Add expense modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="add-expense-modal" role="dialog" aria-modal="true">
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
                    Tambah Transaksi Pengeluaran
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
                        <strong className="font-bold">Info:</strong> Pengeluaran baru akan langsung otomatis dikirim ke Google Sheets Anda secara real-time.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exp-tanggal" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Tanggal</label>
                      <input
                        type="date"
                        id="exp-tanggal"
                        required
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="exp-kategori" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Kategori</label>
                      <select
                        id="exp-kategori"
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      >
                        <option value="Gaji">Gaji / Insentif</option>
                        <option value="Sewa">Sewa Tempat / Gudang</option>
                        <option value="Utilitas">Utilitas (Listrik, Air, Internet)</option>
                        <option value="Transport">Transportasi & Logistik</option>
                        <option value="Pemasaran">Pemasaran & Iklan</option>
                        <option value="Operasional Kantor">Operasional Kantor / ATK</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="exp-keterangan" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Keterangan / Detil Pengeluaran</label>
                    <input
                      type="text"
                      id="exp-keterangan"
                      required
                      placeholder="Contoh: Pembayaran listrik bulanan, Biaya bensin truk..."
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exp-jumlah" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Jumlah Biaya (IDR)</label>
                      <input
                        type="number"
                        id="exp-jumlah"
                        required
                        min="1"
                        placeholder="Contoh: 150000"
                        value={jumlah || ''}
                        onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="exp-metode" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Metode Pembayaran</label>
                      <select
                        id="exp-metode"
                        value={metodePembayaran}
                        onChange={(e) => setMetodePembayaran(e.target.value)}
                        className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                      >
                        <option value="Kas Kecil">Kas Kecil (Petty Cash)</option>
                        <option value="Transfer Bank">Transfer Bank</option>
                        <option value="Cash">Cash</option>
                        <option value="Kartu Kredit">Kartu Kredit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="exp-pj" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Penanggung Jawab (PJ)</label>
                    <input
                      type="text"
                      id="exp-pj"
                      required
                      placeholder="Contoh: Ibu Diana, Pak Rudi..."
                      value={penanggungJawab}
                      onChange={(e) => setPenanggungJawab(e.target.value)}
                      className="mt-1 block w-full rounded-none border border-slate-200 bg-slate-50 px-3 py-2 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
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
