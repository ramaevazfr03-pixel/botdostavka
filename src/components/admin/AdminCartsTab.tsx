import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserCartSummary } from '../../types';
import {
  ShoppingCart,
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Gift,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface AdminCartsTabProps {
  onGoToBroadcast: (audience: 'abandoned_cart' | 'all') => void;
}

export const AdminCartsTab: React.FC<AdminCartsTabProps> = ({ onGoToBroadcast }) => {
  const { userCarts, addNotification } = useApp();
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'active'>('all');
  const [discountModalUser, setDiscountModalUser] = useState<UserCartSummary | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(10);

  const filteredCarts = userCarts.filter((c) => {
    if (filter === 'abandoned') return c.status === 'abandoned';
    if (filter === 'active') return c.status === 'active';
    return true;
  });

  const totalCartValue = userCarts.reduce((sum, c) => sum + c.totalRub, 0);
  const abandonedCount = userCarts.filter((c) => c.status === 'abandoned').length;

  const handleSendPersonalPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountModalUser) return;

    addNotification(
      `Персональный промокод отправлен в Telegram`,
      `Клиенту ${discountModalUser.userTelegram} начислена скидка ${discountPercent}% на текущую корзину!`,
      'broadcast'
    );
    setDiscountModalUser(null);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header & Quick stats */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Корзины клиентов в реальном времени (CRM)</h2>
          <p className="text-xs text-neutral-400">
            Отслеживание наполнения корзин пользователей, забытых товаров и таргетинг рассылок
          </p>
        </div>

        {/* Quick action button for all abandoned carts */}
        <button
          onClick={() => onGoToBroadcast('abandoned_cart')}
          className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Рассылка по всем брошенным корзинам ({abandonedCount})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-[11px] text-neutral-500">Потенциальная выручка в корзинах:</div>
          <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">
            {totalCartValue.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Товары, выбранные покупателями</div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-[11px] text-neutral-500">Брошенные корзины (требуют дожима):</div>
          <div className="text-xl font-extrabold text-red-400 font-mono mt-1">
            {abandonedCount} корзин
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Не оформили заказ более 2 часов</div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-[11px] text-neutral-500">Активные сессии прямо сейчас:</div>
          <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
            {userCarts.filter((c) => c.status === 'active').length} онлайн
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">Выбирают размеры и цвета</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-neutral-800 text-white font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Все ({userCarts.length})
        </button>
        <button
          onClick={() => setFilter('abandoned')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === 'abandoned'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Только брошенные ({abandonedCount})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Активные сейчас ({userCarts.filter((c) => c.status === 'active').length})
        </button>
      </div>

      {/* Live Carts Feed */}
      <div className="space-y-4">
        {filteredCarts.map((cart) => {
          const isAbandoned = cart.status === 'abandoned';

          return (
            <div
              key={cart.userId}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isAbandoned
                  ? 'bg-neutral-900/95 border-red-500/20 shadow-sm'
                  : 'bg-neutral-900 border-neutral-800'
              }`}
            >
              {/* Header row: User + Status + Cart Sum */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center font-bold text-white text-sm shrink-0">
                    {cart.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{cart.userName}</span>
                      <span className="font-mono text-sky-400 text-xs">{cart.userTelegram}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isAbandoned
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {isAbandoned ? 'Брошенная корзина' : 'Активна онлайн'}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>Активность: {cart.updatedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Right side price & actions */}
                <div className="flex items-center gap-3 sm:self-center">
                  <div className="text-right">
                    <div className="font-mono font-extrabold text-amber-400 text-sm">
                      {cart.totalRub.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {cart.items.reduce((s, i) => s + i.quantity, 0)} шт. в корзине
                    </div>
                  </div>

                  <button
                    onClick={() => setDiscountModalUser(cart)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors shadow-sm"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>Скидка в TG</span>
                  </button>
                </div>
              </div>

              {/* Items in Cart */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80">
                <div className="text-xs font-semibold text-neutral-400 mb-2">
                  Отложенные товары:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {cart.items.map((it) => (
                    <div
                      key={it.id}
                      className="p-2.5 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center gap-2.5 text-xs"
                    >
                      <img
                        src={it.image}
                        alt={it.title}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover bg-neutral-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-neutral-200 truncate">{it.title}</div>
                        <div className="text-[11px] text-neutral-400">
                          {it.selectedSize} · {it.selectedColor} · {it.quantity} шт.
                        </div>
                      </div>
                      <div className="font-mono font-bold text-neutral-300 text-right shrink-0">
                        {(it.priceRub * it.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests Tags */}
              <div className="mt-3 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-neutral-500 flex items-center gap-1 text-[11px]">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Интересы пользователя:</span>
                </span>
                {cart.interests.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-neutral-950 border border-neutral-800 rounded-lg text-[10px] text-neutral-300 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Discount modal */}
      {discountModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl p-5 text-neutral-100">
            <h3 className="text-sm font-bold text-white mb-1">
              Персональное предложение для {discountModalUser.userTelegram}
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Отправить персональный пуш в Telegram бот с промокодом на товары в корзине (сумма корзины: {discountModalUser.totalRub.toLocaleString('ru-RU')} ₽)
            </p>

            <form onSubmit={handleSendPersonalPromo} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Размер скидки:</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        discountPercent === pct
                          ? 'bg-amber-500 text-neutral-950 border-amber-500'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1 text-[11px] text-neutral-300">
                <div className="text-neutral-500">Текст сообщения в бота:</div>
                <div className="italic">
                  "👋 {discountModalUser.userName}, вы оставили товары в корзине на сумму {discountModalUser.totalRub.toLocaleString('ru-RU')} ₽! Только сегодня для вас действует скидка {discountPercent}% по промокоду 1688SALE{discountPercent}. Завершите оформление до закрытия рейса!"
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDiscountModalUser(null)}
                  className="px-3.5 py-2 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl shadow-sm"
                >
                  Отправить в Telegram
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
