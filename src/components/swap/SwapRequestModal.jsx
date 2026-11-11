import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Repeat, CheckCircle2, AlertCircle, ArrowRight, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import { useSwap } from '../../context/SwapContext';
import { useAuth } from '../../context/AuthContext';

export const SwapRequestModal = ({
  requestedItem,
  isOpen,
  onClose,
  onOpenNewListingModal,
}) => {
  const { user } = useAuth();
  const { createSwap } = useSwap();
  const [closetItems, setClosetItems] = useState([]);
  const [selectedOfferedItem, setSelectedOfferedItem] = useState(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchCloset = async () => {
        try {
          setIsLoading(true);
          const res = await api.get('/listings/user/closet');
          const available = res.data.available || [];
          setClosetItems(available);
          if (available.length > 0) {
            setSelectedOfferedItem(available[0]);
          }
        } catch (err) {
          console.error('Fetch closet error:', err);
          setError('Failed to load your closet items.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCloset();
    }
  }, [isOpen]);

  if (!requestedItem) return null;

  const valueDiff = selectedOfferedItem
    ? selectedOfferedItem.estimatedValue - requestedItem.estimatedValue
    : 0;

  const handleSendSwap = async (e) => {
    e.preventDefault();
    if (!selectedOfferedItem) {
      setError('Please select an item from your closet to offer in exchange.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createSwap(
        requestedItem._id,
        selectedOfferedItem._id,
        initialMessage.trim() ||
          `Hi! I'd love to swap my "${selectedOfferedItem.title}" for your "${requestedItem.title}".`
      );
      onClose();
    } catch (err) {
      console.error('Create swap error:', err);
      setError(err.response?.data?.message || 'Could not initiate swap request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Propose a Garment Swap" maxWidth="max-w-2xl">
      <form onSubmit={handleSendSwap} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Target Item Being Requested */}
        <div>
          <span className="text-xs font-bold text-surface-muted uppercase tracking-wider block mb-2">
            1. You Want to Receive:
          </span>
          <div className="flex items-center gap-3 p-3 bg-surface-light rounded-xl border border-surface-divider">
            <img
              src={
                requestedItem.images?.[0]?.startsWith('http')
                  ? requestedItem.images[0]
                  : `http://localhost:5000${requestedItem.images?.[0]}`
              }
              alt={requestedItem.title}
              className="w-14 h-18 rounded-lg object-cover border border-surface-divider flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-bold text-vinted-700 uppercase">
                {requestedItem.brand}
              </span>
              <h4 className="text-sm font-bold text-surface-dark truncate">
                {requestedItem.title}
              </h4>
              <p className="text-xs text-surface-muted mt-0.5">
                Size {requestedItem.size} · {requestedItem.condition} · {requestedItem.city}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-xs text-surface-muted block font-medium">Estimated Value</span>
              <span className="text-sm font-black text-surface-dark">
                ~${requestedItem.estimatedValue}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Closet Item Picker (What you're offering) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-surface-muted uppercase tracking-wider">
              2. Select an Item from Your Closet to Trade:
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewListingModal();
              }}
              className="text-xs font-semibold text-vinted-600 hover:text-vinted-700 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add New Item</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-surface-muted">
              Loading your closet garments...
            </div>
          ) : closetItems.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
              <p className="text-xs font-semibold text-amber-900">
                You don't have any available items in your closet yet!
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                To barter on FashionExchange, you need at least one wearable garment listed.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewListingModal();
                }}
                className="mt-3 px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                + List a Garment Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {closetItems.map((item) => {
                const isSelected = selectedOfferedItem?._id === item._id;
                const img = item.images?.[0]?.startsWith('http')
                  ? item.images[0]
                  : `http://localhost:5000${item.images?.[0]}`;

                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedOfferedItem(item)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-vinted-500 bg-vinted-50/70 shadow-sm ring-1 ring-vinted-500'
                        : 'border-surface-divider bg-white hover:bg-surface-light'
                    }`}
                  >
                    <img
                      src={img}
                      alt={item.title}
                      className="w-10 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-surface-dark truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-surface-muted">
                        ~${item.estimatedValue} · Size {item.size}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-vinted-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Valuation Comparison & Equity Balance */}
        {selectedOfferedItem && (
          <div className="p-3 bg-surface-light rounded-xl border border-surface-divider flex items-center justify-between text-xs">
            <span className="text-surface-muted font-medium flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-vinted-500" />
              <span>Valuation Equity:</span>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                Math.abs(valueDiff) <= 10
                  ? 'bg-emerald-100 text-emerald-800'
                  : valueDiff > 10
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {Math.abs(valueDiff) <= 5
                ? 'Equitable Swap (~$0 diff)'
                : valueDiff > 0
                ? `+$${valueDiff} in recipient's favor`
                : `-$${Math.abs(valueDiff)} difference`}
            </span>
          </div>
        )}

        {/* 4. Personalized Message */}
        <div>
          <label className="block text-xs font-semibold text-surface-dark mb-1">
            Opening Message to Owner (optional)
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Hi! Love your item. Would you be open to exchanging for my vintage piece?"
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-2 text-xs text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
          ></textarea>
        </div>

        {/* Footer / Send CTA */}
        <div className="pt-2 border-t border-surface-divider flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-surface-muted hover:text-surface-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedOfferedItem || isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-vinted-500 hover:bg-vinted-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99]"
          >
            <Repeat className="w-4 h-4" />
            <span>{isSubmitting ? 'Sending Proposal...' : 'Send Swap Request'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
