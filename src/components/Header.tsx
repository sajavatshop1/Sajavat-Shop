import React, { useState } from 'react';
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

  const categories = [
    { id: 'all', label: 'All Collections' },
    { id: 'diyas-candle-holders', label: 'Diyas & Candle Holders' },
    { id: 'candles-fragrance', label: 'Candles & Fragrance' },
    { id: 'festive-decorations', label: 'Festive Decorations' },
    { id: 'home-accents', label: 'Home Accents' },
    { id: 'table-decor', label: 'Table Décor' },
    { id: 'gifts-hampers', label: 'Gifts & Hampers' }
  ];

  const handleCategoryClick = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
    setCurrentView('shop');
    setShopMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const showAnnouncement = siteSettings ? siteSettings.announcementEnabled : true;
  const announcementText = siteSettings?.announcementText || 'Thoughtfully Curated Festive Décor — Complimentary Shipping on Orders Over ₹2,999';
  const announcementBg = siteSettings?.announcementBg || '#800020';
  const announcementTextColor = siteSettings?.announcementTextColor || '#FFF9F2';
  const logoUrl = siteSettings?.logoUrl || '/Sajavat.svg';

  return (
    <>
      {/* Top Announcement Bar */}
      {showAnnouncement && (
        <div
          className="w-full py-2 px-4 text-center text-[11px] sm:text-xs font-medium tracking-[0.2em] uppercase border-b border-black/10 relative z-50 transition-colors"
          style={{ backgroundColor: announcementBg, color: announcementTextColor }}
        >
          <span>{announcementText}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FFF9F2]/95 backdrop-blur-md border-b border-[#F3E6D5] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Hamburger Button */}
          <button 
            type="button"
            className="md:hidden p-2 text-[#332927] hover:text-[#800020] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Official Sajavat Brand Logo */}
          <button 
            type="button" 
            onClick={() => setCurrentView('home')} 
            className="flex items-center text-left group transition-transform hover:scale-[1.02] py-1"
            aria-label="Sajavat Home"
          >
            <img
              src={logoUrl}
              alt="Sajavat — Decore For Every Celebration"
              className="h-14 sm:h-16 w-14 sm:w-16 object-contain rounded-xl shadow-md border border-[#D4AF37]/35 transition-transform group-hover:scale-105"
            />
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium tracking-[0.14em] uppercase text-[#332927]">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className={`pb-0.5 transition-colors ${
                currentView === 'home'
                  ? 'text-[#800020] border-b-2 border-[#800020] font-semibold'
                  : 'hover:text-[#800020]'
              }`}
            >
              Home
            </button>

            {/* Shop Dropdown */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setShopMenuOpen(true)}
              onMouseLeave={() => setShopMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setCurrentView('shop');
                  setShopMenuOpen(false);
                }}
                className={`flex items-center gap-0.5 transition-colors ${
                  currentView === 'shop'
                    ? 'text-[#800020] border-b-2 border-[#800020] font-semibold'
                    : 'hover:text-[#800020]'
                }`}
              >
                Shop <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>

              {shopMenuOpen && (
                <div className="absolute left-0 top-full w-60 bg-[#FFF9F2] shadow-xl border border-[#F3E6D5] py-2 rounded-sm z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className="w-full text-left px-4 py-2.5 text-xs text-[#332927] hover:bg-[#F3E6D5] hover:text-[#800020] transition-colors tracking-[0.08em] uppercase flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                      <span className="material-symbols-outlined text-[14px] opacity-60">chevron_right</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (onSelectCategory) onSelectCategory('all');
                setCurrentView('shop');
              }}
              className="hover:text-[#800020] transition-colors"
            >
              Collections
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('our-story')}
              className={`pb-0.5 transition-colors ${
                currentView === 'our-story'
                  ? 'text-[#800020] border-b-2 border-[#800020] font-semibold'
                  : 'hover:text-[#800020]'
              }`}
            >
              Our Story
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('journal')}
              className={`pb-0.5 transition-colors ${
                currentView === 'journal'
                  ? 'text-[#800020] border-b-2 border-[#800020] font-semibold'
                  : 'hover:text-[#800020]'
              }`}
            >
              The Journal
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('contact')}
              className={`pb-0.5 transition-colors ${
                currentView === 'contact' || currentView === 'customer-care'
                  ? 'text-[#800020] border-b-2 border-[#800020] font-semibold'
                  : 'hover:text-[#800020]'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center space-x-4 sm:space-x-5 text-[#332927]">
            {/* Search */}
            <button
              type="button"
              aria-label="Search Catalogue"
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-[#800020] transition-colors p-1 flex items-center"
              title="Search Catalogue & Rituals"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            {/* Wishlist */}
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => setIsWishlistOpen(true)}
              className="relative hover:text-[#800020] transition-colors p-1 flex items-center"
              title="Festive Wishlist"
            >
              <span className="material-symbols-outlined text-[22px]">favorite</span>
              <span className="absolute -top-1 -right-1 bg-[#F3E6D5] text-[#800020] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                {wishlist.length}
              </span>
            </button>

            {/* Orders & Concierge Account */}
            <button
              type="button"
              aria-label="Account & Order Tracking"
              onClick={() => setIsOrderLookupOpen(true)}
              className="hover:text-[#800020] transition-colors p-1 flex items-center"
              title="Track Order & Concierge"
            >
              <span className="material-symbols-outlined text-[22px]">person</span>
            </button>

            {/* Shopping Bag */}
            <button
              type="button"
              aria-label="Shopping Bag"
              onClick={() => setIsCartOpen(true)}
              className="relative hover:text-[#800020] transition-colors p-1 flex items-center"
              title="Shopping Bag"
            >
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              <span className="absolute -top-1 -right-1 bg-[#800020] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFF9F2] border-b border-[#F3E6D5] px-6 py-4 flex flex-col space-y-3 uppercase text-xs tracking-wider">
            <button
              type="button"
              className="text-left py-2 font-medium text-[#800020]"
              onClick={() => {
                setCurrentView('home');
                setMobileMenuOpen(false);
              }}
            >
              Home
            </button>
            <div className="border-t border-[#F3E6D5] pt-2">
              <span className="text-[10px] text-[#7A6B69] font-semibold tracking-widest block mb-1">
                Shop By Category
              </span>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className="block w-full text-left py-1.5 text-xs text-[#332927] hover:text-[#800020]"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="text-left py-2 border-t border-[#F3E6D5]"
              onClick={() => {
                setCurrentView('about');
                setMobileMenuOpen(false);
              }}
            >
              Our Story
            </button>
            <button
              type="button"
              className="text-left py-2 border-t border-[#F3E6D5]"
              onClick={() => {
                setCurrentView('journal');
                setMobileMenuOpen(false);
              }}
            >
              The Journal
            </button>
            <button
              type="button"
              className="text-left py-2 border-t border-[#F3E6D5]"
              onClick={() => {
                setCurrentView('contact');
                setMobileMenuOpen(false);
              }}
            >
              Customer Care &amp; Concierge
            </button>
          </div>
        )}
      </header>
    </>
  );
};
