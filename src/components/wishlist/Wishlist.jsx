import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { resolveImageUrl, handleImageError } from '../../utils/imageUrl';

// Inline SVGs keep this page dependency-free (no additional icon package required).
const baseProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
};

const HeartIcon = (props) => (
  <svg {...baseProps} strokeWidth={1.5} {...props}>
    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const TrashIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const RepeatIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const MapPinIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ArrowLeftIcon = (props) => (
  <svg {...baseProps} {...props}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const WishlistCard = ({ item, onSelectListing, onProposeSwap, onRemove }) => {
  const isAvailable = item.status === 'available';

  return (
    <div
      onClick={() => onSelectListing(item)}
      className="group bg-white rounded-xl border border-surface-divider overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col cursor-pointer"
    >
      <div className="relative aspect-[310/430] w-full overflow-hidden bg-surface-divider/40">
        <img
          src={resolveImageUrl(item.images?.[0])}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={handleImageError}
        />

        {/* Saved indicator doubles as a remove action */}
        <button
          type="button"
          aria-label="Remove from wishlist"
          aria-pressed="true"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item);
          }}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-rose-50 text-rose-500 shadow-sm backdrop-blur-md hover:bg-rose-100 transition-all"
        >
          <HeartIcon className="w-4 h-4" fill="currentColor" />
        </button>

        <div className="absolute bottom-2.5 left-2.5 bg-vinted-900/85 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md border border-white/10">
          <RepeatIcon className="w-3 h-3 text-accent-gold" />
          <span>Value: ~${item.estimatedValue}</span>
        </div>
      </div>

      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-surface-muted mb-1">
            <span className="font-bold text-surface-dark truncate max-w-[140px]">
              {item.brand || 'Unbranded'}
            </span>
            <span className="text-[11px] font-medium text-surface-muted">{item.category}</span>
          </div>

          <h4 className="text-xs sm:text-sm font-semibold text-surface-dark line-clamp-1 group-hover:text-vinted-500 transition-colors">
            {item.title}
          </h4>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-surface-muted">
            <span className="font-semibold text-surface-dark">Size {item.size}</span>
            <span>·</span>
            <span className="truncate">{item.condition}</span>
          </div>

          <div className="mt-2 flex items-center gap-1 text-[11px] text-surface-muted">
            <MapPinIcon className="w-3 h-3 text-vinted-500 flex-shrink-0" />
            <span className="truncate">{item.city}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-divider/60 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item);
            }}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border border-surface-divider text-surface-muted hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-semibold transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={(e) => {
              e.stopPropagation();
              onProposeSwap(item);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-vinted-500 hover:bg-vinted-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.99]"
          >
            <RepeatIcon className="w-3.5 h-3.5 text-accent-gold" />
            <span>{isAvailable ? 'Propose Swap' : 'Unavailable'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Wishlist = ({ onSelectListing, onProposeSwap, onNavigateView }) => {
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-vinted-500 text-white flex items-center justify-center shadow-md">
            <HeartIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-surface-dark leading-tight">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-surface-muted">
              {wishlist.length > 0
                ? `${wishlist.length} saved ${wishlist.length === 1 ? 'garment' : 'garments'} ready to swap`
                : 'Garments you save will appear here'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateView('browse')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-divider text-xs sm:text-sm font-semibold text-surface-dark hover:bg-surface-light transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to browsing</span>
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && wishlist.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-surface-divider overflow-hidden"
            >
              <div className="aspect-[310/430] w-full skeleton-shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-1/3 skeleton-shimmer rounded" />
                <div className="h-4 w-4/5 skeleton-shimmer rounded" />
                <div className="h-3 w-1/2 skeleton-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && wishlist.length === 0 && (
        <div className="py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-surface-divider max-w-xl mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-vinted-50 text-vinted-500 mx-auto flex items-center justify-center mb-4">
            <HeartIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-surface-dark">Your wishlist is empty</h3>
          <p className="text-sm text-surface-muted mt-1.5 max-w-md mx-auto">
            Tap the heart on any garment you like and it will be saved here for easy swapping
            later.
          </p>
          <button
            type="button"
            onClick={() => onNavigateView('browse')}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-vinted-500 hover:bg-vinted-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <RepeatIcon className="w-4 h-4" />
            <span>Browse garments to swap</span>
          </button>
        </div>
      )}

      {/* Responsive saved-items grid: 1 col mobile, 2-3 tablet, 4 desktop */}
      {wishlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => (
            <WishlistCard
              key={item._id}
              item={item}
              onSelectListing={onSelectListing}
              onProposeSwap={onProposeSwap}
              onRemove={removeFromWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};
