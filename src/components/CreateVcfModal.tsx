import React, { useState } from 'react';
import { CreateVcfPayload } from '../types';
import { uploadVcfImage } from '../lib/api';
import { Layers, Upload, X, Check, Loader2, AlertCircle } from 'lucide-react';

interface CreateVcfModalProps {
  onClose: () => void;
  onSubmit: (payload: CreateVcfPayload) => Promise<{ success: boolean; error?: string }>;
}

export const CreateVcfModal: React.FC<CreateVcfModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<number | ''>(500);
  const [description, setDescription] = useState('');
  const [namePrefix, setNamePrefix] = useState('🩸🩸 ');
  const [nameSuffix, setNameSuffix] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const EMOJI_PRESETS = ['🩸🩸 ', '👑 ', '🔥 ', '🚀 ', '⭐ ', '💎 ', '💼 ', '📌 ', '⚡ '];
  const SUFFIX_PRESETS = [' 🛁', ' ⭐', ' 🔥', ' ✔️', ' 📌'];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      setLoading(true);
      const res = await uploadVcfImage(base64, file.name);
      setLoading(false);

      if (res.success && res.imageUrl) {
        setImageUrl(res.imageUrl);
      } else {
        setImageUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a VCF container name.');
      return;
    }

    const capNum = Number(capacity);
    if (isNaN(capNum) || capNum <= 0) {
      setError('Maximum contacts capacity must be a positive number greater than 0.');
      return;
    }

    setLoading(true);

    const payload: CreateVcfPayload = {
      name: name.trim(),
      capacity: capNum,
      imageUrl: imageUrl.trim() || null,
      description: description.trim() || null,
      namePrefix: namePrefix ? namePrefix : null,
      nameSuffix: nameSuffix ? nameSuffix : null,
    };

    const res = await onSubmit(payload);
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to create VCF container.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cmd-dark/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-cmd-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create New VCF Container</h3>
              <p className="text-xs text-gray-400">Set capacity limit and emoji name formatting</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* VCF Name Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              VCF Container Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. VCF 002 or Summer Conference Batch"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500 focus:outline-none"
              required
              autoFocus
            />
          </div>

          {/* EMOJI PREFIX & SUFFIX SETTINGS */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📱 Contact Name Emoji Format</span>
              </span>
              <span className="text-[10px] text-gray-400">Exported to VCF</span>
            </div>

            {/* Emoji Prefix */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Name Prefix Emoji
              </label>
              <input
                type="text"
                placeholder="e.g. 🩸🩸 or 👑 or 🔥"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
              />

              {/* Preset buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span className="text-[10px] text-gray-400">Presets:</span>
                {EMOJI_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setNamePrefix(emoji)}
                    className="px-2 py-0.5 rounded-lg bg-cmd-surface border border-purple-500/20 text-xs hover:border-purple-400 hover:scale-105 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Suffix */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                Name Suffix Emoji (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 🛁 or ⭐"
                value={nameSuffix}
                onChange={(e) => setNameSuffix(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
              />

              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span className="text-[10px] text-gray-400">Presets:</span>
                {SUFFIX_PRESETS.map((suf) => (
                  <button
                    key={suf}
                    type="button"
                    onClick={() => setNameSuffix(suf)}
                    className="px-2 py-0.5 rounded-lg bg-cmd-surface border border-purple-500/20 text-xs hover:border-purple-400 hover:scale-105 transition-all"
                  >
                    {suf}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setNameSuffix('')}
                  className="px-2 py-0.5 rounded-lg bg-cmd-dark border border-gray-700 text-[10px] text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Phone Contact Live Preview */}
            <div className="p-2.5 rounded-xl bg-cmd-dark/90 border border-emerald-500/30 text-xs flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Phone Contact Preview:</span>
              <span className="font-semibold text-emerald-300 font-mono">
                {namePrefix}Nexus Tech{nameSuffix}
              </span>
            </div>
          </div>

          {/* Maximum Contacts Capacity Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Maximum Contacts Capacity <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 500"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white placeholder-gray-500 focus:outline-none"
              required
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              When registrations reach this number, the container will automatically become FULL.
            </span>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Cover / Thumbnail Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              {imagePreview && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-purple-500/30 shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-xs text-purple-300 hover:text-white border-dashed cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                <span>{imagePreview ? 'Change Image' : 'Upload Cover Image (Max 5MB)'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Secondary release container for region 2 participants..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-cmd-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-cmd-dark border border-cmd-border text-gray-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl btn-purple text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Create VCF Container</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
