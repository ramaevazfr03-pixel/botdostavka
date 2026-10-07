import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderDeliveryType } from '../../types';
import { X, Link2, Calculator, Check, ArrowRight, ShieldCheck, Info } from 'lucide-react';

interface CustomOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomOrderModal: React.FC<CustomOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { logistics, createCustomOrder, userProfile } = useApp();

  const [linkOrPhoto, setLinkOrPhoto] = useState<string>('https://detail.1688.com/offer/784192019482.html');
  const [title, setTitle] = useState<string>('Кожаная куртка оверсайз с 1688 (натуральная кожа)');
  const [priceYuan, setPriceYuan] = useState<number>(320);
  const [size, setSize] = useState<string>('L (рост 175-182)');
  const [color, setColor] = useState<string>('Черный винтаж');
  const [quantity, setQuantity] = useState<number>(1);
  const [weightKg, setWeightKg] = useState<number>(1.4);
  const [deliveryType, setDeliveryType] = useState<OrderDeliveryType>('fast_auto');
  const [destinationCity, setDestinationCity] = useState<string>(userProfile.city || 'Москва');
  const [destinationAddress, setDestinationAddress] = useState<string>(
    userProfile.cdekAddress || 'ул. Тверская 12 (ПВЗ СДЭК)'
  );
  const [notes, setNotes] = useState<string>('Проверить качество швов на спине и молнию');

  if (!isOpen) return null;

  // Real-time calculated costs
  const rubleItemPrice = Math.round(priceYuan * logistics.cnyRubRate * (1 + logistics.commissionPercent / 100));
  const totalItemsPriceRub = rubleItemPrice * quantity;
  const totalWeight = +(weightKg * quantity).toFixed(2);

  const rateUsd = logistics.cargoRatesUsdPerKg[deliveryType] || 4.6;
  const cargoUsd = +(totalWeight * rateUsd).toFixed(2);
  const cargoRub = Math.round(cargoUsd * logistics.usdRubRate);
  const packagingRub = 450;
  const insuranceRub = Math.round(totalItemsPriceRub * (logistics.insurancePercent / 100));
  const totalEstimateRub = totalItemsPriceRub + cargoRub + packagingRub + insuranceRub;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkOrPhoto.trim() || !title.trim()) return;

    createCustomOrder({
      linkOrPhoto,
      title,
      estimatedPriceYuan: priceYuan,
      size,
      color,
      quantity,
      weightKg,
      deliveryType,
      destinationCity,
      destinationAddress,
      notes,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-neutral-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Заявка на выкуп по ссылке 1688 / Poizon
              </h2>
              <p className="text-[11px] text-neutral-400">
                Рассчитаем точную стоимость в рублях и согласуем выкуп с фабрикой
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Link / URL */}
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Ссылка на товар (1688, Taobao, Tmall, Poizon/Dewu, Weidian):
            </label>
            <input
              type="text"
              required
              value={linkOrPhoto}
              onChange={(e) => setLinkOrPhoto(e.target.value)}
              placeholder="https://detail.1688.com/offer/... или ссылка из приложения"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          {/* Title & Yuan price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Название вещи:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Напр. Пуховик, кроссовки, джинсы"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Цена в юанях (¥):</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={priceYuan}
                  onChange={(e) => setPriceYuan(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                  ≈ {rubleItemPrice} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Size, Color, Quantity */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Размер:</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="42 / L / 27см"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Цвет:</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Черный / Белый"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Кол-во (шт):</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Delivery & Weight parameters */}
          <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Параметры логистики карго</span>
              <span className="text-[11px] text-neutral-500">Курс: 1¥ = {logistics.cnyRubRate} ₽</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Ориентировочный вес 1 шт (кг):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Скорость доставки:</label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value as OrderDeliveryType)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-200 focus:outline-none cursor-pointer"
                >
                  <option value="fast_auto">Быстрое авто (13-18 дней) — ${logistics.cargoRatesUsdPerKg.fast_auto}/кг</option>
                  <option value="regular_auto">Обычное авто (18-25 дней) — ${logistics.cargoRatesUsdPerKg.regular_auto}/кг</option>
                  <option value="air">Авиа (7-10 дней) — ${logistics.cargoRatesUsdPerKg.air}/кг</option>
                </select>
              </div>
            </div>

            {/* Calculations breakdown */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-neutral-400 text-[11px]">
              <div className="flex justify-between">
                <span>Выкуп позиций ({quantity} шт × ¥{priceYuan}):</span>
                <span className="font-mono text-neutral-200">{totalItemsPriceRub.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Доставка карго в РФ (~{totalWeight} кг × ${rateUsd}):</span>
                <span className="font-mono text-neutral-200">~{cargoRub.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Упаковка склада и мешок + страховка 2%:</span>
                <span className="font-mono text-neutral-200">{(packagingRub + insuranceRub).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between font-bold text-xs text-white pt-1 border-t border-neutral-800">
                <span>Предварительный итог "под ключ":</span>
                <span className="font-mono text-amber-400">{totalEstimateRub.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Delivery destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Город получения:</label>
              <input
                type="text"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="Москва, СПб, Екатеринбург..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">ПВЗ СДЭК или адрес:</label>
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                placeholder="Адрес пункта выдачи СДЭК"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Comment / Notes */}
          <div>
            <label className="block text-neutral-300 font-semibold mb-1">Пожелания / Комментарий:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Напр. замерить длину стельки, уточнить плотность ткани..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Оформить выкуп ({totalEstimateRub.toLocaleString('ru-RU')} ₽)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
