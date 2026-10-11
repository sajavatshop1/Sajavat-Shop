import React from 'react';
import { useCart } from '../context/CartContext';

export const Toast: React.FC = () => {
  const { toast } = useCart();

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-300 pointer-events-none bg-[#800020] text-white px-5 py-3 rounded shadow-2xl flex items-center gap-2.5 border border-[#990026]">
      <span className="material-symbols-outlined text-[18px] text-[#F3E6D5]">check_circle</span>
      <span className="text-xs font-medium tracking-wide">{toast.message}</span>
    </div>
  );
};
