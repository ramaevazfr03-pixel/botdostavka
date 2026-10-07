import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, ExternalLink, ShieldCheck, Truck, Check, Plus, Minus, ShoppingBag } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCalculatorWithWeight?: (weightKg: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onOpenCalculatorWithWeight,
}) => {
  const { addToCart, logistics } = useApp();

  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'One Size');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'По умолчанию');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  // Calculate cargo estimate for this product
  const estimatedCargoRub = Math.round(
    product.estimatedWeightKg * quantity * logistics.cargoRatesUsdPerKg.fast_auto * logistics.usdRubRate
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-neutral-100">
        {/* Header close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-neutral-950/70 hover:bg-neutral-950 text-neutral-300 hover:text-white flex items-center justify-center backdrop-blur-md transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main top grid: image + essential specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Image */}
            <div className="relative aspect-[4/3] sm:aspect-square bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded text-[11px] font-mono text-amber-400">
                1688 Factory ID
              </div>
            </div>

            {/* Product Essential info */}
            <div className="flex flex-col justify-between space-y-3">
              <div>
                <div className="text-xs text-neutral-400 mb-1">{product.factoryName}</div>
                <h2 className="text-lg font-bold text-white leading-snug">{product.title}</h2>

                {/* Price block */}
                <div className="mt-3 p-3 bg-neutral-950/80 border border-neutral-800/80 rounded-xl">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-amber-400 font-mono">
                      {product.priceRub.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-sm text-neutral-400 font-mono">
                      (¥{product.priceYuan})
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5">
                    <span>Курс ¥{logistics.cnyRubRate} ₽</span>
                    <span>·</span>
                    <span>Комиссия {logistics.commissionPercent}% включена</span>
                  </div>
                </div>

                {/* Specs / Meta */}
                <div className="mt-3 space-y-1.5 text-xs text-neutral-300">
                  <div className="flex items-center justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-500">Примерный вес:</span>
                    <span className="font-mono text-neutral-200">~{product.estimatedWeightKg} кг</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-500">Ориентир доставки:</span>
                    <span className="font-mono text-neutral-200">~{estimatedCargoRub} ₽ (Авто 13-18 дн)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-500">Мин. заказ:</span>
                    <span>от {product.minOrderQty} шт.</span>
                  </div>
                </div>
              </div>

              {/* Original 1688 factory link */}
              {product.original1688Url && (
                <div className="pt-2">
                  <a
                    href={product.original1688Url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <span>Оригинал карточки поставщика на 1688</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-neutral-950/50 p-3.5 rounded-xl border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed">
            <div className="text-neutral-400 font-medium mb-1">Описание и материалы фабрики:</div>
            {product.description}
          </div>

          {/* Size Selector */}
          <div>
            <div className="text-xs font-semibold text-neutral-300 mb-2">Выберите размер:</div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selectedSize === size
                      ? 'bg-amber-500 text-neutral-950 font-bold border-amber-500 shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <div className="text-xs font-semibold text-neutral-300 mb-2">Цвет / Вариант:</div>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selectedColor === color
                      ? 'bg-white text-neutral-950 font-bold border-white shadow-sm'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity stepper & Cargo badge */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">Количество:</span>
              <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-950">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Уменьшить"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-mono font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                  aria-label="Увеличить"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-neutral-400">Итого за товар:</div>
              <div className="text-base font-bold text-white font-mono">
                {(product.priceRub * quantity).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Logistics assurance badge */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Проверка на брак в Китае</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Фотоотчет перед отправкой</span>
            </div>
          </div>
        </div>

        {/* Footer Add to Cart button */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Закрыть
          </button>

          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-md ${
              isAdded
                ? 'bg-emerald-500 text-neutral-950'
                : 'bg-amber-500 hover:bg-amber-450 text-neutral-950 active:scale-[0.99]'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Добавлено в корзину!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Добавить в корзину ({(product.priceRub * quantity).toLocaleString('ru-RU')} ₽)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
