import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  ShoppingCart,
  Tag,
  Send,
  BarChart3,
  Settings,
  Flame,
  ArrowLeft,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export type AdminTab =
  | 'orders'
  | 'carts'
  | 'interests'
  | 'catalog'
  | 'broadcast'
  | 'analytics'
  | 'settings';

interface AdminHeaderProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, setActiveTab }) => {
  const { setCurrentMode, orders, userCarts, products, logistics } = useApp();

  const totalRevenueRub = orders.reduce((sum, o) => sum + o.totalPaidRub, 0);
  const totalCommissionRub = Math.round(
    orders.reduce((sum, o) => sum + (o.totalItemsPriceRub * logistics.commissionPercent) / 100, 0)
  );
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const abandonedCartsCount = userCarts.filter((c) => c.status === 'abandoned').length;

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    {
      id: 'orders',
      label: 'Заказы & Логистика',
      icon: <Package className="w-4 h-4" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'carts',
      label: 'Корзины клиентов CRM',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: userCarts.length > 0 ? userCarts.length : undefined,
    },
    {
      id: 'interests',
      label: 'Интересы клиентов',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      id: 'catalog',
      label: 'Каталог & Цены 1688',
      icon: <Tag className="w-4 h-4" />,
      badge: products.length,
    },
    {
      id: 'broadcast',
      label: 'Рассылки в Telegram',
      icon: <Send className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Аналитика и Доход',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Курсы & Настройки',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full bg-neutral-900 border-b border-neutral-800 text-neutral-100">
      {/* Top Admin Summary Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMode('buyer')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться на витрину</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white tracking-tight">CRM & Панель Администратора</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                1688 ВЫКУП
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 hidden sm:block">
              Управление заказами, складским контролем, брошенными корзинами и рассылками
            </div>
          </div>
        </div>

        {/* Quick KPI Stat Tickers */}
        <div className="flex items-center gap-3 text-xs overflow-x-auto no-scrollbar">
          <div className="p-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl shrink-0">
            <div className="text-[10px] text-neutral-500">Выручка заказов:</div>
            <div className="font-mono font-bold text-neutral-100 text-xs">
              {totalRevenueRub.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div className="p-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl shrink-0">
            <div className="text-[10px] text-neutral-500">Чистая комиссия:</div>
            <div className="font-mono font-bold text-amber-400 text-xs">
              +{totalCommissionRub.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div className="p-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl shrink-0">
            <div className="text-[10px] text-neutral-500">Брошенных корзин:</div>
            <div className="font-mono font-bold text-red-400 text-xs">
              {abandonedCartsCount} шт.
            </div>
          </div>

          <div className="p-2 px-3 bg-neutral-950 border border-neutral-800 rounded-xl shrink-0">
            <div className="text-[10px] text-neutral-500">Курс юаня:</div>
            <div className="font-mono font-bold text-sky-400 text-xs">
              1¥ = {logistics.cnyRubRate} ₽
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 border-t border-neutral-800/80 overflow-x-auto no-scrollbar py-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full font-mono ${
                    isActive
                      ? 'bg-neutral-950 text-amber-400'
                      : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
