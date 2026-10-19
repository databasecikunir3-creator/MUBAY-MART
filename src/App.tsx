import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { StoreCatalog } from './components/store/StoreCatalog';
import { StoreCartModal } from './components/store/StoreCartModal';
import { CheckoutPaymentModal } from './components/store/CheckoutPaymentModal';
import { PosCashier } from './components/pos/PosCashier';
import { InventoryManager } from './components/inventory/InventoryManager';
import { CourierTracker } from './components/courier/CourierTracker';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { TransactionHistoryManager } from './components/transactions/TransactionHistoryManager';
import { StoreSettingsManager } from './components/settings/StoreSettingsManager';
import { ReceiptModal } from './components/common/ReceiptModal';
import { ToastContainer } from './components/common/ToastContainer';
import { Order } from './types';
import { 
  Store, 
  Layers, 
  Truck, 
  BarChart3, 
  ShieldCheck, 
  Receipt,
  PhoneCall,
  Settings 
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, storeProfile } = useStore();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutPromoCode, setCheckoutPromoCode] = useState('');
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  const handleProceedToCheckout = (discount: number, promoCode: string) => {
    setCheckoutDiscount(discount);
    setCheckoutPromoCode(promoCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const renderFooterLogo = () => {
    if (storeProfile.logoType === 'custom_url' && storeProfile.customLogoUrl) {
      return (
        <img 
          src={storeProfile.customLogoUrl} 
          alt={storeProfile.name} 
          className="w-8 h-8 rounded-lg object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm">
        {storeProfile.name.slice(0, 2).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navigation */}
      <Navbar onOpenOnlineCart={() => setIsCartOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
        {activeTab === 'store' && (
          <StoreCatalog onOpenCart={() => setIsCartOpen(true)} />
        )}

        {activeTab === 'pos' && (
          <PosCashier onViewReceipt={(order) => setActiveReceiptOrder(order)} />
        )}

        {activeTab === 'transactions' && (
          <TransactionHistoryManager onOpenReceiptModal={(order) => setActiveReceiptOrder(order)} />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager />
        )}

        {activeTab === 'courier' && (
          <CourierTracker onViewReceipt={(order) => setActiveReceiptOrder(order)} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {activeTab === 'settings' && (
          <StoreSettingsManager />
        )}
      </main>

      {/* Modals & Overlays */}
      <StoreCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutPaymentModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        discount={checkoutDiscount}
        promoCode={checkoutPromoCode}
        onViewReceipt={(order) => setActiveReceiptOrder(order)}
      />

      <ReceiptModal
        isOpen={Boolean(activeReceiptOrder)}
        order={activeReceiptOrder}
        onClose={() => setActiveReceiptOrder(null)}
      />

      {/* Toast notifications */}
      <ToastContainer />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {renderFooterLogo()}
              <span className="font-extrabold text-base text-white">
                {storeProfile.namePrefix || storeProfile.name}
                <span className="text-emerald-400">{storeProfile.nameSuffix || ''}</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {storeProfile.description || 'Platform modern jualan sembako, sayur & buah segar online dengan pembayaran digital instan, pengiriman kurir otomatis, dan kasir POS terhubung stok real-time.'}
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Produk Halal, Segar & Higienis
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Modul Sistem Terintegrasi</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('store')} className="hover:text-emerald-400 cursor-pointer">
                  🛒 Toko Online Pelanggan
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('pos')} className="hover:text-emerald-400 cursor-pointer">
                  ⚡ Kasir POS Toko Fisik (Scan Barcode)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('transactions')} className="hover:text-emerald-400 cursor-pointer">
                  🧾 Riwayat Penjualan & Edit Struk
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('inventory')} className="hover:text-emerald-400 cursor-pointer">
                  📦 Manajemen Stok & Gudang Real-Time
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('courier')} className="hover:text-emerald-400 cursor-pointer">
                  🚚 Pelacakan Kurir Otomatis & Driver
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('analytics')} className="hover:text-emerald-400 cursor-pointer">
                  📊 Dashboard Laporan & Analitik Penjualan
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('settings')} className="hover:text-emerald-400 cursor-pointer text-emerald-400 font-semibold flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5" /> Pengaturan Toko, Logo & Struk
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Metode Pembayaran Digital</h4>
            <p className="text-[11px] leading-relaxed text-slate-400 mb-2">
              Mendukung integrasi pembayaran instan nasional:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">QRIS Dinamis</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">GoPay</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">OVO</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">DANA</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">ShopeePay</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">BCA VA</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">Mandiri VA</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">BRI VA</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs mb-3 uppercase tracking-wider">Pusat Distribusi & Kontak</h4>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>{storeProfile.address || 'Pasar Induk Fresh Hub Blok B No. 12-14'}</p>
              <p>{storeProfile.city || 'Jakarta Selatan, DKI Jakarta 12190'}</p>
              <p className="pt-2 text-white font-medium flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp CS: {storeProfile.phone || '0812-8899-7700'}
              </p>
              <p className="text-[11px] text-slate-500">Jam Buka: {storeProfile.openingHours || '06.00 - 21.00 WIB'}</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} {storeProfile.name || 'SegarMart'} Indonesia. Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1">
            <span>Sistem Kasir POS & Penjualan Lengkap dengan Cetak Struk dan Kurir Otomatis</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
