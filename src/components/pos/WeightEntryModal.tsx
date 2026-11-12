import React, { useState, useEffect } from 'react';
import { X, Scale, ShoppingBag } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import type { EntryMode } from '../../types';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/productImages';

export const WeightEntryModal: React.FC = () => {
  const { selectedProductForModal, setSelectedProductForModal, addToCart, openImagePreview, language } = usePos();

  const product = selectedProductForModal;
  const isPackaged =
    product?.unitLabel === '/ pkt' ||
    product?.unitLabel === '/ tin' ||
    product?.unitLabel === '/ bag';

  const [mode, setMode] = useState<EntryMode>('kg');
  const [inputValue, setInputValue] = useState<string>('1');
  const [amountValue, setAmountValue] = useState<string>('');

  useEffect(() => {
    if (product) {
      if (isPackaged) {
        setMode('packet');
        setInputValue('1');
        setAmountValue(product.ratePerKg.toString());
      } else {
        setMode('kg');
        setInputValue('1');
        setAmountValue(product.ratePerKg.toString());
      }
    }
  }, [product, isPackaged]);

  // Handle mode switch presets
  const handleModeChange = (newMode: EntryMode) => {
    setMode(newMode);
    if (!product) return;
    setInputValue('1');
    if (newMode === 'kg') {
      setAmountValue(product.ratePerKg.toString());
    } else if (newMode === 'bags') {
      const boriKg = product.boriWeightKg || 25;
      setAmountValue((boriKg * product.ratePerKg).toString());
    } else if (newMode === 'mund') {
      setAmountValue((40 * product.ratePerKg).toString());
    } else if (newMode === 'packet') {
      setAmountValue(product.ratePerKg.toString());
    }
  };

  // Bidirectional Weight / Quantity change
  const handleWeightChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && product && product.ratePerKg > 0) {
      let kg = num;
      if (mode === 'bags') {
        kg = num * (product.boriWeightKg || 25);
      } else if (mode === 'mund') {
        kg = num * 40;
      }
      setAmountValue(Math.round(kg * product.ratePerKg).toString());
    } else {
      setAmountValue('');
    }
  };

  // Bidirectional PKR Amount change (auto-calculates weight)
  const handleAmountChange = (val: string) => {
    setAmountValue(val);
    const pkr = parseFloat(val);
    if (!isNaN(pkr) && product && product.ratePerKg > 0) {
      if (mode === 'bags') {
        const bagRate = (product.boriWeightKg || 25) * product.ratePerKg;
        setInputValue(parseFloat((pkr / bagRate).toFixed(2)).toString());
      } else if (mode === 'mund') {
        const mundRate = 40 * product.ratePerKg;
        setInputValue(parseFloat((pkr / mundRate).toFixed(2)).toString());
      } else if (mode === 'packet') {
        const units = Math.max(1, Math.round(pkr / product.ratePerKg));
        setInputValue(units.toString());
      } else {
        // kg mode: calculates exact weight
        const calc = pkr / product.ratePerKg;
        const kg2 = parseFloat(calc.toFixed(2));
        if (Math.round(kg2 * product.ratePerKg) === Math.round(pkr)) {
          setInputValue(kg2.toString());
        } else {
          const kg3 = parseFloat(calc.toFixed(3));
          setInputValue(kg3.toString());
        }
      }
    } else {
      setInputValue('');
    }
  };

  const handleAmountPreset = (amt: string) => {
    handleAmountChange(amt);
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
  }, [selectedProductForModal, inputValue, amountValue, mode]);

  if (!product) return null;

  // Calculate actual net weight/qty based on mode (1 Bori = 25 KG by default)
  const rawNum = parseFloat(inputValue) || 0;
  let netWeightKg = rawNum;

  if (mode === 'bags') {
    netWeightKg = rawNum * (product.boriWeightKg || 25);
  } else if (mode === 'mund') {
    netWeightKg = rawNum * 40; // 1 Maan = 40 KG in Pakistan Mandi
  } else if (mode === 'packet') {
    netWeightKg = rawNum;
  }

  // Calculate Subtotal
  const subtotal = Math.round(netWeightKg * product.ratePerKg);

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
    const isUr = language === 'ur';
    if (mode === 'packet') {
      const uLabel = isUr ? (unitSuffix === 'kg' ? 'کلو' : unitSuffix) : unitSuffix;
      return [
        { label: isUr ? `1 ${uLabel}` : `1 ${unitSuffix}`, val: '1' },
        { label: isUr ? `2 ${uLabel}` : `2 ${unitSuffix}s`, val: '2' },
        { label: isUr ? `3 ${uLabel}` : `3 ${unitSuffix}s`, val: '3' },
        { label: isUr ? `6 ${uLabel} (نصف کارٹن)` : `6 ${unitSuffix}s (Half Carton)`, val: '6' },
        { label: isUr ? `12 ${uLabel} (مکمل کارٹن)` : `12 ${unitSuffix}s (Full Carton)`, val: '12' },
        { label: isUr ? `24 ${uLabel} (تھوک / بلک)` : `24 ${unitSuffix}s (Bulk)`, val: '24' }
      ];
    }
    if (mode === 'bags') {
      const bWeight = product.boriWeightKg || 25;
      return [
        { label: isUr ? `1 بوری (${bWeight} کلو)` : `1 Bag (${bWeight}kg)`, val: '1' },
        { label: isUr ? `2 بوری (${bWeight * 2} کلو)` : `2 Bags (${bWeight * 2}kg)`, val: '2' },
        { label: isUr ? `4 بوری (${bWeight * 4} کلو)` : `4 Bags (${bWeight * 4}kg)`, val: '4' },
        { label: isUr ? `10 بوری (${bWeight * 10} کلو)` : `10 Bags (${bWeight * 10}kg)`, val: '10' },
        { label: isUr ? `20 بوری (${(bWeight * 20) / 1000} ٹن)` : `20 Bags (${(bWeight * 20) / 1000} Ton)`, val: '20' },
        { label: isUr ? `40 بوری (1 ٹن)` : `40 Bags (1 Ton)`, val: '40' }
      ];
    }
    if (mode === 'mund') {
      return [
        { label: isUr ? '1 من (40 کلو)' : '1 Maan (40kg)', val: '1' },
        { label: isUr ? '2 من (80 کلو)' : '2 Maan (80kg)', val: '2' },
        { label: isUr ? '5 من (200 کلو)' : '5 Maan (200kg)', val: '5' },
        { label: isUr ? '10 من (400 کلو)' : '10 Maan (400kg)', val: '10' },
        { label: isUr ? '25 من (1 ٹن)' : '25 Maan (1 Ton)', val: '25' }
      ];
    }
    return [
      { label: isUr ? '1 کلو' : '1 KG', val: '1' },
      { label: isUr ? '2 کلو' : '2 KG', val: '2' },
      { label: isUr ? '5 کلو' : '5 KG', val: '5' },
      { label: isUr ? '10 کلو' : '10 KG', val: '10' },
      { label: isUr ? '25 کلو (بوری)' : '25 KG (Bag)', val: '25' },
      { label: isUr ? '50 کلو (2 بوری)' : '50 KG (2 Bags)', val: '50' }
    ];
  };

  const isUr = language === 'ur';

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
                <span>
                  {isUr
                    ? (isPackaged ? 'تعداد کا انتخاب' : 'وزن اور تعداد کا اندراج')
                    : (isPackaged ? 'Quantity Selection' : 'Weight & Quantity Entry')}
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                {isUr ? (product.urduName || product.name) : product.name} • SKU #{product.id.toUpperCase()}
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
              <div
                onClick={() =>
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
                  })
                }
                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-white shrink-0 cursor-pointer group hover:border-emerald-600 transition-colors relative"
                title={isUr ? 'بڑی تصویر دیکھیں' : 'Click to preview large image'}
              >
                <img
                  src={product.imageUrl || DEFAULT_RICE_IMAGE}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SVG_RICE_FALLBACK;
                  }}
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-sans">
                  {isUr ? 'مقررہ ریٹ:' : 'Base Rate:'}
                </span>
                <span className="text-sm font-bold text-slate-900">
                  PKR {product.ratePerKg.toLocaleString()}{' '}
                  <span className="text-[10px] text-slate-500 font-normal font-sans">
                    {isUr ? (product.unitLabel === '/ kg' ? '/ کلو' : product.unitLabel) : (product.unitLabel || '/ kg')}
                  </span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-sans">
                {isUr ? 'موجودہ سٹاک:' : 'Available Stock:'}
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {product.availableStockLabel || `${product.availableKg} KG`}{' '}
                <span className="text-[10px] text-slate-500 font-normal font-sans">({product.binLocation})</span>
              </span>
            </div>
          </div>

          {/* Select Entry Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>{isUr ? 'اندراج کی قسم منتخب کریں:' : 'Select Entry Mode:'}</span>
              <span className="text-slate-400 font-normal text-[10px]">
                {isUr
                  ? (isPackaged ? 'تعداد منتخب کریں' : 'وزن یا بوری منتخب کریں')
                  : (isPackaged ? 'Choose Quantity' : 'Choose Weight or Bags')}
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
                  <span>
                    {isUr ? `تعداد (${unitSuffix === 'kg' ? 'کلو' : unitSuffix})` : `Quantity (${unitSuffix.toUpperCase()})`}
                  </span>
                </button>
                <div className="flex items-center text-[11px] text-slate-500 px-2">
                  <span>{isUr ? 'سیلڈ پیکجڈ آئٹم' : 'Standard Sealed Unit'}</span>
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
                  {isUr ? 'وزن (کلو)' : 'Weight (KG)'}
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
                  {isUr
                    ? `بوری (${product.boriWeightKg || 25} کلو)`
                    : `Bags (${product.boriWeightKg || 25}kg)`}
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
                  {isUr ? 'من (40 کلو)' : 'Maan (40kg)'}
                </button>
              </div>
            )}
          </div>

          {/* Dual Input fields: Weight & PKR Amount */}
          <div className="grid grid-cols-2 gap-3">
            {/* Field 1: Weight / Quantity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>
                  {isUr
                    ? (mode === 'packet'
                      ? `تعداد (${unitSuffix === 'kg' ? 'کلو' : unitSuffix}):`
                      : mode === 'bags'
                      ? `تعداد بوری (${product.boriWeightKg || 25} کلو):`
                      : mode === 'mund'
                      ? 'تعداد من (40 کلو):'
                      : 'وزن (کلو):')
                    : (mode === 'packet'
                      ? `Quantity (${unitSuffix.toUpperCase()}):`
                      : mode === 'bags'
                      ? `Number of Bags (${product.boriWeightKg || 25}kg):`
                      : mode === 'mund'
                      ? 'Number of Maan (40kg):'
                      : 'Weight (KG):')}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  autoFocus
                  value={inputValue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder="1"
                  className="w-full text-lg font-bold font-mono-num pl-3 pr-11 py-2 bg-white border-2 border-emerald-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
                <span className="absolute right-2.5 top-2.5 font-bold text-xs text-slate-500 uppercase pointer-events-none">
                  {isUr
                    ? (mode === 'packet'
                      ? (unitSuffix === 'kg' ? 'کلو' : unitSuffix)
                      : mode === 'bags'
                      ? 'بوری'
                      : mode === 'mund'
                      ? 'من'
                      : 'کلو')
                    : (mode === 'packet'
                      ? unitSuffix
                      : mode === 'bags'
                      ? 'Bori'
                      : mode === 'mund'
                      ? 'Maan'
                      : 'KG')}
                </span>
              </div>
            </div>

            {/* Field 2: Amount in Rupees / PKR (Auto-calculates Weight) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>{isUr ? 'رقم / پیسے (روپے):' : 'Amount (PKR):'}</span>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {isUr ? 'خود وزن نکالے' : 'Auto-calc weight'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={amountValue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full text-lg font-bold font-mono-num pl-3 pr-12 py-2 bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
                <span className="absolute right-2.5 top-2.5 font-bold text-xs text-slate-500 uppercase pointer-events-none">
                  PKR
                </span>
              </div>
            </div>
          </div>

          {/* Quick Weight & Cash presets */}
          <div className="space-y-2">
            <div>
              <span className="block text-[10px] text-slate-500 mb-1 font-medium">
                {isUr ? 'فوری وزن:' : 'Quick Weight Presets:'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {getPresets().map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => handleWeightChange(preset.val)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
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

            <div>
              <span className="block text-[10px] text-slate-500 mb-1 font-medium">
                {isUr ? 'فوری رقم (روپے):' : 'Quick Cash Presets (PKR):'}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['100', '200', '500', '1000', '2000', '5000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountChange(amt)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono-num font-bold transition-all cursor-pointer ${
                      amountValue === amt
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    Rs {parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Subtotal Summary Card */}
          <div className="bg-emerald-950 text-white p-3.5 rounded-lg flex items-center justify-between font-mono-num shadow-inner">
            <div>
              <span className="text-[10px] text-emerald-300 font-sans block">
                {isUr ? 'خالص مقدار / وزن:' : 'Total Net Quantity:'}
              </span>
              <span className="text-base font-bold">
                {mode === 'packet'
                  ? `${Math.round(netWeightKg)} ${isUr && unitSuffix === 'kg' ? 'کلو' : unitSuffix}`
                  : `${netWeightKg.toFixed(2)} ${isUr ? 'کلو' : 'KG'}`}
                {mode === 'bags' && (
                  <span className="text-xs text-emerald-300 font-normal font-sans ml-1">
                    ({rawNum} {isUr ? 'بوری' : 'Bags'})
                  </span>
                )}
                {mode === 'mund' && (
                  <span className="text-xs text-emerald-300 font-normal font-sans ml-1">
                    ({rawNum} {isUr ? 'من' : 'Maan'})
                  </span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 font-sans block">
                {isUr ? 'کل رقم:' : 'Calculated Subtotal:'}
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
            {isUr ? '[ESC] منسوخ • [ENTER] بل میں شامل' : 'Press [ESC] to Cancel • [ENTER] to Add'}
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSelectedProductForModal(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center space-x-1.5"
            >
              <span>{isUr ? '+ بل میں شامل کریں' : '+ Add to Bill'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
