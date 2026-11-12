import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../../types';
import { X, Check, DollarSign, Trash2, AlertTriangle, Sparkles } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { notifySuccess, notifyWarning, notifyInfo } from '../../utils/toast';
import { RiceImageUpload } from './RiceImageUpload';

interface EditVarietyModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const EditVarietyModal: React.FC<EditVarietyModalProps> = ({ item, onClose, onDelete }) => {
  const { updateInventoryItem, deleteInventoryItem, language } = usePos();
  const isUr = language === 'ur';

  const [varietyName, setVarietyName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
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
      setImageUrl(item.imageUrl || '');
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
      notifyWarning(isUr ? 'چاول کا نام درج کریں' : 'Please enter variety name');
      return;
    }

    updateInventoryItem(item.id, {
      varietyName: varietyName.trim(),
      urduName: urduName.trim() || varietyName,
      imageUrl: imageUrl.trim() || undefined,
      category,
      packagingStandard,
      bagsCount,
      physicalStockKg,
      costPerKg,
      counterRatePerKg,
      moisturePercentage,
      qualityNotes: qualityNotes.trim()
    });

    notifySuccess(isUr ? `${varietyName} کے ریٹ و تفصیل کامیابی سے تبدیل ہو گئے!` : `Rates & Details updated successfully for ${varietyName}!`);
    onClose();
  };

  const handleDelete = () => {
    const confirm = window.confirm(
      isUr
        ? `کیا آپ واقعی ${item.varietyName} کو لسٹ سے حذف کرنا چاہتے ہیں؟`
        : `Are you sure you want to delete ${item.varietyName} from inventory?`
    );
    if (confirm) {
      if (onDelete) {
        onDelete(item.id);
      } else {
        deleteInventoryItem(item.id);
      }
      notifyInfo(isUr ? `${item.varietyName} گودام لسٹ سے نکال دیا گیا۔` : `${item.varietyName} removed from inventory.`);
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
                {isUr ? 'چاول کی تفصیل و ریٹ تبدیل کریں' : 'Edit Variety & Adjust Rates'}
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
                {isUr ? 'انگریزی نام:' : 'Variety Name:'}
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
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <span>{isUr ? 'اردو نام:' : 'Urdu Name:'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUrduName(transliterateEnglishToUrduName(varietyName))}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-0.5 underline"
                  title={isUr ? 'خودکار ترجمہ کریں' : 'Auto Transliterator'}
                >
                  <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                  <span>{isUr ? 'خودکار' : 'Auto Sync'}</span>
                </button>
              </div>
              <input
                type="text"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                placeholder={isUr ? 'انگریزی نام سے خودکار اردو بنے گی...' : 'Auto-generated variety name...'}
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-emerald-300/80 bg-emerald-50/30 rounded focus:border-emerald-600 focus:bg-white focus:outline-hidden urdu-text text-sm font-semibold text-emerald-950 transition-colors"
              />
            </div>
          </div>

          {/* Rice Product Image Upload & Preview */}
          <RiceImageUpload
            imageUrl={imageUrl}
            onChange={setImageUrl}
            label={isUr ? 'پروڈکٹ کی تصویر:' : 'Product Photo:'}
            urduLabel={isUr ? 'تصویر تبدیل یا اپلوڈ کریں' : 'Change or upload photo'}
          />

          {/* Pricing & Profit CRUD Section (Core Request) */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="font-extrabold text-xs text-slate-900">
                {isUr ? 'خریداری اور کاؤنٹر فروخت ریٹ' : 'Rate & Price Management'}
              </span>
              {item.previousCostPerKg && item.previousCostPerKg !== item.costPerKg && (
                <span className="text-[10px] font-mono-num text-slate-500">
                  {isUr ? 'سابقہ لاگت:' : 'Previous Cost:'} PKR {item.previousCostPerKg.toFixed(2)}/kg
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Purchase Cost */}
              <div className="bg-white p-2.5 rounded border border-amber-300 space-y-1.5">
                <span className="text-[10px] font-black text-amber-900 uppercase block">
                  {isUr ? 'خریداری لاگت' : 'Purchase Cost'}
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                    {isUr ? 'لاگت فی کلو:' : 'Cost per KG:'}
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
                    {isUr ? 'لاگت فی بوری:' : 'Cost per Bag:'}
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
                  {isUr ? 'فروخت ریٹ' : 'Counter Selling Rate'}
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                    {isUr ? 'ریٹ فی کلو:' : 'Selling Rate per KG:'}
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
                    {isUr ? 'ریٹ فی بوری:' : 'Selling Rate per Bag:'}
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
                  {isUr ? 'موجودہ منافع:' : 'Current Profit Margin:'}
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
                {isUr ? 'گودام سٹاک بوریاں:' : 'Godown Stock Bags:'}
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
                {isUr ? 'کل فزیکل سٹاک (کلو):' : 'Total Physical Stock (KG):'}
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
                {isUr ? 'کیٹگری:' : 'Item Category:'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold"
              >
                <option value="Rice">{isUr ? 'چاول' : 'Rice'}</option>
                <option value="Pulses / Daal">{isUr ? 'دالیں' : 'Pulses / Daal'}</option>
                <option value="Spices">{isUr ? 'کھلا مصالحہ' : 'Spices / Masala'}</option>
                <option value="Shan & National">{isUr ? 'ڈبہ مصالحہ' : 'Shan & National'}</option>
                <option value="Oil & Ghee">{isUr ? 'تیل و گھی' : 'Oil & Ghee'}</option>
                <option value="Atta & Sugar">{isUr ? 'آٹا و چینی' : 'Atta & Sugar'}</option>
                <option value="Basmati Classic">{isUr ? 'باسمتی کلاسک' : 'Basmati Classic'}</option>
                <option value="Long Grain">{isUr ? 'کائنات ۱۱۲۱' : 'Long Grain / Kainat 1121'}</option>
                <option value="Sella (Parboiled)">{isUr ? 'سیلا گولڈن' : 'Sella (Parboiled)'}</option>
                <option value="Broken / Tota">{isUr ? 'ٹوٹا کوالٹی' : 'Broken / Tota'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'کوالٹی تفصیل:' : 'Quality / Lot Notes:'}
              </label>
              <input
                type="text"
                value={qualityNotes}
                onChange={(e) => setQualityNotes(e.target.value)}
                placeholder={isUr ? 'مثلاً فریش سیزن آمد' : 'e.g. Old Crop 2023 Vintage'}
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
              <span>{isUr ? 'حذف کریں' : 'Delete Variety'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                {isUr ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isUr ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
