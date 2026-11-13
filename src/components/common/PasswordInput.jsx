import React, { useState } from 'react';

// Inline SVG icons keep this component dependency-free (no icon library required).
const EyeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

/**
 * Password field with an accessible show/hide toggle.
 * Owns only the visibility state; every other prop (value, onChange, required, ...)
 * is forwarded to the underlying <input>, so existing form state bindings are untouched.
 */
export const PasswordInput = ({ leftIcon = null, className = '', id, ...rest }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {leftIcon}
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        className={`w-full bg-surface-light border border-surface-divider rounded-xl ${
          leftIcon ? 'pl-9' : 'pl-3'
        } pr-10 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white ${className}`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label="Toggle password visibility"
        aria-pressed={showPassword}
        title={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-surface-muted hover:text-surface-dark hover:bg-surface-light focus:outline-none focus-visible:ring-2 focus-visible:ring-vinted-500 transition-colors"
      >
        {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </button>
    </div>
  );
};
