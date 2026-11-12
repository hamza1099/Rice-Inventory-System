import React from 'react';
import type { Product } from '../../types';
import { Scale, AlertCircle, ShoppingBag, ZoomIn } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/productImages';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForModal, openImagePreview, language } = usePos();

  const isPackaged = product.unitLabel === '/ pkt' || product.unitLabel === '/ tin' || product.unitLabel === '/ bag';

  const handleImageClick = () => {
    openImagePreview({
      imageUrl: product.imageUrl || DEFAULT_RICE_IMAGE,
      title: product.name,
      urduTitle: product.urduName,
      category: product.category,
      badgeLabel: product.badgeLabel,
      rate: product.ratePerKg,
      unitLabel: product.unitLabel,
      stock: product.availableStockLabel || `${product.availableKg} KG`,
      binLocation: product.binLocation,
      product
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-600/50 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Prominent Image Banner (Click to Preview) */}
        <div
          onClick={handleImageClick}
          className="relative w-full h-24 bg-slate-100 overflow-hidden border-b border-slate-100 cursor-pointer group/img"
          title={language === 'ur' ? 'بڑی تصویر دیکھیں' : 'Click to view full image'}
        >
          <img
            src={product.imageUrl || DEFAULT_RICE_IMAGE}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover/img:scale-108 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== DEFAULT_RICE_IMAGE) {
                target.src = DEFAULT_RICE_IMAGE;
              } else {
                target.src = SVG_RICE_FALLBACK;
              }
            }}
          />

          {/* Hover Zoom Preview Pill */}
          <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <span className="px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-xs text-white text-[9px] font-bold shadow-md flex items-center space-x-1 border border-white/20 scale-95 group-hover/img:scale-100 transition-transform">
              <ZoomIn className="w-3 h-3 text-emerald-400" />
              <span>{language === 'ur' ? 'تصویر دیکھیں' : 'Preview'}</span>
            </span>
          </div>

          {/* Floating Category/Badge Pill (Top-Left) */}
          <span className="absolute top-1.5 left-1.5 text-[8.5px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white border border-white/20 shadow-xs">
            {product.badgeLabel}
          </span>

          {/* Floating Shortcut Pill (Top-Right) */}
          <span className="absolute top-1.5 right-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs border border-slate-200">
            {product.shortcut}
          </span>

          {/* Floating Brand Badge (Bottom-Left) if branded */}
          {product.brand && (
            <span className="absolute bottom-1 left-1.5 text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/85 text-emerald-100 backdrop-blur-xs shadow-xs">
              {product.brand}
            </span>
          )}
        </div>

        {/* Card Body: Names, Price, and Stock Details */}
        <div className="p-2 pb-1 space-y-1.5">
          {/* Product Name (Single Language - No Mix Up) */}
          <div className="h-6 flex items-center">
            {language === 'ur' ? (
              <h3 className="urdu-text text-[13px] font-bold text-slate-900 !leading-tight group-hover:text-emerald-800 transition-colors truncate w-full text-right" dir="rtl">
                {product.urduName || product.name}
              </h3>
            ) : (
              <h3 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-800 transition-colors truncate w-full">
                {product.name}
              </h3>
            )}
          </div>

          {/* Pricing & Stock Details Strip */}
          <div className="space-y-0.5 bg-slate-50/90 p-1.5 rounded-lg border border-slate-150 text-[10.5px]">
            <div className="flex items-baseline justify-between">
              <span className="text-slate-500 font-medium">
                {language === 'ur' ? 'ریٹ:' : 'Rate:'}
              </span>
              <span className="font-bold text-slate-900 font-mono-num text-right">
                PKR {product.ratePerKg.toLocaleString()}{' '}
                <span className="text-[9px] text-slate-500 font-normal">
                  {language === 'ur' ? (product.unitLabel === '/ kg' ? '/ کلو' : product.unitLabel) : (product.unitLabel || '/ kg')}
                </span>
                {product.isWholesalePack && (
                  <span className="text-[9px] text-slate-400 font-normal block leading-none">
                    (PKR {product.wholesaleBoriPrice?.toLocaleString()} / {language === 'ur' ? `${product.boriWeightKg || 25} کلو` : `${product.boriWeightKg || 25}kg`})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-[9.5px]">
              <span className="text-slate-500">
                {language === 'ur' ? 'موجود سٹاک:' : 'Available:'}
              </span>
              <div className="flex items-center space-x-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span className={`font-semibold ${product.isLowStock ? 'text-amber-700' : 'text-slate-700'}`}>
                  {product.availableStockLabel || `${product.availableKg} KG`}
                </span>
              </div>
            </div>

            {product.isLowStock && (
              <div className="flex items-center space-x-1 text-[8.5px] text-amber-700 font-bold pt-0.5">
                <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                <span>{language === 'ur' ? 'سٹاک کم ہے!' : 'Low Stock!'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button: Weigh & Add or Select & Add */}
      <div className="p-2 pt-0">
        <button
          onClick={() => setSelectedProductForModal(product)}
          className="w-full py-1 px-2 rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 transition-all shadow-2xs active:scale-98 bg-emerald-50 hover:bg-emerald-800 hover:text-white text-emerald-800 border border-emerald-300 hover:border-emerald-800 cursor-pointer"
        >
          {isPackaged ? <ShoppingBag className="w-3 h-3" /> : <Scale className="w-3 h-3" />}
          <span>
            {language === 'ur'
              ? (isPackaged ? 'شامل کریں' : 'وزن کریں')
              : (isPackaged ? 'Select & Add' : 'Weigh & Add')}
          </span>
        </button>
      </div>
    </div>
  );
};
