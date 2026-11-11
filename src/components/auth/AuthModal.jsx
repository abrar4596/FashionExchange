import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AlertCircle, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CityAutocomplete } from '../common/CityAutocomplete';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [cityId, setCityId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!cityId) {
          setError('Select a city or town from the suggestions.');
          return;
        }
        await register({ name, email, password, city, cityId });
      }
      onClose();
    } catch (err) {
      console.error('Auth submit error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail) => {
    setError('');
    setIsSubmitting(true);
    try {
      await login(demoEmail, 'password123');
      onClose();
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Failed to log in as demo user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'login' ? 'Welcome Back to FashionExchange' : 'Join the Barter Marketplace'}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex bg-surface-light p-1 rounded-xl border border-surface-divider">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-white text-surface-dark shadow-xs'
                : 'text-surface-muted hover:text-surface-dark'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-white text-surface-dark shadow-xs'
                : 'text-surface-muted hover:text-surface-dark'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-surface-dark mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-light border border-surface-divider rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-light border border-surface-divider rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-light border border-surface-divider rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
              />
            </div>
          </div>

          {tab === 'register' && (
            <CityAutocomplete
              label="Your City / Local Exchange Hub"
              value={city}
              cityId={cityId}
              onChange={(nextCity, nextCityId) => {
                setCity(nextCity);
                setCityId(nextCityId);
              }}
              required
              className="[&_input]:rounded-xl [&_input]:py-2.5"
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-vinted-500 hover:bg-vinted-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] mt-2"
          >
            {isSubmitting
              ? 'Authenticating...'
              : tab === 'login'
              ? 'Sign In to Wardrobe'
              : 'Create Free Barter Account'}
          </button>
        </form>

        {/* Quick Demo Credentials for Instant Testing */}
        <div className="pt-3 border-t border-surface-divider">
          <p className="text-[11px] font-bold text-surface-muted uppercase tracking-wider text-center mb-2">
            Quick 1-Click Demo Profiles:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('elena@example.com')}
              className="p-2 rounded-lg bg-surface-light hover:bg-vinted-50 border border-surface-divider hover:border-vinted-300 text-left transition-colors"
            >
              <p className="font-bold text-surface-dark">Elena Vance</p>
              <p className="text-[10px] text-surface-muted">Bengaluru (User)</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('marcus@example.com')}
              className="p-2 rounded-lg bg-surface-light hover:bg-vinted-50 border border-surface-divider hover:border-vinted-300 text-left transition-colors"
            >
              <p className="font-bold text-surface-dark">Marcus Chen</p>
              <p className="text-[10px] text-surface-muted">Mumbai (User)</p>
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin@fashionexchange.com')}
            className="w-full mt-2 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-semibold text-center transition-colors"
          >
            👑 Log In as Administrator (Admin Supervisor)
          </button>
        </div>
      </div>
    </Modal>
  );
};
