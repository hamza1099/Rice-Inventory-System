import React, { useState, useEffect } from 'react';
import { X, Scale, ShoppingBag, AlertTriangle, AlertCircle, Ban } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import type { EntryMode } from '../../types';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/productImages';
import { notifyError } from '../../utils/toast';

export const WeightEntryModal: React.FC = () => {
  const { selectedProductForModal, setSelectedProductForModal, addToCart, openImagePreview, language, inventory } = usePos();

  const product = selectedProductForModal;
  const isPackaged =
    product?.unitLabel === '/ pkt' ||
    product?.unitLabel === '/ tin' ||
    product?.unitLabel === '/ bag' ||
    product?.unitLabel === '/ pc' ||
    product?.unitLabel === '/ piece' ||
    product?.unitLabel === '/ liter' ||
    product?.unitLabel === '/ can' ||
    product?.unitLabel === '/ carton';

  const [mode, setMode] = useState<EntryMode>('kg');
  const [inputValue, setInputValue] = useState<string>('1');
  const [rateValue, setRateValue] = useState<string>('');
  const [amountValue, setAmountValue] = useState<string>('');

  useEffect(() => {
    if (product) {
      const baseRate = product.ratePerKg;
      setRateValue(baseRate.toString());
      if (isPackaged) {
        setMode('packet');
        setInputValue('1');
        setAmountValue(baseRate.toString());
      } else {
        setMode('kg');
        setInputValue('1');
        setAmountValue(baseRate.toString());
      }
    }
  }, [product, isPackaged]);

  const currentRateNum = parseFloat(rateValue);
  const activeRate = !isNaN(currentRateNum) && currentRateNum > 0 ? currentRateNum : (product?.ratePerKg || 0);
  const isRateModified = product ? activeRate !== product.ratePerKg : false;
  const rateDifference = product ? activeRate - product.ratePerKg : 0;

  // Reset rate to original base product rate
  const handleResetRate = () => {
    if (!product) return;
    const baseRate = product.ratePerKg;
    setRateValue(baseRate.toString());
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num > 0) {
      let kg = num;
      if (mode === 'bags') {
        kg = num * (product.boriWeightKg || 25);
      } else if (mode === 'mund') {
        kg = num * 40;
      }
      setAmountValue(Math.round(kg * baseRate).toString());
    }
  };

  // Handle custom selling rate change
  const handleRateChange = (newRateStr: string) => {
    setRateValue(newRateStr);
    const newRate = parseFloat(newRateStr);
    const num = parseFloat(inputValue);
    if (!isNaN(newRate) && newRate > 0 && !isNaN(num) && num > 0 && product) {
      let kg = num;
      if (mode === 'bags') {
        kg = num * (product.boriWeightKg || 25);
      } else if (mode === 'mund') {
        kg = num * 40;
      }
      setAmountValue(Math.round(kg * newRate).toString());
    } else if (isNaN(newRate) || newRate <= 0) {
      setAmountValue('');
    }
  };

  // Handle mode switch presets
  const handleModeChange = (newMode: EntryMode) => {
    setMode(newMode);
    if (!product) return;
    setInputValue('1');
    const rate = activeRate;
    if (newMode === 'kg') {
      setAmountValue(rate.toString());
    } else if (newMode === 'bags') {
      const boriKg = product.boriWeightKg || 25;
      setAmountValue(Math.round(boriKg * rate).toString());
    } else if (newMode === 'mund') {
      setAmountValue(Math.round(40 * rate).toString());
    } else if (newMode === 'packet') {
      setAmountValue(rate.toString());
    }
  };

  // Bidirectional Weight / Quantity change
  const handleWeightChange = (val: string) => {
    setInputValue(val);
    const num = parseFloat(val);
    const rate = activeRate;
    if (!isNaN(num) && product && rate > 0) {
      let kg = num;
      if (mode === 'bags') {
        kg = num * (product.boriWeightKg || 25);
      } else if (mode === 'mund') {
        kg = num * 40;
      }
      setAmountValue(Math.round(kg * rate).toString());
    } else {
      setAmountValue('');
    }
  };

  // Bidirectional PKR Amount change (auto-calculates weight)
  const handleAmountChange = (val: string) => {
    setAmountValue(val);
    const pkr = parseFloat(val);
    const rate = activeRate;
    if (!isNaN(pkr) && product && rate > 0) {
      if (mode === 'bags') {
        const bagRate = (product.boriWeightKg || 25) * rate;
        setInputValue(parseFloat((pkr / bagRate).toFixed(2)).toString());
      } else if (mode === 'mund') {
        const mundRate = 40 * rate;
        setInputValue(parseFloat((pkr / mundRate).toFixed(2)).toString());
      } else if (mode === 'packet') {
        const units = Math.max(1, Math.round(pkr / rate));
        setInputValue(units.toString());
      } else {
        // kg mode: calculates exact weight
        const calc = pkr / rate;
        const kg2 = parseFloat(calc.toFixed(2));
        if (Math.round(kg2 * rate) === Math.round(pkr)) {
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
  }, [selectedProductForModal, inputValue, amountValue, rateValue, mode]);

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

  // Stock availability & boundary checks
  const availableStockKg = product.availableKg !== undefined ? product.availableKg : 0;
  const isOutOfStock = availableStockKg <= 0;
  const isOverStock = !isOutOfStock && netWeightKg > availableStockKg;
  const isInvalidQty = netWeightKg <= 0;
  const isAddDisabled = isOutOfStock || isOverStock || isInvalidQty;

  // Calculate Subtotal with custom active rate
  const subtotal = Math.round(netWeightKg * activeRate);

  const handleSave = () => {
    if (isOutOfStock) {
      notifyError(
        language === 'ur'
          ? `سٹاک دستیاب نہیں ہے! "${product.urduName || product.name}" کا سٹاک 0 KG ہے۔`
          : `No Stock Available! "${product.name}" has 0 KG in stock.`
      );
      return;
    }

    if (isOverStock) {
      notifyError(
        language === 'ur'
          ? `مطلوبہ وزن (${netWeightKg} KG) دستیاب سٹاک (${availableStockKg} KG) سے زیادہ ہے!`
          : `Requested quantity (${netWeightKg} KG) exceeds available stock (${availableStockKg} KG)!`
      );
      return;
    }

    if (netWeightKg <= 0 || activeRate <= 0) return;

    const invMatch = inventory.find(
      (i) =>
        i.id === product.id ||
        i.varietyName.trim().toLowerCase() === product.name.trim().toLowerCase() ||
        (product.urduName && i.urduName && i.urduName.trim() === product.urduName.trim())
    );
    const itemCost = product.costPerKg ?? invMatch?.costPerKg ?? 0;

    addToCart({
      id: `cart-${Date.now()}`,
      product: { ...product, costPerKg: itemCost },
      mode,
      grossWeight: netWeightKg,
      tareWeight: 0,
      tareName: 'کاٹ نہیں',
      netWeight: netWeightKg,
      ratePerKg: activeRate,
      costPerKg: itemCost,
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-[560px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-4 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            {isPackaged ? <ShoppingBag className="w-4 h-4 text-emerald-200 shrink-0" /> : <Scale className="w-4 h-4 text-emerald-200 shrink-0" />}
            <div className="min-w-0">
              <h2 className="text-sm font-bold flex items-center gap-2 truncate">
                <span>
                  {isUr
                    ? (isPackaged ? 'تعداد کا انتخاب' : 'وزن اور تعداد کا اندراج')
                    : (isPackaged ? 'Quantity Selection' : 'Weight & Quantity Entry')}
                </span>
              </h2>
              <p className="text-[10.5px] text-emerald-100 truncate">
                {isUr ? (product.urduName || product.name) : product.name} • SKU #{product.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedProductForModal(null)}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700/50 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 space-y-2.5 text-xs overflow-y-auto min-h-0 flex-1 scrollbar-thin">
          {/* Rate & Available Stock info strip */}
          <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 font-mono-num">
            <div className="flex items-center space-x-2.5 min-w-0">
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
                className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-xs bg-white shrink-0 cursor-pointer group hover:border-emerald-600 transition-colors relative"
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
              <div className="min-w-0">
                <span className="text-[9.5px] text-slate-500 block font-sans uppercase font-medium">
                  {isUr ? 'مقررہ ریٹ:' : 'Base Rate:'}
                </span>
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    PKR {product.ratePerKg.toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-500 font-normal font-sans">
                      {isUr ? (product.unitLabel === '/ kg' ? '/ کلو' : product.unitLabel) : (product.unitLabel || '/ kg')}
                    </span>
                  </span>
                  {isRateModified && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono-num animate-in fade-in">
                      {isUr ? `سیل: PKR ${activeRate}` : `Sale: PKR ${activeRate}`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9.5px] text-slate-500 block font-sans uppercase font-medium">
                {isUr ? 'موجودہ سٹاک:' : 'Available Stock:'}
              </span>
              <span className={`text-sm font-bold ${isOutOfStock ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}`}>
                {product.availableStockLabel || `${product.availableKg} KG`}
              </span>
              <span className="text-[9.5px] text-slate-500 block font-sans">({product.binLocation})</span>
              {isOutOfStock && (
                <span className="block text-[9px] font-bold text-rose-600 font-sans uppercase">
                  {isUr ? 'سٹاک ختم ہے (0 KG)' : 'Out of Stock (0 KG)'}
                </span>
              )}
            </div>
          </div>

          {/* Out of Stock or Insufficient Stock Banner */}
          {isOutOfStock ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-rose-900 text-xs animate-in fade-in">
              <div className="flex items-center space-x-1.5">
                <Ban className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="font-bold text-[11px] text-rose-800">
                  {isUr ? 'سٹاک ختم ہے (0 KG) - بل میں شامل نہیں کیا جا سکتا!' : 'No Stock Available (0 KG) - Cannot Add to Bill!'}
                </span>
              </div>
              <span className="text-[10px] text-rose-600 font-medium">
                {isUr ? 'گودام میں نیا سٹاک درج کریں' : 'Inward stock in Godown'}
              </span>
            </div>
          ) : isOverStock ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-amber-900 text-xs animate-in fade-in">
              <div className="flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-bold text-[11px] text-amber-800">
                  {isUr
                    ? `مطلوبہ وزن (${netWeightKg} KG) دستیاب سٹاک (${availableStockKg} KG) سے زیادہ ہے!`
                    : `Requested quantity (${netWeightKg} KG) exceeds stock (${availableStockKg} KG)!`}
                </span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium">
                {isUr ? 'وزن کم کریں' : 'Reduce quantity'}
              </span>
            </div>
          ) : null}

          {/* Select Entry Mode */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10.5px] font-bold text-slate-700">
                {isUr ? 'اندراج کی قسم منتخب کریں:' : 'Select Entry Mode:'}
              </span>
              <span className="text-slate-400 font-normal text-[10px]">
                {isUr
                  ? (isPackaged ? 'تعداد منتخب کریں' : 'وزن یا بوری منتخب کریں')
                  : (isPackaged ? 'Choose Quantity' : 'Choose Weight or Bags')}
              </span>
            </div>
            {isPackaged ? (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleModeChange('packet')}
                  className="py-1.5 px-3 rounded-lg border font-bold text-xs bg-emerald-800 text-white border-emerald-900 shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>
                    {isUr ? `تعداد (${unitSuffix === 'kg' ? 'کلو' : unitSuffix})` : `Quantity (${unitSuffix.toUpperCase()})`}
                  </span>
                </button>
                <div className="flex items-center text-[10.5px] text-slate-500 px-2">
                  <span>{isUr ? 'سیلڈ پیکجڈ آئٹم' : 'Standard Sealed Unit'}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleModeChange('kg')}
                  className={`py-1.5 px-2 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
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
                  className={`py-1.5 px-2 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
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
                  className={`py-1.5 px-2 rounded-lg border font-bold text-xs transition-all cursor-pointer ${
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

          {/* 3-Column Input Fields: Weight/Quantity, Selling Rate, and Subtotal Amount */}
          <div className="grid grid-cols-3 gap-2">
            {/* Field 1: Weight / Quantity */}
            <div>
              <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5 truncate">
                {isUr
                  ? (mode === 'packet'
                    ? `تعداد (${unitSuffix === 'kg' ? 'کلو' : unitSuffix}):`
                    : mode === 'bags'
                    ? `تعداد بوری:`
                    : mode === 'mund'
                    ? 'تعداد من:'
                    : 'وزن (کلو):')
                  : (mode === 'packet'
                    ? `Qty (${unitSuffix.toUpperCase()}):`
                    : mode === 'bags'
                    ? `Bags (${product.boriWeightKg || 25}kg):`
                    : mode === 'mund'
                    ? 'Maan (40kg):'
                    : 'Weight (KG):')}
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
                  className="w-full text-sm font-bold font-mono-num pl-2.5 pr-8 py-1.5 bg-white border-2 border-emerald-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
                <span className="absolute right-2 top-2 font-bold text-[9.5px] text-slate-500 uppercase pointer-events-none">
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

            {/* Field 2: Custom Selling Rate */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 truncate">
                  {isUr ? 'سیل ریٹ:' : 'Sale Rate:'}
                </label>
                {isRateModified && (
                  <button
                    type="button"
                    onClick={handleResetRate}
                    className="text-[9px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                    title={isUr ? 'اصل ریٹ پر واپس لائیں' : 'Reset to Base Rate'}
                  >
                    {isUr ? 'ری سیٹ' : 'Reset'}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={rateValue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleRateChange(e.target.value)}
                  placeholder={product.ratePerKg.toString()}
                  className={`w-full text-sm font-bold font-mono-num pl-2.5 pr-9 py-1.5 bg-white border-2 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900 transition-colors ${
                    isRateModified
                      ? 'border-amber-500 bg-amber-50/60 text-amber-950 focus:border-amber-600'
                      : 'border-slate-300 focus:border-emerald-600'
                  }`}
                />
                <span className={`absolute right-2 top-2 font-bold text-[9.5px] uppercase pointer-events-none ${
                  isRateModified ? 'text-amber-700' : 'text-slate-500'
                }`}>
                  PKR
                </span>
              </div>
            </div>

            {/* Field 3: Amount in Rupees / PKR (Auto-calculates Weight) */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[10.5px] font-bold text-slate-700 truncate">
                  {isUr ? 'رقم (روپے):' : 'Amount (PKR):'}
                </label>
                <span className="text-[9px] text-emerald-700 font-medium">
                  {isUr ? 'خود وزن' : 'Auto'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={amountValue}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full text-sm font-bold font-mono-num pl-2.5 pr-8 py-1.5 bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
                />
                <span className="absolute right-2 top-2 font-bold text-[9.5px] text-slate-500 uppercase pointer-events-none">
                  PKR
                </span>
              </div>
            </div>
          </div>

          {/* Quick Rate & Discount presets */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs flex-wrap gap-1">
            <div className="flex items-center space-x-1 flex-wrap gap-y-1">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase mr-0.5">
                {isUr ? 'فوری ریٹ:' : 'Quick Rate:'}
              </span>
              <button
                type="button"
                onClick={handleResetRate}
                className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border transition-colors cursor-pointer ${
                  !isRateModified
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isUr ? `اصل (${product.ratePerKg})` : `Base (${product.ratePerKg})`}
              </button>
              {[-5, -10, -15, -20].map((diff) => {
                const discounted = product.ratePerKg + diff;
                if (discounted <= 0) return null;
                const isSelected = activeRate === discounted;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => handleRateChange(discounted.toString())}
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold border font-mono-num transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    {diff} ({discounted})
                  </button>
                );
              })}
            </div>
            {isRateModified && (
              <span className="text-[9.5px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded font-mono-num border border-amber-300">
                {rateDifference < 0
                  ? (isUr
                    ? `رعایت: -PKR ${Math.abs(rateDifference)}`
                    : `Disc: -PKR ${Math.abs(rateDifference)}/kg`)
                  : (isUr
                    ? `اضافی: +PKR ${rateDifference}`
                    : `Prem: +PKR ${rateDifference}/kg`)}
              </span>
            )}
          </div>

          {/* Quick Weight & Cash presets */}
          <div className="space-y-1.5">
            <div>
              <span className="block text-[9.5px] text-slate-500 mb-0.5 font-medium">
                {isUr ? 'فوری وزن:' : 'Quick Weight Presets:'}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {getPresets().map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => handleWeightChange(preset.val)}
                    className={`px-2 py-0.5 rounded-md border text-[11px] font-bold transition-all cursor-pointer ${
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
              <span className="block text-[9.5px] text-slate-500 mb-0.5 font-medium">
                {isUr ? 'فوری رقم (روپے):' : 'Quick Cash Presets (PKR):'}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {['100', '200', '500', '1000', '2000', '5000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountChange(amt)}
                    className={`px-2 py-0.5 rounded-md border text-[10.5px] font-mono-num font-bold transition-all cursor-pointer ${
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
          <div className="bg-emerald-950 text-white px-3.5 py-2 rounded-lg flex items-center justify-between font-mono-num shadow-inner">
            <div>
              <span className="text-[9.5px] text-emerald-300 font-sans block">
                {isUr ? 'خالص مقدار / وزن:' : 'Total Net Quantity:'}
              </span>
              <span className="text-sm font-bold">
                {mode === 'packet'
                  ? `${Math.round(netWeightKg)} ${isUr && unitSuffix === 'kg' ? 'کلو' : unitSuffix}`
                  : `${netWeightKg.toFixed(2)} ${isUr ? 'کلو' : 'KG'}`}
                {mode === 'bags' && (
                  <span className="text-[11px] text-emerald-300 font-normal font-sans ml-1">
                    ({rawNum} {isUr ? 'بوری' : 'Bags'})
                  </span>
                )}
                {mode === 'mund' && (
                  <span className="text-[11px] text-emerald-300 font-normal font-sans ml-1">
                    ({rawNum} {isUr ? 'من' : 'Maan'})
                  </span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9.5px] text-emerald-300 font-sans block">
                {isUr ? 'کل رقم:' : 'Calculated Subtotal:'}
              </span>
              <span className="text-lg font-extrabold text-emerald-300">
                PKR {Math.round(subtotal).toLocaleString()}
              </span>
              {isRateModified && (
                <span className="block text-[9.5px] text-amber-300 font-sans font-medium">
                  {isUr
                    ? `مخصوص ریٹ: PKR ${activeRate} (اصل: ${product.ratePerKg})`
                    : `Special Rate: PKR ${activeRate}/kg (Base: ${product.ratePerKg})`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1.5 text-[10.5px] text-slate-500 font-mono whitespace-nowrap">
            <span className="px-1.5 py-0.5 bg-slate-200/80 rounded font-bold text-slate-700">ESC</span>
            <span>{isUr ? 'منسوخ' : 'Cancel'}</span>
            <span className="text-slate-300">•</span>
            <span className="px-1.5 py-0.5 bg-slate-200/80 rounded font-bold text-slate-700">ENTER</span>
            <span>{isUr ? 'بل میں شامل' : 'Add'}</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedProductForModal(null)}
              className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              {isUr ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isAddDisabled}
              className={`whitespace-nowrap px-4 py-1.5 font-bold text-xs rounded-lg shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                  : isOverStock
                  ? 'bg-amber-200 text-amber-900 border border-amber-300 cursor-not-allowed shadow-none'
                  : 'bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white'
              }`}
              title={
                isOutOfStock
                  ? (isUr ? 'سٹاک ختم ہے (0 KG دستیاب)' : 'No Stock Available (0 KG)')
                  : isOverStock
                  ? (isUr ? 'مطلوبہ وزن دستیاب سٹاک سے زیادہ ہے' : 'Requested weight exceeds available stock')
                  : undefined
              }
            >
              {isOutOfStock ? (
                <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              ) : isOverStock ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              ) : null}
              <span className="whitespace-nowrap">
                {isOutOfStock
                  ? (isUr ? 'سٹاک ختم ہے (0 KG)' : 'No Stock (0 KG)')
                  : isOverStock
                  ? (isUr ? 'سٹاک سے زیادہ وزن' : 'Exceeds Stock')
                  : (isUr ? '+ بل میں شامل کریں' : '+ Add to Bill')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
