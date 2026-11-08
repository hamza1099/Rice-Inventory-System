import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../../types';
import { X, Check, DollarSign, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { notifySuccess, notifyWarning, notifyInfo } from '../../utils/toast';

interface EditVarietyModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const EditVarietyModal: React.FC<EditVarietyModalProps> = ({ item, onClose, onDelete }) => {
  const { updateInventoryItem, deleteInventoryItem } = usePos();

  const [varietyName, setVarietyName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [packagingStandard, setPackagingStandard] = useState<string>('');

  const [weightPerBag, setWeightPerBag] = useState<number>(50);
  const [bagsCount, setBagsCount] = useState<number>(0);
  const [physicalStockKg, setPhysicalStockKg] = useState<number>(0);

  const [costPerKg, setCostPerKg] = useState<number>(0);
  const [costPerBag, setCostPerBag] = useState<number>(0);

  const [counterRatePerKg, setCounterRatePerKg] = useState<number>(0);
  const [counterRatePerBag, setCounterRatePerBag] = useState<number>(0);

  const [moisturePercentage, setMoisturePercentage] = useState<number>(11.0);
  const [qualityNotes, setQualityNotes] = useState<string>('');

  useEffect(() => {
    if (item) {
      setVarietyName(item.varietyName);
      setUrduName(item.urduName);
      setCategory(item.category);
      setPackagingStandard(item.packagingStandard);

      const bagWeight = item.packagingStandard.includes('25 kg') ? 25 : item.packagingStandard.includes('40 kg') ? 40 : 50;
      setWeightPerBag(bagWeight);
      setBagsCount(item.bagsCount);
      setPhysicalStockKg(item.physicalStockKg);

      setCostPerKg(item.costPerKg);
      setCostPerBag(Math.round(item.costPerKg * bagWeight));

      setCounterRatePerKg(item.counterRatePerKg);
      setCounterRatePerBag(Math.round(item.counterRatePerKg * bagWeight));

      setMoisturePercentage(item.moisturePercentage || 11.0);
      setQualityNotes(item.qualityNotes || '');
    }
  }, [item]);

  if (!item) return null;

  const handleCostKgChange = (val: number) => {
    setCostPerKg(val);
    setCostPerBag(Math.round(val * weightPerBag));
  };

  const handleCostBagChange = (val: number) => {
    setCostPerBag(val);
    if (weightPerBag > 0) {
      setCostPerKg(Math.round((val / weightPerBag) * 100) / 100);
    }
  };

  const handleRateKgChange = (val: number) => {
    setCounterRatePerKg(val);
    setCounterRatePerBag(Math.round(val * weightPerBag));
  };

  const handleRateBagChange = (val: number) => {
    setCounterRatePerBag(val);
    if (weightPerBag > 0) {
      setCounterRatePerKg(Math.round((val / weightPerBag) * 100) / 100);
    }
  };

  const handleBagsChange = (bags: number) => {
    setBagsCount(bags);
    setPhysicalStockKg(bags * weightPerBag);
  };

  const currentMarginPerKg = counterRatePerKg - costPerKg;
  const currentMarginPerBag = counterRatePerBag - costPerBag;
  const marginPct = costPerKg > 0 ? (currentMarginPerKg / costPerKg) * 100 : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!varietyName.trim()) {
      notifyWarning('Please enter variety name (چاول کا نام درج کریں)');
      return;
    }

    updateInventoryItem(item.id, {
      varietyName: varietyName.trim(),
      urduName: urduName.trim() || varietyName,
      category,
      packagingStandard,
      bagsCount,
      physicalStockKg,
      costPerKg,
      counterRatePerKg,
      moisturePercentage,
      qualityNotes: qualityNotes.trim()
    });

    notifySuccess(`Rates & Details updated successfully for ${varietyName}!`);
    onClose();
  };

  const handleDelete = () => {
    const confirm = window.confirm(`Are you sure you want to delete ${item.varietyName} from inventory?`);
    if (confirm) {
      if (onDelete) {
        onDelete(item.id);
      } else {
        deleteInventoryItem(item.id);
      }
      notifyInfo(`${item.varietyName} removed from inventory.`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 text-xs">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">
                Edit Variety & Adjust Rates (چاول کی تفصیل و ریٹ تبدیل کریں)
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                {item.sku} • {item.varietyName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Variety Name & Urdu */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Variety Name (انگریزی نام):
              </label>
              <input
                type="text"
                required
                value={varietyName}
                onChange={(e) => setVarietyName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Urdu Name (اردو نام):
                </label>
                <button
                  type="button"
                  onClick={() => setUrduName(transliterateEnglishToUrduName(varietyName))}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-0.5"
                  title="خودکار ترجمہ کریں"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Auto</span>
                </button>
              </div>
              <input
                type="text"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden urdu-text text-sm font-medium"
              />
            </div>
          </div>

          {/* Pricing & Profit CRUD Section (Core Request) */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-extrabold text-xs text-slate-900">
                Rate & Price Management (خریداری اور کاؤنٹر فروخت ریٹ)
              </span>
              {item.previousCostPerKg && item.previousCostPerKg !== item.costPerKg && (
                <span className="text-[10px] font-mono-num text-slate-500">
                  Previous Cost: PKR {item.previousCostPerKg.toFixed(2)}/kg
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Purchase Cost */}
              <div className="bg-white p-2.5 rounded border border-amber-300 space-y-1.5">
                <span className="text-[10px] font-black text-amber-900 uppercase block">
                  Purchase Cost (خریداری لاگت)
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                    Cost per KG (فی کلو):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={costPerKg}
                    onChange={(e) => handleCostKgChange(parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-black font-mono-num px-2.5 py-1 border border-slate-300 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                    Cost per Bag (فی بوری):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={costPerBag}
                    onChange={(e) => handleCostBagChange(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold font-mono-num px-2 py-1 border border-slate-300 rounded text-slate-700"
                  />
                </div>
              </div>

              {/* Selling Counter Rate */}
              <div className="bg-white p-2.5 rounded border-2 border-emerald-600 space-y-1.5">
                <span className="text-[10px] font-black text-emerald-800 uppercase block">
                  Counter Selling Rate (فروخت ریٹ)
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                    Selling Rate per KG (فی کلو):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={counterRatePerKg}
                    onChange={(e) => handleRateKgChange(parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-black font-mono-num px-2.5 py-1 border-2 border-emerald-600 rounded text-emerald-950"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                    Selling Rate per Bag (فی بوری):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={counterRatePerBag}
                    onChange={(e) => handleRateBagChange(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold font-mono-num px-2 py-1 border border-slate-300 rounded text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Profit Margin Display */}
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between font-mono-num">
              <div>
                <span className="text-[11px] font-bold text-emerald-950 block">
                  Current Profit Margin (موجودہ منافع):
                </span>
                <span className="text-[10px] text-emerald-700">
                  Rate (PKR {counterRatePerKg}) - Cost (PKR {costPerKg}) =
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-black ${
                    currentMarginPerKg >= 0 ? 'text-emerald-800' : 'text-red-700'
                  }`}
                >
                  {currentMarginPerKg >= 0 ? '+' : ''}PKR {currentMarginPerKg.toFixed(2)} / kg
                </span>
                <span className="text-[10px] text-slate-600 block font-bold">
                  (+PKR {currentMarginPerBag.toLocaleString()} / bag • {marginPct.toFixed(1)}% Markup)
                </span>
              </div>
            </div>
          </div>

          {/* Physical Stock & Bags */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Godown Stock Bags (تعداد بوری):
              </label>
              <input
                type="number"
                min="0"
                value={bagsCount}
                onChange={(e) => handleBagsChange(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Total Physical Stock (KG):
              </label>
              <input
                type="number"
                min="0"
                value={physicalStockKg}
                onChange={(e) => setPhysicalStockKg(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num"
              />
            </div>
          </div>

          {/* Category & Quality Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Grain Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold"
              >
                <option value="Basmati Classic">Basmati Classic</option>
                <option value="Long Grain">Long Grain / Kainat 1121</option>
                <option value="Sella (Parboiled)">Sella (Parboiled)</option>
                <option value="Broken / Tota">Broken / Tota</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Quality / Lot Notes:
              </label>
              <input
                type="text"
                value={qualityNotes}
                onChange={(e) => setQualityNotes(e.target.value)}
                placeholder="e.g. Old Crop 2023 Vintage"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          {/* Footer Actions with Delete & Save */}
          <div className="bg-slate-50 px-4 py-2.5 -mx-4 -mb-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded text-red-600 hover:bg-red-50 border border-red-200 font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Variety</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes (ریٹ تبدیل کریں)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
