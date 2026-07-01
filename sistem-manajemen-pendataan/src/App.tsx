import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart2, 
  DollarSign, 
  ShoppingBag, 
  TrendingDown, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  RefreshCw,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import DashboardOverview from './components/DashboardOverview';
import PenjualanTab from './components/PenjualanTab';
import PembelianTab from './components/PembelianTab';
import PengeluaranTab from './components/PengeluaranTab';
import SettingsTab from './components/SettingsTab';

import { Penjualan, PembelianStock, PengeluaranOperasional, SpreadsheetConfig } from './types';
import { 
  INITIAL_PENJUALAN, 
  INITIAL_PEMBELIAN, 
  INITIAL_PENGELUARAN,
  COLUMNS_PENJUALAN,
  COLUMNS_PEMBELIAN,
  COLUMNS_PENGELUARAN
} from './utils/mockData';

import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  setAccessToken 
} from './services/auth';

import { 
  fetchSheetValues, 
  appendSheetRow, 
  initializeSheetWithHeaders,
  getSpreadsheetInfo
} from './services/googleSheets';

import { User } from 'firebase/auth';
import { exportConsolidatedToExcel, exportToPdf, formatRupiah } from './utils/exportUtils';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('bb_admin_logged_in') === 'true';
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'penjualan' | 'pembelian' | 'pengeluaran' | 'settings'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core transaction states
  const [sales, setSales] = useState<Penjualan[]>([]);
  const [purchases, setPurchases] = useState<PembelianStock[]>([]);
  const [expenses, setExpenses] = useState<PengeluaranOperasional[]>([]);

  // Spreadsheet config states (pre-filled with user's provided sheet IDs)
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetConfig>({
    penjualanId: '1X81WCH6SrD594I3OtQhcDADcae_SrXWb',
    penjualanSheet: 'Sheet1',
    pembelianId: '1Z8nwRpCHqd7GoLLQ7WilLJqEOnfo9NO4',
    pembelianSheet: 'Sheet1',
    pengeluaranId: '1RP7VppzsG_RMgancsqAbGvLTje6TKbbm',
    pengeluaranSheet: 'Sheet1',
  });

  // Google User / Auth States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // 1. Initial Load of core data
  useEffect(() => {
    const cachedSales = localStorage.getItem('bb_sales');
    const cachedPurchases = localStorage.getItem('bb_purchases');
    const cachedExpenses = localStorage.getItem('bb_expenses');
    const cachedConfig = localStorage.getItem('bb_sheet_config');

    if (cachedSales) setSales(JSON.parse(cachedSales));
    else setSales(INITIAL_PENJUALAN);

    if (cachedPurchases) setPurchases(JSON.parse(cachedPurchases));
    else setPurchases(INITIAL_PEMBELIAN);

    if (cachedExpenses) setExpenses(JSON.parse(cachedExpenses));
    else setExpenses(INITIAL_PENGELUARAN);

    if (cachedConfig) setSpreadsheetConfig(JSON.parse(cachedConfig));

    // Try to auto-initialize Auth session if exists
    initAuth(
      (user, token) => {
        setGoogleUser(user);
        setIsGoogleConnected(true);
      },
      () => {
        setGoogleUser(null);
        setIsGoogleConnected(false);
      }
    );
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    if (sales.length > 0) localStorage.setItem('bb_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    if (purchases.length > 0) localStorage.setItem('bb_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    if (expenses.length > 0) localStorage.setItem('bb_expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleConfigChange = (newConfig: SpreadsheetConfig) => {
    setSpreadsheetConfig(newConfig);
    localStorage.setItem('bb_sheet_config', JSON.stringify(newConfig));
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('bb_admin_logged_in', 'true');
  };

  const handleLogoutAdmin = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('bb_admin_logged_in');
  };

  // Google OAuth triggers
  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setSyncStatus('Menghubungkan akun Google...');
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setIsGoogleConnected(true);
        setSyncStatus('Berhasil terhubung!');
        
        // After connect, let's try to pull their actual data to sync!
        setTimeout(() => handleSyncAllSheets(result.accessToken), 1000);
      }
    } catch (e: any) {
      alert(`Gagal menghubungkan Google Sheets: ${e.message}`);
      setIsGoogleConnected(false);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setIsGoogleConnected(false);
      setAccessToken(null);
      setSyncStatus('Koneksi terputus.');
    } catch (e: any) {
      alert(`Gagal memutuskan koneksi: ${e.message}`);
    }
  };

  // 2. Add New Sale and write to Google Sheet if connected
  const handleAddSale = async (newSale: Omit<Penjualan, 'id' | 'total'>) => {
    const total = newSale.jumlah * newSale.hargaSatuan;
    const saleWithId: Penjualan = {
      ...newSale,
      id: `sale-${Date.now()}`,
      total
    };

    // Update locally
    const updatedSales = [saleWithId, ...sales];
    setSales(updatedSales);

    // Write to Google Sheet if connected
    const token = getAccessToken();
    if (isGoogleConnected && token) {
      try {
        // Appending to the spreadsheet
        const rowData = [
          newSale.tanggal,
          newSale.noFaktur,
          newSale.namaPelanggan,
          newSale.produk,
          newSale.jumlah,
          newSale.hargaSatuan,
          total,
          newSale.metodePembayaran
        ];
        await appendSheetRow(
          token, 
          spreadsheetConfig.penjualanId, 
          `${spreadsheetConfig.penjualanSheet}!A:H`, 
          rowData
        );
      } catch (err: any) {
        console.error('Gagal menulis data ke Google Sheets:', err);
        alert(`Data disimpan lokal, namun gagal dikirim ke Google Sheets: ${err.message}. Silakan periksa pengaturan ID spreadsheet Anda.`);
      }
    }
  };

  const handleDeleteSale = (id: string) => {
    setSales(sales.filter(s => s.id !== id));
  };

  // 3. Add New Purchase and write to Google Sheet if connected
  const handleAddPurchase = async (newPurchase: Omit<PembelianStock, 'id' | 'total'>) => {
    const total = newPurchase.jumlah * newPurchase.hargaBeli;
    const purchaseWithId: PembelianStock = {
      ...newPurchase,
      id: `purch-${Date.now()}`,
      total
    };

    const updatedPurchases = [purchaseWithId, ...purchases];
    setPurchases(updatedPurchases);

    const token = getAccessToken();
    if (isGoogleConnected && token) {
      try {
        const rowData = [
          newPurchase.tanggal,
          newPurchase.noPO,
          newPurchase.supplier,
          newPurchase.namaBarang,
          newPurchase.jumlah,
          newPurchase.hargaBeli,
          total,
          newPurchase.status
        ];
        await appendSheetRow(
          token,
          spreadsheetConfig.pembelianId,
          `${spreadsheetConfig.pembelianSheet}!A:H`,
          rowData
        );
      } catch (err: any) {
        console.error('Gagal menulis data ke Google Sheets:', err);
        alert(`Data disimpan lokal, namun gagal dikirim ke Google Sheets: ${err.message}.`);
      }
    }
  };

  const handleDeletePurchase = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
  };

  // 4. Add New Expense and write to Google Sheet if connected
  const handleAddExpense = async (newExpense: Omit<PengeluaranOperasional, 'id'>) => {
    const expenseWithId: PengeluaranOperasional = {
      ...newExpense,
      id: `exp-${Date.now()}`
    };

    const updatedExpenses = [expenseWithId, ...expenses];
    setExpenses(updatedExpenses);

    const token = getAccessToken();
    if (isGoogleConnected && token) {
      try {
        const rowData = [
          newExpense.tanggal,
          newExpense.kategori,
          newExpense.keterangan,
          newExpense.jumlah,
          newExpense.metodePembayaran,
          newExpense.penanggungJawab
        ];
        await appendSheetRow(
          token,
          spreadsheetConfig.pengeluaranId,
          `${spreadsheetConfig.pengeluaranSheet}!A:F`,
          rowData
        );
      } catch (err: any) {
        console.error('Gagal menulis data ke Google Sheets:', err);
        alert(`Data disimpan lokal, namun gagal dikirim ke Google Sheets: ${err.message}.`);
      }
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // 5. Bulk Sheet Syncing (Bidirectional: Pull contents of sheets and map them to our states!)
  const handleSyncAllSheets = async (forcedToken?: string) => {
    const token = forcedToken || getAccessToken();
    if (!token) {
      alert('Mohon hubungkan akun Google Anda terlebih dahulu untuk memulai sinkronisasi.');
      return;
    }

    setSyncStatus('Sedang menarik data terbaru dari Google Sheets...');
    
    try {
      // Pull Penjualan
      let syncedSales: Penjualan[] = [];
      try {
        const salesRows = await fetchSheetValues(
          token,
          spreadsheetConfig.penjualanId,
          `${spreadsheetConfig.penjualanSheet}!A2:H1000` // Skip header row
        );
        if (salesRows && salesRows.length > 0) {
          syncedSales = salesRows.map((row, idx) => ({
            id: `gs-sale-${idx}`,
            tanggal: row[0] || '',
            noFaktur: row[1] || '',
            namaPelanggan: row[2] || '',
            produk: row[3] || '',
            jumlah: parseInt(row[4]) || 0,
            hargaSatuan: parseInt(row[5]) || 0,
            total: parseInt(row[6]) || 0,
            metodePembayaran: row[7] || 'Transfer Bank',
          }));
        }
      } catch (err) {
        console.warn('Gagal menarik data Penjualan dari Google Sheets, menggunakan data lokal.', err);
      }

      // Pull Pembelian
      let syncedPurchases: PembelianStock[] = [];
      try {
        const purchasesRows = await fetchSheetValues(
          token,
          spreadsheetConfig.pembelianId,
          `${spreadsheetConfig.pembelianSheet}!A2:H1000`
        );
        if (purchasesRows && purchasesRows.length > 0) {
          syncedPurchases = purchasesRows.map((row, idx) => ({
            id: `gs-purch-${idx}`,
            tanggal: row[0] || '',
            noPO: row[1] || '',
            supplier: row[2] || '',
            namaBarang: row[3] || '',
            jumlah: parseInt(row[4]) || 0,
            hargaBeli: parseInt(row[5]) || 0,
            total: parseInt(row[6]) || 0,
            status: row[7] || 'Diterima',
          }));
        }
      } catch (err) {
        console.warn('Gagal menarik data Pembelian dari Google Sheets.', err);
      }

      // Pull Pengeluaran
      let syncedExpenses: PengeluaranOperasional[] = [];
      try {
        const expensesRows = await fetchSheetValues(
          token,
          spreadsheetConfig.pengeluaranId,
          `${spreadsheetConfig.pengeluaranSheet}!A2:F1000`
        );
        if (expensesRows && expensesRows.length > 0) {
          syncedExpenses = expensesRows.map((row, idx) => ({
            id: `gs-exp-${idx}`,
            tanggal: row[0] || '',
            kategori: row[1] || 'Gaji',
            keterangan: row[2] || '',
            jumlah: parseInt(row[3]) || 0,
            metodePembayaran: row[4] || 'Kas Kecil',
            penanggungJawab: row[5] || '',
          }));
        }
      } catch (err) {
        console.warn('Gagal menarik data Pengeluaran dari Google Sheets.', err);
      }

      // Update state if we successfully pulled something from any sheet
      if (syncedSales.length > 0) setSales(syncedSales);
      if (syncedPurchases.length > 0) setPurchases(syncedPurchases);
      if (syncedExpenses.length > 0) setExpenses(syncedExpenses);

      setSyncStatus('Sinkronisasi selesai! Data ter-update.');
      setTimeout(() => setSyncStatus(''), 4000);
    } catch (e: any) {
      console.error('Sinkronisasi gagal:', e);
      setSyncStatus('Sinkronisasi gagal sebagian.');
    }
  };

  // Initialize spreadsheet column headers automatically
  const handleInitializeAllSheets = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('Token akses tidak tersedia.');

    // 1. Init Sales Headers
    await initializeSheetWithHeaders(
      token,
      spreadsheetConfig.penjualanId,
      spreadsheetConfig.penjualanSheet,
      COLUMNS_PENJUALAN
    );

    // 2. Init Purchases Headers
    await initializeSheetWithHeaders(
      token,
      spreadsheetConfig.pembelianId,
      spreadsheetConfig.pembelianSheet,
      COLUMNS_PEMBELIAN
    );

    // 3. Init Expenses Headers
    await initializeSheetWithHeaders(
      token,
      spreadsheetConfig.pengeluaranId,
      spreadsheetConfig.pengeluaranSheet,
      COLUMNS_PENGELUARAN
    );
  };

  // Bulk push current state mock data directly into sheets
  const handlePushMockDataToSheets = async () => {
    const token = getAccessToken();
    if (!token) throw new Error('Token akses tidak tersedia.');

    // First ensure headers are present
    await handleInitializeAllSheets();

    // 1. Bulk write Sales
    for (const item of sales) {
      await appendSheetRow(
        token,
        spreadsheetConfig.penjualanId,
        `${spreadsheetConfig.penjualanSheet}!A:H`,
        [item.tanggal, item.noFaktur, item.namaPelanggan, item.produk, item.jumlah, item.hargaSatuan, item.total, item.metodePembayaran]
      );
    }

    // 2. Bulk write Purchases
    for (const item of purchases) {
      await appendSheetRow(
        token,
        spreadsheetConfig.pembelianId,
        `${spreadsheetConfig.pembelianSheet}!A:H`,
        [item.tanggal, item.noPO, item.supplier, item.namaBarang, item.jumlah, item.hargaBeli, item.total, item.status]
      );
    }

    // 3. Bulk write Expenses
    for (const item of expenses) {
      await appendSheetRow(
        token,
        spreadsheetConfig.pengeluaranId,
        `${spreadsheetConfig.pengeluaranSheet}!A:F`,
        [item.tanggal, item.kategori, item.keterangan, item.jumlah, item.metodePembayaran, item.penanggungJawab]
      );
    }
  };

  // Export Executive Consolidated PDF Report
  const handleExportConsolidatedPdf = () => {
    const title = 'Laporan Konsolidasi Finansial Perusahaan';
    const headers = ['Kategori Keuangan', 'Pos Akuntansi', 'Penanggung Jawab / Detail', 'Total Nilai Buku'];
    
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.jumlah, 0);
    const netProfit = totalSales - totalPurchases - totalExpenses;

    const rows = [
      ['Pendapatan Operasional', 'Total Penjualan Barang', 'Dashboard Terintegrasi', formatRupiah(totalSales)],
      ['Beban Pokok Penjualan (HPP)', 'Total Pembelian Persediaan Stok', 'Penyediaan Gudang', formatRupiah(totalPurchases)],
      ['Beban Operasional', 'Total Pengeluaran Kas Operasional', 'Gaji, Sewa, Utilitas, Pemasaran', formatRupiah(totalExpenses)],
      ['Keuntungan Bersih (Laba)', 'Laba/Rugi Bersih Setelah Beban', 'Konsolidasi Finansial', formatRupiah(netProfit)],
    ];

    const summary = [
      { label: 'Total Pendapatan:', value: formatRupiah(totalSales) },
      { label: 'Beban Operasional:', value: formatRupiah(totalExpenses + totalPurchases) },
      { label: 'EBITDA / Net Profit:', value: formatRupiah(netProfit) }
    ];

    exportToPdf(title, headers, rows, 'Laporan_Finansial_Konsolidasi', summary);
  };

  if (!isLoggedIn) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 p-8 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-lg italic text-white shrink-0">B</div>
            <h1 className="text-sm font-black tracking-[0.2em] uppercase leading-tight text-white">Bertumbuh<br/>Bersama</h1>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-bold">Menu Utama</p>
              <nav className="space-y-3">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 p-2 -ml-2 rounded transition-all duration-150 cursor-pointer text-left ${
                    activeTab === 'overview' 
                      ? 'text-blue-400 bg-slate-800/50 border-l-2 border-blue-400 font-bold uppercase tracking-wider text-[11px]' 
                      : 'text-slate-400 hover:text-white uppercase tracking-wider text-[11px] font-medium'
                  }`}
                >
                  <BarChart2 size={14} className={activeTab === 'overview' ? 'text-blue-400' : 'text-slate-500'} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('penjualan')}
                  className={`w-full flex items-center gap-3 p-2 -ml-2 rounded transition-all duration-150 cursor-pointer text-left ${
                    activeTab === 'penjualan' 
                      ? 'text-blue-400 bg-slate-800/50 border-l-2 border-blue-400 font-bold uppercase tracking-wider text-[11px]' 
                      : 'text-slate-400 hover:text-white uppercase tracking-wider text-[11px] font-medium'
                  }`}
                >
                  <DollarSign size={14} className={activeTab === 'penjualan' ? 'text-blue-400' : 'text-slate-500'} />
                  <span>Data Penjualan</span>
                </button>

                <button
                  onClick={() => setActiveTab('pembelian')}
                  className={`w-full flex items-center gap-3 p-2 -ml-2 rounded transition-all duration-150 cursor-pointer text-left ${
                    activeTab === 'pembelian' 
                      ? 'text-blue-400 bg-slate-800/50 border-l-2 border-blue-400 font-bold uppercase tracking-wider text-[11px]' 
                      : 'text-slate-400 hover:text-white uppercase tracking-wider text-[11px] font-medium'
                  }`}
                >
                  <ShoppingBag size={14} className={activeTab === 'pembelian' ? 'text-blue-400' : 'text-slate-500'} />
                  <span>Pembelian Stok</span>
                </button>

                <button
                  onClick={() => setActiveTab('pengeluaran')}
                  className={`w-full flex items-center gap-3 p-2 -ml-2 rounded transition-all duration-150 cursor-pointer text-left ${
                    activeTab === 'pengeluaran' 
                      ? 'text-blue-400 bg-slate-800/50 border-l-2 border-blue-400 font-bold uppercase tracking-wider text-[11px]' 
                      : 'text-slate-400 hover:text-white uppercase tracking-wider text-[11px] font-medium'
                  }`}
                >
                  <TrendingDown size={14} className={activeTab === 'pengeluaran' ? 'text-blue-400' : 'text-slate-500'} />
                  <span>Operasional Kas</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 p-2 -ml-2 rounded transition-all duration-150 cursor-pointer text-left ${
                    activeTab === 'settings' 
                      ? 'text-blue-400 bg-slate-800/50 border-l-2 border-blue-400 font-bold uppercase tracking-wider text-[11px]' 
                      : 'text-slate-400 hover:text-white uppercase tracking-wider text-[11px] font-medium'
                  }`}
                >
                  <Settings size={14} className={activeTab === 'settings' ? 'text-blue-400' : 'text-slate-500'} />
                  <span>Pengaturan DB</span>
                </button>
              </nav>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-800/80">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Integrasi</p>
              <div className="flex items-center gap-3 text-slate-400">
                <div className={`w-2 h-2 rounded-full ${isGoogleConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Google Sheets Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area with profile & logout admin */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          {syncStatus && (
            <div className="bg-slate-800 p-2.5 rounded border border-slate-700/60 flex items-center space-x-1.5 text-[10px] text-blue-400 animate-pulse">
              <RefreshCw size={12} className="animate-spin shrink-0" />
              <span className="truncate">{syncStatus}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pb-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
              {googleUser?.photoURL ? (
                <img src={googleUser.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
              ) : 'AD'}
            </div>
            <div>
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{googleUser?.displayName || 'Admin1'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-semibold">Super Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogoutAdmin}
            className="w-full flex items-center space-x-3 px-2 py-2 rounded text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-red-400 transition duration-150 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between h-16 bg-slate-900 text-white px-4 shrink-0 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-lg italic text-white shrink-0">B</div>
          <span className="font-bold text-sm tracking-[0.1em] uppercase">Bertumbuh Bersama</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 right-0 z-50 bg-slate-900 text-slate-300 border-b border-slate-800 shadow-xl py-4 px-6 space-y-4"
          >
            <nav className="flex flex-col space-y-1">
              <button
                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase ${activeTab === 'overview' ? 'bg-slate-800 text-blue-400 font-bold border-l-2 border-blue-400' : ''}`}
              >
                <BarChart2 size={16} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => { setActiveTab('penjualan'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase ${activeTab === 'penjualan' ? 'bg-slate-800 text-blue-400 font-bold border-l-2 border-blue-400' : ''}`}
              >
                <DollarSign size={16} />
                <span>Data Penjualan</span>
              </button>
              <button
                onClick={() => { setActiveTab('pembelian'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase ${activeTab === 'pembelian' ? 'bg-slate-800 text-blue-400 font-bold border-l-2 border-blue-400' : ''}`}
              >
                <ShoppingBag size={16} />
                <span>Pembelian Stok</span>
              </button>
              <button
                onClick={() => { setActiveTab('pengeluaran'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase ${activeTab === 'pengeluaran' ? 'bg-slate-800 text-blue-400 font-bold border-l-2 border-blue-400' : ''}`}
              >
                <TrendingDown size={16} />
                <span>Operasional Kas</span>
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase ${activeTab === 'settings' ? 'bg-slate-800 text-blue-400 font-bold border-l-2 border-blue-400' : ''}`}
              >
                <Settings size={16} />
                <span>Pengaturan DB</span>
              </button>
            </nav>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => { handleLogoutAdmin(); setMobileMenuOpen(false); }}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-red-400 uppercase tracking-wide"
              >
                <LogOut size={16} />
                <span>Keluar Portal</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'overview' && (
              <DashboardOverview
                sales={sales}
                purchases={purchases}
                expenses={expenses}
                isGoogleConnected={isGoogleConnected}
                onExportPdfAll={handleExportConsolidatedPdf}
              />
            )}

            {activeTab === 'penjualan' && (
              <PenjualanTab
                data={sales}
                onAddSale={handleAddSale}
                onDeleteSale={handleDeleteSale}
                isGoogleConnected={isGoogleConnected}
                onSyncGoogleSheets={() => handleSyncAllSheets()}
              />
            )}

            {activeTab === 'pembelian' && (
              <PembelianTab
                data={purchases}
                onAddPurchase={handleAddPurchase}
                onDeletePurchase={handleDeletePurchase}
                isGoogleConnected={isGoogleConnected}
                onSyncGoogleSheets={() => handleSyncAllSheets()}
              />
            )}

            {activeTab === 'pengeluaran' && (
              <PengeluaranTab
                data={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                isGoogleConnected={isGoogleConnected}
                onSyncGoogleSheets={() => handleSyncAllSheets()}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                config={spreadsheetConfig}
                onConfigChange={handleConfigChange}
                user={googleUser}
                isConnecting={isConnectingGoogle}
                onConnectGoogle={handleConnectGoogle}
                onDisconnectGoogle={handleDisconnectGoogle}
                onInitializeAllSheets={handleInitializeAllSheets}
                onPushMockDataToSheets={handlePushMockDataToSheets}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
