import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  SlidersHorizontal,
  Package,
  MessageCircle,
  Truck,
  Camera,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Edit,
  Save,
  X,
  Plus,
} from 'lucide-react';
import { OrderChatModal } from '../buyer/OrderChatModal';

export const AdminOrdersTab: React.FC = () => {
  const { orders, adminUpdateOrderStatus, adminUpdateOrderNotes, logistics } = useApp();

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [activeChatOrder, setActiveChatOrder] = useState<Order | null>(null);

  // Edit status modal state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('warehouse_china');
  const [statusComment, setStatusComment] = useState<string>('');
  const [cargoTrack, setCargoTrack] = useState<string>('');
  const [cdekTrack, setCdekTrack] = useState<string>('');
  const [actualWeight, setActualWeight] = useState<number>(0);
  const [attachPhotoUrl, setAttachPhotoUrl] = useState<string>('');

  // Order notes state
  const [orderNotes, setOrderNotes] = useState<string>('');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerUsername.toLowerCase().includes(q) ||
        o.destinationCity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenStatusModal = (ord: Order) => {
    setSelectedOrder(ord);
    setNewStatus(ord.status);
    setStatusComment('');
    setCargoTrack(ord.cargoTrackNumber || '');
    setCdekTrack(ord.cdekTrackNumber || '');
    setActualWeight(ord.actualWeightKg || 1.2);
    setAttachPhotoUrl('');
    setIsUpdatingStatus(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    adminUpdateOrderStatus(
      selectedOrder.id,
      newStatus,
      statusComment.trim() || undefined,
      cargoTrack.trim() || undefined,
      cdekTrack.trim() || undefined,
      actualWeight > 0 ? actualWeight : undefined,
      attachPhotoUrl.trim() || undefined
    );

    setIsUpdatingStatus(false);
  };

  const handleSaveNotes = () => {
    if (!selectedOrder) return;
    adminUpdateOrderNotes(selectedOrder.id, orderNotes);
  };

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending_payment', label: 'Ожидает оплаты' },
    { value: 'paid', label: 'Оплачен, передан байеру' },
    { value: 'buying_1688', label: 'Выкуп у поставщика на 1688' },
    { value: 'warehouse_china', label: 'Поступил на склад в Гуанчжоу/Иу' },
    { value: 'inspected_packed', label: 'Проверен и упакован (фотоотчет)' },
    { value: 'cargo_transit', label: 'В пути: Карго Китай -> РФ' },
    { value: 'customs_moscow', label: 'Прибыл в Москву / Сортировка' },
    { value: 'cdek_transit', label: 'Передан в СДЭК по РФ' },
    { value: 'delivered', label: 'Доставлен клиенту' },
    { value: 'cancelled', label: 'Отменен' },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Обработка входящих заказов</h2>
          <p className="text-xs text-neutral-400">
            Воронка выкупа с 1688, назначение трек-номеров карго, загрузка фотоотчетов со склада в Гуанчжоу
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по номеру CN, клиенту, городу..."
              className="bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Status filter bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'all'
              ? 'bg-amber-500 text-neutral-950 font-bold'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          Все ({orders.length})
        </button>
        {statusOptions.map((opt) => {
          const count = orders.filter((o) => o.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                statusFilter === opt.value
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Layout: Orders List (Left) + Order Inspector Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Table / List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center bg-neutral-900/60 rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
              Заказов с выбранными параметрами не найдено
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isSelected = selectedOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setOrderNotes(ord.notes || '');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-850 border-amber-500/80 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center font-mono font-bold text-amber-400 text-xs">
                        {ord.orderNumber.replace('CN-', '')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{ord.orderNumber}</span>
                          <span className="text-neutral-400 text-[11px]">от {ord.date}</span>
                        </div>
                        <div className="text-xs text-neutral-300 font-medium mt-0.5">
                          {ord.customerName} ({ord.customerUsername})
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-400 text-xs">
                        {ord.totalPaidRub.toLocaleString('ru-RU')} ₽
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">Оплачен ({ord.paymentMethod.toUpperCase()})</span>
                    </div>
                  </div>

                  {/* Status and Items preview */}
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <div className="text-neutral-400 text-[11px] truncate max-w-[260px]">
                      {ord.items.map((i) => `${i.title} (${i.quantity}x)`).join(', ')}
                    </div>

                    <span className="px-2.5 py-0.5 bg-neutral-950 border border-neutral-800 rounded-full text-[10px] text-amber-300 font-semibold shrink-0">
                      {statusOptions.find((s) => s.value === ord.status)?.label || ord.status}
                    </span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenStatusModal(ord);
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-lg text-[11px] transition-colors"
                    >
                      Сменить статус / Карго трек
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChatOrder(ord);
                      }}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white border border-neutral-700 rounded-lg text-[11px] transition-colors flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 text-amber-400" />
                      <span>Чат с клиентом</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Inspector */}
        <div className="lg:col-span-5">
          {selectedOrder ? (
            <div className="sticky top-20 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5 text-xs text-neutral-200 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Карточка заказа {selectedOrder.orderNumber}</span>
                  </h3>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Получатель: {selectedOrder.customerName} · {selectedOrder.customerPhone}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenStatusModal(selectedOrder)}
                  className="px-3 py-1.5 bg-amber-500 text-neutral-950 font-bold rounded-xl text-xs hover:bg-amber-450 transition-colors"
                >
                  Обновить статус
                </button>
              </div>

              {/* Status & Tracking Codes */}
              <div className="space-y-2 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Текущий статус:</span>
                  <span className="font-bold text-amber-400">
                    {statusOptions.find((s) => s.value === selectedOrder.status)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Рейс Карго:</span>
                  <span className="font-mono text-neutral-200">
                    {selectedOrder.cargoTrackNumber || 'Не назначен'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Трек СДЭК:</span>
                  <span className="font-mono text-sky-400">
                    {selectedOrder.cdekTrackNumber || 'Не сформирован'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Фактический вес:</span>
                  <span className="font-mono text-neutral-200">
                    {selectedOrder.actualWeightKg ? `${selectedOrder.actualWeightKg} кг` : 'Ожидает взвешивания'}
                  </span>
                </div>
              </div>

              {/* Items List with 1688 Links */}
              <div>
                <div className="font-semibold text-neutral-300 mb-2">Товары к выкупу на 1688:</div>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center gap-2.5"
                    >
                      <img
                        src={it.image}
                        alt={it.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{it.title}</div>
                        <div className="text-[11px] text-neutral-400">
                          {it.size} · {it.color} · {it.quantity} шт.
                        </div>
                        {it.link1688 && (
                          <a
                            href={it.link1688}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:underline mt-0.5"
                          >
                            <span>Открыть карточку 1688</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="font-mono font-bold text-amber-400 text-right">
                        {(it.priceRub * it.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recipient Details & Passport */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5 text-[11px]">
                <div className="text-neutral-400 font-semibold mb-1">Данные доставки и таможни:</div>
                <div><span className="text-neutral-500">Город: </span>{selectedOrder.destinationCity}</div>
                <div><span className="text-neutral-500">Адрес ПВЗ: </span>{selectedOrder.destinationAddress}</div>
                <div>
                  <span className="text-neutral-500">Паспорт: </span>
                  <span className="font-mono text-neutral-300">
                    {selectedOrder.recipientPassport || 'Не указан'}
                  </span>
                </div>
              </div>

              {/* Warehouse QC Photos */}
              {selectedOrder.warehousePhotos && selectedOrder.warehousePhotos.length > 0 && (
                <div>
                  <div className="font-semibold text-neutral-300 mb-2">Фотоотчет проверки склада:</div>
                  <div className="flex gap-2">
                    {selectedOrder.warehousePhotos.map((ph, idx) => (
                      <img
                        key={idx}
                        src={ph}
                        alt="QC"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-neutral-800 bg-neutral-950"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Внутренние заметки менеджера:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Напр. фабрика подтвердила отправку, замер стельки OK"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl text-neutral-200 text-xs transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 text-xs">
              Выберите заказ из списка слева для подробного просмотра
            </div>
          )}
        </div>
      </div>

      {/* Edit Status & Logistics Modal */}
      {isUpdatingStatus && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-neutral-100">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Обновление статуса: {selectedOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Клиент мгновенно получит уведомление в Telegram боте и в WebApp
                </p>
              </div>
              <button
                onClick={() => setIsUpdatingStatus(false)}
                className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStatus} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Новый статус заказа:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-neutral-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Комментарий для клиента (отобразится в трекинге):
                </label>
                <input
                  type="text"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Напр. Партия упакована и загружена в рейс Быстрое Авто"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Трек Карго (Китай - РФ):</label>
                  <input
                    type="text"
                    value={cargoTrack}
                    onChange={(e) => setCargoTrack(e.target.value)}
                    placeholder="CARGO-GZ-849102-RU"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Накладная СДЭК (РФ):</label>
                  <input
                    type="text"
                    value={cdekTrack}
                    onChange={(e) => setCdekTrack(e.target.value)}
                    placeholder="1589201948"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Фактический контрольный вес склада (кг):
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* QC Photo attachment presets */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">
                  Прикрепить фотоотчет контроля качества со склада:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attachPhotoUrl}
                    onChange={(e) => setAttachPhotoUrl(e.target.value)}
                    placeholder="/src/assets/images/... или ссылка на фото"
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAttachPhotoUrl('/src/assets/images/cargo_warehouse_box_1791286807409.jpg')}
                    className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded-lg transition-colors"
                  >
                    + Складская упаковка Гуанчжоу
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachPhotoUrl('/src/assets/images/sneaker_runner_1688_1791286765636.jpg')}
                    className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded-lg transition-colors"
                  >
                    + Фото замера стельки
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUpdatingStatus(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Применить и уведомить клиента</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat modal */}
      <OrderChatModal order={activeChatOrder} onClose={() => setActiveChatOrder(null)} />
    </div>
  );
};
