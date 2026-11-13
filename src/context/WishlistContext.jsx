import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Single source of truth for both the Navbar badge and the Wishlist page.
  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setWishlistIds([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/v1/wishlist');
      const listings = res.data?.listings || [];
      setWishlist(listings);
      setWishlistIds(listings.map((listing) => listing._id));
    } catch (err) {
      console.error('Fetch wishlist error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = useCallback(
    (listingId) => wishlistIds.includes(listingId),
    [wishlistIds]
  );

  const toggleWishlist = async (listing) => {
    const listingId = typeof listing === 'string' ? listing : listing?._id;
    if (!listingId) return false;

    const wasSaved = wishlistIds.includes(listingId);

    // Optimistic update so every heart in the UI reacts instantly.
    setWishlistIds((prev) =>
      wasSaved ? prev.filter((id) => id !== listingId) : [listingId, ...prev]
    );
    if (wasSaved) {
      setWishlist((prev) => prev.filter((item) => item._id !== listingId));
    } else if (listing && typeof listing === 'object') {
      setWishlist((prev) => [listing, ...prev]);
    }

    try {
      const res = await api.post('/v1/wishlist/toggle', { listingId });
      // Re-sync with the server so the count and ordering stay authoritative.
      await refreshWishlist();
      return res.data?.wishlisted;
    } catch (err) {
      console.error('Toggle wishlist error:', err.message);
      await refreshWishlist(); // revert the optimistic change on failure
      return wasSaved;
    }
  };

  const removeFromWishlist = (listing) => toggleWishlist(listing);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        wishlistCount: wishlistIds.length,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
