import React from 'react';
import type { Product } from '../../types';
import { Scale, AlertCircle, ShoppingBag, ZoomIn } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/productImages';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForModal, openImagePreview } = usePos();

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
          className="relative w-full h-28 bg-slate-100 overflow-hidden border-b border-slate-100 cursor-pointer group/img"
          title="Click to view full image (بڑی تصویر دیکھیں)"
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
            <span className="px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold shadow-md flex items-center space-x-1.5 border border-white/20 scale-95 group-hover/img:scale-100 transition-transform">
              <ZoomIn className="w-3 h-3 text-emerald-400" />
              <span>Click to Preview (تصویر دیکھیں)</span>
            </span>
          </div>

          {/* Floating Category/Badge Pill (Top-Left) */}
          <span className="absolute top-2 left-2 text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white border border-white/20 shadow-xs">
            {product.badgeLabel}
          </span>

          {/* Floating Shortcut Pill (Top-Right) */}
          <span className="absolute top-2 right-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-slate-800 shadow-xs border border-slate-200">
            {product.shortcut}
          </span>

          {/* Floating Brand Badge (Bottom-Left) if branded */}
          {product.brand && (
            <span className="absolute bottom-1.5 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/85 text-emerald-100 backdrop-blur-xs shadow-xs">
              {product.brand}
            </span>
          )}
        </div>

        {/* Card Body: Names, Price, and Stock Details */}
        <div className="p-2.5 pb-1.5 space-y-2">
          {/* Product Names: English & Urdu */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors truncate">
              {product.name}
            </h3>
            <p className="urdu-text text-[11px] text-slate-600 font-medium !leading-tight mt-0.5 truncate" dir="rtl">
              {product.urduName}
            </p>
          </div>

          {/* Pricing & Stock Details Strip */}
          <div className="space-y-1 bg-slate-50/90 p-1.5 rounded-lg border border-slate-150">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-500 font-medium">Rate:</span>
              <span className="text-xs font-bold text-slate-900 font-mono-num text-right">
                PKR {product.ratePerKg.toLocaleString()}{' '}
                <span className="text-[10px] text-slate-500 font-normal">
                  {product.unitLabel || '/ kg'}
                </span>
                {product.isWholesalePack && (
                  <span className="text-[10px] text-slate-400 font-normal block">
                    (PKR {product.wholesaleBoriPrice?.toLocaleString()} / 50kg bori)
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Available:</span>
              <div className="flex items-center space-x-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <span className={`font-semibold ${product.isLowStock ? 'text-amber-700' : 'text-slate-700'}`}>
                  {product.availableStockLabel || `${product.availableKg} KG`} ({product.binLocation})
                </span>
              </div>
            </div>

            {product.isLowStock && (
              <div className="flex items-center space-x-1 text-[9px] text-amber-700 font-bold pt-0.5">
                <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                <span>Low Stock Alert!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button: Weigh & Add or Select & Add */}
      <div className="p-2.5 pt-0">
        <button
          onClick={() => setSelectedProductForModal(product)}
          className="w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-2xs active:scale-98 bg-emerald-50 hover:bg-emerald-800 hover:text-white text-emerald-800 border border-emerald-300 hover:border-emerald-800 cursor-pointer"
        >
          {isPackaged ? <ShoppingBag className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
          <span>{isPackaged ? 'Select & Add' : 'Weigh & Add'}</span>
        </button>
      </div>
    </div>
  );
};
