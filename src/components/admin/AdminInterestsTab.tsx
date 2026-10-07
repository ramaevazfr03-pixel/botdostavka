import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, TrendingUp, Search, Eye, ShoppingBag, Users, Sparkles, Compass } from 'lucide-react';

export const AdminInterestsTab: React.FC = () => {
  const { userCarts, orders, products } = useApp();

  // Aggregate user interests
  const interestStats = [
    { tag: 'Обувь & Кроссовки Runner', count: 328, share: '34%', trend: '+28%', heat: 'high' },
    { tag: 'Зимние пуховики 90/10 пух', count: 284, share: '29%', trend: '+45%', heat: 'high' },
    { tag: 'Оверсайз худи 480g French Terry', count: 195, share: '20%', trend: '+12%', heat: 'medium' },
    { tag: 'Кожаные сумки & Кроссбоди', count: 110, share: '11%', trend: '+8%', heat: 'medium' },
    { tag: 'Широкие карго брюки', count: 62, share: '6%', trend: '+15%', heat: 'low' },
  ];

  const searchKeywords = [
    { query: 'пуховик 1688 гусь', searches: 492, conversions: '18.4%' },
    { query: 'кроссовки chunky runner', searches: 410, conversions: '22.1%' },
    { query: 'худи оверсайз хлопок', searches: 345, conversions: '14.8%' },
    { query: 'кожаная сумка nappa', searches: 215, conversions: '16.2%' },
    { query: 'парашюты брюки ripstop', searches: 180, conversions: '12.0%' },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>Анализ интересов и предпочтений покупателей</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Аналитика просмотров каталога, поисковых запросов и сегментов спроса на 1688
        </p>
      </div>

      {/* Top Demand Heatmap & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Popular product categories & tags */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Главные направления спроса (Теги интересов)</span>
            </h3>
            <span className="text-[11px] text-neutral-500">За последние 30 дней</span>
          </div>

          <div className="space-y-3">
            {interestStats.map((item, idx) => (
              <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-200">{item.tag}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-bold">{item.count} чел.</span>
                    <span className="text-emerald-400 text-[10px] font-mono">{item.trend}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: item.share }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-neutral-500">
                  <span>Доля в интересах аудитории: {item.share}</span>
                  <span>Сезонный спрос: {item.heat === 'high' ? '🔥 Высокий' : 'Стабильный'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Search Queries in TG Bot & WebApp */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" />
              <span>Топ поисковых запросов в каталоге</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {searchKeywords.map((k, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono text-neutral-200 font-medium">"{k.query}"</div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {k.searches} поисковых запросов
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-emerald-400 font-bold">{k.conversions}</div>
                  <div className="text-[10px] text-neutral-500">конверсия в корзину</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-neutral-950/60 border border-amber-500/20 rounded-xl text-xs text-neutral-300 space-y-1">
            <div className="font-semibold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Рекомендация для закупки на 1688:</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Пользователи активно ищут мембранные зимние пуховики и кроссовки бежевых оттенков. Рекомендуем расширить каталог фабриками Hangzhou с пуховым наполнителем.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
