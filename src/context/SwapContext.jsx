import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

const SwapContext = createContext();

export const SwapProvider = ({ children }) => {
  const { isAuthenticated, refreshUser, user, logout } = useAuth();
  const [swaps, setSwaps] = useState({ incoming: [], outgoing: [], all: [] });
  const [pendingCount, setPendingCount] = useState(0);
  const [activeSwap, setActiveSwap] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSwaps = useCallback(async () => {
    if (!isAuthenticated) {
      setSwaps({ incoming: [], outgoing: [], all: [] });
      setPendingCount(0);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/swaps/my-swaps');
      setSwaps(res.data);
      // Pending requests where user is the receiver
      const pendingIncoming = res.data.incoming?.filter((s) => s.status === 'pending') || [];
      setPendingCount(pendingIncoming.length);
    } catch (err) {
      console.error('Fetch swaps error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSwaps();
    // Poll every 10 seconds for new incoming swaps/messages if authenticated
    if (isAuthenticated) {
      const interval = setInterval(fetchSwaps, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchSwaps, isAuthenticated]);

  useRealtimeSync({
    enabled: isAuthenticated,
    events: ['swap:requested', 'swap:statusChanged', 'admin:action'],
    onEvent: (eventName, payload) => {
      if (eventName !== 'admin:action' || payload.userId !== user?._id) return;
      if (payload.status === 'suspended') logout();
      else if (payload.role && payload.role !== user?.role) refreshUser();
    },
    onDisconnect: refreshUser,
    refresh: fetchSwaps,
    pollInterval: 0,
  });

  const createSwap = async (requestedItemId, offeredItemId, initialMessage) => {
    const res = await api.post('/swaps', {
      requestedItemId,
      offeredItemId,
      initialMessage,
    });
    await fetchSwaps();
    // Open chat for this newly created swap
    setActiveSwap(res.data);
    setIsChatOpen(true);
    return res.data;
  };

  const updateSwapStatus = async (swapId, status) => {
    const res = await api.patch(`/swaps/${swapId}/status`, { status });
    await fetchSwaps();
    await refreshUser();
    if (activeSwap && activeSwap._id === swapId) {
      setActiveSwap(res.data);
    }
    return res.data;
  };

  const openChat = (swap) => {
    setActiveSwap(swap);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <SwapContext.Provider
      value={{
        swaps,
        pendingCount,
        activeSwap,
        setActiveSwap,
        isChatOpen,
        isLoading,
        fetchSwaps,
        createSwap,
        updateSwapStatus,
        openChat,
        closeChat,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};

export const useSwap = () => useContext(SwapContext);
