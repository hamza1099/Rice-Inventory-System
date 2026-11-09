import React, { useState } from 'react';
import type { InventoryItem } from '../../types';
import { X, PlusCircle, Sparkles, DollarSign, Calculator } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { RiceImageUpload } from './RiceImageUpload';
import { SAMPLE_RICE_PRESETS } from '../../utils/riceImages';

interface AddVarietyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVarietyModal: React.FC<AddVarietyModalProps> = ({ isOpen, onClose }) => {
  const { addInventoryItem, inventory } = usePos();

  const [varietyName, setVarietyName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_RICE_PRESETS[0]?.imageUrl || '');
  const [isUrduManual, setIsUrduManual] = useState<boolean>(false);
  const [sku, setSku] = useState<string>(`SKU-RICE-${String(inventory.length + 1).padStart(2, '0')}`);
  const [category, setCategory] = useState<string>('Basmati Classic');
  const [packagingStandard, setPackagingStandard] = useState<string>('50 kg Jute Bag');
  const [weightPerBag, setWeightPerBag] = useState<number>(50);
  const [tareDeductionKg, setTareDeductionKg] = useState<number>(0.95);

  const [bagsCount, setBagsCount] = useState<number>(50);
  const [costPerBag, setCostPerBag] = useState<number>(15000);
  const [costPerKg, setCostPerKg] = useState<number>(300);
  const [counterRatePerBag, setCounterRatePerBag] = useState<number>(17000);
  const [counterRatePerKg, setCounterRatePerKg] = useState<number>(340);

