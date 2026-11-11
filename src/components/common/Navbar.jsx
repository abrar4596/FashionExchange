import React, { useState } from 'react';
import {
  Search,
  PlusCircle,
  MessageSquare,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSwap } from '../../context/SwapContext';
import { CityAutocomplete } from './CityAutocomplete';

const CATEGORIES = [
  'All',
  'Women',
  'Men',
  'Kids',
  'Vintage',
  'Shoes',
  'Accessories',
];

export const Navbar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  selectedCityId,
  setSelectedCityId,
  onOpenAuthModal,
  onOpenNewListingModal,
  onNavigateView,
  currentView,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { pendingCount, openChat, swaps } = useSwap();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenFirstChat = () => {
    if (swaps.all && swaps.all.length > 0) {
      openChat(swaps.all[0]);
    } else {
      openChat(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-surface-divider shadow-sm">
      {/* Top Banner: Sustainability & Zero Fees reminder */}
      <div className="bg-vinted-900 text-vinted-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
        <span>100% Barter Marketplace — No transaction fees, no commission. Trade clothes directly.</span>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => onNavigateView('browse')}
          >
            <div className="w-9 h-9 rounded-xl bg-vinted-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
              FE
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-vinted-500 tracking-tight leading-none">
                Fashion<span className="text-surface-dark">Exchange</span>
              </span>
              <span className="text-[10px] text-surface-muted font-semibold tracking-wider uppercase">
                Clothing Barter
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-surface-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items, brands, vintage denim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-light border border-surface-divider rounded-full pl-10 pr-4 py-2 text-sm text-surface-dark placeholder-surface-muted focus:outline-none focus:border-vinted-500 focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-muted hover:text-surface-dark text-xs bg-surface-divider rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* City / Regional Filter Dropdown */}
          <div className="hidden w-56 lg:block">
            <CityAutocomplete
              value={selectedCity}
              cityId={selectedCityId}
              allowAll
              onChange={(city, id) => {
                setSelectedCity(city);
                setSelectedCityId(id);
              }}
              className="[&_input]:rounded-full [&_input]:py-1.5 [&_input]:text-xs"
            />
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* List Item CTA */}
                <button
                  onClick={onOpenNewListingModal}
                  className="flex items-center gap-1.5 bg-vinted-500 hover:bg-vinted-600 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">List an Item</span>
                </button>

                {/* Chat & Negotiation Drawer Trigger */}
                <button
                  onClick={handleOpenFirstChat}
                  className="relative p-2 text-surface-dark hover:text-vinted-500 hover:bg-surface-light rounded-full transition-colors border border-surface-divider"
                  title="Negotiations & Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-gold text-surface-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {/* User Avatar Menu Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-vinted-300 transition-all"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-surface-divider"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-vinted-100 text-vinted-700 flex items-center justify-center text-xs font-bold border border-vinted-300">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-surface-divider py-1.5 z-50 text-sm"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-surface-divider">
                        <p className="font-bold text-surface-dark truncate">{user?.name}</p>
                        <p className="text-xs text-surface-muted truncate">{user?.email}</p>
                        <p className="text-[11px] text-vinted-600 font-medium mt-0.5">
                          📍 {user?.city} · {user?.completedSwapsCount || 0} swaps
                        </p>
                      </div>

                      <button
                        onClick={() => onNavigateView('profile')}
                        className="w-full px-4 py-2 text-left text-surface-dark hover:bg-surface-light flex items-center gap-2.5 transition-colors"
                      >
                        <User className="w-4 h-4 text-surface-muted" />
                        <span>My Closet & Profile</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => onNavigateView('admin')}
                          className="w-full px-4 py-2 text-left text-vinted-700 hover:bg-vinted-50 flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <Shield className="w-4 h-4 text-vinted-500" />
                          <span>Admin Management</span>
                        </button>
                      )}

                      <div className="border-t border-surface-divider my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="text-xs sm:text-sm font-semibold text-vinted-500 hover:text-vinted-700 px-3 py-1.5 rounded-lg border border-vinted-500 hover:bg-vinted-50 transition-all"
                >
                  Log in
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="text-xs sm:text-sm font-semibold text-white bg-vinted-500 hover:bg-vinted-600 px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-surface-dark rounded-lg hover:bg-surface-light"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-light border border-surface-divider rounded-full pl-9 pr-3 py-1.5 text-xs text-surface-dark placeholder-surface-muted focus:outline-none focus:border-vinted-500"
            />
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (Vinted Tabs) */}
      <div className="bg-white border-t border-surface-divider overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-2">
            {CATEGORIES.map((cat) => {
              const isActive =
                (cat === 'All' && selectedCategory === 'all') ||
                selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat === 'All' ? 'all' : cat);
                    if (currentView !== 'browse') onNavigateView('browse');
                  }}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-vinted-500 text-white shadow-sm font-semibold'
                      : 'text-surface-muted hover:text-surface-dark hover:bg-surface-light'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
