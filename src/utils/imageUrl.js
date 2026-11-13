import api from '../services/api';

// Neutral placeholder shown when a listing has no photo, or the stored URL is unreachable
// (e.g. legacy local-disk `/uploads/...` images that no longer exist now that photos are
// hosted on Cloudinary).
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop';

// Resolve the API origin once. Relative paths must be served from wherever the API actually
// lives -- never a hardcoded host -- otherwise every image breaks on the deployed build.
const getApiOrigin = () => {
  try {
    return new URL(api.defaults.baseURL).origin;
  } catch {
    return '';
  }
};

// Accepts a stored image value (an absolute Cloudinary secure_url, a pasted external link, or
// a legacy relative path) and always returns something safe to drop straight into <img src>.
export const resolveImageUrl = (image) => {
  if (!image || typeof image !== 'string') return FALLBACK_IMAGE;
  const trimmed = image.trim();
  if (!trimmed) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;

  const origin = getApiOrigin();
  if (!origin) return trimmed;
  return `${origin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

// Shared <img onError> handler: swaps a broken image for the placeholder exactly once, so a
// placeholder that itself fails to load cannot trigger an infinite reload loop.
export const handleImageError = (event) => {
  const element = event?.currentTarget || event?.target;
  if (!element || element.dataset?.fallbackApplied === 'true') return;
  if (element.dataset) element.dataset.fallbackApplied = 'true';
  element.src = FALLBACK_IMAGE;
};
