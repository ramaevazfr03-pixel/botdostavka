export type ProductCategory = 'clothes' | 'shoes' | 'accessories';

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  priceYuan: number;
  priceRub: number;
  estimatedWeightKg: number;
  image: string;
  original1688Url: string;
  description: string;
  sizes: string[];
  colors: string[];
  minOrderQty: number;
  inStock: boolean;
  rating: number;
  soldCount: number;
  factoryName: string;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  title: string;
  priceRub: number;
  priceYuan: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  estimatedWeightKg: number;
  link1688?: string;
}

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'buying_1688'
  | 'warehouse_china'
  | 'inspected_packed'
  | 'cargo_transit'
  | 'customs_moscow'
  | 'cdek_transit'
  | 'delivered'
  | 'cancelled';

export type OrderDeliveryType = 'fast_auto' | 'regular_auto' | 'air';

export interface OrderItem {
  title: string;
  priceRub: number;
  priceYuan: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  weightKg: number;
  link1688?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  comment?: string;
  location?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerUsername: string;
  customerPhone: string;
  items: OrderItem[];
  totalItemsPriceRub: number;
  deliveryType: OrderDeliveryType;
  estimatedCargoRub: number;
  packagingType: 'carton' | 'wooden_crate';
  insuranceRub: number;
  totalPaidRub: number;
  paymentMethod: 'sbp' | 'card' | 'balance';
  paymentStatus: 'paid' | 'pending' | 'receipt_uploaded';
  paymentReceipt?: string;
  status: OrderStatus;
  destinationCity: string;
  destinationAddress: string;
  recipientPassport?: string;
  cargoTrackNumber?: string;
  cdekTrackNumber?: string;
  actualWeightKg?: number;
  warehousePhotos?: string[];
  statusHistory: StatusHistoryEntry[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'user' | 'manager';
  senderName: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface UserCartSummary {
  userId: string;
  userName: string;
  userTelegram: string;
  items: CartItem[];
  updatedAt: string;
  totalRub: number;
  interests: string[];
  status: 'active' | 'abandoned';
}

export interface BroadcastNewsletter {
  id: string;
  title: string;
  targetAudience: 'all' | 'abandoned_cart' | 'sneakers' | 'clothes' | 'accessories';
  messageText: string;
  discountCode?: string;
  sentAt: string;
  recipientsCount: number;
  readCount: number;
}

export interface LogisticsSettings {
  cnyRubRate: number; // e.g. 13.85
  commissionPercent: number; // e.g. 8%
  usdRubRate: number; // e.g. 94.5
  cargoRatesUsdPerKg: {
    fast_auto: number; // e.g. 4.6
    regular_auto: number; // e.g. 3.4
    air: number; // e.g. 7.5
  };
  packagingFeesRub: {
    carton: number; // 400
    wooden_crate: number; // 1200
  };
  insurancePercent: number; // e.g. 2%
  sbpPhone: string;
  sbpBank: string;
  sbpReceiver: string;
}

export interface UserProfile {
  id: string;
  name: string;
  telegramUsername: string;
  phone: string;
  city: string;
  cdekAddress: string;
  passportData: string;
  balanceRub: number;
}
