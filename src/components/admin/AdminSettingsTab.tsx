import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, CheckCircle2, DollarSign, Truck, QrCode, RefreshCw } from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  const { logistics, updateLogistics } = useApp();

  const [cnyRubRate, setCnyRubRate] = useState<number>(logistics.cnyRubRate);
  const [commissionPercent, setCommissionPercent] = useState<number>(logistics.commissionPercent);
  const [usdRubRate, setUsdRubRate] = useState<number>(logistics.usdRubRate);

  const [fastAutoRate, setFastAutoRate] = useState<number>(logistics.cargoRatesUsdPerKg.fast_auto);
  const [regularAutoRate, setRegularAutoRate] = useState<number>(logistics.cargoRatesUsdPerKg.regular_auto);
  const [airRate, setAirRate] = useState<number>(logistics.cargoRatesUsdPerKg.air);

  const [cartonFee, setCartonFee] = useState<number>(logistics.packagingFeesRub.carton);
  const [woodenCrateFee, setWoodenCrateFee] = useState<number>(logistics.packagingFeesRub.wooden_crate);
  const [insurancePercent, setInsurancePercent] = useState<number>(logistics.insurancePercent);

  const [sbpPhone, setSbpPhone] = useState<string>(logistics.sbpPhone);
  const [sbpBank, setSbpBank] = useState<string>(logistics.sbpBank);
  const [sbpReceiver, setSbpReceiver] = useState<string>(logistics.sbpReceiver);

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateLogistics({
      cnyRubRate,
      commissionPercent,
      usdRubRate,
      cargoRatesUsdPerKg: {
        fast_auto: fastAutoRate,
        regular_auto: regularAutoRate,
        air: airRate,
      },
      packagingFeesRub: {
        carton: cartonFee,
        wooden_crate: woodenCrateFee,
      },
      insurancePercent,
      sbpPhone,
      sbpBank,
      sbpReceiver,
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" />
          <span>Курсы валют, тарифы карго и реквизиты оплаты</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Изменение курса юаня или комиссии автоматически пересчитает цены всех позиций на витрине
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Exchange rates & Margin */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Курс выкупа и маржинальность</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Курс юаня к рублю (¥ → ₽):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  min="5"
                  max="30"
                  required
                  value={cnyRubRate}
                  onChange={(e) => setCnyRubRate(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                  ₽ за ¥1
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                С учетом банковской конвертации в Китай
              </span>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Комиссия байера за выкуп (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                  %
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Добавляется к оптовой цене 1688
              </span>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Курс доллара для карго ($ → ₽):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="50"
                  max="150"
                  required
                  value={usdRubRate}
                  onChange={(e) => setUsdRubRate(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                  ₽ за $1
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Тарифы логистических линий рассчитываются в $
              </span>
            </div>
          </div>
        </div>

        {/* Cargo tariffs */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>Тарифы логистических линий Карго (за 1 кг)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Быстрое авто (13-18 дней):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  required
                  value={fastAutoRate}
                  onChange={(e) => setFastAutoRate(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                  $/кг
                </span>
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Обычное авто (18-25 дней):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  required
                  value={regularAutoRate}
                  onChange={(e) => setRegularAutoRate(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                  $/кг
                </span>
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Авиа экспресс (7-10 дней):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  required
                  value={airRate}
                  onChange={(e) => setAirRate(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">
                  $/кг
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-800">
            <div>
              <label className="block text-neutral-400 mb-1">Коробка + мешок (₽):</label>
              <input
                type="number"
                value={cartonFee}
                onChange={(e) => setCartonFee(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-neutral-200 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Деревянная обрешетка (₽):</label>
              <input
                type="number"
                value={woodenCrateFee}
                onChange={(e) => setWoodenCrateFee(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-neutral-200 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Страховка груза (%):</label>
              <input
                type="number"
                value={insurancePercent}
                onChange={(e) => setInsurancePercent(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-neutral-200 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SBP Payment Details */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Реквизиты для приема оплаты в рублях (СБП)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Телефон СБП:</label>
              <input
                type="text"
                required
                value={sbpPhone}
                onChange={(e) => setSbpPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Банк получателя:</label>
              <input
                type="text"
                required
                value={sbpBank}
                onChange={(e) => setSbpBank(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">ФИО получателя платежа:</label>
              <input
                type="text"
                required
                value={sbpReceiver}
                onChange={(e) => setSbpReceiver(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Настройки сохранены!' : 'Сохранить все настройки'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
