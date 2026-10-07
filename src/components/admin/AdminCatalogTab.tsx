import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  X,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AdminCatalogTab: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, logistics } = useApp();

  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('clothes');
  const [priceYuan, setPriceYuan] = useState<number>(180);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<number>(0.9);
  const [image, setImage] = useState<string>('/src/assets/images/fashion_down_jacket_1791286750473.jpg');
  const [original1688Url, setOriginal1688Url] = useState<string>('https://detail.1688.com/offer/...');
  const [description, setDescription] = useState<string>('');
  const [sizesStr, setSizesStr] = useState<string>('S, M, L, XL');
  const [colorsStr, setColorsStr] = useState<string>('Черный, Серый, Белый');
  const [factoryName, setFactoryName] = useState<string>('Guangzhou Fashion Co., Ltd.');
  const [inStock, setInStock] = useState<boolean>(true);

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.factoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const calculatedRublePrice = Math.round(
    priceYuan * logistics.cnyRubRate * (1 + logistics.commissionPercent / 100)
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory('clothes');
    setPriceYuan(150);
    setEstimatedWeightKg(0.8);
    setImage('/src/assets/images/fashion_down_jacket_1791286750473.jpg');
    setOriginal1688Url('https://detail.1688.com/offer/75218940182.html');
    setDescription('Фабричное производство 1688, качественные материалы, проверенный поставщик.');
    setSizesStr('S, M, L, XL');
    setColorsStr('Черный, Бежевый');
    setFactoryName('Guangzhou Apparel Factory');
    setInStock(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategory(p.category);
    setPriceYuan(p.priceYuan);
    setEstimatedWeightKg(p.estimatedWeightKg);
    setImage(p.image);
    setOriginal1688Url(p.original1688Url);
    setDescription(p.description);
    setSizesStr(p.sizes.join(', '));
    setColorsStr(p.colors.join(', '));
    setFactoryName(p.factoryName);
    setInStock(p.inStock);
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sizes = sizesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const colors = colorsStr.split(',').map((c) => c.trim()).filter(Boolean);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        title,
        category,
        priceYuan,
        priceRub: calculatedRublePrice,
        estimatedWeightKg,
        image,
        original1688Url,
        description,
        sizes,
        colors,
        factoryName,
        inStock,
      });
    } else {
      addProduct({
        title,
        category,
        priceYuan,
        priceRub: calculatedRublePrice,
        estimatedWeightKg,
        image,
        original1688Url,
        description,
        sizes,
        colors,
        minOrderQty: 1,
        inStock,
        rating: 4.9,
        soldCount: 100,
        factoryName,
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Управление каталогом и ценами 1688
          </h2>
          <p className="text-xs text-neutral-400">
            Контроль цен в юанях (¥) и рублях (₽), добавление новинок, настройка наличия и ссылок
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold text-xs rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить позицию в каталог</span>
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {(['all', 'clothes', 'shoes', 'accessories'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-amber-500 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {cat === 'all'
                ? 'Все товары'
                : cat === 'clothes'
                ? 'Одежда'
                : cat === 'shoes'
                ? 'Обувь'
                : 'Аксессуары'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или фабрике..."
            className="w-full sm:w-64 bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950/80 text-[11px] text-neutral-400 border-b border-neutral-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Товар</th>
                <th className="py-3.5 px-4">Категория</th>
                <th className="py-3.5 px-4">Цена 1688 (¥)</th>
                <th className="py-3.5 px-4">Цена клиенту (₽)</th>
                <th className="py-3.5 px-4">Вес</th>
                <th className="py-3.5 px-4">Статус витрины</th>
                <th className="py-3.5 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-850/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3 max-w-sm">
                      <img
                        src={p.image}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-950 shrink-0 border border-neutral-800"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{p.title}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{p.factoryName}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="capitalize text-neutral-400">{p.category}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-amber-400">¥{p.priceYuan}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-white">{p.priceRub.toLocaleString('ru-RU')} ₽</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-neutral-400">
                    {p.estimatedWeightKg} кг
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.inStock
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {p.inStock ? 'В наличии' : 'Скрыт'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition-colors"
                        title="Редактировать"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 bg-neutral-800 hover:bg-red-900/40 text-neutral-400 hover:text-red-400 rounded-lg border border-neutral-700 transition-colors"
                        title="Удалить с витрины"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col text-neutral-100">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {editingProduct ? 'Редактирование позиции каталога' : 'Новый товар в каталог 1688'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Цена в рублях рассчитывается автоматически по курсу ({logistics.cnyRubRate} ₽) + комиссия {logistics.commissionPercent}%
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Название позиции:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Напр. Пуховик оверсайз гусиный пух"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Категория:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="clothes">Одежда</option>
                    <option value="shoes">Обувь</option>
                    <option value="accessories">Аксессуары</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Фабрика / Поставщик 1688:</label>
                  <input
                    type="text"
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Pricing & Margin Card */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="font-semibold text-neutral-200">Ценообразование и логистика:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Цена на 1688 (¥):</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={priceYuan}
                      onChange={(e) => setPriceYuan(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-200 font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Вес товара (кг):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      required
                      value={estimatedWeightKg}
                      onChange={(e) => setEstimatedWeightKg(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-neutral-200 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">Итог клиенту (₽):</label>
                    <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-lg px-3 py-1.5 text-amber-400 font-mono font-bold text-sm">
                      {calculatedRublePrice} ₽
                    </div>
                  </div>
                </div>
              </div>

              {/* Sizes and Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Размеры (через запятую):
                  </label>
                  <input
                    type="text"
                    value={sizesStr}
                    onChange={(e) => setSizesStr(e.target.value)}
                    placeholder="S, M, L, XL или 40, 41, 42"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">
                    Цвета / Варианты:
                  </label>
                  <input
                    type="text"
                    value={colorsStr}
                    onChange={(e) => setColorsStr(e.target.value)}
                    placeholder="Черный, Серый, Беж"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Ссылка на фото:</label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-200 font-mono text-[11px] focus:outline-none focus:border-amber-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/fashion_down_jacket_1791286750473.jpg')}
                    className="px-2 py-1 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded-lg"
                  >
                    Пуховик фото
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/sneaker_runner_1688_1791286765636.jpg')}
                    className="px-2 py-1 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded-lg"
                  >
                    Кроссовки фото
                  </button>
                  <button
                    type="button"
                    onClick={() => setImage('/src/assets/images/leather_crossbody_bag_1791286780226.jpg')}
                    className="px-2 py-1 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 text-[10px] text-neutral-300 rounded-lg"
                  >
                    Сумка фото
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Описание:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* In stock toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="stock-toggle"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <label htmlFor="stock-toggle" className="text-neutral-300 font-medium cursor-pointer">
                  Показывать на витрине каталога
                </label>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-450 text-neutral-950 font-bold rounded-xl shadow-sm"
                >
                  {editingProduct ? 'Сохранить изменения' : 'Добавить товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
