import React from 'react';
import { useCart } from '../context/CartContext';
import { SajavatLogo } from './SajavatLogo';

interface CartDrawerProps {
  setCurrentView: (view: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ setCurrentView }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    toggleGiftWrap,
    subtotal,
    itemCount
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const freeShippingThreshold = 2999;
  const freeShippingUnlocked = subtotal >= freeShippingThreshold;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <>
      {/* Ambient backdrop */}
      <div
        className="fixed inset-0 bg-[#800020]/25 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-out drawer */}
      <aside
        aria-label="Celebration Bag Drawer"
        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#FFF9F2] shadow-2xl z-50 flex flex-col justify-between border-l border-[#F3E6D5] animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#F3E6D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SajavatLogo variant="badge" size="sm" showTagline={false} />
            <div className="flex flex-col">
              <span className="font-serif text-lg text-[#332927] font-normal leading-tight">
                Celebration Bag
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#7A6B69]">
                ({itemCount} {itemCount === 1 ? 'piece' : 'pieces'})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7A6B69] hover:text-[#800020] hover:bg-[#F3E6D5]/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#F3E6D5]/40 px-5 py-3 border-b border-[#F3E6D5]">
          <div className="flex items-center justify-between text-xs text-[#7A6B69] mb-1.5">
            <span className="flex items-center gap-1.5 font-medium text-[#800020]">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              {freeShippingUnlocked
                ? 'Complimentary Express Delivery Unlocked'
                : `Add ₹${(freeShippingThreshold - subtotal).toLocaleString('en-IN')} for Free Pan-India Delivery`}
            </span>
            <span className="text-[11px] font-semibold text-[#800020]">
              {freeShippingUnlocked ? '100%' : `${progressPercent}%`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E6D7C3] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#800020] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Drawer Items Scroll Container */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col divide-y divide-[#F3E6D5]">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-[#7A6B69]">
              <span className="material-symbols-outlined text-4xl mb-3 text-[#E6D7C3]">
                shopping_bag
              </span>
              <p className="font-serif text-lg text-[#332927] mb-1">
                Your celebration bag is empty
              </p>
              <p className="text-xs max-w-xs mb-6">
                Explore hand-cast brass urlis, temple diyas, and temple botanical fragrances.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setCurrentView('shop');
                }}
                className="px-6 py-2.5 bg-[#800020] text-[#FFF9F2] text-xs uppercase tracking-wider font-semibold hover:bg-[#600018] transition-colors"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.product.id}-${item.finish || index}`} className="py-4 flex gap-3.5">
                {/* Thumbnail */}
                <div className="w-20 h-24 rounded bg-[#F3E6D5] overflow-hidden shrink-0">
                  <img
                    src={item.product.images.main}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-serif text-sm text-[#332927] leading-snug line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.finish)}
                        className="text-[#7A6B69] hover:text-[#800020] text-xs p-0.5"
                        title="Remove"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    {item.finish && (
                      <span className="text-[11px] text-[#7A6B69] block mt-0.5">
                        Finish: {item.finish}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-[#800020]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-[#7A6B69]">
                          (₹{item.product.price.toLocaleString('en-IN')} each)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Gift wrap row */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#E6D7C3] rounded">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.finish, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#7A6B69] hover:text-[#332927] hover:bg-[#F3E6D5]/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[12px]">remove</span>
                      </button>
                      <span className="w-6 text-center text-xs font-medium text-[#332927]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, item.finish, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-[#7A6B69] hover:text-[#332927] hover:bg-[#F3E6D5]/50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[12px]">add</span>
                      </button>
                    </div>

                    <label className="flex items-center gap-1.5 text-[11px] text-[#7A6B69] cursor-pointer hover:text-[#800020]">
                      <input
                        type="checkbox"
                        checked={item.giftWrap}
                        onChange={() => toggleGiftWrap(item.product.id, item.finish)}
                        className="w-3 h-3 accent-[#800020]"
                      />
                      <span>Lokta Wrap</span>
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#F3E6D5] bg-[#FFF9F2] flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-[#7A6B69]">
                Estimated Subtotal
              </span>
              <span className="font-serif text-2xl text-[#800020] font-normal">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <p className="text-[11px] text-[#7A6B69] leading-tight">
              Taxes and insured transit packing included. Promotional coupons calculated at checkout.
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3.5 px-5 rounded-sm text-xs uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
            >
              <span>Proceed to Ritual Checkout</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="text-center text-[10px] uppercase tracking-widest text-[#7A6B69] hover:text-[#800020] transition-colors py-1"
            >
              Continue Browsing Atelier
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
