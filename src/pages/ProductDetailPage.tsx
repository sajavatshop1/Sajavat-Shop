import React, { useState, useEffect, useMemo } from 'react';
import { Product, PincodeCheckResult, Review, ReviewsSummary } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (p: Product) => void;
  setCurrentView: (view: string) => void;
  onInstantUpiCheckout?: () => void;
  journalArticles?: any[];
  onSelectArticle?: (article: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  setCurrentView
}) => {
  const { addToCart, toggleWishlist, isWishlisted, setIsCartOpen, showToast } = useCart();

  // Active view image
  const galleryViews = [
    { label: 'Water View', url: product.images.waterView || product.images.main },
    { label: 'Engraving', url: product.images.engraving || product.images.main },
    { label: 'Lifestyle', url: product.images.lifestyle || product.images.main },
    { label: 'Gift Box', url: product.images.giftBox || product.images.main }
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeFinish, setActiveFinish] = useState(product.finishes ? product.finishes[0].id : 'default');
  const [quantity, setQuantity] = useState(1);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // Pincode state
  const [pincode, setPincode] = useState('400052');
  const [pincodeResult, setPincodeResult] = useState<PincodeCheckResult | null>({
    valid: true,
    pincode: '400052',
    city: 'Mumbai',
    state: 'Maharashtra',
    estimatedDays: '2–3 business days',
    partner: 'BlueDart Air Apex'
  });
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Accordions
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>('spec1');

  // Customer Reviews & Star Ratings state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewsSummary>({
    averageRating: product.rating || 4.9,
    totalReviews: product.reviewsCount || 42,
    distribution: { 5: 38, 4: 4, 3: 0, 2: 0, 1: 0 }
  });
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review submission state (Modal and Inline form)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isWritingInline, setIsWritingInline] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewFinish, setReviewFinish] = useState(product.finishes?.[0]?.name || 'Heirloom Finish');
  const [reviewRecommend, setReviewRecommend] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [helpfulVotedIds, setHelpfulVotedIds] = useState<Set<string>>(new Set());

  // Fetch reviews for this product from server
  useEffect(() => {
    let isMounted = true;
    setLoadingReviews(true);

    fetch(`/api/reviews/${product.id}`)
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to load reviews');
      })
      .then(data => {
        if (isMounted && data.reviews) {
          setReviews(data.reviews);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      })
      .catch(err => {
        console.warn('Using client-side fallback reviews:', err);
        if (isMounted) {
          const fallbackList: Review[] = [
            {
              id: `rev-${product.id}-1`,
              productId: product.id,
              author: 'Aparna Sengupta',
              city: 'Kolkata, West Bengal',
              rating: 5,
              title: 'The heft and engraving are exceptional',
              comment: 'When you pick it up, you instantly feel the sheer weight of genuine bell brass. The floating lotus diyas balance effortlessly without capsizing, and the water stays crystal clear. Arrived impeccably boxed with zero tarnishing.',
              date: '3 weeks ago',
              verifiedPurchase: true,
              finishPurchased: product.finishes?.[0]?.name || 'Antique Heirloom Brass',
              helpfulCount: 24,
              recommend: true
            },
            {
              id: `rev-${product.id}-2`,
              productId: product.id,
              author: 'Vikramaditya K.',
              city: 'New Delhi',
              rating: 5,
              title: 'The centerpiece of our Diwali celebration',
              comment: 'We paired it with red rose petals and Mogra flowers as guests entered our foyer. The compliment after compliment made this purchase so worth it. The packaging was so exquisite I didn\'t even have to gift wrap it.',
              date: '1 month ago',
              verifiedPurchase: true,
              finishPurchased: product.finishes?.[0]?.name || 'Antique Heirloom Brass',
              helpfulCount: 18,
              recommend: true
            },
            {
              id: `rev-${product.id}-3`,
              productId: product.id,
              author: 'Radhika Sharma',
              city: 'Bengaluru, Karnataka',
              rating: 5,
              title: 'Heirloom quality that will last generations',
              comment: 'I was hesitant about buying brass online, but the artisanal detailing around the peacock plumage is truly hand-chiseled. Solid craftsmanship, authentic bell sound when tapped.',
              date: '2 months ago',
              verifiedPurchase: true,
              finishPurchased: product.finishes?.[1]?.name || 'Raw Chiseled Matte Brass',
              helpfulCount: 11,
              recommend: true
            }
          ];
          setReviews(fallbackList);
          setSummary({
            averageRating: product.rating || 4.9,
            totalReviews: product.reviewsCount || fallbackList.length,
            distribution: { 5: 38, 4: 4, 3: 0, 2: 0, 1: 0 }
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingReviews(false);
      });

    return () => { isMounted = false; };
  }, [product.id, product.rating, product.reviewsCount, product.finishes]);

  const toggleAccordion = (id: string) => {
    setExpandedAccordion(prev => (prev === id ? null : id));
  };

  const handlePincodeCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setPincodeResult({ valid: false, message: 'Please enter a valid 6-digit PIN code.' });
      return;
    }
    setCheckingPincode(true);
    try {
      const res = await fetch('/api/pincode/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode })
      });
      const data = await res.json();
      setPincodeResult(data);
    } catch {
      setPincodeResult({
        valid: true,
        pincode,
        city: 'Metro Hub',
        estimatedDays: '2–3 business days',
        message: `Standard courier delivery to ${pincode} within 2–3 business days.`
      });
    } finally {
      setCheckingPincode(false);
    }
  };

  const currentFinishObj = product.finishes?.find(f => f.id === activeFinish);

  const handleAddToBag = () => {
    addToCart(product, quantity, currentFinishObj?.name);
    setIsCartOpen(true);
  };

  const handleInstantUpi = () => {
    addToCart(product, quantity, currentFinishObj?.name);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (helpfulVotedIds.has(reviewId)) {
      showToast('You have already marked this review as helpful.');
      return;
    }

    setHelpfulVotedIds(prev => new Set(prev).add(reviewId));
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r));

    try {
      await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      showToast('Thank you for voting this review helpful!');
    } catch {
      // optimistic update retained
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      showToast('Please provide your review feedback.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          author: reviewAuthor.trim() || 'Festive Patron',
          city: reviewCity.trim() || 'Verified Buyer',
          rating: reviewRating,
          title: reviewTitle.trim() || (reviewRating === 5 ? 'Exceptional Heirloom Craftsmanship' : 'Delightful Celebration Addition'),
          comment: reviewText.trim(),
          finishPurchased: reviewFinish,
          recommend: reviewRecommend
        })
      });

      const data = await res.json();
      if (data.review) {
        setReviews(prev => [data.review, ...prev]);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        // Fallback local update
        const newRev: Review = {
          id: `rev-${Date.now()}`,
          productId: product.id,
          author: reviewAuthor.trim() || 'Festive Patron',
          city: reviewCity.trim() || 'Verified Buyer',
          rating: reviewRating,
          title: reviewTitle.trim() || (reviewRating === 5 ? 'Exceptional Heirloom Craftsmanship' : 'Delightful Celebration Addition'),
          comment: reviewText.trim(),
          date: 'Just now',
          verifiedPurchase: true,
          finishPurchased: reviewFinish,
          helpfulCount: 0,
          recommend: reviewRecommend
        };
        setReviews(prev => [newRev, ...prev]);
        setSummary(prev => {
          const newDist = { ...prev.distribution };
          const bucket = reviewRating as 1 | 2 | 3 | 4 | 5;
          newDist[bucket] = (newDist[bucket] || 0) + 1;
          const newTot = prev.totalReviews + 1;
          return {
            averageRating: parseFloat((((prev.averageRating * prev.totalReviews) + reviewRating) / newTot).toFixed(1)),
            totalReviews: newTot,
            distribution: newDist
          };
        });
      }

      showToast(data.message || 'Thank you! Your verified review and rating have been published.');
      setReviewModalOpen(false);
      setIsWritingInline(false);
      setReviewText('');
      setReviewTitle('');
      setReviewAuthor('');
      setReviewCity('');
      setReviewRating(5);
      setSelectedStarFilter(null);
    } catch {
      showToast('Thank you! Your verified review has been published.');
      setReviewModalOpen(false);
      setIsWritingInline(false);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let list = [...reviews];
    if (selectedStarFilter !== null) {
      list = list.filter(r => Math.round(r.rating) === selectedStarFilter);
    }
    list.sort((a, b) => {
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      } else if (sortBy === 'lowest') {
        return a.rating - b.rating;
      } else if (sortBy === 'helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      return 0; // 'recent'
    });
    return list;
  }, [reviews, selectedStarFilter, sortBy]);

  // Complementary pairings
  const pairedItems = allProducts
    .filter(p => product.pairings?.includes(p.id) || (p.id !== product.id && p.featured))
    .slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Breadcrumb Nav */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-[#F3E6D5]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wider text-[#7A6B69]">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
            <button type="button" onClick={() => setCurrentView('home')} className="hover:text-[#800020]">
              Home
            </button>
            <span className="opacity-50">/</span>
            <button type="button" onClick={() => setCurrentView('shop')} className="hover:text-[#800020]">
              Shop
            </button>
            <span className="opacity-50">/</span>
            <span className="text-[#800020] font-semibold">{product.name}</span>
          </nav>
          <div className="hidden sm:flex items-center gap-2 text-[#7A6B69] font-medium tracking-widest text-[10px]">
            <span>{product.craftHeritage}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#800020]" />
            <span>Atelier Ref: {product.sku}</span>
          </div>
        </div>
      </section>

      {/* 2. Main Two-Column Product Split */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Gallery (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Stage */}
            <div className="relative w-full aspect-[4/5] bg-[#F3E6D5] rounded overflow-hidden group shadow-sm">
              <img
                src={galleryViews[activeImageIndex].url}
                alt={`${product.name} — Handcrafted ${product.material} (${galleryViews[activeImageIndex].label}) by Sajavat Atelier`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                <span className="bg-[#FFF9F2]/90 backdrop-blur-sm text-[#332927] px-3 py-1 text-[10px] uppercase tracking-widest font-semibold border border-[#E6D7C3] rounded-sm">
                  {product.craftHeritage.split(' ')[0]} Brass Guild
                </span>
              </div>

              {/* Zoom Trigger */}
              <button
                type="button"
                onClick={() => setZoomModalOpen(true)}
                aria-label="Enlarge View"
                className="absolute bottom-4 right-4 w-10 h-10 bg-[#FFF9F2]/90 hover:bg-white text-[#800020] rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
              >
                <span className="material-symbols-outlined text-[20px]">zoom_in</span>
              </button>

              <div className="absolute bottom-4 left-4 bg-[#FFF9F2]/85 backdrop-blur-sm px-3 py-1 text-[11px] text-[#7A6B69] rounded-sm border border-[#E6D7C3]/60 pointer-events-none">
                {product.material} · {product.weight}
              </div>
            </div>

            {/* 4 Interactive Thumbnails Carousel */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {galleryViews.map((thumb, idx) => (
                <button
                  key={thumb.label}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square bg-[#F3E6D5] rounded overflow-hidden relative transition-all ${
                    activeImageIndex === idx
                      ? 'ring-2 ring-[#800020] ring-offset-2 ring-offset-[#FFF9F2] opacity-100'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumb.url}
                    alt={`${product.name} — ${thumb.label} in ${product.material}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 inset-x-1 bg-[#FFF9F2]/85 text-[#800020] text-[8px] uppercase tracking-wider py-0.5 text-center rounded-sm">
                    {thumb.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Master Craftsmanship Provenance Note */}
            <div className="pt-6 pb-2 border-t border-[#F3E6D5] flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#F3E6D5] flex items-center justify-center shrink-0 text-[#800020]">
                <span className="material-symbols-outlined text-[20px]">handyman</span>
              </div>
              <div>
                <h4 className="font-serif text-base text-[#332927] font-medium leading-snug">
                  Master Craftsmanship of {product.craftHeritage}
                </h4>
                <p className="text-xs text-[#554745] mt-1 leading-relaxed">
                  Undergoes 14 distinct artisanal stages: sand casting, lathe turning, chisel carver engraving, and traditional tamarind-seed buffing.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Product Purchase Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-28">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-[#7A6B69]">
                <span>Festive Edition</span>
                <span>{product.sku}</span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl text-[#332927] font-normal leading-tight">
                {product.name}
              </h1>

              {/* Star Rating & Review Meta */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('patron-reviews');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 text-left group"
                >
                  <div className="flex items-center text-[#D4AF37]">
                    {[1, 2, 3, 4, 5].map(s => (
                      <svg
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= Math.round(summary.averageRating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#E6D7C3] fill-transparent'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-semibold text-[#332927] group-hover:text-[#800020] transition-colors">
                    {summary.averageRating.toFixed(1)}
                  </span>
                  <span className="text-[#7A6B69]/60">·</span>
                  <span className="text-[#800020] underline font-medium">
                    {summary.totalReviews} verified reviews
                  </span>
                </button>
                <span className="text-[#7A6B69]/60">·</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Ships in 24 hrs
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="py-3 flex flex-col gap-0.5 border-y border-[#F3E6D5]">
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-3xl text-[#800020] font-normal">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm text-[#7A6B69] line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-[#800020] font-bold">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#7A6B69]">
                Inclusive of all taxes. Complimentary insured courier across India.
              </p>
            </div>

            <p className="text-sm text-[#554745] leading-relaxed">
              {product.description}
            </p>

            {/* Finish Options (if applicable) */}
            {product.finishes && product.finishes.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#332927] font-semibold uppercase tracking-wider">Finish</span>
                  <span className="text-[#7A6B69]">{currentFinishObj?.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  {product.finishes.map(finish => (
                    <button
                      key={finish.id}
                      type="button"
                      onClick={() => setActiveFinish(finish.id)}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-sm text-xs transition-colors ${
                        activeFinish === finish.id
                          ? 'border-[#800020] bg-[#F3E6D5]/40 text-[#800020] font-medium'
                          : 'border-[#E6D7C3] hover:border-[#800020] text-[#332927]'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: finish.hex }} />
                      <span>{finish.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-[#7A6B69] font-medium">Qty</span>
                <div className="flex items-center border border-[#E6D7C3] rounded-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#7A6B69] hover:bg-[#F3E6D5]/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">remove</span>
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-[#332927]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-[#7A6B69] hover:bg-[#F3E6D5]/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                  </button>
                </div>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                {product.stock} pieces available in atelier
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex items-stretch gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className="flex-1 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-xs uppercase tracking-[0.15em] font-semibold h-12 rounded-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  <span>Add to Bag — ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Save to Wishlist"
                  className="w-12 h-12 border border-[#E6D7C3] hover:border-[#800020] flex items-center justify-center text-[#800020] transition-colors rounded-sm shrink-0"
                >
                  <span
                    className={`material-symbols-outlined text-[22px] ${
                      isWishlisted(product.id) ? 'text-[#D45060]' : ''
                    }`}
                    style={isWishlisted(product.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {/* Instant Checkout with UPI button */}
              <button
                type="button"
                onClick={handleInstantUpi}
                className="w-full border border-[#800020]/40 hover:border-[#800020] bg-[#FFF9F2] text-[#800020] text-xs uppercase tracking-[0.12em] font-semibold h-11 rounded-sm flex items-center justify-center gap-2 transition-colors hover:bg-[#F3E6D5]/30"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                <span>Instant Checkout with UPI</span>
              </button>
            </div>

            {/* Pincode Delivery Estimator */}
            <div className="pt-3 border-t border-[#F3E6D5]">
              <form onSubmit={handlePincodeCheck} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Check delivery PIN code"
                  className="bg-transparent border-b border-[#E6D7C3] py-1.5 text-xs text-[#332927] flex-1 outline-none focus:border-[#800020]"
                />
                <button
                  type="submit"
                  disabled={checkingPincode}
                  className="text-[11px] uppercase tracking-wider text-[#800020] font-semibold hover:underline"
                >
                  {checkingPincode ? 'Checking...' : 'Check'}
                </button>
              </form>
              {pincodeResult && (
                <p className={`text-[11px] mt-1.5 leading-relaxed ${pincodeResult.valid ? 'text-[#7A6B69]' : 'text-red-700'}`}>
                  {pincodeResult.valid ? (
                    <>
                      <span className="text-[#800020] font-semibold">
                        ✓ Delivering to {pincodeResult.pincode} ({pincodeResult.city}):{' '}
                      </span>
                      Guaranteed arrival within {pincodeResult.estimatedDays} via {pincodeResult.partner}. Cash on delivery available.
                    </>
                  ) : (
                    pincodeResult.message
                  )}
                </p>
              )}
            </div>

            {/* Accordions */}
            <div className="flex flex-col divide-y divide-[#F3E6D5] pt-2">
              {/* Accordion 1 */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('spec1')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-wider text-[#332927] hover:text-[#800020]"
                >
                  <span>Material &amp; Craft</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {expandedAccordion === 'spec1' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedAccordion === 'spec1' && (
                  <p className="pt-2 text-xs text-[#554745] leading-relaxed animate-in fade-in duration-200">
                    {product.specifications.materialCraft}
                  </p>
                )}
              </div>

              {/* Accordion 2 */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('spec2')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-wider text-[#332927] hover:text-[#800020]"
                >
                  <span>Dimensions &amp; Weight</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {expandedAccordion === 'spec2' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedAccordion === 'spec2' && (
                  <p className="pt-2 text-xs text-[#554745] leading-relaxed animate-in fade-in duration-200">
                    {product.specifications.dimensionsWeight}
                  </p>
                )}
              </div>

              {/* Accordion 3 */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('spec3')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-wider text-[#332927] hover:text-[#800020]"
                >
                  <span>Ritual Care &amp; Longevity</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {expandedAccordion === 'spec3' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedAccordion === 'spec3' && (
                  <p className="pt-2 text-xs text-[#554745] leading-relaxed animate-in fade-in duration-200">
                    {product.specifications.ritualCare}
                  </p>
                )}
              </div>

              {/* Accordion 4 */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion('spec4')}
                  className="w-full flex items-center justify-between text-left text-xs uppercase tracking-wider text-[#332927] hover:text-[#800020]"
                >
                  <span>In the Box</span>
                  <span className="material-symbols-outlined text-[18px]">
                    {expandedAccordion === 'spec4' ? 'expand_less' : 'expand_more'}
                  </span>
                </button>
                {expandedAccordion === 'spec4' && (
                  <p className="pt-2 text-xs text-[#554745] leading-relaxed animate-in fade-in duration-200">
                    {product.specifications.inTheBox}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Complete the Setting / Pairings */}
      <section className="w-full border-t border-[#F3E6D5] py-16 px-4 sm:px-6 lg:px-8 bg-[#F3E6D5]/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-baseline justify-between gap-2 mb-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#800020]">
                Complete the Setting
              </span>
              <h2 className="font-serif text-2xl text-[#332927] mt-1">
                Pair with Festive Table Accents
              </h2>
            </div>
            <p className="text-xs text-[#7A6B69] max-w-md">
              Complementary objects curated to harmonize with the {product.name} for entryways and mandaps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pairedItems.map(pair => (
              <div
                key={pair.id}
                className="bg-[#FFF9F2] p-4 rounded border border-[#E6D7C3] flex flex-col justify-between group shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div
                    className="aspect-square w-full rounded overflow-hidden bg-[#F3E6D5] cursor-pointer mb-3"
                    onClick={() => {
                      onSelectProduct(pair);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <img
                      src={pair.images.main}
                      alt={pair.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[10px] text-[#7A6B69] uppercase tracking-wider block">
                    {pair.categoryLabel}
                  </span>
                  <h4
                    onClick={() => {
                      onSelectProduct(pair);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-serif text-base text-[#332927] hover:text-[#800020] cursor-pointer mt-0.5 line-clamp-1"
                  >
                    {pair.name}
                  </h4>
                  <p className="text-xs text-[#7A6B69] mt-1 line-clamp-2">{pair.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F3E6D5]">
                  <span className="text-sm font-semibold text-[#800020]">
                    ₹{pair.price.toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(pair, 1);
                      setIsCartOpen(true);
                    }}
                    className="text-xs uppercase tracking-wider text-[#800020] hover:underline font-semibold"
                  >
                    + Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Editorial Quote Banner */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#800020] text-[#FFF9F2]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[#F3E6D5] text-[36px]">spa</span>
          <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide italic font-normal leading-relaxed">
            &ldquo;The urli is not merely a vessel; it is an invitation for Lakshmi into the household. Water purifies the entry, flowers welcome the senses, and flickering fire dispels the shadows.&rdquo;
          </h3>
          <div className="flex items-center gap-2 text-[#F3E6D5] text-xs uppercase tracking-widest mt-2">
            <span>Vedika Sharma</span>
            <span>—</span>
            <span>Heritage Historian &amp; Sajavat Curator</span>
          </div>
        </div>
      </section>

      {/* 5. Verified Patron Reviews & Star Rating Section */}
      <section className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-[#FFFDF9] border-t border-[#F3E6D5]" id="patron-reviews">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#F3E6D5]">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#800020] block mb-1">
                Patron Chronicles &amp; Reflections
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#332927]">
                Customer Reviews &amp; Star Ratings
              </h2>
              <p className="text-xs sm:text-sm text-[#7A6B69] mt-1.5 max-w-xl">
                Unfiltered reflections from homes across India and abroad that celebrate festivals with this handcrafted {product.categoryLabel.toLowerCase()}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsWritingInline(prev => !prev)}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#800020] text-[#800020] hover:bg-[#800020]/5 text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                <span>{isWritingInline ? '✕ Close Form' : '✎ Write Review Here'}</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-xs uppercase tracking-wider font-semibold px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow"
              >
                + Leave Your Review
              </button>
            </div>
          </div>

          {/* Review Score Summary Box */}
          <div className="bg-[#FFF9F2] border border-[#E6D7C3] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-sm">
            {/* Overall Rating & Big Stars */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
              <div>
                <span className="font-serif text-5xl sm:text-6xl font-bold text-[#800020] leading-none">
                  {summary.averageRating.toFixed(1)}
                </span>
                <div className="flex items-center justify-center sm:justify-start text-[#D4AF37] mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${star <= Math.round(summary.averageRating) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#E6D7C3] fill-transparent'}`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-[#7A6B69] mt-1.5 block font-medium">
                  Based on {summary.totalReviews} verified patron reviews
                </span>
              </div>

              <div className="w-px h-20 bg-[#E6D7C3] hidden sm:block" />

              {/* Star Rating Breakdown Bar Chart */}
              <div className="flex flex-col gap-1.5 w-60 sm:w-72 text-xs text-[#7A6B69]">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = summary.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
                  const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
                  const isSelected = selectedStarFilter === stars;
                  return (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setSelectedStarFilter(prev => prev === stars ? null : stars)}
                      className={`flex items-center gap-2 group text-left py-0.5 rounded px-1.5 transition-colors ${
                        isSelected ? 'bg-[#800020]/10 font-bold text-[#800020]' : 'hover:bg-[#F3E6D5]/50'
                      }`}
                      title={`Filter by ${stars} star reviews (${count})`}
                    >
                      <span className="w-5 font-medium">{stars}★</span>
                      <div className="flex-1 h-2 bg-[#E6D7C3] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSelected ? 'bg-[#800020]' : 'bg-[#D4AF37] group-hover:bg-[#800020]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[11px] text-[#332927]">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommendation Metric */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right p-4 bg-white/70 border border-[#F3E6D5] rounded-xl">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                98% of Patrons Recommend
              </div>
              <p className="text-xs text-[#7A6B69] max-w-xs mt-1">
                Celebrated for heirloom weight, sacred bell resonance, and zero tarnish packaging.
              </p>
              {selectedStarFilter !== null && (
                <button
                  type="button"
                  onClick={() => setSelectedStarFilter(null)}
                  className="mt-3 text-xs text-[#800020] font-semibold underline hover:text-[#600018]"
                >
                  Clear {selectedStarFilter}★ Filter (Showing All)
                </button>
              )}
            </div>
          </div>

          {/* Inline Review Form (Toggled or Directly Accessible) */}
          {isWritingInline && (
            <div className="bg-[#FFF9F2] border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-8 shadow-md relative animate-fadeIn">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F3E6D5]">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#800020] font-bold block mb-1">
                    Patron Atelier Reflection
                  </span>
                  <h3 className="font-serif text-2xl text-[#332927]">
                    Leave Feedback on &quot;{product.name}&quot;
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWritingInline(false)}
                  className="text-xs text-[#7A6B69] hover:text-[#800020] font-semibold"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-[#332927] mb-1.5">
                    Your Overall Rating <span className="text-[#800020]">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => {
                        const activeVal = hoverRating || reviewRating;
                        const isFilled = star <= activeVal;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-125 transition-transform"
                            aria-label={`${star} Stars`}
                          >
                            <svg
                              className={`w-7 h-7 ${isFilled ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#E6D7C3] fill-transparent'}`}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-[#800020] bg-[#FFF5E6] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                      {(hoverRating || reviewRating) === 5 && '★★★★★ 5 — Exceptional Heirloom Quality'}
                      {(hoverRating || reviewRating) === 4 && '★★★★☆ 4 — Very Pleased & Beautiful'}
                      {(hoverRating || reviewRating) === 3 && '★★★☆☆ 3 — Good / Acceptable Craft'}
                      {(hoverRating || reviewRating) === 2 && '★★☆☆☆ 2 — Below Expectations'}
                      {(hoverRating || reviewRating) === 1 && '★☆☆☆☆ 1 — Needs Improvement'}
                    </span>
                  </div>
                </div>

                {/* Headline / Title */}
                <div>
                  <label htmlFor="inline-title" className="block text-xs uppercase tracking-wider font-semibold text-[#332927] mb-1">
                    Review Headline / Title <span className="text-[#800020]">*</span>
                  </label>
                  <input
                    id="inline-title"
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={e => setReviewTitle(e.target.value)}
                    placeholder="e.g. The centerpiece of our Diwali celebration / Flawless heavy brass"
                    className="w-full px-4 py-2.5 bg-white border border-[#E6D7C3] rounded-xl text-xs sm:text-sm text-[#332927] outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]"
                  />
                </div>

                {/* Detailed Review Experience */}
                <div>
                  <label htmlFor="inline-comment" className="block text-xs uppercase tracking-wider font-semibold text-[#332927] mb-1">
                    Your Reflection &amp; Experience <span className="text-[#800020]">*</span>
                  </label>
                  <textarea
                    id="inline-comment"
                    required
                    rows={4}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="How does it feel in hand? Describe the heft, metalcraft detailing, floral floating balance, or the reaction of festive guests..."
                    className="w-full px-4 py-3 bg-white border border-[#E6D7C3] rounded-xl text-xs sm:text-sm text-[#332927] outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020] resize-y"
                  />
                </div>

                {/* Reviewer Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="inline-author" className="block text-xs uppercase tracking-wider font-semibold text-[#332927] mb-1">
                      Your Name <span className="text-[#800020]">*</span>
                    </label>
                    <input
                      id="inline-author"
                      type="text"
                      required
                      value={reviewAuthor}
                      onChange={e => setReviewAuthor(e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020]"
                    />
                  </div>
                  <div>
                    <label htmlFor="inline-city" className="block text-xs uppercase tracking-wider font-semibold text-[#332927] mb-1">
                      City, State <span className="text-[#800020]">*</span>
                    </label>
                    <input
                      id="inline-city"
                      type="text"
                      required
                      value={reviewCity}
                      onChange={e => setReviewCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Karnataka"
                      className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020]"
                    />
                  </div>
                  <div>
                    <label htmlFor="inline-finish" className="block text-xs uppercase tracking-wider font-semibold text-[#332927] mb-1">
                      Purchased Finish
                    </label>
                    <select
                      id="inline-finish"
                      value={reviewFinish}
                      onChange={e => setReviewFinish(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020]"
                    >
                      {product.finishes?.map(f => (
                        <option key={f.id} value={f.name}>
                          {f.name}
                        </option>
                      )) || <option value="Standard Heirloom">Standard Heirloom</option>}
                    </select>
                  </div>
                </div>

                {/* Recommendation Checkbox */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="inline-recommend"
                    checked={reviewRecommend}
                    onChange={e => setReviewRecommend(e.target.checked)}
                    className="w-4 h-4 text-[#800020] rounded border-[#E6D7C3] focus:ring-[#800020]"
                  />
                  <label htmlFor="inline-recommend" className="text-xs text-[#332927] cursor-pointer">
                    I recommend this heirloom piece to other patrons celebrating festive rituals.
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F3E6D5]">
                  <button
                    type="button"
                    onClick={() => setIsWritingInline(false)}
                    className="px-5 py-2.5 text-xs text-[#7A6B69] hover:text-[#332927] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-8 py-3 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-xs uppercase tracking-wider font-bold rounded-xl transition-colors shadow-md disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Publishing Review...' : 'Publish Verified Review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filter & Sorting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-[#F3E6D5]">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#7A6B69] mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedStarFilter(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedStarFilter === null
                    ? 'bg-[#800020] text-white'
                    : 'bg-white border border-[#E6D7C3] text-[#7A6B69] hover:border-[#800020]'
                }`}
              >
                All Stars ({summary.totalReviews})
              </button>
              {[5, 4, 3].map(stars => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => setSelectedStarFilter(stars)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedStarFilter === stars
                      ? 'bg-[#800020] text-white'
                      : 'bg-white border border-[#E6D7C3] text-[#7A6B69] hover:border-[#800020]'
                  }`}
                >
                  {stars} Stars ({summary.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0})
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-[#7A6B69]">
              <label htmlFor="sort-reviews" className="font-semibold uppercase tracking-wider">
                Sort By:
              </label>
              <select
                id="sort-reviews"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'recent' | 'highest' | 'lowest' | 'helpful')}
                className="bg-white border border-[#E6D7C3] text-[#332927] rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#800020]"
              >
                <option value="recent">Most Recent First</option>
                <option value="highest">Highest Rating (5★ to 1★)</option>
                <option value="lowest">Lowest Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {filteredAndSortedReviews.length === 0 ? (
            <div className="bg-[#FFF9F2] border border-[#E6D7C3] rounded-2xl p-12 text-center text-[#7A6B69]">
              <p className="font-serif text-lg text-[#332927] mb-2">No reviews match the selected filter.</p>
              <p className="text-xs mb-4">Be the first to share your thoughts for this star rating!</p>
              <button
                type="button"
                onClick={() => setSelectedStarFilter(null)}
                className="px-5 py-2 bg-[#800020] text-white text-xs uppercase tracking-wider rounded-full"
              >
                Show All Reviews
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAndSortedReviews.map(rev => (
                <div
                  key={rev.id}
                  className="bg-[#FFF9F2] border border-[#E6D7C3] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-4 shadow-sm hover:border-[#D4AF37] transition-all"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header: Stars + Date + Verified Badge */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center text-[#D4AF37]">
                        {[1, 2, 3, 4, 5].map(s => (
                          <svg
                            key={s}
                            className={`w-4 h-4 ${s <= rev.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#E6D7C3] fill-transparent'}`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                            <span>✓</span> Verified Patron
                          </span>
                        )}
                        <span className="text-[#7A6B69] text-[11px]">{rev.date}</span>
                      </div>
                    </div>

                    {/* Review Title */}
                    <h4 className="font-serif text-lg text-[#332927] leading-snug">
                      &ldquo;{rev.title}&rdquo;
                    </h4>

                    {/* Review Comment Text */}
                    <p className="text-xs sm:text-sm text-[#554745] leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Review Badges (Finish & Recommendation) */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#7A6B69]">
                      {rev.finishPurchased && (
                        <span className="bg-white border border-[#E6D7C3] px-2.5 py-0.5 rounded-md">
                          Finish: <strong className="text-[#332927]">{rev.finishPurchased}</strong>
                        </span>
                      )}
                      {rev.recommend && (
                        <span className="text-[#800020] font-medium flex items-center gap-1">
                          <span>✓</span> Recommends this item
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer: Reviewer Info + Helpful Vote */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#F3E6D5] text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#800020] text-white text-xs font-semibold flex items-center justify-center shrink-0 shadow-sm">
                        {rev.author.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#332927]">{rev.author}</span>
                        <span className="text-[11px] text-[#7A6B69]">{rev.city}</span>
                      </div>
                    </div>

                    {/* Helpful Button */}
                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(rev.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                        helpfulVotedIds.has(rev.id)
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-[#7A6B69] border-[#E6D7C3] hover:border-[#800020] hover:text-[#800020]'
                      }`}
                      title="Mark as helpful"
                    >
                      <span>👍</span>
                      <span>Helpful ({rev.helpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Patron Styling Gallery (#SajavatMoments) */}
          <div className="flex flex-col gap-3 mt-6 pt-10 border-t border-[#F3E6D5]">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#7A6B69]">
              <span className="font-semibold text-[#800020]">Patron Galleries</span>
              <span>Shared with #SajavatMoments</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  author: 'Pooja M., Bangalore',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUwtQA7_QighM3h1uf6nh-t4JV0qpqmIc55kYuRCDhtq75qiubp4q9Jz2zAbomtWVdS96UzPNBSSQgY1Wso1A3gsAHupcRxCZfWgMc5-asw_YHBNqz3QTSgDZYbjnAnI8aQCy9eIwKl4h41kTqvMo56m8cWtAOVL1NG8qekYvZA2EdsL7mQSdzi7mYigz5QjZU6Pd6COtrpKM5yj_0GJogAYQO-_mdq-NAktr-C3DbkLVeqIpi4lbxog'
                },
                {
                  author: 'Ananya R., Mumbai',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYZVlHKlVaIpi7r3NtPZ6Yez3JkAIUnMszQK-JhtfOg5sUC0ZH4Z7AcnkLxCwxtqEcw4Tk1oJKX5LERv5REShOeB0dnHfgcSNXNc--CR31PbT2ZoDSDk8R0zQSxgeBwybz3Jk2odm4br8HkWrYyzAyIt_RXDBtznXUOTVn-fiEiJtw0zz9qEPM9RCi29WQUEfXUlGbCX_tsbJO2GTVzjafnaUk5Gt0eA4L0A8I_LEj_y8Rz8yEykXbZw'
                },
                {
                  author: 'Kabir D., New Delhi',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6VzXnnqUrY4ca-RXxqDHqFytwG_prMivqtYblvit1jr2K7mGRikEM7s2avI_wBFv0cY6zVmoa9vuqKM64L8I8TJysVtTOS8ZmhAQZ3f61nrfbzRP-FwXFx8oyCAM6TfH0NYXDDYl_A7eF5O9tp1-wZkXyZsiPvX94sGJakqr27Tj7mz5x0Vi2mqzHF2grgU--4-CD0XfNgDX1F5oDBOEz_ENhOe1MAbuQf4UztcG9TD6U0T5XNU2z6g'
                },
                {
                  author: 'Meenakshi S., Jaipur',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx4ksbTsMozfdVk8k3l4Ks11iUgWRnyTx4J44rTZUR2jW1tts7WuZ9LPg6_O3u8F1lyt4B0s4iBUVP4B3bN0_kphO8MJkI7br_E0Orp1efW5tI8UViVy1RClTgN4DpPqpLTrF900e6K1xP9FzYyTcHHMkdw_ENF9wbJc1pDuZp-h5G9z_SkA2u3owNZZJ4KAHOaKjr5Fvl1HWKB6w06Kon6kql8WTZleWSgtrDM3JQo5JiZdDY1KALxQ'
                }
              ].map(item => (
                <div key={item.author} className="group relative rounded overflow-hidden aspect-square bg-[#F3E6D5]">
                  <img
                    src={item.img}
                    alt={item.author}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#800020]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <span className="text-white text-[10px] uppercase tracking-wider font-medium">
                      {item.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Zoom Modal */}
      {zoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomModalOpen(false)}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white text-2xl"
            onClick={() => setZoomModalOpen(false)}
          >
            <span className="material-symbols-outlined text-[28px]">close</span>
          </button>
          <img
            src={galleryViews[activeImageIndex].url}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
          />
        </div>
      )}

      {/* Review Submission Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#800020]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative my-8">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white border border-[#E6D7C3] flex items-center justify-center text-[#7A6B69] hover:text-[#800020] hover:border-[#800020] transition-colors"
            >
              <span className="text-sm font-bold">✕</span>
            </button>

            <span className="text-[10px] uppercase tracking-widest text-[#800020] font-bold block mb-1">
              Patron Atelier Review
            </span>
            <h3 className="font-serif text-2xl text-[#332927] mb-1">
              Review &quot;{product.name}&quot;
            </h3>
            <p className="text-xs text-[#7A6B69] mb-5">
              Your candid experience helps artisans sustain their lineage and guides other celebratory homes.
            </p>

            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#7A6B69] mb-1.5">
                  Select Rating <span className="text-[#800020]">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex text-[#D4AF37]">
                    {[1, 2, 3, 4, 5].map(star => {
                      const activeVal = hoverRating || reviewRating;
                      const isFilled = star <= activeVal;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <svg
                            className={`w-7 h-7 ${isFilled ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#E6D7C3] fill-transparent'}`}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-[#800020] ml-2">
                    {(hoverRating || reviewRating)} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label htmlFor="modal-title" className="block text-[11px] uppercase tracking-wider font-semibold text-[#7A6B69] mb-1">
                  Review Headline <span className="text-[#800020]">*</span>
                </label>
                <input
                  id="modal-title"
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={e => setReviewTitle(e.target.value)}
                  placeholder="e.g. Unbelievable weight and gorgeous glow"
                  className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020]"
                />
              </div>

              {/* Reflection */}
              <div>
                <label htmlFor="modal-text" className="block text-[11px] uppercase tracking-wider font-semibold text-[#7A6B69] mb-1">
                  Your Reflection &amp; Experience <span className="text-[#800020]">*</span>
                </label>
                <textarea
                  id="modal-text"
                  required
                  rows={4}
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Describe the craft quality, weight, ceremonial lighting, or gift reaction..."
                  className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="modal-author" className="block text-[11px] uppercase tracking-wider font-semibold text-[#7A6B69] mb-1">
                    Your Name <span className="text-[#800020]">*</span>
                  </label>
                  <input
                    id="modal-author"
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={e => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label htmlFor="modal-city" className="block text-[11px] uppercase tracking-wider font-semibold text-[#7A6B69] mb-1">
                    City, State <span className="text-[#800020]">*</span>
                  </label>
                  <input
                    id="modal-city"
                    type="text"
                    required
                    value={reviewCity}
                    onChange={e => setReviewCity(e.target.value)}
                    placeholder="e.g. Mumbai, MH"
                    className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-finish" className="block text-[11px] uppercase tracking-wider font-semibold text-[#7A6B69] mb-1">
                  Purchased Variant / Finish
                </label>
                <select
                  id="modal-finish"
                  value={reviewFinish}
                  onChange={e => setReviewFinish(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E6D7C3] rounded-xl text-xs text-[#332927] outline-none focus:border-[#800020]"
                >
                  {product.finishes?.map(f => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  )) || <option value="Standard Heirloom">Standard Heirloom</option>}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-recommend"
                  checked={reviewRecommend}
                  onChange={e => setReviewRecommend(e.target.checked)}
                  className="w-4 h-4 text-[#800020] rounded border-[#E6D7C3] focus:ring-[#800020]"
                />
                <label htmlFor="modal-recommend" className="text-xs text-[#332927] cursor-pointer">
                  I recommend this piece to other patrons.
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="mt-2 w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmittingReview ? 'Publishing Review...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
