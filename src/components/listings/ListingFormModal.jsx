import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CityAutocomplete } from '../common/CityAutocomplete';

const CATEGORIES = ['Women', 'Men', 'Kids', 'Vintage', 'Shoes', 'Accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One size'];
const CONDITIONS = [
  'New with tags',
  'New without tags',
  'Very good',
  'Good',
  'Satisfactory',
];

export const ListingFormModal = ({ isOpen, onClose, onListingCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Women');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('M');
  const [condition, setCondition] = useState('Very good');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [cityId, setCityId] = useState(user?.cityId || '');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    if (imagePreviews.length + files.length > 8) {
      setError('Maximum 8 photos allowed per item.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (imagePreviews.length >= 8) {
      setError('Maximum 8 photos allowed.');
      return;
    }
    setImagePreviews((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.length < 4) {
      setError('Please provide a descriptive title (at least 4 characters).');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError('Please provide a description of the condition and fit (min 10 characters).');
      return;
    }
    if (!estimatedValue || Number(estimatedValue) <= 0) {
      setError('Please provide an estimated swap value greater than $0.');
      return;
    }
    if (imagePreviews.length === 0) {
      setError('Please upload at least one photo of the item.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('brand', brand.trim() || 'Unbranded');
      formData.append('size', size);
      formData.append('condition', condition);
      formData.append('estimatedValue', estimatedValue);
      formData.append('city', city.trim());
      if (cityId) formData.append('cityId', cityId);

      // If files were selected
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // If URL images were added
      const urlOnlyImages = imagePreviews.filter((p) => p.startsWith('http'));
      urlOnlyImages.forEach((url) => {
        formData.append('images', url);
      });

      const res = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Reset form
      setTitle('');
      setDescription('');
      setBrand('');
      setEstimatedValue('');
      setSelectedFiles([]);
      setImagePreviews([]);
      onListingCreated(res.data);
      onClose();
    } catch (err) {
      console.error('Create listing error:', err);
      setError(err.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="List a Clothing Item for Swap" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Photo Upload Area */}
        <div>
          <label className="block text-xs font-bold text-surface-dark uppercase tracking-wider mb-2">
            Garment Photos (1 to 8 images)
          </label>
          <div className="border-2 border-dashed border-surface-divider hover:border-vinted-500 rounded-2xl p-4 text-center bg-surface-light/40 transition-colors">
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              id="file-upload"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2 py-3"
            >
              <div className="w-10 h-10 rounded-full bg-vinted-50 text-vinted-500 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-vinted-600 hover:underline">
                  Click to browse photos
                </span>
                <span className="text-xs text-surface-muted"> or drag & drop</span>
              </div>
              <p className="text-[11px] text-surface-muted">Supports JPEG, PNG, WebP up to 5MB</p>
            </label>

            {/* URL input fallback */}
            <div className="mt-2 pt-2 border-t border-surface-divider flex items-center gap-2">
              <input
                type="url"
                placeholder="Or paste an image URL..."
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 bg-white border border-surface-divider rounded-lg px-3 py-1.5 text-xs text-surface-dark placeholder-surface-muted focus:outline-none focus:border-vinted-500"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 bg-surface-dark text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Previews Grid */}
          {imagePreviews.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {imagePreviews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-20 rounded-lg overflow-hidden border border-surface-divider flex-shrink-0 group"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 90s Vintage Denim Jacket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Brand (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Levi's, Zara, Unbranded"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Category, Size, Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Size *
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
            >
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Condition *
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimated Swap Value & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-surface-dark mb-1">
              Estimated Swap Value ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted text-xs font-bold">
                $
              </span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="45"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full bg-surface-light border border-surface-divider rounded-lg pl-7 pr-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
              />
            </div>
            <p className="text-[10px] text-surface-muted mt-1">
              Used for equitable barter valuation comparison.
            </p>
          </div>

          <CityAutocomplete
            label="Location City/Region *"
            value={city}
            cityId={cityId}
            onChange={(nextCity, nextCityId) => {
              setCity(nextCity);
              setCityId(nextCityId);
            }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-surface-dark mb-1">
            Description & Fit Details *
          </label>
          <textarea
            rows="3"
            required
            placeholder="Describe the fabric, exact measurements, fit, signs of wear, or any details helpful for swappers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-surface-light border border-surface-divider rounded-lg px-3 py-2 text-xs sm:text-sm text-surface-dark focus:outline-none focus:border-vinted-500 focus:bg-white"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-surface-divider flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-surface-muted hover:text-surface-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-vinted-500 hover:bg-vinted-600 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.99]"
          >
            {isSubmitting ? 'Uploading Garment...' : 'Publish to Swap Pool'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
