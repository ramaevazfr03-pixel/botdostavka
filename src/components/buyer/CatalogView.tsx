import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { Search, SlidersHorizontal, Plus, Star, Sparkles, ArrowUpDown } from 'lucide-react';
import { ProductModal } from './ProductModal';

interface CatalogViewProps {
  onOpenCustomOrder: () => void;
  onOpenCalculator: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onOpenCustomOrder,
  onOpenCalculator,
}) => {
  const { products, logistics } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'all' | ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.inStock) return false;
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.factoryName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.priceRub - b.priceRub;
        if (sortBy === 'price_desc') return b.priceRub - a.priceRub;
        return b.soldCount - a.soldCount;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const categories: { id: 'all' | ProductCategory; label: string }[] = [
    { id: 'all', label: 'Все позиции' },
    { id: 'clothes', label: 'Одежда' },
    { id: 'shoes', label: 'Обувь' },
    { id: 'accessories', label: 'Аксессуары' },
  ];

  return (
    <div className="space-y-5 pb-16">
      {/* Hero Banner with 1688 Buy Guarantee */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-850 border border-neutral-800 p-5 sm:p-6 text-neutral-100 shadow-md">
        <div className="relative z-10 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Прямой выкуп с фабрик 1688 & Poizon</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
            Одежда, обувь и аксессуары по оптовым ценам Китая
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Курс юаня: <span className="text-amber-300 font-mono font-medium">1¥ = {logistics.cnyRubRate} ₽</span>.
            Проверка на брак на складе в Гуанчжоу, фотоотчет замеров и быстрая доставка карго до вашего города РФ.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenCustomOrder}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Оформить выкуп по ссылке 1688</span>
            </button>
            <button
              onClick={onOpenCalculator}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-colors"
            >
              Калькулятор веса и доставки
            </button>
          </div>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по одежде, обуви, материалам или артикулу 1688..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 shrink-0 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="popular" className="bg-neutral-900">По популярности</option>
              <option value="price_asc" className="bg-neutral-900">Сначала дешевле</option>
              <option value="price_desc" className="bg-neutral-900">Сначала дороже</option>
            </select>
          </div>
        </div>

        {/* Categories tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-neutral-950 shadow-sm'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-[11px] text-neutral-500 ml-auto whitespace-nowrap pl-2 hidden md:inline">
            Найдено: {filteredProducts.length} поз.
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/50 rounded-2xl border border-neutral-800/80 p-8">
          <div className="text-neutral-500 text-sm mb-2">По вашему запросу ничего не найдено</div>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Не нашли нужную позицию в нашей витрине? Вы можете прислать прямую ссылку на 1688, Taobao или Poizon!
          </p>
          <button
            onClick={onOpenCustomOrder}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 text-xs font-bold rounded-xl transition-colors"
          >
            Оформить индивидуальный выкуп
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProducts.map((product) => {
            const estCargo = Math.round(
              product.estimatedWeightKg * logistics.cargoRatesUsdPerKg.fast_auto * logistics.usdRubRate
            );

            return (
              <div
                key={product.id}
                onClick={() => setActiveProduct(product)}
                className="group cursor-pointer bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 shadow-sm hover:shadow-lg"
              >
                {/* Photo container */}
                <div className="relative aspect-[4/3] bg-neutral-950 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle 1688 tag */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-neutral-950/80 backdrop-blur border border-neutral-800/80 text-[10px] font-mono text-amber-400">
                    1688 Direct
                  </div>
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-950/80 backdrop-blur border border-neutral-800/80 text-[10px] text-amber-300 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1 line-clamp-1">
                      {product.factoryName.split('(')[0]}
                    </div>
                    <h3 className="text-sm font-bold text-neutral-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                      {product.title}
                    </h3>
                  </div>

                  {/* Specifications snippet */}
                  <div className="pt-1 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                    <span>Вес: ~{product.estimatedWeightKg} кг</span>
                    <span>Доставка: ~{estCargo} ₽</span>
                  </div>

                  {/* Price and Action */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-lg font-extrabold text-amber-400 font-mono">
                        {product.priceRub.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        ¥{product.priceYuan} на 1688
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveProduct(product);
                      }}
                      className="px-3 py-1.5 bg-neutral-800 group-hover:bg-amber-500 group-hover:text-neutral-950 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700/80 group-hover:border-amber-500 transition-all shadow-sm"
                    >
                      Выбрать
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
        onOpenCalculatorWithWeight={onOpenCalculator}
      />
    </div>
  );
};
