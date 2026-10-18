import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { SajavatLogo } from '../components/SajavatLogo';
import { SiteSettings } from '../types';

interface ContactPageProps {
  setCurrentView: (view: string) => void;
  onSelectCategory?: (category: string) => void;
  initialTab?: 'form' | 'care' | 'shipping' | 'returns' | 'faqs';
  siteSettings?: SiteSettings;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  setCurrentView,
  onSelectCategory,
  initialTab = 'form',
  siteSettings
}) => {
  const { showToast, setIsOrderLookupOpen } = useCart();

  const [activeTab, setActiveTab] = useState<'form' | 'care' | 'shipping' | 'returns' | 'faqs'>(initialTab);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<FormState | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Sync tab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.phone.trim() && !/^[+0-9\s()-]{8,18}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 5) {
      newErrors.message = 'Please provide at least 5 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      showToast('Please check the required fields highlighted below.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          message: formData.message.trim(),
          subject: 'Concierge Inquiry',
          preferredMethod: 'email'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry. Please try again.');
      }

      setSubmittedReference(data.referenceId);
      setSubmittedData({ ...formData });
      setSubmitError(null);
      showToast(data.message || `Inquiry received! Reference #${data.referenceId}`);
      window.scrollTo({ top: 250, behavior: 'smooth' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to connect to the atelier server. Please try again.';
      setSubmitError(errorMsg);
      showToast(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setErrors({});
    setSubmitError(null);
    setSubmittedReference(null);
    setSubmittedData(null);
  };

  const handleCopyReference = () => {
    if (submittedReference) {
      navigator.clipboard.writeText(submittedReference);
      setCopiedRef(true);
      showToast(`Copied #${submittedReference}`);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] pt-6 sm:pt-10 pb-24 text-[#332927]">
      {/* Editorial Header Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8 sm:mb-12">
        <div className="mb-4 flex justify-center">
          <SajavatLogo variant="badge" size="md" showTagline={false} />
        </div>
        <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2">
          Atelier Concierge
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#332927] mb-3 leading-tight">
          We Are Here to Assist You
        </h1>
        <p className="text-sm sm:text-base text-[#6E615D] max-w-xl mx-auto leading-relaxed">
          For styling guidance, festive curations, custom gifting, or order inquiries, reach out to our team.
        </p>
      </div>

      {/* Clean Minimalist Tabs Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-10">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1 sm:gap-2 p-1.5 bg-[#F5EFE6] rounded-full border border-[#E8DFD5] max-w-fit mx-auto">
          {[
            { id: 'form', label: 'Contact Us' },
            { id: 'care', label: 'Care Guide' },
            { id: 'shipping', label: 'Shipping & Delivery' },
            { id: 'returns', label: 'Transit & Breakage' },
            { id: 'faqs', label: 'FAQs' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as 'form' | 'care' | 'shipping' | 'returns' | 'faqs')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#800020] text-white shadow-sm'
                  : 'text-[#6E615D] hover:text-[#332927] hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TAB 1: FORM & CONCIERGE CHANNELS */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: The Form or Success State */}
            {/* Left 7 Cols: The Form or Success State */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EDE3D6] p-7 sm:p-10 shadow-sm">
              {submittedReference && submittedData ? (
                /* SUCCESS STATE */
                <div className="text-center py-6 sm:py-8">
                  <div className="w-14 h-14 rounded-full bg-[#FFF5E6] border border-[#D4AF37] flex items-center justify-center mx-auto mb-4 text-[#800020]">
                    <span className="material-symbols-outlined text-2xl">check</span>
                  </div>

                  <span className="text-[11px] font-semibold tracking-widest uppercase text-[#D4AF37] block mb-1">
                    Message Received
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-2">
                    Thank You, {submittedData.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E615D] max-w-md mx-auto mb-6 leading-relaxed">
                    Your inquiry has been received. Our concierge team will review your message and reply to <strong className="text-[#332927]">{submittedData.email}</strong> shortly.
                  </p>

                  {/* Reference Badge Card */}
                  <div className="bg-[#FAF7F2] border border-[#EADBCC] rounded-2xl p-4 mb-8 max-w-sm mx-auto flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-[#8C7E7A] block">Reference Number</span>
                      <span className="font-mono font-semibold text-[#800020] text-sm">{submittedReference}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyReference}
                      className="px-3 py-1.5 rounded-lg border border-[#D4AF37] text-[#800020] hover:bg-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      {copiedRef ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full sm:w-auto px-6 py-2.5 border border-[#800020] text-[#800020] hover:bg-[#800020]/5 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory('all');
                        setCurrentView('shop');
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#800020] text-[#FFF9F2] hover:bg-[#600018] rounded-xl text-xs font-medium uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                    >
                      Return to Shop
                    </button>
                  </div>
                </div>
              ) : (
                /* CLEAN, PREMIUM INQUIRY FORM */
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="mb-6">
                    <h2 className="font-serif text-2xl text-[#332927] mb-1.5">
                      Send a Message
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7A6E6A]">
                      Fill out the fields below and we will respond as soon as possible.
                    </p>
                  </div>

                  {/* Submission Error Alert */}
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-800">
                      <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                        error
                      </span>
                      <p className="text-red-700 leading-relaxed">{submitError}</p>
                    </div>
                  )}

                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-[#4A3E3B] mb-1.5">
                        Full Name <span className="text-[#800020]">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, name: e.target.value }));
                          if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FCFBF9] border rounded-xl outline-none transition-all ${
                          errors.name
                            ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                            : 'border-[#E6DDD3] focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-[#4A3E3B] mb-1.5">
                        Email Address <span className="text-[#800020]">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, email: e.target.value }));
                          if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FCFBF9] border rounded-xl outline-none transition-all ${
                          errors.email
                            ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                            : 'border-[#E6DDD3] focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10'
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-medium text-[#4A3E3B] mb-1.5">
                      Phone / WhatsApp <span className="text-[#A69792] text-[11px] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, phone: e.target.value }));
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                      }}
                      className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FCFBF9] border rounded-xl outline-none transition-all ${
                        errors.phone
                          ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-[#E6DDD3] focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Row 3: Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-medium text-[#4A3E3B] mb-1.5">
                      Your Message <span className="text-[#800020]">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, message: e.target.value }));
                        if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                      }}
                      className={`w-full p-4 text-xs sm:text-sm bg-[#FCFBF9] border rounded-xl outline-none transition-all resize-y leading-relaxed ${
                        errors.message
                          ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-[#E6DDD3] focus:border-[#800020] focus:bg-white focus:ring-2 focus:ring-[#800020]/10'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button & Subtext */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-3 px-8 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <span className="material-symbols-outlined text-[17px]">send</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-[#8C7E7A]">
                      Typical response within 4 hours
                    </span>
                  </div>
                </form>
              )}
            </div>

            {/* Right 5 Cols: Unified Atelier Concierge Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-[#EDE3D6] p-7 sm:p-8 shadow-sm space-y-6">
                <div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-[#D4AF37] block mb-1">
                    Direct Assistance
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#332927]">
                    Atelier Concierge
                  </h3>
                  <p className="text-xs text-[#7A6E6A] mt-1 leading-relaxed">
                    Our team is available for styling guidance, bridal hampers, and order inquiries.
                  </p>
                </div>

                {/* WhatsApp Quick Channel */}
                <a
                  href={siteSettings?.socialWhatsapp || 'https://wa.me/919811234567'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FBF8F3] hover:bg-[#F5EFE6] border border-[#EADBCC] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#332927] block group-hover:text-[#800020] transition-colors">
                        WhatsApp Concierge
                      </span>
                      <span className="text-[11px] text-[#7A6E6A]">
                        {siteSettings?.contactPhone || '+91 98112 34567'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                    Chat
                  </span>
                </a>

                {/* Direct Touchpoints List */}
                <div className="space-y-4 pt-2 border-t border-[#F0E6D8]">
                  {/* Email */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF9F2] border border-[#EADBCC] flex items-center justify-center text-[#800020] shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A69792] block">
                        Email
                      </span>
                      <a
                        href={`mailto:${siteSettings?.contactEmail || 'concierge@sajavat.com'}`}
                        className="text-xs sm:text-sm font-medium text-[#800020] hover:underline"
                      >
                        {siteSettings?.contactEmail || 'concierge@sajavat.com'}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF9F2] border border-[#EADBCC] flex items-center justify-center text-[#800020] shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A69792] block">
                        Helpline
                      </span>
                      <a
                        href={`tel:${(siteSettings?.contactPhone || '+91 98112 34567').replace(/[^0-9+]/g, '')}`}
                        className="text-xs sm:text-sm font-medium text-[#332927] hover:text-[#800020]"
                      >
                        {siteSettings?.contactPhone || '+91 98112 34567'}
                      </a>
                      <p className="text-[11px] text-[#8C7E7A] mt-0.5">
                        Mon – Sat: 9:30 AM – 7:30 PM IST
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-3.5 pt-2 border-t border-[#F0E6D8]">
                    <div className="w-9 h-9 rounded-xl bg-[#FFF9F2] border border-[#EADBCC] flex items-center justify-center text-[#800020] shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                    <div className="text-xs text-[#7A6E6A]">
                      <strong className="text-[#332927] block font-medium">Flagship Atelier &amp; Foundry</strong>
                      <span>{siteSettings?.contactAddress || 'Sajavat Atelier, 14 Heritage Lane, Moradabad, UP 244001'}</span>
                    </div>
                  </div>
                </div>

                {/* Subtle Order Track Action */}
                <div className="pt-4 border-t border-[#F0E6D8] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-[#332927] block">Have an active order?</span>
                    <span className="text-[11px] text-[#8C7E7A]">Check live dispatch checkpoints</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOrderLookupOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#800020] text-[#800020] hover:bg-[#800020]/5 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Track Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRASS & CANDLE CARE GUIDE */}
        {activeTab === 'care' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 sm:p-12 shadow-sm">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#800020] block mb-2">
                Heirloom Longevity
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-4">
                The Sacred Care of Virgin Bell-Metal &amp; Cast Brass
              </h2>
              <p className="text-sm text-[#6E615D] leading-relaxed mb-8">
                Pure Indian brass is alive. Over weeks of burning oils and exposure to festive air, it naturally gathers a gentle golden oxidation known as patina. To preserve or revive its mirror-gold brilliance, we honor ancient organic rituals rather than abrasive synthetic chemicals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#F2E8DC]">
                <div className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#F2E8DC]">
                  <div className="flex items-center gap-2 mb-2 text-[#800020] font-semibold text-sm">
                    <span className="material-symbols-outlined text-[20px]">spa</span>
                    <span>The Organic Tamarind Ritual</span>
                  </div>
                  <p className="text-xs text-[#6E615D] leading-relaxed">
                    Knead soaked wet tamarind pulp with a pinch of rock salt. Gently rub across the chiseled engravings of your urli or diya. Allow it to sit for 3 minutes, then rinse with lukewarm water and buff dry immediately with a clean flannel cloth.
                  </p>
                </div>

                <div className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#F2E8DC]">
                  <div className="flex items-center gap-2 mb-2 text-[#800020] font-semibold text-sm">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <span>What to Strictly Avoid</span>
                  </div>
                  <p className="text-xs text-[#6E615D] leading-relaxed">
                    Never use steel wool, abrasive scouring pads, or dishwasher cycles. Avoid chlorine bleach or harsh industrial toilet cleaners, which cause irreversible pitting and strip the protective lacquer finish.
                  </p>
                </div>
              </div>
            </div>

            {/* Candle Care */}
            <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 sm:p-12 shadow-sm">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#D4AF37] block mb-2">
                Botanical Living
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-4">
                Memory Burn &amp; Candle Care
              </h2>
              <div className="space-y-4 text-sm text-[#6E615D] leading-relaxed">
                <p>
                  Our candles are poured with 100% farm-sourced cold-pressed soy wax and unbleached cotton wicks. Soy wax has a &ldquo;memory&rdquo; that dictates every subsequent burn.
                </p>
                <ul className="space-y-3 list-disc pl-5 text-xs text-[#6E615D]">
                  <li>
                    <strong className="text-[#332927]">The First Burn is Crucial:</strong> On your first lighting, allow the candle to burn for 2 to 3 consecutive hours until the wax pool liquefies completely to the edges of the jar. This prevents tunneling.
                  </li>
                  <li>
                    <strong className="text-[#332927]">Trim the Wick:</strong> Always trim the charred wick tip to approximately 5mm before re-lighting. This ensures a clean, steady flame and zero dark soot on your walls or brass lanterns.
                  </li>
                  <li>
                    <strong className="text-[#332927]">Extinguishing with Dignity:</strong> Snuff the flame using a bell snuffer or dip the wick gently into the liquid wax pool with a tool before straightening it, preventing lingering smoke in your sacred prayer room.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SHIPPING & DELIVERY */}
        {activeTab === 'shipping' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 sm:p-12 shadow-sm">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#800020] block mb-2">
                Pan-India Logistics
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-4">
                Festive Shipping &amp; White-Glove Packaging
              </h2>
              <p className="text-sm text-[#6E615D] leading-relaxed mb-6">
                We understand the reverence of festive preparations. Every heirloom parcel leaves our Jaipur and Moradabad studios cushioned in 5-ply shock-absorbing honeycomb Kraft paper and biodegradable cornstarch peanuts.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-[#F2E8DC]">
                <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC]">
                  <strong className="text-[#332927] font-serif block text-sm mb-1">Metros &amp; Tier 1</strong>
                  <span className="text-xs text-[#800020] font-semibold block mb-2">2 – 4 Business Days</span>
                  <p className="text-[11px] text-[#6E615D]">Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad.</p>
                </div>

                <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC]">
                  <strong className="text-[#332927] font-serif block text-sm mb-1">Rest of India</strong>
                  <span className="text-xs text-[#800020] font-semibold block mb-2">4 – 6 Business Days</span>
                  <p className="text-[11px] text-[#6E615D]">Covering over 28,000 PIN codes via Bluedart Apex and Delhivery Priority Surface.</p>
                </div>

                <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC]">
                  <strong className="text-[#332927] font-serif block text-sm mb-1">Complimentary Shipping</strong>
                  <span className="text-xs text-[#800020] font-semibold block mb-2">All Orders Over ₹1,999</span>
                  <p className="text-[11px] text-[#6E615D]">Orders under ₹1,999 incur a flat nominal courier charge of ₹150 pan-India.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RETURNS & EXCHANGES */}
        {activeTab === 'returns' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 sm:p-12 shadow-sm">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#800020] block mb-2">
                Peace of Mind
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-4">
                Transit Safety &amp; Damage Protection
              </h2>
              <p className="text-sm text-[#6E615D] leading-relaxed mb-6">
                Every artisanal brass urli, diya, and handcrafted décor heirloom is securely packed in reinforced, damage-resistant materials. In the rare event of transit mishandling, our concierge handles it with immediate priority.
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-[#6E615D]">
                <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC]">
                  <strong className="text-[#332927] block mb-1">1. Transit Damage or Breakage Assistance</strong>
                  <p className="text-xs leading-relaxed">
                    If any artifact arrives with transit damage, simply WhatsApp or email our concierge upon delivery with photographs of the packaging and affected piece. Our team will verify and resolve it promptly with white-glove support.
                  </p>
                </div>

                <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC]">
                  <strong className="text-[#332927] block mb-1">2. Handcrafted Variations are Natural</strong>
                  <p className="text-xs leading-relaxed">
                    Please note that slight hammer marks, chiseled indentations, and subtle tonal nuances on virgin brass are the authentic signatures of hand-casting by our master guild craftsmen, rather than industrial defects.
                  </p>
                </div>

                <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC]">
                  <strong className="text-[#332927] block mb-1">3. Custom &amp; Bespoke Engravings</strong>
                  <p className="text-xs leading-relaxed">
                    Customized bulk orders, corporate engraved pieces, or bespoke wedding favors are non-returnable once crafted, except in cases of transit damage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FAQS */}
        {activeTab === 'faqs' && (
          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                q: 'Are Sajavat brass items made from solid virgin brass?',
                a: 'Yes, 100%. We never dilute our bell-metal with cheap scrap aluminum or thin sheet metal. Our urlis and diyas are heavy, solid castings sculpted using the traditional lost-wax or sand-casting techniques in Moradabad.'
              },
              {
                q: 'Can I request customized corporate gift hampers for Diwali or weddings?',
                a: 'Certainly! Our atelier curates bespoke velvet-lined wooden gift boxes with custom laser engravings, brass thalis, hand-dipped saffron incense, and personalized handwritten calligraphy notes. Minimum order quantity is 25 sets.'
              },
              {
                q: 'Do you offer Cash on Delivery (COD)?',
                a: 'Yes. COD is supported across all serviceable Indian pin codes for orders up to ₹10,000. For security and fraud prevention, we verify orders via a quick 4-digit SMS OTP upon checkout.'
              },
              {
                q: 'Are your botanical candles safe for children and pets?',
                a: 'Our candles are free from petroleum paraffin, synthetic phthalates, lead wicks, and synthetic dyes. They burn clean with non-toxic soy wax and therapeutic-grade botanical oils.'
              },
              {
                q: 'How can I track my order once it ships?',
                a: 'As soon as your shipment is dispatched, you will receive an SMS and email with live tracking details. You can also click "Track Order" in the footer or top navigation at any time to enter your order number.'
              }
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-[#F2E8DC] p-5 shadow-sm transition-all"
              >
                <summary className="font-serif text-base text-[#332927] cursor-pointer flex items-center justify-between list-none font-medium">
                  <span>{faq.q}</span>
                  <span className="material-symbols-outlined text-[20px] text-[#800020] group-open:rotate-180 transition-transform">
                    expand_more
                  </span>
                </summary>
                <p className="text-xs sm:text-sm text-[#6E615D] mt-3 pt-3 border-t border-[#F2E8DC] leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
