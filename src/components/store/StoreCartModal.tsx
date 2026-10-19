import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

interface StoreCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (appliedDiscount: number, promoCode: string) => void;
}

export const StoreCartModal: React.FC<StoreCartModalProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { 
    onlineCart, 
    updateOnlineCartQuantity, 
    removeFromOnlineCart, 
    clearOnlineCart,
    storeProfile 
  } = useStore();

  const defaultPromo = storeProfile.defaultPromoCode || 'SEGARHEMAT';
  const defaultDiscount = storeProfile.defaultPromoDiscount || 10000;

  const [promoCodeInput, setPromoCodeInput] = useState(defaultPromo);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>({
    code: defaultPromo,
    discount: defaultDiscount,
  });
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const subtotal = onlineCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const freeShippingThreshold = storeProfile.freeShippingMinSpend || 100000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (code === defaultPromo) {
      if (subtotal < 30000) {
        setPromoError(`Voucher ${defaultPromo} berlaku untuk belanja minimal Rp 30.000`);
        setAppliedPromo(null);
      } else {
        setAppliedPromo({ code: defaultPromo, discount: defaultDiscount });
        setPromoError('');
      }
    } else if (code === 'PASARSEGAR') {
      setAppliedPromo({ code: 'PASARSEGAR', discount: 5000 });
      setPromoError('');
    } else {
      setPromoError('Kode promo tidak valid atau kadaluarsa');
      setAppliedPromo(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-base text-slate-800">Keranjang Belanja Segar</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {onlineCart.reduce((sum, i) => sum + i.quantity, 0)} item
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free shipping threshold progress bar */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              {remainingForFreeShip > 0
                ? `Belanja Rp ${remainingForFreeShip.toLocaleString('id-ID')} lagi untuk GRATIS ONGKIR!`
                : '🎉 Selamat! Anda Mendapatkan Subsidi Ongkir Toko!'}
            </span>
            <span className="text-[11px] font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-emerald-200/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {onlineCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-700 text-sm">Keranjang Anda Masih Kosong</p>
              <p className="text-xs text-slate-500 mt-1">
                Yuk pilih sayur, buah segar, atau sembako murah untuk kebutuhan dapur hari ini!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-emerald-700"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            onlineCart.map((item) => (
              <div key={item.product.id} className="pt-3 flex gap-3 items-center">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-slate-800 truncate" title={item.product.name}>
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                    Rp {item.product.price.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">/{item.product.unit}</span>
                  </p>

                  {/* Quantity Controller */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        onClick={() => updateOnlineCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-white rounded text-slate-600 hover:text-emerald-700 cursor-pointer shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1 text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateOnlineCartQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className={`w-6 h-6 flex items-center justify-center rounded shadow-xs ${
                          item.quantity >= item.product.stock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-white text-slate-600 hover:text-emerald-700 cursor-pointer'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-800">
                        Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromOnlineCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Hapus barang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer calculation & Voucher */}
        {onlineCart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            
            {/* Promo voucher box */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Kode promo (SEGARHEMAT)"
                    className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-300 uppercase font-mono font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
              {promoError && <p className="text-[11px] text-rose-600 mt-1 font-medium">{promoError}</p>}
              {appliedPromo && (
                <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                  ✓ Voucher {appliedPromo.code} aktif: Hemat Rp {appliedPromo.discount.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Calculations breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal ({onlineCart.reduce((s, i) => s + i.quantity, 0)} item):</span>
                <span className="font-semibold text-slate-800">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Diskon Promo:</span>
                  <span>-Rp {appliedPromo.discount.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Ongkos Kirim:</span>
                <span>Dihitung di langkah checkout kurir</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Perkiraan Total:</span>
                <span className="text-emerald-700 text-base">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Proceed to checkout button */}
            <button
              onClick={() => {
                onProceedToCheckout(discountAmount, appliedPromo?.code || '');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Lanjut ke Kurir & Pembayaran</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
