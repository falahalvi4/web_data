import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, BarChart2, RefreshCw, FileSpreadsheet, Download, AlertCircle, Info } from 'lucide-react';

interface LandingPageProps {
  onLoginSuccess: () => void;
}

export default function LandingPage({ onLoginSuccess }: LandingPageProps) {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate short network delay for realism
    setTimeout(() => {
      if (adminId === 'admin1' && password === 'bertumbuhbersama') {
        onLoginSuccess();
      } else {
        setError('ID Admin atau Password yang Anda masukkan salah.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center text-white shrink-0 font-bold text-lg italic">B</div>
            <div>
              <span className="font-black text-sm tracking-[0.2em] uppercase leading-tight text-slate-900 block">
                BERTUMBUH <span className="text-blue-600">BERSAMA</span>
              </span>
              <span className="block text-[8px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                Sistem Pendataan Terpadu
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 rounded-none shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Shield size={14} className="mr-2 text-blue-600" />
            Portal Admin
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
              {/* Left Column: Copy */}
              <div className="space-y-6 sm:space-y-8 lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase tracking-widest bg-blue-50 rounded-none">
                  <span className="flex h-1.5 w-1.5 bg-blue-500 animate-ping" />
                  <span>Prototype Pendataan V1.0 - Siap Sinkronisasi</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none uppercase">
                  Automasi Pendataan Bisnis,{' '}
                  <span className="text-blue-600">
                    Sinkron Sempurna
                  </span>{' '}
                  ke Google Sheets Anda.
                </h1>
                
                <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                  Solusi manajemen operasional terintegrasi untuk melacak penjualan, pembelian stok masuk, dan pengeluaran operasional secara real-time. Hubungkan spreadsheet Anda dan nikmati pelaporan instan PDF & Excel dalam satu dasbor cerdas.
                </p>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center justify-center px-6 py-3.5 border border-blue-600 text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-200 cursor-pointer rounded-none"
                  >
                    Mulai Sekarang
                    <ArrowRight size={14} className="ml-2 animate-bounce-horizontal" />
                  </button>
                  <a
                    href="#fitur-utama"
                    className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200 rounded-none"
                  >
                    Pelajari Fitur
                  </a>
                </div>

                {/* Spreadsheet Links Connected indicator */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="text-slate-600">Mendukung Format Basis Data:</span>
                  <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 border border-slate-200 rounded-none">
                    <FileSpreadsheet size={12} className="text-green-600" />
                    <span>Penjualan</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 border border-slate-200 rounded-none">
                    <FileSpreadsheet size={12} className="text-orange-600" />
                    <span>Pembelian Stok</span>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 border border-slate-200 rounded-none">
                    <FileSpreadsheet size={12} className="text-red-500" />
                    <span>Pengeluaran</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Demo Graphic Card */}
              <div className="mt-12 lg:mt-0 lg:col-span-5 relative">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="bg-white rounded-none border border-slate-200 shadow-xl p-6 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-slate-800" />
                      <span className="w-2.5 h-2.5 bg-slate-400" />
                      <span className="w-2.5 h-2.5 bg-slate-200" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">Live Preview Dasbor</span>
                  </div>

                  {/* Mock Chart representation */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Konsolidasi Kas Bulan Ini</span>
                      <span className="text-xl font-black text-slate-900 font-mono">Rp 65.400.000</span>
                    </div>
                    
                    <div className="h-28 flex items-end space-x-3 pt-4">
                      <div className="flex-1 bg-green-500/20 hover:bg-green-500 h-[80%] transition-all duration-300 relative group" />
                      <div className="flex-1 bg-orange-500/20 hover:bg-orange-500 h-[60%] transition-all duration-300 relative group" />
                      <div className="flex-1 bg-red-500/20 hover:bg-red-500 h-[40%] transition-all duration-300 relative group" />
                      <div className="flex-1 bg-blue-600/25 hover:bg-blue-600 h-[95%] transition-all duration-300 relative group" />
                    </div>

                    <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider pt-2 border-t border-slate-200">
                      <span>Penjualan</span>
                      <span>Pembelian Stok</span>
                      <span>Operasional</span>
                      <span>Net Profit</span>
                    </div>
                  </div>

                  {/* Connection card */}
                  <div className="bg-slate-50 rounded-none p-4 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-none bg-blue-50 flex items-center justify-center">
                        <RefreshCw size={14} className="text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div>
                        <span className="block text-xs font-bold uppercase tracking-wider text-slate-800">Google Sheets DB</span>
                        <span className="block text-[9px] text-slate-400 uppercase tracking-wide">Sinkronisasi Otomatis</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-none border border-blue-200 uppercase tracking-widest">
                      TERKAIT
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid Section */}
        <section id="fitur-utama" className="py-16 sm:py-24 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 border border-blue-200">
                Siklus Manajemen Efisien
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                Dirancang untuk Efisiensi & Automasi Operasional
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Penyelesaian perumusan masalah manajemen pendataan yang terintegrasi secara dinamis untuk memudahkan bisnis Anda bertumbuh bersama.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-50 hover:bg-slate-100/70 p-8 rounded-none border border-slate-200 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-none bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <RefreshCw size={22} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Sinkronisasi Real-Time</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Semua input data penjualan, pembelian, dan pengeluaran secara langsung disinkronkan ke dokumen Google Sheets Anda. Bebas duplikasi data.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-50 hover:bg-slate-100/70 p-8 rounded-none border border-slate-200 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-none bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <BarChart2 size={22} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Analitik Terpadu</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Menampilkan grafik tren aktivitas dan ringkasan finansial (omset, HPP, biaya operasional, dan keuntungan bersih) secara otomatis dan akurat.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-50 hover:bg-slate-100/70 p-8 rounded-none border border-slate-200 transition-all duration-300 space-y-4">
                <div className="w-12 h-12 rounded-none bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Download size={22} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Ekspor PDF & Excel</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Unduh laporan konsolidasi perusahaan dengan satu kali klik. Sempurna untuk kebutuhan rapat koordinasi dan pelaporan perpajakan bisnis.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Spreadsheet templates integration notes */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="bg-slate-900 text-white rounded-none p-8 sm:p-12 relative overflow-hidden border border-slate-800">
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 border border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-950">
                  <Info size={14} className="text-blue-500" />
                  <span>Integrasi Templat Google Sheets</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  Mengotomasi Solusi Perumusan Masalah dari File Anda
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  Sistem ini telah dikonfigurasi secara optimal untuk memetakan data langsung ke skema kolom dari spreadsheets perusahaan Anda: file penjualan, pembelian stok masuk, dan pengeluaran operasional. Cukup masuk dengan kredensial admin dan hubungkan akun Google Sheets untuk mengaktifkan automasi penuh.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-none bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition duration-150 cursor-pointer"
                  >
                    Masuk ke Sistem Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-lg italic text-white shrink-0">B</div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">BERTUMBUH BERSAMA</span>
              <span className="text-[10px] text-slate-500">Copyright © 2026. All rights reserved.</span>
            </div>
          </div>
          <div className="flex space-x-6 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
            <span>Sistem Manajemen Basis Data Utama Sinkron</span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
              onClick={() => setShowLoginModal(false)}
            />

            {/* Trick to center modal content */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="inline-block align-bottom bg-white rounded-none text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-slate-200"
            >
              <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                <div className="sm:flex sm:items-start flex-col">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-none bg-blue-50 text-blue-600 mb-4 self-center border border-blue-100">
                    <Shield size={22} />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 text-center" id="modal-title">
                      Portal Admin Masuk
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1 text-center uppercase tracking-wider font-semibold">
                      Masukkan kredensial prototype untuk mengakses dasbor.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLocalSubmit} className="mt-6 space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 rounded-none border border-red-200 text-[10px] font-semibold uppercase tracking-wide text-red-600 flex items-start space-x-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="admin-id" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      ID Admin
                    </label>
                    <input
                      type="text"
                      id="admin-id"
                      required
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="Masukkan ID Admin"
                      className="mt-1.5 block w-full rounded-none border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-150"
                    />
                  </div>

                  <div>
                    <label htmlFor="password-id" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password-id"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan Password"
                      className="mt-1.5 block w-full rounded-none border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-150"
                    />
                  </div>

                  <div className="text-[10px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-none border border-slate-200 uppercase tracking-wide font-semibold">
                    <span className="font-bold text-slate-700">Kredensial Demo:</span> ID: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800 lowercase">admin1</code> & Pass: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800 lowercase">bertumbuhbersama</code>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-none text-xs font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition duration-150 disabled:opacity-50 cursor-pointer shadow-md"
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Memverifikasi...
                        </span>
                      ) : (
                        'Masuk Kredensial'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-none transition duration-150 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
