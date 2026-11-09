import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../../types';
import {
  X,
  PackagePlus,
  ArrowDownToLine,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BadgePercent,
  Calculator,
  Layers
} from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/riceImages';

interface StockInwardModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
}

export const StockInwardModal: React.FC<StockInwardModalProps> = ({
  isOpen,
  item: initialItem,
  onClose
}) => {
  const { inventory, addStockInward } = usePos();
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  const [bags, setBags] = useState<number>(20);
  const [weightPerBag, setWeightPerBag] = useState<number>(50);

  // Inward Purchase Cost state
  const [costMode, setCostMode] = useState<'bag' | 'kg'>('bag');
  const [inwardCostPerBag, setInwardCostPerBag] = useState<number>(1000);
  const [inwardCostPerKg, setInwardCostPerKg] = useState<number>(20);

  // Selling rate adjustment
  const [sellingRatePerBag, setSellingRatePerBag] = useState<number>(2000);
  const [sellingRatePerKg, setSellingRatePerKg] = useState<number>(40);
  const [isSellingRateModified, setIsSellingRateModified] = useState<boolean>(false);

  const [sourceMandi, setSourceMandi] = useState<string>('Sheikhupura Rice Mandi');
  const [lotNote, setLotNote] = useState<string>('Lot #2024-B4 Fresh Inward Arrival');

  // Initialize or reset selectedItemId when modal opens or initialItem changes
  useEffect(() => {
    if (isOpen) {
      if (initialItem) {
        setSelectedItemId(initialItem.id);
      } else {
        setSelectedItemId('');
      }
    }
  }, [isOpen, initialItem]);

  const activeItem = inventory.find((i) => i.id === selectedItemId) || null;

  // Whenever active item or weight per bag changes, re-sync values
  useEffect(() => {
    if (activeItem) {
      const bagWeight = activeItem.packagingStandard.includes('25 kg')
        ? 25
        : activeItem.packagingStandard.includes('40 kg')
        ? 40
        : 50;
      setWeightPerBag(bagWeight);

      const bagCost = Math.round(activeItem.costPerKg * bagWeight);
      setInwardCostPerBag(bagCost);
      setInwardCostPerKg(activeItem.costPerKg);

      const bagSell = Math.round(activeItem.counterRatePerKg * bagWeight);
      setSellingRatePerBag(bagSell);
      setSellingRatePerKg(activeItem.counterRatePerKg);
      setIsSellingRateModified(false);
    }
  }, [selectedItemId]);

  if (!isOpen) return null;

  // Handle Cost Inputs Sync
  const handleCostPerBagChange = (val: number) => {
    setInwardCostPerBag(val);
    if (weightPerBag > 0) {
      setInwardCostPerKg(Math.round((val / weightPerBag) * 100) / 100);
    }
  };

  const handleCostPerKgChange = (val: number) => {
    setInwardCostPerKg(val);
    setInwardCostPerBag(Math.round(val * weightPerBag));
  };

  // Handle Selling Rate Inputs Sync
  const handleSellingRatePerBagChange = (val: number) => {
    setSellingRatePerBag(val);
    setIsSellingRateModified(true);
    if (weightPerBag > 0) {
      setSellingRatePerKg(Math.round((val / weightPerBag) * 100) / 100);
    }
  };

  const handleSellingRatePerKgChange = (val: number) => {
    setSellingRatePerKg(val);
    setIsSellingRateModified(true);
    setSellingRatePerBag(Math.round(val * weightPerBag));
  };

  const totalInwardKg = bags * weightPerBag;
  const totalInwardAmount = bags * inwardCostPerBag;

  // Calculations for Old Stock vs New Inward Stock & Profit Differentiation
  const oldStockKg = activeItem ? activeItem.physicalStockKg : 0;
  const oldStockBags = activeItem ? activeItem.bagsCount : 0;
  const oldCostPerKg = activeItem ? activeItem.costPerKg : 0;
  const oldCostPerBag = Math.round(oldCostPerKg * weightPerBag);
  const oldTotalValue = oldStockKg * oldCostPerKg;

  // Cost Difference
  const costDiffPerBag = inwardCostPerBag - oldCostPerBag;
  const costDiffPerKg = inwardCostPerKg - oldCostPerKg;
  const costPercentDiff = oldCostPerBag > 0 ? (costDiffPerBag / oldCostPerBag) * 100 : 0;

  // Weighted Average Cost (WAC)
  const totalCombinedKg = oldStockKg + totalInwardKg;
  const totalCombinedBags = oldStockBags + bags;
  const totalCombinedValuation = oldTotalValue + totalInwardAmount;
  const weightedAvgCostPerKg =
    totalCombinedKg > 0 ? totalCombinedValuation / totalCombinedKg : inwardCostPerKg;
  const weightedAvgCostPerBag = weightedAvgCostPerKg * weightPerBag;

  // Profit Margins based on the current/updated Counter Selling Rate
  const profitOldPerBag = sellingRatePerBag - oldCostPerBag;
  const profitOldPerKg = sellingRatePerKg - oldCostPerKg;
  const profitOldMarginPct = oldCostPerBag > 0 ? (profitOldPerBag / oldCostPerBag) * 100 : 0;

  const profitNewPerBag = sellingRatePerBag - inwardCostPerBag;
  const profitNewPerKg = sellingRatePerKg - inwardCostPerKg;
  const profitNewMarginPct = inwardCostPerBag > 0 ? (profitNewPerBag / inwardCostPerBag) * 100 : 0;

  const profitDifferencePerBag = profitNewPerBag - profitOldPerBag;

  const profitBlendedPerBag = sellingRatePerBag - weightedAvgCostPerBag;
  const profitBlendedMarginPct =
    weightedAvgCostPerBag > 0 ? (profitBlendedPerBag / weightedAvgCostPerBag) * 100 : 0;

  const handleConfirm = () => {
    if (!activeItem) {
      notifyWarning('Please select a rice variety first (پہلے چاول کی جنس منتخب کریں)');
      return;
    }
    if (bags <= 0) {
      notifyWarning('Please enter a valid number of bags (تعداد بوری درج کریں)');
      return;
    }
    if (inwardCostPerKg <= 0) {
      notifyWarning('Please enter a valid purchase cost (خریداری ریٹ درج کریں)');
      return;
    }

    addStockInward(
      activeItem.id,
      totalInwardKg,
      bags,
      inwardCostPerKg,
      isSellingRateModified ? sellingRatePerKg : undefined
    );

    notifySuccess(
      `Stock Inward Confirmed! Added ${bags} bags (${totalInwardKg.toLocaleString()} KG) of ${activeItem.varietyName}. Total Bill: PKR ${totalInwardAmount.toLocaleString()}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 text-xs">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowDownToLine className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">
                New Stock Inward & Cost Accounting (آمد گودام اور لاگت کا حساب)
              </h3>
              <p className="text-[11px] text-emerald-100 urdu-text" dir="rtl">
                {activeItem ? `${activeItem.varietyName} • ${activeItem.urduName}` : 'آمد برائے نئی جنس منتخب کریں'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Variety Selector Dropdown (Crucial: User selects which variety arrived!) */}
          <div className="bg-emerald-50/90 p-3 rounded-lg border-2 border-emerald-600 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Select Rice Variety (کس چاول کی آمد درج کرنی ہے؟):</span>
              </label>
              <span className="text-[10px] text-emerald-800 font-bold urdu-text" dir="rtl">
                (جنس منتخب کریں)
              </span>
            </div>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 border-2 border-emerald-600 rounded bg-white text-slate-900 shadow-2xs focus:outline-hidden cursor-pointer"
            >
              <option value="">-- چاول کی جنس کا انتخاب کریں (Select Rice Variety) --</option>
              {inventory.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.varietyName} ({inv.urduName}) • Stock: {inv.physicalStockKg.toLocaleString()} KG ({inv.bagsCount} bori) • Prev Cost: PKR {inv.costPerKg}/kg
                </option>
              ))}
            </select>
          </div>

          {!activeItem ? (
            /* Empty State when no variety is selected yet */
            <div className="text-center py-10 px-4 space-y-3 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 my-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <PackagePlus className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">
                پہلے اوپر دی گئی لسٹ سے چاول کی جنس منتخب کریں
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                جیسے ہی آپ چاول کی جنس منتخب کریں گے، اس کا موجودہ سٹاک، سابقہ خریداری لاگت اور منافع کا موازنہ خودکار طور پر ظاہر ہو جائے گا۔
              </p>
            </div>
          ) : (
            /* Loaded State for Selected Variety */
            <>
              {/* Selected Variety Card with Image Preview */}
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-lg p-2 shadow-xs">
                <img
                  src={activeItem.imageUrl || DEFAULT_RICE_IMAGE}
                  alt={activeItem.varietyName}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-xs bg-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = SVG_RICE_FALLBACK;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-extrabold text-xs text-slate-900 block truncate">
                    {activeItem.varietyName}
                  </span>
                  <span className="urdu-text text-[11px] text-emerald-800 font-bold block !leading-none" dir="rtl">
                    {activeItem.urduName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    SKU: {activeItem.sku} • {activeItem.packagingStandard}
                  </span>
                </div>
              </div>

              {/* Current Stock & Cost Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 grid grid-cols-3 gap-2 font-mono-num">
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">
                    Current Godown Stock:
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {oldStockKg.toLocaleString()} KG
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    ({oldStockBags} Bori)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">
                    Previous Purchase Cost:
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    PKR {oldCostPerBag.toLocaleString()} / bag
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    (PKR {oldCostPerKg.toFixed(2)}/kg)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-sans block">
                    Current Counter Selling:
                  </span>
                  <span className="text-xs font-black text-emerald-800">
                    PKR {activeItem.counterRatePerKg.toFixed(2)} / kg
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    (PKR {(activeItem.counterRatePerKg * weightPerBag).toLocaleString()} / bag)
                  </span>
                </div>
              </div>

              {/* Section 1: Inward Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Number of Bags (تعداد بوری):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bags}
                    onChange={(e) => setBags(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-base font-bold font-mono-num px-3 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Bag Standard Weight:
                  </label>
                  <select
                    value={weightPerBag}
                    onChange={(e) => setWeightPerBag(parseInt(e.target.value))}
                    className="w-full text-xs font-bold px-2 py-2 border border-slate-300 rounded bg-white"
                  >
                    <option value={50}>50 KG (Standard Jute Bori)</option>
                    <option value={25}>25 KG (Poly Woven Bag)</option>
                    <option value={40}>40 KG (1 Mund Pakka)</option>
                    <option value={100}>100 KG (Katta)</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Inward Purchase Cost Entry */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-700" />
                    <span>New Inward Purchase Cost (اس بار مال کتنے کا پڑا ہے؟):</span>
                  </label>
                  <div className="flex items-center space-x-1 bg-amber-100/70 p-0.5 rounded text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCostMode('bag')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        costMode === 'bag'
                          ? 'bg-amber-800 text-white'
                          : 'text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      Per Bag (فی بوری)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostMode('kg')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        costMode === 'kg'
                          ? 'bg-amber-800 text-white'
                          : 'text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      Per KG (فی کلو)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Cost Rate per Bag (ریٹ فی بوری):
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold font-mono">
                        PKR
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={inwardCostPerBag}
                        onChange={(e) => handleCostPerBagChange(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm font-black font-mono-num pl-12 pr-3 py-1.5 border-2 border-amber-500 rounded bg-white text-slate-900 focus:outline-hidden"
                        placeholder="e.g. 1600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                      Equivalent Rate per KG (ریٹ فی کلو):
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold font-mono">
                        PKR
                      </span>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={inwardCostPerKg}
                        onChange={(e) => handleCostPerKgChange(parseFloat(e.target.value) || 0)}
                        className="w-full text-sm font-black font-mono-num pl-12 pr-3 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:outline-hidden"
                        placeholder="e.g. 32.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Total Inward Purchase Amount Summary */}
                <div className="bg-white p-2 rounded border border-amber-200 flex items-center justify-between font-mono-num text-[11px]">
                  <div>
                    <span className="text-slate-600 block text-[10px]">
                      Total Inward Shipment Bill (کل خریداری بل برائے منڈی):
                    </span>
                    <span className="font-bold text-slate-800">
                      {bags} Bags × PKR {inwardCostPerBag.toLocaleString()} =
                    </span>
                  </div>
                  <div className="text-base font-black text-amber-900">
                    PKR {totalInwardAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Section 3: Cost Shift & Profit Differentiation */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <BadgePercent className="w-4 h-4 text-emerald-800" />
                    <h4 className="font-extrabold text-xs text-slate-900">
                      Cost Shift & Profit Analysis (لاگت میں فرق اور منافع کا موازنہ)
                    </h4>
                  </div>
                  {costDiffPerBag !== 0 && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 font-mono-num ${
                        costDiffPerBag > 0
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {costDiffPerBag > 0 ? (
                        <TrendingUp className="w-3 h-3 text-red-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-emerald-600" />
                      )}
                      <span>
                        {costDiffPerBag > 0 ? '+' : ''}PKR {costDiffPerBag.toLocaleString()}/bag (
                        {costPercentDiff > 0 ? '+' : ''}
                        {costPercentDiff.toFixed(1)}% {costDiffPerBag > 0 ? 'مہنگا ہوا' : 'سستا ہوا'})
                      </span>
                    </span>
                  )}
                </div>

                {/* Comparison Grid: Old Batch vs New Inward Batch */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-num">
                  {/* Old Batch */}
                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                      <span>Previous Batch (پچھلا مال)</span>
                      <span className="text-slate-400">{oldStockBags} Bags</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Purchase Cost:</span>
                      <strong className="text-slate-800">
                        PKR {oldCostPerBag.toLocaleString()}/bag
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Counter Sale Rate:</span>
                      <strong className="text-slate-800">
                        PKR {sellingRatePerBag.toLocaleString()}/bag
                      </strong>
                    </div>
                    <div className="border-t border-slate-100 pt-1 flex justify-between font-bold">
                      <span>Profit Margin (منافع):</span>
                      <span
                        className={
                          profitOldPerBag >= 0 ? 'text-emerald-700' : 'text-red-700'
                        }
                      >
                        {profitOldPerBag >= 0 ? '+' : ''}PKR {profitOldPerBag.toLocaleString()} (
                        {profitOldMarginPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* New Batch */}
                  <div
                    className={`p-2.5 rounded border space-y-1 ${
                      profitNewPerBag < 0
                        ? 'bg-red-50 border-red-300'
                        : costDiffPerBag > 0
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-700 uppercase flex items-center justify-between">
                      <span>New Inward Batch (نیا مال)</span>
                      <span className="text-slate-500">{bags} Bags</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Purchase Cost:</span>
                      <strong className="text-amber-900">
                        PKR {inwardCostPerBag.toLocaleString()}/bag
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Counter Sale Rate:</span>
                      <strong className="text-slate-800">
                        PKR {sellingRatePerBag.toLocaleString()}/bag
                      </strong>
                    </div>
                    <div className="border-t border-slate-200 pt-1 flex justify-between font-bold">
                      <span>Profit Margin (منافع):</span>
                      <span
                        className={
                          profitNewPerBag >= 0 ? 'text-emerald-800' : 'text-red-700'
                        }
                      >
                        {profitNewPerBag >= 0 ? '+' : ''}PKR {profitNewPerBag.toLocaleString()} (
                        {profitNewMarginPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cost Differentiation Alert */}
                {profitDifferencePerBag !== 0 && (
                  <div
                    className={`p-2 rounded text-[11px] flex items-start gap-1.5 ${
                      profitDifferencePerBag < 0
                        ? 'bg-red-50 border border-red-200 text-red-900'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <AlertTriangle
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        profitDifferencePerBag < 0 ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    />
                    <div>
                      {profitDifferencePerBag < 0 ? (
                        <span>
                          <strong>منافع میں کمی کا انتباہ:</strong> نیا مال پچھلے مال سے{' '}
                          <strong>PKR {Math.abs(costDiffPerBag).toLocaleString()} فی بوری مہنگا</strong> ہے، جس سے منافع فی بوری{' '}
                          <strong>PKR {Math.abs(profitDifferencePerBag).toLocaleString()} کم</strong> ہو جائے گا، اگر فروخت ریٹ نہ بڑھایا گیا۔
                        </span>
                      ) : (
                        <span>
                          <strong>خوشخبری:</strong> نیا مال پچھلے مال سے{' '}
                          <strong>PKR {Math.abs(costDiffPerBag).toLocaleString()} فی بوری سستا</strong> ملا ہے، جس سے منافع{' '}
                          <strong>PKR {profitDifferencePerBag.toLocaleString()} بڑھ گیا ہے</strong>!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Weighted Average Cost Breakdown */}
                <div className="bg-emerald-900 text-white p-2.5 rounded-lg flex items-center justify-between font-mono-num">
                  <div>
                    <span className="text-[10px] text-emerald-200 font-sans block">
                      New Weighted Average Cost (نئی مجموعی اوسط لاگت - کل {totalCombinedBags} بوری):
                    </span>
                    <span className="text-xs text-emerald-100">
                      (سابقہ {oldStockBags} بوری × {oldCostPerBag} + نئی {bags} بوری × {inwardCostPerBag}) ÷ {totalCombinedBags} =
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-300">
                      PKR {Math.round(weightedAvgCostPerBag).toLocaleString()} / bag
                    </div>
                    <div className="text-[10px] text-emerald-200">
                      (PKR {weightedAvgCostPerKg.toFixed(2)} / kg)
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Optional Selling Rate Adjustment */}
              <div className="bg-slate-100/80 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800">
                    Adjust Counter Selling Rate (فروخت ریٹ اپ ڈیٹ کریں):
                  </label>
                  {isSellingRateModified && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Modified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                      Selling Rate per Bag (فروخت ریٹ فی بوری):
                    </label>
                    <input
                      type="number"
                      value={sellingRatePerBag}
                      onChange={(e) => handleSellingRatePerBagChange(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm font-black font-mono-num px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                      Selling Rate per KG (فروخت ریٹ فی کلو):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={sellingRatePerKg}
                      onChange={(e) => handleSellingRatePerKgChange(parseFloat(e.target.value) || 0)}
                      className="w-full text-sm font-black font-mono-num px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
                  <span>Expected Average Profit with this Rate:</span>
                  <strong className="text-emerald-800 font-bold font-mono-num">
                    +PKR {Math.round(profitBlendedPerBag).toLocaleString()} / bag ({profitBlendedMarginPct.toFixed(1)}% Margin)
                  </strong>
                </div>
              </div>

              {/* Section 5: Mandi Seller & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Source Mandi / Seller (منڈی / بیوپاری):
                  </label>
                  <input
                    type="text"
                    value={sourceMandi}
                    onChange={(e) => setSourceMandi(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Inward Lot Chit Notes:
                  </label>
                  <input
                    type="text"
                    value={lotNote}
                    onChange={(e) => setLotNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] font-mono-num text-slate-600">
            {activeItem ? (
              <>
                Total Inward Added:{' '}
                <strong className="text-emerald-800">
                  +{bags} Bags (+{totalInwardKg.toLocaleString()} KG)
                </strong>
              </>
            ) : (
              <span className="text-slate-400">کوئی جنس منتخب نہیں ہے</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!activeItem}
              className={`px-5 py-1.5 rounded font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all ${
                activeItem
                  ? 'bg-emerald-800 hover:bg-emerald-900 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              <span>Confirm Inward Entry (آمد محفوظ کریں)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
