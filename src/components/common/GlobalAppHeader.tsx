import React from 'react';
import { useApp } from '../../context/AppContext';
import { Smartphone, Monitor, ShieldCheck, ShoppingBag, Bot, ArrowRightLeft } from 'lucide-react';

interface GlobalAppHeaderProps {
  onOpenBotSim: () => void;
}

export const GlobalAppHeader: React.FC<GlobalAppHeaderProps> = ({ onOpenBotSim }) => {
  const {
    currentMode,
    setCurrentMode,
    isTelegramFrame,
    setIsTelegramFrame,
    logistics,
    cart,
    orders,
    userCarts,
  } = useApp();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const abandonedCartsCount = userCarts.filter((c) => c.status === 'abandoned').length;

  return (
    <header className="w-full bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40 text-neutral-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
              1688
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>CargoBuy</span>
                <span className="text-[11px] font-normal text-amber-400/90 hidden sm:inline">
                  · Выкуп & Карго
                </span>
              </div>
            </div>
          </div>

          {/* Quick Rates ticker */}
          <div className="hidden lg:flex items-center gap-3 ml-2 pl-3 border-l border-neutral-800 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Курс:</span>
              <span className="text-neutral-200 font-mono font-medium">1¥ = {logistics.cnyRubRate} ₽</span>
            </div>
            <span className="text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Комиссия:</span>
              <span className="text-neutral-200 font-mono font-medium">{logistics.commissionPercent}%</span>
            </div>
            <span className="text-neutral-700">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500">Авто-карго:</span>
              <span className="text-neutral-200 font-mono font-medium">${logistics.cargoRatesUsdPerKg.fast_auto}/кг</span>
            </div>
          </div>
        </div>

        {/* Center / Action Controls */}
        <div className="flex items-center gap-2">
          {/* Direct link to real Telegram Bot */}
          <a
            href="https://t.me/kitaidostavka_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-lg text-xs font-semibold text-sky-400 transition-colors"
            title="Открыть официального Telegram бота @kitaidostavka_bot"
          >
            <Bot className="w-4 h-4 shrink-0 text-sky-400" />
            <span className="hidden sm:inline">@kitaidostavka_bot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </a>

          {/* Telegram Bot Simulator Trigger */}
          <button
            onClick={onOpenBotSim}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/80 hover:border-sky-500/50 rounded-lg text-xs font-medium text-neutral-300 hover:text-white transition-colors"
            title="Открыть симулятор Telegram бота"
          >
            <span className="hidden md:inline">Симулятор бота</span>
          </button>

          {/* Frame switch (only relevant in buyer mode) */}
          {currentMode === 'buyer' && (
            <button
              onClick={() => setIsTelegramFrame(!isTelegramFrame)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-lg text-xs font-medium text-neutral-300 transition-colors"
              title={isTelegramFrame ? 'Переключить в широкий режим' : 'Включить рамку смартфона'}
            >
              {isTelegramFrame ? (
                <>
                  <Monitor className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden md:inline">Широкий экран</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden md:inline">Экран смартфона</span>
                </>
              )}
            </button>
          )}

          {/* Mode Switcher: Buyer WebApp vs Admin Panel */}
          <div className="flex items-center p-0.5 bg-neutral-950 border border-neutral-800 rounded-lg">
            <button
              onClick={() => setCurrentMode('buyer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentMode === 'buyer'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Покупатель</span>
              {totalCartItems > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-amber-500 text-neutral-950 text-[10px] font-bold rounded-full">
                  {totalCartItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentMode === 'admin'
                  ? 'bg-amber-500 text-neutral-950 font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Админ-панель</span>
              {activeOrdersCount > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    currentMode === 'admin'
                      ? 'bg-neutral-950 text-amber-400'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {activeOrdersCount}
                </span>
              )}
              {abandonedCartsCount > 0 && currentMode !== 'admin' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Есть брошенные корзины" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
