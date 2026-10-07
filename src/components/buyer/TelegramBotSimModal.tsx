import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Bot, ExternalLink, Sparkles, Truck, Calculator, ShoppingBag } from 'lucide-react';

interface TelegramBotSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWebAppTab: (tab: 'catalog' | 'tracking' | 'cabinet' | 'calculator') => void;
  onOpenCustomOrder: () => void;
}

export const TelegramBotSimModal: React.FC<TelegramBotSimModalProps> = ({
  isOpen,
  onClose,
  onOpenWebAppTab,
  onOpenCustomOrder,
}) => {
  const { logistics, orders, cart } = useApp();

  const [messages, setMessages] = useState<
    {
      id: string;
      sender: 'user' | 'bot';
      text: string;
      buttons?: { label: string; action: () => void }[];
      timestamp: string;
    }[]
  >([
    {
      id: 'b1',
      sender: 'bot',
      text: `👋 Привет! Я официальный бот 1688 CargoBuy.\n\n🇨🇳 Помогаю выкупать одежду, обувь и аксессуары напрямую с китайских оптовых фабрик 1688 и Poizon по курсу 1¥ = ${logistics.cnyRubRate} ₽ с комиссией ${logistics.commissionPercent}%.\n\n📦 Мы проверяем вещи на складе в Гуанчжоу, присылаем фотоотчет замеров и доставляем Карго в РФ от 13 дней.`,
      buttons: [
        {
          label: '🛍 Открыть Каталог 1688',
          action: () => {
            onOpenWebAppTab('catalog');
            onClose();
          },
        },
        {
          label: '📦 Отследить посылку',
          action: () => {
            onOpenWebAppTab('tracking');
            onClose();
          },
        },
        {
          label: '🔗 Выкуп по ссылке 1688',
          action: () => {
            onOpenCustomOrder();
            onClose();
          },
        },
        {
          label: '🧮 Рассчитать доставку',
          action: () => {
            onOpenWebAppTab('calculator');
            onClose();
          },
        },
      ],
      timestamp: '12:00',
    },
  ]);

  const [input, setInput] = useState<string>('');

  if (!isOpen) return null;

  const handleCommand = (cmd: string) => {
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `u-${Date.now()}`, sender: 'user' as const, text: cmd, timestamp: time };

    let botReplyText = '';
    let buttons: { label: string; action: () => void }[] | undefined = undefined;

    if (cmd === '/catalog') {
      botReplyText = '🛍 Нажмите кнопку ниже, чтобы открыть интерактивный каталог одежды, обуви и аксессуаров в Telegram WebApp:';
      buttons = [
        {
          label: '🚀 Запустить Каталог WebApp',
          action: () => {
            onOpenWebAppTab('catalog');
            onClose();
          },
        },
      ];
    } else if (cmd === '/track') {
      const active = orders.filter((o) => o.status !== 'delivered');
      if (active.length === 0) {
        botReplyText = '📦 У вас пока нет посылок в пути. Оформите заказ через каталог!';
      } else {
        botReplyText = `📦 Ваши активные посылки:\n\n${active
          .map(
            (o) =>
              `• Заказ #${o.orderNumber}: ${o.status.toUpperCase()} (${o.items.length} поз.)\n  Рейс: ${o.cargoTrackNumber || 'Готовится к отправке'}\n  Сумма: ${o.totalPaidRub.toLocaleString('ru-RU')} ₽`
          )
          .join('\n\n')}`;
        buttons = [
          {
            label: '🔎 Детальный трекинг и фотоотчет',
            action: () => {
              onOpenWebAppTab('tracking');
              onClose();
            },
          },
        ];
      }
    } else if (cmd === '/calc') {
      botReplyText = `🧮 Текущие тарифы карго доставки из Китая:\n\n• Быстрое авто (13-18 дней): $${logistics.cargoRatesUsdPerKg.fast_auto}/кг\n• Обычное авто (18-25 дней): $${logistics.cargoRatesUsdPerKg.regular_auto}/кг\n• Авиа экспресс (7-10 дней): $${logistics.cargoRatesUsdPerKg.air}/кг\n\nТекущий курс доллара: $1 = ${logistics.usdRubRate} ₽`;
      buttons = [
        {
          label: 'Открыть калькулятор веса',
          action: () => {
            onOpenWebAppTab('calculator');
            onClose();
          },
        },
      ];
    } else if (cmd === '/custom') {
      botReplyText = '🔗 Отправьте ссылку на товар с 1688, Taobao или Poizon. Наш байер проверит поставщика, наличие и посчитает точную стоимость!';
      buttons = [
        {
          label: 'Оформить заявку по ссылке',
          action: () => {
            onOpenCustomOrder();
            onClose();
          },
        },
      ];
    } else {
      botReplyText = `🤖 Получено: "${cmd}". Вы можете использовать команды: /catalog, /track, /calc, /custom или открыть витрину.`;
    }

    const botMsg = { id: `b-${Date.now() + 1}`, sender: 'bot' as const, text: botReplyText, buttons, timestamp: time };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl h-[85vh] max-h-[640px] flex flex-col text-neutral-100">
        {/* Telegram Top App Header */}
        <div className="p-3.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Выкуп и Доставка из Китая</span>
                <span className="text-[10px] text-sky-400 font-mono">bot</span>
              </div>
              <div className="text-[10px] text-neutral-400">@kitaidostavka_bot · онлайн</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="https://t.me/kitaidostavka_bot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 rounded-lg text-[11px] font-semibold transition-colors"
            >
              <span>В Telegram</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Telegram Messages Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-950/90 text-xs">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                    isMe
                      ? 'bg-amber-500 text-neutral-950 font-medium rounded-br-none'
                      : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>

                {/* Inline Keyboard Buttons */}
                {m.buttons && m.buttons.length > 0 && (
                  <div className="w-[88%] grid grid-cols-1 gap-1 pt-1">
                    {m.buttons.map((b, bIdx) => (
                      <button
                        key={bIdx}
                        onClick={b.action}
                        className="w-full py-2 px-3 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl text-sky-400 hover:text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <span>{b.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                <span className="text-[9px] text-neutral-500 px-1">{m.timestamp}</span>
              </div>
            );
          })}
        </div>

        {/* Command chips */}
        <div className="p-2 bg-neutral-950 border-t border-neutral-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {['/catalog', '/track', '/calc', '/custom'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-sky-400 font-mono text-[11px] rounded-lg transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) handleCommand(input.trim());
          }}
          className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите команду или вопрос..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-450 disabled:opacity-40 text-neutral-950 flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
