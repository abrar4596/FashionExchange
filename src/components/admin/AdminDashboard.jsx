import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Users,
  Shirt,
  Repeat,
  TrendingUp,
  MapPin,
  Trash2,
  Ban,
  CheckCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

export const AdminDashboard = ({ onSelectListing }) => {
  const [metricsData, setMetricsData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('metrics');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const fetchAdminData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      const response = await api.get('/admin/dashboard');
      setMetricsData(response.data);
      setUsersList(response.data.users || []);
      setRecentListings(response.data.listings || []);
      setActiveSwaps(response.data.activeSwaps || []);
      setDashboardError('');
    } catch (err) {
      console.error('Fetch admin data error:', err);
      setDashboardError(err.response?.data?.message || 'Unable to load current dashboard data.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData(true);
  }, [fetchAdminData]);

  useRealtimeSync({
    enabled: true,
    events: [
      'listing:created',
      'listing:updated',
      'listing:deleted',
      'swap:requested',
      'swap:statusChanged',
      'admin:action',
      'user:registered',
      'user:profileUpdated',
    ],
    refresh: fetchAdminData,
    pollInterval: 10000,
  });

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/users/${userId}`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      console.error('Toggle user status error:', err);
      alert('Failed to update user status.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing permanently from the platform?')) return;
    try {
      await api.delete(`/admin/listings/${listingId}`);
      fetchAdminData();
    } catch (err) {
      console.error('Admin delete listing error:', err);
      alert('Failed to delete listing.');
    }
  };

  const handleAdminSwapStatus = async (swapId, status) => {
    const action = status === 'completed' ? 'mark this swap completed' : 'cancel this swap';
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    try {
      await api.patch(`/swaps/${swapId}/status`, { status });
      await fetchAdminData();
    } catch (err) {
      console.error('Admin swap update error:', err);
      alert(err.response?.data?.message || 'Failed to update swap.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center text-xs text-surface-muted">
        Loading administrator dashboard...
      </div>
    );
  }

  if (!metricsData) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p role="alert" className="text-sm text-rose-700">{dashboardError}</p>
        <button
          onClick={() => fetchAdminData(true)}
          className="mt-4 rounded-lg bg-vinted-500 px-4 py-2 text-xs font-bold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    metrics,
    regionalBreakdown,
    categoryBreakdown,
    recentActivity = [],
    capabilities = {},
    pagination,
  } = metricsData || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {dashboardError && (
        <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Showing the last loaded data. {dashboardError}
        </p>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-vinted-50 text-vinted-600 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-surface-dark">Administrative Oversight</h1>
          </div>
          <p className="text-xs text-surface-muted mt-1">
            Platform governance, barter metrics, user status management, and listing moderation.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-surface-light p-1 rounded-xl border border-surface-divider text-xs font-bold">
          <button
            onClick={() => setActiveAdminTab('metrics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'metrics'
                ? 'bg-white text-surface-dark shadow-xs'
                : 'text-surface-muted hover:text-surface-dark'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'users'
                ? 'bg-white text-surface-dark shadow-xs'
                : 'text-surface-muted hover:text-surface-dark'
            }`}
          >
            Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('listings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'listings'
                ? 'bg-white text-surface-dark shadow-xs'
                : 'text-surface-muted hover:text-surface-dark'
            }`}
          >
            Moderation ({recentListings.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('swaps')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeAdminTab === 'swaps'
                ? 'bg-white text-surface-dark shadow-xs'
                : 'text-surface-muted hover:text-surface-dark'
            }`}
          >
            Swaps ({activeSwaps.length})
          </button>
        </div>
      </div>

      {/* METRICS VIEW (PRD Section 5) */}
      {activeAdminTab === 'metrics' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-surface-divider shadow-xs">
              <div className="flex items-center justify-between text-surface-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Registered Swappers</span>
                <Users className="w-4 h-4 text-vinted-500" />
              </div>
              <p className="text-2xl font-black text-surface-dark mt-2">{metrics?.totalUsers || 0}</p>
              <span className="text-[11px] text-surface-muted mt-1 block">Active user accounts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-divider shadow-xs">
              <div className="flex items-center justify-between text-surface-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Active Clothing Pool</span>
                <Shirt className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-surface-dark mt-2">{metrics?.activeListings || 0}</p>
              <span className="text-[11px] text-surface-muted mt-1 block">
                {metrics?.totalListings || 0} total lifetime garments
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-divider shadow-xs">
              <div className="flex items-center justify-between text-surface-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Completed Swaps</span>
                <Repeat className="w-4 h-4 text-accent-gold" />
              </div>
              <p className="text-2xl font-black text-surface-dark mt-2">{metrics?.completedSwaps || 0}</p>
              <span className="text-[11px] text-surface-muted mt-1 block">
                {metrics?.totalSwaps || 0} initiated proposals
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-divider shadow-xs">
              <div className="flex items-center justify-between text-surface-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Swap Conversion Rate</span>
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-surface-dark mt-2">
                {metrics?.swapConversionRate || 0}%
              </p>
              <span className="text-[11px] text-surface-muted mt-1 block">
                Density: {metrics?.listingDensity || 0} items / user
              </span>
            </div>
          </div>

          {/* Regional & Category Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-surface-divider">
              <h3 className="font-bold text-sm text-surface-dark flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-vinted-500" />
                <span>Regional Listing Density</span>
              </h3>
              <div className="space-y-2">
                {regionalBreakdown?.map((reg) => (
                  <div key={reg._id} className="flex items-center justify-between text-xs py-1.5 border-b border-surface-divider/50">
                    <span className="font-semibold text-surface-dark">{reg._id}</span>
                    <span className="bg-surface-light px-2.5 py-0.5 rounded-full font-bold text-vinted-700">
                      {reg.count} items
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-surface-divider">
              <h3 className="font-bold text-sm text-surface-dark flex items-center gap-2 mb-3">
                <Shirt className="w-4 h-4 text-vinted-500" />
                <span>Category Distribution</span>
              </h3>
              <div className="space-y-2">
                {categoryBreakdown?.map((cat) => (
                  <div key={cat._id} className="flex items-center justify-between text-xs py-1.5 border-b border-surface-divider/50">
                    <span className="font-semibold text-surface-dark">{cat._id}</span>
                    <span className="bg-surface-light px-2.5 py-0.5 rounded-full font-bold text-surface-dark">
                      {cat.count} items
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-surface-divider">
            <h3 className="font-bold text-sm text-surface-dark mb-3">Recent Platform Activity</h3>
            {recentActivity.length ? (
              <ul className="space-y-2">
                {recentActivity.map((activity) => (
                  <li
                    key={`${activity.type}-${activity.entityId}`}
                    className="flex items-center justify-between gap-4 border-b border-surface-divider/50 py-2 text-xs"
                  >
                    <span className="text-surface-dark">{activity.label}</span>
                    <time className="shrink-0 text-surface-muted">
                      {activity.occurredAt ? new Date(activity.occurredAt).toLocaleString() : ''}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-surface-muted">No platform activity yet.</p>
            )}
            <p className="mt-3 text-[11px] text-surface-muted">
              Showing up to {pagination?.usersLimit || 100} most recent users, listings, and swaps per dashboard snapshot.
              Flagged content: {capabilities.flaggedContent ? 'enabled' : 'not configured'}.
            </p>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-surface-divider overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-light border-b border-surface-divider font-bold text-surface-muted uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Swapper</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Completed Swaps</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-divider">
              {usersList.map((u) => (
                <tr key={u._id} className="hover:bg-surface-light/40 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-vinted-100 text-vinted-700 font-bold flex items-center justify-center text-xs">
                        {u.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-surface-dark">{u.name}</p>
                      <p className="text-[11px] text-surface-muted">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-surface-dark font-medium">{u.city}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-surface-dark">
                    {u.completedSwapsCount || 0}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u._id, u.status)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-colors ${
                        u.status === 'active'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* LISTINGS MODERATION TAB */}
      {activeAdminTab === 'listings' && (
        <div className="bg-white rounded-2xl border border-surface-divider overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-light border-b border-surface-divider font-bold text-surface-muted uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Condition & Size</th>
                <th className="px-4 py-3">Owner & Location</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-5 py-3 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-divider">
              {recentListings.map((item) => {
                const img = item.images?.[0]?.startsWith('http')
                  ? item.images[0]
                  : `http://localhost:5000${item.images?.[0]}`;
                return (
                  <tr key={item._id} className="hover:bg-surface-light/40 transition-colors">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img src={img} alt="" className="w-10 h-12 rounded object-cover flex-shrink-0" />
                      <div className="min-w-0 max-w-[180px]">
                        <p className="font-bold text-surface-dark truncate">{item.title}</p>
                        <p className="text-[11px] text-surface-muted truncate">{item.brand}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-surface-dark">{item.category}</td>
                    <td className="px-4 py-3 text-surface-muted">
                      Size {item.size} · {item.condition}
                    </td>
                    <td className="px-4 py-3 text-surface-dark">
                      <p className="font-semibold">{item.owner?.name}</p>
                      <p className="text-[11px] text-surface-muted">{item.city}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-vinted-600">~${item.estimatedValue}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDeleteListing(item._id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                        title="Remove inappropriate content"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeAdminTab === 'swaps' && (
        <div className="space-y-3">
          {!capabilities.disputeTracking && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Swap monitoring is live. Dispute tracking is unavailable because this application has no dispute/report model yet.
            </p>
          )}
          <div className="overflow-x-auto rounded-2xl border border-surface-divider bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-divider bg-surface-light font-bold uppercase tracking-wider text-surface-muted">
                <tr>
                  <th className="px-5 py-3">Swap</th>
                  <th className="px-4 py-3">Participants</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-divider">
                {activeSwaps.map((swap) => (
                  <tr key={swap._id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-surface-dark">
                        {swap.requestedItem?.title || 'Requested item'} ↔ {swap.offeredItem?.title || 'Offered item'}
                      </p>
                      <p className="text-[11px] text-surface-muted">{swap._id}</p>
                    </td>
                    <td className="px-4 py-3 text-surface-dark">
                      {swap.requester?.name || 'Unknown'} → {swap.receiver?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 capitalize text-surface-dark">{swap.status}</td>
                    <td className="px-5 py-3 text-surface-muted">
                      {swap.updatedAt ? new Date(swap.updatedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {swap.status === 'accepted' && (
                        <button
                          onClick={() => handleAdminSwapStatus(swap._id, 'completed')}
                          className="mr-2 inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1 text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleAdminSwapStatus(swap._id, 'cancelled')}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-rose-700 hover:bg-rose-50"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
                {!activeSwaps.length && (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-surface-muted">
                      No pending or accepted swaps.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
