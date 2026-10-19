export type ProductCategory = 'sembako' | 'sayur' | 'buah' | 'bumbu' | 'daging_telur';

export type ProductUnit = 'kg' | 'gram' | 'ikat' | 'bungkus' | 'liter' | 'dus' | 'butir' | 'pack';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  price: number; // Harga jual
  costPrice: number; // Harga beli/modal
  stock: number;
  minStockAlert: number;
  image: string;
  freshnessGrade?: string; // e.g. "Grade A Super", "Panen Segar Hari Ini"
  shelfLifeDays?: number; // e.g. 3 hari untuk sayur
  origin?: string; // e.g. "Petani Lembang", "Pasar Induk", "Brebes"
  description?: string;
  isPopular?: boolean;
}

export type PaymentMethod = 'qris' | 'gopay' | 'ovo' | 'dana' | 'shopeepay' | 'bca_va' | 'mandiri_va' | 'bri_va' | 'cash' | 'edc_card';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type OrderChannel = 'online' | 'pos_kasir';

export type CourierProvider = 'gosend_instant' | 'grab_sameday' | 'anteraja_fresh' | 'kurir_toko' | 'lalamove' | 'kurir_langganan';

export type VehicleType = 'motor' | 'tossa_roda3' | 'mobil_blindvan' | 'mobil_pickup';

export interface CourierDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleName: string;
  plateNumber: string;
  provider: CourierProvider;
  providerName: string;
  avatar: string;
  status: 'active' | 'busy' | 'off';
  deliveryZone: string;
  rating: number;
  totalDeliveries: number;
  joinDate: string;
}

export type CourierStatus = 
  | 'unassigned'
  | 'driver_assigned'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered';

export type OrderStatus =
  | 'waiting_payment'
  | 'paid'
  | 'processing'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export interface CourierInfo {
  provider: CourierProvider;
  providerName: string;
  serviceType: string;
  trackingNumber: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPlate?: string;
  driverVehicle?: string;
  driverAvatar?: string;
  driverLat?: number;
  driverLng?: number;
  estimatedMinutes?: number;
  shippingFee: number;
  status: CourierStatus;
  statusLogs: {
    status: CourierStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number; // Optional edited price for receipt customization
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface ReceiptSettings {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storePhone: string;
  footerMessage: string;
  footerSubMessage: string;
  showCashier: boolean;
  showCustomer: boolean;
  showBarcode: boolean;
  paperWidth: '58mm' | '80mm' | 'A4';
}

export type StoreThemeColor = 'emerald' | 'teal' | 'blue' | 'amber' | 'purple' | 'rose';

export interface StoreProfile {
  name: string;
  namePrefix: string;
  nameSuffix: string;
  tagline: string;
  description: string;
  logoType: 'icon' | 'custom_url';
  logoIcon: string;
  customLogoUrl: string;
  themeColor: StoreThemeColor;
  phone: string;
  hotline: string;
  email: string;
  address: string;
  city: string;
  openingHours: string;
  announcementBanner: string;
  receipt: ReceiptSettings;
  baseCourierFee: number;
  freeShippingMinSpend: number;
  defaultPromoCode: string;
  defaultPromoDiscount: number;
}

export interface Order {
  id: string;
  invoiceNumber: string;
  channel: OrderChannel;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paidAt?: string;
  customer?: CustomerInfo;
  courier?: CourierInfo;
  cashGiven?: number; // For POS cash payments
  changeDue?: number; // Kembalian
  cashierName?: string;
  receiptNotes?: string;
  customReceiptSettings?: Partial<ReceiptSettings>;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  type: 'sale_online' | 'sale_pos' | 'restock' | 'adjustment_waste' | 'edit';
  quantityChange: number; // e.g. -2 or +10
  currentStockAfter: number;
  timestamp: string;
  note?: string;
}
