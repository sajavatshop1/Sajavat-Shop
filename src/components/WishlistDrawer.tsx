import React from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface WishlistDrawerProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ products, onSelectProduct }) => {
  const { wishlist, toggleWishlist, addToCart, isWishlistOpen, setIsWishlistOpen } = useCart();

  if (!isWishlistOpen) return null;

  const savedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <>
      <div
        className="fixed inset-0 bg-[#800020]/25 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <aside
        aria-label="Festive Wishlist Drawer"
        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#FFF9F2] shadow-2xl z-50 flex flex-col justify-between border-l border-[#F3E6D5] animate-in slide-in-from-right duration-300"
      >
        <div className="p-5 border-b border-[#F3E6D5] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl text-[#332927]">Festive Wishlist</span>
            <span className="text-xs uppercase tracking-wider text-[#7A6B69]">
              ({savedProducts.length} saved)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6B69] hover:text-[#800020] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto flex flex-col divide-y divide-[#F3E6D5]">
          {savedProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-[#7A6B69]">
              <span className="material-symbols-outlined text-4xl mb-3 text-[#E6D7C3]">
                favorite
              </span>
              <p className="font-serif text-lg text-[#332927] mb-1">
                Your wishlist is empty
              </p>
              <p className="text-xs max-w-xs">
                Tap the heart icon on any brassware, candle, or celebratory hamper to save for later.
              </p>
            </div>
          ) : (
            savedProducts.map(p => (
              <div key={p.id} className="py-4 flex gap-3.5">
                <div
                  className="w-20 h-24 rounded bg-[#F3E6D5] overflow-hidden shrink-0 cursor-pointer"
                  onClick={() => {
                    onSelectProduct(p);
                    setIsWishlistOpen(false);
                  }}
                >
                  <img src={p.images.main} alt={p.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#7A6B69] block">
                      {p.categoryLabel}
                    </span>
                    <h4
                      className="font-serif text-sm text-[#332927] hover:text-[#800020] cursor-pointer line-clamp-1"
                      onClick={() => {
                        onSelectProduct(p);
                        setIsWishlistOpen(false);
                      }}
                    >
                      {p.name}
                    </h4>
                    <span className="text-xs font-semibold text-[#800020] mt-1 block">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(p, 1);
                        toggleWishlist(p.id);
                      }}
                      className="text-xs text-[#800020] hover:underline font-medium flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
                      Move to Bag
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(p.id)}
                      className="text-xs text-[#7A6B69] hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-5 border-t border-[#F3E6D5]">
          <button
            type="button"
            onClick={() => setIsWishlistOpen(false)}
            className="w-full py-2.5 text-center text-xs uppercase tracking-wider text-[#7A6B69] hover:text-[#800020]"
          >
            Close
          </button>
        </div>
      </aside>
    </>
  );
};
