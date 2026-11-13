import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, ConditionBadge } from '../common/Badge';
import { MapPin, UserCheck, Shirt, Trash2, Edit3, PlusCircle, Repeat } from 'lucide-react';
import api from '../../services/api';
import { CityAutocomplete } from '../common/CityAutocomplete';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { resolveImageUrl, handleImageError } from '../../utils/imageUrl';

export const UserProfileView = ({ onOpenNewListingModal, onSelectListing }) => {
  const { user, updateUserProfile, updateUserBio, refreshUser } = useAuth();
  const [closetData, setClosetData] = useState({
    available: [],
    pending: [],
    swapped: [],
    stats: {},
  });
  const [activeTab, setActiveTab] = useState('available');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedCloset, setHasLoadedCloset] = useState(false);
  const [closetError, setClosetError] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [cityName, setCityName] = useState(user?.city || '');
  const [cityId, setCityId] = useState(user?.cityId || '');

  const fetchCloset = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await api.get('/users/me/closet');
      setClosetData(res.data);
      setHasLoadedCloset(true);
      setClosetError('');
    } catch (err) {
      console.error('Fetch closet error:', err);
      setClosetError(err.response?.data?.message || 'Unable to load your closet right now.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCloset(true);
  }, [fetchCloset]);

  useRealtimeSync({
    enabled: Boolean(user?._id),
    events: [
      'listing:created',
      'listing:updated',
      'listing:deleted',
      'swap:requested',
      'swap:statusChanged',
      'admin:action',
      'user:profileUpdated',
    ],
    onEvent: (eventName) => {
      if (eventName === 'user:profileUpdated') refreshUser();
    },
    refresh: fetchCloset,
    pollInterval: 10000,
  });

  const handleDeleteListing = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this garment listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      fetchCloset();
    } catch (err) {
      console.error('Delete listing error:', err);
      alert('Failed to delete listing.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (cityName !== user?.city || cityId !== (user?.cityId || '')) {
        await updateUserProfile({ city: cityName, cityId });
      }
      await updateUserBio(bioText);
      setIsEditingBio(false);
    } catch (err) {
      console.error('Update bio error:', err);
    }
  };

  const currentListings = closetData[activeTab] || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-surface-divider p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-vinted-200 shadow-md"
                onError={handleImageError}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-vinted-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-surface-dark">{user?.name}</h1>
                <span className="bg-vinted-50 text-vinted-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-vinted-200">
                  {user?.role === 'admin' ? 'Administrator' : 'Swapper'}
                </span>
              </div>
              <p className="text-xs text-surface-muted flex items-center gap-1.5 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-vinted-500" />
                <span>{user?.city}</span>
                <span>·</span>
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Counter Stats */}
          <div className="flex items-center gap-4 bg-surface-light p-3 rounded-xl border border-surface-divider text-center w-full sm:w-auto justify-around">
            <div className="px-3">
              <span className="block text-xl font-black text-vinted-600">
                {closetData.stats?.activeClothes ?? closetData.available?.length ?? 0}
              </span>
              <span className="text-[11px] text-surface-muted font-medium">Active Clothes</span>
            </div>
            <div className="w-px h-8 bg-surface-divider"></div>
            <div className="px-3">
              <span className="block text-xl font-black text-emerald-600">
                {closetData.stats?.completedSwaps ?? user?.completedSwapsCount ?? 0}
              </span>
              <span className="text-[11px] text-surface-muted font-medium">Completed Swaps</span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-5 pt-4 border-t border-surface-divider">
          {isEditingBio ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CityAutocomplete
                  label="Your City / Local Region"
                  value={cityName}
                  cityId={cityId}
                  onChange={(nextCity, nextCityId) => {
                    setCityName(nextCity);
                    setCityId(nextCityId);
                  }}
                  className="[&_input]:rounded-lg [&_input]:py-1.5"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-surface-dark block mb-1">
                  Bio & Swap Preferences
                </label>
                <textarea
                  rows="2"
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-1.5 text-xs text-surface-dark focus:outline-none focus:border-vinted-500"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1 text-xs text-surface-muted hover:text-surface-dark"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 bg-vinted-500 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-vinted-600"
                >
                  Save Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs sm:text-sm text-surface-dark italic">
                "{user?.bio || 'Circular wardrobe enthusiast.'}"
              </p>
              <button
                onClick={() => setIsEditingBio(true)}
                className="text-xs text-vinted-600 hover:text-vinted-700 font-semibold flex items-center gap-1 flex-shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Bio</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Closet Management Tabs */}
      <div>
        <div className="flex items-center justify-between border-b border-surface-divider pb-3">
          <div className="flex space-x-2 sm:space-x-4">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'available'
                  ? 'bg-vinted-500 text-white shadow-sm'
                  : 'text-surface-muted hover:text-surface-dark hover:bg-white'
              }`}
            >
              Available to Swap ({closetData.available?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-vinted-500 text-white shadow-sm'
                  : 'text-surface-muted hover:text-surface-dark hover:bg-white'
              }`}
            >
              Pending Swaps ({closetData.stats?.pendingRequests ?? closetData.pending?.length ?? 0})
            </button>
            <button
              onClick={() => setActiveTab('swapped')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'swapped'
                  ? 'bg-vinted-500 text-white shadow-sm'
                  : 'text-surface-muted hover:text-surface-dark hover:bg-white'
              }`}
            >
              Swapped History ({closetData.swapped?.length || 0})
            </button>
          </div>

          <button
            onClick={onOpenNewListingModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-vinted-50 text-vinted-700 border border-vinted-200 rounded-xl text-xs font-bold hover:bg-vinted-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-vinted-500" />
            <span>Add Garment</span>
          </button>
        </div>

        {/* Listings in selected tab */}
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-surface-muted">
              Loading your closet...
            </div>
          ) : closetError && !hasLoadedCloset ? (
            <div role="alert" className="text-center py-12 text-sm text-rose-700">
              <p>{closetError}</p>
              <button
                onClick={() => fetchCloset(true)}
                className="mt-3 rounded-lg bg-vinted-500 px-4 py-2 text-xs font-bold text-white"
              >
                Retry
              </button>
            </div>
          ) : currentListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-surface-divider">
              <Shirt className="w-10 h-10 text-surface-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-surface-dark">No garments in this section</p>
              {activeTab === 'available' && (
                <button
                  onClick={onOpenNewListingModal}
                  className="mt-4 px-4 py-2 bg-vinted-500 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  + Add First Clothing Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentListings.map((item) => {
                const img = resolveImageUrl(item.images?.[0]);
                return (
                  <div
                    key={item._id}
                    onClick={() => onSelectListing(item)}
                    className="group bg-white rounded-xl border border-surface-divider overflow-hidden hover:shadow-card-hover transition-all flex flex-col cursor-pointer relative"
                  >
                    <div className="aspect-[310/430] w-full bg-surface-divider/40 relative overflow-hidden">
                      <img
                        src={img}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={handleImageError}
                      />
                      <div className="absolute top-2 left-2">
                        <StatusBadge status={item.status} />
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteListing(item._id, e)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white hover:bg-rose-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 flex flex-col justify-between flex-1">
                      <div>
                        <div className="text-[11px] text-surface-muted font-bold truncate">
                          {item.brand}
                        </div>
                        <h4 className="text-xs font-bold text-surface-dark truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-surface-muted mt-1">
                          Size {item.size} · {item.condition}
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-surface-divider flex items-center justify-between text-xs font-bold">
                        <span className="text-vinted-600">~${item.estimatedValue}</span>
                        <span className="text-[10px] text-surface-muted">📍 {item.city}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
