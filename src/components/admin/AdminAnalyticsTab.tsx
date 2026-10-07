import React from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, TrendingUp, DollarSign, Package, Truck, Users, ArrowUpRight } from 'lucide-react';

export const AdminAnalyticsTab: React.FC = () => {
  const { orders, logistics, userCarts } = useApp();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPaidRub, 0);
  const totalGoodsValue = orders.reduce((sum, o) => sum + o.totalItemsPriceRub, 0);
  const totalLogisticsValue = orders.reduce((sum, o) => sum + o.estimatedCargoRub, 0);
  const totalCommission = Math.round((totalGoodsValue * logistics.commissionPercent) / 100);
  const totalWeightKg = +(orders.reduce((sum, o) => sum + (o.actualWeightKg || 1.2), 0)).toFixed(1);

  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const inTransitCount = orders.filter((o) => o.status === 'cargo_transit' || o.status === 'customs_moscow').length;

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          <span>Операционная аналитика и доходы сервиса</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Финансовые показатели выкупа, объем перевезенного карго и конверсия
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Общий оборот:</span>
            <span className="text-emerald-400 font-semibold flex items-center text-[10px]">
              +18.4% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {totalRevenue.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-neutral-500">Товары + доставка карго</div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-[11px] text-neutral-400 flex items-center justify-between">
            <span>Чистая прибыль (комиссия):</span>
            <span className="text-amber-400 font-semibold text-[10px]">{logistics.commissionPercent}%</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {totalCommission.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-neutral-500">Маржа байера с выкупа</div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-[11px] text-neutral-400">Общий вес отправленного груза:</div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono">
            {totalWeightKg} кг
          </div>
          <div className="text-[10px] text-neutral-500">{orders.length} сборных посылок</div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-[11px] text-neutral-400">Посылок в рейсе сейчас:</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {inTransitCount} в пути
          </div>
          <div className="text-[10px] text-neutral-500">{deliveredCount} успешно вручено</div>
        </div>
      </div>

      {/* Revenue Structure & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Revenue Structure */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Структура денежного потока</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-semibold text-neutral-200">Выкуп у поставщиков 1688</div>
                <div className="text-[10px] text-neutral-500">Оплата заводам в Китае в юанях</div>
              </div>
              <span className="font-mono font-bold text-white">
                {totalGoodsValue.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-semibold text-neutral-200">Логистика Карго (Китай - РФ)</div>
                <div className="text-[10px] text-neutral-500">Оплата рейсов, упаковки и страховки</div>
              </div>
              <span className="font-mono font-bold text-sky-400">
                {totalLogisticsValue.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex justify-between items-center">
              <div>
                <div className="font-semibold text-neutral-200">Чистая комиссия байера</div>
                <div className="text-[10px] text-neutral-500">Доход за организацию процесса</div>
              </div>
              <span className="font-mono font-bold text-amber-400">
                {totalCommission.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Воронка конверсии в Telegram боте</h3>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-neutral-300">
                <span>1. Запуск бота и просмотр каталога</span>
                <span className="font-mono font-bold">1,240 чел. (100%)</span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-full rounded-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-neutral-300">
                <span>2. Добавление в корзину / Расчет доставки</span>
                <span className="font-mono font-bold">480 чел. (38.7%)</span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[38.7%] rounded-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-neutral-300">
                <span>3. Оплата и подтверждение выкупа</span>
                <span className="font-mono font-bold">142 заказа (11.4%)</span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[11.4%] rounded-full" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-neutral-300">
                <span>4. Повторные заказы (LTV)</span>
                <span className="font-mono font-bold">68 постоянных (47.8%)</span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[47.8%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
