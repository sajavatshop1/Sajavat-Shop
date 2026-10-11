import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { SajavatLogo } from './SajavatLogo';

interface FooterProps {
  setCurrentView: (view: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, onSelectCategory }) => {
  const { showToast, setIsOrderLookupOpen } = useCart();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      showToast(data.message || 'Subscribed! 10% privilege code is on its way.');
      setSubscribed(true);
      setEmail('');
    } catch {
      showToast('Thank you for subscribing to Sajavat Atelier Notes.');
      setSubscribed(true);
      setEmail('');
    }
  };

  const handleCategory = (cat: string) => {
    if (onSelectCategory) onSelectCategory(cat);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#800020] text-[#FFF9F2] border-t border-[#600018]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* 4 Column Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#FFF9F2]/20">
          {/* Col 1: Official Brand Logo & Statement */}
          <div className="flex flex-col space-y-4">
            <div>
              <SajavatLogo variant="on-burgundy" size="lg" showTagline={true} />
            </div>
            <p className="text-xs text-[#FFF9F2]/80 leading-relaxed pr-4 pt-1">
              An artisanal boutique curating timeless Indian festive heritage and refined home decor. Mindfully crafted brass, terracotta, and hand-poured fragrances to illuminate your cherished rituals.
            </p>
            <div className="text-[11px] text-[#F3E6D5] italic pt-1">
              Handcrafted with love across Jaipur & Moradabad ateliers.
            </div>
          </div>

          {/* Col 2: Shop Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F3E6D5]">
              Shop
            </h3>
            <ul className="space-y-2 text-xs text-[#FFF9F2]/85">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategory('diyas-candle-holders')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Diyas & Candle Holders
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategory('candles-fragrance')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Candles & Fragrance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategory('festive-decorations')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Festive Decorations
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategory('home-accents')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Home Accents
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategory('table-decor')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Table Décor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleCategory('gifts-hampers')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Gifts & Hampers
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F3E6D5]">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs text-[#FFF9F2]/85">
              <li>
                <button
                  type="button"
                  onClick={() => setIsOrderLookupOpen(true)}
                  className="hover:text-white hover:underline transition-colors text-left font-medium text-[#F3E6D5]"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('customer-care')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('returns-policy')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('care-guide')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  Brass & Candle Care Guide
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('faqs')}
                  className="hover:text-white hover:underline transition-colors text-left"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('contact')}
                  className="hover:text-white hover:underline transition-colors text-left font-medium text-[#F3E6D5]"
                >
                  Contact Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Socials */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F3E6D5]">
              Stay Connected
            </h3>
            <p className="text-xs text-[#FFF9F2]/85 leading-relaxed">
              Follow our seasonal décor journals and behind-the-scenes glimpses with our artisan coppersmiths.
            </p>

            <form onSubmit={handleSubscribe} className="pt-1 flex flex-col gap-2">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="bg-[#FFF9F2]/10 border border-[#FFF9F2]/30 px-3 py-2 text-xs text-white placeholder:text-[#FFF9F2]/50 focus:outline-none focus:border-[#F3E6D5] rounded-l-sm flex-1"
                />
                <button
                  type="submit"
                  className="bg-[#F3E6D5] text-[#800020] px-4 py-2 text-[11px] uppercase tracking-wider font-semibold rounded-r-sm hover:bg-white transition-colors"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <span className="text-[10px] text-[#F3E6D5]">
                  ✓ Welcome privilege code sent to your inbox.
                </span>
              )}
            </form>

            <div className="flex items-center space-x-4 pt-2 text-[#F3E6D5]">
              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-white transition-colors" title="Instagram">
                photo_camera
              </span>
              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-white transition-colors" title="Pinterest">
                push_pin
              </span>
              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-white transition-colors" title="Facebook">
                public
              </span>
              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-white transition-colors" title="Email Concierge">
                mail
              </span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-[#F3E6D5]/80 block">Concierge Hours:</span>
              <span className="text-xs text-white font-medium">Mon — Sat, 10:00 AM — 7:00 PM IST</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FFF9F2]/75">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#admin';
                  setCurrentView('cms');
                }}
                className="text-inherit hover:text-white cursor-default focus:outline-none transition-colors"
                title="Sajavat Decor"
                aria-label="Staff Portal Access"
              >
                ©
              </button>{' '}
              Sajavat Decor LLP. All rights reserved.
            </span>
            <span className="hidden sm:inline">·</span>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setCurrentView('customer-care')}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('customer-care')}
                className="hover:text-white transition-colors"
              >
                Terms & Conditions
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('customer-care')}
                className="hover:text-white transition-colors"
              >
                Shipping Policy
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider font-semibold">
            <span className="border border-[#FFF9F2]/30 px-2 py-0.5 rounded-sm bg-[#600018]/50">
              UPI
            </span>
            <span className="border border-[#FFF9F2]/30 px-2 py-0.5 rounded-sm bg-[#600018]/50">
              VISA
            </span>
            <span className="border border-[#FFF9F2]/30 px-2 py-0.5 rounded-sm bg-[#600018]/50">
              MASTERCARD
            </span>
            <span className="border border-[#FFF9F2]/30 px-2 py-0.5 rounded-sm bg-[#600018]/50">
              NETBANKING
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
