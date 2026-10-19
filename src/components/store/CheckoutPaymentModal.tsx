import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  CourierProvider, 
  PaymentMethod, 
  CustomerInfo, 
  Order 
} from '../../types';
import confetti from 'canvas-confetti';
import { 
  X, 
  Truck, 
  CreditCard, 
  QrCode, 
  Wallet, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  MapPin, 
  Phone, 
  User, 
  FileText,
  Navigation
} from 'lucide-react';

interface CheckoutPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: number;
  promoCode: string;
  onViewReceipt: (order: Order) => void;
}

export const CheckoutPaymentModal: React.FC<CheckoutPaymentModalProps> = ({
  isOpen,
  onClose,
  discount,
  promoCode,
  onViewReceipt
}) => {
  const { 
    onlineCart, 
    createOnlineOrder, 
    confirmDigitalPayment, 
    setActiveTab,
    setSelectedActiveOrder,
    storeProfile 
  } = useStore();

  // Step 1: 'shipping_and_payment' | Step 2: 'payment_in_progress' | Step 3: 'success'
  const [step, setStep] = useState<'checkout_form' | 'payment_gateway' | 'completed'>('checkout_form');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Form states
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: 'Ibu Ratna Dewi',
    phone: '0812-9843-1122',
    address: 'Jl. Melati Indah No. 42, RT 03/RW 05, Kebayoran Baru, Jakarta Selatan',
    notes: 'Pagar warna hitam, tolong titip di pos sekuriti jika sedang keluar',
  });

  const [selectedCourier, setSelectedCourier] = useState<CourierProvider>('gosend_instant');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('qris');
  const [copiedVA, setCopiedVA] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins
  const [isVerifying, setIsVerifying] = useState(false);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setStep('checkout_form');
      setCreatedOrder(null);
      setIsVerifying(false);
      setCountdownSeconds(900);
    }
  }, [isOpen]);

  // Countdown timer for QRIS
  useEffect(() => {
    if (step === 'payment_gateway' && countdownSeconds > 0) {
      const timer = setInterval(() => setCountdownSeconds(s => s - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdownSeconds]);

  if (!isOpen) return null;

  const subtotal = onlineCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const freeShipThreshold = storeProfile.freeShippingMinSpend || 100000;
  const isFreeShipEligible = subtotal >= freeShipThreshold;

  // Courier Rates
  const courierOptions: {
    id: CourierProvider;
    name: string;
    eta: string;
    fee: number;
    description: string;
    badge?: string;
  }[] = [
    {
      id: 'gosend_instant',
      name: 'GoSend Instant',
      eta: '1 - 2 Jam Tiba',
      fee: 15000,
      description: 'Driver langsung menjemput & mengantar belanjaan khusus pesanan Anda.',
      badge: 'Paling Cepat'
    },
    {
      id: 'grab_sameday',
      name: 'GrabExpress Sameday',
      eta: '3 - 6 Jam Tiba',
      fee: 10000,
      description: 'Pengantaran gabungan di hari yang sama dengan tarif hemat.',
      badge: 'Hemat'
    },
    {
      id: 'anteraja_fresh',
      name: 'Anteraja Fresh Cold',
      eta: 'Besok Pagi (08:00 WIB)',
      fee: 12000,
      description: 'Armada dilengkapi cooler box pendingin khusus sayur & daging.',
    },
    {
      id: 'kurir_toko',
      name: `Kurir ${storeProfile.name || 'Toko'} Internal`,
      eta: 'Jadwal Rute Toko',
      fee: isFreeShipEligible ? 0 : (storeProfile.baseCourierFee || 8000),
      description: `Kurir resmi karyawan toko ${storeProfile.name || 'SegarMart'} langsung.`,
      badge: isFreeShipEligible ? 'GRATIS ONGKIR' : undefined
    },
    {
      id: 'lalamove',
      name: 'Lalamove Delivery',
      eta: '1 - 2 Jam Tiba',
      fee: 14000,
      description: 'Armada mitra pengantaran cepat untuk pesanan sembako & sayur.',
    }
  ];

  const selectedCourierObj = courierOptions.find(c => c.id === selectedCourier) || courierOptions[0];
  const shippingFee = selectedCourierObj.fee;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  // Step 1 -> Create Order and Move to Payment Gateway
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert('Mohon lengkapi nama, nomor telepon, dan alamat pengiriman.');
      return;
    }

    const newOrder = createOnlineOrder({
      items: onlineCart,
      customer,
      courierProvider: selectedCourier,
      shippingFee,
      discount,
      paymentMethod: selectedPayment,
    });

    setCreatedOrder(newOrder);

    if (selectedPayment === 'cash') {
      // COD directly placed
      setStep('completed');
      triggerConfetti();
    } else {
      setStep('payment_gateway');
    }
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // Simulate payment confirmation callback (QRIS scan / E-Wallet push)
  const handleSimulatePaymentSuccess = () => {
    if (!createdOrder) return;
    setIsVerifying(true);
    setTimeout(() => {
      confirmDigitalPayment(createdOrder.id);
      setIsVerifying(false);
      setStep('completed');
      triggerConfetti();
    }, 1200);
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText('88081298431122');
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-bold text-base text-slate-800">
              {step === 'checkout_form' && 'Alamat & Metode Pengiriman Otomatis'}
              {step === 'payment_gateway' && 'Gerbang Pembayaran Digital'}
              {step === 'completed' && 'Pesanan Selesai Terverifikasi!'}
            </h2>
            <p className="text-xs text-slate-500">
              {step === 'checkout_form' && 'Pilih kurir instant/sameday & metode pembayaran digital'}
              {step === 'payment_gateway' && `No. Tagihan: ${createdOrder?.invoiceNumber}`}
              {step === 'completed' && 'Kurir otomatis ditugaskan untuk menjemput belanjaan Anda'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* STEP 1: CHECKOUT FORM */}
          {step === 'checkout_form' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              
              {/* Customer Delivery Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Alamat Pengiriman Belanjaan
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nama Penerima</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">No. WhatsApp / HP</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    required
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan lokasi..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Catatan Khusus untuk Kurir (Opsional)</label>
                  <input
                    type="text"
                    value={customer.notes}
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Contoh: Titip di satpam / Bell pintu pagar merah"
                  />
                </div>
              </div>

              {/* Courier Selection */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Pilihan Kurir Pengiriman Otomatis
                  </div>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ⚡ Auto-Dispatch Terkoneksi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {courierOptions.map((courier) => {
                    const isSelected = selectedCourier === courier.id;
                    return (
                      <div
                        key={courier.id}
                        onClick={() => setSelectedCourier(courier.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div>
                            <span className="font-bold text-xs text-slate-800">{courier.name}</span>
                            <span className="block text-[11px] text-emerald-700 font-semibold">{courier.eta}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-slate-900">
                              {courier.fee === 0 ? 'GRATIS' : `Rp ${courier.fee.toLocaleString('id-ID')}`}
                            </span>
                            {courier.badge && (
                              <span className="block text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                                {courier.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {courier.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Digital Payment Method Selector */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Metode Pembayaran Digital
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* QRIS */}
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('qris')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPayment === 'qris'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="text-xs block">QRIS</span>
                    <span className="text-[9px] text-emerald-600 font-semibold">Semua E-Wallet</span>
                  </button>

                  {/* GoPay / OVO */}
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('gopay')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPayment === 'gopay'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 mx-auto rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-1">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-xs block">GoPay / OVO</span>
                    <span className="text-[9px] text-slate-500">Auto Debit</span>
                  </button>

                  {/* Virtual Account */}
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('bca_va')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPayment === 'bca_va'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 mx-auto rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-1">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs block">Virtual Account</span>
                    <span className="text-[9px] text-slate-500">BCA/Mandiri/BRI</span>
                  </button>

                  {/* COD */}
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('cash')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedPayment === 'cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-7 h-7 mx-auto rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-1">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs block">COD</span>
                    <span className="text-[9px] text-slate-500">Bayar di Tempat</span>
                  </button>
                </div>
              </div>

              {/* Order Summary & Submit */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Belanja:</span>
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Voucher ({promoCode}):</span>
                    <span>-Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({selectedCourierObj.name}):</span>
                  <span>Rp {shippingFee.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Tagihan:</span>
                  <span className="text-emerald-700 text-base">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Konfirmasi & Lanjut Bayar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: DIGITAL PAYMENT GATEWAY (QRIS / E-WALLET / VA SIMULATOR) */}
          {step === 'payment_gateway' && createdOrder && (
            <div className="space-y-6 text-center max-w-md mx-auto">
              
              {/* Payment Info */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs flex items-center justify-between">
                <div className="text-left">
                  <span className="text-slate-500 block">Total Pembayaran Digital:</span>
                  <span className="text-lg font-extrabold text-emerald-800">
                    Rp {createdOrder.total.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Batas Waktu Bayar:</span>
                  <span className="font-mono font-bold text-rose-600 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {formatTimer(countdownSeconds)}
                  </span>
                </div>
              </div>

              {/* QRIS Display */}
              {createdOrder.paymentMethod === 'qris' && (
                <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-sm inline-block space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-black tracking-widest text-slate-800">QRIS</span>
                    <span className="text-[10px] text-slate-400">NMID: ID1020261018992</span>
                  </div>

                  {/* Dynamic Mock QR Code */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
                    <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                      {/* Stylized QR Code SVG Pattern */}
                      <path d="M0 0h30v30H0zM5 5h20v20H5zM10 10h10v10H10zM70 0h30v30H70zM75 5h20v20H75zM80 10h10v10H80zM0 70h30v30H0zM5 75h20v20H5zM10 80h10v10H10z" />
                      <rect x="40" y="5" width="20" height="8" rx="1" />
                      <rect x="35" y="18" width="10" height="15" rx="1" />
                      <rect x="50" y="20" width="15" height="8" rx="1" />
                      <rect x="40" y="35" width="20" height="20" rx="3" fill="#059669" />
                      <circle cx="50" cy="45" r="4" fill="#ffffff" />
                      <rect x="5" y="40" width="15" height="10" rx="1" />
                      <rect x="70" y="40" width="25" height="8" rx="1" />
                      <rect x="75" y="55" width="12" height="12" rx="1" />
                      <rect x="40" y="65" width="15" height="15" rx="1" />
                      <rect x="65" y="75" width="30" height="8" rx="1" />
                      <rect x="70" y="88" width="18" height="8" rx="1" />
                      <rect x="25" y="55" width="8" height="15" rx="1" />
                      <rect x="40" y="85" width="15" height="10" rx="1" />
                    </svg>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Buka GoPay, OVO, DANA, BCA Mobile, atau ShopeePay lalu scan QRIS di atas.
                  </p>
                </div>
              )}

              {/* Virtual Account Display */}
              {createdOrder.paymentMethod === 'bca_va' && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700">Nomor Virtual Account BCA:</span>
                    <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">
                      Verifikasi Otomatis
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-300">
                    <span className="font-mono text-base font-extrabold text-slate-800 tracking-wider">
                      8808 1298 4311 22
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyVA}
                      className="flex items-center gap-1 text-xs text-emerald-700 font-bold hover:text-emerald-800 cursor-pointer"
                    >
                      {copiedVA ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedVA ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Gunakan menu Transfer VA di m-BCA atau ATM BCA. Tagihan terverifikasi otomatis dalam detik.
                  </p>
                </div>
              )}

              {/* E-Wallet Direct Display */}
              {createdOrder.paymentMethod === 'gopay' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-left space-y-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-xs text-blue-900">E-Wallet GoPay / OVO Terkoneksi</h4>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Notifikasi pembayaran telah dikirim ke nomor <strong>{customer.phone}</strong>. Buka aplikasi e-wallet Anda untuk menyetujui transaksi.
                  </p>
                </div>
              )}

              {/* Interactive Instant Simulation Button (User Testing Delight) */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleSimulatePaymentSuccess}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isVerifying
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/30'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memverifikasi Pembayaran Real-Time...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>⚡ Simulasi Pembayaran Sukses (Uji Coba Otomatis)</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-slate-400">
                  Klik tombol di atas untuk mensimulasikan sistem callback pembayaran gateway dan mengaktifkan kurir secara otomatis.
                </p>
              </div>

            </div>
          )}

          {/* STEP 3: ORDER COMPLETED & COURIER ASSIGNED */}
          {step === 'completed' && createdOrder && (
            <div className="text-center py-4 space-y-5 max-w-md mx-auto">
              
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800">
                  Pesanan Berhasil & Terkonfirmasi!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tagihan No. <span className="font-mono font-bold text-slate-700">{createdOrder.invoiceNumber}</span>
                </p>
              </div>

              {/* Courier Dispatch Card */}
              {createdOrder.courier && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      Kurir Otomatis Ditugaskan
                    </span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {createdOrder.courier.providerName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={createdOrder.courier.driverAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt="Driver"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-xs text-slate-800">
                        {createdOrder.courier.driverName || 'Driver SegarMart'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {createdOrder.courier.driverVehicle || 'Honda Vario 160'} • <span className="font-mono font-bold text-slate-700">{createdOrder.courier.driverPlate || 'B 4821 TKD'}</span>
                      </p>
                      <p className="text-[10px] text-emerald-700 font-medium">
                        Estimasi tiba: ~{createdOrder.courier.estimatedMinutes || 20} menit
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setSelectedActiveOrder(createdOrder);
                    setActiveTab('courier');
                  }}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Lacak Pengiriman Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewReceipt(createdOrder);
                  }}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Lihat Struk / Invoice</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
