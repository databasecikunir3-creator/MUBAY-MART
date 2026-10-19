import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, CourierStatus, CourierDriver, CourierProvider, VehicleType } from '../../types';
import { 
  Truck, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Navigation, 
  Sparkles, 
  Package, 
  User, 
  ShieldCheck,
  ChevronRight,
  Play,
  Plus,
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Star,
  X,
  Check,
  Car,
  Compass
} from 'lucide-react';

interface CourierTrackerProps {
  onViewReceipt: (order: Order) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
];

export const CourierTracker: React.FC<CourierTrackerProps> = ({ onViewReceipt }) => {
  const { 
    orders, 
    drivers,
    selectedActiveOrder, 
    setSelectedActiveOrder, 
    advanceCourierStatus,
    addCourierDriver,
    updateCourierDriver,
    deleteCourierDriver,
    assignDriverToOrder,
    addToast
  } = useStore();

  const [activeSubView, setActiveSubView] = useState<'tracking' | 'drivers'>('tracking');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('active');

  // Modals state
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<CourierDriver | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);

  // New Driver Form state
  const [newDriver, setNewDriver] = useState<{
    name: string;
    phone: string;
    vehicleType: VehicleType;
    vehicleName: string;
    plateNumber: string;
    provider: CourierProvider;
    providerName: string;
    avatar: string;
    deliveryZone: string;
  }>({
    name: '',
    phone: '',
    vehicleType: 'motor',
    vehicleName: 'Honda Vario 160',
    plateNumber: '',
    provider: 'kurir_toko',
    providerName: 'Kurir Internal SegarMart',
    avatar: PRESET_AVATARS[0],
    deliveryZone: 'Radius 5 KM Pasar',
  });

  // Filter courier online orders
  const courierOrders = orders.filter(o => o.channel === 'online' && o.courier);

  const displayedOrders = courierOrders.filter(o => {
    if (activeFilter === 'active') return o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled';
    if (activeFilter === 'completed') return o.orderStatus === 'completed';
    return true;
  });

  const currentOrder = selectedActiveOrder && selectedActiveOrder.courier
    ? selectedActiveOrder
    : displayedOrders[0] || courierOrders[0] || null;

  const currentCourier = currentOrder?.courier;

  // Courier progress step mapper
  const getStepIndex = (status?: CourierStatus) => {
    switch (status) {
      case 'unassigned': return 0;
      case 'driver_assigned': return 1;
      case 'picked_up': return 2;
      case 'on_the_way': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(currentCourier?.status);

  // Dynamic driver position along the map route (0 to 100%)
  const routePercentage = currentStep === 0 ? 5 :
                          currentStep === 1 ? 25 :
                          currentStep === 2 ? 40 :
                          currentStep === 3 ? 75 : 100;

  // Handle Add Courier Driver
  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone || !newDriver.plateNumber) {
      alert('Nama, nomor telepon, dan plat nomor kendaraan wajib diisi.');
      return;
    }

    addCourierDriver({
      ...newDriver,
      status: 'active',
      rating: 5.0,
      totalDeliveries: 0,
      joinDate: new Date().toISOString().slice(0, 10),
    });

    setIsAddDriverModalOpen(false);
    // Reset form
    setNewDriver({
      name: '',
      phone: '',
      vehicleType: 'motor',
      vehicleName: 'Honda Vario 160',
      plateNumber: '',
      provider: 'kurir_toko',
      providerName: 'Kurir Internal SegarMart',
      avatar: PRESET_AVATARS[0],
      deliveryZone: 'Radius 5 KM Pasar',
    });
  };

  // Helper for provider label
  const getProviderLabel = (prov: CourierProvider) => {
    switch (prov) {
      case 'kurir_toko': return 'Kurir Internal SegarMart';
      case 'gosend_instant': return 'GoSend Instant Mitra';
      case 'grab_sameday': return 'GrabExpress Mitra';
      case 'anteraja_fresh': return 'Anteraja Fresh Cold';
      case 'lalamove': return 'Lalamove Delivery';
      default: return 'Kurir Pengantaran';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header & Sub-view Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" />
            Pengiriman & Armada Kurir SegarMart
          </h1>
          <p className="text-xs text-slate-500">
            Kelola dan tambahkan kurir pengantaran, tugaskan driver ke pesanan, dan pantau pengiriman live.
          </p>
        </div>

        {/* View Switcher & Add Courier Action */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
            <button
              onClick={() => setActiveSubView('tracking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                activeSubView === 'tracking' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Live Tracking ({courierOrders.filter(o => o.orderStatus !== 'completed').length})</span>
            </button>

            <button
              onClick={() => setActiveSubView('drivers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                activeSubView === 'drivers' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Armada Kurir ({drivers.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddDriverModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Kurir</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FLEET DRIVERS MANAGEMENT */}
      {activeSubView === 'drivers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Daftar Armada Kurir Terdaftar</h3>
              <p className="text-xs text-slate-500">
                Total {drivers.length} kurir siap menjemput dan mengantar sembako, sayur & buah ke alamat pelanggan.
              </p>
            </div>
            
            <button
              onClick={() => setIsAddDriverModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Daftarkan Driver Baru
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => {
              const isAvailable = driver.status === 'active';
              const isBusy = driver.status === 'busy';

              return (
                <div
                  key={driver.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/30 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-800">{driver.name}</h4>
                          <span className="flex items-center text-[10px] font-bold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {driver.rating}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">{driver.phone}</p>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          {driver.providerName}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill Toggle */}
                    <button
                      onClick={() => {
                        const nextStatus = isAvailable ? 'off' : 'active';
                        updateCourierDriver({ ...driver, status: nextStatus });
                      }}
                      title="Klik untuk ubah status aktif/libur"
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isBusy
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {isAvailable ? '🟢 Siap Antar' : isBusy ? '🛵 Sedang Jalan' : '⚪ Libur/Off'}
                    </button>
                  </div>

                  {/* Vehicle details */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Armada:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        {driver.vehicleType === 'mobil_pickup' ? '🛻 Pickup' :
                         driver.vehicleType === 'mobil_blindvan' ? '🚐 Blindvan' :
                         driver.vehicleType === 'tossa_roda3' ? '🛵 Roda Tiga' : '🏍️ Sepeda Motor'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Kendaraan:</span>
                      <span className="font-medium text-slate-800">{driver.vehicleName}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Plat Nomor:</span>
                      <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {driver.plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 text-[11px]">
                      <span>Zona Antar:</span>
                      <span className="text-slate-500 truncate max-w-[150px]">{driver.deliveryZone}</span>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400">
                      {driver.totalDeliveries}x pengantaran
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const cleanPhone = driver.phone.replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/62${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`, '_blank');
                        }}
                        title="Chat WhatsApp Kurir"
                        className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEditingDriver(JSON.parse(JSON.stringify(driver)))}
                        title="Edit Data Kurir"
                        className="p-1.5 bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus kurir ${driver.name} dari sistem armada?`)) {
                            deleteCourierDriver(driver.id);
                          }
                        }}
                        title="Hapus Kurir"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE TRACKING & ORDERS DISPATCH */}
      {activeSubView === 'tracking' && (
        <>
          {/* Status Filter Row */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Menampilkan {displayedOrders.length} pesanan online aktif
            </span>

            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                  activeFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sedang Dikirim ({courierOrders.filter(o => o.orderStatus !== 'completed').length})
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                  activeFilter === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Selesai Diantar ({courierOrders.filter(o => o.orderStatus === 'completed').length})
              </button>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                  activeFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua ({courierOrders.length})
              </button>
            </div>
          </div>

          {courierOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">Belum Ada Pengiriman Berjalan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lakukan checkout di Toko Online untuk mengaktifkan pengiriman kurir otomatis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* LEFT: Orders List Sidebar (4 cols on lg) */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Daftar Pesanan Online ({displayedOrders.length})
                </h3>

                <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                  {displayedOrders.map((order) => {
                    const isSelected = currentOrder?.id === order.id;
                    const status = order.courier?.status;

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedActiveOrder(order)}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono font-bold text-xs text-slate-800">
                            {order.invoiceNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'on_the_way' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                            status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {status === 'delivered' ? 'Tiba di Lokasi' :
                             status === 'on_the_way' ? 'Sedang Diantar' :
                             status === 'picked_up' ? 'Paket Diambil' :
                             status === 'driver_assigned' ? 'Driver Ditugaskan' : 'Mencari Kurir'}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-800">
                          {order.customer?.name}
                        </div>

                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {order.customer?.address}
                        </div>

                        {/* Driver info & Re-assign button */}
                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                          <div>
                            <span className="text-emerald-700 font-bold block">
                              {order.courier?.driverName || 'Belum Ada Driver'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {order.courier?.providerName}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigningOrder(order);
                            }}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Ganti Kurir
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Live Interactive GPS Tracking Screen (8 cols on lg) */}
              {currentOrder && currentCourier ? (
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Interactive GPS Map Screen */}
                  <div className="bg-slate-900 rounded-3xl p-5 text-white relative overflow-hidden shadow-xl border border-slate-800 min-h-[380px] flex flex-col justify-between">
                    
                    {/* Map Grid / Vector Road Lines Simulation */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>

                    {/* Top Overlay: Courier & ETA Status */}
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-white">
                              {currentCourier.providerName}
                            </span>
                            <span className="bg-emerald-500/30 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/40">
                              {currentCourier.trackingNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            Layanan: {currentCourier.serviceType}
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Perkiraan Tiba</span>
                        <span className="text-emerald-400 font-black text-sm sm:text-base flex items-center sm:justify-end gap-1">
                          <Clock className="w-4 h-4 text-emerald-400" />
                          {currentCourier.status === 'delivered' ? 'Telah Terkirim' : `~${currentCourier.estimatedMinutes || 15} Menit Lagi`}
                        </span>
                      </div>
                    </div>

                    {/* Simulated Visual Route Curve & Moving Motor Driver */}
                    <div className="relative my-8 px-4 sm:px-8">
                      {/* Route Polyline Track */}
                      <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700"
                          style={{ width: `${routePercentage}%` }}
                        ></div>
                      </div>

                      {/* Waypoint 1: Toko SegarMart Gudang */}
                      <div className="absolute left-4 sm:left-8 -top-3.5 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 text-xs">
                          🏢
                        </div>
                        <span className="text-[10px] font-bold text-emerald-300 mt-1 whitespace-nowrap">
                          Toko SegarMart Pusat
                        </span>
                      </div>

                      {/* Moving Driver Marker */}
                      <div
                        className="absolute -top-6 transform -translate-x-1/2 transition-all duration-700 flex flex-col items-center"
                        style={{ left: `calc(${routePercentage}% - 0px)` }}
                      >
                        <div className="relative">
                          <div className="w-11 h-11 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-bold shadow-xl border-3 border-white animate-bounce">
                            🛵
                          </div>
                          <div className="absolute inset-0 rounded-full bg-emerald-400 animate-radar pointer-events-none"></div>
                        </div>
                        <span className="bg-slate-900/90 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-emerald-500/50 mt-1 whitespace-nowrap">
                          {currentCourier.driverName || 'Driver Kurir'}
                        </span>
                      </div>

                      {/* Waypoint 2: Alamat Tujuan Pembeli */}
                      <div className="absolute right-4 sm:right-8 -top-3.5 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-slate-900 text-xs">
                          🏠
                        </div>
                        <span className="text-[10px] font-bold text-rose-300 mt-1 whitespace-nowrap">
                          Alamat Pembeli
                        </span>
                      </div>
                    </div>

                    {/* Driver Details Card Bottom */}
                    <div className="relative z-10 bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <img
                          src={currentCourier.driverAvatar || PRESET_AVATARS[0]}
                          alt=""
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400/40 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs sm:text-sm text-white">
                              {currentCourier.driverName || 'Driver SegarMart'}
                            </h4>
                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                              ⭐ 4.9
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                            {currentCourier.driverVehicle} • <span className="text-white font-bold">{currentCourier.driverPlate}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {currentCourier.driverPhone}
                          </p>
                        </div>
                      </div>

                      {/* Driver Contact Actions & Receipt trigger */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => setAssigningOrder(currentOrder)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Ganti Kurir</span>
                        </button>

                        <button
                          onClick={() => addToast('Panggilan Driver', `Menghubungi ${currentCourier.driverName} (${currentCourier.driverPhone})...`, 'info')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Telepon</span>
                        </button>

                        <button
                          onClick={() => {
                            const cleanPhone = currentCourier.driverPhone?.replace(/[^0-9]/g, '') || '';
                            window.open(`https://wa.me/62${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`, '_blank');
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Status Progression Timeline & Interactive Simulation Step Controller */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">
                          Timeline Status Kurir Otomatis
                        </h4>
                        <p className="text-xs text-slate-500">
                          Pembaruan otomatis dari API kurir ekspedisi pengantaran
                        </p>
                      </div>

                      {/* Simulator button */}
                      {currentCourier.status !== 'delivered' && (
                        <button
                          onClick={() => advanceCourierStatus(currentOrder.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>⚡ Majukan Status Kurir (Simulasi Cepat)</span>
                        </button>
                      )}
                    </div>

                    {/* 5-Step Visual Stepper */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      {[
                        { label: 'Pesanan Masuk', icon: '📝', stepIdx: 0 },
                        { label: 'Driver Ditugaskan', icon: '🛵', stepIdx: 1 },
                        { label: 'Paket Diambil Toko', icon: '📦', stepIdx: 2 },
                        { label: 'Dalam Perjalanan', icon: '🚀', stepIdx: 3 },
                        { label: 'Pesanan Sampai', icon: '🏡', stepIdx: 4 },
                      ].map((s) => {
                        const isDone = currentStep >= s.stepIdx;
                        const isCurrent = currentStep === s.stepIdx;

                        return (
                          <div
                            key={s.stepIdx}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                              isCurrent
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                                : isDone
                                ? 'border-emerald-300 bg-emerald-50/50 text-emerald-800 font-medium'
                                : 'border-slate-200 bg-slate-50 text-slate-400'
                            }`}
                          >
                            <span className="text-base">{s.icon}</span>
                            <span className="text-[11px] leading-tight">{s.label}</span>
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Status Logs History */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 max-h-48 overflow-y-auto text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Riwayat Log Ekspedisi
                      </span>
                      {currentCourier.statusLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                          <div className="flex-1">
                            <span className="font-semibold text-slate-800">{log.note}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {new Date(log.timestamp).toLocaleTimeString('id-ID')} WIB
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              ) : null}

            </div>
          )}
        </>
      )}

      {/* MODAL 1: TAMBAH KURIR PENGANTARAN BARU */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 border border-slate-200 shadow-2xl my-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Tambah Kurir Pengantaran Baru</h3>
                  <p className="text-[11px] text-slate-500">Daftarkan driver internal toko atau mitra ekspedisi pengantaran</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddDriverModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Nama Lengkap Driver</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">No. WhatsApp / Telepon</label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-3456-7890"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Jenis Armada Kendaraan</label>
                  <select
                    value={newDriver.vehicleType}
                    onChange={(e) => {
                      const vType = e.target.value as VehicleType;
                      let defaultVeh = 'Honda Vario 160';
                      if (vType === 'mobil_pickup') defaultVeh = 'Gran Max Pickup';
                      if (vType === 'mobil_blindvan') defaultVeh = 'Blindvan Box';
                      if (vType === 'tossa_roda3') defaultVeh = 'Motor Roda 3 Viar/Tossa';
                      setNewDriver({ ...newDriver, vehicleType: vType, vehicleName: defaultVeh });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="motor">🏍️ Sepeda Motor</option>
                    <option value="tossa_roda3">🛵 Motor Roda 3 (Tossa/Viar)</option>
                    <option value="mobil_blindvan">🚐 Mobil Blindvan</option>
                    <option value="mobil_pickup">🛻 Mobil Pickup Terbuka</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Model & Warna Kendaraan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Yamaha Aerox Hitam"
                    value={newDriver.vehicleName}
                    onChange={(e) => setNewDriver({ ...newDriver, vehicleName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Plat Nomor Kendaraan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 4920 SXR"
                    value={newDriver.plateNumber}
                    onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Kategori / Ekspedisi</label>
                  <select
                    value={newDriver.provider}
                    onChange={(e) => {
                      const prov = e.target.value as CourierProvider;
                      setNewDriver({
                        ...newDriver,
                        provider: prov,
                        providerName: getProviderLabel(prov)
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="kurir_toko">Kurir Internal Toko SegarMart</option>
                    <option value="gosend_instant">GoSend Instant Mitra</option>
                    <option value="grab_sameday">GrabExpress Mitra</option>
                    <option value="anteraja_fresh">Anteraja Fresh Cold</option>
                    <option value="lalamove">Lalamove Delivery</option>
                    <option value="kurir_langganan">Kurir Langganan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Zona / Area Pengantaran Utama</label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta Selatan, Depok & Radius 10 KM"
                  value={newDriver.deliveryZone}
                  onChange={(e) => setNewDriver({ ...newDriver, deliveryZone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* Preset Avatar Picker */}
              <div>
                <label className="block font-medium text-slate-600 mb-1.5">Pilih Foto Profil Driver</label>
                <div className="flex items-center gap-2.5">
                  {PRESET_AVATARS.map((ava, idx) => (
                    <img
                      key={idx}
                      src={ava}
                      alt=""
                      onClick={() => setNewDriver({ ...newDriver, avatar: ava })}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                        newDriver.avatar === ava ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Daftarkan Kurir Sekarang
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KURIR DRIVER */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl my-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Edit Data Kurir: {editingDriver.name}</h3>
                  <p className="text-xs text-slate-500">Perbarui kontak, kendaraan, zona, dan status kurir</p>
                </div>
              </div>

              <button
                onClick={() => setEditingDriver(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingDriver.name || !editingDriver.phone || !editingDriver.plateNumber) {
                alert('Nama, telepon, dan plat nomor wajib diisi.');
                return;
              }
              updateCourierDriver(editingDriver);
              setEditingDriver(null);
            }} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Nama Lengkap Kurir</label>
                  <input
                    type="text"
                    required
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    required
                    value={editingDriver.phone}
                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Jenis Armada Kendaraan</label>
                  <select
                    value={editingDriver.vehicleType}
                    onChange={(e) => setEditingDriver({ ...editingDriver, vehicleType: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="motor">🏍️ Sepeda Motor</option>
                    <option value="tossa_roda3">🛵 Motor Roda 3 (Tossa/Viar)</option>
                    <option value="mobil_blindvan">🚐 Mobil Blindvan</option>
                    <option value="mobil_pickup">🛻 Mobil Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Model & Nama Kendaraan</label>
                  <input
                    type="text"
                    required
                    value={editingDriver.vehicleName}
                    onChange={(e) => setEditingDriver({ ...editingDriver, vehicleName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Plat Nomor Kendaraan</label>
                  <input
                    type="text"
                    required
                    value={editingDriver.plateNumber}
                    onChange={(e) => setEditingDriver({ ...editingDriver, plateNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Status Kesiapan</label>
                  <select
                    value={editingDriver.status}
                    onChange={(e) => setEditingDriver({ ...editingDriver, status: e.target.value as 'active' | 'busy' | 'off' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="active">🟢 Siap Antar (Aktif)</option>
                    <option value="busy">🛵 Sedang Jalan (Sibuk)</option>
                    <option value="off">⚪ Libur / Tidak Bertugas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Zona / Area Pengantaran</label>
                <input
                  type="text"
                  value={editingDriver.deliveryZone}
                  onChange={(e) => setEditingDriver({ ...editingDriver, deliveryZone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1.5">Pilih Foto Profil Driver</label>
                <div className="flex items-center gap-2">
                  {PRESET_AVATARS.map((ava, idx) => (
                    <img
                      key={idx}
                      src={ava}
                      alt=""
                      onClick={() => setEditingDriver({ ...editingDriver, avatar: ava })}
                      className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                        editingDriver.avatar === ava ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingDriver(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Simpan Perubahan Kurir
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TUGASKAN / GANTI KURIR PADA PESANAN */}
      {assigningOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 border border-slate-200 shadow-2xl my-auto">
            
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Tugaskan Kurir untuk Pesanan #{assigningOrder.invoiceNumber}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Tujuan: {assigningOrder.customer?.name} ({assigningOrder.customer?.address})
                </p>
              </div>

              <button
                onClick={() => setAssigningOrder(null)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 text-xs">
              {drivers.map((driver) => {
                const isCurrentDriver = assigningOrder.courier?.driverId === driver.id || assigningOrder.courier?.driverName === driver.name;

                return (
                  <div
                    key={driver.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isCurrentDriver
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={driver.avatar}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-slate-800">{driver.name}</h5>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            driver.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {driver.status === 'active' ? 'Tersedia' : 'Sedang Mengantar'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {driver.vehicleName} • <span className="font-mono font-bold">{driver.plateNumber}</span>
                        </p>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          {driver.providerName}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        assignDriverToOrder(assigningOrder.id, driver.id);
                        setAssigningOrder(null);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrentDriver
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                      }`}
                    >
                      {isCurrentDriver ? '✓ Kurir Terpilih' : 'Tugaskan'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
