import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface OrderLookupModalProps {
  onViewOrderDetails: (order: Order) => void;
}

// Google Multi-color G Icon SVG
export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

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

  // Google Sign-In / Account Flow State
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showGoogleAccountPicker, setShowGoogleAccountPicker] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Email form state
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Authenticated Patron Orders State
  const [patronOrders, setPatronOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Pre-configured Google Demo Accounts for seamless 1-click testing
  const DEMO_GOOGLE_ACCOUNTS = [
    {
      name: 'Aarav Mehra',
      email: 'aarav.mehra@atelier-studio.in',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      note: 'Linked to festive order ORD-SJ-2026-4482'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      note: 'New patron account (0 initial orders)'
    }
  ];

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

  // Google Sign-Up / Sign-In Handler
  const handleGoogleAuth = async (profile: { email: string; name: string; avatar?: string; googleId?: string }) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/customer/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email.trim(),
          name: profile.name.trim(),
          picture: profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}`,
          googleId: profile.googleId || `gid_${Date.now()}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerAuth(data.token, data.customer);
        setShowGoogleAccountPicker(false);
        showToast(data.message || 'Signed in with Google!');
      } else {
        setAuthError(data.error || 'Failed to authenticate with Google.');
      }
    } catch {
      setAuthError('Connection error to atelier authentication gateway.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Fallback Email Sign-Up / Sign-In
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/customer/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          name: nameInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerAuth(data.token, data.customer);
        showToast('Signed in successfully.');
      } else {
        setAuthError(data.error || 'Unable to sign in with email.');
      }
    } catch {
      setAuthError('Network error connecting to atelier server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    customerLogout();
    setPatronOrders([]);
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
              {customer ? 'Patron Orders & Account' : 'Sign in with Google'}
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
                  <span className="material-symbols-outlined text-[14px]">account_circle</span>
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
                TAB 1: PATRON ACCOUNT (GOOGLE SIGN-UP / ORDERS)
               ────────────────────────────────────────────────────────── */}
            {activeTab === 'account' && (
              <div>
                {/* ── Case A: Authenticated Patron Dashboard ── */}
                {customer ? (
                  <div className="space-y-5">
                    {/* Patron Identity Card */}
                    <div className="bg-gradient-to-br from-[#FAF3EA] to-[#F3E6D5]/70 border border-[#E6D7C3] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37] shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#800020] text-[#FFF9F2] flex items-center justify-center font-serif text-lg font-bold shadow-inner">
                            {customer.name?.charAt(0) || 'P'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif text-base font-semibold text-[#332927]">
                              {customer.name}
                            </h4>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-[#E6D7C3] text-[#332927]">
                              <GoogleIcon className="w-3 h-3" />
                              Google Account
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
                          Only orders placed by <strong className="text-[#332927]">{customer.email}</strong> are displayed.
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
                          Any orders placed with email <strong className="text-[#332927]">{customer.email}</strong> will automatically appear here with real-time courier waybill milestones.
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
                  /* ── Case B: Unauthenticated Google Sign-In & Sign-Up ── */
                  <div className="space-y-5">
                    {/* Hero Message */}
                    <div className="bg-[#FAF3EA] border border-[#E6D7C3] p-4 rounded-xl flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#E6D7C3] flex items-center justify-center shrink-0 shadow-sm">
                        <GoogleIcon className="w-5 h-5" />
                      </div>
                      <div className="text-xs leading-relaxed text-[#332927]">
                        <p className="font-semibold text-[#800020] mb-0.5">
                          1-Click Google Sign-Up &amp; Sign-In
                        </p>
                        <p className="text-[#7A6B69]">
                          Sign up or log in securely with your Google account. Your orders, artisanal certificates, delivery waybills, and saved addresses are tied to your Google profile.
                        </p>
                      </div>
                    </div>

                    {/* Prominent Google Sign-In Button */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowGoogleAccountPicker(true)}
                        disabled={authLoading}
                        className="w-full bg-white hover:bg-[#F9F7F5] border-2 border-[#D4AF37]/60 hover:border-[#800020] text-[#332927] py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-50"
                      >
                        <GoogleIcon className="w-5 h-5" />
                        <span className="font-semibold">Continue with Google</span>
                      </button>
                    </div>

                    {/* Google Account Selector Modal / Dropdown */}
                    {showGoogleAccountPicker && (
                      <div className="bg-white border-2 border-[#800020]/30 rounded-xl p-4 shadow-lg space-y-3 animate-in fade-in-50 duration-150">
                        <div className="flex items-center justify-between border-b border-[#F3E6D5] pb-2">
                          <div className="flex items-center gap-2">
                            <GoogleIcon className="w-4 h-4" />
                            <span className="text-xs font-semibold text-[#332927]">
                              Choose an account to continue with Sajavat
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowGoogleAccountPicker(false)}
                            className="text-[#7A6B69] hover:text-[#800020]"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>

                        {/* List of Google Accounts */}
                        <div className="space-y-2">
                          {DEMO_GOOGLE_ACCOUNTS.map((acc, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleGoogleAuth(acc)}
                              className="w-full text-left p-2.5 rounded-lg border border-[#E6D7C3] hover:border-[#800020] hover:bg-[#FAF3EA]/60 transition-all flex items-center gap-3 group"
                            >
                              <img
                                src={acc.avatar}
                                alt={acc.name}
                                className="w-9 h-9 rounded-full object-cover border border-[#E6D7C3]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#332927] group-hover:text-[#800020] truncate">
                                  {acc.name}
                                </p>
                                <p className="text-[11px] text-[#7A6B69] truncate">{acc.email}</p>
                                <span className="text-[10px] text-[#800020]/80 font-medium">
                                  {acc.note}
                                </span>
                              </div>
                              <span className="material-symbols-outlined text-[16px] text-[#7A6B69] group-hover:text-[#800020] group-hover:translate-x-0.5 transition-all">
                                chevron_right
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Custom Google Account Entry */}
                        <div className="pt-2 border-t border-[#F3E6D5]">
                          <p className="text-[11px] font-semibold text-[#7A6B69] mb-2">
                            Or sign in with another Google Account:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                            <input
                              type="text"
                              value={customGoogleName}
                              onChange={(e) => setCustomGoogleName(e.target.value)}
                              placeholder="Your Name (e.g. Meera Kapoor)"
                              className="px-3 py-1.5 bg-[#FAF3EA]/50 border border-[#E6D7C3] rounded text-xs text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                            />
                            <input
                              type="email"
                              value={customGoogleEmail}
                              onChange={(e) => setCustomGoogleEmail(e.target.value)}
                              placeholder="Your Google Email address"
                              className="px-3 py-1.5 bg-[#FAF3EA]/50 border border-[#E6D7C3] rounded text-xs text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={!customGoogleEmail.includes('@')}
                            onClick={() =>
                              handleGoogleAuth({
                                name: customGoogleName || customGoogleEmail.split('@')[0],
                                email: customGoogleEmail
                              })
                            }
                            className="w-full py-2 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-xs font-semibold rounded transition-colors disabled:opacity-40"
                          >
                            Sign in with {customGoogleEmail || 'Google'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <span className="flex-1 h-[1px] bg-[#E6D7C3]" />
                      <span className="text-[11px] uppercase tracking-wider text-[#7A6B69]">
                        or continue with email
                      </span>
                      <span className="flex-1 h-[1px] bg-[#E6D7C3]" />
                    </div>

                    {/* Email Sign-In / Sign-Up Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                      <div>
                        <label
                          htmlFor="direct-patron-email"
                          className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1 font-semibold"
                        >
                          Email Address
                        </label>
                        <input
                          id="direct-patron-email"
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="e.g. patron@sajavat.in"
                          required
                          className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded-lg text-sm text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="direct-patron-name"
                          className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1"
                        >
                          Your Name (For new patrons)
                        </label>
                        <input
                          id="direct-patron-name"
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="e.g. Aarav Mehra"
                          className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded-lg text-sm text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                        />
                      </div>

                      {authError && (
                        <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                          {authError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={authLoading || !emailInput.includes('@')}
                        className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                      >
                        {authLoading ? (
                          <span>Verifying Account...</span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            <span>Continue to My Orders</span>
                          </>
                        )}
                      </button>
                    </form>
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
                  Have a specific gift order reference? Enter your Sajavat order ID (e.g. <code>ORD-SJ-2026-4482</code>) to view the live BlueDart waybill, crafting inspection milestones, and GST invoice without signing in.
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
            <span className="flex items-center gap-1.5">
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Secure Patron OAuth Gateway</span>
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
