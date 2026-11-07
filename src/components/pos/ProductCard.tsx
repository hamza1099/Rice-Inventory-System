import React from 'react';
import type { Product } from '../../types';
import { Scale, PackagePlus, AlertCircle } from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForModal } = usePos();

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs hover:shadow-sm hover:border-emerald-600/50 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Badge & Shortcut Key */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
            {product.badgeLabel}
          </span>
          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-bold">
            {product.shortcut}
          </span>
        </div>

        {/* Product Names (English & Urdu) */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
          {product.name}
        </h3>
        <p className="urdu-text text-xs text-slate-500 font-medium leading-normal mb-2" dir="rtl">
          {product.urduName}
        </p>

        {/* Pricing & Stock Details */}
        <div className="space-y-1 mb-3 bg-slate-50/80 p-2 rounded border border-slate-100">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              {product.isWholesalePack ? 'Pack Rate:' : 'Rate:'}
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono-num">
              {product.isWholesalePack ? (
                <>PKR {product.wholesaleBoriPrice?.toLocaleString()} <span className="text-[10px] text-slate-500">/ bori</span></>
              ) : (
                <>PKR {product.ratePerKg} <span className="text-[10px] text-slate-500">/ kg</span></>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Available:</span>
            <div className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${product.isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className={`font-semibold ${product.isLowStock ? 'text-amber-700' : 'text-slate-700'}`}>
                {product.isWholesalePack ? (
                  `${Math.round(product.availableKg / 50)} Bags (${product.binLocation})`
                ) : (
                  `${product.availableKg} KG (${product.binLocation})`
                )}
              </span>
            </div>
          </div>
          {product.isLowStock && (
            <div className="flex items-center space-x-1 text-[9px] text-amber-700 font-bold">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Low Stock Alert!</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => setSelectedProductForModal(product)}
        className={`w-full py-2 px-3 rounded font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs active:scale-98 ${
          product.isWholesalePack
            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
            : 'bg-emerald-50 hover:bg-emerald-800 hover:text-white text-emerald-800 border border-emerald-300'
        }`}
      >
        {product.isWholesalePack ? (
          <>
            <PackagePlus className="w-3.5 h-3.5" />
            <span>+ Add Bag Pack</span>
          </>
        ) : (
          <>
            <Scale className="w-3.5 h-3.5" />
            <span>Weigh & Add</span>
          </>
        )}
      </button>
    </div>
  );
};
