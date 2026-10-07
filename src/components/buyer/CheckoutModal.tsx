import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderDeliveryType } from '../../types';
import { X, QrCode, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, Truck, FileText } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveryType: OrderDeliveryType;
  packagingType: 'carton' | 'wooden_crate';
  onOrderSuccess: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  deliveryType,
  packagingType,
  onOrderSuccess,
}) => {
  const { cart, logistics, userProfile, createOrderFromCart, updateUserProfile } = useApp();

  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [city, setCity] = useState<string>(userProfile.city || 'Москва');
  const [cdekAddress, setCdekAddress] = useState<string>(userProfile.cdekAddress || 'ул. Тверская 12 (ПВЗ СДЭК)');
  const [passportData, setPassportData] = useState<string>(
    userProfile.passportData || '4519 829104, выдан ТП №1 ОУФМС г. Москвы'
  );
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card'>('sbp');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalItemsPriceRub = cart.reduce((sum, it) => sum + it.priceRub * it.quantity, 0);
  const totalWeightKg = +(cart.reduce((sum, it) => sum + it.estimatedWeightKg * it.quantity, 0)).toFixed(2);
  const rateUsd = logistics.cargoRatesUsdPerKg[deliveryType] || 4.6;
  const cargoUsd = +(Math.max(0.2, totalWeightKg) * rateUsd).toFixed(2);
  const cargoRub = Math.round(cargoUsd * logistics.usdRubRate);
  const packagingRub = logistics.packagingFeesRub[packagingType] || 450;
  const insuranceRub = Math.round(totalItemsPriceRub * (logistics.insurancePercent / 100));
  const grandTotalRub = totalItemsPriceRub + cargoRub + packagingRub + insuranceRub;

  const handleConfirmAndPay = () => {
    setIsProcessing(true);
    // Save profile address & passport for future orders
    updateUserProfile({
      city,
      cdekAddress,
      passportData,
    });

    setTimeout(() => {
      const order = createOrderFromCart({
        deliveryType,
        packagingType,
        destinationCity: city,
        destinationAddress: cdekAddress,
        recipientPassport: passportData,
        paymentMethod,
        notes,
      });

      setIsProcessing(false);
      onOrderSuccess(order.id);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-neutral-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {step === 'details' ? 'Шаг 1: Адрес СДЭК и получатель' : 'Шаг 2: Оплата выкупа в рублях'}
            </h2>
            <div className="text-[11px] text-neutral-400">
              Выкуп с 1688 · Доставка карго в РФ · Гарантия проверки
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
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {step === 'details' ? (
            <div className="space-y-4">
              {/* Recipient summary banner */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                <div className="text-neutral-400 text-[11px]">Получатель (аккаунт Telegram):</div>
                <div className="font-semibold text-neutral-200">
                  {userProfile.name} ({userProfile.telegramUsername}) · {userProfile.phone}
                </div>
              </div>

              {/* Destination info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Город получения РФ:</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Москва, СПб, Казань..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Пункт выдачи СДЭК (или адрес):</label>
                  <input
                    type="text"
                    required
                    value={cdekAddress}
                    onChange={(e) => setCdekAddress(e.target.value)}
                    placeholder="Адрес ближайшего ПВЗ СДЭК"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Passport details for customs */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Паспортные данные получателя (для таможенного оформления Карго):</span>
                </label>
                <input
                  type="text"
                  required
                  value={passportData}
                  onChange={(e) => setPassportData(e.target.value)}
                  placeholder="Серия, номер, кем и когда выдан"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
                <span className="text-[10px] text-neutral-500 block mt-1">
                  Требуется таможенными органами РФ для выпуска личных сборных посылок.
                </span>
              </div>

              {/* Order notes */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Примечание байеру (по желанию):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Напр., не мять фирменную коробку обуви, замерить стельку"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Cost Preview */}
              <div className="p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1.5 text-neutral-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Товары ({cart.length} поз.):</span>
                  <span className="font-mono text-neutral-200">{totalItemsPriceRub.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Карго доставка (~{totalWeightKg} кг):</span>
                  <span className="font-mono text-neutral-200">{cargoRub.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span>Упаковка склада и страховка:</span>
                  <span className="font-mono text-neutral-200">{(packagingRub + insuranceRub).toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-white pt-1 border-t border-neutral-800">
                  <span>К оплате:</span>
                  <span className="font-mono text-amber-400">{grandTotalRub.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment methods tabs */}
              <div className="space-y-2">
                <span className="font-semibold text-neutral-300 block">Выберите способ оплаты в рублях:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sbp')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'sbp'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-amber-400 shrink-0" />
                    <div className="text-left">
                      <div className="font-bold text-xs text-white">СБП (QR / Номер)</div>
                      <div className="text-[10px] text-neutral-400">0% комиссия · Моментально</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-amber-500/10 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-sky-400 shrink-0" />
                    <div className="text-left">
                      <div className="font-bold text-xs text-white">Банковская карта</div>
                      <div className="text-[10px] text-neutral-400">МИР, Visa, Mastercard</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* SBP QR Details */}
              {paymentMethod === 'sbp' ? (
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3 text-center">
                  <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
                    {/* Visual QR Code Mock */}
                    <div className="w-full h-full border-2 border-neutral-900 border-dashed rounded flex flex-col items-center justify-center text-neutral-900 text-center p-2">
                      <QrCode className="w-20 h-20 text-neutral-950" />
                      <div className="text-[9px] font-mono font-bold mt-1">СБП КАРГО БАЙЕР 1688</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-neutral-400">Или перевод по номеру телефона СБП:</div>
                    <div className="font-mono text-base font-bold text-amber-400 select-all">
                      {logistics.sbpPhone}
                    </div>
                    <div className="text-[11px] text-neutral-300">
                      Банк: <span className="font-semibold">{logistics.sbpBank}</span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Получатель: {logistics.sbpReceiver}
                    </div>
                  </div>

                  <div className="p-2 bg-neutral-900/80 rounded-lg text-[10px] text-emerald-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Безопасная сделка: средства замораживаются до отчета байера</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                  <div>
                    <label className="block text-neutral-400 text-[11px] mb-1">Номер карты:</label>
                    <input
                      type="text"
                      defaultValue="2200 4819 9201 4410"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-neutral-400 text-[11px] mb-1">Срок (ММ/ГГ):</label>
                      <input
                        type="text"
                        defaultValue="10/28"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono text-xs focus:outline-none text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-400 text-[11px] mb-1">CVC/CVV:</label>
                      <input
                        type="password"
                        defaultValue="•••"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono text-xs focus:outline-none text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Total amount to pay */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400">Сумма к списанию:</span>
                  <div className="text-[11px] text-neutral-500">Без скрытых комиссий</div>
                </div>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  {grandTotalRub.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          {step === 'details' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Перейти к оплате</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Назад к адресу
              </button>
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-450 text-neutral-950 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Обработка платежа...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Подтвердить оплату ({grandTotalRub.toLocaleString('ru-RU')} ₽)</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
