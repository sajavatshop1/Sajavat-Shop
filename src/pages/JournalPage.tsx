import React, { useState, useEffect, useMemo } from 'react';
import { JournalArticle, Product } from '../types';
import { useCart } from '../context/CartContext';

interface JournalPageProps {
  articles: JournalArticle[];
  selectedArticle?: JournalArticle;
  onSelectArticle: (article: JournalArticle | undefined) => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  setCurrentView: (view: string) => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({
  articles,
  selectedArticle,
  onSelectArticle,
  products,
  onSelectProduct,
  setCurrentView
}) => {
  const { addToCart, showToast } = useCart();

  // Navigation & Filtering State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Article Reading Experience State
  const [fontSize, setFontSize] = useState<'standard' | 'large'>('standard');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'helpful' | 'unhelpful' | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Active essay currently viewed (controlled by prop, fallback to first article if not set or user clicked)
  const currentArticle = selectedArticle || null;

  // Track scroll depth for reading progress indicator and active TOC section
  useEffect(() => {
    if (!currentArticle) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(currentProgress);
      }

      // Check which section is in viewport
      if (currentArticle.sections && currentArticle.sections.length > 0) {
        for (const section of currentArticle.sections) {
          const el = document.getElementById(section.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 200 && rect.bottom >= 100) {
              setActiveSectionId(section.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentArticle]);

  // Categories list
  const categories = [
    { id: 'all', label: 'All Essays' },
    { id: 'festive-styling', label: 'Festive Styling' },
    { id: 'living-ambience', label: 'Living & Ambience' },
    { id: 'artisan-notes', label: 'Artisan Heritage & Care' },
    { id: 'table-decor', label: 'Table Décor' },
    { id: 'gifting', label: 'Conscious Gifting' }
  ];

  // Popular high-intent topic tags
  const popularTags = [
    '#BrassUrli',
    '#VastuShastra',
    '#BrassCare',
    '#DiwaliDecor',
    '#CleanCandles',
    '#TableStyling',
    '#PitambariGuide',
    '#MoradabadCraft'
  ];

  // Filtered essays for index list
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      const matchesTag = !selectedTag || (art.tags && art.tags.includes(selectedTag));
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.leadExcerpt.toLowerCase().includes(q) ||
        art.author.toLowerCase().includes(q) ||
        (art.tags && art.tags.some(t => t.toLowerCase().includes(q)));

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [articles, selectedCategory, selectedTag, searchQuery]);

  // Find curated products mentioned in this essay
  const mentionedProducts = useMemo(() => {
    if (!currentArticle) return [];
    if (currentArticle.mentionedProductIds && currentArticle.mentionedProductIds.length > 0) {
      return products.filter(p => currentArticle.mentionedProductIds?.includes(p.id));
    }
    // Fallback: match by category or first two items
    return products.slice(0, 2);
  }, [currentArticle, products]);

  // Next and Previous articles in sequence
  const { prevArticle, nextArticle } = useMemo(() => {
    if (!currentArticle) return { prevArticle: null, nextArticle: null };
    const currentIndex = articles.findIndex(a => a.id === currentArticle.id);
    const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
    return { prevArticle: prev, nextArticle: next };
  }, [currentArticle, articles]);

  // Related essays (excluding current)
  const relatedArticles = useMemo(() => {
    if (!currentArticle) return [];
    const sameCategory = articles.filter(
      a => a.id !== currentArticle.id && a.category === currentArticle.category
    );
    if (sameCategory.length >= 3) return sameCategory.slice(0, 3);
    const others = articles.filter(a => a.id !== currentArticle.id && a.category !== currentArticle.category);
    return [...sameCategory, ...others].slice(0, 3);
  }, [currentArticle, articles]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleCopyLink = () => {
    if (!currentArticle) return;
    const url = `${window.location.origin}/#/journal/${currentArticle.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      showToast('Article link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleShareWhatsapp = () => {
    if (!currentArticle) return;
    const url = `${window.location.origin}/#/journal/${currentArticle.slug}`;
    const text = `Read "${currentArticle.title}" on The Sajavat Journal: ${url}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    showToast('Subscribed to The Sajavat Journal Dispatch!');
    setNewsletterEmail('');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // =========================================================================
  // VIEW MODE A: FULL ESSAY READING EXPERIENCE
  // =========================================================================
  if (currentArticle) {
    return (
      <article className="min-h-screen bg-[#FFF9F2] pt-4 pb-24 text-[#332927] relative">
        {/* Sticky Reading Progress Bar (Top of Screen) */}
        <div
          className="fixed top-0 left-0 right-0 h-1 bg-[#F3E6D5] z-50 pointer-events-none"
          role="progressbar"
          aria-valuenow={readingProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#800020] transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Semantic Breadcrumbs with Schema representation */}
          <nav aria-label="Breadcrumb" className="pt-4 pb-6 border-b border-[#F2E8DC] mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-[#7A6B69]">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '';
                    setCurrentView('home');
                  }}
                  className="hover:text-[#800020] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>•</li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#/journal';
                    onSelectArticle(undefined);
                  }}
                  className="hover:text-[#800020] transition-colors"
                >
                  The Journal
                </button>
              </li>
              <li>•</li>
              <li>
                <span className="text-[#800020] font-medium">{currentArticle.categoryLabel}</span>
              </li>
              <li>•</li>
              <li className="text-[#332927] font-semibold truncate max-w-xs sm:max-w-md" aria-current="page">
                {currentArticle.title}
              </li>
            </ol>
          </nav>

          {/* Article Header & Masthead */}
          <header className="max-w-4xl mx-auto mb-10 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs mb-4">
              <span className="px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] font-bold uppercase tracking-wider text-[11px]">
                {currentArticle.categoryLabel}
              </span>
              <span className="text-[#A89F91]">•</span>
              <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37]">
                {currentArticle.essayNumber}
              </span>
              <span className="text-[#A89F91]">•</span>
              <span className="text-xs text-[#7A6B69] flex items-center gap-1">
                <span>⏱</span> {currentArticle.readTime}
              </span>
              <span className="text-[#A89F91]">•</span>
              <span className="text-xs text-[#7A6B69]">{currentArticle.date}</span>
            </div>

            {/* Semantic H1 for SEO */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[46px] text-[#332927] leading-[1.18] font-normal mb-5">
              {currentArticle.title}
            </h1>

            {/* Subtitle / Lead Excerpt */}
            {currentArticle.subtitle && (
              <p className="text-lg sm:text-xl text-[#6E615D] font-light leading-relaxed mb-6 font-serif italic border-l-2 border-[#D4AF37] pl-4">
                {currentArticle.subtitle}
              </p>
            )}

            {/* Author Credential Byline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#F2E8DC]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#FFF5E6] border border-[#D4AF37] flex items-center justify-center text-[#800020] font-serif font-bold text-lg shadow-xs">
                  {currentArticle.author.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-[#332927]">{currentArticle.author}</h3>
                  <p className="text-xs text-[#7A6B69]">
                    {currentArticle.authorTitle}
                    {currentArticle.authorBio ? ` • ${currentArticle.authorBio}` : ''}
                  </p>
                </div>
              </div>

              {/* Utility Sharing Bar */}
              <div className="flex items-center gap-2 self-center sm:self-auto">
                {/* Font Size Adjuster */}
                <div className="flex items-center border border-[#F2E8DC] rounded-xl bg-white px-2 py-1 text-xs text-[#7A6B69]">
                  <span className="text-[10px] uppercase font-bold tracking-wider mr-1 text-[#A89F91]">Type:</span>
                  <button
                    type="button"
                    onClick={() => setFontSize('standard')}
                    className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                      fontSize === 'standard' ? 'bg-[#800020] text-white' : 'hover:text-[#332927]'
                    }`}
                    title="Standard reading font size"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('large')}
                    className={`px-1.5 py-0.5 rounded text-sm font-bold ${
                      fontSize === 'large' ? 'bg-[#800020] text-white' : 'hover:text-[#332927]'
                    }`}
                    title="Large reading font size"
                  >
                    A+
                  </button>
                </div>

                {/* WhatsApp Share */}
                <button
                  type="button"
                  onClick={handleShareWhatsapp}
                  className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Share this essay on WhatsApp"
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                {/* 1-Click Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl border border-[#F2E8DC] bg-white hover:border-[#800020] text-[#332927] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Copy permanent canonical URL"
                >
                  <span>🔗</span>
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                {/* Bookmark Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBookmarked(!isBookmarked);
                    showToast(isBookmarked ? 'Removed from saved reading list' : 'Saved to reading list!');
                  }}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isBookmarked
                      ? 'bg-[#800020] text-white border-[#800020]'
                      : 'bg-white border-[#F2E8DC] text-[#7A6B69] hover:border-[#800020]'
                  }`}
                  title={isBookmarked ? 'Saved to Reading List' : 'Save this essay'}
                  aria-label="Bookmark essay"
                >
                  {isBookmarked ? '★' : '☆'}
                </button>
              </div>
            </div>
          </header>

          {/* Hero Photography with Descriptive Alt Text & Caption */}
          <figure className="max-w-5xl mx-auto rounded-3xl overflow-hidden mb-12 border border-[#F2E8DC] shadow-sm bg-[#FFF9F2]">
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden">
              <img
                src={currentArticle.image}
                alt={currentArticle.imageAlt}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <figcaption className="p-3 sm:px-6 sm:py-3 bg-white border-t border-[#F2E8DC] text-[11px] text-[#7A6B69] flex flex-col sm:flex-row items-center justify-between gap-1 italic">
              <span>{currentArticle.imageAlt}</span>
              <span className="font-mono not-italic text-[#A89F91]">Sajavat Visual Archive • Moradabad</span>
            </figcaption>
          </figure>

          {/* Key Takeaways / Google Featured Snippets Summary Box */}
          {currentArticle.keyTakeaways && currentArticle.keyTakeaways.length > 0 && (
            <aside
              aria-label="Key Takeaways and Highlights"
              className="max-w-4xl mx-auto bg-[#FFFDF9] border border-[#D4AF37]/40 rounded-2xl p-6 sm:p-8 mb-12 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3 text-[#800020]">
                <span className="text-lg">✨</span>
                <h3 className="font-serif text-lg font-bold tracking-tight text-[#332927]">
                  Editorial Key Takeaways &amp; Quick Highlights
                </h3>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#4A3E3D] leading-relaxed">
                {currentArticle.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-[#D4AF37] font-bold mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Two-Column Editorial Grid: Sticky Rail (Left) + Long-Form Essay (Right) */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* STICKY DESKTOP RAIL (Table of Contents + Artifacts preview) */}
            <aside className="hidden lg:block lg:col-span-4 space-y-6">
              <div className="sticky top-20 space-y-6">
                {/* Table of Contents */}
                {currentArticle.sections && currentArticle.sections.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#F2E8DC] p-5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-2">
                      Essay Index
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-[#332927] mb-3">
                      Table of Contents
                    </h4>
                    <nav aria-label="Table of contents" className="space-y-1.5 text-xs">
                      {currentArticle.sections.map((section, idx) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => scrollToSection(section.id)}
                          className={`w-full text-left py-1 px-2 rounded-lg transition-colors cursor-pointer block truncate ${
                            activeSectionId === section.id
                              ? 'bg-[#800020]/10 text-[#800020] font-bold'
                              : 'text-[#6E615D] hover:text-[#332927] hover:bg-[#FFF9F2]'
                          }`}
                        >
                          {idx + 1}. {section.heading.replace(/^\d+\.\s*/, '')}
                        </button>
                      ))}
                      {currentArticle.faqs && currentArticle.faqs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => scrollToSection('faqs-section')}
                          className="w-full text-left py-1 px-2 rounded-lg text-[#6E615D] hover:text-[#332927] hover:bg-[#FFF9F2] transition-colors cursor-pointer"
                        >
                          • Frequently Asked Questions
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => scrollToSection('shop-the-story')}
                        className="w-full text-left py-1 px-2 rounded-lg text-[#800020] font-semibold hover:bg-[#800020]/5 transition-colors cursor-pointer"
                      >
                        • Curated Artifacts in Story
                      </button>
                    </nav>
                  </div>
                )}

                {/* Quick Mentioned Artifact Rail */}
                {mentionedProducts.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#F2E8DC] p-5 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#800020] block mb-2">
                      Curated Artifacts
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-[#332927] mb-3">
                      Featured in this Essay
                    </h4>
                    <div className="space-y-3">
                      {mentionedProducts.slice(0, 2).map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => onSelectProduct(prod)}
                          className="flex items-center gap-3 p-2 rounded-xl bg-[#FFF9F2] border border-[#F2E8DC] hover:border-[#D4AF37] transition-all cursor-pointer group"
                        >
                          <img
                            src={prod.images.main}
                            alt={prod.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-serif text-xs text-[#332927] group-hover:text-[#800020] truncate">
                              {prod.name}
                            </h5>
                            <span className="text-[11px] font-bold text-[#800020]">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to All Essays CTA */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#/journal';
                    onSelectArticle(undefined);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#F2E8DC] bg-white text-xs text-[#7A6B69] hover:text-[#800020] hover:border-[#800020] font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span>←</span> All Journal Dispatches
                </button>
              </div>
            </aside>

            {/* MAIN ARTICLE BODY (Right Column) */}
            <main className="lg:col-span-8 bg-white rounded-3xl border border-[#F2E8DC] p-6 sm:p-12 shadow-sm space-y-10">
              {/* Lead Paragraph with Drop Cap */}
              <div
                className={`text-[#4A3E3D] leading-relaxed ${
                  fontSize === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                }`}
              >
                {currentArticle.content.slice(0, 2).map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`mb-6 ${
                      idx === 0
                        ? 'first-letter:font-serif first-letter:text-5xl sm:first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3.5 first-letter:text-[#800020] first-letter:leading-none'
                        : ''
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Structured Sections with Semantic H2 & Jump Targets */}
              {currentArticle.sections && currentArticle.sections.length > 0 ? (
                <div className="space-y-12 pt-4">
                  {currentArticle.sections.map(section => (
                    <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
                      <div className="border-b border-[#F2E8DC] pb-3">
                        <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] font-semibold leading-snug">
                          {section.heading}
                        </h2>
                        {section.subheading && (
                          <p className="text-xs text-[#A89F91] uppercase tracking-wider mt-1">
                            {section.subheading}
                          </p>
                        )}
                      </div>

                      <div
                        className={`space-y-4 text-[#4A3E3D] leading-relaxed ${
                          fontSize === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'
                        }`}
                      >
                        {section.paragraphs.map((pText, pIdx) => (
                          <p key={pIdx}>{pText}</p>
                        ))}
                      </div>

                      {/* Editorial Callout / Pro Tip Quote */}
                      {section.callout && (
                        <blockquote className="my-6 p-5 sm:p-6 bg-[#FFF9F2] rounded-2xl border-l-4 border-[#800020] text-sm text-[#800020] font-serif italic leading-relaxed shadow-2xs">
                          {section.callout}
                        </blockquote>
                      )}

                      {/* Contextual Section Image if present */}
                      {section.image && (
                        <figure className="my-6 rounded-2xl overflow-hidden border border-[#F2E8DC]">
                          <img
                            src={section.image}
                            alt={section.imageAlt || section.heading}
                            className="w-full h-auto object-cover"
                            loading="lazy"
                          />
                          {section.imageCaption && (
                            <figcaption className="p-3 bg-white text-[11px] text-[#7A6B69] italic border-t border-[#F2E8DC]">
                              {section.imageCaption}
                            </figcaption>
                          )}
                        </figure>
                      )}
                    </section>
                  ))}
                </div>
              ) : (
                /* Fallback for articles with only content paragraphs */
                <div className="space-y-6 text-[#4A3E3D] text-base leading-relaxed">
                  {currentArticle.content.slice(2).map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}

              {/* Tag Pills */}
              {currentArticle.tags && currentArticle.tags.length > 0 && (
                <div className="pt-6 border-t border-[#F2E8DC]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A89F91] block mb-2">
                    Indexed Under
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentArticle.tags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setSelectedTag(tag);
                          window.location.hash = '#/journal';
                          onSelectArticle(undefined);
                        }}
                        className="px-3 py-1 rounded-full bg-[#FFF9F2] border border-[#F2E8DC] hover:border-[#800020] text-xs text-[#6E615D] font-medium transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequently Asked Questions (FAQPage Schema Accordion) */}
              {currentArticle.faqs && currentArticle.faqs.length > 0 && (
                <section id="faqs-section" className="pt-8 border-t border-[#F2E8DC] scroll-mt-24 space-y-4">
                  <div className="mb-4">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block">
                      Curator’s Answers
                    </span>
                    <h3 className="font-serif text-2xl text-[#332927]">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-xs text-[#7A6B69] mt-1">
                      Authoritative guidance compiled by our Moradabad guild conservators and festive stylists.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentArticle.faqs.map((faq, fIdx) => (
                      <div
                        key={fIdx}
                        className="border border-[#F2E8DC] rounded-2xl overflow-hidden bg-[#FFFDF9]"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedFaqIndex(expandedFaqIndex === fIdx ? null : fIdx)}
                          className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-serif text-sm sm:text-base text-[#332927] hover:text-[#800020] transition-colors cursor-pointer"
                        >
                          <span className="font-semibold">{faq.question}</span>
                          <span className="text-lg text-[#800020] font-bold transition-transform">
                            {expandedFaqIndex === fIdx ? '−' : '+'}
                          </span>
                        </button>
                        {expandedFaqIndex === fIdx && (
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5A4D4B] leading-relaxed border-t border-[#F2E8DC]/50">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Helpful Feedback Widget */}
              <div className="p-6 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-[#332927]">
                    Was this styling guide helpful?
                  </h4>
                  <p className="text-xs text-[#7A6B69]">
                    Your reflections guide our seasonal research dispatches.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackGiven('helpful');
                      showToast('Thank you for your feedback!');
                    }}
                    disabled={feedbackGiven !== null}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      feedbackGiven === 'helpful'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white border border-[#F2E8DC] text-[#332927] hover:border-[#800020]'
                    }`}
                  >
                    👍 Yes, very helpful
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackGiven('unhelpful');
                      showToast('Thank you for your suggestion.');
                    }}
                    disabled={feedbackGiven !== null}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      feedbackGiven === 'unhelpful'
                        ? 'bg-stone-700 text-white'
                        : 'bg-white border border-[#F2E8DC] text-[#332927] hover:border-[#800020]'
                    }`}
                  >
                    Could be better
                  </button>
                </div>
              </div>

              {/* Curated Products Mentioned in Essay ("Shop the Story") */}
              <section id="shop-the-story" className="pt-8 border-t border-[#F2E8DC] scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block">
                      Shop the Story
                    </span>
                    <h3 className="font-serif text-2xl text-[#332927]">
                      Curated Artifacts Mentioned
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash = '#/shop';
                      setCurrentView('shop');
                    }}
                    className="text-xs text-[#800020] font-semibold hover:underline"
                  >
                    View Entire Atelier →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mentionedProducts.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF9F2] border border-[#F2E8DC] hover:border-[#D4AF37] transition-all cursor-pointer group shadow-2xs hover:shadow-xs"
                    >
                      <img
                        src={prod.images.main}
                        alt={prod.name}
                        className="w-20 h-20 object-cover rounded-xl border border-[#F2E8DC]"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-[#A89F91] block">
                          {prod.material}
                        </span>
                        <h4 className="font-serif text-sm text-[#332927] group-hover:text-[#800020] truncate font-medium">
                          {prod.name}
                        </h4>
                        <span className="text-xs font-bold text-[#800020] block mt-1">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={e => handleQuickAdd(prod, e)}
                        className="px-3.5 py-2 bg-[#800020] text-white text-xs font-semibold rounded-xl hover:bg-[#600018] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                      >
                        + Add to Bag
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Next / Previous Article Navigation */}
              <nav aria-label="Sequential Essay Navigation" className="pt-8 border-t border-[#F2E8DC] grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevArticle ? (
                  <div
                    onClick={() => onSelectArticle(prevArticle)}
                    className="p-4 rounded-2xl border border-[#F2E8DC] hover:border-[#800020] transition-colors cursor-pointer group"
                  >
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A89F91] block mb-1">
                      ← Previous Essay
                    </span>
                    <h5 className="font-serif text-sm text-[#332927] group-hover:text-[#800020] line-clamp-1 font-medium">
                      {prevArticle.title}
                    </h5>
                  </div>
                ) : <div />}

                {nextArticle ? (
                  <div
                    onClick={() => onSelectArticle(nextArticle)}
                    className="p-4 rounded-2xl border border-[#F2E8DC] hover:border-[#800020] transition-colors cursor-pointer group text-right"
                  >
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A89F91] block mb-1">
                      Next Read →
                    </span>
                    <h5 className="font-serif text-sm text-[#332927] group-hover:text-[#800020] line-clamp-1 font-medium">
                      {nextArticle.title}
                    </h5>
                  </div>
                ) : <div />}
              </nav>
            </main>
          </div>

          {/* Related Articles Showcase */}
          {relatedArticles.length > 0 && (
            <section className="mt-20 pt-12 border-t border-[#F2E8DC]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold block">
                    Curated Reading
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#332927]">
                    More Editorial Dispatches
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#/journal';
                    onSelectArticle(undefined);
                  }}
                  className="text-xs text-[#800020] font-semibold hover:underline"
                >
                  View All Essays →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map(art => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="bg-white rounded-3xl border border-[#F2E8DC] p-5 cursor-pointer flex flex-col justify-between group hover:shadow-md hover:border-[#D4AF37] transition-all"
                  >
                    <div>
                      <div className="rounded-2xl overflow-hidden aspect-video mb-4 bg-[#FFF9F2] border border-[#F2E8DC]">
                        <img
                          src={art.image}
                          alt={art.imageAlt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#A89F91] uppercase tracking-wider mb-2">
                        <span className="text-[#800020] font-semibold">{art.categoryLabel}</span>
                        <span>•</span>
                        <span>{art.readTime}</span>
                      </div>
                      <h4 className="font-serif text-base text-[#332927] group-hover:text-[#800020] transition-colors mb-2 line-clamp-2 leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs text-[#6E615D] line-clamp-2 leading-relaxed mb-4">
                        {art.leadExcerpt}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-[#F2E8DC] flex items-center justify-between text-xs text-[#A89F91]">
                      <span>By {art.author}</span>
                      <span className="text-[#800020] font-semibold group-hover:translate-x-1 transition-transform">
                        Read Essay →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Return to All Essays Button at Bottom */}
          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#/journal';
                onSelectArticle(undefined);
              }}
              className="px-8 py-3.5 rounded-full bg-[#800020] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#600018] transition-colors shadow-sm cursor-pointer"
            >
              ← Back to All Journal Essays &amp; Styling Guides
            </button>
          </div>
        </div>
      </article>
    );
  }

  // =========================================================================
  // VIEW MODE B: EDITORIAL MAGAZINE INDEX VIEW
  // =========================================================================
  const leadEssay = articles.find(a => a.featuredLead) || articles[0];
  const otherEssays = filteredArticles.filter(a => a.id !== leadEssay?.id);

  return (
    <div className="min-h-screen bg-[#FFF9F2] pt-8 pb-24 text-[#332927]">
      {/* Editorial Masthead Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-2 block">
          The Sajavat Journal • Issue No. IV
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#332927] mb-4">
          Rituals, Heritage &amp; Festive Living
        </h1>
        <p className="text-[#6E615D] text-base max-w-2xl mx-auto leading-relaxed">
          Curated dispatches on four-century metalcraft guilds, Vastu sacred geometries, botanical soy aromatics, and the quiet dignity of handcrafted homes.
        </p>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mt-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search styling guides, Vastu tips, or craft heritage..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#F2E8DC] text-xs text-[#332927] placeholder:text-[#A89F91] focus:outline-none focus:border-[#800020] shadow-2xs"
            />
            <span className="absolute left-3.5 top-2.5 text-sm text-[#A89F91]">🔍</span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2 text-xs text-[#7A6B69] hover:text-[#800020]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id);
                setSelectedTag(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                selectedCategory === c.id && !selectedTag
                  ? 'bg-[#800020] text-white shadow-xs'
                  : 'bg-white border border-[#F2E8DC] text-[#6E615D] hover:border-[#D4AF37]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs text-[#7A6B69]">
          <span className="text-[11px] uppercase tracking-wider text-[#A89F91] mr-1">Trending Topics:</span>
          {popularTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSelectedTag(selectedTag === tag ? null : tag);
                setSelectedCategory('all');
              }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#800020] text-white font-bold'
                  : 'bg-white/80 border border-[#F2E8DC] text-[#6E615D] hover:text-[#800020]'
              }`}
            >
              {tag}
            </button>
          ))}
          {selectedTag && (
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className="text-[11px] text-[#800020] underline ml-1 cursor-pointer font-semibold"
            >
              Clear tag
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Featured Lead Essay Showcase (Only when not filtering with search) */}
        {!searchQuery && !selectedTag && selectedCategory === 'all' && leadEssay && (
          <div
            onClick={() => onSelectArticle(leadEssay)}
            className="bg-white rounded-3xl border border-[#F2E8DC] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group mb-14"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden bg-[#FFF9F2]">
                <img
                  src={leadEssay.image}
                  alt={leadEssay.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
              </div>
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#A89F91] mb-3">
                    <span className="px-2.5 py-0.5 rounded bg-[#800020]/10 text-[#800020] font-bold text-[10px]">
                      Lead Dispatch
                    </span>
                    <span>•</span>
                    <span>{leadEssay.readTime}</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] group-hover:text-[#800020] transition-colors leading-snug mb-3">
                    {leadEssay.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E615D] line-clamp-4 leading-relaxed mb-6">
                    {leadEssay.leadExcerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F2E8DC] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#332927] block">{leadEssay.author}</span>
                    <span className="text-[11px] text-[#A89F91]">{leadEssay.authorTitle}</span>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-[#800020] text-white font-semibold text-xs group-hover:bg-[#600018] transition-colors">
                    Read Essay →
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl text-[#332927]">
              {selectedCategory === 'all' && !selectedTag && !searchQuery
                ? 'Curated Editorial Dispatches'
                : `Showing (${filteredArticles.length}) Essays`}
            </h2>
            <span className="text-xs text-[#A89F91]">
              Moradabad Guild Archives • Updated Daily
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#F2E8DC] p-8">
              <span className="text-3xl block mb-2">📜</span>
              <h3 className="font-serif text-lg text-[#332927] mb-1">No essays matched your query</h3>
              <p className="text-xs text-[#7A6B69] mb-4">
                Try searching for "urli", "vastu", "brass care", or browse all categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#800020] text-white text-xs font-semibold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(searchQuery || selectedTag || selectedCategory !== 'all' ? filteredArticles : otherEssays).map(art => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art)}
                  className="bg-white rounded-3xl border border-[#F2E8DC] transition-all p-6 cursor-pointer flex flex-col justify-between group hover:shadow-md hover:border-[#D4AF37]"
                >
                  <div>
                    <div className="rounded-2xl overflow-hidden aspect-video mb-5 border border-[#F2E8DC] bg-[#FFF9F2]">
                      <img
                        src={art.image}
                        alt={art.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#A89F91] uppercase tracking-wider mb-2">
                      <span className="text-[#800020] font-semibold">{art.categoryLabel}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>
                    <h3 className="font-serif text-lg text-[#332927] group-hover:text-[#800020] transition-colors mb-2 leading-snug line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#6E615D] line-clamp-3 leading-relaxed mb-4">
                      {art.leadExcerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F2E8DC] flex items-center justify-between text-xs text-[#A89F91]">
                    <span>By {art.author}</span>
                    <span className="text-[#800020] font-semibold group-hover:translate-x-1 transition-transform">
                      Read Essay →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* High-Intent Topic Hub Quick Shortcuts */}
        <section className="bg-white rounded-3xl border border-[#F2E8DC] p-8 sm:p-12 mb-16 shadow-2xs">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block mb-1">
              Patron Knowledge Base
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#332927]">
              Essential Ritual &amp; Craft Guides
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6B69] mt-1">
              Quick access to our highest-read guides for caring, styling, and honoring authentic Moradabad brassware.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Vastu Urli Placement',
                desc: 'Ishanya North-East directions, water elements & deepam rules.',
                slug: 'vastu-brass-urli-placement-guide',
                tag: 'Vastu Shastra'
              },
              {
                title: 'Festive Foyer Styling',
                desc: 'Threshold purification, floating marigolds & asymmetric lighting.',
                slug: 'festive-foyer-styling-guide',
                tag: 'Festive Living'
              },
              {
                title: 'Brass Patina & Care',
                desc: 'Chemical-free cleaning using natural tamarind pulp & Pitambari.',
                slug: 'brass-patina-care-restoration-guide',
                tag: 'Heirloom Care'
              },
              {
                title: 'Clean Soy & Sandalwood',
                desc: 'Why non-toxic botanical waxes protect festive indoor air.',
                slug: 'botanical-fragrance-clean-lighting',
                tag: 'Indoor Wellness'
              }
            ].map(guide => {
              const matched = articles.find(a => a.slug === guide.slug);
              return (
                <div
                  key={guide.slug}
                  onClick={() => matched && onSelectArticle(matched)}
                  className="p-5 rounded-2xl bg-[#FFF9F2] border border-[#F2E8DC] hover:border-[#800020] transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#800020] block mb-1">
                      {guide.tag}
                    </span>
                    <h3 className="font-serif text-base text-[#332927] group-hover:text-[#800020] font-semibold mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-[#6E615D] leading-relaxed mb-4">
                      {guide.desc}
                    </p>
                  </div>
                  <span className="text-xs text-[#800020] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Guide →
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Newsletter Correspondence Box */}
        <section className="bg-gradient-to-r from-[#800020] to-[#5A0016] text-[#FFF9F2] rounded-3xl p-8 sm:p-12 text-center shadow-md">
          <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37] block mb-2">
            The Sajavat Gazette
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-white mb-3">
            Receive Curated Festive Styling Notes
          </h2>
          <p className="text-xs sm:text-sm text-[#F3E6D5] max-w-lg mx-auto mb-6 leading-relaxed">
            Delivered twice a month: seasonal ritual styling essays, foundry stories from Moradabad, and private invitations to bespoke trunk previews.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-xs focus:outline-none focus:bg-white/20"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#bfa030] text-[#332927] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              Subscribe
            </button>
          </form>

          {newsletterSubscribed && (
            <p className="text-xs text-[#D4AF37] mt-3 font-medium">
              ✓ Thank you for subscribing. A welcome curatorial issue is on its way.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
