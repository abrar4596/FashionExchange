import React from 'react';
import { Heart, MapPin, Repeat } from 'lucide-react';
import { ConditionBadge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

export const ListingCard = ({ listing, onSelect, onProposeSwap, onRequireAuth }) => {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isFav = isWishlisted(listing._id);

  // Format image URL (handles localhost relative paths or direct URLs)
  const imageUrl = listing.images?.[0]?.startsWith('http')
    ? listing.images[0]
    : `http://localhost:5000${listing.images?.[0]}`;

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group bg-white rounded-xl border border-surface-divider overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Photo Container with 310 / 430 Vinted Aspect Ratio */}
      <div className="relative aspect-[310/430] w-full overflow-hidden bg-surface-divider/40">
        <img
          src={imageUrl}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop';
          }}
        />

        {/* Wishlist toggle (persisted per user) */}
        <button
          type="button"
          aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={isFav}
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              onRequireAuth?.();
              return;
            }
            toggleWishlist(listing);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isFav
              ? 'bg-rose-50 text-rose-500 shadow-sm'
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Swap Valuation Badge (replaces monetary checkout with barter value) */}
        <div className="absolute bottom-2.5 left-2.5 bg-vinted-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/10">
          <Repeat className="w-3 h-3 text-accent-gold" />
          <span>Value: ~${listing.estimatedValue}</span>
        </div>
      </div>

      {/* Card Info Section */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-surface-muted mb-1">
            <span className="font-bold text-surface-dark truncate max-w-[140px]">
              {listing.brand || 'Unbranded'}
            </span>
            <span className="text-[11px] font-medium text-surface-muted">
              {listing.category}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-xs sm:text-sm font-semibold text-surface-dark line-clamp-1 group-hover:text-vinted-500 transition-colors">
            {listing.title}
          </h4>

          {/* Size · Condition */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-surface-muted">
            <span className="font-semibold text-surface-dark">Size {listing.size}</span>
            <span>·</span>
            <span className="truncate">{listing.condition}</span>
          </div>
        </div>

        {/* Footer: Location City & Owner */}
        <div className="mt-3 pt-2.5 border-t border-surface-divider/60 flex items-center justify-between text-[11px] text-surface-muted">
          <div className="flex items-center gap-1 truncate max-w-[120px]">
            <MapPin className="w-3 h-3 text-vinted-500 flex-shrink-0" />
            <span className="truncate">{listing.city}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {listing.owner?.avatarUrl ? (
              <img
                src={listing.owner.avatarUrl}
                alt={listing.owner.name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-vinted-100 text-vinted-700 flex items-center justify-center text-[9px] font-bold">
                {listing.owner?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="truncate max-w-[80px] font-medium text-surface-dark">
              {listing.owner?.name?.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
