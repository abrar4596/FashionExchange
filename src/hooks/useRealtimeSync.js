import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

const socketOrigin = () => new URL(api.defaults.baseURL).origin;

export const useRealtimeSync = ({
  enabled,
  events,
  onEvent,
  onDisconnect,
  refresh,
  pollInterval = 10000,
}) => {
  const callbacks = useRef({ onEvent, onDisconnect, refresh });
  const eventKey = [...events].sort().join('|');

  useEffect(() => {
    callbacks.current = { onEvent, onDisconnect, refresh };
  }, [onDisconnect, onEvent, refresh]);

  useEffect(() => {
    if (!enabled) return undefined;

    let disposed = false;
    let pollTimer;
    const token = localStorage.getItem('fashion_token');
    if (!token) return undefined;

    const refreshSafely = () => {
      if (!disposed) {
        Promise.resolve(callbacks.current.refresh?.()).catch((error) => {
          console.error('Realtime refresh failed:', error);
        });
      }
    };

    const socket = io(socketOrigin(), {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
    });

    const startPolling = () => {
      if (!pollInterval || pollTimer || disposed) return;
      pollTimer = setInterval(refreshSafely, pollInterval);
    };
    const stopPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = undefined;
    };

    socket.on('connect', () => {
      stopPolling();
      refreshSafely();
    });
    socket.on('disconnect', (reason) => {
      startPolling();
      if (reason === 'io server disconnect') {
        Promise.resolve(callbacks.current.onDisconnect?.())
          .catch((error) => console.error('Realtime disconnect handling failed:', error))
          .finally(() => {
            if (!disposed) socket.connect();
          });
      }
    });
    socket.on('connect_error', startPolling);

    const eventNames = eventKey ? eventKey.split('|') : [];
    for (const eventName of eventNames) {
      socket.on(eventName, (payload) => {
        callbacks.current.onEvent?.(eventName, payload);
        refreshSafely();
      });
    }

    if (!socket.connected) startPolling();

    return () => {
      disposed = true;
      stopPolling();
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [enabled, eventKey, pollInterval]);
};
