import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  CartItem,
  UserCartSummary,
  BroadcastNewsletter,
  LogisticsSettings,
  UserProfile,
  ChatMessage,
  OrderStatus,
  OrderDeliveryType,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_USER_CARTS,
  INITIAL_BROADCASTS,
  INITIAL_LOGISTICS_SETTINGS,
  INITIAL_USER_PROFILE,
  INITIAL_CHAT_MESSAGES,
} from '../data/initialData';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'order' | 'broadcast';
}

interface AppContextType {
  currentMode: 'buyer' | 'admin';
  setCurrentMode: (mode: 'buyer' | 'admin') => void;
  activeBuyerTab: 'catalog' | 'tracking' | 'cabinet' | 'calculator';
  setActiveBuyerTab: (tab: 'catalog' | 'tracking' | 'cabinet' | 'calculator') => void;
  isTelegramFrame: boolean;
  setIsTelegramFrame: (val: boolean) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // User Carts & CRM
  userCarts: UserCartSummary[];
  
  // Orders
  orders: Order[];
  createOrderFromCart: (orderData: {
    deliveryType: OrderDeliveryType;
    packagingType: 'carton' | 'wooden_crate';
    destinationCity: string;
    destinationAddress: string;
    recipientPassport: string;
    paymentMethod: 'sbp' | 'card';
    notes?: string;
  }) => Order;
  createCustomOrder: (customData: {
    linkOrPhoto: string;
    title: string;
    estimatedPriceYuan: number;
    size: string;
    color: string;
    quantity: number;
    weightKg: number;
    deliveryType: OrderDeliveryType;
    destinationCity: string;
    destinationAddress: string;
    notes?: string;
  }) => Order;
  adminUpdateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    comment?: string,
    cargoTrack?: string,
    cdekTrack?: string,
    actualWeightKg?: number,
    newPhotoUrl?: string
  ) => void;
  adminUpdateOrderNotes: (orderId: string, notes: string) => void;
  
  // Chat
  chatMessages: Record<string, ChatMessage[]>;
  sendChatMessage: (orderId: string, text: string, sender: 'user' | 'manager') => void;
  
  // Logistics & Settings
  logistics: LogisticsSettings;
  updateLogistics: (settings: LogisticsSettings) => void;
  calculateCost: (
    weightKg: number,
    deliveryType: OrderDeliveryType,
    packagingType: 'carton' | 'wooden_crate',
    itemPriceRub: number
  ) => {
    cargoUsd: number;
    cargoRub: number;
    packagingRub: number;
    insuranceRub: number;
    totalDeliveryRub: number;
  };
  
  // Broadcasts
  broadcasts: BroadcastNewsletter[];
  sendBroadcast: (broadcast: Omit<BroadcastNewsletter, 'id' | 'sentAt' | 'recipientsCount' | 'readCount'>) => void;
  
  // Telegram Bot Status
  telegramBotStatus: {
    online: boolean;
    username: string;
    botId: number;
    botName: string;
    subscribersCount: number;
    recentLogs: { id: string; timestamp: string; type: string; user: string; message: string }[];
  };
  refreshBotStatus: () => void;
  
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  
  // Notifications
  notifications: AppNotification[];
  dismissNotification: (id: string) => void;
  addNotification: (title: string, message: string, type?: AppNotification['type']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMode, setCurrentMode] = useState<'buyer' | 'admin'>('buyer');
  const [activeBuyerTab, setActiveBuyerTab] = useState<'catalog' | 'tracking' | 'cabinet' | 'calculator'>('catalog');
  const [isTelegramFrame, setIsTelegramFrame] = useState<boolean>(true);

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('app_1688_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('app_1688_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('app_1688_cart');
    return saved ? JSON.parse(saved) : INITIAL_USER_CARTS[0].items;
  });

  const [userCarts, setUserCarts] = useState<UserCartSummary[]>(() => {
    const saved = localStorage.getItem('app_1688_user_carts');
    return saved ? JSON.parse(saved) : INITIAL_USER_CARTS;
  });

  const [broadcasts, setBroadcasts] = useState<BroadcastNewsletter[]>(() => {
    const saved = localStorage.getItem('app_1688_broadcasts');
    return saved ? JSON.parse(saved) : INITIAL_BROADCASTS;
  });

  const [logistics, setLogistics] = useState<LogisticsSettings>(() => {
    const saved = localStorage.getItem('app_1688_logistics');
    return saved ? JSON.parse(saved) : INITIAL_LOGISTICS_SETTINGS;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('app_1688_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('app_1688_chats');
    return saved ? JSON.parse(saved) : (INITIAL_CHAT_MESSAGES as Record<string, ChatMessage[]>);
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-welcome',
      title: 'Добро пожаловать в 1688 CargoBuy',
      message: 'Каталог выкупа обновлен. Текущий курс ¥: 13.85 ₽. Доставка карго от 13 дней.',
      timestamp: 'Только что',
      type: 'info',
    },
  ]);

  const [telegramBotStatus, setTelegramBotStatus] = useState<{
    online: boolean;
    username: string;
    botId: number;
    botName: string;
    subscribersCount: number;
    recentLogs: { id: string; timestamp: string; type: string; user: string; message: string }[];
  }>({
    online: true,
    username: 'kitaidostavka_bot',
    botId: 8612124409,
    botName: 'Выкуп и Доставка из Китая',
    subscribersCount: 3,
    recentLogs: [],
  });

  const refreshBotStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setTelegramBotStatus({
            online: data.running,
            username: data.bot.username,
            botId: data.bot.id,
            botName: data.bot.name,
            subscribersCount: data.subscribersCount,
            recentLogs: data.recentLogs || [],
          });
        }
      }
    } catch (e) {
      // offline or mock
    }
  };

  useEffect(() => {
    refreshBotStatus();
    const interval = setInterval(refreshBotStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('app_1688_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('app_1688_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('app_1688_cart', JSON.stringify(cart));
    // Keep userCarts synced with buyer's live cart
    setUserCarts((prev) => {
      const totalRub = cart.reduce((sum, it) => sum + it.priceRub * it.quantity, 0);
      return prev.map((uc) =>
        uc.userId === userProfile.id
          ? {
              ...uc,
              items: cart,
              totalRub,
              updatedAt: 'Только что (активен)',
              status: cart.length > 0 ? 'active' : 'abandoned',
            }
          : uc
      );
    });
  }, [cart, userProfile.id]);

  useEffect(() => {
    localStorage.setItem('app_1688_user_carts', JSON.stringify(userCarts));
  }, [userCarts]);

  useEffect(() => {
    localStorage.setItem('app_1688_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);

  useEffect(() => {
    localStorage.setItem('app_1688_logistics', JSON.stringify(logistics));
  }, [logistics]);

  useEffect(() => {
    localStorage.setItem('app_1688_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('app_1688_chats', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 10)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const calculateCost = (
    weightKg: number,
    deliveryType: OrderDeliveryType,
    packagingType: 'carton' | 'wooden_crate',
    itemPriceRub: number
  ) => {
    const rateUsdPerKg = logistics.cargoRatesUsdPerKg[deliveryType] || 4.6;
    const safeWeight = Math.max(0.2, weightKg);
    const cargoUsd = +(safeWeight * rateUsdPerKg).toFixed(2);
    const cargoRub = Math.round(cargoUsd * logistics.usdRubRate);
    const packagingRub = logistics.packagingFeesRub[packagingType] || 450;
    const insuranceRub = Math.round(itemPriceRub * (logistics.insurancePercent / 100));
    const totalDeliveryRub = cargoRub + packagingRub + insuranceRub;

    return {
      cargoUsd,
      cargoRub,
      packagingRub,
      insuranceRub,
      totalDeliveryRub,
    };
  };

  const addToCart = (product: Product, size: string, color: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find(
        (it) => it.productId === product.id && it.selectedSize === size && it.selectedColor === color
      );
      if (existing) {
        return prev.map((it) =>
          it.id === existing.id ? { ...it, quantity: it.quantity + quantity } : it
        );
      }
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        productId: product.id,
        title: product.title,
        priceRub: product.priceRub,
        priceYuan: product.priceYuan,
        image: product.image,
        selectedSize: size,
        selectedColor: color,
        quantity,
        estimatedWeightKg: product.estimatedWeightKg,
        link1688: product.original1688Url,
      };
      return [...prev, newItem];
    });
    addNotification('Товар добавлен в корзину', `${product.title} (${size}, ${color})`, 'success');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((it) => it.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) => prev.map((it) => (it.id === cartItemId ? { ...it, quantity } : it)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrderFromCart = (orderData: {
    deliveryType: OrderDeliveryType;
    packagingType: 'carton' | 'wooden_crate';
    destinationCity: string;
    destinationAddress: string;
    recipientPassport: string;
    paymentMethod: 'sbp' | 'card';
    notes?: string;
  }): Order => {
    const totalItemsPriceRub = cart.reduce((sum, it) => sum + it.priceRub * it.quantity, 0);
    const totalWeightKg = +(cart.reduce((sum, it) => sum + it.estimatedWeightKg * it.quantity, 0)).toFixed(2);
    
    const cost = calculateCost(totalWeightKg, orderData.deliveryType, orderData.packagingType, totalItemsPriceRub);
    const totalPaidRub = totalItemsPriceRub + cost.totalDeliveryRub;

    const orderNum = `CN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: dateFormatted,
      customerId: userProfile.id,
      customerName: userProfile.name,
      customerUsername: userProfile.telegramUsername,
      customerPhone: userProfile.phone,
      items: cart.map((it) => ({
        title: it.title,
        priceRub: it.priceRub,
        priceYuan: it.priceYuan,
        image: it.image,
        size: it.selectedSize,
        color: it.selectedColor,
        quantity: it.quantity,
        weightKg: it.estimatedWeightKg,
        link1688: it.link1688,
      })),
      totalItemsPriceRub,
      deliveryType: orderData.deliveryType,
      estimatedCargoRub: cost.cargoRub,
      packagingType: orderData.packagingType,
      insuranceRub: cost.insuranceRub,
      totalPaidRub,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: 'paid', // Instant confirmation in app demo
      status: 'paid',
      destinationCity: orderData.destinationCity,
      destinationAddress: orderData.destinationAddress,
      recipientPassport: orderData.recipientPassport,
      actualWeightKg: totalWeightKg,
      statusHistory: [
        {
          status: 'pending_payment',
          timestamp: dateFormatted,
          comment: 'Заказ успешно оформлен через корзину 1688 CargoBuy',
        },
        {
          status: 'paid',
          timestamp: dateFormatted,
          comment: `Оплата ${totalPaidRub.toLocaleString('ru-RU')} ₽ подтверждена (СБП). Заказ передан байеру на выкуп.`,
        },
      ],
      notes: orderData.notes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Init order chat message
    setChatMessages((prev) => ({
      ...prev,
      [newOrder.id]: [
        {
          id: `msg-${Date.now()}`,
          orderId: newOrder.id,
          sender: 'manager',
          senderName: 'Байер 1688',
          text: `Здравствуйте, ${userProfile.name}! Ваш заказ ${orderNum} оплачен и принят в работу. Мы свяжемся с фабриками на 1688 в течение нескольких часов и пришлем статус выкупа. Если нужно изменить цвет или размер, напишите сюда!`,
          timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        },
      ],
    }));

    addNotification(
      `Заказ ${orderNum} оформлен!`,
      `Сумма: ${totalPaidRub.toLocaleString('ru-RU')} ₽. Статус: "Оплачен, передан на выкуп в Китай"`,
      'order'
    );

    return newOrder;
  };

  const createCustomOrder = (customData: {
    linkOrPhoto: string;
    title: string;
    estimatedPriceYuan: number;
    size: string;
    color: string;
    quantity: number;
    weightKg: number;
    deliveryType: OrderDeliveryType;
    destinationCity: string;
    destinationAddress: string;
    notes?: string;
  }): Order => {
    const yuanPrice = customData.estimatedPriceYuan || 100;
    const rubleItemPrice = Math.round(yuanPrice * logistics.cnyRubRate * (1 + logistics.commissionPercent / 100));
    const totalItemsPriceRub = rubleItemPrice * customData.quantity;
    const totalWeightKg = +(customData.weightKg * customData.quantity).toFixed(2);
    const cost = calculateCost(totalWeightKg, customData.deliveryType, 'carton', totalItemsPriceRub);
    const totalPaidRub = totalItemsPriceRub + cost.totalDeliveryRub;

    const orderNum = `CN-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      date: dateFormatted,
      customerId: userProfile.id,
      customerName: userProfile.name,
      customerUsername: userProfile.telegramUsername,
      customerPhone: userProfile.phone,
      items: [
        {
          title: customData.title,
          priceRub: rubleItemPrice,
          priceYuan: yuanPrice,
          image: '/src/assets/images/cargo_warehouse_box_1791286807409.jpg',
          size: customData.size,
          color: customData.color,
          quantity: customData.quantity,
          weightKg: customData.weightKg,
          link1688: customData.linkOrPhoto,
        },
      ],
      totalItemsPriceRub,
      deliveryType: customData.deliveryType,
      estimatedCargoRub: cost.cargoRub,
      packagingType: 'carton',
      insuranceRub: cost.insuranceRub,
      totalPaidRub,
      paymentMethod: 'sbp',
      paymentStatus: 'paid',
      status: 'buying_1688',
      destinationCity: customData.destinationCity,
      destinationAddress: customData.destinationAddress,
      actualWeightKg: totalWeightKg,
      statusHistory: [
        {
          status: 'pending_payment',
          timestamp: dateFormatted,
          comment: 'Индивидуальная заявка на выкуп по ссылке создана',
        },
        {
          status: 'paid',
          timestamp: dateFormatted,
          comment: 'Оплата получена',
        },
        {
          status: 'buying_1688',
          timestamp: dateFormatted,
          comment: 'Менеджер открыл диалог с поставщиком на 1688 для проверки наличия и бронирования партии',
        },
      ],
      notes: `${customData.notes ? customData.notes + ' | ' : ''}Ссылка 1688: ${customData.linkOrPhoto}`,
    };

    setOrders((prev) => [newOrder, ...prev]);

    setChatMessages((prev) => ({
      ...prev,
      [newOrder.id]: [
        {
          id: `msg-${Date.now()}`,
          orderId: newOrder.id,
          sender: 'manager',
          senderName: 'Байер 1688',
          text: `Здравствуйте! Мы получили вашу ссылку на выкуп ${customData.title}. Сейчас связываемся с китайским фабрикантом для уточнения остатка цветов и размеров. Мы напишем сюда сразу после ответа фабрики!`,
          timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        },
      ],
    }));

    addNotification(
      `Заявка на выкуп ${orderNum} создана`,
      `Менеджер связался с китайским поставщиком по вашей ссылке.`,
      'order'
    );

    return newOrder;
  };

  const adminUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    comment?: string,
    cargoTrack?: string,
    cdekTrack?: string,
    actualWeightKg?: number,
    newPhotoUrl?: string
  ) => {
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const newHistory = [
          ...ord.statusHistory,
          {
            status: newStatus,
            timestamp: dateFormatted,
            comment: comment || `Статус изменен администратором на: ${newStatus}`,
          },
        ];

        const updatedPhotos = newPhotoUrl
          ? [...(ord.warehousePhotos || []), newPhotoUrl]
          : ord.warehousePhotos;

        return {
          ...ord,
          status: newStatus,
          statusHistory: newHistory,
          cargoTrackNumber: cargoTrack !== undefined ? cargoTrack : ord.cargoTrackNumber,
          cdekTrackNumber: cdekTrack !== undefined ? cdekTrack : ord.cdekTrackNumber,
          actualWeightKg: actualWeightKg !== undefined ? actualWeightKg : ord.actualWeightKg,
          warehousePhotos: updatedPhotos,
        };
      })
    );

    const statusLabels: Record<OrderStatus, string> = {
      pending_payment: 'Ожидает оплаты',
      paid: 'Оплачен, в очереди на выкуп',
      buying_1688: 'Выкупается у поставщика 1688',
      warehouse_china: 'Поступил на склад в Гуанчжоу/Иу',
      inspected_packed: 'Проверен и упакован (фотоотчет)',
      cargo_transit: 'В пути: Карго Китай -> РФ',
      customs_moscow: 'Прибыл в Москву / Сортировка',
      cdek_transit: 'Передан в СДЭК / Почту РФ',
      delivered: 'Доставлен клиенту',
      cancelled: 'Отменен',
    };

    addNotification(
      `Статус заказа обновлен: ${statusLabels[newStatus]}`,
      `Клиент уведомлен в Telegram. ${comment ? `Комментарий: ${comment}` : ''}`,
      'order'
    );

    // Dispatch real Telegram Bot notification to customer's chat
    const orderToNotify = orders.find((o) => o.id === orderId);
    if (orderToNotify) {
      fetch('/api/telegram/send-order-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderToNotify.orderNumber,
          newStatus,
          comment,
          cargoTrack,
          cdekTrack,
          photoUrl: newPhotoUrl,
        }),
      }).catch(() => {});
    }
  };

  const adminUpdateOrderNotes = (orderId: string, notes: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, notes } : o)));
  };

  const sendChatMessage = (orderId: string, text: string, sender: 'user' | 'manager') => {
    const now = new Date();
    const timeFormatted = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      sender,
      senderName: sender === 'manager' ? 'Менеджер 1688 (Анна)' : userProfile.name,
      text,
      timestamp: timeFormatted,
    };

    setChatMessages((prev) => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), newMsg],
    }));

    if (sender === 'user') {
      addNotification('Новое сообщение от клиента', `${userProfile.name}: "${text.slice(0, 40)}..."`, 'info');
    } else {
      // If manager replies, dispatch to Telegram
      fetch('/api/telegram/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      }).catch(() => {});
    }
  };

  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    addNotification('Товар добавлен в каталог', newProd.title, 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    addNotification('Товар обновлен', updated.title, 'info');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addNotification('Товар удален из каталога', 'Позиция снята с витрины', 'info');
  };

  const updateLogistics = (settings: LogisticsSettings) => {
    setLogistics(settings);
    // Recalculate ruble price for catalog items automatically based on new CNY rate
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        priceRub: Math.round(p.priceYuan * settings.cnyRubRate * (1 + settings.commissionPercent / 100)),
      }))
    );
    addNotification('Настройки логистики сохранены', `Курс ¥: ${settings.cnyRubRate} ₽, комиссия: ${settings.commissionPercent}%`, 'success');
  };

  const sendBroadcast = (data: Omit<BroadcastNewsletter, 'id' | 'sentAt' | 'recipientsCount' | 'readCount'>) => {
    const now = new Date();
    const sentAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Calculate recipients based on audience
    let recipientsCount = 120;
    if (data.targetAudience === 'all') recipientsCount = 490;
    if (data.targetAudience === 'abandoned_cart') recipientsCount = 48;
    if (data.targetAudience === 'sneakers') recipientsCount = 210;
    if (data.targetAudience === 'clothes') recipientsCount = 310;
    if (data.targetAudience === 'accessories') recipientsCount = 95;

    const newBroadcast: BroadcastNewsletter = {
      ...data,
      id: `bc-${Date.now()}`,
      sentAt,
      recipientsCount,
      readCount: Math.round(recipientsCount * 0.82),
    };

    setBroadcasts((prev) => [newBroadcast, ...prev]);

    // Dispatch real Telegram Bot broadcast to actual subscribers
    fetch('/api/telegram/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        messageText: data.messageText,
        discountCode: data.discountCode,
        targetAudience: data.targetAudience,
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.ok) {
          refreshBotStatus();
        }
      })
      .catch(() => {});

    addNotification(
      'Рассылка успешно отправлена в Telegram!',
      `Сообщения доставлены пользователям через бота @kitaidostavka_bot.`,
      'broadcast'
    );
  };

  const updateUserProfile = (profileUpdate: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profileUpdate }));
    addNotification('Профиль обновлен', 'Данные получателя сохранены', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentMode,
        setCurrentMode,
        activeBuyerTab,
        setActiveBuyerTab,
        isTelegramFrame,
        setIsTelegramFrame,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        userCarts,
        orders,
        createOrderFromCart,
        createCustomOrder,
        adminUpdateOrderStatus,
        adminUpdateOrderNotes,
        chatMessages,
        sendChatMessage,
        logistics,
        updateLogistics,
        calculateCost,
        broadcasts,
        sendBroadcast,
        telegramBotStatus,
        refreshBotStatus,
        userProfile,
        updateUserProfile,
        notifications,
        dismissNotification,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
