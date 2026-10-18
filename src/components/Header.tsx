import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { SiteSettings } from '../types';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onSelectCategory?: (category: string) => void;
  siteSettings?: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onSelectCategory, siteSettings }) => {
  const { itemCount, wishlist, setIsCartOpen, setIsWishlistOpen, setIsOrderLookupOpen, setIsSearchOpen } = useCart();
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShopMenuOpen(false);
  }, [currentView]);

  const categories = [
    { id: 'all', label: 'All Collections', icon: 'apps', desc: 'Browse everything' },
    { id: 'diyas-candle-holders', label: 'Diyas & Candle Holders', icon: 'local_fire_department', desc: 'Brass, bronze & clay' },
    { id: 'candles-fragrance', label: 'Candles & Fragrance', icon: 'spa', desc: 'Pure soy & botanicals' },
    { id: 'festive-decorations', label: 'Festive Decorations', icon: 'auto_awesome', desc: 'Torans, bells & garlands' },
    { id: 'home-accents', label: 'Home Accents', icon: 'home', desc: 'Urlis, bowls & sculpture' },
    { id: 'table-decor', label: 'Table Décor', icon: 'restaurant', desc: 'Kansa & linen' },
    { id: 'gifts-hampers', label: 'Gifts & Hampers', icon: 'redeem', desc: 'Curated celebration boxes' },
  ];

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) onSelectCategory(catId);
    setCurrentView('shop');
    setShopMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const logoUrl = siteSettings?.logoUrl || '/Sajavat.svg';

  return (
    <>

      {/* ── Main Sticky Header ── */}
      <header
        className={`sticky top-0 z-40 bg-[#FFF9F2]/96 backdrop-blur-md border-b border-[#F3E6D5] transition-all duration-300 ${
          scrolled ? 'shadow-[0_2px_24px_-4px_rgba(112,0,20,0.12)]' : ''
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}
        >
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden tap-target p-2 text-[#332927] hover:text-[#800020] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`material-symbols-outlined text-[24px] transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`}>
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Logo */}
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className="flex items-center text-left group py-1 btn-press"
            aria-label="Sajavat Home"
          >
            <img
              src={logoUrl}
              alt="Sajavat — Decore For Every Celebration"
              className={`object-contain rounded-xl shadow-md border border-[#D4AF37]/35 transition-all duration-300 group-hover:shadow-lg group-hover:border-[#D4AF37]/60 ${
                scrolled ? 'h-11 sm:h-12 w-11 sm:w-12' : 'h-14 sm:h-16 w-14 sm:w-16'
              }`}
              width="64"
              height="64"
            />
          </button>

          {/* ── Center Navigation ── */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-medium tracking-[0.14em] uppercase text-[#332927]">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className={`relative pb-0.5 transition-colors duration-200 underline-draw ${
                currentView === 'home' ? 'text-[#800020] font-semibold' : 'hover:text-[#800020]'
              }`}
            >
              Home
            </button>

            {/* ── Shop & Collections Mega-Menu ── */}
            <div
              className="relative py-2"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => { setCurrentView('shop'); setShopMenuOpen(false); }}
                className={`flex items-center gap-0.5 transition-colors duration-200 ${
                  currentView === 'shop' ? 'text-[#800020] font-semibold' : 'hover:text-[#800020]'
                }`}
              >
                Shop &amp; Collections
                <span className={`material-symbols-outlined text-[14px] transition-transform duration-300 ${shopMenuOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Mega-Menu panel */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 top-full w-[640px] bg-[#FFF9F2] shadow-2xl border border-[#F3E6D5] z-50 transition-all duration-200 ${
                  shopMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="grid grid-cols-5">
                  {/* Left: Category list — 3 cols */}
                  <div className="col-span-3 p-5 border-r border-[#F3E6D5]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#800020] mb-3">
                      Browse Categories
                    </p>
                    <div className="grid grid-cols-1 gap-0.5">
                      {categories.map((cat, idx) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryClick(cat.id)}
                          className="group/item w-full text-left px-3 py-2.5 text-[11px] text-[#332927] hover:bg-[#F3E6D5] hover:text-[#800020] transition-colors tracking-[0.08em] flex items-center gap-3 rounded-sm"
                          style={{ transitionDelay: shopMenuOpen ? `${idx * 18}ms` : '0ms' }}
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#800020]/60 group-hover/item:text-[#800020] transition-colors shrink-0">
                            {cat.icon}
                          </span>
                          <span className="flex flex-col">
                            <span className="font-semibold uppercase">{cat.label}</span>
                            <span className="text-[10px] text-[#7A6B69] tracking-normal normal-case font-normal">{cat.desc}</span>
                          </span>
                          <span className="material-symbols-outlined text-[13px] ml-auto opacity-0 group-hover/item:opacity-50 transition-all -translate-x-1 group-hover/item:translate-x-0">
                            chevron_right
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Trust panel — 2 cols */}
                  <div className="col-span-2 p-5 bg-[#F3E6D5]/30 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#800020] mb-3">
                        Why Choose Sajavat
                      </p>
                      <div className="space-y-3">
                        {[
                          { icon: 'verified', text: 'Every piece is hand-inspected before dispatch' },
                          { icon: 'verified_user', text: 'SSL-encrypted checkout, always' },
                          { icon: 'handshake', text: 'Artisanal heirloom craft & transit insurance' },
                          { icon: 'local_shipping', text: 'Free insured shipping over ₹2,999' },
                          { icon: 'workspace_premium', text: '100% genuine pure brass & kansa' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[15px] text-[#2D7A2D] shrink-0 mt-0.5">{item.icon}</span>
                            <p className="text-[10px] text-[#554745] leading-relaxed tracking-normal normal-case font-normal">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E6D7C3]">
                      <p className="text-[10px] text-[#7A6B69] mb-2 tracking-normal normal-case font-normal">We accept</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {['UPI', 'Visa', 'MC', 'NetBanking', 'COD'].map(m => (
                          <span key={m} className="text-[9px] font-bold bg-white border border-[#E6D7C3] text-[#332927] px-2 py-0.5 rounded-sm shadow-sm">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('our-story')}
              className={`relative pb-0.5 transition-colors duration-200 underline-draw ${
                currentView === 'about' || currentView === 'our-story' ? 'text-[#800020] font-semibold' : 'hover:text-[#800020]'
              }`}
            >
              Our Story
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('journal')}
              className={`relative pb-0.5 transition-colors duration-200 underline-draw ${
                currentView === 'journal' ? 'text-[#800020] font-semibold' : 'hover:text-[#800020]'
              }`}
            >
              The Journal
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('contact')}
              className={`relative pb-0.5 transition-colors duration-200 underline-draw ${
                currentView === 'contact' || currentView === 'customer-care' ? 'text-[#800020] font-semibold' : 'hover:text-[#800020]'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Utility Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3 text-[#332927]">
            <button
              type="button"
              aria-label="Search Catalogue"
              onClick={() => setIsSearchOpen(true)}
              className="tap-target hover:text-[#800020] transition-colors p-1.5 flex items-center btn-press"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => setIsWishlistOpen(true)}
              className="tap-target relative hover:text-[#800020] transition-colors p-1.5 flex items-center btn-press"
            >
              <span className="material-symbols-outlined text-[22px]">favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F3E6D5] text-[#800020] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-scaleIn">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label="Track Order"
              onClick={() => setIsOrderLookupOpen(true)}
              className="tap-target hover:text-[#800020] transition-colors p-1.5 hidden sm:flex items-center btn-press"
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
            </button>


            <button
              type="button"
              aria-label="Shopping Bag"
              onClick={() => setIsCartOpen(true)}
              className="tap-target relative hover:text-[#800020] transition-colors p-1.5 flex items-center btn-press"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#800020] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-scaleIn">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-[#FFF9F2] border-b border-[#F3E6D5] px-5 py-4 flex flex-col space-y-0.5 uppercase text-xs tracking-wider">
            <button
              type="button"
              className="tap-target text-left py-2.5 font-semibold text-[#800020] flex items-center gap-2"
              onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Home
            </button>

            {/* Mobile Category Grid */}
            <div className="border-t border-[#F3E6D5] pt-3 pb-2">
              <span className="text-[10px] text-[#7A6B69] font-semibold tracking-widest block mb-2.5">
                Shop &amp; Collections
              </span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className="tap-target text-left py-1.5 text-xs text-[#332927] hover:text-[#800020] transition-colors flex items-center gap-1.5"
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    <span className="material-symbols-outlined text-[13px] text-[#800020]/60">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Trust Badges */}
            <div className="border-t border-[#F3E6D5] pt-3 pb-2 grid grid-cols-2 gap-2">
              {[
                { icon: 'verified_user', text: 'Secure Checkout' },
                { icon: 'inventory_2', text: 'Insured Transit' },
                { icon: 'local_shipping', text: 'Free Ship ₹2999+' },
                { icon: 'workspace_premium', text: '100% Genuine' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[#554745] normal-case font-normal">
                  <span className="material-symbols-outlined text-[13px] text-[#2D7A2D]">{b.icon}</span>
                  <span className="text-[10px]">{b.text}</span>
                </div>
              ))}
            </div>

            {[
              { label: 'Our Story', view: 'about', icon: 'auto_stories' },
              { label: 'The Journal', view: 'journal', icon: 'article' },
              { label: 'Track My Order', view: null as string | null, icon: 'local_shipping', action: () => setIsOrderLookupOpen(true) },
              { label: 'Customer Care', view: 'contact', icon: 'headset_mic', action: null as (() => void) | null },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                className="tap-target text-left py-2.5 border-t border-[#F3E6D5] flex items-center gap-2 text-[#332927] hover:text-[#800020] transition-colors"
                onClick={() => {
                  if (item.action) item.action();
                  else if (item.view) setCurrentView(item.view);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    </>
  );
};
