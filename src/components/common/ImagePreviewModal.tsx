import React, { useEffect } from 'react';
import { X, Scale, ShoppingBag, ZoomIn, MapPin, Tag } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/productImages';

export const ImagePreviewModal: React.FC = () => {
  const { imagePreview, closeImagePreview, setSelectedProductForModal } = usePos();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && imagePreview) {
        closeImagePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imagePreview, closeImagePreview]);

  if (!imagePreview) return null;

  const isPackaged =
    imagePreview.unitLabel === '/ pkt' ||
    imagePreview.unitLabel === '/ tin' ||
    imagePreview.unitLabel === '/ bag';

  const handleAction = () => {
    if (imagePreview.product) {
      setSelectedProductForModal(imagePreview.product);
      closeImagePreview();
    }
  };

  return (
    <div
      onClick={closeImagePreview}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-100 flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {imagePreview.title}
                </h2>
                {imagePreview.badgeLabel && (
                  <span className="text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    {imagePreview.badgeLabel}
                  </span>
                )}
              </div>
              {imagePreview.urduTitle && (
                <p className="urdu-text text-xs text-emerald-300 font-semibold !leading-tight mt-0.5" dir="rtl">
                  {imagePreview.urduTitle}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={closeImagePreview}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            title="Close Preview (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Large Product Image Frame */}
        <div className="relative bg-slate-950 flex items-center justify-center p-3 sm:p-5 overflow-hidden min-h-[280px] max-h-[62vh]">
          <img
            src={imagePreview.imageUrl || DEFAULT_RICE_IMAGE}
            alt={imagePreview.title}
            className="w-full max-h-[58vh] object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-102"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== DEFAULT_RICE_IMAGE) {
                target.src = DEFAULT_RICE_IMAGE;
              } else {
                target.src = SVG_RICE_FALLBACK;
              }
            }}
          />

          {/* Floating Category Tag */}
          {imagePreview.category && (
            <span className="absolute bottom-5 left-5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-slate-200 border border-white/10 flex items-center space-x-1.5 shadow-lg">
              <Tag className="w-3 h-3 text-emerald-400" />
              <span>{imagePreview.category}</span>
            </span>
          )}

          {/* Floating Bin Location Tag */}
          {imagePreview.binLocation && (
            <span className="absolute bottom-5 right-5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center space-x-1 shadow-lg">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{imagePreview.binLocation}</span>
            </span>
          )}
        </div>

        {/* Modal Footer with Rate, Stock & Quick Add */}
        <div className="bg-slate-950/80 border-t border-slate-800 px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-4 font-mono-num text-xs">
            {imagePreview.rate !== undefined && (
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">ریٹ (Rate):</span>
                <span className="text-base font-black text-white">
                  PKR {imagePreview.rate.toLocaleString()}{' '}
                  <span className="text-xs text-slate-400 font-normal font-sans">
                    {imagePreview.unitLabel || '/ kg'}
                  </span>
                </span>
              </div>
            )}

            {imagePreview.stock && (
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] text-slate-400 block font-sans">دستیاب اسٹاک (Stock):</span>
                <span className="text-sm font-bold text-emerald-400">
                  {imagePreview.stock}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={closeImagePreview}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Close (بند کریں)
            </button>
            {imagePreview.product && (
              <button
                onClick={handleAction}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 flex items-center space-x-1.5 transition-all active:scale-98 cursor-pointer"
              >
                {isPackaged ? <ShoppingBag className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
                <span>{isPackaged ? 'Select & Add to Bill' : 'Weigh & Add to Bill'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
