import React, { useState } from 'react';
import { Order } from '../types';
import { useCart } from '../context/CartContext';
import { SajavatLogo } from '../components/SajavatLogo';

interface OrderConfirmationPageProps {
  order: Order;
  setCurrentView: (view: string) => void;
  onSelectCategory?: (category: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  setCurrentView,
  onSelectCategory,
}) => {
  const { showToast } = useCart();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTracking(true);
    showToast('Waybill tracking number copied to clipboard');
    setTimeout(() => setCopiedTracking(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] pt-8 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Celebration Header */}
        <div className="bg-white rounded-3xl border border-[#F2E8DC] p-8 md:p-12 shadow-sm text-center mb-8 relative overflow-hidden">
          {/* Subtle gold ornamentation background */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#D4AF37] via-[#800020] to-[#D4AF37]" />
          
          <div className="mb-6 flex justify-center">
            <SajavatLogo variant="badge" size="lg" showTagline={true} />
          </div>

          <div className="inline-block px-4 py-1 rounded-full bg-[#800020]/10 text-[#800020] text-xs font-semibold uppercase tracking-widest mb-3">
            Payment & Ritual Order Confirmed
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#332927] mb-3">
            Thank You, {order.customer.fullName}
          </h1>
          <p className="text-[#6E615D] text-base max-w-xl mx-auto leading-relaxed">
            Your artisanal heirloom order has been securely processed and sent to our Moradabad master crafters for bespoke packaging and ritual blessing.
          </p>

          {/* Quick summary badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#F2E8DC] text-left">
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#A89F91]">Order Number</span>
              <span className="font-mono text-sm font-semibold text-[#800020]">{order.orderNumber}</span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#A89F91]">Date</span>
              <span className="text-sm font-medium text-[#332927]">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#A89F91]">Payment Status</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {order.payment.status === 'cod_verified' ? 'COD Verified' : 'Paid & Captured'}
              </span>
            </div>
            <div>
              <span className="block text-xs uppercase tracking-wider text-[#A89F91]">Est. Delivery</span>
              <span className="text-sm font-semibold text-[#800020]">{order.shipping.estimatedDelivery}</span>
            </div>
          </div>
        </div>

        {/* Live Tracking & Carrier Card */}
        <div className="bg-white rounded-3xl border border-[#F2E8DC] p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2E8DC]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
                Live Fulfillment Status
              </span>
              <h2 className="font-serif text-2xl text-[#332927]">BlueDart Express Premium Transit</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-[#FFF9F2] border border-[#E8DCB8] rounded-xl px-3 py-1.5 font-mono text-xs text-[#332927]">
                Waybill: {order.shipping.waybillNumber}
              </div>
              <button
                onClick={() => copyToClipboard(order.shipping.waybillNumber)}
                className="p-2 border border-[#E8DCB8] rounded-xl hover:bg-[#FFF5E6] text-[#800020] transition-colors text-xs"
                title="Copy tracking code"
              >
                {copiedTracking ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="relative mt-8">
            <div className="absolute top-5 left-4 right-4 sm:left-6 sm:right-6 h-0.5 bg-[#F2E8DC] -z-0" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {order.trackingTimeline.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 text-xs font-bold transition-all ${
                      item.completed
                        ? 'bg-[#800020] border-[#800020] text-white shadow-md'
                        : item.current
                        ? 'bg-[#D4AF37] border-[#800020] text-[#800020] animate-bounce'
                        : 'bg-white border-[#E8DCB8] text-[#A89F91]'
                    }`}
                  >
                    {item.completed ? '✓' : idx + 1}
                  </div>
                  <h4 className="font-medium text-xs sm:text-sm text-[#332927] mb-1">{item.step}</h4>
                  <p className="text-[11px] text-[#A89F91] leading-tight max-w-[130px]">{item.description}</p>
                  <span className="text-[10px] text-[#D4AF37] font-mono mt-1">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#FFF9F2] rounded-2xl border border-[#F2E8DC] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6E615D] gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base">📱</span>
              <span>
                Dispatch tracking alerts will be dispatched via SMS & WhatsApp to <strong>+91 {order.customer.phone}</strong>
              </span>
            </div>
            <span className="text-[#800020] font-medium">Safe Fragile Transit Guarantee</span>
          </div>
        </div>

        {/* Two-Column: Order Details & Address Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Purchased Items List (2 columns) */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-[#F2E8DC] p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-xl text-[#332927] mb-6 pb-4 border-b border-[#F2E8DC]">
              Artisanal Articles Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h3>

            <div className="divide-y divide-[#F2E8DC]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl border border-[#F2E8DC] bg-[#FFF9F2] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base text-[#332927] truncate">{item.name}</h4>
                    {item.finish && (
                      <span className="inline-block text-xs text-[#A89F91] mt-0.5">
                        Finish: {item.finish}
                      </span>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-[#6E615D]">Qty: {item.quantity}</span>
                      {item.giftWrap && (
                        <span className="text-[11px] px-2 py-0.5 bg-[#FFF5E6] text-[#800020] rounded-full border border-[#D4AF37]/30">
                          Velvet Ribbon Gift Box
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-semibold text-base text-[#332927]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[11px] text-[#A89F91]">
                      ₹{item.price.toLocaleString('en-IN')} ea
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="mt-8 pt-6 border-t border-[#F2E8DC] space-y-2 text-sm text-[#6E615D]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.pricing.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Special Discount {order.pricing.couponApplied ? `(${order.pricing.couponApplied})` : ''}</span>
                  <span>-₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.pricing.giftWrapTotal > 0 && (
                <div className="flex justify-between">
                  <span>Velvet Box Gift Wrapping</span>
                  <span>₹{order.pricing.giftWrapTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Insured White-Glove Shipping</span>
                <span>{order.pricing.shippingCost === 0 ? 'Complimentary' : `₹${order.pricing.shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-xs text-[#A89F91]">
                <span>Integrated GST (18% included)</span>
                <span>₹{order.pricing.estimatedGstIncluded.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-[#F2E8DC] text-lg font-bold text-[#800020]">
                <span>Total Amount</span>
                <span>₹{order.pricing.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment details (1 column) */}
          <div className="space-y-6">
            {/* Delivery address */}
            <div className="bg-white rounded-3xl border border-[#F2E8DC] p-6 shadow-sm">
              <h3 className="font-serif text-lg text-[#332927] mb-3 pb-3 border-b border-[#F2E8DC]">
                Delivery Destination
              </h3>
              <p className="font-semibold text-sm text-[#332927]">{order.customer.fullName}</p>
              <p className="text-xs text-[#6E615D] mt-1 leading-relaxed">
                {order.customer.address}
                {order.customer.landmark ? `, Near ${order.customer.landmark}` : ''}
                <br />
                {order.customer.city}, {order.customer.state} — {order.customer.pincode}
              </p>
              <div className="mt-3 pt-3 border-t border-[#F2E8DC] text-xs text-[#6E615D] space-y-1">
                <p>📞 +91 {order.customer.phone}</p>
                <p>✉️ {order.customer.email}</p>
              </div>
            </div>

            {/* Payment security seal */}
            <div className="bg-white rounded-3xl border border-[#F2E8DC] p-6 shadow-sm">
              <h3 className="font-serif text-lg text-[#332927] mb-3 pb-3 border-b border-[#F2E8DC]">
                Payment Verification
              </h3>
              <div className="space-y-2 text-xs text-[#6E615D]">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold uppercase text-[#800020]">{order.payment.method}</span>
                </div>
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono text-[#332927]">{order.payment.transactionId}</span>
                  </div>
                )}
                {order.payment.utrNumber && (
                  <div className="flex justify-between">
                    <span>Bank UTR:</span>
                    <span className="font-mono text-[#332927]">{order.payment.utrNumber}</span>
                  </div>
                )}
                {order.payment.cardLast4 && (
                  <div className="flex justify-between">
                    <span>Card:</span>
                    <span>•••• {order.payment.cardLast4} ({order.payment.cardBrand || 'RuPay'})</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-[#A89F91] pt-2 border-t border-[#F2E8DC]">
                  <span>Gateway Cryptographic Seal:</span>
                  <span className="font-mono">{order.payment.verificationHash.slice(0, 16)}...</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-800 text-xs">
                <span>🛡️</span>
                <span>256-Bit Encrypted Sajavat Gateway Verification Complete</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handlePrint}
                className="w-full py-3.5 px-4 bg-white border border-[#D4AF37] text-[#800020] rounded-2xl font-semibold text-xs tracking-wider uppercase hover:bg-[#FFF5E6] transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>🖨️</span> Print Official Tax Invoice
              </button>
              <button
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('all');
                  setCurrentView('shop');
                }}
                className="w-full py-3.5 px-4 bg-[#800020] text-white rounded-2xl font-semibold text-xs tracking-wider uppercase hover:bg-[#600018] transition-colors shadow-md"
              >
                Explore More Festive Collections →
              </button>
            </div>
          </div>
        </div>

        {/* Gift Note (if present) */}
        {order.gift.isGift && order.gift.handwrittenNote && (
          <div className="bg-[#FFF5E6] rounded-3xl border border-[#D4AF37]/50 p-6 sm:p-8 text-center max-w-2xl mx-auto mb-8 shadow-inner">
            <span className="text-xs uppercase tracking-widest text-[#800020] font-semibold block mb-2">
              Bespoke Handwritten Calligraphy Message
            </span>
            <p className="font-serif italic text-lg text-[#332927] mb-2 leading-relaxed">
              "{order.gift.handwrittenNote}"
            </p>
            <span className="text-xs text-[#A89F91]">
              For {order.gift.recipient || 'Beloved Recipient'} • Hand-sealed on gold-foiled cardstock
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
