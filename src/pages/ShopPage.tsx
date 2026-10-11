import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ShopPageProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSelectProduct: (product: Product) => void;
  setCurrentView: (view: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  selectedCategory,
  setSelectedCategory,
  onSelectProduct,
  setCurrentView
}) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  // Filters state
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRanges, setPriceRanges] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [gridColumns, setGridColumns] = useState<3 | 4>(3);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products', count: products.length },
    { id: 'diyas-candle-holders', label: 'Diyas & Candle Holders', count: products.filter(p => p.category === 'diyas-candle-holders').length },
    { id: 'candles-fragrance', label: 'Candles & Fragrance', count: products.filter(p => p.category === 'candles-fragrance').length },
    { id: 'festive-decorations', label: 'Festive Decorations', count: products.filter(p => p.category === 'festive-decorations').length },
    { id: 'home-accents', label: 'Home Accents', count: products.filter(p => p.category === 'home-accents').length },
    { id: 'table-decor', label: 'Table Décor', count: products.filter(p => p.category === 'table-decor').length },
    { id: 'gifts-hampers', label: 'Gifts & Hampers', count: products.filter(p => p.category === 'gifts-hampers').length }
  ];

  const materials = ['Pure Brass', 'Soy Wax', 'Ceramic', 'Marble Inlay', 'Teakwood'];

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials(prev =>
      prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]
    );
  };

  const togglePriceRange = (range: string) => {
    setPriceRanges(prev =>
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedMaterials([]);
    setPriceRanges([]);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Material
    if (selectedMaterials.length > 0) {
      list = list.filter(p => selectedMaterials.some(m => p.material.toLowerCase().includes(m.toLowerCase())));
    }

    // Price Ranges
    if (priceRanges.length > 0) {
      list = list.filter(p => {
        return priceRanges.some(range => {
          if (range === 'under-1500') return p.price < 1500;
          if (range === '1500-3000') return p.price >= 1500 && p.price <= 3000;
          if (range === '3000-5000') return p.price > 3000 && p.price <= 5000;
          if (range === 'above-5000') return p.price > 5000;
          return true;
        });
      });
    }

    // In Stock
    if (inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // Sort
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return list;
  }, [products, selectedCategory, selectedMaterials, priceRanges, inStockOnly, sortBy]);

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedMaterials.length +
    priceRanges.length +
    (inStockOnly ? 1 : 0);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Breadcrumbs & Category Hero */}
      <section className="w-full bg-[#F3E6D5]/30 px-4 sm:px-6 lg:px-8 pt-6 pb-12 border-b border-[#F3E6D5]">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A6B69]">
            <button type="button" onClick={() => setCurrentView('home')} className="hover:text-[#800020] transition-colors">
              Home
            </button>
            <span className="opacity-50">/</span>
            <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-[#800020] transition-colors">
              Shop
            </button>
            <span className="opacity-50">/</span>
            <span className="text-[#800020] font-semibold">
              {categories.find(c => c.id === selectedCategory)?.label || 'All Collections'}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-2">
            <div className="lg:col-span-8 flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#800020]">
                {selectedCategory !== 'all' ? 'Artisanal Collection' : 'Curated Catalogue 2025'}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#800020] tracking-tight">
                {selectedCategory !== 'all'
                  ? `${categories.find((c) => c.id === selectedCategory)?.label || 'Artisan Collection'} — Handcrafted Brassware`
                  : 'The Home & Celebration Collection'}
              </h1>
              <p className="text-sm sm:text-base text-[#554745] max-w-2xl leading-relaxed mt-1">
                {selectedCategory === 'diyas-candle-holders'
                  ? 'Shop handcrafted solid brass diyas, akhand jyotis, and contemporary candelabras sand-cast by master artisans in Moradabad for radiant celebrations.'
                  : selectedCategory === 'candles-fragrance'
                  ? 'Discover soot-free cold-pressed botanical soy candles infused with pure Mysore sandalwood, saffron stigmas, and divine floral oils.'
                  : selectedCategory === 'festive-decorations'
                  ? 'Elevate festive foyers and mandirs with everlasting Chanderi organza garlands, cast temple bells, and auspicious doorway torans.'
                  : selectedCategory === 'home-accents'
                  ? 'Heirloom virgin brass urlis, carved peacock bowls, and sculptural centerpieces forged for floating fresh flowers and glowing tealights.'
                  : selectedCategory === 'table-decor'
                  ? 'Curate memorable festive dinner tables with Ayurvedic kansa tableware, hand-etched brass coasters, and gold-embroidered table linens.'
                  : selectedCategory === 'gifts-hampers'
                  ? 'Royal festive hampers curated in handcrafted wine-burgundy velvet trunks with brass hardware and personalized wax-sealed greeting cards.'
                  : 'Handcrafted brass diyas, pure soy candles, sculptural table accents, and festive décor thoughtfully made to elevate your living spaces with quiet Indian warmth.'}
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end items-center text-[#7A6B69]">
              <div className="bg-[#FFF9F2] px-4 py-3 rounded border border-[#E6D7C3] flex items-center gap-3 shadow-sm">
                <span className="material-symbols-outlined text-[#800020] text-[24px]">
                  workspace_premium
                </span>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#800020]">
                    Artisanal Promise
                  </span>
                  <span className="text-xs text-[#332927] font-medium">
                    100% Hand-forged &amp; Sustainable
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Category Pills Scroll row */}
          <div className="flex items-center gap-2 overflow-x-auto pt-6 pb-2 border-b border-[#E6D7C3]/60 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`pb-2 px-3 text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'text-[#800020] font-semibold border-b-2 border-[#800020]'
                    : 'text-[#7A6B69] hover:text-[#800020]'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Toolbar (Sticky top) */}
      <section className="w-full bg-[#FFF9F2] px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm sticky top-20 z-30 border-b border-[#F3E6D5]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#7A6B69]">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'creation' : 'creations'}
            </span>

            {activeFilterCount > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#800020] font-semibold bg-[#F3E6D5] px-2.5 py-1 rounded">
                  {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-[#7A6B69] hover:text-[#800020] underline uppercase tracking-wider"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden text-xs uppercase tracking-wider text-[#800020] font-semibold flex items-center gap-1 border border-[#800020]/40 px-2.5 py-1 rounded"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Refine ({activeFilterCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#7A6B69]">
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-[#332927] font-medium py-1 px-2 border border-[#E6D7C3] rounded text-xs focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Patron Rating</option>
                <option value="newest">New Releases</option>
              </select>
            </div>

            {/* Grid Switcher (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 border border-[#E6D7C3] rounded p-0.5">
              <button
                type="button"
                onClick={() => setGridColumns(3)}
                title="3-Column View"
                className={`p-1 rounded ${
                  gridColumns === 3 ? 'bg-[#800020] text-white' : 'text-[#7A6B69] hover:text-[#332927]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">view_module</span>
              </button>
              <button
                type="button"
                onClick={() => setGridColumns(4)}
                title="4-Column View"
                className={`p-1 rounded ${
                  gridColumns === 4 ? 'bg-[#800020] text-white' : 'text-[#7A6B69] hover:text-[#332927]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Catalog Layout (Left Sidebar + Right Products Grid) */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Filter Sidebar */}
          <aside
            className={`${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:block lg:col-span-3 flex-col space-y-6 pr-4 border-r border-[#F3E6D5]`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F3E6D5]">
              <span className="font-serif text-lg text-[#800020]">Refine Creations</span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] uppercase tracking-widest text-[#7A6B69] hover:text-[#800020]"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-col space-y-2.5 pb-5 border-b border-[#F3E6D5]">
              <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] font-semibold">
                Category
              </span>
              <div className="flex flex-col space-y-1.5 text-xs">
                {categories.map(cat => (
                  <label
                    key={cat.id}
                    className="flex items-center justify-between text-[#332927] hover:text-[#800020] cursor-pointer py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category-filter"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="accent-[#800020]"
                      />
                      <span>{cat.label}</span>
                    </span>
                    <span className="text-[10px] text-[#7A6B69] font-medium">{cat.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="flex flex-col space-y-2.5 pb-5 border-b border-[#F3E6D5]">
              <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] font-semibold">
                Price Range
              </span>
              <div className="flex flex-col space-y-1.5 text-xs">
                {[
                  { id: 'under-1500', label: 'Under ₹1,500', count: 4 },
                  { id: '1500-3000', label: '₹1,500 – ₹3,000', count: 6 },
                  { id: '3000-5000', label: '₹3,000 – ₹5,000', count: 3 },
                  { id: 'above-5000', label: 'Above ₹5,000', count: 1 }
                ].map(r => (
                  <label
                    key={r.id}
                    className="flex items-center justify-between text-[#332927] hover:text-[#800020] cursor-pointer py-0.5"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={priceRanges.includes(r.id)}
                        onChange={() => togglePriceRange(r.id)}
                        className="accent-[#800020] rounded"
                      />
                      <span>{r.label}</span>
                    </span>
                    <span className="text-[10px] text-[#7A6B69]">{r.count}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Material */}
            <div className="flex flex-col space-y-2.5 pb-5 border-b border-[#F3E6D5]">
              <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] font-semibold">
                Artisan Material
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {materials.map(mat => (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat)}
                    className={`px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-wider transition-colors ${
                      selectedMaterials.includes(mat)
                        ? 'bg-[#800020] text-white font-medium'
                        : 'border border-[#E6D7C3] text-[#7A6B69] hover:border-[#800020] hover:text-[#800020]'
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock Only Switch */}
            <div className="flex items-center justify-between py-2">
              <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] font-semibold">
                In Stock Only
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#E6D7C3] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#800020]" />
              </label>
            </div>

            {/* Gifting Concierge Callout */}
            <div className="pt-5 border-t border-[#F3E6D5] flex flex-col gap-1.5 bg-[#F3E6D5]/40 p-4 rounded">
              <span className="text-[10px] uppercase tracking-widest text-[#800020] font-semibold">
                Gifting Concierge
              </span>
              <p className="text-xs text-[#554745] leading-relaxed">
                Bespoke festive gift curation and custom packing for weddings and intimate gatherings.
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('customer-care')}
                className="text-[11px] text-[#800020] font-semibold uppercase tracking-wider hover:underline inline-flex items-center gap-1 mt-1"
              >
                <span>Enquire Now</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-9 flex flex-col space-y-12">
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center text-[#7A6B69] flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl mb-2 text-[#E6D7C3]">
                  filter_alt_off
                </span>
                <h3 className="font-serif text-xl text-[#332927]">No objects match your filter</h3>
                <p className="text-xs mt-1 mb-4">Try clearing active filters to view all celebratory works.</p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2 bg-[#800020] text-white text-xs uppercase tracking-wider"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 ${
                  gridColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                } gap-x-6 gap-y-10`}
              >
                {filteredProducts.map(p => (
                  <article key={p.id} className="group flex flex-col transition-all duration-300">
                    <div className="relative w-full aspect-[4/5] bg-[#F3E6D5] overflow-hidden rounded-sm">
                      <img
                        alt={p.name}
                        src={p.images.main}
                        onClick={() => onSelectProduct(p)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                      />

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        aria-label="Add to Wishlist"
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFF9F2]/90 hover:bg-[#FFF9F2] text-[#800020] flex items-center justify-center transition-transform active:scale-90 shadow-sm"
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] ${
                            isWishlisted(p.id) ? 'text-[#D45060]' : ''
                          }`}
                          style={isWishlisted(p.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          favorite
                        </span>
                      </button>

                      {/* Quick Add Button */}
                      <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => addToCart(p, 1)}
                          className="w-full py-2.5 px-3 bg-[#FFF9F2] text-[#800020] hover:bg-[#800020] hover:text-[#FFF9F2] rounded-sm text-xs uppercase tracking-wider font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                          <span>Quick Add</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 flex flex-col gap-1">
                      <span className="text-[10px] text-[#7A6B69] tracking-widest uppercase">
                        {p.material} • {p.craftHeritage.split(' ')[0]}
                      </span>

                      <h3
                        onClick={() => onSelectProduct(p)}
                        className="font-serif text-[15px] text-[#332927] group-hover:text-[#800020] transition-colors leading-snug font-normal cursor-pointer line-clamp-1"
                      >
                        {p.name}
                      </h3>

                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-sm font-semibold text-[#800020]">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {p.originalPrice && (
                          <span className="text-xs text-[#7A6B69] line-through opacity-70">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination & Progress */}
            <div className="flex flex-col items-center justify-center gap-4 pt-8 border-t border-[#F3E6D5]">
              <div className="flex flex-col items-center gap-1.5 w-full max-w-xs text-center">
                <span className="text-xs text-[#7A6B69]">
                  Showing {filteredProducts.length} of {products.length} mindful creations
                </span>
                <div className="w-full h-1 bg-[#E6D7C3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#800020] rounded-full"
                    style={{ width: `${Math.min(100, Math.round((filteredProducts.length / products.length) * 100))}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded bg-[#800020] text-white text-xs font-semibold"
                >
                  1
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded bg-[#F3E6D5] text-[#332927] text-xs font-semibold hover:bg-[#800020] hover:text-white transition-colors"
                >
                  2
                </button>
                <button
                  type="button"
                  className="w-8 h-8 rounded bg-[#F3E6D5] text-[#332927] text-xs font-semibold hover:bg-[#800020] hover:text-white transition-colors"
                >
                  3
                </button>
                <button
                  type="button"
                  className="px-3 h-8 rounded bg-[#F3E6D5] text-[#332927] text-xs font-semibold hover:bg-[#800020] hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>

      {/* 4. Editorial Story Banner / Craft Interlude */}
      <section className="w-full bg-[#F3E6D5]/40 my-10 px-4 sm:px-6 lg:px-8 py-16 border-y border-[#F3E6D5]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#800020]">
              The Ritual of Warmth
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#800020]">
              Crafted with Heart, Lit with Reverence
            </h2>
            <p className="text-sm text-[#554745] leading-relaxed">
              Every Sajavat piece is hand-hewn by generational metalsmiths and master potters across Uttar Pradesh, Rajasthan, and Gujarat. When you place a diya upon your sill, you invite timeless blessings into your sanctuary.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('our-story')}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#800020] font-semibold border-b border-[#800020] pb-0.5 hover:opacity-80 transition-opacity"
              >
                <span>Explore The Craft Story</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] bg-[#F3E6D5] rounded overflow-hidden shadow-md">
              <img
                className="w-full h-full object-cover"
                alt="Indian artisan shaping brass"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbGFP8GJzhu5oB77xJBD0M414D3UcHZTQcLySZvBShAXeJrkJbP_vd9a4IdoB-I2j1f90QLNHt7_ThLB-fb63qUI8NQwMNh6df6evIr-Yf5MEo4Ck_Tytnz2bryx67wwJJaAAhfMHiYpj3y5Z_K1g2TDbvaRLwyfwPNP0pUh1MW_y6uugdawSr9AB65t8lEaUGw4ZMCyWWZgNS80m85ypn00WPhBjDHRavmwIPV5wR_2WrHhZDG5apww"
              />
            </div>
            <div className="aspect-[3/4] bg-[#F3E6D5] rounded overflow-hidden shadow-md mt-6">
              <img
                className="w-full h-full object-cover"
                alt="Table setting at twilight"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0k4QQwXpBOSGld3CwigQKi66wFb5fPBI2Jlk1N2GgGeVr7k-U6h9RqNLTwPSRyHtR-UNG-Ox_RFEVwE5c_-K5-rOX2_NqxlOhujYq_GQ4K4tsAAvG8SwvnwycxoHCMSR7ZRjGUuTEEv6mCK-c9ktMSmnPm4v61As0Hr-rqQVMqaX38MBKEXsVBIC07YwducRYy0rRdNKcefMi1n2RHjjeAybIKiN6U44fwvuJiy9nHPlS6_XVvYusHA"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Brand Promise Banner */}
      <section className="w-full bg-[#FFF9F2] px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-[#F3E6D5] flex items-center justify-center shrink-0 text-[#800020]">
              <span className="material-symbols-outlined text-[24px]">handshake</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-base text-[#332927] font-semibold">
                Handcrafted in India
              </h3>
              <p className="text-xs text-[#7A6B69] leading-relaxed">
                Preserving centuries-old metalcasting and pottery clusters across the subcontinent.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-[#F3E6D5] flex items-center justify-center shrink-0 text-[#800020]">
              <span className="material-symbols-outlined text-[24px]">eco</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-base text-[#332927] font-semibold">
                Eco-Conscious Packaging
              </h3>
              <p className="text-xs text-[#7A6B69] leading-relaxed">
                Biodegradable cotton pouches, recycled cardboard, and zero synthetic plastics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-[#F3E6D5] flex items-center justify-center shrink-0 text-[#800020]">
              <span className="material-symbols-outlined text-[24px]">local_shipping</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-base text-[#332927] font-semibold">
                Complimentary Shipping
              </h3>
              <p className="text-xs text-[#7A6B69] leading-relaxed">
                Safe insured delivery straight to your doorstep on domestic orders above ₹2,999.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-2">
            <div className="w-12 h-12 rounded-full bg-[#F3E6D5] flex items-center justify-center shrink-0 text-[#800020]">
              <span className="material-symbols-outlined text-[24px]">support_agent</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-base text-[#332927] font-semibold">
                Dedicated Concierge
              </h3>
              <p className="text-xs text-[#7A6B69] leading-relaxed">
                Direct styling consultation and tailored festive hampers via WhatsApp or phone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
