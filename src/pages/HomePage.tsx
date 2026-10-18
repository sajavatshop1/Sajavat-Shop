import React, { useState } from 'react';
import { Product, JournalArticle, SiteSettings } from '../types';
import { useCart } from '../context/CartContext';
import { useScrollReveal, useScrollRevealAll } from '../hooks/useScrollReveal';

interface HomePageProps {
  products: Product[];
  journalArticles: JournalArticle[];
  setCurrentView: (view: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectArticle: (article: JournalArticle) => void;
  onSelectCategory: (category: string) => void;
  siteSettings?: SiteSettings;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  journalArticles,
  setCurrentView,
  onSelectProduct,
  onSelectArticle,
  onSelectCategory,
  siteSettings
}) => {
  const { addToCart, toggleWishlist, isWishlisted, showToast } = useCart();
  const [highlightTab, setHighlightTab] = useState<'all' | 'urlis' | 'aromatics' | 'pairs'>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);

  // Scroll reveal hooks for modern smooth entrance
  const trustRef = useScrollReveal();
  const categoriesRef = useScrollReveal<HTMLDivElement>();
  const highlightsTitleRef = useScrollReveal<HTMLDivElement>();
  const highlightsGridRef = useScrollRevealAll();
  const spotlightRef = useScrollReveal<HTMLDivElement>();
  const bestsellersRef = useScrollReveal<HTMLDivElement>();
  const bestsellersGridRef = useScrollRevealAll();
  const reviewsRef = useScrollReveal<HTMLDivElement>();
  const galleryRef = useScrollReveal<HTMLDivElement>();
  const newsletterRef = useScrollReveal<HTMLDivElement>();

  // 6 Visual Category Items
  const categoryTiles = [
    {
      id: 'diyas-candle-holders',
      title: 'Diyas & Candle Holders',
      tagline: 'Brass Urlis & Lamps',
      startingPrice: 'From ₹1,450',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzolsPoVtK5H-tHMBNVIZaSIUJCYumpMSgJ7znM3PqoZ1D26Su-yZ1fGlyOvG_BH8Fzczlv37DWTO0CBv2PkBt94ZTEZ6ychoOqVyPBh9rQbXMy5alC5i_SmfY21LXf6BMIR9zxuBkrPuAPJcmRMliRtc69YbbSoxVAQDGm-oXsoJEcE5J25BQl72mXe0WomisaGWav5mxiV-E_3mofXmk9liC-Ao14tlGb__uHKbyvGDdtAh4e7RXsA'
    },
    {
      id: 'candles-fragrance',
      title: 'Candles & Fragrance',
      tagline: 'Pure Soy & Botanicals',
      startingPrice: 'From ₹850',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk2FtwBERJ_TTJwbrAthxz9620LyZXIMDjkGBMV7X5kt-eb0NyrZAPUDcFPjIzoWwEytXNwgS8VRHtn0dU0xh5ia_l4hnTgrz3doLVGijxH5dbXSQwV8sCyjPof1m4m44KZj0bQqpKudr5dzPQpA0p-hPfWkGmcha3MsvC3WEPPrbPOTIx1K8crVcg49AIs_YvypRmVggECp6_ZiUO-yhKFgUG9rQt_diJrsoLvjHiDGpGaMb1lgDK5g'
    },
    {
      id: 'festive-decorations',
      title: 'Festive Decorations',
      tagline: 'Torans & Temple Bells',
      startingPrice: 'From ₹1,200',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdspAPlGKfXMiYx7Lvtg-z52kAEpZ5ZfPaVJaM71VrvueiXtwaJJ313dp9vy6MDkvvsXxALkDNlLwSuYgRXUCBMrHxS4JBxvop1mr_StimkFNosXue0XfY-kUFMvEW02nStLWX0HaBlGL6WjT4jSdodzLWhpp5cQ2AdcskUYq_egh3lQDojosjhD7c6OSd14fC_O5fTweO0QTxj0aaw1cs5rOZl34CwCXyfe-oO3-AtKQeVvQXhe05zw'
    },
    {
      id: 'home-accents',
      title: 'Home Accents',
      tagline: 'Marble & Cast Bowls',
      startingPrice: 'From ₹1,850',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3DGFEy8B2zMTON6udDz_eWbVAECfncX4vFcYHr9SMdmxmx616QUOdy2lNe7vJ5KyGea87MWnskRm7EL1CdSANcq3Aixuyv4BD4XHRUNOd7dxnIAvmkSunhii_7bnAR6BSSs2heFphQ9NCO3VDxMoaP5Cxj688TnzXL3AJS01Vu9gCioP2nIGh1hlEkYNbg2Qru8rVIYmkSWfoz7g8Q48iem3nkU1g7ix3HCo-vDJ-z5o6Ps1jLyxCPQ'
    },
    {
      id: 'table-decor',
      title: 'Table Décor',
      tagline: 'Kansa & Fine Linens',
      startingPrice: 'From ₹950',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFAjiQfxpGLeiZmRtQ6h96f-2Kuna2gFfqAJE9l193B4JIK8cJlD0yUVOL-dR4s1559H9JMzn3Tk7rLzSq6GoH1UMvNstozeZenjuNMLag1OnJnsHk1jzG82Vq1hy27cEiOv9Ye8KMTTTNCNceoBG9igh2vgffj1wx9xST9XXDGB5d6ZB3Kc7Kt0X2gdoXjNOqzhWOQi-QIQFxMy0AU13wKb1qA8jWt2AtnCfqFeXSDOm796O3mIkRdA'
    },
    {
      id: 'gifts-hampers',
      title: 'Gifts & Hampers',
      tagline: 'Curated Celebration Boxes',
      startingPrice: 'From ₹2,450',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhyhhRJCMWHb79vVn2gwI6frIBoDevxMgt98uk_youc0LQDZlt6EtAGHbAUfA1PeIxG7lv6F-kCSo8JzpyPHpElO297eh-ftkEbo5S2gMPD4KLm8wJ68LtWdCQ4NGjygfhD7i0hpFMJPUglwfNVEI9PK8g8IGcjAlFa3ES7WX1Sbj_bLTx83iWkbkXoiJ2NUnJK-lPvkGweT3hMWW_HTwyv1UpqKiOd3gVhPGSE9NxxsW-QZ9j91lHrg'
    }
  ];

  // Highlights filtered by tab
  const highlightProducts = products.filter(p => {
    if (highlightTab === 'urlis') return p.id.includes('urli') || p.highlightCategory === 'urlis';
    if (highlightTab === 'aromatics') return p.category === 'candles-fragrance' || p.highlightCategory === 'aromatics';
    if (highlightTab === 'pairs') return p.highlightCategory === 'pairs' || p.name.includes('Pair') || p.name.includes('Set');
    return p.featured;
  }).slice(0, 6);

  // Customer Favorites / Bestsellers
  const customerFavorites = products.filter(p => p.bestseller || p.rating >= 4.8).slice(0, 4);

  // Handpicked products for "Shop The Look" spotlight
  const spotlightProducts = products.slice(0, 2);

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('SAJAVAT10');
    setCouponCopied(true);
    showToast('Code SAJAVAT10 copied! 10% off at checkout.');
    setTimeout(() => setCouponCopied(false), 3000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    showToast('Welcome to Sajavat Circle! Check your inbox for your 10% gift code.');
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  const trustBadges = [
    { title: '100% Solid Brass', sub: 'Hand-cast Moradabad artisan brass', icon: 'workspace_premium' },
    { title: 'Botanical Fragrance', sub: 'Clean soy wax with natural temple oils', icon: 'spa' },
    { title: 'Complimentary Delivery', sub: 'Free Pan-India shipping over ₹2,999', icon: 'local_shipping' },
    { title: 'Dispatched in 24 Hours', sub: 'Triple-layer shockproof packing', icon: 'bolt' },
  ];

  return (
    <div className="flex flex-col w-full bg-[#FFF9F2]">
      {/* ─── 0. TOP PROMOTIONAL FLASH STRIP ─── */}
      <aside aria-label="Limited Festive Offer" className="w-full bg-[#700014] text-[#FFF9F2] px-4 py-2 border-b border-[#55000E]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs tracking-wider">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">celebration</span>
            <span>FESTIVE PREVIEW: Flat 10% Off on orders above ₹1,999</span>
          </span>
          <button
            type="button"
            onClick={handleCopyCoupon}
            className="inline-flex items-center gap-1.5 bg-[#FFF9F2]/10 hover:bg-[#FFF9F2]/20 border border-[#D4AF37]/50 px-2.5 py-0.5 rounded text-[11px] font-semibold text-[#F9E8B2] transition-colors btn-press cursor-pointer"
          >
            <span>{couponCopied ? 'COPIED!' : 'CODE: SAJAVAT10'}</span>
            <span className="material-symbols-outlined text-[13px]">{couponCopied ? 'done' : 'content_copy'}</span>
          </button>
        </div>
      </aside>

      {/* ─── 1. HERO SECTION (MODERN, HIGH-CONVERTING, PREMIUM) ─── */}
      <section className="relative w-full min-h-[520px] lg:min-h-[640px] flex items-center overflow-hidden bg-[#1A1A1A]">
        {/* Full-bleed Background Image with subtle float */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Warm ambient luxury Indian home with handcrafted brass diyas and botanical candles"
            className="w-full h-full object-cover object-center hero-float opacity-85"
            src={
              siteSettings?.heroImage ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBMdGqTs8sIYaCbwDopmf31fHBsgPr8c1G59yDq68RsY96FN2KBGJHFTh-_MjF-q-wbNJ6jd6GrcJb_C_MDLONDbcXFq2fq4UNXEWsYZzBy_3CqkmhoiXaktJlof8y-EYiHth2oLamIIvsjVlPoFnNr6TpAhkIzGEAYOLqFDhNkcphMGn6ck0k6x_omVH3wk1zbeoAEcRPRwrKTmn-lutDS3lpehMqn7UBPHmuwfO323OrViLB4dPOjgA"
            }
            fetchPriority="high"
            width="1920"
            height="640"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="max-w-xl text-white">
            {/* Elegant Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full mb-5 backdrop-blur-sm animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5C365] animate-pulse" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F9E8B2]">
                Artisanal Festive Edit 2025
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] mb-4 text-[#FFF9F2] tracking-tight">
              {siteSettings?.heroHeading || 'Handcrafted Luxury For'}{' '}
              <span className="italic font-light text-[#F9E8B2] block sm:inline">
                {siteSettings?.heroItalicWord || 'Every Celebration.'}
              </span>
            </h1>

            {/* 1-Line Subtitle */}
            <p className="text-sm sm:text-base text-[#FFF9F2]/80 leading-relaxed mb-6 max-w-lg font-light">
              {siteSettings?.heroSubtitle ||
                '100% solid virgin brass, cold-pressed botanical soy aromas, and heirloom celebration accents.'}
            </p>

            {/* 3 Quick E-Com Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] font-medium text-[#F3E6D5] mb-8">
              <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded border border-white/10">
                <span className="material-symbols-outlined text-[14px] text-[#D4AF37]">verified</span>
                Solid Brass
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded border border-white/10">
                <span className="material-symbols-outlined text-[14px] text-[#D4AF37]">local_shipping</span>
                Free Shipping &gt; ₹2,999
              </span>
              <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded border border-white/10">
                <span className="material-symbols-outlined text-[14px] text-[#D4AF37]">bolt</span>
                Dispatch in 24h
              </span>
            </div>

            {/* Dual High-Conversion CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => { onSelectCategory('all'); setCurrentView('shop'); }}
                className="inline-flex justify-center items-center gap-2 px-8 py-3.5 bg-[#800020] text-[#FFF9F2] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#9B0028] shadow-lg hover:shadow-xl transition-all duration-300 btn-press border border-[#D4AF37]/30"
              >
                <span>{siteSettings?.heroPrimaryBtnText || 'Shop All Products'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>

              <button
                type="button"
                onClick={() => { onSelectCategory('diyas-candle-holders'); setCurrentView('shop'); }}
                className="inline-flex justify-center items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-md text-[#FFF9F2] border border-white/30 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-white hover:text-[#800020] transition-all duration-300 btn-press"
              >
                <span>{siteSettings?.heroSecondaryBtnText || 'Explore Diyas & Urlis'}</span>
              </button>
            </div>

            {/* Social Proof Metric */}
            <div className="mt-8 pt-4 border-t border-white/15 flex items-center gap-3">
              <div className="flex text-[#D4AF37] text-sm">
                {'★★★★★'.split('').map((s, i) => (
                  <span key={i}>{s}</span>
                ))}
              </div>
              <span className="text-xs text-[#FFF9F2]/75 tracking-wide">
                <strong>4.9 / 5.0</strong> rating from over 18,500+ Indian homes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. VISUAL "SHOP BY CATEGORY" AVATAR BAR ─── */}
      <section className="w-full bg-[#FFF9F2] border-b border-[#E6D7C3] py-6" id="quick-categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#800020]">
              Shop By Category
            </span>
            <button
              type="button"
              onClick={() => { onSelectCategory('all'); setCurrentView('shop'); }}
              className="text-xs font-semibold text-[#800020] hover:underline uppercase tracking-wider flex items-center gap-1"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Horizontal circular category navigation */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
            {categoryTiles.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onSelectCategory(cat.id); setCurrentView('shop'); }}
                className="group flex flex-col items-center gap-2 shrink-0 cursor-pointer focus:outline-none"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#D4AF37]/40 group-hover:border-[#800020] group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <img
                    alt={cat.title}
                    src={cat.image}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    width="80"
                    height="80"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
                <span className="text-xs font-semibold text-[#332927] group-hover:text-[#800020] transition-colors text-center max-w-[90px] leading-tight">
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. TRUST & LOGISTICS STRIP ─── */}
      <section
        ref={trustRef as React.RefObject<HTMLElement>}
        className="w-full bg-[#F3E6D5]/40 border-b border-[#E6D7C3] py-5 reveal"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#800020]/10 flex items-center justify-center shrink-0 text-[#800020]">
                  <span className="material-symbols-outlined text-[20px]">{badge.icon}</span>
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#800020] uppercase tracking-wider">
                    {badge.title}
                  </span>
                  <span className="text-[11px] text-[#7A6B69] line-clamp-1">{badge.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. TRENDING & BESTSELLERS (TABBED E-COMMERCE GRID) ─── */}
      <section className="w-full py-14 bg-[#FFF9F2]" id="trending-products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div
            ref={highlightsTitleRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 reveal"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-1">
                Curated Bestsellers
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#800020]">
                Trending Across India
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Highlights' },
                { id: 'urlis', label: 'Brass Urlis' },
                { id: 'aromatics', label: 'Candles & Scents' },
                { id: 'pairs', label: 'Celebration Sets' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setHighlightTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    highlightTab === tab.id
                      ? 'bg-[#800020] text-[#FFF9F2] shadow-sm'
                      : 'bg-[#F3E6D5]/60 text-[#554745] hover:bg-[#F3E6D5]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6-Product Modern Grid */}
          <div ref={highlightsGridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
            {highlightProducts.map(p => (
              <div
                key={p.id}
                className="group flex flex-col bg-white rounded-sm border border-[#E6D7C3] card-lift overflow-hidden shadow-xs"
              >
                {/* Product Image Box */}
                <div className="relative w-full aspect-[4/5] bg-[#F3E6D5] overflow-hidden img-zoom">
                  <img
                    alt={p.name}
                    src={p.images.main}
                    loading="lazy"
                    decoding="async"
                    onClick={() => onSelectProduct(p)}
                    className="w-full h-full object-cover cursor-pointer"
                    width="400"
                    height="500"
                  />

                  {/* Discount / Bestseller Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="bg-[#800020] text-[#FFF9F2] text-[10px] font-bold px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-xs">
                        {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                      </span>
                    )}
                    {p.bestseller && (
                      <span className="bg-[#D4AF37] text-[#1A1A1A] text-[9px] font-bold px-1.5 py-0.5 rounded-xs tracking-wider uppercase shadow-xs">
                        BESTSELLER
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    aria-label="Save to Wishlist"
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#7A6B69] hover:text-[#800020] transition-colors shadow-xs btn-press"
                  >
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isWishlisted(p.id) ? 'text-[#D45060]' : ''
                      }`}
                      style={isWishlisted(p.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      favorite
                    </span>
                  </button>

                  {/* Quick Add Button (Desktop slide up + Mobile visible) */}
                  <div className="absolute inset-x-2 bottom-2 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-y-2 md:group-hover:translate-y-0">
                    <button
                      type="button"
                      onClick={() => addToCart(p, 1)}
                      className="w-full py-2 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-xs font-semibold uppercase tracking-wider shadow-md transition-colors btn-press flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">shopping_bag</span>
                      <span>Quick Add</span>
                    </button>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px] text-[#7A6B69] mb-1">
                    <span className="font-medium uppercase tracking-wider">{p.material}</span>
                    <span className="flex items-center text-[#D4AF37] font-bold text-xs">
                      ★ {p.rating.toFixed(1)} <span className="text-[#7A6B69] text-[10px] font-normal ml-0.5">({p.reviewsCount})</span>
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectProduct(p)}
                    className="font-serif text-sm sm:text-base text-[#332927] hover:text-[#800020] font-normal mb-2 line-clamp-1 cursor-pointer transition-colors"
                  >
                    {p.name}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-auto pt-1">
                    <span className="text-base font-bold text-[#800020]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    {p.originalPrice && (
                      <span className="text-xs text-[#7A6B69] line-through">
                        ₹{p.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Products CTA */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => { onSelectCategory('all'); setCurrentView('shop'); }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#800020] border-2 border-[#800020] text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#800020] hover:text-[#FFF9F2] shadow-sm transition-all duration-300 btn-press"
            >
              <span>Explore All Products</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 5. "SHOP THE LOOK" / STYLED ROOM SPOTLIGHT (E-COMMERCE FEATURE) ─── */}
      <section className="w-full py-16 bg-[#F3E6D5]/50 border-y border-[#E6D7C3]" id="shop-the-look">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={spotlightRef as React.RefObject<HTMLDivElement>}
            className="bg-white border border-[#E6D7C3] rounded-sm overflow-hidden shadow-sm reveal"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Left: Lifestyle ambient room image */}
              <div className="lg:col-span-7 relative min-h-[320px] lg:min-h-[460px] img-zoom">
                <img
                  alt="Atmospheric Festive Living Room Setup with Brass Urli and Botanical Candles"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtYA3A7Lqt0hkhmmHylodjUsCEv6IpJyno-XXYWC2Jl9X3PQM7F6nY8cmETlyEGLMIWKP7E24S0m1KldHuv9hGE6_v53EwPyLtWE7akgEMO75QpxN8p_DSnmMfcTIfDsHbttAlltDwwjuPu5KKY1FAAh4oW-eIWpSjwXv628dkhR5NiYKyc4FOWx8k-nysCXv9NVHO3OvyJJd_gbrWSbi7xsrZyIpJcNUkpGyY0CN6Nh3LzmwApXYHUQ"
                  width="800"
                  height="460"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-[#FFF9F2] text-[10px] uppercase tracking-[0.2em] font-semibold px-3 py-1 rounded backdrop-blur-xs">
                  ✦ Shop The Look
                </div>
              </div>

              {/* Right: Direct 1-Click Product Purchases */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#FFF9F2]">
                <div>
                  <span className="text-[11px] font-semibold text-[#800020] uppercase tracking-[0.25em] block mb-1">
                    Curated Styling
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#800020] mb-2">
                    The Grand Festive Foyer
                  </h3>
                  <p className="text-xs sm:text-sm text-[#554745] mb-6">
                    Hand-beaten brassware paired with pure Mysore botanical wax to create a divine welcome.
                  </p>

                  {/* Product Cards to add directly */}
                  <div className="space-y-3 mb-6">
                    {spotlightProducts.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-2.5 bg-white border border-[#E6D7C3] rounded shadow-xs"
                      >
                        <img
                          src={p.images.main}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded cursor-pointer"
                          onClick={() => onSelectProduct(p)}
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectProduct(p)}
                            className="font-serif text-xs sm:text-sm text-[#332927] hover:text-[#800020] truncate cursor-pointer"
                          >
                            {p.name}
                          </h4>
                          <span className="text-xs font-bold text-[#800020] block">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(p, 1)}
                          className="px-3 py-1.5 bg-[#800020] hover:bg-[#600018] text-white text-[11px] font-semibold uppercase tracking-wider rounded btn-press shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E6D7C3] flex items-center justify-between">
                  <span className="text-xs text-[#7A6B69]">Curated Festive Duo</span>
                  <button
                    type="button"
                    onClick={() => {
                      spotlightProducts.forEach(p => addToCart(p, 1));
                      showToast('Complete Festive Foyer Set added to your bag!');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#800020] hover:text-[#9B0028] btn-press"
                  >
                    <span>Add Set To Bag</span>
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. VISUAL CATEGORY SHOWCASE (CARDS WITH ZERO TEXT FLUFF) ─── */}
      <section className="w-full py-16 bg-[#FFF9F2]" ref={categoriesRef as React.RefObject<HTMLElement>}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-1">
              Explore The House of Sajavat
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#800020]">
              Collections of Distinction
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {categoryTiles.map(tile => (
              <div
                key={tile.id}
                onClick={() => { onSelectCategory(tile.id); setCurrentView('shop'); }}
                className="group relative aspect-[4/5] overflow-hidden rounded-sm border border-[#E6D7C3] cursor-pointer card-lift"
              >
                <img
                  alt={tile.title}
                  src={tile.image}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  width="480"
                  height="600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-0 bg-[#800020]/0 group-hover:bg-[#800020]/15 transition-colors duration-300" />

                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#F9E8B2] block mb-0.5">
                    {tile.startingPrice}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-[#F9E8B2] transition-colors mb-1">
                    {tile.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-white/90 group-hover:text-[#F9E8B2] transition-colors">
                    <span>Shop Now</span>
                    <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. SOCIAL PROOF / VERIFIED PATRON REVIEWS ─── */}
      <section className="w-full py-16 bg-[#F3E6D5]/40 border-y border-[#E6D7C3]" ref={reviewsRef as React.RefObject<HTMLElement>}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-lg mx-auto mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-1">
              Patron Reviews
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#800020]">
              Loved In Over 18,500+ Homes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Meera Sengupta',
                location: 'Mumbai',
                item: 'Mayura Brass Urli Set',
                review: 'The urli is astonishingly heavy and authentic. Floating fresh marigolds and candles inside made our entrance look like a palace sanctuary.',
                rating: 5
              },
              {
                name: 'Vikram & Ananya Singhal',
                location: 'Bengaluru',
                item: 'Kashi Temple Diya Pair',
                review: 'Unbelievable brass finish and weight. Arrived in pristine triple-layer packing within 48 hours. Truly heirloom quality.',
                rating: 5
              },
              {
                name: 'Priyanka Nambiar',
                location: 'New Delhi',
                item: 'Mysore Sandalwood Soy Candle',
                review: 'The scent throw is pure and peaceful without being cloying. Zero black smoke. Sajavat is our permanent festive store now.',
                rating: 5
              }
            ].map((rev, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-[#E6D7C3] rounded shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-[#D4AF37] text-sm">
                      {'★★★★★'.split('').map((s, i) => (
                        <span key={i}>{s}</span>
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2D7A2D] bg-green-50 px-2 py-0.5 rounded">
                      ✓ Verified Buyer
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#332927] leading-relaxed mb-4 italic">
                    "{rev.review}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3E6D5] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#800020] block">{rev.name}</span>
                    <span className="text-[11px] text-[#7A6B69]">{rev.location}</span>
                  </div>
                  <span className="text-[10px] text-[#7A6B69] max-w-[120px] text-right truncate">
                    {rev.item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. INSTAGRAM / #SAJAVATHOME COMMUNITY GALLERY ─── */}
      <section className="w-full py-14 bg-[#FFF9F2]" ref={galleryRef as React.RefObject<HTMLElement>}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-1">
                Community Spaces
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#800020]">
                Styled By You: #SajavatHome
              </h2>
            </div>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold uppercase tracking-wider text-[#800020] hover:text-[#9B0028] mt-2 sm:mt-0 inline-flex items-center gap-1"
            >
              <span>Follow @sajavatdecor</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwqaCtGR5f2YGRZ0vFu29AI8sdvNknypepJqIDvsmW6kFGrXZ77COgEPFQgapONq6KWf5zNIubYRDzCOEhen7aOVw47TjjSJdtE77ugBGQcWbEYr11c4AUK5UJbt-ywkbYBCWgPnlIm42QPJ8yFRNbFeiQxinvll3eh5CmSTTptDuD08RzhCSn2NLKItYjsFaTox2O4fRFOn4I4Kqg5lPlTLaB0dBHhU2Z5U0nEW9yBMsu2ORspEQcZg',
                caption: 'Living room prayer corner with Mayura Urli'
              },
              {
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk2FtwBERJ_TTJwbrAthxz9620LyZXIMDjkGBMV7X5kt-eb0NyrZAPUDcFPjIzoWwEytXNwgS8VRHtn0dU0xh5ia_l4hnTgrz3doLVGijxH5dbXSQwV8sCyjPof1m4m44KZj0bQqpKudr5dzPQpA0p-hPfWkGmcha3MsvC3WEPPrbPOTIx1K8crVcg49AIs_YvypRmVggECp6_ZiUO-yhKFgUG9rQt_diJrsoLvjHiDGpGaMb1lgDK5g',
                caption: 'Evening dining table candle setup'
              },
              {
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9UcSEuD48Y9w9lGq08c-I-a6dgIwcuLt6r6BBBknJxL6XqsF9KQ3O8ehPK4jEegBJFIvjEdbALqWr1ixK2s8hE6poicjWiqiyr2micZPTtSDrw_NK1HURWCDggR9eV0wmAguWqiCddcHEmhfMWUs1YptB-W5_D4uFohtHNErUxdC4KCip5KZ2u5ehlyDrMY7xr-FUkM8Uy_KHZ3p9Q3YWyK1w-V44ovBiEhTieK4hwoCw3bEP7OyW1Q',
                caption: 'Temple altar with Kashi brass diya pair'
              },
              {
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhyhhRJCMWHb79vVn2gwI6frIBoDevxMgt98uk_youc0LQDZlt6EtAGHbAUfA1PeIxG7lv6F-kCSo8JzpyPHpElO297eh-ftkEbo5S2gMPD4KLm8wJ68LtWdCQ4NGjygfhD7i0hpFMJPUglwfNVEI9PK8g8IGcjAlFa3ES7WX1Sbj_bLTx83iWkbkXoiJ2NUnJK-lPvkGweT3hMWW_HTwyv1UpqKiOd3gVhPGSE9NxxsW-QZ9j91lHrg',
                caption: 'Signature wedding celebration gift trunk'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-sm border border-[#E6D7C3] img-zoom cursor-pointer"
                onClick={() => { onSelectCategory('all'); setCurrentView('shop'); }}
              >
                <img
                  src={item.img}
                  alt={item.caption}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    <span>Shop Look</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. HIGH-CONVERSION VIP NEWSLETTER STRIP ─── */}
      <section className="w-full py-16 bg-[#700014] text-[#FFF9F2] border-t border-[#55000E]" ref={newsletterRef as React.RefObject<HTMLElement>}>
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center reveal">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#D4AF37] block mb-1">
            ✦ The Sajavat Circle
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal mb-2">
            Unlock 10% Off Your First Order
          </h2>
          <p className="text-xs sm:text-sm text-[#FFF9F2]/80 leading-relaxed mb-6">
            Join 24,000+ patrons receiving private festive previews and member privileges.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-3">
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/30 text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37] focus:bg-white/15 rounded-xs transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D4AF37] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-[#E5C365] transition-colors whitespace-nowrap shadow-sm btn-press rounded-xs"
            >
              Get 10% Off
            </button>
          </form>

          {newsletterSubscribed && (
            <div className="text-xs text-[#F9E8B2] font-semibold py-1.5 px-3 bg-white/10 inline-block mb-3 rounded animate-fadeIn">
              ✓ Welcome! Coupon code SAJAVAT10 has been activated for your account.
            </div>
          )}

          <p className="text-[11px] text-[#FFF9F2]/60">
            Instant discount code sent via email. No spam, ever.
          </p>
        </div>
      </section>
    </div>
  );
};
