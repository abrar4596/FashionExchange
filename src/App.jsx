import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SwapProvider, useSwap } from './context/SwapContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/common/Navbar';
import { HeroBanner } from './components/common/HeroBanner';
import { FilterBar } from './components/listings/FilterBar';
import { ListingGrid } from './components/listings/ListingGrid';
import { ListingDetailModal } from './components/listings/ListingDetailModal';
import { ListingFormModal } from './components/listings/ListingFormModal';
import { SwapRequestModal } from './components/swap/SwapRequestModal';
import { ChatDrawer } from './components/chat/ChatDrawer';
import { UserProfileView } from './components/profile/UserProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Wishlist } from './components/wishlist/Wishlist';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/common/Footer';
import api from './services/api';

const AppContent = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { openChat } = useSwap();

  // Navigation state: 'browse' | 'profile' | 'admin'
  const [currentView, setCurrentView] = useState('browse');

  // Multi-facet Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedCondition, setSelectedCondition] = useState([]);
  const [selectedSize, setSelectedSize] = useState([]);
  const [selectedSort, setSelectedSort] = useState('newest');

  // Listings data & loading
  const [listings, setListings] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Dialog states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isNewListingModalOpen, setIsNewListingModalOpen] = useState(false);
  const [selectedListingDetail, setSelectedListingDetail] = useState(null);
  const [swapTargetItem, setSwapTargetItem] = useState(null);

  // Search debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch listings whenever filters change
  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedCity && selectedCity !== 'all') {
        params.set('city', selectedCity);
        if (selectedCityId) params.set('cityId', selectedCityId);
      }
      if (selectedCondition.length > 0) params.set('condition', selectedCondition.join(','));
      if (selectedSize.length > 0) params.set('size', selectedSize.join(','));
      if (selectedSort) params.set('sort', selectedSort);

      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.listings || []);
      setTotalResults(res.data.pagination?.total || 0);
    } catch (err) {
      console.error('Fetch listings error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    selectedCategory,
    selectedCity,
    selectedCityId,
    selectedCondition,
    selectedSize,
    selectedSort,
  ]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Wishlist is user-specific: fall back to browse if the session ends while viewing it.
  useEffect(() => {
    if (!isAuthenticated && currentView === 'wishlist') {
      setCurrentView('browse');
    }
  }, [isAuthenticated, currentView]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedCityId('');
    setSelectedCondition([]);
    setSelectedSize([]);
    setSelectedSort('newest');
  };

  const hasActiveFilters =
    debouncedSearch !== '' ||
    selectedCategory !== 'all' ||
    selectedCity !== 'all' ||
    selectedCondition.length > 0 ||
    selectedSize.length > 0;

  const handleOpenAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleOpenNewListing = () => {
    if (!isAuthenticated) {
      handleOpenAuth('register');
    } else {
      setIsNewListingModalOpen(true);
    }
  };

  const handleProposeSwap = (targetItem) => {
    if (!isAuthenticated) {
      handleOpenAuth('login');
    } else {
      setSwapTargetItem(targetItem);
    }
  };

  const handleListingCreated = () => {
    fetchListings();
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-light">
      {/* Sticky Navbar with Vinted Styling */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedCityId={selectedCityId}
        setSelectedCityId={setSelectedCityId}
        onOpenAuthModal={handleOpenAuth}
        onOpenNewListingModal={handleOpenNewListing}
        onNavigateView={(view) => setCurrentView(view)}
        currentView={currentView}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1">
        {currentView === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Hero Banner */}
            <HeroBanner
              onOpenNewListingModal={handleOpenNewListing}
              onOpenAuthModal={handleOpenAuth}
            />

            {/* Filter Bar with City Dropdown & Condition Checkboxes */}
            <FilterBar
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCityId={selectedCityId}
              setSelectedCityId={setSelectedCityId}
              totalResults={totalResults}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Clothing Listings Grid */}
            <ListingGrid
              listings={listings}
              isLoading={isLoading}
              onSelectListing={(item) => setSelectedListingDetail(item)}
              onProposeSwap={handleProposeSwap}
              onResetFilters={handleResetFilters}
              onRequireAuth={() => handleOpenAuth('login')}
            />
          </div>
        )}

        {currentView === 'profile' && (
          <UserProfileView
            onOpenNewListingModal={handleOpenNewListing}
            onSelectListing={(item) => setSelectedListingDetail(item)}
          />
        )}

        {currentView === 'admin' && isAdmin && (
          <AdminDashboard
            onSelectListing={(item) => setSelectedListingDetail(item)}
          />
        )}

        {currentView === 'wishlist' && isAuthenticated && (
          <Wishlist
            onSelectListing={(item) => setSelectedListingDetail(item)}
            onProposeSwap={handleProposeSwap}
            onNavigateView={(view) => setCurrentView(view)}
          />
        )}
      </main>

      {/* Footer with Circular Economy Guiding Principles */}
      <Footer />

      {/* Global Modals */}
      <ListingDetailModal
        listing={selectedListingDetail}
        isOpen={!!selectedListingDetail}
        onClose={() => setSelectedListingDetail(null)}
        onProposeSwap={handleProposeSwap}
        onRequireAuth={() => handleOpenAuth('login')}
      />

      <SwapRequestModal
        requestedItem={swapTargetItem}
        isOpen={!!swapTargetItem}
        onClose={() => setSwapTargetItem(null)}
        onOpenNewListingModal={handleOpenNewListing}
      />

      <ListingFormModal
        isOpen={isNewListingModalOpen}
        onClose={() => setIsNewListingModalOpen(false)}
        onListingCreated={handleListingCreated}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* Floating Peer-to-Peer Negotiation Chat Drawer */}
      <ChatDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <SwapProvider>
          <AppContent />
        </SwapProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
