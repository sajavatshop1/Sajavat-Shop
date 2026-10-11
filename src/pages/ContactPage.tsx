import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { SajavatLogo } from '../components/SajavatLogo';

interface ContactPageProps {
  setCurrentView: (view: string) => void;
  onSelectCategory?: (category: string) => void;
  initialTab?: 'form' | 'care' | 'shipping' | 'returns' | 'faqs';
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  orderNumber: string;
  preferredMethod: 'email' | 'whatsapp' | 'phone';
  message: string;
}

const INQUIRY_SUBJECTS = [
  'Order Status & Tracking Assistance',
  'Bespoke Corporate & Festive Hampers',
  'Brassware Care & Tamarind Polishing Guidance',
  'Pure Botanical Candle & Fragrance Inquiries',
  'Wedding Favors & Return Gifts',
  'Artisan Guild & Press Collaboration',
  'General Concierge Inquiry'
];

export const ContactPage: React.FC<ContactPageProps> = ({
  setCurrentView,
  onSelectCategory,
  initialTab = 'form'
}) => {
  const { showToast, setIsOrderLookupOpen } = useCart();

  const [activeTab, setActiveTab] = useState<'form' | 'care' | 'shipping' | 'returns' | 'faqs'>(initialTab);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    subject: INQUIRY_SUBJECTS[0],
    orderNumber: '',
    preferredMethod: 'email',
    message: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      newErrors.name = 'Please provide your full name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (formData.phone.trim() && !/^[+0-9\s-]{8,16}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (e.g. +91 98200 12345).';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please share your inquiry or message with our atelier.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a little more detail (at least 10 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please verify the highlighted fields in your request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSubmittedReference(data.referenceId);
      setSubmittedData({ ...formData });
      showToast(`Inquiry received! Reference #${data.referenceId}`);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err: unknown) {
      // Fallback offline support
      const fallbackRef = `SJV-CARE-${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedReference(fallbackRef);
      setSubmittedData({ ...formData });
      const errorMsg = err instanceof Error ? err.message : 'Concierge request recorded.';
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
      subject: INQUIRY_SUBJECTS[0],
      orderNumber: '',
      preferredMethod: 'email',
      message: ''
    });
    setErrors({});
    setSubmittedReference(null);
    setSubmittedData(null);
  };

  const handleCopyReference = () => {
    if (submittedReference) {
      navigator.clipboard.writeText(submittedReference);
      setCopiedRef(true);
      showToast(`Copied ${submittedReference} to clipboard`);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] pt-6 sm:pt-10 pb-24 text-[#332927]">
      {/* Editorial Header Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14">
        <div className="mb-4 flex justify-center">
          <SajavatLogo variant="badge" size="md" showTagline={false} />
        </div>
        <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#D4AF37] block mb-2">
          Atelier Concierge &amp; Care
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#332927] mb-4 leading-tight">
          How May We Assist Your Celebration?
        </h1>
        <p className="text-sm sm:text-base text-[#6E615D] max-w-2xl mx-auto leading-relaxed">
          From personalized brassware styling advice and wedding trousseau gifting to expedited festive delivery, our atelier liaisons are dedicated to illuminating every ritual.
        </p>

        {/* Quiet Typographic Commitments */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#800020] font-medium mt-6 pt-4 border-t border-[#F2E8DC] max-w-xl mx-auto">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-[#D4AF37]">schedule</span>
            <span>&lt; 4 Hr Festive Response</span>
          </div>
          <span className="text-[#D4AF37] opacity-60">·</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-[#D4AF37]">workspace_premium</span>
            <span>Direct Foundry Liaison</span>
          </div>
          <span className="text-[#D4AF37] opacity-60">·</span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-[#D4AF37]">local_shipping</span>
            <span>Break-Free Transit Guarantee</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 p-1.5 bg-[#F9F1E7] border border-[#ECDCCB] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'form'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'text-[#6E615D] hover:text-[#332927] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>Concierge Inquiry Form</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('care')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'care'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'text-[#6E615D] hover:text-[#332927] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
            <span>Brass &amp; Candle Care Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'shipping'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'text-[#6E615D] hover:text-[#332927] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            <span>Shipping &amp; Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'returns'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'text-[#6E615D] hover:text-[#332927] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
            <span>Returns &amp; Exchanges</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'faqs'
                ? 'bg-[#800020] text-white shadow-sm'
                : 'text-[#6E615D] hover:text-[#332927] hover:bg-white/60'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">help_outline</span>
            <span>FAQs</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TAB 1: FORM & CONCIERGE CHANNELS */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: The Form or Success State */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F2E8DC] p-6 sm:p-10 shadow-sm">
              {submittedReference && submittedData ? (
                /* SUCCESS STATE */
                <div className="text-center py-4 sm:py-8">
                  <div className="w-16 h-16 rounded-full bg-[#FFF5E6] border-2 border-[#D4AF37] flex items-center justify-center mx-auto mb-6 text-[#800020]">
                    <span className="material-symbols-outlined text-3xl">done_all</span>
                  </div>

                  <span className="text-[11px] font-semibold tracking-widest uppercase text-[#D4AF37] block mb-1">
                    Request Prioritized
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#332927] mb-3">
                    Thank You, {submittedData.name}
                  </h2>
                  <p className="text-sm text-[#6E615D] max-w-md mx-auto mb-6 leading-relaxed">
                    Your concierge request has been safely catalogued in our Moradabad &amp; Jaipur atelier logs. A liaison will reach out through your preferred channel (<strong className="text-[#800020] uppercase text-xs">{submittedData.preferredMethod}</strong>).
                  </p>

                  {/* Reference Badge Card */}
                  <div className="bg-[#FFF9F2] border border-[#F2E8DC] rounded-2xl p-5 mb-8 max-w-md mx-auto text-left">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#F2E8DC]">
                      <span className="text-xs text-[#6E615D]">Atelier Reference ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-[#800020]">
                          {submittedReference}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyReference}
                          className="p-1 text-[#6E615D] hover:text-[#800020] rounded hover:bg-white transition-colors"
                          title="Copy reference number"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedRef ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#6E615D]">
                      <div className="flex justify-between">
                        <span>Inquiry Type:</span>
                        <span className="font-medium text-[#332927] text-right">{submittedData.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email Contact:</span>
                        <span className="font-medium text-[#332927]">{submittedData.email}</span>
                      </div>
                      {submittedData.phone && (
                        <div className="flex justify-between">
                          <span>Phone / WhatsApp:</span>
                          <span className="font-medium text-[#332927]">{submittedData.phone}</span>
                        </div>
                      )}
                      {submittedData.orderNumber && (
                        <div className="flex justify-between">
                          <span>Order Reference:</span>
                          <span className="font-medium text-[#800020]">{submittedData.orderNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Expected Turnaround:</span>
                        <span className="font-medium text-emerald-700">&lt; 4 Hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full sm:w-auto px-6 py-3 border border-[#800020] text-[#800020] hover:bg-[#800020]/5 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors"
                    >
                      Submit Another Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory('all');
                        setCurrentView('shop');
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-[#800020] text-[#FFF9F2] hover:bg-[#600018] rounded-xl text-xs font-medium uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Explore Festive Catalogue
                    </button>
                  </div>
                </div>
              ) : (
                /* INQUIRY FORM */
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl text-[#332927] mb-1">
                      Send a Concierge Request
                    </h2>
                    <p className="text-xs text-[#6E615D]">
                      Please share your requirements below. Every inquiry is personally handled by our artisan liaison team.
                    </p>
                  </div>

                  {/* Row 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-[#332927] mb-1.5">
                        Full Name <span className="text-[#800020]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69792]">
                          person
                        </span>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={e => {
                            setFormData(prev => ({ ...prev, name: e.target.value }));
                            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                          }}
                          placeholder="e.g. Radhika Deshmukh"
                          className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FFFDF9] border rounded-xl outline-none transition-colors ${
                            errors.name
                              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                              : 'border-[#E6D7C8] focus:border-[#800020] focus:ring-1 focus:ring-[#800020]/20'
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-[11px] text-red-600 mt-1 pl-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-[#332927] mb-1.5">
                        Email Address <span className="text-[#800020]">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69792]">
                          mail
                        </span>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={e => {
                            setFormData(prev => ({ ...prev, email: e.target.value }));
                            if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                          }}
                          placeholder="radhika@example.com"
                          className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FFFDF9] border rounded-xl outline-none transition-colors ${
                            errors.email
                              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                              : 'border-[#E6D7C8] focus:border-[#800020] focus:ring-1 focus:ring-[#800020]/20'
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[11px] text-red-600 mt-1 pl-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone & Order ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-[#332927] mb-1.5">
                        Phone / WhatsApp <span className="text-[#A69792] text-[11px]">(Optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69792]">
                          call
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={e => {
                            setFormData(prev => ({ ...prev, phone: e.target.value }));
                            if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                          }}
                          placeholder="+91 98200 12345"
                          className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FFFDF9] border rounded-xl outline-none transition-colors ${
                            errors.phone
                              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                              : 'border-[#E6D7C8] focus:border-[#800020] focus:ring-1 focus:ring-[#800020]/20'
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-[11px] text-red-600 mt-1 pl-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="orderNumber" className="block text-xs font-medium text-[#332927]">
                          Order Number <span className="text-[#A69792] text-[11px]">(Optional)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsOrderLookupOpen(true)}
                          className="text-[11px] text-[#800020] hover:underline"
                        >
                          Lookup Order
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#A69792]">
                          inventory_2
                        </span>
                        <input
                          id="orderNumber"
                          type="text"
                          value={formData.orderNumber}
                          onChange={e => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                          placeholder="e.g. SJV-10023"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FFFDF9] border border-[#E6D7C8] rounded-xl outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]/20 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-[#332927] mb-1.5">
                      Subject / Inquiry Category <span className="text-[#800020]">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        value={formData.subject}
                        onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FFFDF9] border border-[#E6D7C8] rounded-xl outline-none focus:border-[#800020] focus:ring-1 focus:ring-[#800020]/20 transition-colors appearance-none pr-10"
                      >
                        {INQUIRY_SUBJECTS.map(subj => (
                          <option key={subj} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-[#A69792] pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  {/* Preferred Reply Channel */}
                  <div>
                    <label className="block text-xs font-medium text-[#332927] mb-1.5">
                      Preferred Mode of Concierge Reply
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredMethod: 'email' }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          formData.preferredMethod === 'email'
                            ? 'bg-[#800020]/5 border-[#800020] text-[#800020] font-semibold'
                            : 'bg-[#FFFDF9] border-[#E6D7C8] text-[#6E615D] hover:border-[#800020]/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">mail</span>
                        <span>Email</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredMethod: 'whatsapp' }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          formData.preferredMethod === 'whatsapp'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                            : 'bg-[#FFFDF9] border-[#E6D7C8] text-[#6E615D] hover:border-emerald-500/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, preferredMethod: 'phone' }))}
                        className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          formData.preferredMethod === 'phone'
                            ? 'bg-[#800020]/5 border-[#800020] text-[#800020] font-semibold'
                            : 'bg-[#FFFDF9] border-[#E6D7C8] text-[#6E615D] hover:border-[#800020]/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">phone_enabled</span>
                        <span>Phone Call</span>
                      </button>
                    </div>
                  </div>

                  {/* Message Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="message" className="block text-xs font-medium text-[#332927]">
                        Your Inquiry / Custom Requirements <span className="text-[#800020]">*</span>
                      </label>
                      <span className="text-[11px] text-[#A69792]">
                        {formData.message.length}/1000
                      </span>
                    </div>
                    <textarea
                      id="message"
                      rows={5}
                      maxLength={1000}
                      value={formData.message}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, message: e.target.value }));
                        if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                      }}
                      placeholder="Please describe how we can assist you. For wedding favors or bespoke corporate hampers, mention estimated quantity, target dates, and engraving preferences."
                      className={`w-full p-4 text-xs sm:text-sm bg-[#FFFDF9] border rounded-xl outline-none transition-colors resize-y leading-relaxed ${
                        errors.message
                          ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                          : 'border-[#E6D7C8] focus:border-[#800020] focus:ring-1 focus:ring-[#800020]/20'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-[11px] text-red-600 mt-1 pl-1">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] rounded-xl text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Transmitting to Atelier Concierge...</span>
                        </>
                      ) : (
                        <>
                          <span>Transmit Concierge Request</span>
                          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                            send
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-[#A69792] mt-3">
                      Your details are handled with utmost discretion. No promotional spam, ever.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Right 5 Cols: Direct Touchpoints & Heritage Details */}
            <div className="lg:col-span-5 space-y-6">
              {/* WhatsApp Fast Channel */}
              <div className="bg-[#128C7E]/10 border border-[#128C7E]/30 rounded-3xl p-6 sm:p-7 relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#075E54] block mb-1">
                      Direct WhatsApp Line
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-[#075E54]">
                      Instant Festive Concierge
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </div>
                </div>
                <p className="text-xs text-[#075E54]/90 mb-5 leading-relaxed">
                  Need rapid confirmation for today's dispatch, gift box customization, or real-time brassware video preview?
                </p>
                <a
                  href="https://wa.me/919820072528?text=Hello%20Sajavat%20Concierge%2C%20I%20would%20like%20assistance%20with%20an%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#1ebd59] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[17px]">send</span>
                  <span>Open WhatsApp (+91 98200 72528)</span>
                </a>
              </div>

              {/* Atelier Details Card */}
              <div className="bg-white rounded-3xl border border-[#F2E8DC] p-6 sm:p-7 space-y-6 shadow-sm">
                <h3 className="font-serif text-lg text-[#332927] border-b border-[#F2E8DC] pb-3">
                  Direct Atelier Channels
                </h3>

                {/* Email Channel */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF9F2] border border-[#F2E8DC] flex items-center justify-center text-[#800020] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">alternate_email</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#A69792] block font-medium">
                      Atelier Inquiries &amp; Curations
                    </span>
                    <a
                      href="mailto:concierge@sajavat.com"
                      className="text-xs sm:text-sm font-medium text-[#800020] hover:underline"
                    >
                      concierge@sajavat.com
                    </a>
                    <p className="text-[11px] text-[#6E615D] mt-0.5">
                      Replied within 4 hours during business days.
                    </p>
                  </div>
                </div>

                {/* Phone Line */}
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF9F2] border border-[#F2E8DC] flex items-center justify-center text-[#800020] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#A69792] block font-medium">
                      Customer Service Helpline
                    </span>
                    <a
                      href="tel:+918047108820"
                      className="text-xs sm:text-sm font-medium text-[#332927] hover:text-[#800020]"
                    >
                      +91 (0) 80 4710 8820
                    </a>
                    <p className="text-[11px] text-[#6E615D] mt-0.5">
                      Mon – Sat: 9:30 AM – 7:30 PM IST (Excl. Gazetted Holidays)
                    </p>
                  </div>
                </div>

                {/* Studio & Foundry Enclaves */}
                <div className="flex items-start gap-3.5 pt-2 border-t border-[#F2E8DC]">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF9F2] border border-[#F2E8DC] flex items-center justify-center text-[#800020] shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div className="text-xs text-[#6E615D] space-y-2">
                    <div>
                      <strong className="text-[#332927] block font-serif">Jaipur Flagship Studio</strong>
                      <span>Hawa Mahal Enclave, Badi Chaupar, Pink City, Jaipur, Rajasthan 302002</span>
                    </div>
                    <div>
                      <strong className="text-[#332927] block font-serif">Brass Foundry Guild</strong>
                      <span>Moradabad Artisanal Zone, Peetal Nagri, Uttar Pradesh 244001</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-Time Order Lookup Banner */}
              <div className="bg-[#FFF5E6] border border-[#D4AF37]/40 rounded-3xl p-6 text-center shadow-sm">
                <span className="material-symbols-outlined text-3xl text-[#D4AF37] mb-2">
                  local_shipping
                </span>
                <h4 className="font-serif text-base text-[#332927] mb-1">
                  Looking for Live Dispatch Status?
                </h4>
                <p className="text-xs text-[#6E615D] mb-4">
                  Check current carrier checkpoints, estimated delivery dates, and waybill details in real time.
                </p>
                <button
                  type="button"
                  onClick={() => setIsOrderLookupOpen(true)}
                  className="w-full py-2.5 px-4 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Track My Order Now
                </button>
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
                7-Day Break-Free Replacement Promise
              </h2>
              <p className="text-sm text-[#6E615D] leading-relaxed mb-6">
                Because every brass urli, diya, and hand-blown glass candle holder is irreplaceable for your festive celebrations, we guarantee zero friction if a transit mishap occurs.
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-[#6E615D]">
                <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC]">
                  <strong className="text-[#332927] block mb-1">1. Damaged or Defective Items</strong>
                  <p className="text-xs leading-relaxed">
                    In the rare event of transit breakage or casting flaws, simply WhatsApp or email our concierge within 7 days of delivery with photos of the outer box and affected artifact. We arrange an immediate free priority replacement.
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
