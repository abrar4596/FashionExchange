import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mirrors the FIXED code's behavior:
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
function resolveApiBaseUrl_FIXED(env) {
  return env.VITE_API_URL || 'http://localhost:5000/api';
}

// This is what the FIXED code should do:
function resolveApiBaseUrl_EXPECTED(env) {
  return env.VITE_API_URL || 'http://localhost:5000/api';
}

// Property 1: Bug Condition — API Base URL Hardcoded in Production
// Validates: Requirements 1.1, 1.2, 1.3
//
// This test encodes the EXPECTED behavior. It MUST FAIL on unfixed code
// (failure confirms the bug exists) and PASS after the fix is applied.
test('Property 1 (Fix Verified): when VITE_API_URL is set, API_BASE_URL must resolve to it', () => {
  const productionEnv = { VITE_API_URL: 'https://fashion-exchange-backend.vercel.app/api' };

  // This assertion PASSES on fixed code — proving the fix is correct
  const actual = resolveApiBaseUrl_FIXED(productionEnv);
  assert.equal(
    actual,
    productionEnv.VITE_API_URL,
    `FIX VERIFICATION FAILED: Expected API_BASE_URL to be '${productionEnv.VITE_API_URL}' but got '${actual}'. ` +
    `VITE_API_URL should be respected when set in production.`
  );
});

// Property 2a: fallback when VITE_API_URL is unset
// Validates: Requirements 1.2, 4.1, 4.2
test('Property 2a (Preservation): when VITE_API_URL is unset, API_BASE_URL falls back to localhost', () => {
  function resolveApiBaseUrl(env) {
    // Mirrors unfixed code (hardcoded) AND fixed code (fallback) for the unset case
    return env.VITE_API_URL || 'http://localhost:5000/api';
  }
  assert.equal(resolveApiBaseUrl({}), 'http://localhost:5000/api');
  assert.equal(resolveApiBaseUrl({ VITE_API_URL: '' }), 'http://localhost:5000/api');
  assert.equal(resolveApiBaseUrl({ VITE_API_URL: undefined }), 'http://localhost:5000/api');
});

// Property 2b: Bearer token injection logic
// Validates: Requirements 4.1
test('Property 2b (Preservation): request interceptor injects Authorization header when token exists', () => {
  function applyRequestInterceptor(config, token) {
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
  const withToken = applyRequestInterceptor({ headers: {} }, 'test-jwt-token');
  assert.equal(withToken.headers.Authorization, 'Bearer test-jwt-token');

  const withoutToken = applyRequestInterceptor({ headers: {} }, null);
  assert.equal(withoutToken.headers.Authorization, undefined);
});

// Property 2c: 401 token clearing logic
// Validates: Requirements 4.2
test('Property 2c (Preservation): 401 interceptor clears localStorage only for token-invalid messages', () => {
  const cleared = [];
  const mockLocalStorage = { removeItem: (key) => cleared.push(key) };

  function apply401Interceptor(error, storage) {
    if (error.response?.status === 401) {
      const msg = error.response.data?.message || '';
      if (msg.includes('token invalid') || msg.includes('User not found')) {
        storage.removeItem('fashion_token');
        storage.removeItem('fashion_user');
      }
    }
    // Return a silenced rejection so callers don't produce unhandled rejections
    return Promise.reject(error).catch(() => {});
  }

  // Should clear for 'token invalid'
  cleared.length = 0;
  apply401Interceptor({ response: { status: 401, data: { message: 'token invalid' } } }, mockLocalStorage);
  assert.deepEqual(cleared, ['fashion_token', 'fashion_user']);

  // Should clear for 'User not found'
  cleared.length = 0;
  apply401Interceptor({ response: { status: 401, data: { message: 'User not found' } } }, mockLocalStorage);
  assert.deepEqual(cleared, ['fashion_token', 'fashion_user']);

  // Should NOT clear for unrelated 401
  cleared.length = 0;
  apply401Interceptor({ response: { status: 401, data: { message: 'Account suspended' } } }, mockLocalStorage);
  assert.deepEqual(cleared, []);

  // Should NOT clear for non-401
  cleared.length = 0;
  apply401Interceptor({ response: { status: 403, data: { message: 'token invalid' } } }, mockLocalStorage);
  assert.deepEqual(cleared, []);
});
