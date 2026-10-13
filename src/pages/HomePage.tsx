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

  // Scroll reveal refs
  const trustRef = useScrollReveal();
  const categoryTitleRef = useScrollReveal<HTMLDivElement>();
  const categoryGridRef = useScrollRevealAll();
  const highlightsTitleRef = useScrollReveal<HTMLDivElement>();
  const highlightsGridRef = useScrollRevealAll();
  const editorialRef = useScrollReveal<HTMLDivElement>();
  const bestsellersRef = useScrollReveal<HTMLDivElement>();
  const bestsellersGridRef = useScrollRevealAll();
  const journalTitleRef = useScrollReveal<HTMLDivElement>();
  const journalGridRef = useScrollRevealAll();
  const newsletterRef = useScrollReveal<HTMLDivElement>();

  // 6 Category Grid items
  const categoryTiles = [
    {
      id: 'diyas-candle-holders',
      number: '01 / Brass & Metalcraft',
      title: 'Diyas & Candle Holders',
      subtitle: 'Carved urlis, floating lamps & candelabras',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzolsPoVtK5H-tHMBNVIZaSIUJCYumpMSgJ7znM3PqoZ1D26Su-yZ1fGlyOvG_BH8Fzczlv37DWTO0CBv2PkBt94ZTEZ6ychoOqVyPBh9rQbXMy5alC5i_SmfY21LXf6BMIR9zxuBkrPuAPJcmRMliRtc69YbbSoxVAQDGm-oXsoJEcE5J25BQl72mXe0WomisaGWav5mxiV-E_3mofXmk9liC-Ao14tlGb__uHKbyvGDdtAh4e7RXsA'
    },
    {
      id: 'candles-fragrance',
      number: '02 / Pure Aromatics',
      title: 'Candles & Fragrance',
      subtitle: 'Sandalwood, sacred jasmine & botanical wax',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk2FtwBERJ_TTJwbrAthxz9620LyZXIMDjkGBMV7X5kt-eb0NyrZAPUDcFPjIzoWwEytXNwgS8VRHtn0dU0xh5ia_l4hnTgrz3doLVGijxH5dbXSQwV8sCyjPof1m4m44KZj0bQqpKudr5dzPQpA0p-hPfWkGmcha3MsvC3WEPPrbPOTIx1K8crVcg49AIs_YvypRmVggECp6_ZiUO-yhKFgUG9rQt_diJrsoLvjHiDGpGaMb1lgDK5g'
    },
    {
      id: 'festive-decorations',
      number: '03 / Ritual Accents',
      title: 'Festive Decorations',
      subtitle: 'Hand-beaten brass torans & ritual bells',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdspAPlGKfXMiYx7Lvtg-z52kAEpZ5ZfPaVJaM71VrvueiXtwaJJ313dp9vy6MDkvvsXxALkDNlLwSuYgRXUCBMrHxS4JBxvop1mr_StimkFNosXue0XfY-kUFMvEW02nStLWX0HaBlGL6WjT4jSdodzLWhpp5cQ2AdcskUYq_egh3lQDojosjhD7c6OSd14fC_O5fTweO0QTxj0aaw1cs5rOZl34CwCXyfe-oO3-AtKQeVvQXhe05zw'
    },
    {
      id: 'home-accents',
      number: '04 / Sculptural Living',
      title: 'Home Accents',
      subtitle: 'Marble inlay platters & lattice lanterns',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3DGFEy8B2zMTON6udDz_eWbVAECfncX4vFcYHr9SMdmxmx616QUOdy2lNe7vJ5KyGea87MWnskRm7EL1CdSANcq3Aixuyv4BD4XHRUNOd7dxnIAvmkSunhii_7bnAR6BSSs2heFphQ9NCO3VDxMoaP5Cxj688TnzXL3AJS01Vu9gCioP2nIGh1hlEkYNbg2Qru8rVIYmkSWfoz7g8Q48iem3nkU1g7ix3HCo-vDJ-z5o6Ps1jLyxCPQ'
    },
    {
      id: 'table-decor',
      number: '05 / The Dining Table',
      title: 'Table Décor',
      subtitle: 'Block-printed linens & cast brass rings',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFAjiQfxpGLeiZmRtQ6h96f-2Kuna2gFfqAJE9l193B4JIK8cJlD0yUVOL-dR4s1559H9JMzn3Tk7rLzSq6GoH1UMvNstozeZenjuNMLag1OnJnsHk1jzG82Vq1hy27cEiOv9Ye8KMTTTNCNceoBG9igh2vgffj1wx9xST9XXDGB5d6ZB3Kc7Kt0X2gdoXjNOqzhWOQi-QIQFxMy0AU13wKb1qA8jWt2AtnCfqFeXSDOm796O3mIkRdA'
    },
    {
      id: 'gifts-hampers',
      number: '06 / Curated Gifting',
      title: 'Gifts & Hampers',
      subtitle: 'Signature celebratory boxes in deep wine',
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

  // Customer Favorites
  const customerFavorites = products.filter(p => p.bestseller).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    showToast('Subscribed! Check your inbox for your 10% welcome invitation.');
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  const trustBadges = [
    { title: 'Pure Brass & Metalcraft', sub: 'Unlacquered hand-hammered heirloom finishes', icon: 'workspace_premium' },
    { title: 'Botanical Fragrances', sub: 'Pure soy wax infused with temple oils', icon: 'spa' },
    { title: 'Mindful Gifting', sub: 'Bespoke handmade archival gift boxes', icon: 'redeem' },
    { title: 'Safe Pan-India Shipping', sub: 'Insured shockproof courier packing', icon: 'local_shipping' },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ─── 1. HERO SECTION ─── */}
      <section className="relative w-full min-h-[580px] lg:min-h-[700px] flex items-center overflow-hidden bg-[#F3E6D5]/40">
        {/* Full-bleed Background with subtle float animation */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Warm ambient festive Indian living room with glowing diyas and candles"
            className="w-full h-full object-cover object-center hero-float"
            src={
              siteSettings?.heroImage ||
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBMdGqTs8sIYaCbwDopmf31fHBsgPr8c1G59yDq68RsY96FN2KBGJHFTh-_MjF-q-wbNJ6jd6GrcJb_C_MDLONDbcXFq2fq4UNXEWsYZzBy_3CqkmhoiXaktJlof8y-EYiHth2oLamIIvsjVlPoFnNr6TpAhkIzGEAYOLqFDhNkcphMGn6ck0k6x_omVH3wk1zbeoAEcRPRwrKTmn-lutDS3lpehMqn7UBPHmuwfO323OrViLB4dPOjgA"
            }
            // Hero is above-the-fold — do NOT lazy load
            width="1920"
            height="700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9F2] via-[#FFF9F2]/85 to-transparent lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FFF9F2] via-transparent to-black/5" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              <span className="w-8 h-[1px] bg-[#800020]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020]">
                Artisanal Festive Living
              </span>
            </div>

            <h1
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#800020] font-normal leading-[1.1] mb-6 animate-fadeInUp"
              style={{ animationDelay: '200ms' }}
            >
              {siteSettings?.heroHeading || 'Make Every Moment'}{' '}
              <span className="italic font-light block sm:inline">
                {siteSettings?.heroItalicWord || 'Beautiful.'}
              </span>
            </h1>

            <p
              className="text-base sm:text-lg text-[#554745] leading-relaxed mb-8 max-w-lg animate-fadeInUp"
              style={{ animationDelay: '320ms' }}
            >
              {siteSettings?.heroSubtitle ||
                "Thoughtfully chosen décor for celebrations, meaningful moments, and everyday living. Handcrafted with reverence for India's richest artisan traditions."}

            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fadeInUp" style={{ animationDelay: '440ms' }}>
              <button
                type="button"
                onClick={() => { onSelectCategory('all'); setCurrentView('shop'); }}
                className="inline-flex justify-center items-center px-8 py-3.5 bg-[#800020] text-[#FFF9F2] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#600018] shadow-md hover:shadow-lg transition-all duration-300 btn-press"
              >
                {siteSettings?.heroPrimaryBtnText || 'Shop the Collection'}
              </button>

              <button
                type="button"
                onClick={() => { onSelectCategory('diyas-candle-holders'); setCurrentView('shop'); }}
                className="inline-flex justify-center items-center px-8 py-3.5 bg-transparent text-[#800020] border border-[#800020]/60 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#800020] hover:text-[#FFF9F2] transition-all duration-300 btn-press"
              >
                {siteSettings?.heroSecondaryBtnText || 'Explore Festive Décor'}
              </button>
            </div>

            <div
              className="mt-10 pt-4 border-t border-[#F3E6D5] flex items-center gap-3 animate-fadeInUp"
              style={{ animationDelay: '560ms' }}
            >
              <span className="text-xs text-[#7A6B69] tracking-wide">
                {siteSettings?.heroAudienceNote || (
                  <>
                    Loved by over <strong className="text-[#800020] font-semibold">18,500+ homes</strong> across India &amp; abroad.
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. TRUST / CRAFT ATTRIBUTES STRIP ─── */}
      <section
        ref={trustRef as React.RefObject<HTMLElement>}
        className="w-full bg-[#FFF9F2] border-b border-[#F3E6D5] py-7 reveal"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 stagger-children">
            {trustBadges.map((badge, idx) => (
              <div key={idx} className="flex items-start gap-3 reveal" style={{ transitionDelay: `${idx * 80}ms` }}>
                <span className="material-symbols-outlined text-[20px] text-[#800020] mt-0.5 shrink-0">
                  {badge.icon}
                </span>
                <div className="flex flex-col space-y-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#800020]">
                    {badge.title}
                  </span>
                  <span className="text-xs text-[#7A6B69]">{badge.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. CATEGORY GRID ─── */}
      <section className="w-full py-20 bg-[#FFF9F2]" id="curated-categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={categoryTitleRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-2">
                Categories of Distinction
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#800020]">Curated for Celebration</h2>
            </div>
            <p className="text-sm text-[#7A6B69] max-w-md mt-3 md:mt-0 leading-relaxed">
              Explore our artisanal collections designed to elevate prayer rituals, family feasts, and serene quietude.
            </p>
          </div>

          <div ref={categoryGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {categoryTiles.map(tile => (
              <div
                key={tile.id}
                onClick={() => { onSelectCategory(tile.id); setCurrentView('shop'); }}
                className="group relative bg-[#FFF9F2] overflow-hidden rounded-sm flex flex-col border border-[#F3E6D5]/80 card-lift cursor-pointer reveal"
              >
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#F3E6D5] img-zoom">
                  <img
                    alt={tile.title}
                    src={tile.image}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    width="480"
                    height="600"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  {/* Hover overlay accent */}
                  <div className="absolute inset-0 bg-[#800020]/0 group-hover:bg-[#800020]/10 transition-colors duration-500" />
                  <div className="absolute bottom-0 inset-x-0 p-6 text-[#FFF9F2]">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-[#F3E6D5]/80 block mb-1">
                      {tile.number}
                    </span>
                    <h3 className="font-serif text-2xl text-white mb-2 group-hover:text-[#F9E8B2] transition-colors duration-300">
                      {tile.title}
                    </h3>
                    <p className="text-xs text-[#FFF9F2]/80 mb-3 line-clamp-1">{tile.subtitle}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.15em] text-[#FFF9F2] group-hover:text-[#F9E8B2] transition-colors">
                      Explore
                      <span className="material-symbols-outlined text-[14px] transition-transform duration-300 group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. FESTIVE HIGHLIGHTS (FEATURED PRODUCTS) ─── */}
      <section className="w-full py-20 bg-[#F3E6D5]/35 border-y border-[#F3E6D5]" id="featured-collection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={highlightsTitleRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col md:flex-row md:items-end justify-between mb-10 reveal"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-2">
                Handmade Treasures
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#800020]">Festive Highlights</h2>
            </div>
            <div className="flex items-center space-x-5 mt-4 md:mt-0 text-xs font-medium uppercase tracking-[0.15em] text-[#7A6B69] overflow-x-auto pb-1">
              {(['all', 'urlis', 'aromatics', 'pairs'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setHighlightTab(tab)}
                  className={`pb-1 whitespace-nowrap transition-all duration-200 ${
                    highlightTab === tab
                      ? 'text-[#800020] border-b-2 border-[#800020] font-semibold'
                      : 'hover:text-[#800020]'
                  }`}
                >
                  {tab === 'all' ? 'All Highlights' : tab === 'urlis' ? 'Brass Urlis' : tab === 'aromatics' ? 'Aromatics' : 'Ritual Pairs'}
                </button>
              ))}
            </div>
          </div>

          {/* 6-Product Grid */}
          <div ref={highlightsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {highlightProducts.map(p => (
              <div
                key={p.id}
                className="group flex flex-col bg-[#FFF9F2] p-3 rounded-sm border border-[#F3E6D5] card-lift reveal"
              >
                <div className="relative w-full aspect-[4/5] bg-[#F3E6D5] overflow-hidden mb-4 img-zoom">
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
                  {/* Wishlist button */}
                  <button
                    type="button"
                    aria-label="Save to Wishlist"
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#FFF9F2]/90 flex items-center justify-center text-[#7A6B69] hover:text-[#800020] hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md btn-press"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] transition-all duration-200 ${
                        isWishlisted(p.id) ? 'text-[#D45060]' : ''
                      }`}
                      style={isWishlisted(p.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      favorite
                    </span>
                  </button>
                  {/* Quick-Add CTA */}
                  <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                      type="button"
                      onClick={() => addToCart(p, 1)}
                      className="w-full py-2.5 bg-[#800020] text-[#FFF9F2] text-xs font-semibold uppercase tracking-wider hover:bg-[#600018] shadow-md transition-colors btn-press"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

                <div className="flex flex-col px-1">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#7A6B69] mb-1">
                    {p.material} • {p.craftHeritage.split(' ')[0]}
                  </span>
                  <h3
                    onClick={() => onSelectProduct(p)}
                    className="font-serif text-lg text-[#800020] mb-1 cursor-pointer hover:underline underline-offset-2"
                  >
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#332927]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </p>
                    {p.originalPrice && (
                      <span className="text-xs text-[#7A6B69] line-through">
                        ₹{p.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {p.originalPrice && (
                      <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                        {Math.round((1 - p.price / p.originalPrice) * 100)}% off
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All CTA */}
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => { onSelectCategory('all'); setCurrentView('shop'); }}
              className="inline-flex items-center gap-2 px-8 py-3 border border-[#800020]/50 text-[#800020] text-xs font-semibold uppercase tracking-[0.15em] hover:bg-[#800020] hover:text-white transition-all duration-300 btn-press"
            >
              View All Products
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 5. EDITORIAL FEATURE / SEASONAL CURATION BANNER ─── */}
      <section className="w-full py-16 bg-[#FFF9F2]" id="seasonal-curation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={editorialRef as React.RefObject<HTMLDivElement>}
            className="bg-[#F3E6D5]/60 border border-[#F3E6D5] rounded-sm overflow-hidden reveal"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[460px]">
              <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-full img-zoom">
                <img
                  alt="Festive Sanctuary: Diwali & Celebration Edit"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtYA3A7Lqt0hkhmmHylodjUsCEv6IpJyno-XXYWC2Jl9X3PQM7F6nY8cmETlyEGLMIWKP7E24S0m1KldHuv9hGE6_v53EwPyLtWE7akgEMO75QpxN8p_DSnmMfcTIfDsHbttAlltDwwjuPu5KKY1FAAh4oW-eIWpSjwXv628dkhR5NiYKyc4FOWx8k-nysCXv9NVHO3OvyJJd_gbrWSbi7xsrZyIpJcNUkpGyY0CN6Nh3LzmwApXYHUQ"
                  width="800"
                  height="460"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#F3E6D5]/70" />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                <span className="text-[11px] font-semibold text-[#800020] tracking-[0.25em] uppercase mb-3">
                  Festive & Wedding 2024
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#800020] leading-tight mb-4">
                  The Festive Sanctuary:{' '}
                  <span className="italic font-light block">Diwali &amp; Celebration Edit</span>
                </h2>
                <p className="text-sm sm:text-base text-[#554745] leading-relaxed mb-8">
                  A bespoke curation of heirloom pooja accents, warm metallic tablewares, and hand-blended scents designed to transform celebration hosting into an art form.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => { onSelectCategory('diyas-candle-holders'); setCurrentView('shop'); }}
                    className="inline-flex items-center justify-center px-8 py-3.5 bg-[#800020] text-[#FFF9F2] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#600018] shadow-sm hover:shadow-md transition-all duration-300 btn-press"
                  >
                    Discover the Edit
                    <span className="material-symbols-outlined text-[16px] ml-2">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. CUSTOMER FAVORITES / BESTSELLERS ─── */}
      <section className="w-full py-20 bg-[#F3E6D5]/35 border-y border-[#F3E6D5]" id="bestsellers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={bestsellersRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 reveal"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-2">
                Evergreen Favorites
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#800020]">Customer Favorites</h2>
            </div>
            <button
              type="button"
              onClick={() => { onSelectCategory('all'); setCurrentView('shop'); }}
              className="text-xs font-semibold uppercase tracking-[0.15em] text-[#800020] hover:text-[#D45060] mt-3 sm:mt-0 inline-flex items-center gap-1 transition-colors btn-press"
            >
              View All
              <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>

          <div ref={bestsellersGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {customerFavorites.map(p => (
              <div
                key={p.id}
                className="group flex flex-col bg-[#FFF9F2] p-2 sm:p-3 rounded-sm border border-[#F3E6D5] card-lift reveal"
              >
                <div className="relative w-full aspect-[4/5] bg-[#F3E6D5] overflow-hidden mb-3 img-zoom">
                  <img
                    alt={p.name}
                    src={p.images.main}
                    loading="lazy"
                    decoding="async"
                    onClick={() => onSelectProduct(p)}
                    className="w-full h-full object-cover cursor-pointer"
                    width="300"
                    height="375"
                  />
                  {p.bestseller && (
                    <span className="absolute top-2 left-2 bg-[#800020] text-[#FFF9F2] text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold">
                      Bestseller
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => addToCart(p, 1)}
                    className="absolute bottom-2 inset-x-2 py-2 bg-[#FFF9F2] text-[#800020] border border-[#800020]/20 opacity-0 group-hover:opacity-100 text-xs font-medium uppercase tracking-wider hover:bg-[#800020] hover:text-white transition-all duration-300 translate-y-1 group-hover:translate-y-0 btn-press"
                  >
                    Add to Bag
                  </button>
                </div>
                <div className="flex flex-col px-0.5">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#7A6B69] mb-1">
                    {p.material}
                  </span>
                  <h3
                    onClick={() => onSelectProduct(p)}
                    className="font-serif text-sm sm:text-base text-[#800020] mb-1 line-clamp-1 cursor-pointer hover:underline underline-offset-2"
                  >
                    {p.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#332927]">
                    ₹{p.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. THE SAJAVAT JOURNAL PREVIEW ─── */}
      <section className="w-full py-20 bg-[#FFF9F2]" id="journal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={journalTitleRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal"
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-2">
                Editorial &amp; Notes
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#800020]">The Sajavat Journal</h2>
            </div>
            <p className="text-sm text-[#7A6B69] max-w-sm mt-3 md:mt-0 leading-relaxed">
              Reflections on ritual, seasonal entertaining, and the subtle art of atmospheric living.
            </p>
          </div>

          <div ref={journalGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {journalArticles.slice(0, 3).map(article => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="flex flex-col group cursor-pointer reveal"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden mb-4 bg-[#F3E6D5] rounded-sm img-zoom">
                  <img
                    alt={article.title}
                    src={article.image}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    width="600"
                    height="375"
                  />
                  {/* Reading time badge */}
                  <span className="absolute top-3 right-3 bg-[#FFF9F2]/90 text-[#800020] text-[10px] font-semibold px-2 py-1 tracking-wider uppercase">
                    {article.readTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-[#7A6B69] tracking-wider uppercase mb-2">
                  <span className="text-[#800020] font-semibold">{article.categoryLabel}</span>
                </div>
                <h3 className="font-serif text-xl text-[#332927] group-hover:text-[#800020] transition-colors duration-300 leading-snug mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-[#554745] line-clamp-2 mb-4 leading-relaxed">
                  {article.leadExcerpt}
                </p>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#800020] group-hover:text-[#D45060] inline-flex items-center gap-1 transition-colors mt-auto">
                  Read Essay
                  <span className="material-symbols-outlined text-[14px] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </span>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setCurrentView('journal')}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#800020] hover:text-[#D45060] transition-colors btn-press underline-draw"
            >
              View All Essays
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 8. NEWSLETTER CORRESPONDENCE ─── */}
      <section className="w-full py-20 bg-[#800020] border-t border-[#600018]">
        <div
          ref={newsletterRef as React.RefObject<HTMLDivElement>}
          className="max-w-2xl mx-auto px-4 sm:px-6 text-center reveal"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F3E6D5] block mb-2">
            Correspondence
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#FFF9F2] font-normal mb-3">
            A Little Inspiration, <span className="italic font-light">Delivered</span>
          </h2>
          <p className="text-sm sm:text-base text-[#FFF9F2]/80 leading-relaxed mb-8 max-w-lg mx-auto">
            Receive intimate festive essays, seasonal atelier releases, and invitations to private styling previews.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-4">
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 bg-[#FFF9F2]/10 border border-[#FFF9F2]/30 text-sm text-white placeholder:text-[#FFF9F2]/50 focus:outline-none focus:border-[#F3E6D5] focus:bg-[#FFF9F2]/15 rounded-none transition-colors"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-[#F3E6D5] text-[#800020] text-xs font-semibold uppercase tracking-wider hover:bg-white transition-colors whitespace-nowrap shadow-sm btn-press"
            >
              Subscribe
            </button>
          </form>

          {newsletterSubscribed && (
            <div className="text-xs text-[#F9E8B2] font-medium py-1.5 px-3 bg-[#FFF9F2]/10 inline-block mb-3 rounded animate-fadeIn">
              ✓ Thank you for joining our circle. A welcome note with 10% coupon is on its way.
            </div>
          )}

          <p className="text-xs text-[#FFF9F2]/60">
            We respect your calm. No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
};
