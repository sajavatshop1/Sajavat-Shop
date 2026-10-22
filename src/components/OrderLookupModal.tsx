import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface OrderLookupModalProps {
  onViewOrderDetails: (order: Order) => void;
}

interface TotpStartResponse {
  success: boolean;
  customerId: string;
  email: string;
  name: string;
  totpSecret: string;
  otpauthUri: string;
  qrCodeUrl: string;
  isNewCustomer: boolean;
  totpEnabled: boolean;
  demoCode: string;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ onViewOrderDetails }) => {
  const {
    isOrderLookupOpen,
    setIsOrderLookupOpen,
    showToast,
    activeOrderId,
    customer,
    customerToken,
    setCustomerAuth,
    customerLogout
  } = useCart();

  // Active view tab: 'account' or 'direct'
  const [activeTab, setActiveTab] = useState<'account' | 'direct'>('account');

  // Direct order search state
  const [orderQuery, setOrderQuery] = useState(activeOrderId || 'ORD-SJ-2026-4482');
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState('');

  // 2FA Auth State
  const [authStep, setAuthStep] = useState<'email' | 'totp'>('email');
  const [emailInput, setEmailInput] = useState(customer?.email || 'aarav.mehra@atelier-studio.in');
  const [nameInput, setNameInput] = useState(customer?.name || 'Aarav Mehra');
  const [phoneInput, setPhoneInput] = useState(customer?.phone || '+91 98201 44829');
  const [totpSetupData, setTotpSetupData] = useState<TotpStartResponse | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Authenticated Patron Orders State
  const [patronOrders, setPatronOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Fetch orders whenever patron is authenticated and modal opens
  const fetchPatronOrders = async () => {
    if (!customerToken) return;
    setLoadingOrders(true);
    setOrdersError('');
    try {
      const res = await fetch('/api/customer/orders', {
        headers: { Authorization: `Bearer ${customerToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatronOrders(data.orders || []);
      } else {
        setOrdersError('Failed to retrieve patron orders.');
      }
    } catch {
      setOrdersError('Unable to connect to order server.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isOrderLookupOpen && customerToken) {
      fetchPatronOrders();
    }
  }, [isOrderLookupOpen, customerToken]);

  if (!isOrderLookupOpen) return null;

  // Direct single order lookup
  const handleDirectLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setDirectLoading(true);
    setDirectError('');

    let targetId = orderQuery.trim();
    if (!targetId.startsWith('ORD-') && targetId.startsWith('SJ-')) {
      targetId = `ORD-${targetId}`;
    }

    try {
      const res = await fetch(`/api/orders/${targetId}`);
      if (res.ok) {
        const orderData: Order = await res.json();
        setIsOrderLookupOpen(false);
        onViewOrderDetails(orderData);
      } else {
        setDirectError('No order found with this reference. Please check your order confirmation email or SMS.');
      }
    } catch {
      setDirectError('Unable to connect to order server. Please try again.');
    } finally {
      setDirectLoading(false);
    }
  };

  // Start 2FA (Step 1 -> Step 2)
  const handleStart2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/customer/auth/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          name: nameInput.trim(),
          phone: phoneInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTotpSetupData(data);
        setAuthStep('totp');
      } else {
        setAuthError(data.error || 'Failed to initiate Google Authenticator 2FA.');
      }
    } catch {
      setAuthError('Network error connecting to atelier security gateway.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Verify 2FA Code (Step 2 -> Authenticated)
  const handleVerify2FA = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!totpCode.trim()) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/customer/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          code: totpCode.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerAuth(data.token, data.customer);
        showToast('Google Authenticator 2FA Verified! Welcome to your Patron Portal.');
        setTotpCode('');
        setAuthStep('email');
      } else {
        setAuthError(data.error || 'Invalid Google Authenticator code.');
      }
    } catch {
      setAuthError('Failed to verify Authenticator code with server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (totpSetupData?.totpSecret) {
      navigator.clipboard.writeText(totpSetupData.totpSecret);
      setCopiedSecret(true);
      showToast('Authenticator Key copied to clipboard.');
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleSignOut = () => {
    customerLogout();
    setPatronOrders([]);
    setAuthStep('email');
    showToast('Signed out of patron account.');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#332927]/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOrderLookupOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-xl shadow-2xl max-w-2xl w-full p-5 sm:p-7 relative animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOrderLookupOpen(false)}
            aria-label="Close patron portal"
            className="absolute top-4 right-4 text-[#7A6B69] hover:text-[#800020] transition-colors p-1.5 rounded-full hover:bg-[#F3E6D5]/40"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-[2px] bg-[#800020]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#800020] font-semibold">
              Sajavat Atelier Circle
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h3 className="font-serif text-2xl text-[#332927]">
              {customer ? 'Patron Orders & Security' : 'Patron Account & 2FA'}
            </h3>

            {/* Mode Switch Tabs */}
            <div className="flex items-center gap-1 bg-[#F3E6D5]/60 p-1 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'account'
                    ? 'bg-[#800020] text-[#FFF9F2] shadow-sm'
                    : 'text-[#7A6B69] hover:text-[#332927]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  <span>Patron Account</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('direct')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'direct'
                    ? 'bg-[#800020] text-[#FFF9F2] shadow-sm'
                    : 'text-[#7A6B69] hover:text-[#332927]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                  <span>Quick Waybill</span>
                </span>
              </button>
            </div>
          </div>

          {/* Modal Body Container with Scroll */}
          <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {/* ──────────────────────────────────────────────────────────
                TAB 1: PATRON ACCOUNT & GOOGLE AUTHENTICATOR
               ────────────────────────────────────────────────────────── */}
            {activeTab === 'account' && (
              <div>
                {/* ── Case A: Authenticated Patron Dashboard ── */}
                {customer ? (
                  <div className="space-y-5">
                    {/* Patron Identity Card */}
                    <div className="bg-gradient-to-br from-[#FAF3EA] to-[#F3E6D5]/70 border border-[#E6D7C3] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#800020] text-[#FFF9F2] flex items-center justify-center font-serif text-lg font-bold shadow-inner">
                          {customer.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-semibold text-[#332927]">
                              {customer.name}
                            </h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <span className="material-symbols-outlined text-[12px]">security</span>
                              Google 2FA Active
                            </span>
                          </div>
                          <p className="text-xs text-[#7A6B69]">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-[11px] text-[#7A6B69]/80">{customer.phone}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={fetchPatronOrders}
                          className="px-2.5 py-1.5 bg-white border border-[#E6D7C3] text-[#332927] hover:border-[#800020] text-xs rounded-lg transition-colors flex items-center gap-1"
                          title="Refresh Orders"
                        >
                          <span className={`material-symbols-outlined text-[14px] ${loadingOrders ? 'animate-spin' : ''}`}>
                            refresh
                          </span>
                          <span>Sync</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="px-2.5 py-1.5 bg-[#800020]/10 hover:bg-[#800020] hover:text-[#FFF9F2] text-[#800020] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">logout</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>

                    {/* Orders Section Header */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <h4 className="font-serif text-lg text-[#332927]">
                          Your Atelier Orders &amp; Delivery Tracking
                        </h4>
                        <p className="text-xs text-[#7A6B69]">
                          Protected with Google Authenticator. Only your authenticated orders are displayed.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#800020] text-[#FFF9F2]">
                        {patronOrders.length} {patronOrders.length === 1 ? 'Order' : 'Orders'}
                      </span>
                    </div>

                    {/* Orders Content */}
                    {loadingOrders ? (
                      <div className="py-12 text-center text-[#7A6B69]">
                        <span className="material-symbols-outlined text-[28px] animate-spin text-[#800020] mb-2 block">
                          progress_activity
                        </span>
                        <p className="text-xs font-medium">Retrieving your authenticated order vault...</p>
                      </div>
                    ) : ordersError ? (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                        {ordersError}
                      </div>
                    ) : patronOrders.length === 0 ? (
                      <div className="py-10 text-center bg-[#FAF3EA] border border-[#F3E6D5] rounded-xl p-6">
                        <span className="material-symbols-outlined text-[36px] text-[#800020]/60 mb-2 block">
                          inventory_2
                        </span>
                        <h5 className="font-serif text-base text-[#332927] mb-1">No Orders Found Yet</h5>
                        <p className="text-xs text-[#7A6B69] max-w-sm mx-auto mb-4">
                          Orders placed with email <strong className="text-[#332927]">{customer.email}</strong> will automatically appear here with live courier tracking.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsOrderLookupOpen(false)}
                          className="px-4 py-2 bg-[#800020] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold rounded-lg hover:bg-[#600018] transition-colors"
                        >
                          Explore Handcrafted Collections
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {patronOrders.map((order) => {
                          const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
                            delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'task_alt' },
                            shipped: { label: 'In Transit with BlueDart', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'local_shipping' },
                            processing: { label: 'Crafting & Inspection', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'precision_manufacturing' },
                            paid: { label: 'Confirmed & Wax Sealing', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: 'verified' },
                            pending_payment: { label: 'Awaiting Payment', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: 'pending' }
                          };
                          const currentStatus = statusConfig[order.status] || {
                            label: order.status,
                            color: 'bg-gray-100 text-gray-800 border-gray-300',
                            icon: 'inventory'
                          };

                          return (
                            <div
                              key={order.id}
                              className="bg-white border border-[#E6D7C3] hover:border-[#800020]/50 rounded-xl p-4 transition-all shadow-sm hover:shadow-md"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3E6D5] pb-3 mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#800020]">
                                      {order.orderNumber}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentStatus.color}`}>
                                      <span className="material-symbols-outlined text-[12px]">{currentStatus.icon}</span>
                                      {currentStatus.label}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#7A6B69] mt-0.5">
                                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="text-xs text-[#7A6B69]">Total Amount</span>
                                  <p className="font-serif text-base font-bold text-[#332927]">
                                    ₹{order.pricing.total.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>

                              {/* Items list preview */}
                              <div className="space-y-2 mb-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-11 h-11 object-cover rounded-md border border-[#F3E6D5] bg-[#FAF3EA]"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-[#332927] truncate">
                                        {item.name}
                                      </p>
                                      <p className="text-[11px] text-[#7A6B69]">
                                        {item.finish ? `${item.finish} • ` : ''}Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                    <span className="text-xs font-semibold text-[#332927]">
                                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Shipping summary & Action */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#F3E6D5]/80 bg-[#FAF3EA]/40 -mx-4 -mb-4 p-3 rounded-b-xl">
                                <div className="text-[11px] text-[#7A6B69] flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[15px] text-[#800020]">
                                    flight_takeoff
                                  </span>
                                  <span>
                                    {order.shipping.trackingCarrier} • Waybill: <strong className="font-mono text-[#332927]">{order.shipping.waybillNumber}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsOrderLookupOpen(false);
                                    onViewOrderDetails(order);
                                  }}
                                  className="px-3.5 py-1.5 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm self-stretch sm:self-auto"
                                >
                                  <span>View Live Tracking &amp; Invoice</span>
                                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── Case B: Unauthenticated Patron 2FA Sign-In ── */
                  <div>
                    {authStep === 'email' ? (
                      /* Step 1: Email & Identity */
                      <form onSubmit={handleStart2FA} className="space-y-4">
                        <div className="bg-[#FAF3EA] border border-[#E6D7C3] p-4 rounded-xl flex items-start gap-3">
                          <span className="material-symbols-outlined text-[24px] text-[#800020] mt-0.5">
                            lock
                          </span>
                          <div className="text-xs leading-relaxed text-[#332927]">
                            <p className="font-semibold text-[#800020] mb-0.5">
                              Google Authenticator Two-Factor Security
                            </p>
                            <p className="text-[#7A6B69]">
                              To safeguard your order vault, address records, and festive delivery tracking, sign in using your Google Authenticator app on iOS or Android.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="patron-email"
                            className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1 font-semibold"
                          >
                            Patron Email Address *
                          </label>
                          <input
                            id="patron-email"
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="e.g. aarav.mehra@atelier-studio.in"
                            required
                            className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded-lg text-sm text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="patron-name"
                              className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1"
                            >
                              Full Name (Optional)
                            </label>
                            <input
                              id="patron-name"
                              type="text"
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              placeholder="e.g. Aarav Mehra"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded-lg text-sm text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="patron-phone"
                              className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1"
                            >
                              Phone / WhatsApp
                            </label>
                            <input
                              id="patron-phone"
                              type="tel"
                              value={phoneInput}
                              onChange={(e) => setPhoneInput(e.target.value)}
                              placeholder="+91 98201 44829"
                              className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded-lg text-sm text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                            />
                          </div>
                        </div>

                        {authError && (
                          <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                            {authError}
                          </p>
                        )}

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                        >
                          {authLoading ? (
                            <span>Generating 2FA Keys...</span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                              <span>Proceed with Google Authenticator</span>
                            </>
                          )}
                        </button>

                        <div className="bg-[#FAF3EA]/60 border border-[#F3E6D5] p-3 rounded-lg flex items-center justify-between text-xs text-[#7A6B69]">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#D4AF37]">tips_and_updates</span>
                            <span>Demo patron account pre-configured:</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailInput('aarav.mehra@atelier-studio.in');
                              setNameInput('Aarav Mehra');
                            }}
                            className="text-[#800020] hover:underline font-semibold"
                          >
                            Use Aarav's Demo Email
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Step 2: Google Authenticator QR Code & 6-Digit TOTP */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#F3E6D5] pb-2">
                          <button
                            type="button"
                            onClick={() => setAuthStep('email')}
                            className="text-xs text-[#7A6B69] hover:text-[#800020] flex items-center gap-1 font-medium"
                          >
                            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                            <span>Change Email ({emailInput})</span>
                          </button>
                          <span className="text-[11px] text-[#800020] font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live TOTP Session
                          </span>
                        </div>

                        {/* QR Code Presentation */}
                        <div className="bg-white border border-[#E6D7C3] p-4 rounded-xl flex flex-col sm:flex-row items-center gap-5 shadow-sm">
                          <div className="p-2 bg-[#FFF9F2] border-2 border-[#D4AF37]/50 rounded-xl shadow-inner relative group">
                            {totpSetupData?.qrCodeUrl ? (
                              <img
                                src={totpSetupData.qrCodeUrl}
                                alt="Google Authenticator QR Code"
                                className="w-40 h-40 object-contain rounded-lg"
                              />
                            ) : (
                              <div className="w-40 h-40 flex items-center justify-center text-xs text-[#7A6B69]">
                                Generating QR...
                              </div>
                            )}
                            <div className="absolute inset-0 bg-[#800020]/5 rounded-xl pointer-events-none" />
                          </div>

                          <div className="flex-1 text-xs text-[#332927] space-y-2.5">
                            <div className="flex items-center gap-1.5 text-[#800020] font-semibold text-sm">
                              <span className="material-symbols-outlined text-[18px]">phone_android</span>
                              <span>Scan with Google Authenticator</span>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-[#7A6B69] leading-relaxed">
                              <li>Open the <strong>Google Authenticator</strong> app.</li>
                              <li>Tap <strong>+</strong> and choose <strong>Scan a QR code</strong>.</li>
                              <li>Enter the dynamic 6-digit code below to unlock your orders.</li>
                            </ol>

                            {/* Manual Key Fallback */}
                            <div className="pt-1">
                              <span className="text-[10px] uppercase tracking-wider text-[#7A6B69] block mb-1">
                                Can't scan? Enter Secret Key manually:
                              </span>
                              <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-[#FAF3EA] border border-[#E6D7C3] rounded font-mono text-[11px] text-[#800020] font-bold tracking-widest flex-1 truncate">
                                  {totpSetupData?.totpSecret || 'JBSWY3DPEHPK3PXP'}
                                </code>
                                <button
                                  type="button"
                                  onClick={handleCopySecret}
                                  className="px-2.5 py-1 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-[10px] font-semibold rounded transition-colors flex items-center gap-1 whitespace-nowrap"
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {copiedSecret ? 'check' : 'content_copy'}
                                  </span>
                                  <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 6-Digit Code Input Form */}
                        <form onSubmit={handleVerify2FA} className="space-y-3">
                          <div>
                            <label
                              htmlFor="totp-code"
                              className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1 font-semibold"
                            >
                              Enter 6-Digit Authenticator Code
                            </label>
                            <input
                              id="totp-code"
                              type="text"
                              maxLength={6}
                              value={totpCode}
                              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="e.g. 849201"
                              autoFocus
                              required
                              className="w-full text-center tracking-[0.4em] font-mono font-bold text-2xl px-4 py-3 bg-white border-2 border-[#800020]/40 rounded-lg text-[#800020] placeholder:text-[#7A6B69]/30 focus:outline-none focus:border-[#800020] shadow-inner"
                            />
                          </div>

                          {authError && (
                            <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                              {authError}
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={authLoading || totpCode.length < 6}
                            className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                          >
                            {authLoading ? (
                              <span>Verifying Credentials...</span>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                <span>Verify &amp; Unlock Patron Orders</span>
                              </>
                            )}
                          </button>

                          {/* Quick test bypass helper */}
                          <div className="flex items-center justify-between text-[11px] bg-[#FAF3EA] border border-[#F3E6D5] p-2.5 rounded-lg text-[#7A6B69]">
                            <span>Developer / Test Quick Code:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setTotpCode('123456');
                              }}
                              className="px-2 py-0.5 rounded bg-white border border-[#E6D7C3] text-[#800020] font-mono font-bold hover:bg-[#800020] hover:text-white transition-colors"
                            >
                              Fill 123456
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ──────────────────────────────────────────────────────────
                TAB 2: DIRECT WAYBILL / SINGLE ORDER SEARCH FALLBACK
               ────────────────────────────────────────────────────────── */}
            {activeTab === 'direct' && (
              <div className="space-y-4">
                <p className="text-xs text-[#7A6B69] leading-relaxed">
                  Have a specific gift order number? Enter your Sajavat reference (e.g. <code>ORD-SJ-2026-4482</code>) to view the live BlueDart waybill, crafting stages, and GST invoice without signing in.
                </p>

                <form onSubmit={handleDirectLookup} className="flex flex-col gap-3">
                  <div>
                    <label
                      htmlFor="direct-order-ref"
                      className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1 font-semibold"
                    >
                      Order Reference ID
                    </label>
                    <input
                      id="direct-order-ref"
                      type="text"
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      placeholder="e.g. ORD-SJ-2026-4482"
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded-lg text-sm text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                    />
                  </div>

                  {directError && (
                    <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                      {directError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={directLoading}
                    className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                  >
                    {directLoading ? (
                      <span>Retrieving Order Waybill...</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">search</span>
                        <span>Track Direct Delivery</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="mt-4 pt-3 border-t border-[#F3E6D5] flex items-center justify-between text-[11px] text-[#7A6B69]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
              <span>256-bit Encrypted Vault</span>
            </span>
            <a
              href="mailto:concierge@sajavat.in"
              className="text-[#800020] hover:underline font-medium flex items-center gap-1"
            >
              <span>Atelier Concierge Care</span>
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
