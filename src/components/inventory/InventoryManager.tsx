import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, ProductUnit } from '../../types';
import { 
  Layers, 
  AlertTriangle, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  DollarSign, 
  History, 
  Check, 
  X, 
  PackagePlus, 
  AlertOctagon,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { 
    products, 
    stockLogs, 
    restockProduct, 
    logWasteProduct, 
    updateProductDetails, 
    addNewProduct, 
    deleteProduct 
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'inventory_table' | 'stock_logs'>('inventory_table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  // Modal states
  const [restockModalTarget, setRestockModalTarget] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockNote, setRestockNote] = useState('');

  const [wasteModalTarget, setWasteModalTarget] = useState<Product | null>(null);
  const [wasteQty, setWasteQty] = useState<number>(1);
  const [wasteReason, setWasteReason] = useState('Layu / Busuk karena cuaca');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState({
    barcode: `899100100${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    category: 'sayur' as ProductCategory,
    unit: 'kg' as ProductUnit,
    price: 15000,
    costPrice: 11000,
    stock: 20,
    minStockAlert: 5,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    freshnessGrade: 'Grade A Segar',
    shelfLifeDays: 5,
    origin: 'Kebun Mitra',
    description: '',
  });

  // KPI calculations
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalAssetValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const totalRetailPotential = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert);
  const outOfStockProducts = products.filter(p => p.stock <= 0);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.barcode.includes(searchQuery) ||
                        p.origin?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchStatus = true;
    if (statusFilter === 'low_stock') matchStatus = p.stock > 0 && p.stock <= p.minStockAlert;
    if (statusFilter === 'out_of_stock') matchStatus = p.stock <= 0;

    return matchCat && matchSearch && matchStatus;
  });

  const handleExecuteRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalTarget || restockQty <= 0) return;
    restockProduct(restockModalTarget.id, restockQty, restockNote || 'Restock pengadaan gudang');
    setRestockModalTarget(null);
    setRestockQty(10);
    setRestockNote('');
  };

  const handleExecuteWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteModalTarget || wasteQty <= 0) return;
    logWasteProduct(wasteModalTarget.id, wasteQty, wasteReason);
    setWasteModalTarget(null);
    setWasteQty(1);
  };

  const handleCreateNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductData.name) {
      alert('Nama produk wajib diisi.');
      return;
    }
    addNewProduct(newProductData);
    setIsAddModalOpen(false);
    setNewProductData({
      barcode: `899100100${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'sayur',
      unit: 'kg',
      price: 15000,
      costPrice: 11000,
      stock: 20,
      minStockAlert: 5,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      freshnessGrade: 'Grade A Segar',
      shelfLifeDays: 5,
      origin: 'Kebun Mitra',
      description: '',
    });
  };

  return (
    <div className="space-y-5 pb-16">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Sistem Manajemen Stok & Inventaris Gudang
          </h1>
          <p className="text-xs text-slate-500">
            Terhubung real-time dengan aplikasi Kasir POS & pemesanan Toko Online
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Inventory Health */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Varian Barang</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-800">{products.length} SKU</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{totalStockItems} total unit stok</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Nilai Modal Aset Stok</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-800">
            Rp {Math.round(totalAssetValue / 1000).toLocaleString('id-ID')} rb
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">
            Potensi Omzet: Rp {Math.round(totalRetailPotential / 1000).toLocaleString('id-ID')} rb
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700">Stok Menipis</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-800">{lowStockProducts.length} Produk</div>
          <p className="text-[11px] text-amber-600 mt-0.5">Perlu segera re-order</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-700">Stok Kosong (0)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-800">{outOfStockProducts.length} Produk</div>
          <p className="text-[11px] text-rose-600 mt-0.5">Tidak bisa dijual</p>
        </div>
      </div>

      {/* Critical Stock Alert Banner if any items are low or out of stock */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-amber-900">
                Peringatan Restock Inventaris: Ada {lowStockProducts.length + outOfStockProducts.length} Produk Butuh Perhatian!
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Barang menipis: {lowStockProducts.map(p => `${p.name} (sisa ${p.stock})`).join(', ') || 'Tidak ada'}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter(statusFilter === 'low_stock' ? 'all' : 'low_stock')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer shrink-0 transition-colors"
          >
            {statusFilter === 'low_stock' ? 'Lihat Semua Barang' : 'Filter Barang Menipis'}
          </button>
        </div>
      )}

      {/* Tab Switcher: Inventory Table vs Stock Audit Logs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('inventory_table')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'inventory_table'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Daftar Stok Produk Fisik ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stock_logs')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'stock_logs'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat Mutasi Stok Real-Time ({stockLogs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: INVENTORY TABLE */}
      {activeSubTab === 'inventory_table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Table Search & Filters bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, barcode, atau asal petani..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="sembako">Sembako</option>
                <option value="sayur">Sayuran</option>
                <option value="buah">Buah-buahan</option>
                <option value="bumbu">Bumbu</option>
                <option value="daging_telur">Daging/Telur</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status Stok</option>
                <option value="low_stock">Stok Menipis Saja</option>
                <option value="out_of_stock">Stok Habis Saja</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Produk & Barcode</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3 text-right">Harga Modal</th>
                  <th className="py-3 px-3 text-right">Harga Jual</th>
                  <th className="py-3 px-3 text-center">Margin</th>
                  <th className="py-3 px-3 text-center">Stok Fisik</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const marginPercent = Math.round(((p.price - p.costPrice) / p.costPrice) * 100);
                  const isOut = p.stock <= 0;
                  const isLow = p.stock > 0 && p.stock <= p.minStockAlert;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-800 line-clamp-1">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Barcode: {p.barcode} • Asal: {p.origin || 'Lokal'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium">
                          {p.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        Rp {p.costPrice.toLocaleString('id-ID')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        Rp {p.price.toLocaleString('id-ID')} <span className="text-slate-400 font-normal text-[10px]">/{p.unit}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          marginPercent >= 20 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          +{marginPercent}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="font-extrabold text-sm font-mono text-slate-800">
                          {p.stock} <span className="text-[10px] text-slate-400 font-normal">{p.unit}</span>
                        </div>
                        <div className="text-[9px] text-slate-400">Min: {p.minStockAlert}</div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {isOut ? (
                          <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-rose-200">
                            Habis (0)
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                            Menipis
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            Aman
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setRestockModalTarget(p);
                              setRestockQty(10);
                            }}
                            title="Restock barang masuk"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>+Stok</span>
                          </button>

                          <button
                            onClick={() => {
                              setWasteModalTarget(p);
                              setWasteQty(1);
                            }}
                            title="Catat barang rusak/layu"
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] cursor-pointer transition-colors"
                          >
                            Layu
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Hapus produk ${p.name}?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Hapus produk"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STOCK MUTATION AUDIT LOGS */}
      {activeSubTab === 'stock_logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800">
              Audit Trail Mutasi Stok Terhubung Real-Time (Kasir POS, Toko Online & Gudang)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Total {stockLogs.length} Aktivitas Mutasi
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {stockLogs.map((log) => {
              const isDecrease = log.quantityChange < 0;
              return (
                <div key={log.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      log.type === 'sale_online' ? 'bg-blue-100 text-blue-700' :
                      log.type === 'sale_pos' ? 'bg-emerald-100 text-emerald-700' :
                      log.type === 'restock' ? 'bg-purple-100 text-purple-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {log.type === 'sale_online' ? '🛒' :
                       log.type === 'sale_pos' ? '⚡' :
                       log.type === 'restock' ? '📦' : '🍂'}
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800">{log.productName}</h5>
                      <p className="text-[11px] text-slate-500">
                        {log.note || log.type} • <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString('id-ID')} WIB</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-extrabold text-sm block ${
                      isDecrease ? 'text-rose-600' : 'text-emerald-700'
                    }`}>
                      {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sisa stok: {log.currentStockAfter}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RESTOCK MODAL */}
      {restockModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">Restock Barang Masuk</h3>
              <button onClick={() => setRestockModalTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2.5">
              <img src={restockModalTarget.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold text-xs text-slate-800">{restockModalTarget.name}</h4>
                <p className="text-[10px] text-slate-500">Stok sekarang: {restockModalTarget.stock} {restockModalTarget.unit}</p>
              </div>
            </div>

            <form onSubmit={handleExecuteRestock} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Jumlah Tambah Stok ({restockModalTarget.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Catatan Pengadaan / Nama Supplier
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  placeholder="Contoh: Kiriman Petani Lembang Batch 04"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalTarget(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Simpan Stok Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WASTE / LAYU SHRINKAGE MODAL */}
      {wasteModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">Catat Sayur/Buah Rusak & Layu</h3>
              <button onClick={() => setWasteModalTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-2.5">
              <img src={wasteModalTarget.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <h4 className="font-bold text-xs text-rose-900">{wasteModalTarget.name}</h4>
                <p className="text-[10px] text-rose-700">Tersedia: {wasteModalTarget.stock} {wasteModalTarget.unit}</p>
              </div>
            </div>

            <form onSubmit={handleExecuteWaste} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Jumlah yang Dibuang / Rusak ({wasteModalTarget.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  max={wasteModalTarget.stock}
                  required
                  value={wasteQty}
                  onChange={(e) => setWasteQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Alasan Kerusakan
                </label>
                <select
                  value={wasteReason}
                  onChange={(e) => setWasteReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Layu / Busuk karena cuaca">Layu / Busuk karena cuaca</option>
                  <option value="Penyok / Rusak saat handling bongkar muat">Penyok / Rusak saat handling</option>
                  <option value="Melewati batas masa simpan (Kadaluarsa)">Melewati masa simpan</option>
                  <option value="Sortir kualitas tidak lolos QC">Sortir kualitas tidak lolos QC</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWasteModalTarget(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Potong Stok Rusak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full space-y-4 border border-slate-200 shadow-xl my-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-800">Tambah Produk Sembako / Sayur Baru</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Kode Barcode / EAN</label>
                  <input
                    type="text"
                    required
                    value={newProductData.barcode}
                    onChange={(e) => setNewProductData({ ...newProductData, barcode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Kategori Produk</label>
                  <select
                    value={newProductData.category}
                    onChange={(e) => setNewProductData({ ...newProductData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="sembako">Sembako</option>
                    <option value="sayur">Sayur Mayur</option>
                    <option value="buah">Buah Segar</option>
                    <option value="bumbu">Bumbu Dapur</option>
                    <option value="daging_telur">Daging & Telur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Nama Produk Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Buncis Baby Super 500g"
                  value={newProductData.name}
                  onChange={(e) => setNewProductData({ ...newProductData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Harga Beli/Modal (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProductData.costPrice}
                    onChange={(e) => setNewProductData({ ...newProductData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({ ...newProductData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Satuan</label>
                  <select
                    value={newProductData.unit}
                    onChange={(e) => setNewProductData({ ...newProductData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="kg">kg</option>
                    <option value="pack">pack</option>
                    <option value="ikat">ikat</option>
                    <option value="bungkus">bungkus</option>
                    <option value="liter">liter</option>
                    <option value="dus">dus</option>
                    <option value="butir">butir</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Stok Awal Fisik</label>
                  <input
                    type="number"
                    required
                    value={newProductData.stock}
                    onChange={(e) => setNewProductData({ ...newProductData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Batas Minimum Peringatan (Min)</label>
                  <input
                    type="number"
                    required
                    value={newProductData.minStockAlert}
                    onChange={(e) => setNewProductData({ ...newProductData, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">URL Gambar Produk</label>
                <input
                  type="url"
                  required
                  value={newProductData.image}
                  onChange={(e) => setNewProductData({ ...newProductData, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Daftarkan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
