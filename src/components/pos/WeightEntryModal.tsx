import React, { useState, useEffect } from 'react';
import { X, Scale, ShoppingBag } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import type { EntryMode } from '../../types';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/productImages';

export const WeightEntryModal: React.FC = () => {
  const { selectedProductForModal, setSelectedProductForModal, addToCart } = usePos();

  const product = selectedProductForModal;
  const isPackaged =
    product?.unitLabel === '/ pkt' ||
    product?.unitLabel === '/ tin' ||
    product?.unitLabel === '/ bag';

  const [mode, setMode] = useState<EntryMode>('kg');
  const [inputValue, setInputValue] = useState<string>('10.00');

  useEffect(() => {
    if (product) {
      if (isPackaged) {
        setMode('packet');
        setInputValue('1');
      } else {
        setMode('kg');
        setInputValue('10.00');
      }
    }
  }, [product, isPackaged]);

  // Handle mode switch presets
  const handleModeChange = (newMode: EntryMode) => {
    setMode(newMode);
    if (newMode === 'kg') {
      setInputValue('10.00');
    } else if (newMode === 'bags') {
      setInputValue('1');
    } else if (newMode === 'mund') {
      setInputValue('1');
    } else if (newMode === 'packet') {
      setInputValue('1');
    }
  };

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
  }, [selectedProductForModal, inputValue, mode]);

  if (!product) return null;

  // Calculate actual net weight/qty based on mode
  const rawNum = parseFloat(inputValue) || 0;
  let netWeightKg = rawNum;

  if (mode === 'bags') {
    netWeightKg = rawNum * (product.boriWeightKg || 50);
  } else if (mode === 'mund') {
    netWeightKg = rawNum * 40; // 1 Mund = 40 KG in Pakistan Mandi
  } else if (mode === 'packet') {
    netWeightKg = rawNum;
  }

  // Calculate Subtotal
  const subtotal = netWeightKg * product.ratePerKg;

  const handleSave = () => {
    if (netWeightKg <= 0) return;

    addToCart({
      id: `cart-${Date.now()}`,
      product,
      mode,
      grossWeight: netWeightKg,
      tareWeight: 0,
      tareName: 'کاٹ نہیں',
      netWeight: netWeightKg,
      ratePerKg: product.ratePerKg,
      subtotal
    });

    setSelectedProductForModal(null);
  };

  const unitSuffix = product.unitLabel ? product.unitLabel.replace('/', '').trim() : 'kg';

  const getPresets = () => {
    if (mode === 'packet') {
      return [
        { label: `1 ${unitSuffix}`, val: '1' },
        { label: `2 ${unitSuffix}s`, val: '2' },
        { label: `3 ${unitSuffix}s`, val: '3' },
        { label: `6 ${unitSuffix}s (Half Carton)`, val: '6' },
        { label: `12 ${unitSuffix}s (Full Carton)`, val: '12' },
        { label: `24 ${unitSuffix}s (Bulk)`, val: '24' }
      ];
    }
    if (mode === 'bags') {
      return [
        { label: '1 Bag (50kg)', val: '1' },
        { label: '2 Bags (100kg)', val: '2' },
        { label: '5 Bags (250kg)', val: '5' },
        { label: '10 Bags (500kg)', val: '10' },
        { label: '20 Bags (1 Ton)', val: '20' },
        { label: '50 Bags (2.5 Ton)', val: '50' }
      ];
    }
    if (mode === 'mund') {
      return [
        { label: '1 Mund (40kg)', val: '1' },
        { label: '2 Mund (80kg)', val: '2' },
        { label: '5 Mund (200kg)', val: '5' },
        { label: '10 Mund (400kg)', val: '10' },
        { label: '25 Mund (1 Ton)', val: '25' }
      ];
    }
    return [
      { label: '1 KG', val: '1' },
      { label: '2 KG', val: '2' },
      { label: '5 KG', val: '5' },
      { label: '10 KG', val: '10' },
      { label: '25 KG', val: '25' },
      { label: '50 KG (Bori)', val: '50' }
    ];
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isPackaged ? <ShoppingBag className="w-5 h-5 text-emerald-200" /> : <Scale className="w-5 h-5 text-emerald-200" />}
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>وزن اور تعداد اندراج</span>
                <span className="text-emerald-200 font-normal text-xs">
                  {isPackaged ? '(Quantity Selection)' : '(Weight & Quantity Entry)'}
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                {product.name} ({product.urduName}) • SKU #{product.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedProductForModal(null)}
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Rate & Available Stock info strip */}
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono-num">
            <div className="flex items-center space-x-3">
              <img
                src={product.imageUrl || DEFAULT_RICE_IMAGE}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-xs bg-white shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = SVG_RICE_FALLBACK;
                }}
              />
              <div>
                <span className="text-[10px] text-slate-500 block font-sans">مقررہ ریٹ (Base Rate):</span>
                <span className="text-sm font-bold text-slate-900">
                  PKR {product.ratePerKg.toLocaleString()}{' '}
                  <span className="text-[10px] text-slate-500 font-normal font-sans">
                    {product.unitLabel || '/ kg'}
                  </span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-sans">موجودہ سٹاک (Available):</span>
              <span className="text-sm font-bold text-emerald-700">
                {product.availableStockLabel || `${product.availableKg} KG`}{' '}
                <span className="text-[10px] text-slate-500 font-normal font-sans">({product.binLocation})</span>
              </span>
            </div>
          </div>

          {/* Select Entry Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>(SELECT ENTRY MODE) اندراج کی قسم:</span>
              <span className="text-slate-400 font-normal text-[10px]">
                {isPackaged ? 'تعداد منتخب کریں' : 'وزن یا بوری منتخب کریں'}
              </span>
            </label>
            {isPackaged ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('packet')}
                  className="py-2 px-3 rounded-lg border font-bold text-xs bg-emerald-800 text-white border-emerald-900 shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>تعداد ({unitSuffix.toUpperCase()})</span>
                </button>
                <div className="flex items-center text-[11px] text-slate-500 px-2">
                  <span>سیلڈ پیکجڈ آئٹم (Standard Unit)</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('kg')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                    mode === 'kg'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  (KG Weight) وزن
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('bags')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                    mode === 'bags'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  (Bags) بوری / بیگز
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('mund')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
                    mode === 'mund'
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  (Mund 40kg) من
                </button>
              </div>
            )}
          </div>

          {/* Input field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {mode === 'packet'
                ? `تعداد (${unitSuffix.toUpperCase()} Quantity):`
                : mode === 'bags'
                ? 'تعداد بوری (Number of Bags):'
                : mode === 'mund'
                ? 'تعداد من (Mund 40kg):'
                : 'صاف وزن (Net Weight):'}
            </label>
            <div className="relative">
              <input
                type="number"
                step={mode === 'kg' ? '0.01' : '1'}
                min="0"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-xl font-bold font-mono-num px-3 py-2 bg-white border-2 border-emerald-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
              />
              <span className="absolute right-3 top-2.5 font-bold text-xs text-slate-500 uppercase">
                {mode === 'packet'
                  ? unitSuffix
                  : mode === 'bags'
                  ? 'Bori (50kg)'
                  : mode === 'mund'
                  ? 'Mund (40kg)'
                  : 'KG'}
              </span>
            </div>
          </div>

          {/* Quick preset buttons depending on mode */}
          <div>
            <span className="block text-[10px] text-slate-500 mb-1.5 font-medium">
              فوری بٹن برائے فوری اندراج (Quick Presets):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {getPresets().map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setInputValue(preset.val)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    inputValue === preset.val
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Subtotal Summary Card */}
          <div className="bg-emerald-950 text-white p-3.5 rounded-lg flex items-center justify-between font-mono-num shadow-inner">
            <div>
              <span className="text-[10px] text-emerald-300 font-sans block">
                صاف وزن / مقدار (Total Net Quantity):
              </span>
              <span className="text-base font-bold">
                {mode === 'packet'
                  ? `${Math.round(netWeightKg)} ${unitSuffix}`
                  : `${netWeightKg.toFixed(2)} KG`}
                {mode === 'bags' && (
                  <span className="text-xs text-emerald-300 font-normal font-sans ml-1">
                    ({rawNum} Bori)
                  </span>
                )}
                {mode === 'mund' && (
                  <span className="text-xs text-emerald-300 font-normal font-sans ml-1">
                    ({rawNum} Mund)
                  </span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 font-sans block">
                کل رقم (Calculated Subtotal):
              </span>
              <span className="text-xl font-extrabold text-emerald-300">
                PKR {Math.round(subtotal).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono">
            Press [ESC] to Cancel • [ENTER] to Add
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSelectedProductForModal(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              Cancel (منسوخ)
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center space-x-1.5"
            >
              <span>+ Add to Bill (بل میں شامل کریں)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
