import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreProfile, StoreThemeColor, CourierProvider, VehicleType, CourierDriver } from '../../types';
import { 
  Store, 
  Settings, 
  Save, 
  RotateCcw, 
  Image as ImageIcon, 
  FileText, 
  Phone, 
  MapPin, 
  Clock, 
  Tag, 
  Truck, 
  ShoppingBag, 
  Check, 
  Printer, 
  Sparkles, 
  ShieldCheck,
  Eye,
  Sliders,
  DollarSign,
  Palette,
  Upload,
  UserPlus,
  Trash2,
  Users,
  Compass,
  Star
} from 'lucide-react';

const ICON_PRESETS = [
  { id: 'ShoppingBag', label: 'Tas Belanja', icon: '🛍️' },
  { id: 'Store', label: 'Toko Fisik', icon: '🏪' },
  { id: 'Apple', label: 'Buah Segar', icon: '🍎' },
  { id: 'Carrot', label: 'Sayuran', icon: '🥕' },
  { id: 'Leaf', label: 'Organik', icon: '🥬' },
  { id: 'Package', label: 'Sembako', icon: '📦' },
  { id: 'Sparkles', label: 'Supermarket', icon: '✨' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
];

const THEME_COLORS: { id: StoreThemeColor; label: string; bgClass: string; textClass: string; ringClass: string }[] = [
  { id: 'emerald', label: 'Hijau Segar (Default)', bgClass: 'bg-emerald-600', textClass: 'text-emerald-700', ringClass: 'ring-emerald-500' },
  { id: 'teal', label: 'Teal Modern', bgClass: 'bg-teal-600', textClass: 'text-teal-700', ringClass: 'ring-teal-500' },
  { id: 'blue', label: 'Biru Kepercayaan', bgClass: 'bg-blue-600', textClass: 'text-blue-700', ringClass: 'ring-blue-500' },
  { id: 'amber', label: 'Kuning Hangat', bgClass: 'bg-amber-600', textClass: 'text-amber-700', ringClass: 'ring-amber-500' },
  { id: 'purple', label: 'Ungu Premium', bgClass: 'bg-purple-600', textClass: 'text-purple-700', ringClass: 'ring-purple-500' },
  { id: 'rose', label: 'Merah Buah', bgClass: 'bg-rose-600', textClass: 'text-rose-700', ringClass: 'ring-rose-500' },
];

export const StoreSettingsManager: React.FC = () => {
  const { 
    storeProfile, 
    updateStoreProfile, 
    drivers,
    addCourierDriver,
    updateCourierDriver,
    deleteCourierDriver,
    setActiveTab,
    addToast, 
    resetAllDemoData 
  } = useStore();

  // Local form state
  const [formData, setFormData] = useState<StoreProfile>(JSON.parse(JSON.stringify(storeProfile)));
  const [activeSection, setActiveSection] = useState<'profile' | 'contact' | 'receipt' | 'operational' | 'courier'>('profile');

  // New Driver Form state inside Settings
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
    providerName: 'Kurir Internal Toko',
    avatar: PRESET_AVATARS[0],
    deliveryZone: 'Radius 5 KM Pasar',
  });

  const [isAddingDriver, setIsAddingDriver] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      alert('Nama toko tidak boleh kosong.');
      return;
    }
    updateStoreProfile(formData);
  };

  const handleReset = () => {
    if (confirm('Kembalikan profil dan pengaturan toko ke kondisi awal?')) {
      resetAllDemoData();
      setFormData(JSON.parse(JSON.stringify(storeProfile)));
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2 MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64Url = loadEvt.target?.result as string;
        setFormData({
          ...formData,
          logoType: 'custom_url',
          customLogoUrl: base64Url
        });
        addToast('Logo Diunggah', 'Gambar logo berhasil dimuat. Klik Simpan untuk menerapkan.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

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

    setIsAddingDriver(false);
    setNewDriver({
      name: '',
      phone: '',
      vehicleType: 'motor',
      vehicleName: 'Honda Vario 160',
      plateNumber: '',
      provider: 'kurir_toko',
      providerName: 'Kurir Internal Toko',
      avatar: PRESET_AVATARS[0],
      deliveryZone: 'Radius 5 KM Pasar',
    });
  };

  const getProviderLabel = (prov: CourierProvider) => {
    switch (prov) {
      case 'kurir_toko': return `Kurir Internal ${formData.name || 'Toko'}`;
      case 'gosend_instant': return 'GoSend Instant Mitra';
      case 'grab_sameday': return 'GrabExpress Mitra';
      case 'anteraja_fresh': return 'Anteraja Fresh Cold';
      case 'lalamove': return 'Lalamove Delivery';
      default: return 'Kurir Pengantaran';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            Pengaturan Toko & Kustomisasi Lengkap
          </h1>
          <p className="text-xs text-slate-500">
            Ubah nama toko, logo, kontak, jam operasional, format struk cetak kasir, tarif ongkir, dan tambahkan kurir pengantaran secara terpusat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Settings Navigation & Forms (7 cols), Right Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Settings Tabs & Inputs */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub-Section Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none text-xs shadow-xs">
            <button
              type="button"
              onClick={() => setActiveSection('profile')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${
                activeSection === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>1. Identitas & Logo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('contact')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${
                activeSection === 'contact' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>2. Kontak & Alamat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('receipt')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${
                activeSection === 'receipt' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>3. Format Struk Kasir</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('operational')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${
                activeSection === 'operational' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>4. Ongkir & Voucher</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('courier')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold cursor-pointer whitespace-nowrap transition-colors ${
                activeSection === 'courier' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>5. Kurir & Armada ({drivers.length})</span>
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            
            {/* SECTION 1: IDENTITAS & LOGO TOKO */}
            {activeSection === 'profile' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-800">Identitas, Nama & Logo Toko</h3>
                  <p className="text-slate-500">Nama toko akan tampil di Header, Banner, Mesin Kasir, dan Nota Cetak</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nama Toko Utama</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          name: val,
                          receipt: {
                            ...formData.receipt,
                            storeName: val.toUpperCase()
                          }
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Slogan / Tagline Toko</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          tagline: val,
                          receipt: {
                            ...formData.receipt,
                            storeTagline: val
                          }
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Stylized Brand Wordmark (Prefix + Suffix) */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">Teks Logo Bagian 1 (Contoh: "Segar")</label>
                    <input
                      type="text"
                      value={formData.namePrefix}
                      onChange={(e) => setFormData({ ...formData, namePrefix: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1 text-[11px]">Teks Logo Bagian 2 Berwarna (Contoh: "Mart")</label>
                    <input
                      type="text"
                      value={formData.nameSuffix}
                      onChange={(e) => setFormData({ ...formData, nameSuffix: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-emerald-700 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Deskripsi Singkat Toko</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                {/* Logo Type Selector */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Model Logo Toko
                  </label>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="logoType"
                        checked={formData.logoType === 'icon'}
                        onChange={() => setFormData({ ...formData, logoType: 'icon' })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Gunakan Icon Vektor Preset</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                      <input
                        type="radio"
                        name="logoType"
                        checked={formData.logoType === 'custom_url'}
                        onChange={() => setFormData({ ...formData, logoType: 'custom_url' })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Upload / URL Gambar Logo Sendiri</span>
                    </label>
                  </div>

                  {formData.logoType === 'icon' ? (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      {ICON_PRESETS.map((ic) => (
                        <button
                          key={ic.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, logoIcon: ic.id })}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            formData.logoIcon === ic.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-sm">{ic.icon}</span>
                          <span>{ic.label}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl cursor-pointer font-semibold transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Pilih File Logo dari Perangkat</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-slate-400">atau</span>
                      </div>

                      <input
                        type="url"
                        placeholder="Masukkan URL foto logo (https://...)"
                        value={formData.customLogoUrl}
                        onChange={(e) => setFormData({ ...formData, customLogoUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Theme Color Picker */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-emerald-600" />
                    Warna Tema Toko
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {THEME_COLORS.map((tc) => (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, themeColor: tc.id })}
                        className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                          formData.themeColor === tc.id
                            ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-400'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${tc.bgClass} shrink-0`}></span>
                        <span className="font-semibold text-slate-800">{tc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SECTION 2: KONTAK & ALAMAT OPERASIONAL */}
            {activeSection === 'contact' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-800">Alamat Toko, Kontak & Jam Operasional</h3>
                  <p className="text-slate-500">Informasi ini akan tertera di footer aplikasi, hotline CS, dan rute kurir</p>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Alamat Lengkap Toko / Gudang Hub</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        address: val,
                        receipt: {
                          ...formData.receipt,
                          storeAddress: val
                        }
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Kota / Wilayah Operasi</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Jam Operasional Toko</label>
                    <input
                      type="text"
                      placeholder="06:00 - 21:00 WIB"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">No. WhatsApp / Telepon Toko</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          phone: val,
                          receipt: {
                            ...formData.receipt,
                            storePhone: val
                          }
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nomor Hotline CS Pelanggan</label>
                    <input
                      type="text"
                      value={formData.hotline}
                      onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Teks Pengumuman Banner Atas (Running Bar)</label>
                  <input
                    type="text"
                    value={formData.announcementBanner}
                    onChange={(e) => setFormData({ ...formData, announcementBanner: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            )}

            {/* SECTION 3: FORMAT STRUK KASIR & INVOICE */}
            {activeSection === 'receipt' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-800">Format & Tampilan Struk Kasir (Receipt Customizer)</h3>
                  <p className="text-slate-500">Sesuaikan kop nota, pesan kaki struk, dan ukuran kertas default</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nama Toko di Kop Struk</label>
                    <input
                      type="text"
                      value={formData.receipt.storeName}
                      onChange={(e) => setFormData({
                        ...formData,
                        receipt: { ...formData.receipt, storeName: e.target.value.toUpperCase() }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tagline Kop Struk</label>
                    <input
                      type="text"
                      value={formData.receipt.storeTagline}
                      onChange={(e) => setFormData({
                        ...formData,
                        receipt: { ...formData.receipt, storeTagline: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Alamat di Struk</label>
                    <input
                      type="text"
                      value={formData.receipt.storeAddress}
                      onChange={(e) => setFormData({
                        ...formData,
                        receipt: { ...formData.receipt, storeAddress: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">No. Telp / WA di Struk</label>
                    <input
                      type="text"
                      value={formData.receipt.storePhone}
                      onChange={(e) => setFormData({
                        ...formData,
                        receipt: { ...formData.receipt, storePhone: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pesan Penutup Utama di Kaki Struk</label>
                  <input
                    type="text"
                    value={formData.receipt.footerMessage}
                    onChange={(e) => setFormData({
                      ...formData,
                      receipt: { ...formData.receipt, footerMessage: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Catatan Garansi / Syarat Penukaran Barang</label>
                  <textarea
                    rows={2}
                    value={formData.receipt.footerSubMessage}
                    onChange={(e) => setFormData({
                      ...formData,
                      receipt: { ...formData.receipt, footerSubMessage: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                {/* Paper Size & Toggle Options */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                    Pengaturan Printer Thermal & Faktur
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-600">Ukuran Kertas Default:</span>
                    {(['58mm', '80mm', 'A4'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          receipt: { ...formData.receipt, paperWidth: sz }
                        })}
                        className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                          formData.receipt.paperWidth === sz
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.receipt.showCashier}
                        onChange={(e) => setFormData({
                          ...formData,
                          receipt: { ...formData.receipt, showCashier: e.target.checked }
                        })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tampilkan Nama Kasir</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.receipt.showCustomer}
                        onChange={(e) => setFormData({
                          ...formData,
                          receipt: { ...formData.receipt, showCustomer: e.target.checked }
                        })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tampilkan Nama Pembeli</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.receipt.showBarcode}
                        onChange={(e) => setFormData({
                          ...formData,
                          receipt: { ...formData.receipt, showBarcode: e.target.checked }
                        })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tampilkan Barcode/QR</span>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* SECTION 4: OPERASIONAL, ONGKIR & PROMO */}
            {activeSection === 'operational' && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-bold text-sm text-slate-800">Biaya Kurir Toko & Kode Promo Voucher</h3>
                  <p className="text-slate-500">Atur batas belanja gratis ongkir dan kode kupon diskon checkout online</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tarif Dasar Kurir Toko (Rp)</label>
                    <input
                      type="number"
                      value={formData.baseCourierFee}
                      onChange={(e) => setFormData({ ...formData, baseCourierFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Minimal Belanja Gratis Ongkir (Rp)</label>
                    <input
                      type="number"
                      value={formData.freeShippingMinSpend}
                      onChange={(e) => setFormData({ ...formData, freeShippingMinSpend: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Kode Voucher Promo Default</label>
                    <input
                      type="text"
                      value={formData.defaultPromoCode}
                      onChange={(e) => setFormData({ ...formData, defaultPromoCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nominal Potongan Diskon (Rp)</label>
                    <input
                      type="number"
                      value={formData.defaultPromoDiscount}
                      onChange={(e) => setFormData({ ...formData, defaultPromoDiscount: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: TAMBAH & KELOLA KURIR PENGANTARAN */}
            {activeSection === 'courier' && (
              <div className="space-y-4">
                <div className="border-b pb-2 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Manajemen & Penambahan Kurir Pengantaran</h3>
                    <p className="text-slate-500">Daftarkan driver internal toko atau mitra ekspedisi untuk pengiriman pesanan</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingDriver(!isAddingDriver)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isAddingDriver ? 'Tutup Form' : '+ Tambah Kurir Baru'}</span>
                  </button>
                </div>

                {/* Inline Add Courier Driver Form */}
                {isAddingDriver && (
                  <form onSubmit={handleCreateDriver} className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                      <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                        <UserPlus className="w-4 h-4 text-emerald-700" /> Form Pendaftaran Kurir Pengantaran
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Nama Lengkap Kurir</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Pak Budi Santoso"
                          value={newDriver.name}
                          onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                        <input
                          type="tel"
                          required
                          placeholder="0812-3456-7890"
                          value={newDriver.phone}
                          onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Jenis Armada Kendaraan</label>
                        <select
                          value={newDriver.vehicleType}
                          onChange={(e) => {
                            const vType = e.target.value as VehicleType;
                            let defaultVeh = 'Honda Vario 160';
                            if (vType === 'mobil_pickup') defaultVeh = 'Gran Max Pickup';
                            if (vType === 'mobil_blindvan') defaultVeh = 'Blindvan Box Pendingin';
                            if (vType === 'tossa_roda3') defaultVeh = 'Motor Roda 3 Tossa/Viar';
                            setNewDriver({ ...newDriver, vehicleType: vType, vehicleName: defaultVeh });
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="motor">🏍️ Sepeda Motor</option>
                          <option value="tossa_roda3">🛵 Motor Roda 3 (Tossa/Viar)</option>
                          <option value="mobil_blindvan">🚐 Mobil Blindvan Box</option>
                          <option value="mobil_pickup">🛻 Mobil Pickup Terbuka</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Model & Nama Kendaraan</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Honda Beat Hitam"
                          value={newDriver.vehicleName}
                          onChange={(e) => setNewDriver({ ...newDriver, vehicleName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Plat Nomor Kendaraan</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: B 3456 KXX"
                          value={newDriver.plateNumber}
                          onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold uppercase"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Kategori / Ekspedisi</label>
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
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                        >
                          <option value="kurir_toko">Kurir Internal Toko</option>
                          <option value="gosend_instant">GoSend Instant Mitra</option>
                          <option value="grab_sameday">GrabExpress Mitra</option>
                          <option value="anteraja_fresh">Anteraja Fresh Cold</option>
                          <option value="lalamove">Lalamove Delivery</option>
                          <option value="kurir_langganan">Kurir Langganan</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Zona / Area Pengantaran</label>
                      <input
                        type="text"
                        placeholder="Contoh: Radius 10 KM Pasar, Jakarta Selatan"
                        value={newDriver.deliveryZone}
                        onChange={(e) => setNewDriver({ ...newDriver, deliveryZone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1.5">Pilih Foto Profil Driver</label>
                      <div className="flex items-center gap-2">
                        {PRESET_AVATARS.map((ava, idx) => (
                          <img
                            key={idx}
                            src={ava}
                            alt=""
                            onClick={() => setNewDriver({ ...newDriver, avatar: ava })}
                            className={`w-9 h-9 rounded-xl object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                              newDriver.avatar === ava ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-60'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-emerald-200">
                      <button
                        type="button"
                        onClick={() => setIsAddingDriver(false)}
                        className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-emerald-100 font-semibold"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                      >
                        Simpan & Daftarkan Kurir
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Registered Drivers */}
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                    Daftar Kurir Terdaftar ({drivers.length})
                  </span>

                  <div className="space-y-2">
                    {drivers.map((driver) => {
                      const isAvailable = driver.status === 'active';
                      const isBusy = driver.status === 'busy';

                      return (
                        <div
                          key={driver.id}
                          className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={driver.avatar}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-xs text-slate-800">{driver.name}</h4>
                                <span className="flex items-center text-[10px] text-amber-600 font-bold">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-0.5" /> {driver.rating}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {driver.phone} • {driver.vehicleName} ({driver.plateNumber})
                              </p>
                              <span className="text-[10px] text-emerald-700 font-medium bg-emerald-100/60 px-1.5 py-0.2 rounded">
                                {driver.providerName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Status toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                const nextStatus = isAvailable ? 'off' : 'active';
                                updateCourierDriver({ ...driver, status: nextStatus });
                              }}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isBusy
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isAvailable ? '🟢 Siap Antar' : isBusy ? '🛵 Sedang Jalan' : '⚪ Libur'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus kurir ${driver.name} dari sistem?`)) {
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
                      );
                    })}
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('courier')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Buka Tab Kurir untuk Pantau Peta GPS Live & Penugasan Pesanan
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Save Trigger */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t">
              <span className="text-[11px] text-slate-400">
                Data disimpan otomatis di memori lokal peramban.
              </span>
              <button
                type="button"
                onClick={() => handleSave()}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Toko</span>
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Live Interactive Store & Receipt Preview */}
        <div className="lg:col-span-5 space-y-4 flex flex-col items-center">
          
          <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pratinjau Branding Header Toko (Live)
            </span>

            {/* Store Brand Card Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden">
                {formData.logoType === 'custom_url' && formData.customLogoUrl ? (
                  <img src={formData.customLogoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>
                    {formData.logoIcon === 'Apple' ? '🍎' :
                     formData.logoIcon === 'Carrot' ? '🥕' :
                     formData.logoIcon === 'Leaf' ? '🥬' :
                     formData.logoIcon === 'Package' ? '📦' :
                     formData.logoIcon === 'Store' ? '🏪' :
                     formData.logoIcon === 'Sparkles' ? '✨' : '🛍️'}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-slate-800">
                    {formData.namePrefix || formData.name}<span className="text-emerald-600">{formData.nameSuffix || ''}</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-emerald-300">
                    OFFICIAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5">{formData.tagline}</p>
                <p className="text-[10px] text-slate-400 mt-1">{formData.address}</p>
              </div>
            </div>
          </div>

          {/* Thermal Receipt Preview Paper */}
          <div className="w-full max-w-[340px] bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-md font-mono text-[11px] text-slate-800 space-y-2">
            <div className="text-center pb-2 border-b border-dashed border-slate-300 space-y-0.5">
              <div className="font-black text-sm tracking-wide text-slate-900">
                {formData.receipt.storeName}
              </div>
              <div className="text-[10px] text-slate-500">
                {formData.receipt.storeTagline}
              </div>
              <div className="text-[9px] text-slate-400">
                {formData.receipt.storeAddress}
              </div>
              <div className="text-[9px] text-slate-400">
                Telp: {formData.receipt.storePhone}
              </div>
            </div>

            <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-slate-300 text-slate-600">
              <div className="flex justify-between">
                <span>No. Nota:</span>
                <span className="font-bold text-slate-800">POS-20261018-099</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date().toLocaleDateString('id-ID')} 14:30 WIB</span>
              </div>
              {formData.receipt.showCashier && (
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>Siti Rahma</span>
                </div>
              )}
              {formData.receipt.showCustomer && (
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span>Ibu Ratna Dewi</span>
                </div>
              )}
            </div>

            <div className="space-y-1 pb-2 border-b border-dashed border-slate-300 text-[10px]">
              <div className="space-y-0.5">
                <div className="font-bold">Beras Pandan Wangi 5kg</div>
                <div className="flex justify-between text-slate-500">
                  <span>1 pack x Rp 78.500</span>
                  <span className="font-bold text-slate-800">Rp 78.500</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="font-bold">Bayam Hijau Segar (2 Ikat)</div>
                <div className="flex justify-between text-slate-500">
                  <span>2 ikat x Rp 7.000</span>
                  <span className="font-bold text-slate-800">Rp 14.000</span>
                </div>
              </div>
            </div>

            <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp 92.500</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Diskon ({formData.defaultPromoCode}):</span>
                <span>-Rp {formData.defaultPromoDiscount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-xs font-black pt-1 border-t text-slate-900">
                <span>TOTAL:</span>
                <span>Rp {(92500 - formData.defaultPromoDiscount).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="pt-2 text-center text-[9px] text-slate-500 space-y-0.5">
              <p className="font-bold">{formData.receipt.footerMessage}</p>
              <p className="text-[8px] text-slate-400">{formData.receipt.footerSubMessage}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
