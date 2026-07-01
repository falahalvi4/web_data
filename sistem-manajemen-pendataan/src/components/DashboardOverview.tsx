import { useMemo } from 'react';
import { Penjualan, PembelianStock, PengeluaranOperasional } from '../types';
import { formatRupiah, formatDate, exportConsolidatedToExcel } from '../utils/exportUtils';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Calendar,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardOverviewProps {
  sales: Penjualan[];
  purchases: PembelianStock[];
  expenses: PengeluaranOperasional[];
  isGoogleConnected: boolean;
  onExportPdfAll: () => void;
}

export default function DashboardOverview({
  sales,
  purchases,
  expenses,
  isGoogleConnected,
  onExportPdfAll
}: DashboardOverviewProps) {
  // Stats
  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, curr) => acc + curr.total, 0);
    const totalPurchases = purchases.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.jumlah, 0);
    const netProfit = totalSales - totalPurchases - totalExpenses;
    
    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      netProfit
    };
  }, [sales, purchases, expenses]);

  // Chart 1: Daily/Weekly Activity Trend (Integrated)
  const activityTrendData = useMemo(() => {
    // Collect all unique dates
    const dates = new Set<string>();
    sales.forEach(s => s.tanggal && dates.add(s.tanggal));
    purchases.forEach(p => p.tanggal && dates.add(p.tanggal));
    expenses.forEach(e => e.tanggal && dates.add(e.tanggal));

    // Sort dates
    const sortedDates = Array.from(dates).sort();

    // Map each date to combined numbers
    return sortedDates.map(date => {
      const daySales = sales.filter(s => s.tanggal === date).reduce((sum, s) => sum + s.total, 0);
      const dayPurchases = purchases.filter(p => p.tanggal === date).reduce((sum, p) => sum + p.total, 0);
      const dayExpenses = expenses.filter(e => e.tanggal === date).reduce((sum, e) => sum + e.jumlah, 0);

      return {
        tanggal: date,
        Penjualan: daySales,
        PembelianStok: dayPurchases,
        Pengeluaran: dayExpenses,
        LabaBersih: daySales - dayPurchases - dayExpenses
      };
    }).slice(-10); // Take last 10 days for legibility
  }, [sales, purchases, expenses]);

  // Chart 2: Category distribution of Expenses
  const expensePieData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    expenses.forEach(exp => {
      const cat = exp.kategori || 'Lain-lain';
      categories[cat] = (categories[cat] || 0) + exp.jumlah;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  }, [expenses]);

  const COLORS_PIE = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  // Latest activity list (combined)
  const latestActivity = useMemo(() => {
    const list: {
      type: 'penjualan' | 'pembelian' | 'pengeluaran';
      date: string;
      title: string;
      subtitle: string;
      value: number;
    }[] = [];

    sales.forEach(s => {
      list.push({
        type: 'penjualan',
        date: s.tanggal,
        title: `Penjualan: ${s.namaPelanggan}`,
        subtitle: `${s.produk} (${s.jumlah} pcs)`,
        value: s.total
      });
    });

    purchases.forEach(p => {
      list.push({
        type: 'pembelian',
        date: p.tanggal,
        title: `Pembelian Stok: ${p.supplier}`,
        subtitle: `${p.namaBarang} (${p.jumlah} pcs)`,
        value: -p.total
      });
    });

    expenses.forEach(e => {
      list.push({
        type: 'pengeluaran',
        date: e.tanggal,
        title: `Pengeluaran: ${e.kategori}`,
        subtitle: e.keterangan,
        value: -e.jumlah
      });
    });

    // Sort by date descending
    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [sales, purchases, expenses]);

  const handleExportConsolidatedExcel = () => {
    exportConsolidatedToExcel(sales, purchases, expenses);
  };

  return (
    <div id="overview-tab-root" className="space-y-6">
      {/* Top action/info bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 border border-slate-200 rounded-none gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
            <Activity className="text-blue-500 mr-2 shrink-0 animate-pulse" size={18} />
            DASBOR RINGKASAN
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Data Real-time Penjualan, Pembelian Stok, dan Biaya Operasional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Executive Reports */}
          <button
            onClick={onExportPdfAll}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-none text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200 px-4 py-2 cursor-pointer"
          >
            <Download size={14} />
            PDF Ringkasan
          </button>
          
          <button
            onClick={handleExportConsolidatedExcel}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-none text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-200 transition-all border border-blue-600 px-4 py-2 cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            Excel Konsolidasi
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Sales Card */}
        <div className="bg-white p-6 border-l-4 border-l-green-500 border-y border-r border-slate-200 rounded-none flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Penjualan</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{formatRupiah(stats.totalSales)}</h3>
          <span className="block text-[10px] text-green-600 font-semibold uppercase tracking-wider mt-1">{sales.length} Faktur</span>
        </div>

        {/* Purchase Card */}
        <div className="bg-white p-6 border-l-4 border-l-orange-500 border-y border-r border-slate-200 rounded-none flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pembelian Stok</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{formatRupiah(stats.totalPurchases)}</h3>
          <span className="block text-[10px] text-orange-600 font-semibold uppercase tracking-wider mt-1">{purchases.length} Purchase Order</span>
        </div>

        {/* Expenses Card */}
        <div className="bg-white p-6 border-l-4 border-l-red-400 border-y border-r border-slate-200 rounded-none flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Biaya Operasional</span>
          <h3 className="text-2xl font-black text-slate-900 mt-2">{formatRupiah(stats.totalExpenses)}</h3>
          <span className="block text-[10px] text-red-600 font-semibold uppercase tracking-wider mt-1">{expenses.length} Pos Pengeluaran</span>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white p-6 border-l-4 border-l-blue-500 border-y border-r border-slate-200 rounded-none flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Laba / Rugi Bersih</span>
          <h3 className={`text-2xl font-black mt-2 ${stats.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatRupiah(stats.netProfit)}
          </h3>
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider mt-1">Laba Bersih Konsolidasi</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200 rounded-none space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Tren Aktivitas Operasional</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Perbandingan pengeluaran operasional, pembelian stok, dan penjualan harian.</p>
            </div>
            <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Calendar size={12} />
              <span>10 Hari Terakhir</span>
            </div>
          </div>

          <div className="h-[280px]">
            {activityTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                Belum ada data transaksi untuk divisualisasikan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tanggal" tickFormatter={(val) => val.substring(5)} style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                  <YAxis style={{ fontSize: '10px', fontWeight: 'bold' }} stroke="#94a3b8" />
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value)), '']}
                    contentStyle={{ borderRadius: '0px', borderColor: '#cbd5e1', fontSize: '11px', fontWeight: '500' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Penjualan" name="Penjualan" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="PembelianStok" name="Pembelian Stok" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorPurchases)" />
                  <Area type="monotone" dataKey="Pengeluaran" name="Operasional" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expenses Pie Distribution */}
        <div className="bg-white p-6 border border-slate-200 rounded-none flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Proporsi Beban</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-4">Pengeluaran berdasarkan kategori operasional.</p>
          </div>

          <div className="h-[180px] relative flex items-center justify-center">
            {expensePieData.length === 0 ? (
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Belum ada pengeluaran</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatRupiah(Number(value))} contentStyle={{ borderRadius: '0px', borderColor: '#cbd5e1' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Legend Indicators */}
          <div className="space-y-1.5 pt-4 border-t border-slate-50">
            {expensePieData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS_PIE[index % COLORS_PIE.length] }} />
                  <span className="text-slate-500 truncate max-w-[120px]">{entry.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{formatRupiah(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Latest Activity & Google Sheets Connection Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Activity Feed */}
        <div className="lg:col-span-2 bg-white p-6 border border-slate-200 rounded-none space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Aktivitas Transaksi Terbaru</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">5 Mutasi Terakhir</span>
          </div>

          <div className="divide-y divide-slate-100">
            {latestActivity.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono uppercase tracking-wider">
                Belum ada aktivitas terekam.
              </div>
            ) : (
              latestActivity.map((act, index) => (
                <div key={index} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-sm shrink-0 ${
                      act.type === 'penjualan' ? 'bg-green-500' : act.type === 'pembelian' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <span className="block font-bold text-slate-900">{act.title}</span>
                      <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{act.subtitle}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`block font-black ${act.value > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                      {act.value > 0 ? '+' : ''}{formatRupiah(act.value)}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase">{formatDate(act.date)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Database Status Info */}
        <div className="bg-white p-6 border border-slate-200 rounded-none space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">Sistem Basis Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem manajemen ini berjalan di atas arsitektur hibrida. Penyimpanan lokal menjamin responsivitas instan, sementara integrasi penuh dengan Google Sheets memastikan data Anda tersinkronisasi aman pada lembar kerja utama.
            </p>
          </div>

          <div className="bg-slate-50 p-4 border border-slate-200 rounded-none space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Google Sheets:</span>
              <span className={`px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider rounded-none ${
                isGoogleConnected ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {isGoogleConnected ? 'Tersinkron' : 'Terputus'}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed flex items-start space-x-1.5 pt-1 uppercase tracking-wider font-semibold">
              <AlertCircle size={14} className="shrink-0 text-blue-500" />
              <span>
                {isGoogleConnected
                  ? 'Setiap entri baru akan tertulis langsung pada baris akhir spreadsheet Google Anda.'
                  : 'Aktifkan integrasi Google Sheets pada menu Pengaturan DB di bilah samping.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
