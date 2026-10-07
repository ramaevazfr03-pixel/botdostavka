import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderDeliveryType } from '../../types';
import { X, Calculator, ShieldCheck, Box, Plane, Truck, Clock, Sparkles } from 'lucide-react';

interface DeliveryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: number;
}

export const DeliveryCalculatorModal: React.FC<DeliveryCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeight = 1.2,
}) => {
  const { logistics } = useApp();

  const [weightKg, setWeightKg] = useState<number>(initialWeight);
  const [deliveryType, setDeliveryType] = useState<OrderDeliveryType>('fast_auto');
  const [packagingType, setPackagingType] = useState<'carton' | 'wooden_crate'>('carton');
  const [cargoValueRub, setCargoValueRub] = useState<number>(5000);
  const [withInsurance, setWithInsurance] = useState<boolean>(true);

  if (!isOpen) return null;

  // Presets
  const presets = [
    { label: '👟 Кроссовки (1 пара)', weight: 1.1, value: 3000 },
    { label: '🧥 Пуховик / Куртка', weight: 1.3, value: 4500 },
    { label: '👕 Худи / Свитшот', weight: 0.8, value: 1800 },
    { label: '👜 Кожаная сумка', weight: 0.6, value: 2500 },
    { label: '📦 Сборная посылка (5 кг)', weight: 5.0, value: 15000 },
  ];

  // Calculation logic
  const rateUsdPerKg = logistics.cargoRatesUsdPerKg[deliveryType] || 4.6;
  const cargoUsd = +(weightKg * rateUsdPerKg).toFixed(2);
  const cargoRub = Math.round(cargoUsd * logistics.usdRubRate);
  const packagingRub = logistics.packagingFeesRub[packagingType] || 450;
  const insuranceRub = withInsurance ? Math.round(cargoValueRub * (logistics.insurancePercent / 100)) : 0;
  const totalRub = cargoRub + packagingRub + insuranceRub;

  const getDaysEstimate = () => {
    switch (deliveryType) {
      case 'air':
        return '7–10 дней (Гуанчжоу ✈️ Москва)';
      case 'fast_auto':
        return '13–18 дней (Гуанчжоу 🚛 Хоргос 🚛 Москва)';
      case 'regular_auto':
        return '18–25 дней (Эконом карго авто)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-neutral-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Калькулятор доставки Карго из Китая
              </h2>
              <p className="text-[11px] text-neutral-400">
                Точный расчет логистики от склада в Гуанчжоу до РФ
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

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Quick presets */}
          <div>
            <div className="text-neutral-400 font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Быстрые шаблоны товаров:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setWeightKg(p.weight);
                    setCargoValueRub(p.value);
                  }}
                  className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-lg text-[11px] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weight slider & input */}
          <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Вес посылки (кг):</span>
              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 px-2 py-1 rounded-lg">
                <input
                  type="number"
                  min="0.2"
                  max="100"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Math.max(0.1, Number(e.target.value)))}
                  className="w-16 bg-transparent text-right font-mono font-bold text-amber-400 focus:outline-none"
                />
                <span className="text-neutral-400 text-xs font-mono">кг</span>
              </div>
            </div>

            <input
              type="range"
              min="0.2"
              max="20"
              step="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>0.2 кг</span>
              <span>5 кг</span>
              <span>10 кг</span>
              <span>20 кг</span>
            </div>
          </div>

          {/* Speed / Delivery Route selection */}
          <div className="space-y-2">
            <span className="font-semibold text-neutral-200 block">Тариф и маршрут доставки:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('fast_auto')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  deliveryType === 'fast_auto'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Быстрое авто</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-200 mt-1">
                  ${logistics.cargoRatesUsdPerKg.fast_auto}/кг
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">13–18 дней</div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('regular_auto')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  deliveryType === 'regular_auto'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-200">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Обычное авто</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-200 mt-1">
                  ${logistics.cargoRatesUsdPerKg.regular_auto}/кг
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">18–25 дней</div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('air')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  deliveryType === 'air'
                    ? 'bg-amber-500/10 border-amber-500 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-sky-400">
                  <Plane className="w-3.5 h-3.5" />
                  <span>Авиа экспресс</span>
                </div>
                <div className="text-[11px] font-mono text-neutral-200 mt-1">
                  ${logistics.cargoRatesUsdPerKg.air}/кг
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">7–10 дней</div>
              </button>
            </div>
          </div>

          {/* Packaging choice */}
          <div className="space-y-2">
            <span className="font-semibold text-neutral-200 block">Тип складской упаковки:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPackagingType('carton')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                  packagingType === 'carton'
                    ? 'bg-neutral-850 border-neutral-600 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Box className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-xs text-neutral-200">Коробка + влагозащитный мешок</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {logistics.packagingFeesRub.carton} ₽ (для одежды, сумок и текстиля)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPackagingType('wooden_crate')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                  packagingType === 'wooden_crate'
                    ? 'bg-neutral-850 border-neutral-600 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Box className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-xs text-neutral-200">Деревянная обрешетка</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {logistics.packagingFeesRub.wooden_crate} ₽ (для коробок с обувью и хрупкого)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Insurance option */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ins-check"
                checked={withInsurance}
                onChange={(e) => setWithInsurance(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <label htmlFor="ins-check" className="cursor-pointer">
                <span className="font-semibold text-neutral-200 block">Страховка груза ({logistics.insurancePercent}%)</span>
                <span className="text-[11px] text-neutral-400">100% возврат стоимости при утрате или повреждении</span>
              </label>
            </div>
            {withInsurance && (
              <span className="font-mono text-emerald-400 font-semibold">{insuranceRub} ₽</span>
            )}
          </div>

          {/* Calculation Result Breakdown Card */}
          <div className="p-4 bg-gradient-to-br from-neutral-950 to-neutral-900 border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span>Срок в пути:</span>
              <span className="font-semibold text-neutral-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{getDaysEstimate()}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span>Тариф за вес ({weightKg} кг × ${rateUsdPerKg}):</span>
              <span className="font-mono text-neutral-200">${cargoUsd} (~{cargoRub} ₽)</span>
            </div>
            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span>Упаковка склада:</span>
              <span className="font-mono text-neutral-200">{packagingRub} ₽</span>
            </div>
            {withInsurance && (
              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span>Страховка груза:</span>
                <span className="font-mono text-neutral-200">{insuranceRub} ₽</span>
              </div>
            )}

            <div className="pt-2 border-t border-neutral-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold text-white">Итоговая стоимость доставки:</span>
                <div className="text-[10px] text-neutral-500">Курс пересчета: $1 = {logistics.usdRubRate} ₽</div>
              </div>
              <span className="text-xl font-extrabold text-amber-400 font-mono">
                {totalRub.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold text-xs rounded-xl transition-colors"
          >
            Понятно, закрыть расчет
          </button>
        </div>
      </div>
    </div>
  );
};
