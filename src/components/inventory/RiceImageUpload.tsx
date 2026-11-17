import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Check, ZoomIn, Loader2 } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { SVG_RICE_FALLBACK } from '../../utils/productImages';
import { notifySuccess, notifyWarning } from '../../utils/toast';

interface RiceImageUploadProps {
  imageUrl: string;
  onChange: (url: string, file?: File | null) => void;
  label?: string;
  urduLabel?: string;
  isUploading?: boolean;
}

export const RiceImageUpload: React.FC<RiceImageUploadProps> = ({
  imageUrl,
  onChange,
  label,
  urduLabel,
  isUploading = false
}) => {
  const { openImagePreview, language } = usePos();
  const isUr = language === 'ur';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultLabel = isUr ? 'پروڈکٹ تصویر:' : 'Product Image:';
  const defaultUrduSub = isUr ? 'سامان یا چاول کی اصلی تصویر اپلوڈ کریں' : 'Upload actual commodity or product photo';

  const displayLabel = label || defaultLabel;
  const displaySub = urduLabel || defaultUrduSub;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyWarning(isUr ? 'صرف تصویر فائل منتخب کریں' : 'Please upload a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      notifyWarning(isUr ? 'تصویر 10 ایم بی سے کم ہونی چاہیے' : 'Image size should be less than 10MB');
      return;
    }

    // Instant local preview for user (CDN upload happens on form save)
    const localPreviewUrl = URL.createObjectURL(file);
    onChange(localPreviewUrl, file);
    notifySuccess(isUr ? 'تصویر منتخب ہو گئی!' : 'Image selected!');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearImage = () => {
    onChange('', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isBunnyUrl = Boolean(imageUrl && (imageUrl.includes('b-cdn.net') || imageUrl.includes('bunny')));

  return (
    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 flex items-center space-x-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>{displayLabel}</span>
        </label>
        <span className="text-[11px] font-semibold text-emerald-800 font-sans">
          {displaySub}
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

      {/* Uploading State */}
      {isUploading ? (
        <div className="h-28 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 flex flex-col items-center justify-center p-3 text-center animate-pulse">
          <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mb-1.5" />
          <span className="font-bold text-xs text-emerald-950">
            {isUr ? 'تصویر اپلوڈ ہو رہی ہے...' : 'Uploading image...'}
          </span>
        </div>
      ) : imageUrl ? (
        /* Main Image Upload / Preview Box */
        <div className="relative group rounded-xl overflow-hidden border-2 border-emerald-500/40 bg-white shadow-xs">
          <div className="h-32 w-full overflow-hidden bg-slate-100 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Product Preview"
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
              onClick={() =>
                openImagePreview({
                  imageUrl,
                  title: displayLabel,
                  urduTitle: displaySub
                })
              }
              className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center space-x-1 transition-all"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>{isUr ? 'بڑا کر کے دیکھیں' : 'Preview'}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-slate-800 font-bold text-[11px] shadow-xs cursor-pointer flex items-center space-x-1 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isUr ? 'تبدیل کریں' : 'Change'}</span>
            </button>
            <button
              type="button"
              onClick={handleClearImage}
              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center space-x-1 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isUr ? 'ہٹائیں' : 'Remove'}</span>
            </button>
          </div>

          <div className="p-2 bg-emerald-50/90 border-t border-emerald-200 flex items-center justify-between text-[10px] text-emerald-900 font-semibold">
            <span className="flex items-center space-x-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span className="font-bold">{isUr ? 'تصویر منسلک ہے' : 'Photo Attached'}</span>
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer"
            >
              {isUr ? 'تبدیل کریں' : 'Replace'}
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
            {isUr ? 'چاول یا آئٹم کی تصویر اپلوڈ کریں' : 'Click to Upload Item / Rice Photo'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            {isUr ? 'جے پی جی، پی این جی یا ویب پی تصویر • زیادہ سے زیادہ 10MB' : 'JPG, PNG or WebP image • Max 10MB'}
          </span>
        </div>
      )}
    </div>
  );
};
