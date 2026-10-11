import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { Product, JournalArticle } from '../types';

interface SearchModalProps {
  products: Product[];
  journalArticles: JournalArticle[];
  onSelectProduct: (product: Product) => void;
  onSelectArticle: (article: JournalArticle) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  products,
  journalArticles,
  onSelectProduct,
  onSelectArticle
}) => {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [searchTerm, products]);

  const filteredArticles = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return journalArticles.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.categoryLabel.toLowerCase().includes(q) ||
        a.leadExcerpt.toLowerCase().includes(q)
    );
  }, [searchTerm, journalArticles]);

  if (!isSearchOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-[#800020]/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-lg shadow-2xl max-w-2xl w-full p-6 relative animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-3 border-b border-[#E6D7C3] pb-3 mb-4">
            <span className="material-symbols-outlined text-[24px] text-[#800020]">search</span>
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search handcrafted urlis, scented candles, festive torans, brasswares..."
              className="w-full bg-transparent text-base text-[#332927] placeholder:text-[#7A6B69]/60 outline-none"
            />
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-[#7A6B69] hover:text-[#800020]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Quick popular tags */}
          {!searchTerm.trim() && (
            <div className="py-4">
              <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] block mb-2 font-semibold">
                Curated Suggestions
              </span>
              <div className="flex flex-wrap gap-2">
                {['Mayura Urli', 'Kashi Diya', 'Rose & Sandalwood', 'Brass Coasters', 'Beeswax Votive', 'Diwali Toran', 'Gifting Boxes'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchTerm(tag)}
                    className="px-3 py-1 bg-[#F3E6D5] text-[#800020] text-xs rounded-sm hover:bg-[#800020] hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchTerm.trim() && (
            <div className="max-h-96 overflow-y-auto space-y-6 divide-y divide-[#F3E6D5] pr-1">
              {/* Product Matches */}
              {filteredProducts.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] block mb-3 font-semibold">
                    Products ({filteredProducts.length})
                  </span>
                  <div className="space-y-3">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(p);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-[#F3E6D5]/60 rounded cursor-pointer transition-colors"
                      >
                        <img
                          src={p.images.main}
                          alt={p.name}
                          className="w-12 h-14 object-cover rounded bg-[#F3E6D5]"
                        />
                        <div className="flex-1">
                          <span className="text-[9px] uppercase tracking-wider text-[#7A6B69]">
                            {p.categoryLabel}
                          </span>
                          <h4 className="font-serif text-sm text-[#332927] hover:text-[#800020]">
                            {p.name}
                          </h4>
                          <span className="text-xs font-semibold text-[#800020]">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Journal Matches */}
              {filteredArticles.length > 0 && (
                <div className="pt-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] block mb-3 font-semibold">
                    Editorial Essays ({filteredArticles.length})
                  </span>
                  <div className="space-y-2">
                    {filteredArticles.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onSelectArticle(a);
                          setIsSearchOpen(false);
                        }}
                        className="p-2 hover:bg-[#F3E6D5]/60 rounded cursor-pointer transition-colors"
                      >
                        <span className="text-[9px] uppercase tracking-wider text-[#800020] font-semibold">
                          {a.categoryLabel}
                        </span>
                        <h4 className="font-serif text-sm text-[#332927] hover:text-[#800020]">
                          {a.title}
                        </h4>
                        <p className="text-xs text-[#7A6B69] line-clamp-1">{a.leadExcerpt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 && filteredArticles.length === 0 && (
                <div className="py-8 text-center text-[#7A6B69]">
                  <p className="font-serif text-base text-[#332927]">No objects or essays found</p>
                  <p className="text-xs mt-1">Try searching for &quot;Brass&quot;, &quot;Candle&quot;, or &quot;Diwali&quot;.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
