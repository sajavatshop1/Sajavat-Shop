import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface OrderLookupModalProps {
  onViewOrderDetails: (order: Order) => void;
}

// Google G Icon
const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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

  // Mode: simple Google Sign-In or Direct Order ID lookup
  const [showDirectLookup, setShowDirectLookup] = useState(false);
  const [orderQuery, setOrderQuery] = useState(activeOrderId || 'ORD-SJ-2026-4482');
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState('');

  // Google Sign-In state
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  // Patron Orders State (Strict User Isolation)
  const [patronOrders, setPatronOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Quick Google accounts for 1-click convenience
  const GOOGLE_ACCOUNTS = [
    {
      name: 'Aarav Mehra',
      email: 'aarav.mehra@atelier-studio.in',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      label: 'Demo Account (1 Active Order)'
    },
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      label: 'New Account (0 Orders)'
    }
  ];

  // Fetch only this patron's orders from server
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
        setOrdersError('Failed to load orders.');
      }
    } catch {
      setOrdersError('Unable to connect to server.');
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

  // Perform Google Sign-In
  const handleGoogleSignIn = async (account: { name: string; email: string; avatar?: string }) => {
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/customer/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email.trim(),
          name: account.name.trim(),
          picture: account.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(account.name)}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerAuth(data.token, data.customer);
        setShowAccountSelector(false);
        showToast(`Signed in as ${data.customer.name}`);
      } else {
        setAuthError(data.error || 'Failed to sign in with Google.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Direct single order search fallback
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
        setDirectError('Order not found. Please check your reference ID.');
      }
    } catch {
      setDirectError('Server connection error. Please try again.');
    } finally {
      setDirectLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#332927]/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOrderLookupOpen(false)}
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsOrderLookupOpen(false)}
            aria-label="Close"
            className="absolute top-4 right-4 text-[#7A6B69] hover:text-[#800020] transition-colors p-1.5 rounded-full hover:bg-[#F3E6D5]/50"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-[2px] bg-[#800020]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#800020] font-semibold">
              Sajavat Atelier
            </span>
          </div>

          <h3 className="font-serif text-2xl text-[#332927] mb-1">
            {customer ? 'Your Orders' : 'Sign in to Check Orders'}
          </h3>

          <p className="text-xs text-[#7A6B69] mb-5 leading-relaxed">
            {customer
              ? `Signed in as ${customer.email}. Only your personal orders are shown below.`
              : 'Sign in with your Google account to view and track your festive deliveries.'}
          </p>

          <div className="overflow-y-auto pr-1 flex-1 custom-scrollbar">
            {/* ── CASE 1: LOGGED IN — PATRON ORDERS (STRICT ISOLATION) ── */}
            {customer ? (
              <div className="space-y-4">
                {/* User Info Bar */}
                <div className="bg-white border border-[#E6D7C3] p-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    {customer.avatar ? (
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#800020] text-white flex items-center justify-center font-bold font-serif text-sm">
                        {customer.name?.charAt(0) || 'P'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[#332927] leading-tight">
                        {customer.name}
                      </p>
                      <p className="text-xs text-[#7A6B69]">{customer.email}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      customerLogout();
                      setPatronOrders([]);
                      showToast('Signed out successfully.');
                    }}
                    className="px-3 py-1.5 text-xs text-[#800020] hover:bg-[#800020]/10 font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Orders List */}
                {loadingOrders ? (
                  <div className="py-8 text-center text-[#7A6B69]">
                    <span className="material-symbols-outlined text-[24px] animate-spin text-[#800020] block mb-2">
                      progress_activity
                    </span>
                    <span className="text-xs">Loading your orders...</span>
                  </div>
                ) : ordersError ? (
                  <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {ordersError}
                  </p>
                ) : patronOrders.length === 0 ? (
                  <div className="py-8 text-center bg-white border border-[#E6D7C3] rounded-xl p-5">
                    <span className="material-symbols-outlined text-[32px] text-[#7A6B69]/50 block mb-1">
                      shopping_bag
                    </span>
                    <h5 className="font-serif text-sm font-semibold text-[#332927] mb-1">
                      No Orders Yet
                    </h5>
                    <p className="text-xs text-[#7A6B69]">
                      Orders placed under <strong>{customer.email}</strong> will automatically appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patronOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-[#E6D7C3] hover:border-[#800020]/50 rounded-xl p-3.5 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#F3E6D5]">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#800020]">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-[#7A6B69] block">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                              {order.status.replace('_', ' ')}
                            </span>
                            <p className="font-serif text-sm font-bold text-[#332927] mt-0.5">
                              ₹{order.pricing.total.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1.5 mb-2.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs text-[#332927]">
                              <span className="truncate max-w-[240px]">
                                {item.name} {item.finish ? `(${item.finish})` : ''}
                              </span>
                              <span className="text-[#7A6B69] shrink-0">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Courier & Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F3E6D5] text-[11px]">
                          <span className="text-[#7A6B69]">
                            {order.shipping.trackingCarrier}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setIsOrderLookupOpen(false);
                              onViewOrderDetails(order);
                            }}
                            className="px-3 py-1 bg-[#800020] text-[#FFF9F2] text-xs font-semibold rounded-md hover:bg-[#600018] transition-colors flex items-center gap-1"
                          >
                            <span>Track Order</span>
                            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ── CASE 2: NOT LOGGED IN — SIMPLE GOOGLE SIGN IN ── */
              <div className="space-y-4">
                {/* Simple Google Sign In Button */}
                <button
                  type="button"
                  onClick={() => setShowAccountSelector(true)}
                  disabled={authLoading}
                  className="w-full bg-white hover:bg-[#F9F7F5] border-2 border-[#D4AF37]/60 hover:border-[#800020] text-[#332927] py-3.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md active:scale-[0.99] disabled:opacity-50"
                >
                  <GoogleGIcon className="w-5 h-5" />
                  <span className="font-semibold text-sm">Sign in with Google</span>
                </button>

                {/* 1-Click Google Account Selector */}
                {showAccountSelector && (
                  <div className="bg-white border-2 border-[#800020]/25 rounded-xl p-3.5 shadow-lg space-y-2.5 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between border-b border-[#F3E6D5] pb-1.5">
                      <span className="text-xs font-semibold text-[#332927] flex items-center gap-1.5">
                        <GoogleGIcon className="w-3.5 h-3.5" />
                        Choose a Google account
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAccountSelector(false)}
                        className="text-[#7A6B69] hover:text-[#800020]"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {GOOGLE_ACCOUNTS.map((acc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleGoogleSignIn(acc)}
                          className="w-full text-left p-2 rounded-lg border border-[#E6D7C3] hover:border-[#800020] hover:bg-[#FAF3EA]/70 transition-all flex items-center gap-2.5 group"
                        >
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-8 h-8 rounded-full object-cover border border-[#E6D7C3]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#332927] group-hover:text-[#800020] truncate">
                              {acc.name}
                            </p>
                            <p className="text-[11px] text-[#7A6B69] truncate">{acc.email}</p>
                          </div>
                          <span className="text-[10px] text-[#800020] font-medium bg-[#800020]/5 px-2 py-0.5 rounded">
                            {acc.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Any Google Email input */}
                    <div className="pt-2 border-t border-[#F3E6D5] flex gap-2">
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="Or enter your Google email..."
                        className="flex-1 px-3 py-1.5 bg-[#FAF3EA]/50 border border-[#E6D7C3] rounded text-xs text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
                      />
                      <button
                        type="button"
                        disabled={!customEmail.includes('@')}
                        onClick={() =>
                          handleGoogleSignIn({
                            name: customEmail.split('@')[0],
                            email: customEmail
                          })
                        }
                        className="px-3 py-1.5 bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] text-xs font-semibold rounded disabled:opacity-40"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                )}

                {authError && (
                  <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                    {authError}
                  </p>
                )}

                {/* Direct Single Order ID Lookup (Optional / Collapsible) */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowDirectLookup(!showDirectLookup)}
                    className="text-xs text-[#7A6B69] hover:text-[#800020] underline transition-colors"
                  >
                    {showDirectLookup ? 'Hide direct lookup' : 'Looking for a single order? Track by Order ID'}
                  </button>

                  {showDirectLookup && (
                    <form onSubmit={handleDirectLookup} className="mt-3 text-left space-y-2">
                      <input
                        type="text"
                        value={orderQuery}
                        onChange={(e) => setOrderQuery(e.target.value)}
                        placeholder="e.g. ORD-SJ-2026-4482"
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded-lg text-sm text-[#332927] focus:outline-none focus:border-[#800020]"
                      />
                      {directError && (
                        <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{directError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={directLoading}
                        className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-2.5 rounded-lg text-xs uppercase tracking-widest font-semibold disabled:opacity-50"
                      >
                        {directLoading ? 'Searching...' : 'Track by Reference ID'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
