import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CouponState {
  code: string;
  discountPercentage: number;
  discountAmount: number;
  message: string;
}

interface ToastState {
  message: string;
  visible: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, finish?: string, giftWrap?: boolean) => void;
  removeFromCart: (productId: string, finish?: string) => void;
  updateQuantity: (productId: string, finish: string | undefined, quantity: number) => void;
  toggleGiftWrap: (productId: string, finish?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  giftWrapTotal: number;
  shippingCost: number;
  total: number;
  coupon: CouponState | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isOrderLookupOpen: boolean;
  setIsOrderLookupOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toast: ToastState;
  showToast: (message: string) => void;
  activeOrderId: string | null;
  setActiveOrderId: (orderId: string | null) => void;
  shippingSpeed: 'express' | 'priority';
  setShippingSpeed: (speed: 'express' | 'priority') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-seed with the initial 2 items shown in Image 5 (Mayura Urli + Gulab Candle) so the experience feels immediately rich
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sajavat_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to initial default
    }
    return [
      {
        product: {
          id: 'mayura-brass-urli',
          name: 'Mayura Brass Urli with Floating Diya Set',
          sku: 'SJ-URL-048',
          category: 'diyas-candle-holders',
          categoryLabel: 'Diyas & Candle Holders',
          price: 3450,
          originalPrice: 4200,
          material: 'Pure Brass',
          craftHeritage: 'Moradabad Sand-Cast Brass Guild',
          weight: '1.85 kg',
          dimensions: '12" Diameter × 3.5" Height',
          stock: 7,
          featured: true,
          bestseller: true,
          rating: 4.9,
          reviewsCount: 42,
          images: {
            main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwqaCtGR5f2YGRZ0vFu29AI8sdvNknypepJqIDvsmW6kFGrXZ77COgEPFQgapONq6KWf5zNIubYRDzCOEhen7aOVw47TjjSJdtE77ugBGQcWbEYr11c4AUK5UJbt-ywkbYBCWgPnlIm42QPJ8yFRNbFeiQxinvll3eh5CmSTTptDuD08RzhCSn2NLKItYjsFaTox2O4fRFOn4I4Kqg5lPlTLaB0dBHhU2Z5U0nEW9yBMsu2ORspEQcZg'
          },
          description: 'An ode to timeless hospitality. Molded from solid heavy-gauge bell brass with peacock feather filigree, paired with six weighted lotus floating diyas crafted to dance atop water.',
          specifications: {
            materialCraft: 'Solid bell-metal brass',
            dimensionsWeight: '12" dia · 1.85 kg',
            ritualCare: 'Dry thoroughly after use',
            inTheBox: '1 × Urli, 6 × Diyas'
          }
        },
        quantity: 1,
        finish: 'Hand-Aged Patina Brass',
        giftWrap: true
      },
      {
        product: {
          id: 'gulab-chandan-candle',
          name: 'Gulab & Chandan Artisanal Ceramic Candle',
          sku: 'SJ-CND-031',
          category: 'candles-fragrance',
          categoryLabel: 'Candles & Fragrance',
          price: 1299,
          originalPrice: 1599,
          material: 'Soy Wax',
          craftHeritage: 'Khurja Hand-thrown Ceramics',
          weight: '450g',
          dimensions: '3.8" × 3.5"',
          stock: 22,
          featured: true,
          bestseller: true,
          rating: 4.9,
          reviewsCount: 36,
          images: {
            main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEaBzhxpGSwDS9OrmUCVBXnnpDi6yNdu5mlsGyIGWO29pE-aZAa_9cRbJGUWBBpdDFd-kOWesq8KNuJogn86UGwZl0c19QcKHOX0uC-98ZV3pZb0ezyasLhThluyZp-NyEKuXplMAzaD1fM4omv5J5c9_u4ss45QeDjTc6YpHIsMV9F7gFSqfi9xLBi0YeroR_wKLT7swoP2UcZRerxIFCa4qfOg4EJlZkGud4w7TMkxyyCZIx2wvYOg'
          },
          description: 'Hand-thrown stoneware jar filled with pure non-GMO soy wax infused with Mysore red sandalwood and steam-distilled Damascus rose.',
          specifications: {
            materialCraft: 'Stoneware pot & pure soy wax',
            dimensionsWeight: '250g wax · 55 hrs',
            ritualCare: 'Trim wick to 5mm',
            inTheBox: '1 × Ceramic Candle'
          }
        },
        quantity: 2,
        finish: 'Indian Rose & Sandalwood (250g)',
        giftWrap: false
      }
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sajavat_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [coupon, setCoupon] = useState<CouponState | null>({
    code: 'FESTIVE15',
    discountPercentage: 15,
    discountAmount: 750,
    message: 'FESTIVE15 applied (15% festive gift savings)'
  });

  const [shippingSpeed, setShippingSpeed] = useState<'express' | 'priority'>('express');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState>({
    message: '',
    visible: false
  });

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  };

  useEffect(() => {
    localStorage.setItem('sajavat_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sajavat_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1, finish?: string, giftWrap = false) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.finish === finish
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, finish, giftWrap }];
    });
    showToast(`"${product.name}" added to your celebration bag.`);
  };

  const removeFromCart = (productId: string, finish?: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.finish === finish)));
    showToast('Item removed from shopping bag.');
  };

  const updateQuantity = (productId: string, finish: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, finish);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.finish === finish) {
          return { ...item, quantity: Math.min(item.product.stock || 10, quantity) };
        }
        return item;
      })
    );
  };

  const toggleGiftWrap = (productId: string, finish?: string) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.finish === finish) {
          return { ...item, giftWrap: !item.giftWrap };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        showToast('Removed from your festive wishlist.');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Saved to your festive wishlist.');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Subtotal & Calculations
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Gift wrap: free if subtotal >= 2999, else ₹150 per wrapped item
  const rawGiftWrapTotal = cart.reduce(
    (acc, item) => acc + (item.giftWrap ? 150 * item.quantity : 0),
    0
  );
  const giftWrapTotal = subtotal >= 2999 ? 0 : rawGiftWrapTotal;

  // Coupon Discount
  let discount = 0;
  if (coupon) {
    discount = Math.round((subtotal * coupon.discountPercentage) / 100);
  }

  const shippingCost = shippingSpeed === 'priority' ? 250 : (subtotal >= 2999 ? 0 : 150);
  const total = Math.max(0, subtotal - discount + giftWrapTotal + shippingCost);

  const applyCoupon = async (code: string) => {
    const clean = code.trim().toUpperCase();
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({
          code: data.code,
          discountPercentage: data.discountPercentage,
          discountAmount: data.discountAmount,
          message: data.message
        });
        showToast(data.message);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code.' };
      }
    } catch {
      // Offline fallback
      if (clean === 'FESTIVE15') {
        setCoupon({
          code: 'FESTIVE15',
          discountPercentage: 15,
          discountAmount: Math.round(subtotal * 0.15),
          message: 'FESTIVE15 applied (15% festive gift savings)'
        });
        showToast('FESTIVE15 applied.');
        return { success: true, message: 'FESTIVE15 applied.' };
      }
      return { success: false, message: 'Unable to validate promotional code.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Coupon removed.');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleGiftWrap,
        clearCart,
        itemCount,
        subtotal,
        discount,
        giftWrapTotal,
        shippingCost,
        total,
        coupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isWishlisted,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isOrderLookupOpen,
        setIsOrderLookupOpen,
        isSearchOpen,
        setIsSearchOpen,
        toast,
        showToast,
        activeOrderId,
        setActiveOrderId,
        shippingSpeed,
        setShippingSpeed
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