  const [moisturePercentage, setMoisturePercentage] = useState<number>(11.0);
  const [qualityNotes, setQualityNotes] = useState<string>('Fresh Crop Season Arrival');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setVarietyName(val);
    if (!isUrduManual || !urduName.trim()) {
      setUrduName(transliterateEnglishToUrduName(val));
    }
  };

  const handleCostBagChange = (val: number) => {
    setCostPerBag(val);
    if (weightPerBag > 0) {
      setCostPerKg(Math.round((val / weightPerBag) * 100) / 100);
    }
  };

  const handleCostKgChange = (val: number) => {
    setCostPerKg(val);
    setCostPerBag(Math.round(val * weightPerBag));
  };

  const handleRateBagChange = (val: number) => {
    setCounterRatePerBag(val);
    if (weightPerBag > 0) {
      setCounterRatePerKg(Math.round((val / weightPerBag) * 100) / 100);
    }
  };

  const handleRateKgChange = (val: number) => {
    setCounterRatePerKg(val);
    setCounterRatePerBag(Math.round(val * weightPerBag));
  };

  const totalKg = bagsCount * weightPerBag;
  const marginPerKg = counterRatePerKg - costPerKg;
  const marginPerBag = counterRatePerBag - costPerBag;
  const marginPct = costPerKg > 0 ? (marginPerKg / costPerKg) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!varietyName.trim()) {
      notifyWarning('Please enter variety name (چاول کا نام درج کریں)');
      return;
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      varietyName: varietyName.trim(),
      urduName: urduName.trim() || transliterateEnglishToUrduName(varietyName) || varietyName,
      sku: sku.trim() || `SKU-${Date.now()}`,
      category,
      packagingStandard,
      tareDeductionKg,
      physicalStockKg: totalKg,
      bagsCount,
      bagTypeLabel: 'Bags (بوری)',
      lotStatus: totalKg > 200 ? 'In Stock' : totalKg > 0 ? 'Low Stock' : 'Out of Stock',
      costPerKg,
      previousCostPerKg: costPerKg,
      latestInwardCostPerKg: costPerKg,
      counterRatePerKg,
      marginPerKg: Math.round(marginPerKg * 100) / 100,
      marginPercentage: Math.round(marginPct * 10) / 10,
      moisturePercentage,
      qualityNotes: qualityNotes.trim(),
      imageUrl: imageUrl.trim() || undefined
    };

    addInventoryItem(newItem);
    notifySuccess(`Successfully added ${newItem.varietyName} (${newItem.urduName})!`);
    setImageUrl(SAMPLE_RICE_PRESETS[0]?.imageUrl || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 text-xs">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">Add New Rice Variety (نیا چاول جنس درج کریں)</h3>
              <p className="text-[11px] text-emerald-100 urdu-text" dir="rtl">
                نام، خریداری لاگت اور کاؤنٹر فروخت ریٹ
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[82vh] overflow-y-auto">
          {/* Variety Name & Urdu Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Variety Name (انگریزی نام):
              </label>
              <input
                type="text"
                required
                value={varietyName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Super Basmati Old"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Urdu Name (اردو نام):
                </label>
                {varietyName && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrduName(transliterateEnglishToUrduName(varietyName));
                      setIsUrduManual(false);
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-0.5"
                    title="خودکار ترجمہ کریں"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={urduName}
                onChange={(e) => {
                  setUrduName(e.target.value);
                  setIsUrduManual(true);
                }}
                placeholder="سوپر باسمتی"
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 focus:outline-hidden urdu-text text-sm font-medium"
              />
            </div>
          </div>

          {/* Rice Product Image Upload & Preview */}
          <RiceImageUpload
            imageUrl={imageUrl}
            onChange={setImageUrl}
          />

          {/* SKU & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                SKU / Lot Identifier:
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Grain Category (قسم):
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold"
              >
                <option value="Basmati Classic">Basmati Classic (باسمتی کلاسک)</option>
                <option value="Long Grain">Long Grain / Kainat 1121 (کائنات ۱۱۲۱)</option>
                <option value="Sella (Parboiled)">Sella (Parboiled) (سیلا گولڈن)</option>
                <option value="Broken / Tota">Broken / Tota (ٹوٹا کوالٹی)</option>
                <option value="Super Kernel">Super Kernel Basmati (کرنل باسمتی)</option>
              </select>
            </div>
          </div>

          {/* Packaging Standard & Tare */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Packaging Standard:
              </label>
              <select
                value={packagingStandard}
                onChange={(e) => {
                  const val = e.target.value;
                  setPackagingStandard(val);
                  if (val.includes('50 kg')) {
                    setWeightPerBag(50);
                    setTareDeductionKg(0.95);
                  } else if (val.includes('25 kg')) {
                    setWeightPerBag(25);
                    setTareDeductionKg(0.12);
                  } else if (val.includes('40 kg')) {
                    setWeightPerBag(40);
                    setTareDeductionKg(0.85);
                  }
                }}
                className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-[11px]"
              >
                <option value="50 kg Jute Bag">50 kg Jute Bori</option>
                <option value="25 kg Poly Woven">25 kg PP Bag</option>
                <option value="40 kg Mund Bag">40 kg (1 Mund)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Initial Stock (Bags):
              </label>
              <input
                type="number"
                min="0"
                value={bagsCount}
                onChange={(e) => setBagsCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Total Weight (KG):
              </label>
              <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded font-bold font-mono-num text-slate-800">
                {totalKg.toLocaleString()} KG
              </div>
            </div>
          </div>

          {/* Pricing & Cost Structure (Purchase Cost & Selling Counter Rate) */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center space-x-1 font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Purchase Cost & Selling Counter Rate (خریداری لاگت اور فروخت ریٹ)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Purchase Cost */}
              <div className="bg-amber-50/60 p-2.5 rounded border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-950 uppercase block">
                  Purchase Cost (خریداری لاگت)
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">Rate per Bag (فی بوری):</label>
                  <input
                    type="number"
                    min="1"
                    value={costPerBag}
                    onChange={(e) => handleCostBagChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-bold font-mono-num bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">Rate per KG (فی کلو):</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={costPerKg}
                    onChange={(e) => handleCostKgChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-bold font-mono-num bg-white"
                  />
                </div>
              </div>

              {/* Selling Rate */}
              <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-950 uppercase block">
                  Counter Selling Rate (فروخت ریٹ)
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">Rate per Bag (فی بوری):</label>
                  <input
                    type="number"
                    min="1"
                    value={counterRatePerBag}
                    onChange={(e) => handleRateBagChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-emerald-500 rounded font-bold font-mono-num bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">Rate per KG (فی کلو):</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={counterRatePerKg}
                    onChange={(e) => handleRateKgChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-emerald-500 rounded font-bold font-mono-num bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Profit Margin Banner */}
            <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between font-mono-num">
              <span className="text-[11px] font-bold text-slate-700">Projected Profit Margin (متوقع منافع):</span>
              <div className="text-right">
                <span className={`text-xs font-black ${marginPerKg >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {marginPerKg >= 0 ? '+' : ''}PKR {marginPerBag.toLocaleString()} / bag (+PKR {marginPerKg.toFixed(2)}/kg)
                </span>
                <span className="text-[10px] text-slate-500 block font-semibold">
                  Markup: {marginPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Quality Notes */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
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

          {/* Actions */}
          <div className="bg-slate-50 px-4 py-2.5 -mx-4 -mb-4 border-t border-slate-200 flex items-center justify-end space-x-2">
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
              <PlusCircle className="w-4 h-4" />
              <span>Save & Add Variety (محفوظ کریں)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
