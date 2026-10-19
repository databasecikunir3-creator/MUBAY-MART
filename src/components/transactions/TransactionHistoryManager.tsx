import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, CartItem, PaymentMethod, PaymentStatus, OrderChannel, ReceiptSettings } from '../../types';
import { 
  Receipt, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Plus, 
  Minus, 
  Save, 
  X, 
  ShoppingBag, 
  Store, 
  Clock, 
  DollarSign, 
  Smartphone, 
  FileText,
  Settings,
  ArrowRight
} from 'lucide-react';

interface TransactionHistoryManagerProps {
  onOpenReceiptModal: (order: Order) => void;
}

export const TransactionHistoryManager: React.FC<TransactionHistoryManagerProps> = ({
  onOpenReceiptModal,
}) => {
  const { 
    orders, 
    products, 
    drivers,
    updateOrder, 
    deleteOrder, 
    receiptSettings, 
    updateReceiptSettings,
    addToast 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | OrderChannel>('all');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchChannel = channelFilter === 'all' || order.channel === channelFilter;
    const matchSearch = 
      order.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer?.name && order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.cashierName && order.cashierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.items.some(item => item.product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchChannel && matchSearch;
  });

  // Calculate quick metrics for the transactions
  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalPosOrders = orders.filter(o => o.channel === 'pos_kasir').length;
  const totalOnlineOrders = orders.filter(o => o.channel === 'online').length;

  // Start editing a transaction receipt
  const handleStartEdit = (order: Order) => {
    // Clone order for editing
    setEditingOrder(JSON.parse(JSON.stringify(order)));
  };

  // Recalculate totals for the currently edited order
  const recalculateEditedOrder = (order: Order): Order => {
    const subtotal = order.items.reduce((sum, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    const total = Math.max(0, subtotal - (order.discount || 0) + (order.shippingFee || 0));
    const changeDue = order.cashGiven !== undefined && order.cashGiven > 0
      ? Math.max(0, order.cashGiven - total)
      : undefined;

    return {
      ...order,
      subtotal,
      total,
      changeDue,
    };
  };

  // Update item quantity in edited order
  const handleItemQtyChange = (productId: string, delta: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items
      .map((item) => {
        if (item.product.id === productId) {
          const nextQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    const updated = recalculateEditedOrder({
      ...editingOrder,
      items: updatedItems,
    });
    setEditingOrder(updated);
  };

  // Update item custom price
  const handleItemPriceChange = (productId: string, newPrice: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.map((item) => {
      if (item.product.id === productId) {
        return { ...item, customPrice: Math.max(0, newPrice) };
      }
      return item;
    });

    const updated = recalculateEditedOrder({
      ...editingOrder,
      items: updatedItems,
    });
    setEditingOrder(updated);
  };

  // Add an item from catalog to the edited order
  const handleAddItemToEditingOrder = (productId: string) => {
    if (!editingOrder) return;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const existingIndex = editingOrder.items.findIndex(i => i.product.id === productId);
    let updatedItems = [...editingOrder.items];

    if (existingIndex >= 0) {
      updatedItems[existingIndex].quantity += 1;
    } else {
      updatedItems.push({ product: prod, quantity: 1, customPrice: prod.price });
    }

    const updated = recalculateEditedOrder({
      ...editingOrder,
      items: updatedItems,
    });
    setEditingOrder(updated);
  };

  // Save changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    if (editingOrder.items.length === 0) {
      alert('Struk harus memiliki minimal 1 barang.');
      return;
    }

    updateOrder(editingOrder);
    setEditingOrder(null);
  };

  // Share formatted receipt text to WhatsApp
  const handleShareToWhatsApp = (order: Order) => {
    const lines = [
      `*${receiptSettings.storeName}*`,
      `${receiptSettings.storeTagline}`,
      `${receiptSettings.storeAddress}`,
      `Telp: ${receiptSettings.storePhone}`,
      `--------------------------------`,
      `No. Nota: ${order.invoiceNumber}`,
      `Waktu: ${new Date(order.createdAt).toLocaleString('id-ID')}`,
      `Kanal: ${order.channel === 'pos_kasir' ? 'Kasir Toko' : 'Order Online'}`,
      order.cashierName ? `Kasir: ${order.cashierName}` : '',
      order.customer ? `Pelanggan: ${order.customer.name}` : '',
      `--------------------------------`,
      ...order.items.map(i => {
        const p = i.customPrice !== undefined ? i.customPrice : i.product.price;
        return `${i.product.name}\n  ${i.quantity} ${i.product.unit} x Rp ${p.toLocaleString('id-ID')} = Rp ${(i.quantity * p).toLocaleString('id-ID')}`;
      }),
      `--------------------------------`,
      `Subtotal: Rp ${order.subtotal.toLocaleString('id-ID')}`,
      order.discount > 0 ? `Diskon: -Rp ${order.discount.toLocaleString('id-ID')}` : '',
      order.shippingFee > 0 ? `Ongkir: Rp ${order.shippingFee.toLocaleString('id-ID')}` : '',
      `*TOTAL: Rp ${order.total.toLocaleString('id-ID')}*`,
      `Metode Bayar: ${order.paymentMethod.toUpperCase()}`,
      order.cashGiven ? `Tunai Diterima: Rp ${order.cashGiven.toLocaleString('id-ID')}` : '',
      order.changeDue ? `Kembalian: Rp ${order.changeDue.toLocaleString('id-ID')}` : '',
      `--------------------------------`,
      `${receiptSettings.footerMessage}`,
      `Terima kasih!`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    const phone = order.customer?.phone?.replace(/[^0-9]/g, '') || '';
    const url = phone ? `https://wa.me/62${phone.startsWith('0') ? phone.slice(1) : phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Copy receipt text to clipboard
  const handleCopyReceiptText = (order: Order) => {
    const lines = [
      `${receiptSettings.storeName}`,
      `${receiptSettings.storeAddress}`,
      `No: ${order.invoiceNumber}`,
      `Waktu: ${new Date(order.createdAt).toLocaleString('id-ID')}`,
      `Items:`,
      ...order.items.map(i => {
        const p = i.customPrice !== undefined ? i.customPrice : i.product.price;
        return `- ${i.product.name} (${i.quantity} ${i.product.unit}) = Rp ${(i.quantity * p).toLocaleString('id-ID')}`;
      }),
      `TOTAL: Rp ${order.total.toLocaleString('id-ID')}`,
      `Terima kasih telah berbelanja di SegarMart!`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedInvoiceId(order.id);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
    addToast('Teks Nota Disalin', 'Rincian struk telah disalin ke clipboard.', 'info');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            Riwayat Penjualan & Manajemen Struk
          </h1>
          <p className="text-xs text-slate-500">
            Daftar lengkap transaksi penjualan Kasir POS & Online. Struk dapat diedit, dicetak ulang, atau dikirim via WhatsApp.
          </p>
        </div>

        {/* Quick Header Stats */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Omzet:</span>
            <span className="font-mono font-bold text-emerald-700">Rp {totalSales.toLocaleString('id-ID')}</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{orders.length} Transaksi</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no nota (INV/POS), nama pembeli, kasir..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Channel Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setChannelFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors ${
              channelFilter === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({orders.length})
          </button>

          <button
            onClick={() => setChannelFilter('pos_kasir')}
            className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              channelFilter === 'pos_kasir'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Kasir POS ({totalPosOrders})</span>
          </button>

          <button
            onClick={() => setChannelFilter('online')}
            className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              channelFilter === 'online'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Toko Online ({totalOnlineOrders})</span>
          </button>
        </div>

      </div>

      {/* Main Content Area: Table of Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h4 className="font-bold text-sm text-slate-700">Tidak Ada Transaksi Ditemukan</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Coba sesuaikan kata kunci pencarian atau lakukan penjualan baru di POS/Toko Online.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Nota & Waktu</th>
                  <th className="py-3 px-3">Kanal & Kasir/Kurir</th>
                  <th className="py-3 px-3">Pelanggan</th>
                  <th className="py-3 px-3">Item Belanja</th>
                  <th className="py-3 px-3">Metode Bayar</th>
                  <th className="py-3 px-3 text-right">Total Tagihan</th>
                  <th className="py-3 px-4 text-center">Aksi Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isPos = order.channel === 'pos_kasir';
                  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice & Time */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-extrabold text-slate-900 block">
                          {order.invoiceNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Channel & Staff */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPos ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isPos ? '⚡ Kasir POS' : '🛒 Toko Online'}
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-1 truncate max-w-[130px]">
                          {isPos ? (order.cashierName || 'Kasir') : (order.courier?.providerName || 'Kurir')}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {order.customer?.name || (isPos ? 'Pelanggan Umum (Walk-in)' : 'Pelanggan Online')}
                        </div>
                        {order.customer?.phone && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {order.customer.phone}
                          </span>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 font-medium">
                          {totalItems} item
                        </div>
                        <div className="text-[10px] text-slate-400 line-clamp-1 max-w-[160px]" title={order.items.map(i => i.product.name).join(', ')}>
                          {order.items.map(i => `${i.product.name} (${i.quantity})`).join(', ')}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-3">
                        <span className="uppercase font-bold text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {order.paymentMethod.replace('_', ' ')}
                        </span>
                        <span className={`block text-[10px] font-semibold mt-0.5 ${
                          order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-600'
                        }`}>
                          {order.paymentStatus === 'paid' ? '● Lunas' : '○ Menunggu'}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-black text-sm text-emerald-800">
                          Rp {order.total.toLocaleString('id-ID')}
                        </div>
                        {order.discount > 0 && (
                          <span className="text-[10px] text-slate-400 block">
                            Hemat: Rp {order.discount.toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Receipt */}
                          <button
                            onClick={() => onOpenReceiptModal(order)}
                            title="Cetak Struk Transaksi"
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                          </button>

                          {/* Edit Receipt */}
                          <button
                            onClick={() => handleStartEdit(order)}
                            title="Edit Struk & Transaksi Ini"
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Share WA */}
                          <button
                            onClick={() => handleShareToWhatsApp(order)}
                            title="Kirim Struk via WhatsApp"
                            className="p-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg cursor-pointer transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Text */}
                          <button
                            onClick={() => handleCopyReceiptText(order)}
                            title="Salin Teks Nota"
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                          >
                            {copiedInvoiceId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus transaksi ${order.invoiceNumber} secara permanen?`)) {
                                deleteOrder(order.id);
                              }
                            }}
                            title="Hapus Transaksi"
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
        )}
      </div>

      {/* FULL MODAL / DRAWER: EDIT STRUK & TRANSAKSI */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            {/* Modal Top Bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Edit Struk & Rincian Transaksi: <span className="font-mono text-emerald-400">{editingOrder.invoiceNumber}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Perubahan item, harga, diskon, nama kasir, dan identitas toko akan langsung terupdate di struk cetak
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Left form, Right live receipt preview */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: Editing Fields (7 cols) */}
              <form onSubmit={handleSaveEdit} className="md:col-span-7 space-y-4 text-xs">
                
                {/* Meta details */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                    1. Informasi Dasar Nota
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Nomor Nota / Invoice</label>
                      <input
                        type="text"
                        value={editingOrder.invoiceNumber}
                        onChange={(e) => setEditingOrder({ ...editingOrder, invoiceNumber: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Nama Kasir</label>
                      <input
                        type="text"
                        value={editingOrder.cashierName || ''}
                        onChange={(e) => setEditingOrder({ ...editingOrder, cashierName: e.target.value })}
                        placeholder="Nama Kasir Petugas"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Nama Pelanggan</label>
                      <input
                        type="text"
                        value={editingOrder.customer?.name || ''}
                        onChange={(e) => setEditingOrder({
                          ...editingOrder,
                          customer: {
                            name: e.target.value,
                            phone: editingOrder.customer?.phone || '',
                            address: editingOrder.customer?.address || '',
                          }
                        })}
                        placeholder="Pelanggan Umum"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">No. Telepon / WhatsApp</label>
                      <input
                        type="text"
                        value={editingOrder.customer?.phone || ''}
                        onChange={(e) => setEditingOrder({
                          ...editingOrder,
                          customer: {
                            name: editingOrder.customer?.name || '',
                            phone: e.target.value,
                            address: editingOrder.customer?.address || '',
                          }
                        })}
                        placeholder="0812-xxxx-xxxx"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Kurir Pengantaran */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Kurir Pengantaran</label>
                    <select
                      value={editingOrder.courier?.driverId || ''}
                      onChange={(e) => {
                        const chosen = drivers.find(d => d.id === e.target.value);
                        if (chosen) {
                          setEditingOrder({
                            ...editingOrder,
                            courier: {
                              ...(editingOrder.courier || {
                                provider: chosen.provider,
                                providerName: chosen.providerName,
                                serviceType: 'Pengantaran Khusus',
                                trackingNumber: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
                                shippingFee: 10000,
                                status: 'driver_assigned',
                                statusLogs: [],
                              }),
                              driverId: chosen.id,
                              driverName: chosen.name,
                              driverPhone: chosen.phone,
                              driverPlate: chosen.plateNumber,
                              driverVehicle: chosen.vehicleName,
                              driverAvatar: chosen.avatar,
                              provider: chosen.provider,
                              providerName: chosen.providerName,
                              status: 'driver_assigned',
                            }
                          });
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium"
                    >
                      <option value="">{editingOrder.courier?.driverName ? `${editingOrder.courier.driverName} (${editingOrder.courier.providerName})` : '-- Pilih Kurir Armada --'}</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>
                          🛵 {d.name} ({d.vehicleName} - {d.plateNumber}) • {d.providerName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items in the receipt */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      2. Daftar Barang Belanja di Struk ({editingOrder.items.length})
                    </span>
                    
                    {/* Add Item Select */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddItemToEditingOrder(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg px-2 py-1 cursor-pointer"
                    >
                      <option value="">+ Tambah Produk Lain</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          + {p.name} (Rp {p.price.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {editingOrder.items.map((item) => {
                      const currentPrice = item.customPrice !== undefined ? item.customPrice : item.product.price;

                      return (
                        <div key={item.product.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-slate-800 truncate">{item.product.name}</h5>
                            <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                              <span className="text-slate-400">Harga: Rp</span>
                              <input
                                type="number"
                                value={currentPrice}
                                onChange={(e) => handleItemPriceChange(item.product.id, Number(e.target.value))}
                                className="w-20 px-1.5 py-0.5 border border-slate-300 rounded text-right font-mono font-bold"
                              />
                              <span className="text-slate-400">/{item.product.unit}</span>
                            </div>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(item.product.id, -1)}
                              className="w-5 h-5 flex items-center justify-center bg-white rounded hover:bg-slate-200 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-bold px-1.5 font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleItemQtyChange(item.product.id, 1)}
                              className="w-5 h-5 flex items-center justify-center bg-white rounded hover:bg-slate-200 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right font-mono font-bold text-slate-800 w-20">
                            Rp {(currentPrice * item.quantity).toLocaleString('id-ID')}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleItemQtyChange(item.product.id, -item.quantity)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Discounts, Shipping & Payment adjustments */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                    3. Penyesuaian Diskon, Ongkir & Metode Bayar
                  </span>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Potongan Diskon (Rp)</label>
                      <input
                        type="number"
                        value={editingOrder.discount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingOrder(recalculateEditedOrder({ ...editingOrder, discount: val }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Ongkos Kirim (Rp)</label>
                      <input
                        type="number"
                        value={editingOrder.shippingFee}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditingOrder(recalculateEditedOrder({ ...editingOrder, shippingFee: val }));
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Metode Pembayaran</label>
                      <select
                        value={editingOrder.paymentMethod}
                        onChange={(e) => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value as any })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="cash">Tunai (Cash)</option>
                        <option value="qris">QRIS Dinamis</option>
                        <option value="gopay">GoPay / E-Wallet</option>
                        <option value="bca_va">Transfer Virtual Account</option>
                        <option value="edc_card">Debit / Kartu EDC</option>
                      </select>
                    </div>
                  </div>

                  {/* Cash Given & Change */}
                  {editingOrder.paymentMethod === 'cash' && (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <div>
                        <label className="block text-slate-600 mb-1 font-medium">Uang Tunai Diterima (Rp)</label>
                        <input
                          type="number"
                          value={editingOrder.cashGiven || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setEditingOrder(recalculateEditedOrder({ ...editingOrder, cashGiven: val }));
                          }}
                          placeholder="Nominal uang pembeli"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1 font-medium">Uang Kembalian (Rp)</label>
                        <div className="px-2.5 py-1.5 bg-emerald-100 text-emerald-900 rounded-lg font-mono font-bold">
                          Rp {(editingOrder.changeDue || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Catatan Tambahan di Kaki Struk */}
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Catatan Khusus di Struk Ini (Opsional)</label>
                    <input
                      type="text"
                      value={editingOrder.receiptNotes || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, receiptNotes: e.target.value })}
                      placeholder="Contoh: Pesanan titip tetangga / Sudah diperiksa petugas"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Struk</span>
                  </button>
                </div>
              </form>

              {/* RIGHT COLUMN: Live Interactive Thermal Receipt Preview (5 cols) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Pratinjau Hasil Struk Cetak (Live)
                </span>

                <div className="bg-white p-5 rounded-2xl shadow-md border-2 border-slate-300 w-full max-w-[320px] font-mono text-[11px] text-slate-800 space-y-2.5">
                  {/* Store Header */}
                  <div className="text-center pb-2 border-b border-dashed border-slate-300 space-y-0.5">
                    <div className="font-black text-sm tracking-wide text-slate-900">
                      {receiptSettings.storeName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {receiptSettings.storeTagline}
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {receiptSettings.storeAddress} • Telp: {receiptSettings.storePhone}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-slate-300">
                    <div className="flex justify-between">
                      <span>No. Nota:</span>
                      <span className="font-bold">{editingOrder.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu:</span>
                      <span>{new Date(editingOrder.createdAt).toLocaleTimeString('id-ID')} WIB</span>
                    </div>
                    {editingOrder.cashierName && (
                      <div className="flex justify-between">
                        <span>Kasir:</span>
                        <span>{editingOrder.cashierName}</span>
                      </div>
                    )}
                    {editingOrder.customer?.name && (
                      <div className="flex justify-between">
                        <span>Pelanggan:</span>
                        <span>{editingOrder.customer.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Item Rows */}
                  <div className="space-y-1 pb-2 border-b border-dashed border-slate-300">
                    {editingOrder.items.map((i, idx) => {
                      const price = i.customPrice !== undefined ? i.customPrice : i.product.price;
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-bold truncate">{i.product.name}</div>
                          <div className="flex justify-between text-slate-500 text-[10px]">
                            <span>{i.quantity} {i.product.unit} × Rp {price.toLocaleString('id-ID')}</span>
                            <span className="font-bold text-slate-800">Rp {(i.quantity * price).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-slate-300">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp {editingOrder.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {editingOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Diskon:</span>
                        <span>-Rp {editingOrder.discount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {editingOrder.shippingFee > 0 && (
                      <div className="flex justify-between">
                        <span>Ongkir:</span>
                        <span>Rp {editingOrder.shippingFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-200">
                      <span>TOTAL:</span>
                      <span>Rp {editingOrder.total.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between pt-0.5">
                      <span>Metode:</span>
                      <span className="uppercase font-bold">{editingOrder.paymentMethod}</span>
                    </div>
                    {editingOrder.cashGiven !== undefined && editingOrder.cashGiven > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Tunai:</span>
                          <span>Rp {editingOrder.cashGiven.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>Kembali:</span>
                          <span>Rp {(editingOrder.changeDue || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notes & Footer */}
                  {editingOrder.receiptNotes && (
                    <div className="text-[9px] text-slate-500 italic text-center pb-1">
                      Catatan: "{editingOrder.receiptNotes}"
                    </div>
                  )}

                  <div className="text-center text-[9px] text-slate-500 pt-1 space-y-0.5">
                    <p className="font-bold">{receiptSettings.footerMessage}</p>
                    <p className="text-[8px] text-slate-400">{receiptSettings.footerSubMessage}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenReceiptModal(editingOrder)}
                  className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Buka Dialog Cetak Printer</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
