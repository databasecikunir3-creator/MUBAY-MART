import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { 
  Search, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Zap, 
  ChefHat,
  Filter,
  ArrowRight
} from 'lucide-react';

const CATEGORY_TABS: { id: 'all' | ProductCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Semua Produk', icon: '🛒' },
  { id: 'sembako', label: 'Sembako Murah', icon: '🍚' },
  { id: 'sayur', label: 'Sayur Segar', icon: '🥬' },
  { id: 'buah', label: 'Buah Pilihan', icon: '🍎' },
  { id: 'bumbu', label: 'Bumbu Dapur', icon: '🧄' },
  { id: 'daging_telur', label: 'Daging & Telur', icon: '🥚' },
];

export const StoreCatalog: React.FC<{ onOpenCart: () => void }> = ({ onOpenCart }) => {
  const { products, onlineCart, addToOnlineCart, updateOnlineCartQuantity, storeProfile } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'stock'>('popular');

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    }).sort((a, b) => {
      if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Quick helper to check if item is in online cart
  const getCartQuantity = (productId: string) => {
    return onlineCart.find(item => item.product.id === productId)?.quantity || 0;
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Hero Promotional Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-700/80 text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border border-emerald-600/50">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Pengiriman Kilat 1-2 Jam Sampai ke Rumah Anda
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Sembako Murah, Sayur & Buah <span className="text-emerald-300">Segar Petik Hari Ini</span>
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Langsung dari petani lokal Lembang, Cianjur & distributor resmi. Harga pasar tradisional dengan kenyamanan belanja online & kurir otomatis.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-emerald-200">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Bergaransi Segar
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-emerald-400" /> Order Pagi, Masak Siang
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" /> Pembayaran Digital QRIS & E-Wallet
              </span>
            </div>
          </div>

          {/* Quick Promo Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl text-center shrink-0 w-full md:w-72 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block mb-1">Promo Toko Aktif</span>
            <div className="text-2xl font-black text-amber-300">POTONGAN Rp {(storeProfile.defaultPromoDiscount || 10000).toLocaleString('id-ID')}</div>
            <p className="text-xs text-emerald-100 mt-1">Gunakan kode voucher saat checkout:</p>
            <div className="mt-2.5 inline-block bg-white text-emerald-900 font-mono font-bold text-xs px-3 py-1.5 rounded-lg border-2 border-dashed border-emerald-500 shadow-xs">
              {storeProfile.defaultPromoCode || 'SEGARHEMAT'}
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs & Search Bar */}
      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari beras pandan wangi, bayam segar, pisang sunpride, cabe..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="popular">Paling Populer</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="stock">Stok Terbanyak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Catalog Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Katalog Produk Segar & Sembako
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredProducts.length} produk • Stok disinkronkan real-time dengan kasir toko
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            🟢 Stok Live Terhubung POS
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Produk Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Coba kata kunci lain atau pilih kategori Semua Produk.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const qtyInCart = getCartQuantity(product.id);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Image container */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Freshness / Popular Badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.freshnessGrade && (
                        <span className="bg-emerald-600/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs backdrop-blur-xs">
                          {product.freshnessGrade}
                        </span>
                      )}
                      {product.isPopular && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          ⭐ Terlaris
                        </span>
                      )}
                    </div>

                    {/* Stock status overlay pill */}
                    <div className="absolute bottom-2 right-2">
                      {isOutOfStock ? (
                        <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
                          Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-pulse">
                          Sisa {product.stock} {product.unit}!
                        </span>
                      ) : (
                        <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                          Stok: {product.stock} {product.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Origin and Shelf life info */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="flex items-center gap-1 truncate max-w-[120px]" title={product.origin}>
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          {product.origin || 'Lokal'}
                        </span>
                        {product.shelfLifeDays && (
                          <span className="text-slate-400">
                            Tahan ~{product.shelfLifeDays} hr
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2" title={product.name}>
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="text-xs text-slate-500">Rp</span>
                          <span className="text-base font-extrabold text-emerald-700 ml-0.5">
                            {product.price.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal"> /{product.unit}</span>
                        </div>
                      </div>

                      {/* Add to Cart Actions */}
                      {isOutOfStock ? (
                        <button
                          disabled
                          className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed text-center"
                        >
                          Stok Habis
                        </button>
                      ) : qtyInCart > 0 ? (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                          <button
                            onClick={() => updateOnlineCartQuantity(product.id, qtyInCart - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white text-emerald-700 rounded-lg shadow-xs hover:bg-emerald-100 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-extrabold text-emerald-800">
                            {qtyInCart}
                          </span>
                          <button
                            disabled={qtyInCart >= product.stock}
                            onClick={() => updateOnlineCartQuantity(product.id, qtyInCart + 1)}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg shadow-xs ${
                              qtyInCart >= product.stock
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToOnlineCart(product, 1)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Keranjang
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Value Proposition Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="bg-emerald-50/60 border border-emerald-200/80 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Kurir Pengiriman Otomatis</h4>
            <p className="text-[11px] text-slate-600">Integrasi GoSend, Grab, Anteraja. Penugasan driver instan setelah bayar.</p>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200/80 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">QRIS & E-Wallet Real-Time</h4>
            <p className="text-[11px] text-slate-600">Scan QRIS dari GoPay, OVO, DANA, BCA Mobile. Pembayaran langsung terverifikasi.</p>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Sinkronisasi Stok Kasir POS</h4>
            <p className="text-[11px] text-slate-600">Stok toko offline kasir & online menyatu. Tidak ada risiko barang terjual ganda.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
