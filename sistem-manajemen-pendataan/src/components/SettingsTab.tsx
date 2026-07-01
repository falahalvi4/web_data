import React, { useState } from 'react';
import { SpreadsheetConfig } from '../types';
import { 
  Database, 
  Link, 
  Unlink, 
  FileSpreadsheet, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsTabProps {
  config: SpreadsheetConfig;
  onConfigChange: (newConfig: SpreadsheetConfig) => void;
  user: User | null;
  isConnecting: boolean;
  onConnectGoogle: () => Promise<void>;
  onDisconnectGoogle: () => Promise<void>;
  onInitializeAllSheets: () => Promise<void>;
  onPushMockDataToSheets: () => Promise<void>;
}

export default function SettingsTab({
  config,
  onConfigChange,
  user,
  isConnecting,
  onConnectGoogle,
  onDisconnectGoogle,
  onInitializeAllSheets,
  onPushMockDataToSheets
}: SettingsTabProps) {
  const [penjualanId, setPenjualanId] = useState(config.penjualanId);
  const [penjualanSheet, setPenjualanSheet] = useState(config.penjualanSheet);
  const [pembelianId, setPembelianId] = useState(config.pembelianId);
  const [pembelianSheet, setPembelianSheet] = useState(config.pembelianSheet);
  const [pengeluaranId, setPengeluaranId] = useState(config.pengeluaranId);
  const [pengeluaranSheet, setPengeluaranSheet] = useState(config.pengeluaranSheet);
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange({
      penjualanId,
      penjualanSheet,
      pembelianId,
      pembelianSheet,
      pengeluaranId,
      pengeluaranSheet
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleInitHeaders = async () => {
    if (!user) {
      alert('Mohon hubungkan akun Google Sheets Anda terlebih dahulu.');
      return;
    }
    const confirmInit = window.confirm(
      'Apakah Anda ingin menginisialisasi header kolom pada 3 spreadsheet Google Sheets ini? Jika lembar kerja kosong, header kolom akan ditulis secara otomatis.'
    );
    if (!confirmInit) return;

    setIsInitializing(true);
    try {
      await onInitializeAllSheets();
      alert('Selesai! Header kolom berhasil diinisialisasi pada lembar kerja Anda.');
    } catch (e: any) {
      alert(`Gagal menginisialisasi header: ${e.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const handlePushMockData = async () => {
    if (!user) {
      alert('Mohon hubungkan akun Google Sheets Anda terlebih dahulu.');
      return;
    }
    const confirmPush = window.confirm(
      'Apakah Anda ingin mengekspor seluruh data demo awal (penjualan, pembelian stok, dan pengeluaran operasional) ke dalam Google Sheets Anda secara massal?'
    );
    if (!confirmPush) return;

    setIsPushing(true);
    try {
      await onPushMockDataToSheets();
      alert('Selesai! Seluruh data demo berhasil disinkronisasikan ke dokumen Google Sheets Anda.');
    } catch (e: any) {
      alert(`Gagal menyinkronkan data demo: ${e.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div id="settings-tab-root" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1: Google Account connection status */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-white p-6 border border-slate-200 rounded-none space-y-4 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center border-b border-slate-100 pb-2">
            <Link size={14} className="text-blue-600 mr-2" />
            Integrasi Akun Google
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Untuk mengaktifkan sinkronisasi data real-time, Anda harus mengotorisasi aplikasi ini dengan akun Google Sheets Anda. Kredensial disimpan secara aman.
          </p>

          <div className="pt-2">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-none">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-9 h-9 rounded-none border border-slate-300" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-9 h-9 rounded-none bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200 uppercase">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <span className="block text-xs font-bold text-slate-950 truncate uppercase tracking-tight">{user.displayName || 'Pengguna Terhubung'}</span>
                    <span className="block text-[9px] text-slate-400 font-mono truncate">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={onDisconnectGoogle}
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-slate-200 text-xs font-bold uppercase tracking-wider text-red-600 bg-white hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                >
                  <Unlink size={14} className="mr-1.5" />
                  Putuskan Google Sheets
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-none text-[10px] font-bold uppercase tracking-wide text-slate-400 leading-relaxed text-center">
                  Belum ada akun Google terintegrasi. Hubungkan akun sekarang untuk sinkronisasi otomatis.
                </div>

                <button
                  onClick={onConnectGoogle}
                  disabled={isConnecting}
                  className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-blue-600 rounded-none text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow"
                >
                  {isConnecting ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      MENGHUBUNGKAN...
                    </span>
                  ) : (
                    <>
                      <Link size={14} className="mr-1.5" />
                      HUBUNGKAN GOOGLE SHEETS
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sync Tools panel */}
        {user && (
          <div className="bg-white p-6 border border-slate-200 rounded-none space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center border-b border-slate-100 pb-2">
              <Sparkles size={14} className="text-blue-600 mr-2" />
              Alat Sinkronisasi Otomatis
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Konfigurasikan dokumen spreadsheets Anda agar langsung siap digunakan dengan sistem pendataan.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleInitHeaders}
                disabled={isInitializing}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 rounded-none shadow-sm transition-all cursor-pointer"
              >
                {isInitializing ? 'Memproses...' : '1. Inisialisasi Header Kolom'}
              </button>

              <button
                onClick={handlePushMockData}
                disabled={isPushing}
                className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-blue-200 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-none shadow-sm transition-all cursor-pointer"
              >
                {isPushing ? 'Mentransfer...' : '2. Sinkronkan Seluruh Data Demo'}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 leading-relaxed text-center uppercase tracking-wider font-semibold">
              *Aman, tidak akan menimpa data yang telah Anda miliki.
            </p>
          </div>
        )}
      </div>

      {/* Col 2 & 3: Configuration details */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSaveConfig} className="bg-white p-6 border border-slate-200 rounded-none space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center">
                <Database size={14} className="text-blue-600 mr-2" />
                Konfigurasi ID Google Sheets & Nama Tab
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Petakan spreadsheet penjualan, pembelian, dan pengeluaran.</p>
            </div>
            
            {isSaved && (
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-none">
                Konfigurasi Tersimpan!
              </span>
            )}
          </div>

          <div className="space-y-5">
            {/* 1. Penjualan Config */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-none">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center">
                  <FileSpreadsheet size={14} className="text-green-600 mr-1.5" />
                  1. Spreadsheet Penjualan (Sales)
                </span>
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${penjualanId}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center text-[10px] text-blue-600 hover:underline uppercase tracking-wider font-bold"
                >
                  Buka Link <ExternalLink size={10} className="ml-1" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Spreadsheet ID</label>
                  <input
                    type="text"
                    value={penjualanId}
                    onChange={(e) => setPenjualanId(e.target.value)}
                    className="mt-1 block w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nama Tab (Sheet)</label>
                  <input
                    type="text"
                    value={penjualanSheet}
                    onChange={(e) => setPenjualanSheet(e.target.value)}
                    className="mt-1 block w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Pembelian Config */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-none">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center">
                  <FileSpreadsheet size={14} className="text-orange-600 mr-1.5" />
                  2. Spreadsheet Pembelian Stok (Purchases)
                </span>
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${pembelianId}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center text-[10px] text-blue-600 hover:underline uppercase tracking-wider font-bold"
                >
                  Buka Link <ExternalLink size={10} className="ml-1" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Spreadsheet ID</label>
                  <input
                    type="text"
                    value={pembelianId}
                    onChange={(e) => setPembelianId(e.target.value)}
                    className="mt-1 block w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nama Tab (Sheet)</label>
                  <input
                    type="text"
                    value={pembelianSheet}
                    onChange={(e) => setPembelianSheet(e.target.value)}
                    className="mt-1 block w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pengeluaran Config */}
            <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-none">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 flex items-center">
                  <FileSpreadsheet size={14} className="text-red-500 mr-1.5" />
                  3. Spreadsheet Pengeluaran Operasional (Expenses)
                </span>
                <a 
                  href={`https://docs.google.com/spreadsheets/d/${pengeluaranId}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center text-[10px] text-blue-600 hover:underline uppercase tracking-wider font-bold"
                >
                  Buka Link <ExternalLink size={10} className="ml-1" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Spreadsheet ID</label>
                  <input
                    type="text"
                    value={pengeluaranId}
                    onChange={(e) => setPengeluaranId(e.target.value)}
                    className="mt-1 block w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nama Tab (Sheet)</label>
                  <input
                    type="text"
                    value={pengeluaranSheet}
                    onChange={(e) => setPengeluaranSheet(e.target.value)}
                    className="mt-1 block w-full rounded-none border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 border border-blue-600 text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-none shadow transition-all cursor-pointer"
            >
              Simpan Konfigurasi ID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
