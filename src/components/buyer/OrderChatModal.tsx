import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { X, Send, Bot, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface OrderChatModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderChatModal: React.FC<OrderChatModalProps> = ({ order, onClose }) => {
  const { chatMessages, sendChatMessage } = useApp();
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const messages = chatMessages[order.id] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(order.id, inputText.trim(), 'user');
    setInputText('');

    // Simulate auto-manager reply if first time
    setTimeout(() => {
      sendChatMessage(
        order.id,
        'Менеджер принял ваше сообщение и проверяет информацию с китайским складом. Ответ поступит в течение нескольких минут.',
        'manager'
      );
    }, 1500);
  };

  const quickQuestions = [
    'Уточните замер стельки сантиметром',
    'Когда ориентировочно отправка карго?',
    'Пожалуйста, пришлите фото швов и бирок',
    'Изменился адрес ПВЗ СДЭК',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl h-[85vh] max-h-[650px] flex flex-col text-neutral-100">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              CN
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Чат по заказу {order.orderNumber}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-neutral-400">
                Байер и оператор склада 1688 (онлайн)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order mini-context header */}
        <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="truncate max-w-[240px] text-neutral-300">
            {order.items.map((i) => i.title).join(', ')}
          </span>
          <span className="font-mono text-amber-400 font-semibold shrink-0">
            {order.totalPaidRub.toLocaleString('ru-RU')} ₽
          </span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 space-y-1">
              <p>История переписки пуста.</p>
              <p className="text-[11px]">Задайте любой вопрос байеру по позициям или доставке.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="text-[10px] text-neutral-500 px-1">
                    {msg.senderName} · {msg.timestamp}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-amber-500 text-neutral-950 font-medium rounded-br-none'
                        : 'bg-neutral-800 text-neutral-100 border border-neutral-700/80 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2 bg-neutral-950 border-t border-neutral-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(q)}
              className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-[10px] rounded-lg whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Напишите менеджеру 1688..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-450 disabled:opacity-40 text-neutral-950 flex items-center justify-center transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
