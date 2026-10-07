import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Package,
  Calculator,
  User,
  ExternalLink,
  PlusCircle,
  Truck,
} from 'lucide-react';

interface BuyerHeaderProps {
  onOpenCart: () => void;
  onOpenCustomOrder: () => void;
  onOpenCalculator: () => void;
}

export const BuyerHeader: React.FC<BuyerHeaderProps> = ({
  onOpenCart,
  onOpenCustomOrder,
  onOpenCalculator,
}) => {
  const {
    activeBuyerTab,
    setActiveBuyerTab,
    cart,
    orders,
    userProfile,
  } = useApp();

  const totalCartCount = cart.reduce((sum, it) => sum + it.quantity, 0);
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');

  return (
    <div className="w-full bg-neutral-900/90 border-b border-neutral-800 backdrop-blur sticky top-14 z-30">
      {/* Top Telegram mini-bar */}
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* User identification */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {userProfile.name.charAt(0)}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-neutral-200">{userProfile.name}</div>
            <div className="text-[11px] text-sky-400 font-mono">{userProfile.telegramUsername}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Custom 1688 order link */}
          <button
            onClick={onOpenCustomOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/80 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Выкуп по ссылке 1688</span>
            <span className="sm:hidden">По ссылке</span>
          </button>

          {/* Cargo calculator */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/80 rounded-lg text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="hidden sm:inline">Калькулятор доставки</span>
            <span className="sm:hidden">Расчет</span>
          </button>

          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>Корзина</span>
            {totalCartCount > 0 && (
              <span className="px-1.5 py-0.2 bg-neutral-950 text-amber-400 font-bold text-[10px] rounded-full">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 border-t border-neutral-800/80 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveBuyerTab('catalog')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeBuyerTab === 'catalog'
              ? 'text-white bg-neutral-800 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span>Каталог 1688</span>
        </button>

        <button
          onClick={() => setActiveBuyerTab('tracking')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeBuyerTab === 'tracking'
              ? 'text-white bg-neutral-800 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-sky-400" />
          <span>Мои посылки</span>
          {activeOrders.length > 0 && (
            <span className="px-1.5 py-0.2 bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-[10px] rounded-full">
              {activeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveBuyerTab('cabinet')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeBuyerTab === 'cabinet'
              ? 'text-white bg-neutral-800 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
          }`}
        >
          <User className="w-3.5 h-3.5 text-emerald-400" />
          <span>Кабинет & СДЭК</span>
        </button>
      </div>
    </div>
  );
};
