import React from 'react';
import { SajavatLogo } from '../components/SajavatLogo';

interface AboutPageProps {
  setCurrentView: (view: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  setCurrentView,
  onSelectCategory,
}) => {
  return (
    <div className="min-h-screen bg-[#FFF9F2] pt-8 pb-24">
      {/* Brand Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-16">
        <div className="mb-6 flex justify-center">
          <SajavatLogo variant="badge" size="lg" showTagline={true} />
        </div>
        <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-3 block">
          Our Atelier &amp; Lineage
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#332927] mb-6 leading-tight">
          Decore For Every Celebration, Handcrafted for Generations
        </h1>
        <p className="text-[#6E615D] text-lg sm:text-xl font-serif italic max-w-2xl mx-auto leading-relaxed">
          &ldquo;We believe a home during festivities should smell of pure sandalwood, glow with living candlelight on beaten brass, and welcome guests with timeless warmth.&rdquo;
        </p>
      </div>

      {/* Main Story Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Story Section 1: The Founders & Moradabad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white rounded-3xl border border-[#F2E8DC] p-8 sm:p-12 shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#800020] mb-2 block">
              Chapter I • The Forgotten Foundry
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-4">
              Restoring Honor to Indian Bell-Metal Craft
            </h2>
            <p className="text-sm text-[#6E615D] leading-relaxed mb-4">
              Sajavat was founded with a singular conviction: to bridge India's master metalcraft guilds directly to contemporary homes. In an era dominated by hollow pressed metals and toxic gold paint, we returned to 400-year-old foundries in Moradabad and Kumbakonam.
            </p>
            <p className="text-sm text-[#6E615D] leading-relaxed">
              Every urli, thali, and diya bearing our stamp is cast from heavy virgin brass, chiseled by hand by artisans whose families have practiced the art for five generations, and finished with organic tamarind polishing.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#F2E8DC] shadow-sm aspect-square bg-[#FFF9F2]">
            <img
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80"
              alt="Master craftsman chiseling virgin bell-metal brass in Moradabad atelier"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Story Section 2: Pure Botanicals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white rounded-3xl border border-[#F2E8DC] p-8 sm:p-12 shadow-sm">
          <div className="order-2 md:order-1 rounded-2xl overflow-hidden border border-[#F2E8DC] shadow-sm aspect-square bg-[#FFF9F2]">
            <img
              src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=80"
              alt="Hand-pouring pure botanical soy wax infused with Mysore sandalwood and Kashmiri saffron"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#800020] mb-2 block">
              Chapter II • Pure Air & Flame
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-4">
              Zero Paraffin. Zero Lead. True Botanicals.
            </h2>
            <p className="text-sm text-[#6E615D] leading-relaxed mb-4">
              Festive evenings should purify the sanctuary, not pollute it. We refuse petroleum-derived paraffin and synthetic fixatives.
            </p>
            <p className="text-sm text-[#6E615D] leading-relaxed">
              Our candles are slow-poured in micro-batches using 100% farm-sourced cold-pressed soy wax, unbleached Egyptian cotton wicks, and steam-distilled essential oils from Mysore sandalwood, Kannauj damask rose, and Kashmiri saffron.
            </p>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#FFF5E6] border border-[#D4AF37] flex items-center justify-center text-2xl mx-auto mb-4">
              ✨
            </div>
            <h3 className="font-serif text-lg text-[#332927] mb-2">100% Virgin Brass</h3>
            <p className="text-xs text-[#6E615D] leading-relaxed">
              Never adulterated with scrap zinc or sheet metals. Heavyweight, heirloom-grade materials that appreciate in sentiment over decades.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#FFF5E6] border border-[#D4AF37] flex items-center justify-center text-2xl mx-auto mb-4">
              🤝
            </div>
            <h3 className="font-serif text-lg text-[#332927] mb-2">Fair Trade Guilds</h3>
            <p className="text-xs text-[#6E615D] leading-relaxed">
              We pay 2.5× above market rates directly to 120+ artisans, funding apprentice workshops to keep indigenous metalcraft alive.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#FFF5E6] border border-[#D4AF37] flex items-center justify-center text-2xl mx-auto mb-4">
              📦
            </div>
            <h3 className="font-serif text-lg text-[#332927] mb-2">Zero-Breakage Guarantee</h3>
            <p className="text-xs text-[#6E615D] leading-relaxed">
              Each piece travels in custom triple-wall corrugated cushioning with soft velvet protection, insured against all transit damage.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-[#800020] to-[#500014] rounded-3xl p-10 sm:p-14 text-center text-white shadow-xl">
          <h2 className="font-serif text-3xl sm:text-4xl mb-4">
            Bring the Warmth of Sajavat into Your Home
          </h2>
          <p className="text-stone-200 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Discover our festive catalogue of hand-chiseled urlis, sacred puja diyas, and ceremonial gift hampers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory('all');
                setCurrentView('shop');
              }}
              className="px-8 py-3.5 bg-[#D4AF37] text-[#332927] rounded-full font-semibold text-xs tracking-wider uppercase hover:bg-[#E5C158] transition-all shadow-md"
            >
              Explore Festive Collections
            </button>
            <button
              onClick={() => setCurrentView('journal')}
              className="px-8 py-3.5 bg-transparent border border-white/40 text-white rounded-full font-semibold text-xs tracking-wider uppercase hover:bg-white/10 transition-all"
            >
              Read The Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
