// Single source of truth for currency presentation across the app.
// Values stay plain numbers in MongoDB (see backend/src/models/Listing.js) -- only this
// display layer renders them as Indian Rupees. The formatter is built once because
// constructing an Intl.NumberFormat is comparatively expensive.
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0, // swap values are whole rupees; use 2 if paise are ever needed
});

export const formatCurrency = (amount) => {
  const value = Number(amount);
  if (amount === undefined || amount === null || !Number.isFinite(value)) {
    return inrFormatter.format(0);
  }
  return inrFormatter.format(value);
};
