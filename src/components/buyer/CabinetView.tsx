import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  MapPin,
  FileText,
  Phone,
  Save,
  ShieldCheck,
  Package,
  HelpCircle,
  Truck,
  CreditCard,
} from 'lucide-react';

export const CabinetView: React.FC = () => {
  const { userProfile, updateUserProfile, orders } = useApp();

  const [name, setName] = useState<string>(userProfile.name);
  const [phone, setPhone] = useState<string>(userProfile.phone);
  const [city, setCity] = useState<string>(userProfile.city);
  const [cdekAddress, setCdekAddress] = useState<string>(userProfile.cdekAddress);
  const [passportData, setPassportData] = useState<string>(userProfile.passportData);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const totalSpentRub = orders.reduce((sum, o) => sum + o.totalPaidRub, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      city,
      cdekAddress,
      passportData,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const faqs = [
    {
      q: 'Почему выкуп с 1688 выгоднее розничных маркетплейсов?',
      a: '1688 — это главная внутрикитайская B2B-площадка фабрик и прямых производителей. Цены здесь в 2–4 раза ниже, чем на розничных площадках в РФ. Вы платите реальную заводскую цену в юанях + небольшую фиксированную комиссию за выкуп и доставку.',
    },
    {
      q: 'Как проходит проверка качества на складе в Гуанчжоу?',
      a: 'Каждая посылка вскрывается нашими сотрудниками на складе в Китае. Мы проверяем соответствие размера, сверяем цвет, замеряем длину стельки обуви, инспектируем швы и фурнитуру на брак и присылаем вам фотоотчет перед отправкой в рейс.',
    },
    {
      q: 'Зачем нужны паспортные данные?',
      a: 'Для официального прохождения таможенной очистки сборных грузов карго и последующей передачи посылки в курьерскую службу СДЭК по территории РФ.',
    },
    {
      q: 'Сколько дней занимает доставка?',
      a: 'Рейсы "Быстрое авто" идут 13–18 дней, "Обычное авто" — 18–25 дней, "Авиа экспресс" — 7–10 дней. После поступления на сортировочный центр в Москве груз передается в СДЭК до вашего ПВЗ.',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Profile Overview Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 to-neutral-850 border border-neutral-800 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-xl shadow-inner">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{userProfile.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {userProfile.telegramUsername}
                </span>
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                Клиент сервиса выкупа 1688 CargoBuy
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-neutral-800 pt-3 sm:pt-0 sm:pl-4">
            <div className="text-left">
              <div className="text-[11px] text-neutral-500">В пути:</div>
              <div className="text-base font-bold text-amber-400 font-mono">{activeOrdersCount} пос.</div>
            </div>
            <div className="text-neutral-700">·</div>
            <div className="text-left">
              <div className="text-[11px] text-neutral-500">Получено:</div>
              <div className="text-base font-bold text-emerald-400 font-mono">{deliveredOrdersCount}</div>
            </div>
            <div className="text-neutral-700">·</div>
            <div className="text-left">
              <div className="text-[11px] text-neutral-500">Сумма заказов:</div>
              <div className="text-base font-bold text-white font-mono">
                {totalSpentRub.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Data & Customs form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Данные получателя и адрес СДЭК для доставки</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Используются для таможенного оформления посылок в Китае и автоматического заполнения накладных
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">ФИО получателя:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Номер телефона:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Город назначения:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Адрес ПВЗ СДЭК:</label>
              <input
                type="text"
                value={cdekAddress}
                onChange={(e) => setCdekAddress(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-semibold mb-1">
              Паспортные данные получателя (серия, номер, орган выдачи):
            </label>
            <input
              type="text"
              value={passportData}
              onChange={(e) => setPassportData(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Данные зашифрованы и передаются только брокеру карго</span>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isSaved ? 'Сохранено!' : 'Сохранить данные'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          <span>Частые вопросы по выкупу из Китая (1688 / Poizon)</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-3.5 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-1.5">
              <div className="text-xs font-semibold text-neutral-200">{faq.q}</div>
              <div className="text-xs text-neutral-400 leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
