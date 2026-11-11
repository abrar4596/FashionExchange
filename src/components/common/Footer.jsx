import React from 'react';
import { RefreshCw, Leaf, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-surface-divider mt-16 text-sm text-surface-muted">
      {/* 4 Pillars of FashionExchange */}
      <div className="border-b border-surface-divider bg-surface-light/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-vinted-50 text-vinted-500 border border-vinted-100">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-surface-dark text-sm">100% Cashless Barter</h4>
                <p className="text-xs text-surface-muted mt-1">
                  Exchange clothes item-for-item. Zero seller fees, zero commissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-surface-dark text-sm">Circular Fashion Impact</h4>
                <p className="text-xs text-surface-muted mt-1">
                  Keep wearable garments out of landfills by recycling wardrobes locally.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-surface-dark text-sm">Direct Negotiation</h4>
                <p className="text-xs text-surface-muted mt-1">
                  Coordinate terms, verify fits, and arrange hand-offs via peer-to-peer chat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-surface-dark text-sm">Community Moderation</h4>
                <p className="text-xs text-surface-muted mt-1">
                  Active administrative oversight ensures authentic items and trusted swappers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-vinted-500 text-white font-bold text-xs flex items-center justify-center">
            FE
          </div>
          <span className="font-bold text-surface-dark">FashionExchange</span>
          <span className="text-xs">© {new Date().getFullYear()} — Sustainable Clothing Barter Marketplace.</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium">
          <span className="hover:text-vinted-500 cursor-pointer">How It Works</span>
          <span className="hover:text-vinted-500 cursor-pointer">Community Guidelines</span>
          <span className="hover:text-vinted-500 cursor-pointer">Sustainability Report</span>
          <span className="hover:text-vinted-500 cursor-pointer">Safety & Disputes</span>
        </div>
      </div>
    </footer>
  );
};
