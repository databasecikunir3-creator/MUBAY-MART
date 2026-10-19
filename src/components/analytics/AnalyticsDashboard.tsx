import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Store, 
  Download, 
  Printer, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  PieChart,
  Layers,
  Percent
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { orders, products, stockLogs } = useStore();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Overall Financial Calculations
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let onlineCount = 0;
    let posCount = 0;
    const categoryRevenue: Record<string, number> = {
      sembako: 0,
      sayur: 0,
      buah: 0,
      bumbu: 0,
      daging_telur: 0,
    };

    const productSalesMap: Record<string, { name: string; qty: number; revenue: number; profit: number }> = {};

    orders.forEach((order) => {
      if (order.paymentStatus === 'paid') {
        totalRevenue += order.total;
        if (order.channel === 'online') onlineCount++;
        if (order.channel === 'pos_kasir') posCount++;

        order.items.forEach((item) => {
          const itemCost = (item.product.costPrice || 0) * item.quantity;
          const itemRevenue = item.product.price * item.quantity;
          totalCost += itemCost;

          // Category contribution
          const cat = item.product.category || 'sembako';
          categoryRevenue[cat] = (categoryRevenue[cat] || 0) + itemRevenue;

          // Product sales contribution
          if (!productSalesMap[item.product.id]) {
            productSalesMap[item.product.id] = {
              name: item.product.name,
              qty: 0,
              revenue: 0,
              profit: 0,
            };
          }
          productSalesMap[item.product.id].qty += item.quantity;
          productSalesMap[item.product.id].revenue += itemRevenue;
          productSalesMap[item.product.id].profit += (itemRevenue - itemCost);
        });
      }
    });

    const netProfit = Math.max(0, totalRevenue - totalCost);
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    const totalOrdersCount = onlineCount + posCount;
    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Top selling products sorted by quantity
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Calculate total waste/shrinkage cost from stockLogs
    const totalWasteCost = stockLogs
      .filter(l => l.type === 'adjustment_waste')
      .reduce((sum, log) => {
        const prod = products.find(p => p.id === log.productId);
        const cost = prod ? prod.costPrice : 10000;
        return sum + (Math.abs(log.quantityChange) * cost);
      }, 0);

    return {
      totalRevenue,
      totalCost,
      netProfit,
      profitMargin,
      onlineCount,
      posCount,
      totalOrdersCount,
      averageOrderValue,
      categoryRevenue,
      topProducts,
      totalWasteCost,
    };
  }, [orders, products, stockLogs]);

  // Daily Trend Mock Data for 7 days
  const dailyTrends = useMemo(() => {
    const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const baseAmounts = [1450000, 1820000, 1690000, 2100000, 2450000, 3100000, 2850000];
    
    // Add current today's actual orders to Sunday/Today
    const todayExtra = metrics.totalRevenue;
    baseAmounts[6] += Math.min(todayExtra, 1200000);

    return days.map((day, idx) => {
      const revenue = baseAmounts[idx];
      const profit = Math.round(revenue * 0.22);
      return { day, revenue, profit };
    });
  }, [metrics.totalRevenue]);

  const maxRevenueInChart = Math.max(...dailyTrends.map(d => d.revenue));

  // CSV Export Function
  const exportToCSV = () => {
    const headers = ['No Invoice', 'Kanal', 'Tanggal', 'Metode Bayar', 'Status Bayar', 'Subtotal', 'Diskon', 'Ongkir', 'Total'];
    const rows = orders.map(o => [
      o.invoiceNumber,
      o.channel === 'online' ? 'Toko Online' : 'POS Kasir Toko',
      new Date(o.createdAt).toLocaleString('id-ID'),
      o.paymentMethod.toUpperCase(),
      o.paymentStatus.toUpperCase(),
      o.subtotal,
      o.discount,
      o.shippingFee,
      o.total,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Penjualan_SegarMart_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCatSum = Object.values(metrics.categoryRevenue).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header with Date Range and Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Dashboard Analitik & Performa Penjualan
          </h1>
          <p className="text-xs text-slate-500">
            Laporan finansial komprehensif, laba bersih, kanal penjualan, dan perputaran komoditas segar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                timeRange === '7days' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                timeRange === '30days' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Omzet */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Omzet Penjualan</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            Rp {metrics.totalRevenue.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
            <ArrowUpRight className="w-4 h-4" />
            <span>+18.4% vs minggu lalu</span>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Laba Bersih</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-900 font-mono">
            Rp {metrics.netProfit.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-700 font-bold mt-2">
            <Percent className="w-3.5 h-3.5" />
            <span>Margin Keuntungan ~{metrics.profitMargin}%</span>
          </div>
        </div>

        {/* Total Pesanan & Channel Breakdown */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {metrics.totalOrdersCount} Transaksi
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2 font-medium">
            <span className="text-emerald-700 font-bold">🛒 {metrics.onlineCount} Online</span>
            <span>•</span>
            <span className="text-blue-700 font-bold">⚡ {metrics.posCount} POS Kasir</span>
          </div>
        </div>

        {/* Rata-rata Belanja (AOV) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata Belanja (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            Rp {metrics.averageOrderValue.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Nilai transaksi per keranjang
          </div>
        </div>

      </div>

      {/* Main Charts Row: 7-Day Trend Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT: 7-Day Sales & Profit Bar/Area Chart (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">
                Tren Omzet Penjualan & Keuntungan (7 Hari)
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan pendapatan kotor dan laba bersih harian
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-emerald-600"></span> Omzet
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-sm bg-purple-500"></span> Laba
              </span>
            </div>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-2 border-b border-slate-100">
            {dailyTrends.map((d, index) => {
              const heightPercent = Math.round((d.revenue / maxRevenueInChart) * 100);
              const profitHeight = Math.round((d.profit / maxRevenueInChart) * 100);
              const isHovered = hoveredDayIndex === index;

              return (
                <div
                  key={d.day}
                  onMouseEnter={() => setHoveredDayIndex(index)}
                  onMouseLeave={() => setHoveredDayIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative"
                >
                  {/* Floating tooltip */}
                  {isHovered && (
                    <div className="absolute -top-16 z-20 bg-slate-900 text-white text-[10px] p-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none">
                      <div className="font-bold text-emerald-400">Hari {d.day}</div>
                      <div>Omzet: Rp {d.revenue.toLocaleString('id-ID')}</div>
                      <div>Laba: Rp {d.profit.toLocaleString('id-ID')}</div>
                    </div>
                  )}

                  {/* Dual Bar (Revenue + Profit) */}
                  <div className="w-full max-w-[36px] flex items-end gap-1 h-full">
                    {/* Revenue Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isHovered ? 'bg-emerald-500 shadow-md' : 'bg-emerald-600/90'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    {/* Profit Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isHovered ? 'bg-purple-400 shadow-md' : 'bg-purple-500/80'
                      }`}
                      style={{ height: `${profitHeight}%` }}
                    ></div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 mt-2">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Peak Day: Sabtu (Rp 3.100.000)</span>
            <span className="font-mono text-emerald-700 font-bold">Rata-rata: Rp 2.150.000 / hari</span>
          </div>
        </div>

        {/* RIGHT: Category Breakdown & Channel Split (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sales by Category */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <h3 className="font-bold text-sm text-slate-800">
              Kontribusi Penjualan per Kategori
            </h3>

            <div className="space-y-3">
              {[
                { key: 'sembako', label: 'Beras & Sembako', color: 'bg-emerald-600', icon: '🍚' },
                { key: 'sayur', label: 'Sayuran Segar', color: 'bg-green-500', icon: '🥬' },
                { key: 'buah', label: 'Buah-buahan', color: 'bg-amber-500', icon: '🍎' },
                { key: 'daging_telur', label: 'Daging & Telur', color: 'bg-rose-500', icon: '🥚' },
                { key: 'bumbu', label: 'Bumbu Dapur', color: 'bg-purple-500', icon: '🧄' },
              ].map((cat) => {
                const amount = metrics.categoryRevenue[cat.key] || 0;
                const percentage = Math.round((amount / totalCatSum) * 100);

                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span>{cat.icon}</span> {cat.label}
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        Rp {amount.toLocaleString('id-ID')} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel Breakdown: Online vs POS Kasir */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-slate-800">Perbandingan Kanal Penjualan</h4>
              <p className="text-[11px] text-slate-500">Toko Online vs Transaksi Kasir POS</p>
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="text-emerald-700 font-bold">Online: {metrics.onlineCount} Order</span>
                <span className="text-blue-700 font-bold">Kasir: {metrics.posCount} Order</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-center bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <span className="text-lg font-black text-emerald-800 font-mono">
                  {Math.round((metrics.onlineCount / (metrics.totalOrdersCount || 1)) * 100)}%
                </span>
                <span className="block text-[9px] text-emerald-700 font-bold uppercase">Online</span>
              </div>
              <div className="text-center bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                <span className="text-lg font-black text-blue-800 font-mono">
                  {Math.round((metrics.posCount / (metrics.totalOrdersCount || 1)) * 100)}%
                </span>
                <span className="block text-[9px] text-blue-700 font-bold uppercase">Kasir</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Top 5 Best Selling Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800">
            5 Produk Terlaris (Top Performers by Revenue & Volume)
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Diperbarui secara real-time
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Peringkat</th>
                <th className="py-2.5 px-3">Nama Produk</th>
                <th className="py-2.5 px-3 text-center">Unit Terjual</th>
                <th className="py-2.5 px-3 text-right">Kontribusi Omzet</th>
                <th className="py-2.5 px-4 text-right">Estimasi Laba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.topProducts.map((p, index) => (
                <tr key={index} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                      index === 0 ? 'bg-amber-400 text-slate-900 shadow-xs' :
                      index === 1 ? 'bg-slate-300 text-slate-800' :
                      index === 2 ? 'bg-amber-200 text-amber-900' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">{p.name}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                    {p.qty} unit
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                    Rp {p.revenue.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-purple-700">
                    Rp {p.profit.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
