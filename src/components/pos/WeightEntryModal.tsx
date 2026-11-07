import React, { useState, useEffect } from 'react';
import { X, Scale, ShoppingCart, Calculator } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import type { EntryMode } from '../../types';

export const WeightEntryModal: React.FC = () => {
  const { selectedProductForModal, setSelectedProductForModal, addToCart } = usePos();

  const [mode, setMode] = useState<EntryMode>('kg');
  const [inputValue, setInputValue] = useState<string>('10.00');
  const [tareOption, setTareOption] = useState<{ name: string; weight: number }>({
    name: 'پلاسٹک تھیلی',
    weight: 0.10
  });

  const product = selectedProductForModal;

  useEffect(() => {
    if (product) {
      if (product.isWholesalePack) {
        setMode('bags');
        setInputValue('1');
        setTareOption({ name: 'Jute Bori 50kg', weight: 0.95 });
      } else {
        setMode('kg');
        setInputValue('10.00');
        setTareOption({ name: 'پلاسٹک تھیلی', weight: 0.10 });
      }
    }
  }, [product]);

  // Handle ESC and ENTER keys inside modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProductForModal) return;
      if (e.key === 'Escape') {
        setSelectedProductForModal(null);
      } else if (e.key === 'Enter') {
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProductForModal, inputValue, mode, tareOption]);

  if (!product) return null;

  // Calculate actual net weight in KG based on mode
  const rawNum = parseFloat(inputValue) || 0;
  let netWeightKg = rawNum;

  if (mode === 'bags') {
    netWeightKg = rawNum * (product.boriWeightKg || 50);
  } else if (mode === 'mund') {
    netWeightKg = rawNum * 40; // 1 Mund = 40 KG in Pakistan Mandi
  }

  // Calculate Subtotal
  let subtotal = 0;
  if (product.isWholesalePack && mode === 'bags') {
    subtotal = rawNum * (product.wholesaleBoriPrice || product.ratePerKg * 50);
  } else {
    subtotal = netWeightKg * product.ratePerKg;
  }

  const grossWeight = netWeightKg + tareOption.weight;

  const handleSave = () => {
    if (netWeightKg <= 0) return;

    addToCart({
      id: `cart-${Date.now()}`,
      product,
      mode,
      grossWeight,
      tareWeight: tareOption.weight,
      tareName: tareOption.name,
      netWeight: netWeightKg,
      ratePerKg: product.ratePerKg,
      subtotal
    });

    setSelectedProductForModal(null);
  };

  const presetWeights = [1, 2, 5, 10, 25, 50];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header (Green Emerald Banner from Image 2) */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>وزن اور تعداد اندراج</span>
                <span className="text-emerald-200 font-normal text-xs">(Weight & Quantity Entry)</span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                {product.name} ({product.urduName}) • SKU #{product.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedProductForModal(null)}
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Rate & Available Stock info strip */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono-num">
            <div>
              <span className="text-[10px] text-slate-500 block">مقررہ ریٹ (Base Rate):</span>
              <span className="text-sm font-bold text-slate-900">
                PKR {product.ratePerKg} <span className="text-[10px] text-slate-500 font-normal">/kg فی کلو</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">موجودہ سٹاک (Available):</span>
              <span className="text-sm font-bold text-emerald-700">
                {product.availableKg.toFixed(2)} KG <span className="text-[10px] text-slate-500 font-normal">({product.binLocation})</span>
              </span>
            </div>
          </div>

          {/* Select Entry Mode (Tabs) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>(SELECT ENTRY MODE) اندراج کی قسم:</span>
              <span className="text-slate-400 font-normal text-[10px]">چاول وزن منتخب کریں</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('kg')}
                className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all ${
                  mode === 'kg'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                (KG Weight) وزن
              </button>
              <button
                type="button"
                onClick={() => setMode('bags')}
                className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all ${
                  mode === 'bags'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                (Bags) بوری / بیگز
              </button>
              <button
                type="button"
                onClick={() => setMode('mund')}
                className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all ${
                  mode === 'mund'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                (Mund 40kg) من
              </button>
            </div>
          </div>

          {/* Input field & Tare subtraction */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                صاف وزن (Net Weight / Qty):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full text-xl font-bold font-mono-num px-3 py-2 bg-white border-2 border-emerald-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
                <span className="absolute right-3 top-2.5 font-bold text-xs text-slate-500 uppercase">
                  {mode === 'bags' ? 'Bori' : mode === 'mund' ? 'Mund' : 'KG'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                کاٹ / بوری (Tare/Bori):
              </label>
              <select
                value={tareOption.weight}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const name = val === 0.95 ? 'Jute Bori 50kg' : val === 0.12 ? 'PP Bag' : 'پلاسٹک تھیلی';
                  setTareOption({ name, weight: val });
                }}
                className="w-full text-xs font-semibold px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden"
              >
                <option value={0.10}>[-0.10] تھیلی</option>
                <option value={0.12}>[-0.12] PP بوری</option>
                <option value={0.95}>[-0.95] پٹ سن بوری</option>
                <option value={0.00}>[0.00] کاٹ نہیں</option>
              </select>
            </div>
          </div>

          {/* Quick preset weight buttons */}
          <div>
            <span className="block text-[10px] text-slate-500 mb-1.5 font-medium">
              فوری بٹن برائے فوری وزن (Quick Presets):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {presetWeights.map((wt) => (
                <button
                  key={wt}
                  type="button"
                  onClick={() => setInputValue(wt.toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded font-mono-num font-bold text-slate-700 transition-colors"
                >
                  {wt} {wt === 50 ? 'KG (Bori)' : 'KG'}
                </button>
              ))}
            </div>
          </div>

          {/* Calculated Subtotal Card (Mint green from Image 2) */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 text-emerald-950 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                (CALCULATED SUBTOTAL) کل رقم
              </span>
              <p className="text-xs text-emerald-800 font-mono-num mt-0.5">
                {netWeightKg.toFixed(2)} kg × PKR {product.ratePerKg}
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono-num text-emerald-800">
                PKR {Math.round(subtotal).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => setSelectedProductForModal(null)}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
          >
            (Cancel) [ESC] منسوخ کریں
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>(Save & Add to Memo) [ENTER] محفوظ کریں اور بل میں شامل کریں</span>
          </button>
        </div>
      </div>
    </div>
  );
};
