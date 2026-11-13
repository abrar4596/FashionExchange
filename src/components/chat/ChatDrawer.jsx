import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Repeat,
  CheckCircle,
  Check,
  MapPin,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import { useSwap } from '../../context/SwapContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { resolveImageUrl, handleImageError } from '../../utils/imageUrl';
import { formatCurrency } from '../../utils/currency';

export const ChatDrawer = () => {
  const { user } = useAuth();
  const { isChatOpen, closeChat, activeSwap, setActiveSwap, swaps, updateSwapStatus } =
    useSwap();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages for active swap
  useEffect(() => {
    if (!activeSwap || !isChatOpen) return;

    let isMounted = true;
    const fetchChatMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const res = await api.get(`/messages/${activeSwap._id}`);
        if (isMounted) {
          setMessages(res.data);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    };

    fetchChatMessages();
    // Poll messages every 4 seconds when chat is open
    const interval = setInterval(fetchChatMessages, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeSwap, isChatOpen]);

  if (!isChatOpen) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeSwap || isSending) return;

    const messageText = inputText.trim();
    setInputText('');

    // Optimistic message append
    const tempMessage = {
      _id: 'temp-' + Date.now(),
      sender: user,
      text: messageText,
      type: 'text',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    setTimeout(scrollToBottom, 50);

    try {
      setIsSending(true);
      const res = await api.post(`/messages/${activeSwap._id}`, { text: messageText });
      setMessages((prev) =>
        prev.map((m) => (m._id === tempMessage._id ? res.data : m))
      );
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setIsSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const isReceiver = activeSwap && user && activeSwap.receiver?._id === user._id;
  const isRequester = activeSwap && user && activeSwap.requester?._id === user._id;
  const otherParticipant = isReceiver ? activeSwap?.requester : activeSwap?.receiver;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeChat}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-drawer flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="px-4 py-3 bg-white border-b border-surface-divider flex items-center justify-between">
          <div className="flex items-center gap-3">
            {otherParticipant?.avatarUrl ? (
              <img
                src={otherParticipant.avatarUrl}
                alt={otherParticipant.name}
                className="w-9 h-9 rounded-full object-cover border border-surface-divider"
                onError={handleImageError}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-vinted-500 text-white flex items-center justify-center font-bold text-xs">
                {otherParticipant?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h3 className="font-bold text-sm text-surface-dark flex items-center gap-2">
                <span>{otherParticipant?.name || 'Swap Negotiation'}</span>
                {activeSwap && <StatusBadge status={activeSwap.status} />}
              </h3>
              <p className="text-[11px] text-surface-muted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-vinted-500" />
                <span>{otherParticipant?.city || 'Local Area'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={closeChat}
            className="p-1.5 rounded-full text-surface-muted hover:text-surface-dark hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Switcher Tabs (if multiple swaps exist) */}
        {swaps.all && swaps.all.length > 1 && (
          <div className="bg-surface-light px-3 py-2 border-b border-surface-divider flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            <span className="text-surface-muted font-semibold text-[11px] mr-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>Chats:</span>
            </span>
            {swaps.all.map((swapItem) => {
              const isSelected = activeSwap && activeSwap._id === swapItem._id;
              const other =
                swapItem.requester?._id === user?._id
                  ? swapItem.receiver?.name
                  : swapItem.requester?.name;
              return (
                <button
                  key={swapItem._id}
                  onClick={() => setActiveSwap(swapItem)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-vinted-500 text-white font-bold shadow-xs'
                      : 'bg-white border border-surface-divider text-surface-muted hover:text-surface-dark'
                  }`}
                >
                  {other?.split(' ')[0]} ({swapItem.status})
                </button>
              );
            })}
          </div>
        )}

        {/* Active Swap Offer Banner & Action Triggers */}
        {activeSwap && (
          <div className="bg-vinted-50/70 border-b border-vinted-100 p-3">
            <div className="flex items-center justify-between text-xs font-bold text-surface-dark mb-2">
              <span className="flex items-center gap-1 text-vinted-700">
                <Repeat className="w-3.5 h-3.5" />
                <span>Barter Terms:</span>
              </span>
              <span className="text-[11px] text-surface-muted">
                Value Diff: ~${Math.abs(activeSwap.valueDifference || 0)}
              </span>
            </div>

            {/* Side-by-side garment exchange cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded-lg border border-vinted-100 flex items-center gap-2">
                <img
                  src={resolveImageUrl(activeSwap.offeredItem?.images?.[0])}
                  alt=""
                  className="w-10 h-12 rounded object-cover flex-shrink-0"
                  onError={handleImageError}
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-surface-muted block uppercase">Offered</span>
                  <p className="font-bold text-surface-dark truncate text-[11px]">
                    {activeSwap.offeredItem?.title}
                  </p>
                  <p className="text-[10px] text-vinted-600 font-semibold">
                    ~{formatCurrency(activeSwap.offeredItem?.estimatedValue)}
                  </p>
                </div>
              </div>

              <div className="bg-white p-2 rounded-lg border border-vinted-100 flex items-center gap-2">
                <img
                  src={resolveImageUrl(activeSwap.requestedItem?.images?.[0])}
                  alt=""
                  className="w-10 h-12 rounded object-cover flex-shrink-0"
                  onError={handleImageError}
                />
                <div className="min-w-0">
                  <span className="text-[10px] text-surface-muted block uppercase">Requested</span>
                  <p className="font-bold text-surface-dark truncate text-[11px]">
                    {activeSwap.requestedItem?.title}
                  </p>
                  <p className="text-[10px] text-vinted-600 font-semibold">
                    ~{formatCurrency(activeSwap.requestedItem?.estimatedValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Negotiation Action Buttons based on status */}
            <div className="mt-2.5 pt-2 border-t border-vinted-100/60 flex items-center justify-end gap-2">
              {activeSwap.status === 'pending' && isReceiver && (
                <>
                  <button
                    onClick={() => updateSwapStatus(activeSwap._id, 'rejected')}
                    className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => updateSwapStatus(activeSwap._id, 'accepted')}
                    className="px-3 py-1 bg-vinted-500 hover:bg-vinted-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Swap</span>
                  </button>
                </>
              )}

              {activeSwap.status === 'pending' && isRequester && (
                <button
                  onClick={() => updateSwapStatus(activeSwap._id, 'cancelled')}
                  className="px-3 py-1 bg-white hover:bg-surface-divider text-surface-muted border border-surface-divider rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel Swap Request
                </button>
              )}

              {activeSwap.status === 'accepted' && (
                <button
                  onClick={() => updateSwapStatus(activeSwap._id, 'completed')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Swap Completed</span>
                </button>
              )}

              {activeSwap.status === 'completed' && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Swap Completed & Wardrobes Refreshed</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-light/30">
          {isLoadingMessages && messages.length === 0 ? (
            <div className="text-center py-10 text-xs text-surface-muted">
              Loading negotiation history...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-surface-muted text-xs">
              <p className="font-semibold text-surface-dark text-sm">No messages yet</p>
              <p className="mt-1">Coordinate meeting time, condition checks, or exchange terms below.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id;
              const isSystem = msg.type === 'agreement_confirmed' || msg.type === 'status_change';

              if (isSystem) {
                return (
                  <div key={msg._id} className="py-2 text-center">
                    <span className="inline-block bg-vinted-100/70 border border-vinted-200 text-vinted-900 text-[11px] font-semibold px-3 py-1 rounded-full shadow-xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-6 h-6 rounded-full bg-vinted-100 text-vinted-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {msg.sender?.name?.charAt(0) || 'U'}
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs ${
                      isMe
                        ? 'bg-vinted-500 text-white rounded-br-none'
                        : 'bg-white text-surface-dark border border-surface-divider rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        isMe ? 'text-vinted-100' : 'text-surface-muted'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-surface-divider flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message (e.g. Can meet in Mumbai tomorrow)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-surface-light border border-surface-divider rounded-full px-4 py-2 text-xs sm:text-sm text-surface-dark placeholder-surface-muted focus:outline-none focus:border-vinted-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 bg-vinted-500 hover:bg-vinted-600 disabled:opacity-40 text-white rounded-full transition-all shadow-sm active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
