import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ConditionBadge, StatusBadge } from '../common/Badge';
import { MapPin, Repeat, UserCheck, ShieldCheck, Calendar, ArrowRight, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

export const ListingDetailModal = ({
  listing,
  isOpen,
  onClose,
  onProposeSwap,
  onRequireAuth,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!listing) return null;

  const isOwner = user && user._id === listing.owner?._id;
  const isFav = isWishlisted(listing._id);

  const images = listing.images && listing.images.length > 0
    ? listing.images.map((img) =>
        img.startsWith('http') ? img : `http://localhost:5000${img}`
      )
    : [
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop',
      ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Garment Details" maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[310/430] w-full rounded-xl overflow-hidden bg-surface-light border border-surface-divider shadow-inner">
            <img
              src={images[activeImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <StatusBadge status={listing.status} />
            </div>
          </div>

          {/* Thumbnail list if more than 1 image */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-vinted-500 shadow-sm'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Metadata & Swap Proposal */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            {/* Brand & Category */}
            <div>
              <div className="flex items-center justify-between text-xs text-surface-muted">
                <span className="font-bold text-vinted-700 tracking-wide uppercase">
                  {listing.brand || 'Unbranded'}
                </span>
                <span>{listing.category}</span>
              </div>
              <h2 className="text-xl font-extrabold text-surface-dark mt-1 leading-snug">
                {listing.title}
              </h2>
            </div>

            {/* Valuation & Specs */}
            <div className="bg-surface-light p-3.5 rounded-xl border border-surface-divider space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-muted font-medium">Estimated Swap Value</span>
                <span className="text-base font-black text-vinted-600 flex items-center gap-1">
                  <Repeat className="w-4 h-4 text-accent-gold" />
                  ~${listing.estimatedValue}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-surface-divider text-xs">
                <span className="text-surface-muted">Size:</span>
                <span className="font-bold text-surface-dark">Size {listing.size}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-surface-divider text-xs">
                <span className="text-surface-muted">Condition:</span>
                <ConditionBadge condition={listing.condition} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-surface-divider text-xs">
                <span className="text-surface-muted">Location:</span>
                <span className="font-semibold text-surface-dark flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-vinted-500" />
                  {listing.city}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase text-surface-muted tracking-wider mb-1.5">
                Description & Fit
              </h4>
              <p className="text-xs sm:text-sm text-surface-dark leading-relaxed whitespace-pre-line bg-white p-3 rounded-lg border border-surface-divider/60">
                {listing.description}
              </p>
            </div>

            {/* Owner Profile Banner */}
            <div className="bg-vinted-50/60 p-3 rounded-xl border border-vinted-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {listing.owner?.avatarUrl ? (
                  <img
                    src={listing.owner.avatarUrl}
                    alt={listing.owner.name}
                    className="w-10 h-10 rounded-full object-cover border border-vinted-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-vinted-500 text-white flex items-center justify-center font-bold text-sm">
                    {listing.owner?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h5 className="font-bold text-surface-dark text-xs sm:text-sm">
                    {listing.owner?.name}
                  </h5>
                  <p className="text-[11px] text-surface-muted flex items-center gap-1.5 mt-0.5">
                    <span>📍 {listing.owner?.city}</span>
                    <span>·</span>
                    <span className="text-vinted-700 font-semibold flex items-center gap-0.5">
                      <UserCheck className="w-3 h-3" />
                      {listing.owner?.completedSwapsCount || 0} swaps
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-6 pt-4 border-t border-surface-divider space-y-2.5">
            {!isOwner && (
              <button
                type="button"
                aria-label={isFav ? 'Remove from wishlist' : 'Save to wishlist'}
                aria-pressed={isFav}
                onClick={() => {
                  if (!isAuthenticated) {
                    onRequireAuth?.();
                    return;
                  }
                  toggleWishlist(listing);
                }}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${
                  isFav
                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-surface-divider text-surface-dark hover:bg-surface-light'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                <span>{isFav ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
              </button>
            )}

            {isOwner ? (
              <div className="bg-surface-light text-center py-2.5 rounded-xl border border-surface-divider text-xs font-semibold text-surface-muted">
                This is your listing in your closet
              </div>
            ) : listing.status !== 'available' ? (
              <div className="bg-amber-50 text-amber-800 text-center py-2.5 rounded-xl border border-amber-200 text-xs font-semibold">
                This item currently has an active pending swap
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onProposeSwap(listing);
                }}
                className="w-full flex items-center justify-center gap-2 bg-vinted-500 hover:bg-vinted-600 text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.99]"
              >
                <Repeat className="w-4 h-4 text-accent-gold" />
                <span>Propose a Clothing Swap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
