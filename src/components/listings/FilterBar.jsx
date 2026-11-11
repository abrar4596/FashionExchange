import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { CityAutocomplete } from '../common/CityAutocomplete';

const CONDITIONS = [
  'New with tags',
  'New without tags',
  'Very good',
  'Good',
  'Satisfactory',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size'];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Value: Low to High', value: 'value_asc' },
  { label: 'Value: High to Low', value: 'value_desc' },
];

export const FilterBar = ({
  selectedCondition,
  setSelectedCondition,
  selectedSize,
  setSelectedSize,
  selectedSort,
  setSelectedSort,
  selectedCity,
  setSelectedCity,
  selectedCityId,
  setSelectedCityId,
  totalResults,
  onResetFilters,
  hasActiveFilters,
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const toggleCondition = (cond) => {
    if (selectedCondition.includes(cond)) {
      setSelectedCondition(selectedCondition.filter((c) => c !== cond));
    } else {
      setSelectedCondition([...selectedCondition, cond]);
    }
  };

  const toggleSize = (sz) => {
    if (selectedSize.includes(sz)) {
      setSelectedSize(selectedSize.filter((s) => s !== sz));
    } else {
      setSelectedSize([...selectedSize, sz]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-surface-divider p-3.5 sm:p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Toggle & Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Filter Toggle */}
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isFilterDropdownOpen || hasActiveFilters
                ? 'bg-vinted-50 text-vinted-700 border-vinted-300'
                : 'bg-surface-light text-surface-dark border-surface-divider hover:bg-surface-divider/40'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-vinted-500" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-vinted-500"></span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* City / Location Dropdown in FilterBar */}
          <div className="w-48">
            <CityAutocomplete
              value={selectedCity}
              cityId={selectedCityId}
              allowAll
              onChange={(city, id) => {
                setSelectedCity(city);
                setSelectedCityId(id);
              }}
              className="[&_input]:rounded-lg [&_input]:py-1.5 [&_input]:text-xs"
            />
          </div>

          {/* Quick Size Pills */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-surface-divider">
            <span className="text-xs text-surface-muted mr-1 font-medium">Size:</span>
            {['S', 'M', 'L', 'XL'].map((s) => {
              const isSelected = selectedSize.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-vinted-500 text-white font-bold'
                      : 'bg-surface-light text-surface-muted hover:text-surface-dark'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Right: Results Count & Sort Dropdown */}
        <div className="flex items-center gap-3 ml-auto text-xs">
          <span className="text-surface-muted hidden sm:inline">
            <strong className="text-surface-dark">{totalResults}</strong> garments available
          </span>

          <div className="flex items-center gap-1.5 bg-surface-light border border-surface-divider rounded-lg px-2.5 py-1.5">
            <span className="text-surface-muted font-medium">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent text-surface-dark font-semibold focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isFilterDropdownOpen && (
        <div className="mt-4 pt-4 border-t border-surface-divider grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Condition Multi-select */}
          <div>
            <h5 className="text-xs font-bold text-surface-dark uppercase tracking-wider mb-2">
              Condition Tier
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map((cond) => {
                const isSelected = selectedCondition.includes(cond);
                return (
                  <button
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-vinted-500 text-white border-vinted-500 shadow-sm'
                        : 'bg-white text-surface-muted border-surface-divider hover:border-surface-dark'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{cond}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Sizes */}
          <div>
            <h5 className="text-xs font-bold text-surface-dark uppercase tracking-wider mb-2">
              All Garment Sizes
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((sz) => {
                const isSelected = selectedSize.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-vinted-500 text-white border-vinted-500 shadow-sm'
                        : 'bg-white text-surface-muted border-surface-divider hover:border-surface-dark'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
