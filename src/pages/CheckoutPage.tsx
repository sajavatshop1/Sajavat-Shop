import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Product, Order } from '../types';
import { SajavatLogo } from '../components/SajavatLogo';

interface CheckoutPageProps {
  allProducts: Product[];
  onOrderSuccess: (order: Order) => void;
  setCurrentView: (view: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  allProducts,
  onOrderSuccess,
  setCurrentView
}) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    toggleGiftWrap,
    subtotal,
    discount,
    giftWrapTotal,
    shippingCost,
    total,
    coupon,
    applyCoupon,
    shippingSpeed,
    setShippingSpeed,
    addToCart,
    clearCart,
    showToast,
    setActiveOrderId
  } = useCart();

  // Recipient & Address Details form state
  const [fullName, setFullName] = useState('Aarav Mehra');
  const [email, setEmail] = useState('aarav.mehra@atelier-studio.in');
  const [phone, setPhone] = useState('+91 98201 44829');
  const [address, setAddress] = useState('Flat 402, Mayfair Palms, 18th Road, Khar West');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400052');
  const [landmark, setLandmark] = useState('Near Khar Gymkhana');

  // Gift options
  const [isGift, setIsGift] = useState(true);
  const [giftRecipient, setGiftRecipient] = useState('Rohit & Ananya Verma');
  const [giftOccasion, setGiftOccasion] = useState('Housewarming & Deepotsav Blessings');
  const [handwrittenNote, setHandwrittenNote] = useState(
    'May your lovely new abode shine with joy, serenity, and golden warmth! With all our affection, Aarav & Meera.'
  );

  // Promo code
  const [promoInput, setPromoInput] = useState('FESTIVE15');
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');

  // Gateway Modal States
  const [processingOrder, setProcessingOrder] = useState(false);
  const [activeGatewayModal, setActiveGatewayModal] = useState<'upi' | 'card' | 'card3ds' | 'netbanking' | 'codOtp' | null>(null);

  // Gateway Session Data
  const [gatewayOrderId, setGatewayOrderId] = useState<string | null>(null);
  const [gatewayOrderNumber, setGatewayOrderNumber] = useState<string | null>(null);
  const [upiUri, setUpiUri] = useState<string | null>(null);
  const [upiTimer, setUpiTimer] = useState(300); // 5 min countdown

  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4532 8920 1840 9204');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardHolder, setCardHolder] = useState('Aarav Mehra');
  const [cardChallengeId, setCardChallengeId] = useState<string | null>(null);
  const [card3dsOtp, setCard3dsOtp] = useState('');
  const [cardBankName, setCardBankName] = useState('HDFC Bank');
  const [cardMaskedNumber, setCardMaskedNumber] = useState('•••• •••• •••• 9204');
  const [cardError, setCardError] = useState('');

  // Netbanking bank
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // COD OTP
  const [codOtp, setCodOtp] = useState('');
  const [codTestOtp, setCodTestOtp] = useState('');
  const [codMaskedPhone, setCodMaskedPhone] = useState('');
  const [codError, setCodError] = useState('');

  const handleApplyCoupon = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    await applyCoupon(promoInput);
    setApplyingPromo(false);
  };

  // Step 1: Create Order in Gateway and open relevant modal
  const handleInitiatePayment = async () => {
    if (cart.length === 0) {
      showToast('Your bag is empty.');
      return;
    }

    if (!fullName || !email || !phone || !address || !pincode) {
      showToast('Please complete all delivery address fields.');
      return;
    }

    setProcessingOrder(true);

    try {
      const orderPayload = {
        customer: {
          fullName,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          landmark
        },
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          finish: item.finish,
          price: item.product.price,
          quantity: item.quantity,
          giftWrap: item.giftWrap,
          image: item.product.images.main
        })),
        shippingSpeed,
        isGift,
        giftDetails: isGift
          ? {
              recipient: giftRecipient,
              occasion: giftOccasion,
              handwrittenNote
            }
          : undefined,
        couponCode: coupon?.code
      };

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        throw new Error('Failed to create order session.');
      }

      const data = await res.json();
      setGatewayOrderId(data.orderId);
      setGatewayOrderNumber(data.orderNumber);
      setActiveOrderId(data.orderId);

      // Route to chosen gateway method
      if (paymentMethod === 'upi') {
        setUpiUri(data.upi.uri);
        setActiveGatewayModal('upi');
        setUpiTimer(300);
      } else if (paymentMethod === 'card') {
        setActiveGatewayModal('card');
      } else if (paymentMethod === 'netbanking') {
        setActiveGatewayModal('netbanking');
      } else if (paymentMethod === 'cod') {
        // Send COD SMS OTP
        const otpRes = await fetch('/api/payment/send-cod-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.orderId, phone })
        });
        const otpData = await otpRes.json();
        setCodTestOtp(otpData.testOtp || '1234');
        setCodMaskedPhone(otpData.maskedPhone || phone);
        setActiveGatewayModal('codOtp');
      }
    } catch {
      showToast('Error connecting to payment gateway. Please check details.');
    } finally {
      setProcessingOrder(false);
    }
  };

  // UPI payment confirmation
  const handleConfirmUpi = async (appUsed = 'Google Pay') => {
    if (!gatewayOrderId) return;
    try {
      const res = await fetch('/api/payment/verify-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: gatewayOrderId, appUsed })
      });
      const data = await res.json();
      if (data.success) {
        // Fetch confirmed order
        const orderRes = await fetch(`/api/orders/${gatewayOrderId}`);
        const confirmedOrder: Order = await orderRes.json();
        clearCart();
        setActiveGatewayModal(null);
        showToast('Payment confirmed! Order placed successfully.');
        onOrderSuccess(confirmedOrder);
      }
    } catch {
      showToast('Unable to verify UPI payment. Please try again.');
    }
  };

  // Card Process -> Initiate 3DS
  const handleProcessCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayOrderId) return;
    setCardError('');

    try {
      const res = await fetch('/api/payment/process-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: gatewayOrderId,
          cardNumber,
          cardExpiry,
          cardCvv,
          cardHolder
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCardError(data.error || 'Card processing failed.');
        return;
      }

      if (data.requires3DS) {
        setCardChallengeId(data.challengeId);
        setCardBankName(data.bankName);
        setCardMaskedNumber(data.maskedCard);
        setCard3dsOtp(data.testOtp || '123456');
        setActiveGatewayModal('card3ds');
      }
    } catch {
      setCardError('Network error connecting to card network.');
    }
  };

  // 3DS OTP Complete
  const handleComplete3DS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardChallengeId || !gatewayOrderId) return;

    try {
      const res = await fetch('/api/payment/complete-3ds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: cardChallengeId,
          otp: card3dsOtp
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCardError(data.error || 'Authentication failed.');
        return;
      }

      const orderRes = await fetch(`/api/orders/${gatewayOrderId}`);
      const confirmedOrder: Order = await orderRes.json();
      clearCart();
      setActiveGatewayModal(null);
      showToast('Card authenticated! Order confirmed.');
      onOrderSuccess(confirmedOrder);
    } catch {
      setCardError('Authentication service unavailable.');
    }
  };

  // Net Banking Complete
  const handleCompleteNetBanking = async () => {
    if (!gatewayOrderId) return;
    try {
      const res = await fetch('/api/payment/netbanking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: gatewayOrderId,
          bankCode: selectedBank
        })
      });
      const data = await res.json();
      if (data.success) {
        const orderRes = await fetch(`/api/orders/${gatewayOrderId}`);
        const confirmedOrder: Order = await orderRes.json();
        clearCart();
        setActiveGatewayModal(null);
        showToast('Netbanking transaction cleared!');
        onOrderSuccess(confirmedOrder);
      }
    } catch {
      showToast('Netbanking verification failed.');
    }
  };

  // COD OTP Complete
  const handleVerifyCodOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayOrderId) return;
    setCodError('');

    try {
      const res = await fetch('/api/payment/verify-cod-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: gatewayOrderId,
          otp: codOtp
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setCodError(data.error || 'Invalid OTP');
        return;
      }

      const orderRes = await fetch(`/api/orders/${gatewayOrderId}`);
      const confirmedOrder: Order = await orderRes.json();
      clearCart();
      setActiveGatewayModal(null);
      showToast('Mobile verified! Order confirmed for Cash on Delivery.');
      onOrderSuccess(confirmedOrder);
    } catch {
      setCodError('Verification failed. Please retry.');
    }
  };

  // Harmonize Your Festive Altar pairings (matching bottom of Image 5)
  const pairedSuggestions = allProducts
    .filter(p => ['ghee-phool-wicks', 'kannauj-mogra-mist', 'brass-matchbox-sleeve', 'dhoop-daan-censer'].includes(p.id))
    .slice(0, 4);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Ritual Checkout Header Bar */}
      <section className="w-full bg-[#FFF9F2] pt-8 pb-4 px-4 sm:px-6 lg:px-8 border-b border-[#F3E6D5]">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SajavatLogo variant="badge" size="sm" showTagline={false} />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] block mb-0.5">
                  Secure Ritual Checkout
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl text-[#332927] font-normal">
                  Shopping Bag &amp; Concierge
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs tracking-wider">
              <span className="text-[#800020] font-semibold border-b-2 border-[#800020] pb-0.5">
                01. Bag
              </span>
              <span className="text-[#E6D7C3]">—</span>
              <span className="text-[#800020] font-semibold border-b-2 border-[#800020] pb-0.5">
                02. Shipping
              </span>
              <span className="text-[#E6D7C3]">—</span>
              <span className="text-[#800020] font-semibold border-b-2 border-[#800020] pb-0.5">
                03. Payment
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-[#7A6B69]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#800020] text-[18px]">
                local_shipping
              </span>
              <span>Complimentary Express Shipping on orders over ₹2,999 across India.</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-[#332927] font-semibold">
                {subtotal >= 2999 ? 'Unlocked' : 'In Progress'}
              </span>
              <div className="w-28 h-1.5 bg-[#E6D7C3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#800020] rounded-full"
                  style={{ width: `${Math.min(100, Math.round((subtotal / 2999) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Checkout Form & Summary Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column (7 cols): Selected Items & Delivery Details */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">
            {/* Selected Items */}
            <div className="flex flex-col gap-6">
              <div className="flex items-baseline justify-between pb-3 border-b border-[#F3E6D5]">
                <div className="flex items-baseline gap-2">
                  <h2 className="font-serif text-xl text-[#332927]">Selected Items</h2>
                  <span className="text-xs uppercase tracking-wider text-[#7A6B69]">
                    ({cart.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentView('shop')}
                  className="text-xs text-[#7A6B69] hover:text-[#800020] underline"
                >
                  Continue Exploring
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-10 text-center text-[#7A6B69]">
                  <p className="font-serif text-base text-[#332927]">Your bag has no items.</p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('shop')}
                    className="mt-3 px-6 py-2 bg-[#800020] text-white text-xs uppercase tracking-wider font-semibold"
                  >
                    Explore Catalogue
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <article
                    key={`${item.product.id}-${item.finish || 'def'}`}
                    className="flex flex-col sm:flex-row gap-4 items-start py-4 border-b border-[#F3E6D5] group"
                  >
                    <div className="w-full sm:w-28 h-36 rounded overflow-hidden bg-[#F3E6D5] shrink-0">
                      <img
                        src={item.product.images.main}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex flex-col flex-1 justify-between h-full gap-2">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#7A6B69] block">
                            {item.product.categoryLabel}
                          </span>
                          <h3 className="font-serif text-lg text-[#332927] mt-0.5 leading-snug">
                            {item.product.name}
                          </h3>
                          {item.finish && (
                            <p className="text-xs text-[#7A6B69] mt-0.5">Finish: {item.finish}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-base font-semibold text-[#800020]">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-[#7A6B69]">
                              ₹{item.product.price.toLocaleString('en-IN')} each
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center border border-[#E6D7C3] rounded">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.finish, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#7A6B69] hover:bg-[#F3E6D5]/50"
                          >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                          </button>
                          <span className="w-7 text-center text-xs font-semibold text-[#332927]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.finish, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#7A6B69] hover:bg-[#F3E6D5]/50"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-[#7A6B69]">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id, item.finish)}
                            className="hover:text-red-700 underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Lokta Gift Wrap Row */}
                      <label className="flex items-center gap-2 pt-2 text-xs text-[#554745] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.giftWrap}
                          onChange={() => toggleGiftWrap(item.product.id, item.finish)}
                          className="w-3.5 h-3.5 accent-[#800020]"
                        />
                        <span>Artisanal Lokta gift wrap</span>
                        {subtotal >= 2999 ? (
                          <span className="text-[11px] text-[#800020] font-semibold italic">
                            (Complimentary Bonus)
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#7A6B69]">(+₹150)</span>
                        )}
                      </label>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Recipient & Address Details */}
            <div className="flex flex-col gap-6 pt-2">
              <div className="flex items-baseline justify-between pb-3 border-b border-[#F3E6D5]">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] block">
                    Delivery
                  </span>
                  <h2 className="font-serif text-xl text-[#332927]">
                    Recipient &amp; Address Details
                  </h2>
                </div>
                <span className="text-xs text-[#800020] font-medium">
                  Verified Address Profile
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label htmlFor="checkout-full-name" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    Full Name *
                  </label>
                  <input
                    id="checkout-full-name"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="Priyadarshini Rao"
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="checkout-email" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    Email Address (For Tax Invoice &amp; Updates) *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="name@domain.com"
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="checkout-phone" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    WhatsApp / Mobile (For Live Waybill Tracking) *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label htmlFor="checkout-street-address" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    Street Address *
                  </label>
                  <input
                    id="checkout-street-address"
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    placeholder="House/Flat number, building name, street"
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="checkout-city" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    required
                    placeholder="Mumbai"
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="checkout-state" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    State *
                  </label>
                  <select
                    id="checkout-state"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020] cursor-pointer"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Telangana">Telangana</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="checkout-pincode" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    PIN Code *
                  </label>
                  <input
                    id="checkout-pincode"
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="400052"
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="checkout-landmark" className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                    Landmark (Optional)
                  </label>
                  <input
                    id="checkout-landmark"
                    type="text"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    placeholder="e.g. Near Khar Gymkhana"
                    className="w-full bg-transparent border-b border-[#E6D7C3] py-2 text-sm text-[#332927] outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              {/* Shipping Speed Radios */}
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                  Shipping Speed
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                      shippingSpeed === 'express'
                        ? 'border-[#800020] bg-[#F3E6D5]/30'
                        : 'border-[#E6D7C3] hover:border-[#800020]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping-speed"
                      checked={shippingSpeed === 'express'}
                      onChange={() => setShippingSpeed('express')}
                      className="mt-1 accent-[#800020]"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#332927]">
                          Express Courier
                        </span>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#800020]">
                          {subtotal >= 2999 ? 'Free' : '₹150'}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7A6B69] mt-0.5">
                        2–4 business days · Insured air transit
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-colors ${
                      shippingSpeed === 'priority'
                        ? 'border-[#800020] bg-[#F3E6D5]/30'
                        : 'border-[#E6D7C3] hover:border-[#800020]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping-speed"
                      checked={shippingSpeed === 'priority'}
                      onChange={() => setShippingSpeed('priority')}
                      className="mt-1 accent-[#800020]"
                    />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#332927]">
                          Next-Day Priority
                        </span>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-[#7A6B69]">
                          +₹250
                        </span>
                      </div>
                      <span className="text-[11px] text-[#7A6B69] mt-0.5">
                        Guaranteed for Metro cities
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Gift Order Options */}
              <div className="pt-3 border-t border-[#F3E6D5] flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={e => setIsGift(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[#800020]"
                  />
                  <span className="text-xs font-semibold text-[#332927]">
                    This order is a gift
                  </span>
                  <span className="text-[11px] text-[#7A6B69]">
                    (Conceal prices &amp; include artisanal note)
                  </span>
                </label>

                {isGift && (
                  <div className="flex flex-col gap-3 pt-1 bg-[#F3E6D5]/20 p-4 rounded border border-[#E6D7C3] animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="gift-recipient" className="block text-[10px] uppercase tracking-wider text-[#7A6B69] mb-1">
                          Recipient
                        </label>
                        <input
                          id="gift-recipient"
                          type="text"
                          value={giftRecipient}
                          onChange={e => setGiftRecipient(e.target.value)}
                          placeholder="Recipient's Name"
                          className="w-full bg-white border border-[#E6D7C3] py-1.5 px-2.5 text-xs text-[#332927] outline-none focus:border-[#800020] rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="gift-occasion" className="block text-[10px] uppercase tracking-wider text-[#7A6B69] mb-1">
                          Occasion
                        </label>
                        <input
                          id="gift-occasion"
                          type="text"
                          value={giftOccasion}
                          onChange={e => setGiftOccasion(e.target.value)}
                          placeholder="e.g. Diwali Blessings / Housewarming"
                          className="w-full bg-white border border-[#E6D7C3] py-1.5 px-2.5 text-xs text-[#332927] outline-none focus:border-[#800020] rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="gift-note" className="block text-[10px] uppercase tracking-wider text-[#7A6B69] mb-1">
                        Handwritten Note (Penned on Lokta Parchment)
                      </label>
                      <textarea
                        id="gift-note"
                        rows={2}
                        value={handwrittenNote}
                        onChange={e => setHandwrittenNote(e.target.value)}
                        placeholder="Personal festive message..."
                        className="w-full bg-white border border-[#E6D7C3] py-1.5 px-2.5 text-xs text-[#332927] outline-none focus:border-[#800020] rounded resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (4-5 cols, sticky): Order Summary & Payment Gateway Selector */}
          <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 sticky top-28 bg-[#FFF9F2] p-6 rounded border border-[#E6D7C3] shadow-sm">
            <div className="border-b border-[#F3E6D5] pb-2">
              <h2 className="font-serif text-xl text-[#332927]">Order Summary</h2>
            </div>

            {/* Promo Code Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Promotion Code"
                  className="w-full uppercase bg-transparent border-b border-[#E6D7C3] py-1 text-xs text-[#332927] outline-none focus:border-[#800020]"
                />
                <button
                  type="button"
                  disabled={applyingPromo}
                  onClick={handleApplyCoupon}
                  className="text-[#800020] hover:text-[#332927] text-[11px] uppercase tracking-wider font-semibold transition-colors disabled:opacity-50"
                >
                  {applyingPromo ? 'Checking' : 'Apply'}
                </button>
              </div>

              {coupon && (
                <span className="text-[11px] text-[#800020] italic">
                  {coupon.message}
                </span>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="flex flex-col gap-2 text-xs text-[#7A6B69]">
              <div className="flex justify-between items-center">
                <span>Bag Subtotal</span>
                <span className="text-[#332927]">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-[#800020] font-medium">
                  <span>Festive Savings ({coupon?.discountPercentage}%)</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {giftWrapTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span>Artisanal Lokta Wrap</span>
                  <span className="text-[#332927]">₹{giftWrapTotal.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Estimated GST (18% Included)</span>
                <span className="text-[#332927]">
                  ₹{Math.round((total * 18) / 118).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="text-[#332927]">
                  {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                </span>
              </div>

              <div className="border-t border-[#F3E6D5] pt-3 mt-1 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#332927]">Total</span>
                <span className="font-serif text-2xl text-[#800020] font-normal">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] uppercase tracking-wider text-[#7A6B69] font-semibold">
                Payment Gateway Mode
              </span>

              <div className="flex flex-col gap-1.5 text-xs">
                {/* 1. UPI */}
                <label
                  className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-[#800020] bg-[#F3E6D5]/40'
                      : 'border-[#E6D7C3] hover:border-[#800020]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#800020]"
                    />
                    <span className="font-medium text-[#332927]">UPI &amp; QR Instant Pay</span>
                  </div>
                  <span className="text-[10px] text-[#7A6B69] font-medium">GPay, PhonePe, Paytm</span>
                </label>

                {/* 2. Cards */}
                <label
                  className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-[#800020] bg-[#F3E6D5]/40'
                      : 'border-[#E6D7C3] hover:border-[#800020]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="accent-[#800020]"
                    />
                    <span className="font-medium text-[#332927]">Cards (Visa, RuPay, Amex)</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#7A6B69]">
                    credit_card
                  </span>
                </label>

                {/* 3. Net Banking */}
                <label
                  className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                    paymentMethod === 'netbanking'
                      ? 'border-[#800020] bg-[#F3E6D5]/40'
                      : 'border-[#E6D7C3] hover:border-[#800020]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'netbanking'}
                      onChange={() => setPaymentMethod('netbanking')}
                      className="accent-[#800020]"
                    />
                    <span className="font-medium text-[#332927]">Net Banking (Indian Banks)</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#7A6B69]">
                    account_balance
                  </span>
                </label>

                {/* 4. Cash on Delivery */}
                <label
                  className={`flex items-center justify-between p-2.5 rounded border cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-[#800020] bg-[#F3E6D5]/40'
                      : 'border-[#E6D7C3] hover:border-[#800020]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#800020]"
                    />
                    <span className="font-medium text-[#332927]">Cash on Delivery</span>
                  </div>
                  <span className="text-[10px] text-[#800020] font-semibold">OTP Verified</span>
                </label>
              </div>
            </div>

            {/* Complete Order Button */}
            <button
              type="button"
              disabled={processingOrder || cart.length === 0}
              onClick={handleInitiatePayment}
              className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3.5 px-6 rounded text-xs uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {processingOrder ? (
                <span>Opening Gateway...</span>
              ) : (
                <span>Complete Order — ₹{total.toLocaleString('en-IN')}</span>
              )}
            </button>

            {/* Trust Badges */}
            <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-[#7A6B69]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#800020]">
                  verified_user
                </span>
                <span>256-bit bank-grade encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#800020]">
                  inventory_2
                </span>
                <span>Fragile insured transit packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#800020]">
                  workspace_premium
                </span>
                <span>Authentic Moradabad artisan brass casting</span>
              </div>

            </div>

            <div className="text-[11px] text-[#7A6B69] text-center pt-1 border-t border-[#F3E6D5]">
              Questions?{' '}
              <a href="mailto:concierge@sajavat.in" className="text-[#800020] underline">
                Speak with Concierge
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* 3. Frequently Paired Together ("Harmonize Your Festive Altar") */}
      <section className="w-full bg-[#F3E6D5]/30 py-16 px-4 sm:px-6 lg:px-8 border-t border-[#F3E6D5]">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#7A6B69] block mb-1">
                Frequently Paired Together
              </span>
              <h2 className="font-serif text-2xl text-[#332927]">
                Harmonize Your Festive Altar
              </h2>
            </div>
            <p className="text-xs text-[#7A6B69] max-w-md">
              Complement your brass urli and aromatic candles with traditional pure-cotton wicks and floral essences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pairedSuggestions.map(pair => (
              <div
                key={pair.id}
                className="bg-white p-3.5 rounded border border-[#E6D7C3] flex flex-col justify-between group shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div className="aspect-square w-full rounded overflow-hidden bg-[#F3E6D5] relative mb-2.5">
                    <img
                      src={pair.images.main}
                      alt={pair.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      type="button"
                      aria-label="Add to bag"
                      onClick={() => addToCart(pair, 1)}
                      className="absolute bottom-2 right-2 w-8 h-8 bg-white text-[#800020] rounded-full shadow-md flex items-center justify-center hover:bg-[#800020] hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-[#7A6B69] block">
                    {pair.categoryLabel}
                  </span>
                  <h4 className="font-serif text-sm text-[#332927] font-semibold mt-0.5 line-clamp-1">
                    {pair.name}
                  </h4>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#F3E6D5]">
                  <span className="text-xs font-bold text-[#800020]">
                    ₹{pair.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#7A6B69]">In Stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. INTERACTIVE PAYMENT GATEWAY MODALS */}
      {/* ======================================================== */}

      {/* MODAL 1: UPI & QR Code Instant Gateway */}
      {activeGatewayModal === 'upi' && (
        <div className="fixed inset-0 z-50 bg-[#800020]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setActiveGatewayModal(null)}
              className="absolute top-4 right-4 text-[#7A6B69] hover:text-[#800020]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3E6D5] text-[#800020] rounded-full text-[10px] uppercase tracking-widest font-bold mb-2">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>NPCI Unified Payments Interface</span>
              </div>

              <h3 className="font-serif text-2xl text-[#332927] mb-1">Scan &amp; Pay via UPI</h3>
              <p className="text-xs text-[#7A6B69] mb-4">
                Amount: <strong className="text-[#800020]">₹{total.toLocaleString('en-IN')}</strong> · Session Expires in{' '}
                <span className="font-mono text-[#800020] font-semibold">
                  0{Math.floor(upiTimer / 60)}:{(upiTimer % 60).toString().padStart(2, '0')}
                </span>
              </p>

              {/* Dynamic QR Display */}
              <div className="w-52 h-52 mx-auto bg-white p-3 rounded-lg border-2 border-[#800020] shadow-md flex flex-col items-center justify-center relative">
                {/* SVG QR Visual */}
                <svg className="w-full h-full text-[#332927]" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer Frame & Corner Eyes */}
                  <rect x="5" y="5" width="28" height="28" fill="none" stroke="#800020" strokeWidth="4" />
                  <rect x="12" y="12" width="14" height="14" fill="#800020" />
                  <rect x="67" y="5" width="28" height="28" fill="none" stroke="#800020" strokeWidth="4" />
                  <rect x="74" y="12" width="14" height="14" fill="#800020" />
                  <rect x="5" y="67" width="28" height="28" fill="none" stroke="#800020" strokeWidth="4" />
                  <rect x="12" y="74" width="14" height="14" fill="#800020" />

                  {/* QR Data Matrix grid patterns */}
                  <rect x="42" y="10" width="6" height="6" />
                  <rect x="52" y="10" width="6" height="6" />
                  <rect x="40" y="22" width="6" height="6" />
                  <rect x="50" y="25" width="6" height="6" />
                  <rect x="15" y="42" width="6" height="6" />
                  <rect x="25" y="45" width="6" height="6" />
                  <rect x="42" y="42" width="16" height="16" fill="#800020" rx="3" />
                  <rect x="65" y="42" width="6" height="6" />
                  <rect x="75" y="45" width="6" height="6" />
                  <rect x="85" y="42" width="6" height="6" />
                  <rect x="42" y="68" width="6" height="6" />
                  <rect x="52" y="72" width="6" height="6" />
                  <rect x="68" y="68" width="6" height="6" />
                  <rect x="78" y="75" width="6" height="6" />
                  <rect x="88" y="70" width="6" height="6" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-[#FFF9F2] border border-[#800020] flex items-center justify-center shadow">
                    <span className="font-serif text-[11px] font-bold text-[#800020]">SJ</span>
                  </div>
                </div>
              </div>

              {/* Copy VPA */}
              <div className="mt-3 bg-[#F3E6D5]/40 py-1.5 px-3 rounded inline-flex items-center gap-2 text-xs">
                <span className="text-[#7A6B69]">UPI ID:</span>
                <span className="font-mono text-[#332927] font-semibold">sajavat.decor@icici</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('sajavat.decor@icici');
                    showToast('UPI ID copied to clipboard.');
                  }}
                  className="text-[10px] text-[#800020] uppercase font-bold hover:underline"
                >
                  Copy
                </button>
              </div>

              {/* Supported UPI Apps */}
              <div className="mt-4 pt-3 border-t border-[#F3E6D5]">
                <span className="text-[10px] uppercase tracking-wider text-[#7A6B69] block mb-2 font-medium">
                  Select App to Pay
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => handleConfirmUpi(app)}
                      className="py-2 px-2 bg-white border border-[#E6D7C3] hover:border-[#800020] hover:bg-[#F3E6D5]/40 rounded text-[11px] font-semibold text-[#332927] transition-all"
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant Simulation Action */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmUpi('Instant QR Scan')}
                  className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3 rounded text-xs uppercase tracking-wider font-semibold shadow transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>Simulate Payment Approval</span>
                </button>
                <span className="text-[10px] text-[#7A6B69]">
                  Order #{gatewayOrderNumber} · Auto-verifies with ICICI Bank Gateway
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Credit / Debit Card Gateway */}
      {activeGatewayModal === 'card' && (
        <div className="fixed inset-0 z-50 bg-[#800020]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setActiveGatewayModal(null)}
              className="absolute top-4 right-4 text-[#7A6B69] hover:text-[#800020]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#800020] text-[20px]">lock</span>
              <span className="text-[10px] uppercase tracking-widest text-[#800020] font-bold">
                256-bit Encrypted Card Payment
              </span>
            </div>

            <h3 className="font-serif text-2xl text-[#332927] mb-1">Card Details</h3>
            <p className="text-xs text-[#7A6B69] mb-4">
              Debit / Credit (Visa, Mastercard, RuPay, Amex) · Payable: <strong className="text-[#800020]">₹{total.toLocaleString('en-IN')}</strong>
            </p>

            <form onSubmit={handleProcessCard} className="flex flex-col gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#7A6B69] mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="4532 8920 1840 9204"
                    required
                    className="w-full bg-white border border-[#E6D7C3] py-2 px-3 text-xs text-[#332927] font-mono rounded outline-none focus:border-[#800020]"
                  />
                  <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-[#7A6B69]">
                    credit_card
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#7A6B69] mb-1">
                    Valid Thru (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    placeholder="08/29"
                    required
                    className="w-full bg-white border border-[#E6D7C3] py-2 px-3 text-xs text-[#332927] font-mono rounded outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#7A6B69] mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    placeholder="•••"
                    required
                    className="w-full bg-white border border-[#E6D7C3] py-2 px-3 text-xs text-[#332927] font-mono rounded outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#7A6B69] mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  placeholder="Cardholder Name"
                  required
                  className="w-full bg-white border border-[#E6D7C3] py-2 px-3 text-xs text-[#332927] rounded outline-none focus:border-[#800020]"
                />
              </div>

              {/* Quick Card Presets for Testing */}
              <div className="pt-1">
                <span className="text-[10px] uppercase tracking-wider text-[#7A6B69] block mb-1">
                  Quick Fill Test Presets:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('4532 8920 1840 9204');
                      setCardExpiry('08/29');
                      setCardCvv('842');
                      setCardHolder('Aarav Mehra');
                    }}
                    className="px-2 py-1 bg-[#F3E6D5] text-[#800020] text-[10px] rounded hover:bg-[#800020] hover:text-white transition-colors"
                  >
                    Visa Card
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardNumber('6080 3219 4820 1029');
                      setCardExpiry('12/28');
                      setCardCvv('910');
                      setCardHolder('Priyadarshini Rao');
                    }}
                    className="px-2 py-1 bg-[#F3E6D5] text-[#800020] text-[10px] rounded hover:bg-[#800020] hover:text-white transition-colors"
                  >
                    RuPay Platinum
                  </button>
                </div>
              </div>

              {cardError && (
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{cardError}</p>
              )}

              <button
                type="submit"
                className="mt-3 w-full bg-[#800020] hover:bg-[#600018] text-white py-3 rounded text-xs uppercase tracking-wider font-semibold shadow transition-colors flex items-center justify-center gap-2"
              >
                <span>Authorize &amp; Proceed to 3D Secure</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: 3D Secure 2.0 Challenge (OTP Simulation) */}
      {activeGatewayModal === 'card3ds' && (
        <div className="fixed inset-0 z-50 bg-[#800020]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border-t-4 border-[#800020]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-[#800020]">{cardBankName}</span>
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  3D Secure 2.0
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-700">₹{total.toLocaleString('en-IN')}</span>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              A 6-digit one-time password has been sent to your mobile registered with{' '}
              <strong>{cardMaskedNumber}</strong>.
            </p>

            <form onSubmit={handleComplete3DS} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Enter One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={card3dsOtp}
                  onChange={e => setCard3dsOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  required
                  className="w-full text-center text-lg tracking-[0.3em] font-mono py-2.5 border border-gray-300 rounded focus:border-[#800020] outline-none"
                />
                <span className="text-[11px] text-green-700 block mt-1">
                  ✓ Simulated Bank SMS OTP: <strong>{card3dsOtp || '123456'}</strong>
                </span>
              </div>

              {cardError && (
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{cardError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#800020] hover:bg-[#600018] text-white py-2.5 rounded text-xs uppercase tracking-wider font-semibold transition-colors"
                >
                  Verify &amp; Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGatewayModal(null)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-600 rounded text-xs uppercase tracking-wider hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Net Banking Simulation */}
      {activeGatewayModal === 'netbanking' && (
        <div className="fixed inset-0 z-50 bg-[#800020]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setActiveGatewayModal(null)}
              className="absolute top-4 right-4 text-[#7A6B69] hover:text-[#800020]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <h3 className="font-serif text-2xl text-[#332927] mb-1">Select Your Bank</h3>
            <p className="text-xs text-[#7A6B69] mb-4">
              Secure redirect to your institutional Internet Banking portal · Amount:{' '}
              <strong className="text-[#800020]">₹{total.toLocaleString('en-IN')}</strong>
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[
                { code: 'HDFC', name: 'HDFC Bank' },
                { code: 'ICICI', name: 'ICICI Bank' },
                { code: 'SBI', name: 'State Bank of India' },
                { code: 'AXIS', name: 'Axis Bank' },
                { code: 'KOTAK', name: 'Kotak Mahindra Bank' },
                { code: 'PNB', name: 'Punjab National Bank' }
              ].map(bank => (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => setSelectedBank(bank.code)}
                  className={`p-3 rounded border text-left flex items-center justify-between text-xs transition-colors ${
                    selectedBank === bank.code
                      ? 'border-[#800020] bg-[#F3E6D5] text-[#800020] font-semibold'
                      : 'border-[#E6D7C3] hover:border-[#800020] text-[#332927]'
                  }`}
                >
                  <span>{bank.name}</span>
                  {selectedBank === bank.code && (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCompleteNetBanking}
              className="w-full bg-[#800020] hover:bg-[#600018] text-white py-3 rounded text-xs uppercase tracking-wider font-semibold shadow transition-colors"
            >
              Login to {selectedBank} Net Banking &amp; Pay
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: Cash on Delivery Mobile OTP Verification */}
      {activeGatewayModal === 'codOtp' && (
        <div className="fixed inset-0 z-50 bg-[#800020]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setActiveGatewayModal(null)}
              className="absolute top-4 right-4 text-[#7A6B69] hover:text-[#800020]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <span className="text-[10px] uppercase tracking-widest text-[#800020] font-bold block mb-1">
              Anti-Fraud Protection
            </span>
            <h3 className="font-serif text-2xl text-[#332927] mb-1">Confirm Cash on Delivery</h3>
            <p className="text-xs text-[#7A6B69] mb-4 leading-relaxed">
              To verify doorstep delivery without spam, we sent a 4-digit code to{' '}
              <strong>{codMaskedPhone}</strong>.
            </p>

            <form onSubmit={handleVerifyCodOtp} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1">
                  Enter 4-Digit Verification OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={codOtp}
                  onChange={e => setCodOtp(e.target.value)}
                  placeholder="e.g. 1234"
                  required
                  className="w-full text-center text-xl tracking-[0.4em] font-mono py-2 bg-white border border-[#E6D7C3] rounded outline-none focus:border-[#800020]"
                />
                <span className="text-[11px] text-green-700 block mt-1">
                  ✓ Test OTP Code: <strong>{codTestOtp}</strong> (or enter 1234)
                </span>
              </div>

              {codError && (
                <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{codError}</p>
              )}

              <button
                type="submit"
                className="mt-2 w-full bg-[#800020] hover:bg-[#600018] text-white py-3 rounded text-xs uppercase tracking-wider font-semibold shadow transition-colors"
              >
                Verify &amp; Confirm COD Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
