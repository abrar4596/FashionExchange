import React from 'react';
import { Sparkles, Repeat, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HeroBanner = ({ onOpenNewListingModal, onOpenAuthModal }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-vinted-900 via-vinted-800 to-vinted-700 text-white p-6 sm:p-10 mb-8 shadow-md">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-vinted-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 -mb-16 w-56 h-56 rounded-full bg-accent-gold/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-vinted-100 text-xs font-semibold mb-4 border border-white/15">
          <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
          <span>Circular Wardrobe Community</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Swap Your Style Without Spending a Dime.
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-vinted-100/90 leading-relaxed max-w-xl">
          Tired of platform commission cuts and haggling? Trade pre-loved, wearable garments directly with fashion lovers in your city. 100% cashless barter economy.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (isAuthenticated) {
                onOpenNewListingModal();
              } else {
                onOpenAuthModal('register');
              }
            }}
            className="flex items-center gap-2 bg-vinted-500 hover:bg-vinted-400 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-[0.98]"
          >
            <Repeat className="w-4 h-4 text-accent-gold" />
            <span>List an Item to Swap</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs text-vinted-200 font-medium pl-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Fees · Direct Negotiation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
