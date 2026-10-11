import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface OrderLookupModalProps {
  onViewOrderDetails: (order: Order) => void;
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({ onViewOrderDetails }) => {
  const { isOrderLookupOpen, setIsOrderLookupOpen, showToast, activeOrderId } = useCart();
  const [orderQuery, setOrderQuery] = useState(activeOrderId || 'ORD-SJ-2026-4482');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOrderLookupOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setError('');

    // Normalize query
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
        setError('No order found with this reference. Please check your order confirmation email or SMS.');
      }
    } catch {
      setError('Unable to connect to order server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#800020]/30 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsOrderLookupOpen(false)}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#FFF9F2] border border-[#F3E6D5] rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setIsOrderLookupOpen(false)}
            className="absolute top-4 right-4 text-[#7A6B69] hover:text-[#800020] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-[1px] bg-[#800020]" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#800020] font-semibold">
              Atelier Concierge
            </span>
          </div>

          <h3 className="font-serif text-2xl text-[#332927] mb-2">Track Festive Order</h3>
          <p className="text-xs text-[#7A6B69] mb-5 leading-relaxed">
            Enter your Sajavat Order ID (e.g. <code>ORD-SJ-2026-4482</code>) to check live courier waybill milestones, craft certification, and invoice status.
          </p>

          <form onSubmit={handleLookup} className="flex flex-col gap-3">
            <div>
              <label htmlFor="order-ref" className="block text-[11px] uppercase tracking-wider text-[#7A6B69] mb-1">
                Order ID / Reference
              </label>
              <input
                id="order-ref"
                type="text"
                value={orderQuery}
                onChange={e => setOrderQuery(e.target.value)}
                placeholder="e.g. ORD-SJ-2026-4482"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-[#E6D7C3] rounded text-sm text-[#332927] placeholder:text-[#7A6B69]/50 focus:outline-none focus:border-[#800020]"
              />
            </div>

            {error && <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] hover:bg-[#600018] text-[#FFF9F2] py-3 rounded text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>Retrieving Record...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">search</span>
                  <span>Track Live Delivery</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#F3E6D5] flex items-center justify-between text-[11px] text-[#7A6B69]">
            <span>Need assistance?</span>
            <a
              href="mailto:concierge@sajavat.in"
              className="text-[#800020] hover:underline font-medium"
            >
              Speak with Concierge
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
