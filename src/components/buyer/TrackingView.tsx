import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Package,
  Truck,
  MessageCircle,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import { OrderChatModal } from './OrderChatModal';

export const TrackingView: React.FC = () => {
  const { orders } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
    if (filter === 'delivered') return o.status === 'delivered';
    return true;
  });

  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending_payment':
        return 0;
      case 'paid':
        return 1;
      case 'buying_1688':
        return 2;
      case 'warehouse_china':
        return 3;
      case 'inspected_packed':
        return 4;
      case 'cargo_transit':
        return 5;
      case 'customs_moscow':
        return 6;
      case 'cdek_transit':
        return 7;
      case 'delivered':
        return 8;
      case 'cancelled':
        return -1;
    }
  };

  const statusMilestones = [
    { title: 'Оформлен', desc: 'Принят в системе' },
    { title: 'Оплачен', desc: 'Передан байеру' },
    { title: 'Выкуп на 1688', desc: 'Связь с фабрикой' },
    { title: 'Склад в Гуанчжоу', desc: 'Консолидация' },
    { title: 'Фотоотчет & Замер', desc: 'Проверка швов' },
    { title: 'Рейс Карго в РФ', desc: 'В пути' },
    { title: 'Сортировка МСК', desc: 'Таможня пройдена' },
    { title: 'Передан в СДЭК', desc: 'По пути в ПВЗ' },
    { title: 'Доставлен', desc: 'Успешно получен' },
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'cargo_transit':
        return { label: '🚛 В пути: Карго в РФ', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'inspected_packed':
        return { label: '📸 Фотоотчет готов, упакован', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' };
      case 'warehouse_china':
        return { label: '🏢 Поступил на склад в Китае', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 'buying_1688':
        return { label: '⏳ Выкупается у поставщика 1688', color: 'text-amber-300 bg-neutral-800 border-neutral-700' };
      case 'customs_moscow':
        return { label: '🛃 Прибыл в Москву / Сортировка', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'cdek_transit':
        return { label: '📦 Передан в СДЭК по РФ', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'delivered':
        return { label: '✅ Доставлен и получен', color: 'text-neutral-300 bg-neutral-800 border-neutral-700' };
      case 'paid':
        return { label: '💳 Оплачен, в очереди выкупа', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default:
        return { label: 'Ожидает обработки', color: 'text-neutral-400 bg-neutral-800 border-neutral-700' };
    }
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header and filters */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Отслеживание посылок 1688</h1>
          <p className="text-xs text-neutral-400">
            Статусы в реальном времени, фотоконтроль склада в Гуанчжоу и трекинг рейсов
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Все ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'active' ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            В пути ({orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filter === 'delivered' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Получены ({orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800 p-8 text-neutral-400">
          <Package className="w-10 h-10 mx-auto text-neutral-600 mb-2" />
          <p className="text-sm font-semibold text-neutral-300">В этой категории нет посылок</p>
          <p className="text-xs text-neutral-500 mt-1">Оформите новый заказ в каталоге или по ссылке 1688</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const currentStep = getStatusStepIndex(order.status);
            const badge = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-750 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                {/* Order Top Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-neutral-850/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-amber-400 font-bold font-mono text-sm shrink-0">
                      {order.orderNumber.replace('CN-', '')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">{order.orderNumber}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{order.date}</span>
                        <span>·</span>
                        <span>{order.items.length} {order.items.length === 1 ? 'позиция' : 'позиции'}</span>
                        <span>·</span>
                        <span className="font-mono text-neutral-200">
                          {order.totalPaidRub.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Trigger */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChatOrder(order);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl text-xs font-medium text-neutral-200 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Чат заказа</span>
                    </button>

                    <button className="text-neutral-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-neutral-800 p-4 sm:p-6 space-y-6 bg-neutral-950/40 animate-in fade-in duration-150">
                    {/* Visual Progress Timeline */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-300 mb-3 flex items-center justify-between">
                        <span>Этап выполнения доставки:</span>
                        <span className="text-[11px] text-amber-400 font-medium">
                          Шаг {currentStep + 1} из {statusMilestones.length}
                        </span>
                      </div>

                      {/* Timeline horizontal track */}
                      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                        {statusMilestones.map((m, idx) => {
                          const isDone = idx < currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl border text-center transition-all ${
                                isCurrent
                                  ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/30'
                                  : isDone
                                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                  : 'bg-neutral-950/60 border-neutral-850 text-neutral-600'
                              }`}
                            >
                              <div className="flex items-center justify-center mb-1">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : isCurrent ? (
                                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                                )}
                              </div>
                              <div className="text-[10px] font-bold line-clamp-1 leading-tight">{m.title}</div>
                              <div className="text-[9px] text-neutral-500 mt-0.5 line-clamp-1">{m.desc}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Logistics Tracking Codes & Weight Data */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                        <span className="text-neutral-500 text-[11px]">Рейс Карго (Китай - РФ):</span>
                        <div className="font-mono font-bold text-amber-400 text-xs truncate">
                          {order.cargoTrackNumber || 'Назначение после консолидации'}
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                        <span className="text-neutral-500 text-[11px]">Накладная СДЭК (РФ):</span>
                        <div className="font-mono font-bold text-sky-400 text-xs truncate">
                          {order.cdekTrackNumber || 'Формируется по прибытии в Москву'}
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
                        <span className="text-neutral-500 text-[11px]">Фактический вес посылки:</span>
                        <div className="font-mono font-bold text-neutral-200 text-xs">
                          {order.actualWeightKg ? `${order.actualWeightKg} кг (взвешено)` : 'Ориентировочно'}
                        </div>
                      </div>
                    </div>

                    {/* Items inside this order */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-300 mb-2">Товары в посылке:</div>
                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-neutral-900 border border-neutral-800/80 rounded-xl flex items-center gap-3 text-xs"
                          >
                            <img
                              src={it.image}
                              alt={it.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-950 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-neutral-200 truncate">{it.title}</div>
                              <div className="text-[11px] text-neutral-400 mt-0.5">
                                Разм: {it.size} · Цвет: {it.color} · Кол-во: {it.quantity} шт.
                              </div>
                            </div>
                            <div className="text-right font-mono font-bold text-amber-400 shrink-0">
                              {(it.priceRub * it.quantity).toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warehouse QC Photos (Quality Check) */}
                    {order.warehousePhotos && order.warehousePhotos.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                          <span>Фотоотчет проверки со склада Гуанчжоу:</span>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                          {order.warehousePhotos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => setLightboxPhoto(photo)}
                              className="group cursor-pointer relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 shrink-0"
                            >
                              <img
                                src={photo}
                                alt={`Фотоотчет ${pIdx + 1}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] text-white font-medium">
                                Увеличить
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Log History */}
                    <div>
                      <div className="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Хронология движения посылки:</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {order.statusHistory.map((h, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-2.5 bg-neutral-900 border border-neutral-800/80 rounded-xl flex items-start gap-2.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <div className="flex-1">
                              <div className="text-[11px] text-neutral-400 font-mono">{h.timestamp}</div>
                              <div className="text-neutral-200 mt-0.5 leading-relaxed">{h.comment}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Destination Address */}
                    <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl text-xs flex items-start gap-2 text-neutral-400">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-neutral-300 font-medium">Адрес выдачи в РФ: </span>
                        <span>{order.destinationCity}, {order.destinationAddress}</span>
                        {order.recipientPassport && (
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Паспортные данные получателя внесены в реестр таможни
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Chat modal */}
      <OrderChatModal order={activeChatOrder} onClose={() => setActiveChatOrder(null)} />

      {/* Photo Lightbox */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={lightboxPhoto}
            alt="Складской фотоотчет 1688"
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
