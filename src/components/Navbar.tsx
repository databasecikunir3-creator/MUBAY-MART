import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Store, 
  Layers, 
  Truck, 
  BarChart3, 
  ShoppingCart, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  PhoneCall,
  Receipt,
  Settings
} from 'lucide-react';

interface NavbarProps {
  onOpenOnlineCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenOnlineCart }) => {
  const { 
    activeTab, 
    setActiveTab, 
    onlineCart, 
    products, 
    orders,
    storeProfile,
    resetAllDemoData 
  } = useStore();

  const totalCartItems = onlineCart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;
  const activeCourierOrders = orders.filter(o => 
    o.channel === 'online' && o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled'
  ).length;

  const renderLogoIcon = () => {
    if (storeProfile.logoType === 'custom_url' && storeProfile.customLogoUrl) {
      return (
        <img 
          src={storeProfile.customLogoUrl} 
          alt={storeProfile.name} 
          className="w-full h-full object-cover rounded-xl"
        />
      );
    }

    switch (storeProfile.logoIcon) {
      case 'Apple': return <span className="text-xl">🍎</span>;
      case 'Carrot': return <span className="text-xl">🥕</span>;
      case 'Leaf': return <span className="text-xl">🥬</span>;
      case 'Package': return <span className="text-xl">📦</span>;
      case 'Store': return <span className="text-xl">🏪</span>;
      case 'Sparkles': return <span className="text-xl">✨</span>;
      default: return <ShoppingBag className="w-5 h-5 text-white" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top micro bar for store status & hotline */}
      <div className="bg-emerald-800 text-emerald-50 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {storeProfile.announcementBanner || 'Gudang & Toko Buka • Pengiriman Instan Siap Kirim (06:00 - 21:00 WIB)'}
            </span>
            <span className="hidden md:inline text-emerald-300">|</span>
            <span className="hidden md:inline text-emerald-200">
              Garansi Sayur & Buah Segar 100% Ganti Baru
            </span>
          </div>

          <div className="flex items-center gap-4 text-emerald-200">
            <span className="hidden sm:flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" /> Hotline: {storeProfile.hotline || storeProfile.phone || '0812-8899-7700'}
            </span>
            <button 
              onClick={resetAllDemoData}
              title="Reset seluruh data ke kondisi awal demo"
              className="flex items-center gap-1 text-emerald-300 hover:text-white transition-colors cursor-pointer text-[11px] bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/50"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('store')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform overflow-hidden">
              {renderLogoIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-800 tracking-tight">
                  {storeProfile.namePrefix || storeProfile.name}
                  <span className="text-emerald-600">{storeProfile.nameSuffix || ''}</span>
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200">
                  REAL-TIME
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-0.5 font-medium">
                {storeProfile.tagline || 'Sembako, Buah & Sayur Segar'}
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs (All 7 Core Modules) */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Store className="w-4 h-4 text-emerald-600" />
              Toko Online
            </button>

            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'pos'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 right-1"></div>
              <span className="flex items-center justify-center w-4 h-4 rounded bg-emerald-600 text-[10px] text-white font-bold">POS</span>
              Kasir Toko
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Receipt className="w-4 h-4 text-emerald-600" />
              Struk ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              Stok & Gudang
              {lowStockCount > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('courier')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'courier'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Truck className="w-4 h-4 text-blue-600" />
              Kurir
              {activeCourierOrders > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-blue-200">
                  {activeCourierOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-600" />
              Analitik
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '6s' }} />
              Pengaturan
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {/* Low stock alert badge if any */}
            {lowStockCount > 0 && (
              <button
                onClick={() => setActiveTab('inventory')}
                className="hidden sm:flex items-center gap-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-medium hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lowStockCount} Stok Menipis</span>
              </button>
            )}

            {/* Quick Settings Shortcut button on tablet/sm */}
            <button
              onClick={() => setActiveTab('settings')}
              title="Buka Menu Pengaturan Toko, Logo & Struk"
              className={`hidden sm:flex lg:hidden p-2 rounded-xl border cursor-pointer transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Online Cart Button */}
            <button
              onClick={onOpenOnlineCart}
              className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalCartItems > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 bg-amber-400 text-slate-900 font-extrabold text-[11px] rounded-full border-2 border-emerald-600">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between gap-1 overflow-x-auto pt-2.5 pb-1 border-t border-slate-100 mt-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'store' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Toko Online
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'pos' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-bold">POS</span> Kasir
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'transactions' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Struk ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Stok
            {lowStockCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] flex items-center justify-center font-bold">
                {lowStockCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('courier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'courier' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Kurir
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'analytics' ? 'bg-emerald-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analitik
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'settings' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 bg-slate-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> Pengaturan
          </button>
        </div>
      </div>
    </header>
  );
};
