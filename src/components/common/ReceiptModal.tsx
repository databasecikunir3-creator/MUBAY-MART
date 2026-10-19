import React, { useState } from 'react';
import { Order, ReceiptSettings } from '../../types';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Printer, 
  Check, 
  Share2, 
  Copy, 
  Edit3, 
  Save, 
  Settings, 
  Smartphone, 
  FileText, 
  Sliders,
  Store,
  RefreshCw
} from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const { receiptSettings, updateReceiptSettings, updateOrder, drivers, addToast } = useStore();
  
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm' | 'A4'>('80mm');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Editable local state when user switches to Edit mode
  const [editableOrder, setEditableOrder] = useState<Order | null>(null);
  const [editableSettings, setEditableSettings] = useState<ReceiptSettings>(receiptSettings);

  // Synchronize when order or modal opens
  React.useEffect(() => {
    if (order) {
      setEditableOrder(JSON.parse(JSON.stringify(order)));
      setEditableSettings({ ...receiptSettings });
      setIsEditing(false);
    }
  }, [order, receiptSettings, isOpen]);

  if (!isOpen || !order || !editableOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEdit = () => {
    if (!editableOrder) return;
    // Recalculate totals
    const subtotal = editableOrder.items.reduce((sum, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    const total = Math.max(0, subtotal - (editableOrder.discount || 0) + (editableOrder.shippingFee || 0));
    const changeDue = editableOrder.cashGiven && editableOrder.cashGiven > 0
      ? Math.max(0, editableOrder.cashGiven - total)
      : undefined;

    const savedOrder: Order = {
      ...editableOrder,
      subtotal,
      total,
      changeDue,
    };

    updateOrder(savedOrder);
    updateReceiptSettings(editableSettings);
    setIsEditing(false);
    addToast('Struk Berhasil Diperbarui', 'Perubahan nota dan pengaturan toko tersimpan.', 'success');
  };

  const handleCopyText = () => {
    const lines = [
      `*${editableSettings.storeName}*`,
      `${editableSettings.storeAddress} - Telp: ${editableSettings.storePhone}`,
      `--------------------------------`,
      `No. Nota: ${editableOrder.invoiceNumber}`,
      `Waktu: ${new Date(editableOrder.createdAt).toLocaleString('id-ID')}`,
      editableOrder.cashierName ? `Kasir: ${editableOrder.cashierName}` : '',
      editableOrder.customer?.name ? `Pelanggan: ${editableOrder.customer.name}` : '',
      `--------------------------------`,
      ...editableOrder.items.map(i => {
        const p = i.customPrice !== undefined ? i.customPrice : i.product.price;
        return `${i.product.name} x${i.quantity} = Rp ${(i.quantity * p).toLocaleString('id-ID')}`;
      }),
      `--------------------------------`,
      `Subtotal: Rp ${editableOrder.subtotal.toLocaleString('id-ID')}`,
      editableOrder.discount > 0 ? `Diskon: -Rp ${editableOrder.discount.toLocaleString('id-ID')}` : '',
      editableOrder.shippingFee > 0 ? `Ongkir: Rp ${editableOrder.shippingFee.toLocaleString('id-ID')}` : '',
      `*TOTAL: Rp ${editableOrder.total.toLocaleString('id-ID')}*`,
      `Metode: ${editableOrder.paymentMethod.toUpperCase()}`,
      `--------------------------------`,
      editableSettings.footerMessage,
      `Terima kasih!`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Struk Disalin', 'Teks nota siap dibagikan ke pelanggan.', 'info');
  };

  const handleShareWhatsApp = () => {
    const lines = [
      `*${editableSettings.storeName}*`,
      `${editableSettings.storeTagline}`,
      `${editableSettings.storeAddress}`,
      `--------------------------------`,
      `No. Nota: ${editableOrder.invoiceNumber}`,
      `Waktu: ${new Date(editableOrder.createdAt).toLocaleString('id-ID')}`,
      `Kanal: ${editableOrder.channel === 'pos_kasir' ? 'Kasir Toko' : 'Order Online'}`,
      `--------------------------------`,
      ...editableOrder.items.map(i => {
        const p = i.customPrice !== undefined ? i.customPrice : i.product.price;
        return `*${i.product.name}*\n  ${i.quantity} ${i.product.unit} x Rp ${p.toLocaleString('id-ID')} = Rp ${(i.quantity * p).toLocaleString('id-ID')}`;
      }),
      `--------------------------------`,
      `Subtotal: Rp ${editableOrder.subtotal.toLocaleString('id-ID')}`,
      editableOrder.discount > 0 ? `Diskon: -Rp ${editableOrder.discount.toLocaleString('id-ID')}` : '',
      editableOrder.shippingFee > 0 ? `Ongkir: Rp ${editableOrder.shippingFee.toLocaleString('id-ID')}` : '',
      `*TOTAL BAYAR: Rp ${editableOrder.total.toLocaleString('id-ID')}*`,
      `Metode Bayar: ${editableOrder.paymentMethod.toUpperCase()}`,
      editableOrder.cashGiven ? `Uang Diterima: Rp ${editableOrder.cashGiven.toLocaleString('id-ID')}` : '',
      editableOrder.changeDue ? `Kembalian: Rp ${editableOrder.changeDue.toLocaleString('id-ID')}` : '',
      `--------------------------------`,
      editableSettings.footerMessage,
      `Terima kasih telah berbelanja di SegarMart!`,
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    const phone = editableOrder.customer?.phone?.replace(/[^0-9]/g, '') || '';
    const url = phone ? `https://wa.me/62${phone.startsWith('0') ? phone.slice(1) : phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Determine container width for preview
  const previewWidthClass = 
    paperWidth === '58mm' ? 'max-w-[280px]' :
    paperWidth === 'A4' ? 'max-w-[620px]' : 'max-w-[360px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-100 rounded-3xl max-w-4xl w-full max-h-[95vh] shadow-2xl border border-slate-300 overflow-hidden my-auto flex flex-col">
        
        {/* Top Control Bar (Hidden when printed) */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs sm:text-sm tracking-wide">
              {isEditing ? '✏️ Mode Edit Struk & Informasi Toko' : '🖨️ Cetak & Pratinjau Struk Penjualan'}
            </span>
            <span className="bg-slate-800 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700">
              {editableOrder.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Selesai Edit' : 'Edit Struk Ini'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Paper Size & Quick actions (no-print) */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 no-print">
          {/* Paper Size Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium mr-1">Format Kertas:</span>
            {(['58mm', '80mm', 'A4'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setPaperWidth(size)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                  paperWidth === size
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {size === '58mm' ? '58mm (Mini POS)' : size === '80mm' ? '80mm (Standar POS)' : 'A4 (Faktur)'}
              </button>
            ))}
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl font-bold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Printer</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-start justify-center">
          
          {/* Optional IN-MODAL EDITOR FORM (When isEditing is true) */}
          {isEditing && (
            <div className="w-full md:w-96 bg-white p-4 rounded-2xl border border-slate-300 shadow-sm space-y-3.5 text-xs no-print">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Edit Nilai & Identitas Struk
                </span>
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>

              {/* Store Branding Fields */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Kop Toko</label>
                <div>
                  <input
                    type="text"
                    value={editableSettings.storeName}
                    onChange={(e) => setEditableSettings({ ...editableSettings, storeName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold"
                    placeholder="Nama Toko"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editableSettings.storeAddress}
                    onChange={(e) => setEditableSettings({ ...editableSettings, storeAddress: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-[11px]"
                    placeholder="Alamat Toko"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={editableSettings.storePhone}
                    onChange={(e) => setEditableSettings({ ...editableSettings, storePhone: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono"
                    placeholder="No. Telepon Toko"
                  />
                </div>
              </div>

              {/* Order specific info */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Detail Nota</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[10px]">No Nota</label>
                    <input
                      type="text"
                      value={editableOrder.invoiceNumber}
                      onChange={(e) => setEditableOrder({ ...editableOrder, invoiceNumber: e.target.value })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">Nama Kasir</label>
                    <input
                      type="text"
                      value={editableOrder.cashierName || ''}
                      onChange={(e) => setEditableOrder({ ...editableOrder, cashierName: e.target.value })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px]">Nama Pelanggan</label>
                  <input
                    type="text"
                    value={editableOrder.customer?.name || ''}
                    onChange={(e) => setEditableOrder({
                      ...editableOrder,
                      customer: {
                        name: e.target.value,
                        phone: editableOrder.customer?.phone || '',
                        address: editableOrder.customer?.address || ''
                      }
                    })}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px]">Kurir Pengantaran</label>
                  <select
                    value={editableOrder.courier?.driverId || ''}
                    onChange={(e) => {
                      const chosen = drivers.find(d => d.id === e.target.value);
                      if (chosen) {
                        setEditableOrder({
                          ...editableOrder,
                          courier: {
                            ...(editableOrder.courier || {
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
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium"
                  >
                    <option value="">{editableOrder.courier?.driverName ? `${editableOrder.courier.driverName} (${editableOrder.courier.providerName})` : '-- Pilih Kurir --'}</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        🛵 {d.name} ({d.vehicleName} - {d.plateNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 text-[10px]">Diskon (Rp)</label>
                    <input
                      type="number"
                      value={editableOrder.discount}
                      onChange={(e) => setEditableOrder({ ...editableOrder, discount: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px]">Ongkir (Rp)</label>
                    <input
                      type="number"
                      value={editableOrder.shippingFee}
                      onChange={(e) => setEditableOrder({ ...editableOrder, shippingFee: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {editableOrder.paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-slate-500 text-[10px]">Uang Diterima (Rp)</label>
                    <input
                      type="number"
                      value={editableOrder.cashGiven || ''}
                      onChange={(e) => setEditableOrder({ ...editableOrder, cashGiven: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded-lg border border-slate-300 font-mono text-xs font-bold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-500 text-[10px]">Pesan Kaki Struk</label>
                  <input
                    type="text"
                    value={editableSettings.footerMessage}
                    onChange={(e) => setEditableSettings({ ...editableSettings, footerMessage: e.target.value })}
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* THE THERMAL PAPER OR A4 INVOICE PRINT ELEMENT */}
          <div className={`w-full ${previewWidthClass} transition-all duration-300 shadow-xl border border-slate-300 rounded-xl overflow-hidden bg-white print-receipt`}>
            
            {paperWidth === 'A4' ? (
              /* A4 FORMAL INVOICE FORMAT */
              <div className="p-8 font-sans text-xs text-slate-800 space-y-5">
                <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{editableSettings.storeName}</h1>
                    <p className="text-slate-500 text-xs">{editableSettings.storeTagline}</p>
                    <p className="text-slate-500 text-[11px] mt-1">{editableSettings.storeAddress}</p>
                    <p className="text-slate-500 text-[11px]">Telp: {editableSettings.storePhone}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xl font-black text-emerald-800 tracking-wider uppercase block">FAKTUR PENJUALAN</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{editableOrder.invoiceNumber}</span>
                    <p className="text-[11px] text-slate-500 mt-1">{new Date(editableOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Diterbitkan Oleh:</span>
                    <p className="font-bold text-slate-800">{editableOrder.channel === 'pos_kasir' ? 'Kasir Toko Fisik' : 'Pusat Order Online SegarMart'}</p>
                    {editableOrder.cashierName && <p className="text-slate-500 text-[11px]">Petugas: {editableOrder.cashierName}</p>}
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Kepada Pelanggan:</span>
                    <p className="font-bold text-slate-800">{editableOrder.customer?.name || 'Pelanggan Umum'}</p>
                    {editableOrder.customer?.phone && <p className="text-slate-500 text-[11px] font-mono">{editableOrder.customer.phone}</p>}
                    {editableOrder.customer?.address && <p className="text-slate-500 text-[11px] line-clamp-2">{editableOrder.customer.address}</p>}
                  </div>
                </div>

                {/* Table of items */}
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Deskripsi Komoditas / Produk</th>
                      <th className="py-2.5 px-3 text-center">Jumlah</th>
                      <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {editableOrder.items.map((item, idx) => {
                      const p = item.customPrice !== undefined ? item.customPrice : item.product.price;
                      return (
                        <tr key={idx}>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{item.product.name}</td>
                          <td className="py-2 px-3 text-center font-mono">{item.quantity} {item.product.unit}</td>
                          <td className="py-2 px-3 text-right font-mono">Rp {p.toLocaleString('id-ID')}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">Rp {(item.quantity * p).toLocaleString('id-ID')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Calculation */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono">Rp {editableOrder.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {editableOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Diskon:</span>
                        <span className="font-mono">-Rp {editableOrder.discount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {editableOrder.shippingFee > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Ongkos Kirim:</span>
                        <span className="font-mono">Rp {editableOrder.shippingFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black pt-2 border-t-2 border-slate-800 text-slate-900">
                      <span>TOTAL TAGIHAN:</span>
                      <span className="font-mono text-emerald-800">Rp {editableOrder.total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 text-center text-[10px] text-slate-500 space-y-1">
                  <p className="font-bold">{editableSettings.footerMessage}</p>
                  <p>{editableSettings.footerSubMessage}</p>
                </div>
              </div>
            ) : (
              /* THERMAL PAPER FORMAT (58mm or 80mm) */
              <div className={`p-4 sm:p-5 font-mono text-[11px] text-slate-900 space-y-2.5 ${paperWidth === '58mm' ? 'text-[10px] p-3' : ''}`}>
                
                {/* Store Header */}
                <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-slate-300">
                  <div className="font-black text-sm tracking-wide text-slate-950">
                    {editableSettings.storeName}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {editableSettings.storeTagline}
                  </div>
                  <div className="text-[9px] text-slate-500 leading-tight">
                    {editableSettings.storeAddress}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Telp/WA: {editableSettings.storePhone}
                  </div>
                </div>

                {/* Invoice Metadata */}
                <div className="py-1.5 border-b border-dashed border-slate-300 space-y-0.5 text-[10px] text-slate-700">
                  <div className="flex justify-between">
                    <span>No. Nota:</span>
                    <span className="font-bold font-mono">{editableOrder.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{new Date(editableOrder.createdAt).toLocaleDateString('id-ID')} {new Date(editableOrder.createdAt).toLocaleTimeString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kanal:</span>
                    <span>{editableOrder.channel === 'pos_kasir' ? 'POS Offline Kasir' : 'Pesanan Online'}</span>
                  </div>
                  {editableOrder.cashierName && (
                    <div className="flex justify-between">
                      <span>Kasir:</span>
                      <span>{editableOrder.cashierName}</span>
                    </div>
                  )}
                  {editableOrder.customer?.name && (
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="font-bold">{editableOrder.customer.name}</span>
                    </div>
                  )}
                  {editableOrder.courier && (
                    <div className="flex justify-between">
                      <span>Kurir:</span>
                      <span>{editableOrder.courier.providerName} ({editableOrder.courier.driverPlate || 'Auto'})</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="py-1.5 border-b border-dashed border-slate-300 space-y-1">
                  {editableOrder.items.map((item, idx) => {
                    const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-bold text-slate-900 leading-tight">
                          {item.product.name}
                        </div>
                        <div className="flex justify-between text-slate-600 text-[10px]">
                          <span>
                            {item.quantity} {item.product.unit} × Rp {price.toLocaleString('id-ID')}
                          </span>
                          <span className="font-bold text-slate-900">
                            Rp {(item.quantity * price).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary */}
                <div className="py-1.5 border-b border-dashed border-slate-300 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {editableOrder.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {editableOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>Diskon:</span>
                      <span>-Rp {editableOrder.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {editableOrder.shippingFee > 0 && (
                    <div className="flex justify-between">
                      <span>Ongkir:</span>
                      <span>Rp {editableOrder.shippingFee.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-300">
                    <span>TOTAL:</span>
                    <span>Rp {editableOrder.total.toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex justify-between pt-0.5 text-slate-600">
                    <span>Metode Bayar:</span>
                    <span className="uppercase font-bold">{editableOrder.paymentMethod.replace('_', ' ')}</span>
                  </div>

                  {editableOrder.cashGiven !== undefined && editableOrder.cashGiven > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Uang Diterima:</span>
                        <span>Rp {editableOrder.cashGiven.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-950">
                        <span>Kembalian:</span>
                        <span>Rp {(editableOrder.changeDue || 0).toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Optional Custom Notes */}
                {editableOrder.receiptNotes && (
                  <div className="text-[9px] text-slate-600 italic text-center py-1">
                    "{editableOrder.receiptNotes}"
                  </div>
                )}

                {/* Footer Message */}
                <div className="pt-2 text-center space-y-0.5 text-[9px] text-slate-500">
                  <p className="font-bold text-slate-800">{editableSettings.footerMessage}</p>
                  <p className="text-[8px]">{editableSettings.footerSubMessage}</p>
                  <p className="pt-1 text-[8px] font-mono text-slate-400">
                    *** LUNAS / TERVERIFIKASI RESMI ***
                  </p>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
