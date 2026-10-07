import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderDeliveryType } from '../../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck, Box } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (deliveryType: OrderDeliveryType, packagingType: 'carton' | 'wooden_crate') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, removeFromCart, updateCartQuantity, logistics } = useApp();
  const [deliveryType, setDeliveryType] = useState<OrderDeliveryType>('fast_auto');
  const [packagingType, setPackagingType] = useState<'carton' | 'wooden_crate'>('carton');

  if (!isOpen) return null;

  const totalItemsPriceRub = cart.reduce((sum, it) => sum + it.priceRub * it.quantity, 0);
  const totalWeightKg = +(cart.reduce((sum, it) => sum + it.estimatedWeightKg * it.quantity, 0)).toFixed(2);

  // Delivery calculation
  const rateUsd = logistics.cargoRatesUsdPerKg[deliveryType] || 4.6;
  const cargoUsd = +(Math.max(0.2, totalWeightKg) * rateUsd).toFixed(2);
  const cargoRub = Math.round(cargoUsd * logistics.usdRubRate);
  const packagingRub = logistics.packagingFeesRub[packagingType] || 450;
  const insuranceRub = Math.round(totalItemsPriceRub * (logistics.insurancePercent / 100));
  const grandTotalRub = totalItemsPriceRub + cargoRub + packagingRub + insuranceRub;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col text-neutral-100 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Корзина выкупа 1688</h2>
            <span className="text-xs text-neutral-400 font-mono">({cart.length} поз.)</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Items List */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
            <div className="w-14 h-14 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-500 mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-300">Ваша корзина пуста</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs">
              Выберите одежду или обувь из каталога либо оформите заявку по внешней ссылке 1688
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex gap-3 items-center"
              >
                {/* Thumb */}
                <div className="w-16 h-16 rounded-lg bg-neutral-900 overflow-hidden shrink-0 border border-neutral-800">
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-xs font-semibold text-neutral-200 line-clamp-1">{item.title}</div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                    <span>Разм: {item.selectedSize}</span>
                    <span>·</span>
                    <span>Цвет: {item.selectedColor}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {(item.priceRub * item.quantity).toLocaleString('ru-RU')} ₽
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 border border-neutral-800 rounded-md bg-neutral-900 px-1 py-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="text-neutral-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-[11px] font-mono font-semibold px-1 text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="text-neutral-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg transition-colors"
                  title="Удалить"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Logistics summary & Route selection inside cart */}
            <div className="pt-2 space-y-3">
              <div className="text-xs font-semibold text-neutral-300">Способ доставки из Китая:</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeliveryType('fast_auto')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    deliveryType === 'fast_auto'
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="text-[11px] font-bold text-amber-400">Быстрое авто</div>
                  <div className="text-[10px] text-neutral-400">13-18 дн</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('regular_auto')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    deliveryType === 'regular_auto'
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="text-[11px] font-bold text-neutral-300">Обычное авто</div>
                  <div className="text-[10px] text-neutral-400">18-25 дн</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('air')}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    deliveryType === 'air'
                      ? 'bg-sky-500/10 border-sky-500 text-white'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <div className="text-[11px] font-bold text-sky-400">Авиа карго</div>
                  <div className="text-[10px] text-neutral-400">7-10 дн</div>
                </button>
              </div>

              {/* Packaging select */}
              <div className="flex items-center justify-between text-xs text-neutral-400 p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                <span className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Упаковка склада:</span>
                </span>
                <select
                  value={packagingType}
                  onChange={(e) => setPackagingType(e.target.value as any)}
                  className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-neutral-200 text-xs focus:outline-none"
                >
                  <option value="carton">Коробка + мешок ({logistics.packagingFeesRub.carton} ₽)</option>
                  <option value="wooden_crate">Деревянная обрешетка ({logistics.packagingFeesRub.wooden_crate} ₽)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer with totals */}
        {cart.length > 0 && (
          <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Стоимость товаров на 1688:</span>
                <span className="font-mono text-neutral-200">{totalItemsPriceRub.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Вес заказа и карго в РФ (~{totalWeightKg} кг):</span>
                <span className="font-mono text-neutral-200">~{cargoRub.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Упаковка и страховка 2%:</span>
                <span className="font-mono text-neutral-200">{(packagingRub + insuranceRub).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                <span>Итого "под ключ":</span>
                <span className="font-mono text-amber-400 text-base">
                  {grandTotalRub.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <button
              onClick={() => onProceedToCheckout(deliveryType, packagingType)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>Оформить заказ и оплатить</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
