import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  CartItem, 
  StockLog, 
  OrderStatus, 
  CourierStatus, 
  PaymentMethod, 
  CustomerInfo,
  CourierProvider,
  CourierDriver,
  CourierInfo,
  ReceiptSettings,
  StoreProfile
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_STOCK_LOGS, 
  INITIAL_DRIVERS,
  DEFAULT_STORE_PROFILE 
} from '../data/initialData';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: number;
}

interface PosSaleData {
  items: CartItem[];
  discount: number;
  paymentMethod: PaymentMethod;
  cashGiven?: number;
  changeDue?: number;
  cashierName: string;
}

interface OnlineCheckoutData {
  items: CartItem[];
  customer: CustomerInfo;
  courierProvider: CourierProvider;
  shippingFee: number;
  discount: number;
  paymentMethod: PaymentMethod;
}

export type ActiveTabType = 'store' | 'pos' | 'inventory' | 'courier' | 'analytics' | 'transactions' | 'settings';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  drivers: CourierDriver[];
  stockLogs: StockLog[];
  onlineCart: CartItem[];
  posCart: CartItem[];
  toasts: ToastNotification[];
  selectedActiveOrder: Order | null;
  activeTab: ActiveTabType;
  receiptSettings: ReceiptSettings;
  storeProfile: StoreProfile;
  
  // Navigation & Settings
  setActiveTab: (tab: ActiveTabType) => void;
  setSelectedActiveOrder: (order: Order | null) => void;
  updateReceiptSettings: (settings: Partial<ReceiptSettings>) => void;
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;

  // Cart operations
  addToOnlineCart: (product: Product, quantity?: number) => void;
  updateOnlineCartQuantity: (productId: string, quantity: number) => void;
  removeFromOnlineCart: (productId: string) => void;
  clearOnlineCart: () => void;

  addToPosCart: (product: Product, quantity?: number) => void;
  updatePosCartQuantity: (productId: string, quantity: number) => void;
  removeFromPosCart: (productId: string) => void;
  clearPosCart: () => void;

  // Order & Payment flow
  createOnlineOrder: (data: OnlineCheckoutData) => Order;
  processPosSale: (data: PosSaleData) => Order;
  confirmDigitalPayment: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, courierStatus?: CourierStatus, note?: string) => void;
  advanceCourierStatus: (orderId: string) => void;
  updateOrder: (updatedOrder: Order) => void;
  deleteOrder: (orderId: string) => void;

  // Courier Fleet Management
  addCourierDriver: (driver: Omit<CourierDriver, 'id'>) => void;
  updateCourierDriver: (driver: CourierDriver) => void;
  deleteCourierDriver: (driverId: string) => void;
  assignDriverToOrder: (orderId: string, driverId: string) => void;

  // Stock operations
  restockProduct: (productId: string, quantity: number, note?: string) => void;
  logWasteProduct: (productId: string, quantity: number, reason: string) => void;
  updateProductDetails: (product: Product) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (productId: string) => void;

  // Notifications
  addToast: (title: string, message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  resetAllDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'segarmart_products_v1',
  ORDERS: 'segarmart_orders_v1',
  DRIVERS: 'segarmart_drivers_v1',
  STOCK_LOGS: 'segarmart_stock_logs_v1',
  RECEIPT_SETTINGS: 'segarmart_receipt_settings_v1',
  STORE_PROFILE: 'segarmart_store_profile_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [drivers, setDrivers] = useState<CourierDriver[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRIVERS);
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_LOGS;
    } catch {
      return INITIAL_STOCK_LOGS;
    }
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORE_PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_STORE_PROFILE;
    } catch {
      return DEFAULT_STORE_PROFILE;
    }
  });

  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_STORE_PROFILE.receipt;
    } catch {
      return DEFAULT_STORE_PROFILE.receipt;
    }
  });

  const [onlineCart, setOnlineCart] = useState<CartItem[]>([]);
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTabType>('store');
  const [selectedActiveOrder, setSelectedActiveOrder] = useState<Order | null>(orders[0] || null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIPT_SETTINGS, JSON.stringify(receiptSettings));
  }, [receiptSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_PROFILE, JSON.stringify(storeProfile));
  }, [storeProfile]);

  const updateReceiptSettings = (newSettings: Partial<ReceiptSettings>) => {
    setReceiptSettings(prev => {
      const updated = { ...prev, ...newSettings };
      // Also sync to storeProfile.receipt
      setStoreProfile(sp => ({ ...sp, receipt: updated }));
      return updated;
    });
    addToast('Pengaturan Struk Disimpan', 'Format dan identitas struk kasir berhasil diperbarui.', 'success');
  };

  const updateStoreProfile = (newProfile: Partial<StoreProfile>) => {
    setStoreProfile(prev => {
      const updated = { ...prev, ...newProfile };
      if (newProfile.receipt) {
        setReceiptSettings(newProfile.receipt);
      } else if (newProfile.name || newProfile.address || newProfile.phone) {
        // Automatically sync store name and address to receipt header as well!
        setReceiptSettings(rs => ({
          ...rs,
          storeName: newProfile.name?.toUpperCase() || rs.storeName,
          storeTagline: newProfile.tagline || rs.storeTagline,
          storeAddress: newProfile.address || rs.storeAddress,
          storePhone: newProfile.phone || rs.storePhone,
        }));
      }
      return updated;
    });
    addToast('Profil Toko Disimpan', 'Identitas, logo, kontak, dan pengaturan struk berhasil diperbarui.', 'success');
  };

  const addToast = (title: string, message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type, timestamp: Date.now() }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Online Cart operations
  const addToOnlineCart = (product: Product, quantity = 1) => {
    const currentStock = products.find(p => p.id === product.id)?.stock || 0;
    if (currentStock <= 0) {
      addToast('Stok Habis', `Produk ${product.name} saat ini kosong.`, 'warning');
      return;
    }

    setOnlineCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > currentStock) {
          addToast('Batas Stok', `Maksimal pembelian untuk ${product.name} adalah ${currentStock} ${product.unit}.`, 'warning');
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: nextQty } : item);
      }
      return [...prev, { product, quantity: Math.min(quantity, currentStock) }];
    });
    addToast('Ditambahkan ke Keranjang', `${product.name} (${quantity} ${product.unit})`, 'success');
  };

  const updateOnlineCartQuantity = (productId: string, quantity: number) => {
    const currentStock = products.find(p => p.id === productId)?.stock || 0;
    if (quantity <= 0) {
      removeFromOnlineCart(productId);
      return;
    }
    if (quantity > currentStock) {
      addToast('Batas Stok', `Hanya tersedia ${currentStock} unit stok.`, 'warning');
      quantity = currentStock;
    }
    setOnlineCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const removeFromOnlineCart = (productId: string) => {
    setOnlineCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearOnlineCart = () => setOnlineCart([]);

  // POS Cart operations
  const addToPosCart = (product: Product, quantity = 1) => {
    const currentStock = products.find(p => p.id === product.id)?.stock || 0;
    if (currentStock <= 0) {
      addToast('Peringatan POS', `Stok barang ${product.name} di kasir telah habis (0).`, 'warning');
      return;
    }

    setPosCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > currentStock) {
          addToast('Stok Tidak Cukup', `Stok tersedia hanya ${currentStock}.`, 'warning');
          return prev;
        }
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: nextQty } : item);
      }
      return [...prev, { product, quantity: Math.min(quantity, currentStock) }];
    });
  };

  const updatePosCartQuantity = (productId: string, quantity: number) => {
    const currentStock = products.find(p => p.id === productId)?.stock || 0;
    if (quantity <= 0) {
      removeFromPosCart(productId);
      return;
    }
    if (quantity > currentStock) {
      addToast('Stok Terbatas', `Stok maksimum ${currentStock}.`, 'warning');
      quantity = currentStock;
    }
    setPosCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const removeFromPosCart = (productId: string) => {
    setPosCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearPosCart = () => setPosCart([]);

  // Deduct stock for items
  const deductStockForItems = (items: CartItem[], orderChannel: 'online' | 'pos_kasir', invoiceNo: string) => {
    const newLogs: StockLog[] = [];

    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const cartItem = items.find(ci => ci.product.id === prod.id);
        if (!cartItem) return prod;

        const newStock = Math.max(0, prod.stock - cartItem.quantity);
        newLogs.push({
          id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 5),
          productId: prod.id,
          productName: prod.name,
          type: orderChannel === 'online' ? 'sale_online' : 'sale_pos',
          quantityChange: -cartItem.quantity,
          currentStockAfter: newStock,
          timestamp: new Date().toISOString(),
          note: `${orderChannel === 'online' ? 'Order Online' : 'Kasir POS'} #${invoiceNo}`
        });

        if (newStock <= prod.minStockAlert) {
          setTimeout(() => {
            addToast(
              '⚠️ Peringatan Stok Menipis!', 
              `${prod.name} sisa ${newStock} ${prod.unit} (Batas min: ${prod.minStockAlert}). Segera restock!`,
              'warning'
            );
          }, 300);
        }

        return {
          ...prod,
          stock: newStock
        };
      });
    });

    if (newLogs.length > 0) {
      setStockLogs(prev => [...newLogs, ...prev]);
    }
  };

  // Courier Fleet Management
  const addCourierDriver = (driverData: Omit<CourierDriver, 'id'>) => {
    const newId = 'drv_' + Date.now();
    const newDriver: CourierDriver = {
      ...driverData,
      id: newId,
    };
    setDrivers(prev => [newDriver, ...prev]);
    addToast('Kurir Berhasil Ditambahkan', `${newDriver.name} (${newDriver.vehicleName} - ${newDriver.plateNumber}) siap ditugaskan antar pesanan.`, 'success');
  };

  const updateCourierDriver = (updated: CourierDriver) => {
    setDrivers(prev => prev.map(d => d.id === updated.id ? updated : d));
    addToast('Data Kurir Diperbarui', `Informasi kurir ${updated.name} berhasil disimpan.`, 'success');
  };

  const deleteCourierDriver = (driverId: string) => {
    const target = drivers.find(d => d.id === driverId);
    setDrivers(prev => prev.filter(d => d.id !== driverId));
    addToast('Kurir Dinonaktifkan', `${target?.name || 'Kurir'} telah dihapus dari daftar armada aktif.`, 'info');
  };

  const assignDriverToOrder = (orderId: string, driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const currentLogs = o.courier?.statusLogs || [];
      const updatedCourier: CourierInfo = {
        ...(o.courier || {
          provider: driver.provider,
          providerName: driver.providerName,
          serviceType: 'Pengantaran Khusus SegarMart',
          trackingNumber: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
          shippingFee: 12000,
          status: 'driver_assigned',
          statusLogs: [],
        }),
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverPlate: driver.plateNumber,
        driverVehicle: driver.vehicleName,
        driverAvatar: driver.avatar,
        status: 'driver_assigned',
        statusLogs: [
          ...currentLogs,
          {
            status: 'driver_assigned',
            timestamp: new Date().toISOString(),
            note: `Kurir ditugaskan: ${driver.name} (${driver.vehicleName} - ${driver.plateNumber})`
          }
        ]
      };

      const updated = {
        ...o,
        courier: updatedCourier,
        orderStatus: o.orderStatus === 'waiting_payment' ? o.orderStatus : ('processing' as OrderStatus),
      };

      if (selectedActiveOrder?.id === orderId) {
        setSelectedActiveOrder(updated);
      }
      return updated;
    }));

    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: 'busy', totalDeliveries: (d.totalDeliveries || 0) + 1 } : d));
    addToast('Kurir Ditugaskan', `${driver.name} telah ditugaskan untuk mengantar pesanan.`, 'success');
  };

  // Online Checkout creation
  const createOnlineOrder = (data: OnlineCheckoutData): Order => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = Math.max(0, subtotal - data.discount + data.shippingFee);
    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`;
    
    const providerNames: Record<CourierProvider, { name: string; service: string }> = {
      gosend_instant: { name: 'GoSend Instant', service: '1-2 Jam Sampai' },
      grab_sameday: { name: 'GrabExpress Sameday', service: '3-6 Jam Sampai' },
      anteraja_fresh: { name: 'Anteraja Fresh Cold', service: 'Next Day Cold Storage' },
      kurir_toko: { name: storeProfile.name + ' Kurir Internal', service: 'Pengantaran Khusus Toko' },
      lalamove: { name: 'Lalamove Delivery', service: 'Pengantaran Cepat Armada' },
      kurir_langganan: { name: 'Kurir Langganan', service: 'Pengantaran Rutin' },
    };

    const provInfo = providerNames[data.courierProvider] || providerNames.kurir_toko;

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      invoiceNumber,
      channel: 'online',
      createdAt: new Date().toISOString(),
      items: [...data.items],
      subtotal,
      discount: data.discount,
      shippingFee: data.shippingFee,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'waiting_payment',
      customer: data.customer,
      courier: {
        provider: data.courierProvider,
        providerName: provInfo.name,
        serviceType: provInfo.service,
        trackingNumber: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingFee: data.shippingFee,
        status: 'unassigned',
        statusLogs: [
          {
            status: 'unassigned',
            timestamp: new Date().toISOString(),
            note: 'Pesanan dibuat. Menunggu konfirmasi pembayaran digital.'
          }
        ]
      }
    };

    deductStockForItems(data.items, 'online', invoiceNumber);
    clearOnlineCart();

    setOrders(prev => [newOrder, ...prev]);
    setSelectedActiveOrder(newOrder);

    addToast('Pesanan Online Dibuat', `No. Invoice ${invoiceNumber}. Selesaikan pembayaran digital.`, 'info');
    return newOrder;
  };

  // Confirm Digital Payment (QRIS, E-Wallet, VA)
  const confirmDigitalPayment = (orderId: string) => {
    const matchingDriver = drivers.find(d => d.status === 'active') || drivers[0];

    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;

      const driverName = matchingDriver?.name || 'Agus Setiawan';
      const driverPhone = matchingDriver?.phone || '0857-1199-4433';
      const driverPlate = matchingDriver?.plateNumber || 'B 4821 TKD';
      const driverVehicle = matchingDriver?.vehicleName || 'Honda Vario 160 Hitam';
      const driverAvatar = matchingDriver?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

      const updatedCourier = order.courier ? {
        ...order.courier,
        driverId: matchingDriver?.id,
        driverName,
        driverPhone,
        driverPlate,
        driverVehicle,
        driverAvatar,
        estimatedMinutes: 20,
        status: 'driver_assigned' as CourierStatus,
        statusLogs: [
          ...order.courier.statusLogs,
          {
            status: 'driver_assigned' as CourierStatus,
            timestamp: new Date().toISOString(),
            note: `Pembayaran sukses diverifikasi! Sistem otomatis menugaskan kurir: ${driverName} (${driverPlate})`
          }
        ]
      } : undefined;

      const updated: Order = {
        ...order,
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paidAt: new Date().toISOString(),
        courier: updatedCourier,
      };

      if (selectedActiveOrder?.id === orderId) {
        setSelectedActiveOrder(updated);
      }

      return updated;
    }));

    if (matchingDriver) {
      setDrivers(prev => prev.map(d => d.id === matchingDriver.id ? { ...d, status: 'busy' } : d));
    }

    addToast('Pembayaran Berhasil! 💸', 'Dana terverifikasi real-time. Kurir otomatis ditugaskan.', 'success');
  };

  // POS Cashier checkout
  const processPosSale = (data: PosSaleData): Order => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const total = Math.max(0, subtotal - data.discount);
    const invoiceNumber = `POS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: 'pos_' + Date.now(),
      invoiceNumber,
      channel: 'pos_kasir',
      createdAt: new Date().toISOString(),
      items: [...data.items],
      subtotal,
      discount: data.discount,
      shippingFee: 0,
      total,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'paid',
      orderStatus: 'completed',
      paidAt: new Date().toISOString(),
      cashGiven: data.cashGiven,
      changeDue: data.changeDue,
      cashierName: data.cashierName,
    };

    deductStockForItems(data.items, 'pos_kasir', invoiceNumber);
    clearPosCart();

    setOrders(prev => [newOrder, ...prev]);
    setSelectedActiveOrder(newOrder);

    addToast('Transaksi POS Selesai', `Struk kasir ${invoiceNumber} senilai Rp ${total.toLocaleString('id-ID')} tersimpan.`, 'success');
    return newOrder;
  };

  // Update order / courier status
  const updateOrderStatus = (orderId: string, status: OrderStatus, courierStatus?: CourierStatus, note?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;

      const updatedCourier = o.courier && courierStatus ? {
        ...o.courier,
        status: courierStatus,
        statusLogs: [
          ...o.courier.statusLogs,
          {
            status: courierStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status diperbarui menjadi ${courierStatus}`
          }
        ]
      } : o.courier;

      const updated = {
        ...o,
        orderStatus: status,
        courier: updatedCourier,
      };

      if (selectedActiveOrder?.id === orderId) {
        setSelectedActiveOrder(updated);
      }

      return updated;
    }));
  };

  // Advance courier step simulation
  const advanceCourierStatus = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.courier) return;

    const current = order.courier.status;
    let nextCourier: CourierStatus = current;
    let nextOrder: OrderStatus = order.orderStatus;
    let note = '';

    if (current === 'unassigned') {
      nextCourier = 'driver_assigned';
      nextOrder = 'processing';
      note = 'Sistem kurir otomatis menemukan driver terdekat.';
    } else if (current === 'driver_assigned') {
      nextCourier = 'picked_up';
      nextOrder = 'shipping';
      note = 'Driver telah tiba di toko & mengambil paket sembako/sayur.';
    } else if (current === 'picked_up') {
      nextCourier = 'on_the_way';
      nextOrder = 'shipping';
      note = 'Driver meluncur menuju alamat tujuan pembeli.';
    } else if (current === 'on_the_way') {
      nextCourier = 'delivered';
      nextOrder = 'completed';
      note = 'Paket sayur & buah telah diserahterimakan kepada pembeli.';
    }

    updateOrderStatus(orderId, nextOrder, nextCourier, note);
    addToast('Status Pengiriman Diperbarui', note, 'info');
  };

  // Update full order details
  const updateOrder = (updatedOrder: Order) => {
    const subtotal = updatedOrder.items.reduce((sum, item) => {
      const price = item.customPrice !== undefined ? item.customPrice : item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    const total = Math.max(0, subtotal - (updatedOrder.discount || 0) + (updatedOrder.shippingFee || 0));
    const changeDue = updatedOrder.cashGiven !== undefined && updatedOrder.cashGiven > 0
      ? Math.max(0, updatedOrder.cashGiven - total)
      : undefined;

    const finalizedOrder: Order = {
      ...updatedOrder,
      subtotal,
      total,
      changeDue,
    };

    setOrders(prev => prev.map(o => o.id === finalizedOrder.id ? finalizedOrder : o));

    if (selectedActiveOrder?.id === finalizedOrder.id) {
      setSelectedActiveOrder(finalizedOrder);
    }

    addToast('Struk & Penjualan Disimpan', `Perubahan transaksi ${finalizedOrder.invoiceNumber} berhasil disimpan.`, 'success');
  };

  // Delete transaction order
  const deleteOrder = (orderId: string) => {
    const target = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (selectedActiveOrder?.id === orderId) {
      setSelectedActiveOrder(orders.find(o => o.id !== orderId) || null);
    }
    addToast('Transaksi Dihapus', `Nota ${target?.invoiceNumber || orderId} berhasil dihapus dari sistem.`, 'info');
  };

  // Inventory Management Actions
  const restockProduct = (productId: string, quantity: number, note = 'Restock barang masuk') => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    const newStock = target.stock + quantity;
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));

    const log: StockLog = {
      id: 'log_' + Date.now(),
      productId,
      productName: target.name,
      type: 'restock',
      quantityChange: quantity,
      currentStockAfter: newStock,
      timestamp: new Date().toISOString(),
      note: `${note} (+${quantity} ${target.unit})`
    };

    setStockLogs(prev => [log, ...prev]);
    addToast('Stok Berhasil Ditambah', `${target.name} bertambah ${quantity} ${target.unit}. Total stok: ${newStock}`, 'success');
  };

  const logWasteProduct = (productId: string, quantity: number, reason: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    const actualQty = Math.min(quantity, target.stock);
    const newStock = target.stock - actualQty;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));

    const log: StockLog = {
      id: 'log_' + Date.now(),
      productId,
      productName: target.name,
      type: 'adjustment_waste',
      quantityChange: -actualQty,
      currentStockAfter: newStock,
      timestamp: new Date().toISOString(),
      note: `Penyusutan/Rusak: ${reason} (-${actualQty} ${target.unit})`
    };

    setStockLogs(prev => [log, ...prev]);
    addToast('Penyesuaian Barang Rusak/Layu', `${target.name} dikurangi ${actualQty} ${target.unit} (${reason}).`, 'warning');
  };

  const updateProductDetails = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    addToast('Data Produk Disimpan', `Informasi produk ${updated.name} berhasil diperbarui.`, 'success');
  };

  const addNewProduct = (productData: Omit<Product, 'id'>) => {
    const newId = 'prod_' + Date.now();
    const newProduct: Product = {
      ...productData,
      id: newId,
    };
    setProducts(prev => [newProduct, ...prev]);

    const log: StockLog = {
      id: 'log_' + Date.now(),
      productId: newId,
      productName: newProduct.name,
      type: 'restock',
      quantityChange: newProduct.stock,
      currentStockAfter: newProduct.stock,
      timestamp: new Date().toISOString(),
      note: 'Produk baru didaftarkan ke inventaris'
    };
    setStockLogs(prev => [log, ...prev]);

    addToast('Produk Baru Ditambahkan', `${newProduct.name} telah terdaftar dan siap dijual.`, 'success');
  };

  const deleteProduct = (productId: string) => {
    const p = products.find(item => item.id === productId);
    setProducts(prev => prev.filter(item => item.id !== productId));
    addToast('Produk Dihapus', `${p?.name || 'Produk'} dihapus dari katalog.`, 'info');
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.DRIVERS);
    localStorage.removeItem(STORAGE_KEYS.STOCK_LOGS);
    localStorage.removeItem(STORAGE_KEYS.RECEIPT_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.STORE_PROFILE);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setDrivers(INITIAL_DRIVERS);
    setStockLogs(INITIAL_STOCK_LOGS);
    setReceiptSettings(DEFAULT_STORE_PROFILE.receipt);
    setStoreProfile(DEFAULT_STORE_PROFILE);
    setOnlineCart([]);
    setPosCart([]);
    setSelectedActiveOrder(INITIAL_ORDERS[0]);
    addToast('Data Direset', 'Katalog sembako, armada kurir, dan pengaturan toko telah dikembalikan ke kondisi awal.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        drivers,
        stockLogs,
        onlineCart,
        posCart,
        toasts,
        selectedActiveOrder,
        activeTab,
        receiptSettings,
        storeProfile,
        setActiveTab,
        setSelectedActiveOrder,
        updateReceiptSettings,
        updateStoreProfile,
        addToOnlineCart,
        updateOnlineCartQuantity,
        removeFromOnlineCart,
        clearOnlineCart,
        addToPosCart,
        updatePosCartQuantity,
        removeFromPosCart,
        clearPosCart,
        createOnlineOrder,
        processPosSale,
        confirmDigitalPayment,
        updateOrderStatus,
        advanceCourierStatus,
        updateOrder,
        deleteOrder,
        addCourierDriver,
        updateCourierDriver,
        deleteCourierDriver,
        assignDriverToOrder,
        restockProduct,
        logWasteProduct,
        updateProductDetails,
        addNewProduct,
        deleteProduct,
        addToast,
        removeToast,
        resetAllDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
