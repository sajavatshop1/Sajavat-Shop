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
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('store-map')}
                  className="hover:text-white hover:underline transition-colors text-left inline-flex items-center gap-1.5"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  Find Our Atelier
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

        {/* ── Trust & Security Badges ── */}
        <div className="mt-8 pt-8 border-t border-[#FFF9F2]/15">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#F3E6D5]/60 text-center mb-5">
            Your Privacy &amp; Security, Guaranteed
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: 'lock', title: '256-bit SSL', sub: 'Bank-grade encryption on every page' },
              { icon: 'verified_user', title: 'Secure Payments', sub: 'Razorpay PCI-DSS Level 1 certified' },
              { icon: 'handshake', title: 'Heirloom Guarantee', sub: 'Hand-cast artisan authenticity' },
              { icon: 'local_shipping', title: 'Insured Shipping', sub: 'All parcels insured & tracked' },
              { icon: 'workspace_premium', title: '100% Authentic', sub: 'Hand-inspected before dispatch' },
              { icon: 'support_agent', title: 'Concierge Support', sub: 'Mon–Sat 10am–7pm IST' },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-sm border border-[#FFF9F2]/10 bg-[#600018]/30 hover:bg-[#600018]/50 transition-colors">
                <span className="material-symbols-outlined text-[22px] text-[#F3E6D5]">{badge.icon}</span>
                <span className="text-[11px] font-semibold text-[#F3E6D5] tracking-wide">{badge.title}</span>
                <span className="text-[9px] text-[#FFF9F2]/60 leading-snug">{badge.sub}</span>
              </div>
            ))}
          </div>

          {/* Payment Methods Row */}
          <div className="flex flex-col items-center gap-3 mt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F3E6D5]/60">
              Accepted Payment Methods
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {[
                { label: 'UPI', sub: 'GPay · PhonePe · Paytm' },
                { label: 'Visa', sub: 'Credit & Debit' },
                { label: 'MasterCard', sub: 'Credit & Debit' },
                { label: 'AmEx', sub: 'Credit Card' },
                { label: 'Net Banking', sub: '50+ Banks' },
                { label: 'EMI', sub: '0% on ₹5,000+' },
                { label: 'COD', sub: 'Cash on Delivery' },
              ].map(m => (
                <div key={m.label} className="flex flex-col items-center bg-[#FFF9F2]/10 border border-[#FFF9F2]/20 rounded-sm px-3 py-1.5">
                  <span className="text-[10px] font-bold text-white tracking-wider">{m.label}</span>
                  <span className="text-[8px] text-[#FFF9F2]/50">{m.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-8 mt-4 border-t border-[#FFF9F2]/15 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#FFF9F2]/65">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>
              <button
                type="button"
                onClick={() => { window.location.hash = '#admin'; setCurrentView('cms'); }}
                className="text-inherit hover:text-white cursor-default focus:outline-none transition-colors"
                title="Sajavat Decor"
                aria-label="Staff Portal Access"
              >
                ©
              </button>{' '}
              {new Date().getFullYear()} Sajavat Decor LLP. All rights reserved.
            </span>
            <span className="hidden sm:inline opacity-40">·</span>
            <div className="flex items-center flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1">
              {[
                { label: 'Privacy Policy', view: 'customer-care' },
                { label: 'Terms & Conditions', view: 'customer-care' },
                { label: 'Shipping Policy', view: 'customer-care' },
                { label: 'Return Policy', view: 'returns-policy' },
                { label: 'Cookie Policy', view: 'customer-care' },
                { label: 'Sitemap', view: 'home' },
              ].map(link => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => setCurrentView(link.view)}
                  className="hover:text-white transition-colors whitespace-nowrap"
                >
                  {link.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { window.location.hash = '#admin'; setCurrentView('cms'); }}
                className="hover:text-white transition-colors whitespace-nowrap font-bold text-[#F9E8B2] flex items-center gap-1 border-b border-[#F9E8B2]/40"
              >
                <span className="material-symbols-outlined text-[13px]">admin_panel_settings</span>
                Admin Backend Control
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#F3E6D5]/60 text-[10px]">
            <span className="material-symbols-outlined text-[14px] text-[#2D7A2D]">verified_user</span>
            <span>SSL Secured</span>
            <span className="opacity-40">·</span>
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>PCI-DSS Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
