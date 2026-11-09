import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Sparkles, Check } from 'lucide-react';
import { SAMPLE_RICE_PRESETS, SVG_RICE_FALLBACK } from '../../utils/riceImages';
import { notifySuccess, notifyWarning } from '../../utils/toast';

interface RiceImageUploadProps {
  imageUrl: string;
  onChange: (url: string) => void;
  label?: string;
  urduLabel?: string;
}

export const RiceImageUpload: React.FC<RiceImageUploadProps> = ({
  imageUrl,
  onChange,
  label = 'Product Image (پروڈکٹ تصویر):',
  urduLabel = 'چاول کی اصلی تصویر اپلوڈ کریں'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyWarning('Please upload a valid image file (صرف تصویر فائل منتخب کریں)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifyWarning('Image size should be less than 5MB (تصویر 5 ایم بی سے کم ہونی چاہیے)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onChange(base64);
        notifySuccess('Image uploaded successfully! (تصویر اپلوڈ ہو گئی)');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>{label}</span>
        </label>
        <span className="urdu-text text-[11px] font-semibold text-emerald-800" dir="rtl">
          {urduLabel}
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Image Upload / Preview Box */}
      {imageUrl ? (
        <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-white shadow-xs">
          <div className="h-32 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Rice Product Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = SVG_RICE_FALLBACK;
              }}
            />
          </div>

          {/* Action overlay buttons */}
          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 font-bold text-[11px] shadow-sm cursor-pointer flex items-center space-x-1 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
              <span>Change Photo</span>
            </button>
            <button
              type="button"
              onClick={handleClearImage}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-sm cursor-pointer flex items-center space-x-1 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="p-2 bg-emerald-50/90 border-t border-emerald-200 flex items-center justify-between text-[10px] text-emerald-900 font-semibold">
            <span className="flex items-center space-x-1">
              <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
              <span>Photo Attached (تصویر منسلک ہے)</span>
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer"
            >
              Replace
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="h-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center p-3 text-center cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="font-bold text-xs text-slate-800">
            Click to Upload Rice Photo (تصویر منتخب کریں)
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Supports JPG, PNG, WEBP (Max 5MB) • Clear grain view
          </span>
        </div>
      )}

      {/* Quick Select Presets Section */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-500 font-semibold">
          <span className="flex items-center space-x-1 text-slate-700">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Or Pick from Mandi Samples (یا نمونہ منتخب کریں):</span>
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SAMPLE_RICE_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange(preset.imageUrl);
                notifySuccess(`Applied ${preset.name} photo!`);
              }}
              className={`p-1 rounded-lg border text-left flex items-center space-x-1.5 transition-all cursor-pointer ${
                imageUrl === preset.imageUrl
                  ? 'border-emerald-600 bg-emerald-100/70 text-emerald-900 font-bold ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              <img
                src={preset.imageUrl}
                alt={preset.name}
                className="w-6 h-6 rounded object-cover border border-slate-200 shrink-0"
              />
              <span className="text-[9px] truncate block leading-tight">{preset.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
