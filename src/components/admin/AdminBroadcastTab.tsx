import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Users, Sparkles, CheckCircle2, Bot, Clock, Tag, ExternalLink } from 'lucide-react';

interface AdminBroadcastTabProps {
  initialAudience?: 'all' | 'abandoned_cart';
}

export const AdminBroadcastTab: React.FC<AdminBroadcastTabProps> = ({
  initialAudience = 'all',
}) => {
  const { broadcasts, sendBroadcast, userCarts, telegramBotStatus } = useApp();

  const [targetAudience, setTargetAudience] = useState<
    'all' | 'abandoned_cart' | 'sneakers' | 'clothes' | 'accessories'
  >(initialAudience);
  const [title, setTitle] = useState<string>('Сезонная распродажа пуховиков с 1688');
  const [messageText, setMessageText] = useState<string>(
    '🔥 Фабрики в Гуанчжоу объявили скидки до 30% на пуховики и зимние куртки! Мы обновили каталог новыми позициями. Успейте оформить заказ к отправке в пятничный рейс быстрой доставки.'
  );
  const [discountCode, setDiscountCode] = useState<string>('WINTER1688');
  const [buttonText, setButtonText] = useState<string>('🛍 Открыть витрину со скидками');

  const abandonedCount = userCarts.filter((c) => c.status === 'abandoned').length;

  const getAudienceCount = () => {
    switch (targetAudience) {
      case 'all':
        return 490;
      case 'abandoned_cart':
        return abandonedCount > 0 ? abandonedCount : 48;
      case 'sneakers':
        return 210;
      case 'clothes':
        return 310;
      case 'accessories':
        return 95;
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !messageText.trim()) return;

    sendBroadcast({
      title,
      targetAudience,
      messageText,
      discountCode: discountCode.trim() || undefined,
    });

    setTitle('');
    setMessageText('');
    setDiscountCode('');
  };

  const templates = [
    {
      name: '🔥 Дожим брошенных корзин',
      audience: 'abandoned_cart' as const,
      title: 'Не упустите ваши вещи в корзине!',
      text: '👋 Вы отложили стильные товары в корзину 1688 CargoBuy. Напоминаем, что в пятницу формируется рейс Быстрое Авто (13-18 дней). Примените промокод на бесплатную страховку груза!',
      code: 'FREEINSURE',
    },
    {
      name: '👟 Свежий дроп кроссовок',
      audience: 'sneakers' as const,
      title: 'Новые поступления кроссовок с фабрик Путянь',
      text: '👟 Добавили в каталог долгожданные расцветки Runner и Chunky моделей с 1688. Все размеры в наличии, проверяем замер стельки перед отправкой!',
      code: 'RUNNER2026',
    },
    {
      name: '❄️ Зимняя одежда',
      audience: 'clothes' as const,
      title: 'Зимние пуховики 90/10 гусиный пух',
      text: '❄️ Отобрали проверенных поставщиков с наполнителем 90% белый гусиный пух. Заводские цены от ¥220 (~3200₽)!',
      code: 'WARM1688',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Bot Live Status Card */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Telegram Bot: @{telegramBotStatus?.username || 'kitaidostavka_bot'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>API Активен</span>
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
              <span>Токен: 8612124409:AA...D4kdpg</span>
              <span>·</span>
              <span>Режим: Long Polling + WebApp Menu</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href="https://t.me/kitaidostavka_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-450 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <Bot className="w-4 h-4" />
            <span>Открыть бота в Telegram</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Send className="w-5 h-5 text-sky-400" />
          <span>Рассылки в Telegram бот по сегментам клиентов</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Отправляйте сообщения в Telegram чат подписчикам: уведомления о дропах, дожим брошенных корзин и промокоды
        </p>
      </div>

      {/* Templates */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-neutral-500 text-[11px] shrink-0">Готовые шаблоны:</span>
        {templates.map((tpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setTargetAudience(tpl.audience);
              setTitle(tpl.title);
              setMessageText(tpl.text);
              setDiscountCode(tpl.code);
            }}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 rounded-xl whitespace-nowrap transition-colors"
          >
            {tpl.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Broadcast Form (Left) + Telegram Mockup Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <form onSubmit={handleSend} className="space-y-4 text-xs">
            {/* Target Audience */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-1.5">
                Целевая аудитория (сегмент):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'Всем подписчикам бота', desc: '490 пользователей' },
                  { id: 'abandoned_cart', label: 'Бросившим корзину 🛒', desc: `${getAudienceCount()} пользователей` },
                  { id: 'sneakers', label: 'Интересовались обувью 👟', desc: '210 пользователей' },
                  { id: 'clothes', label: 'Интересовались одеждой 🧥', desc: '310 пользователей' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setTargetAudience(aud.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetAudience === aud.id
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{aud.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{aud.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Заголовок рассылки:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Заголовок для оповещения..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Текст сообщения в Telegram:
              </label>
              <textarea
                rows={5}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Текст рассылки..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-neutral-200 focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* Discount Code & Button text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Промокод (если применимо):
                </label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="SALE1688"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Текст Telegram кнопки:
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="🛍 Открыть каталог"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-neutral-400 text-[11px]">
                Получателей: <span className="font-bold text-white font-mono">{getAudienceCount()}</span> чел.
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Отправить в Telegram ({getAudienceCount()} чел.)</span>
              </button>
            </div>
          </form>
        </div>

        {/* Telegram Live Preview */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-sky-400" />
            <span>Предпросмотр сообщения на смартфоне клиента:</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-4 shadow-xl max-w-sm mx-auto">
            {/* Telegram top bar mock */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-neutral-800/80">
              <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold text-white">
                1688
              </div>
              <div>
                <div className="font-bold text-xs text-white">1688 CargoBuy Bot</div>
                <div className="text-[10px] text-neutral-500">бот</div>
              </div>
            </div>

            {/* Message bubble */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-none p-3.5 space-y-2 text-xs text-neutral-200 shadow-md">
              <div className="font-bold text-white text-xs leading-snug">
                {title || 'Заголовок сообщения'}
              </div>
              <div className="text-[11px] text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {messageText || 'Текст рассылки появится здесь...'}
              </div>
              {discountCode && (
                <div className="p-2 bg-neutral-950 rounded-lg border border-dashed border-amber-500/40 text-[11px] font-mono text-amber-400">
                  🎁 Промокод: <span className="font-bold">{discountCode}</span>
                </div>
              )}
              <div className="text-[9px] text-neutral-500 text-right">12:30 · доставлено</div>
            </div>

            {/* Inline Button preview */}
            <div className="mt-2">
              <div className="w-full py-2 bg-neutral-850 border border-neutral-700/80 rounded-xl text-center text-xs font-semibold text-sky-400">
                {buttonText || '🛍 Открыть витрину'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sent Broadcasts History */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">История отправленных рассылок</h3>
        <div className="space-y-2.5 text-xs">
          {broadcasts.map((bc) => (
            <div
              key={bc.id}
              className="p-3.5 bg-neutral-950 border border-neutral-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-bold text-white text-xs">{bc.title}</div>
                <div className="text-[11px] text-neutral-400 line-clamp-1">{bc.messageText}</div>
                <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                  <span>Отправлено: {bc.sentAt}</span>
                  <span>·</span>
                  <span>Сегмент: {bc.targetAudience}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono">
                <div className="text-right">
                  <div className="text-neutral-400 text-[10px]">Доставлено:</div>
                  <div className="font-bold text-white">{bc.recipientsCount}</div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400 text-[10px]">Прочитано:</div>
                  <div className="font-bold text-emerald-400">
                    {bc.readCount} ({Math.round((bc.readCount / bc.recipientsCount) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
