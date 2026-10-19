import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory, PaymentMethod, Order } from '../../types';
import { 
  Barcode, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  Printer, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Check, 
  RotateCcw,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Receipt
} from 'lucide-react';

interface PosCashierProps {
  onViewReceipt: (order: Order) => void;
}

export const PosCashier: React.FC<PosCashierProps> = ({ onViewReceipt }) => {
  const { 
    products, 
    posCart, 
    addToPosCart, 
    updatePosCartQuantity, 
    removeFromPosCart, 
    clearPosCart, 
    processPosSale,
    setActiveTab 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  
  // Checkout states
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [cashierName] = useState('Siti Rahma (Kasir 01)');

  // Filter products for fast cashier grid
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.barcode.includes(searchQuery);
    return matchCat && matchSearch;
  });

  const subtotal = posCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);
  const changeDue = Math.max(0, cashGiven - grandTotal);

  // Quick Barcode Scan Simulation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const found = products.find(p => p.barcode === barcodeInput.trim() || p.id === barcodeInput.trim());
    if (found) {
      addToPosCart(found, 1);
      setBarcodeInput('');
    } else {
      alert(`Barcode ${barcodeInput} tidak terdaftar di sistem inventaris SegarMart.`);
    }
  };

  // Quick handle cash denomination click
  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
  };

  const handleExactCash = () => {
    setCashGiven(grandTotal);
  };

  // Process POS checkout
  const handleCompleteSale = () => {
    if (posCart.length === 0) {
      alert('Keranjang kasir masih kosong.');
      return;
    }

    if (paymentMethod === 'cash' && cashGiven < grandTotal) {
      alert(`Uang tunai kurang! Total tagihan: Rp ${grandTotal.toLocaleString('id-ID')}, uang diterima: Rp ${cashGiven.toLocaleString('id-ID')}`);
      return;
    }

    const order = processPosSale({
      items: posCart,
      discount: discountAmount,
      paymentMethod,
      cashGiven: paymentMethod === 'cash' ? cashGiven : undefined,
      changeDue: paymentMethod === 'cash' ? changeDue : undefined,
      cashierName,
    });

    // Reset cashier form
    setDiscountAmount(0);
    setCashGiven(0);
    onViewReceipt(order);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-16">
      
      {/* LEFT COLUMN: Fast Product Grid & Barcode Scanner (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Top Control Bar: Barcode Scanner & Search */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Barcode scanner input simulator */}
            <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
              <Barcode className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan / ketik barcode (contoh: 8991001000101) lalu Enter"
                className="w-full pl-9 pr-20 py-2 text-xs font-mono rounded-xl border border-emerald-300 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 cursor-pointer"
              >
                Scan Barcode
              </button>
            </form>

            {/* Product text search */}
            <div className="relative sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama barang..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'sembako', label: 'Sembako' },
              { id: 'sayur', label: 'Sayuran' },
              { id: 'buah', label: 'Buah-buahan' },
              { id: 'bumbu', label: 'Bumbu' },
              { id: 'daging_telur', label: 'Daging/Telur' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cashier Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[640px] overflow-y-auto pr-1">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
            const inCart = posCart.find(i => i.product.id === product.id)?.quantity || 0;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToPosCart(product, 1)}
                className={`p-2.5 rounded-xl border text-left transition-all select-none relative flex flex-col justify-between ${
                  isOutOfStock
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    : inCart > 0
                    ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs cursor-pointer'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs cursor-pointer'
                }`}
              >
                {/* Image & Stock Badge */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span className={`absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    isOutOfStock 
                      ? 'bg-rose-600 text-white' 
                      : isLowStock 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-slate-900/80 text-white'
                  }`}>
                    Stok: {product.stock} {product.unit}
                  </span>

                  {inCart > 0 && (
                    <span className="absolute top-1 left-1 bg-emerald-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                      {inCart}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    #{product.barcode}
                  </span>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                </div>

                <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-700">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400">/{product.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: POS Register Tape & Payment Console (5 cols on lg) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
          
          {/* Register Top Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <div>
                <span className="font-bold text-xs">MESIN KASIR TOKO</span>
                <span className="block text-[10px] text-slate-400">{cashierName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                title="Buka daftar struk dan riwayat transaksi"
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Riwayat & Edit Struk</span>
              </button>

              {posCart.length > 0 && (
                <button
                  onClick={clearPosCart}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Bersihkan
                </button>
              )}
            </div>
          </div>

          {/* Cart Item Tape */}
          <div className="flex-1 overflow-y-auto max-h-[280px] p-3 space-y-2 divide-y divide-slate-100">
            {posCart.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold">Belum Ada Barang di Kasir</p>
                <p className="text-[11px] text-slate-400">
                  Pilih produk dari katalog atau scan barcode untuk menambahkan.
                </p>
              </div>
            ) : (
              posCart.map((item) => (
                <div key={item.product.id} className="pt-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 truncate">{item.product.name}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Rp {item.product.price.toLocaleString('id-ID')} × {item.quantity} {item.product.unit}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button
                      onClick={() => updatePosCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-2xs hover:bg-slate-200 cursor-pointer"
                    >
                      <Minus className="w-3 h-3 text-slate-700" />
                    </button>
                    <span className="font-bold px-1.5 text-xs text-slate-800">{item.quantity}</span>
                    <button
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => updatePosCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-5 h-5 flex items-center justify-center bg-white rounded shadow-2xs hover:bg-slate-200 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3 text-slate-700" />
                    </button>
                  </div>

                  {/* Item Subtotal */}
                  <span className="font-mono font-extrabold text-slate-900 w-20 text-right">
                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                  </span>

                  <button
                    onClick={() => removeFromPosCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Cashier Payment Details & Calculations */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            
            {/* Calculation summary */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({posCart.reduce((s, i) => s + i.quantity, 0)} item):</span>
                <span className="font-mono font-bold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Potongan Kasir:</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setDiscountAmount(0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${discountAmount === 0 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    0
                  </button>
                  <button 
                    onClick={() => setDiscountAmount(5000)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${discountAmount === 5000 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    5rb
                  </button>
                  <button 
                    onClick={() => setDiscountAmount(10000)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${discountAmount === 10000 ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}
                  >
                    10rb
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="font-extrabold text-sm text-slate-900">TOTAL BAYAR:</span>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  Rp {grandTotal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-3 gap-1.5 text-xs pt-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-[11px]">Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('qris');
                  setCashGiven(grandTotal);
                }}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  paymentMethod === 'qris'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-[11px]">QRIS Kasir</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('edc_card');
                  setCashGiven(grandTotal);
                }}
                className={`py-2 px-1 rounded-xl font-bold flex flex-col items-center gap-1 border transition-all cursor-pointer ${
                  paymentMethod === 'edc_card'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px]">Debit / EDC</span>
              </button>
            </div>

            {/* Cash & Change Calculator (if Tunai) */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2 pt-1 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Uang Diterima:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={cashGiven || ''}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      placeholder="0"
                      className="w-32 py-1 px-2 text-right font-mono font-bold text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>

                {/* Quick denomination chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={handleExactCash}
                    className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded hover:bg-emerald-200 cursor-pointer"
                  >
                    Uang Pas
                  </button>
                  {[20000, 50000, 100000, 150000, 200000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleQuickCash(amt)}
                      className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded hover:bg-slate-100 cursor-pointer"
                    >
                      {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>

                {/* Kembalian Banner */}
                <div className="bg-emerald-100/70 border border-emerald-300 p-2.5 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">KEMBALIAN:</span>
                  <span className="text-base font-black text-emerald-900 font-mono">
                    Rp {changeDue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* Submit & Print Struk */}
            <button
              onClick={handleCompleteSale}
              disabled={posCart.length === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                posCart.length === 0
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 shadow-emerald-600/30'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Bayar & Cetak Struk Kasir</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              *Stok gudang & toko online berkurang otomatis secara instan.
            </p>

          </div>
        </div>
      </div>

    </div>
  );
};
