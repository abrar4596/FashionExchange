import React, { useEffect, useId, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import api from '../../services/api';

const DEBOUNCE_MS = 180;

const highlightMatch = (text, query) => {
  const index = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index < 0 || !query.trim()) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-100 text-inherit">
        {text.slice(index, index + query.trim().length)}
      </mark>
      {text.slice(index + query.trim().length)}
    </>
  );
};

export const CityAutocomplete = ({
  id,
  label,
  value = '',
  cityId = '',
  onChange,
  allowAll = false,
  placeholder = 'Type a city or town',
  required = false,
  className = '',
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listboxId = `${inputId}-options`;
  const [draftValue, setDraftValue] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError('');
        const response = await api.get('/v1/locations/cities', {
          params: { q: normalizedQuery, limit: 20 },
          signal: controller.signal,
        });
        setResults(response.data.cities || []);
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          console.error('City search error:', error);
          setResults([]);
          setSearchError('City search is unavailable. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const chooseCity = (city) => {
    const labelValue = `${city.name}, ${city.state}`;
    setDraftValue(null);
    setQuery('');
    setResults([]);
    setIsSearching(false);
    setActiveIndex(-1);
    setIsOpen(false);
    onChange(labelValue, city.id);
  };

  const chooseAll = () => {
    setDraftValue(null);
    setQuery('');
    setResults([]);
    setIsSearching(false);
    setActiveIndex(-1);
    setIsOpen(false);
    onChange('all', '');
  };

  const options = allowAll && query.trim().length < 2
    ? [{ id: `${listboxId}-all`, all: true, name: 'All cities' }]
    : results;

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
      event.preventDefault();
      const selectedOption = options[activeIndex];
      if (selectedOption?.all) chooseAll();
      else if (selectedOption) chooseCity(selectedOption);
    } else if (event.key === 'Enter' && isOpen) {
      event.preventDefault();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const isSelected = (city) => city.id === cityId;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-xs font-semibold text-surface-dark">
          {label}
        </label>
      )}
      <div className="relative">
        <MapPin
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-muted"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeIndex >= 0 ? options[activeIndex]?.id : undefined}
          aria-required={required}
          aria-label={label ? undefined : 'Search city or town'}
          value={draftValue === null ? (value === 'all' ? '' : value) : draftValue}
          placeholder={value === 'all' && allowAll ? 'All cities' : placeholder}
          required={required}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraftValue(nextValue);
            setQuery(nextValue);
            setActiveIndex(-1);
            setIsOpen(true);
            if (nextValue.trim().length < 2) {
              setResults([]);
              setIsSearching(false);
              setSearchError('');
            }
          }}
          onBlur={() => {
            setDraftValue(null);
            setQuery('');
            setIsOpen(false);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-surface-divider bg-surface-light py-2 pl-9 pr-3 text-xs text-surface-dark focus:border-vinted-500 focus:bg-white focus:outline-none sm:text-sm"
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-surface-divider bg-white shadow-xl">
          <ul
            id={listboxId}
            role="listbox"
            aria-label="City and town suggestions"
            className="max-h-64 overflow-y-auto py-1"
          >
            {allowAll && query.trim().length < 2 && (
              <li
                id={`${listboxId}-all`}
                role="option"
                aria-selected={value === 'all'}
                className={`cursor-pointer px-3 py-2 text-sm text-surface-dark ${
                  activeIndex === 0 ? 'bg-vinted-50' : 'hover:bg-surface-light'
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={chooseAll}
              >
                All cities
              </li>
            )}
            {options.filter((option) => !option.all).map((city, index) => {
              const optionIndex = allowAll && query.trim().length < 2 ? index + 1 : index;
              return (
                <li
                  id={city.id}
                  key={city.id}
                  role="option"
                  aria-selected={isSelected(city) || activeIndex === optionIndex}
                  className={`cursor-pointer px-3 py-2 text-left ${
                    activeIndex === optionIndex || isSelected(city)
                      ? 'bg-vinted-50'
                      : 'hover:bg-surface-light'
                  }`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseCity(city)}
                >
                  <span className="block text-sm font-semibold text-surface-dark">
                    {highlightMatch(city.name, query)}
                    <span className="font-normal text-surface-muted"> ({city.state})</span>
                  </span>
                  <span className="block text-[11px] text-surface-muted">
                    {city.district} · Tier {city.tier}
                  </span>
                </li>
              );
            })}
            {query.trim().length >= 2 && isSearching && (
              <li className="px-3 py-2 text-xs text-surface-muted" role="status">
                Searching cities and towns…
              </li>
            )}
            {query.trim().length >= 2 && !results.length && !isSearching && !searchError && (
              <li className="px-3 py-2 text-xs text-surface-muted" role="status">
                No matching cities or towns.
              </li>
            )}
            {searchError && (
              <li className="px-3 py-2 text-xs text-rose-700" role="status">
                {searchError}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
