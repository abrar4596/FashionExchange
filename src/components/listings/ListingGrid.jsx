import React from 'react';
import { ListingCard } from './ListingCard';
import { Shirt, RefreshCw } from 'lucide-react';

export const ListingGrid = ({
  listings,
  isLoading,
  onSelectListing,
  onProposeSwap,
  onResetFilters,
  onRequireAuth,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-surface-divider overflow-hidden flex flex-col"
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
    );
  }

  if (!listings || listings.length === 0) {
    return (
      <div className="py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-surface-divider max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-vinted-50 text-vinted-500 mx-auto flex items-center justify-center mb-4">
          <Shirt className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-surface-dark">No clothing listings match your filters</h3>
        <p className="text-sm text-surface-muted mt-1.5 max-w-md mx-auto">
          Try expanding your search query, choosing a different city/region, or clearing your condition filters.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-vinted-500 hover:bg-vinted-600 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
      {listings.map((item) => (
        <ListingCard
          key={item._id}
          listing={item}
          onSelect={onSelectListing}
          onProposeSwap={onProposeSwap}
          onRequireAuth={onRequireAuth}
        />
      ))}
    </div>
  );
};
