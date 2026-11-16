import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../../types';
import { X, DollarSign, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { notifySuccess, notifyWarning, notifyInfo } from '../../utils/toast';
import { RiceImageUpload } from './RiceImageUpload';
import { uploadToBunny } from '../../service/bunnyStorageService';
import { NumberInput } from '../common/NumberInput';
import {
  DEFAULT_CATEGORY_OPTIONS,
  getCustomCategories,
  saveCustomCategory
} from '../../utils/categories';
import {
  PACKAGING_PRESETS,
  getPackagingPreset,
  PackagingUnitType
} from '../../utils/packaging';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

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
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('');
  const [customCategories, setCustomCategories] = useState<string[]>(() => getCustomCategories());
  const [isAddingNewCategory, setIsAddingNewCategory] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Packaging & Unit States
  const [packagingId, setPackagingId] = useState<string>('25 kg PP Bag');
  const [unitType, setUnitType] = useState<PackagingUnitType>('kg');
  const [unitsPerPack, setUnitsPerPack] = useState<number>(25);
  const [isCustomUnits, setIsCustomUnits] = useState<boolean>(false);
  const [customUnitsInput, setCustomUnitsInput] = useState<number>(25);
  const [tareDeductionKg, setTareDeductionKg] = useState<number>(0.12);

  const [packsCount, setPacksCount] = useState<number>(0);
  const [physicalStockUnits, setPhysicalStockUnits] = useState<number>(0);

  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [costPerPack, setCostPerPack] = useState<number>(0);

  const [counterRatePerUnit, setCounterRatePerUnit] = useState<number>(0);
  const [counterRatePerPack, setCounterRatePerPack] = useState<number>(0);

  const [moisturePercentage, setMoisturePercentage] = useState<number>(11.0);
  const [qualityNotes, setQualityNotes] = useState<string>('');

  useEffect(() => {
    if (item) {
      setVarietyName(item.varietyName);
      setUrduName(item.urduName);
      setImageUrl(item.imageUrl || '');
      setCategory(item.category);

      const matchedPreset = getPackagingPreset(item.packagingStandard);
      const isCustom =
        item.packagingStandard.includes('Custom') ||
        (!PACKAGING_PRESETS.some((p) => p.id === item.packagingStandard) && Boolean(item.unitsPerPack));

      const uType = (item.unitType || matchedPreset.unitType) as PackagingUnitType;
      const uPerPack = item.unitsPerPack || matchedPreset.unitsPerPack || 25;

      setPackagingId(isCustom ? (uType === 'piece' ? 'custom_carton' : uType === 'liter' ? 'custom_liquid' : 'custom_kg') : matchedPreset.id);
      setIsCustomUnits(isCustom);
      setCustomUnitsInput(uPerPack);
      setUnitType(uType);
      setUnitsPerPack(uPerPack);
      setTareDeductionKg(item.tareDeductionKg ?? matchedPreset.tareDefault ?? 0.12);

      setPacksCount(item.bagsCount);
      setPhysicalStockUnits(item.physicalStockKg);

      const unitCost = item.costPerKg;
      setCostPerUnit(unitCost);
      setCostPerPack(item.costPerBag || Math.round(unitCost * uPerPack));

      const unitSell = item.counterRatePerKg;
      setCounterRatePerUnit(unitSell);
      setCounterRatePerPack(item.counterRatePerBag || Math.round(unitSell * uPerPack));

      setMoisturePercentage(item.moisturePercentage || 11.0);
      setQualityNotes(item.qualityNotes || '');
      setSelectedImageFile(null);
    }
  }, [item]);

  if (!item) return null;

  // Derive dynamic labels based on unitType and unitsPerPack
  const currentUnitsPerPack = Math.max(1, isCustomUnits ? customUnitsInput : unitsPerPack);
  const isBag = unitType === 'kg';
  const isLiquid = unitType === 'liter';
  const isCarton = unitType === 'piece' && currentUnitsPerPack > 1;

  const packNameEn = isBag ? 'Bag' : isLiquid ? (currentUnitsPerPack >= 16 ? 'Tin' : 'Can') : isCarton ? 'Carton' : 'Piece';
  const packNameUr = isBag ? 'بوری' : isLiquid ? (currentUnitsPerPack >= 16 ? 'ٹن' : 'کین') : isCarton ? 'کارٹن' : 'دانہ';

  const packPluralEn = isBag ? 'Bags' : isLiquid ? (currentUnitsPerPack >= 16 ? 'Tins' : 'Cans') : isCarton ? 'Cartons' : 'Pieces';
  const packPluralUr = isBag ? 'بوریاں' : isLiquid ? (currentUnitsPerPack >= 16 ? 'ٹن' : 'کین') : isCarton ? 'کارٹن' : 'دانے';

  const unitNameEn = isBag ? 'KG' : isLiquid ? 'Litre' : 'Piece';
  const unitNameUr = isBag ? 'کلو' : isLiquid ? 'لیٹر' : 'دانہ';

  const handlePackagingChange = (id: string) => {
    setPackagingId(id);
    if (id === 'custom_kg') {
      setIsCustomUnits(true);
      setUnitType('kg');
      const val = customUnitsInput || 25;
      setUnitsPerPack(val);
      setTareDeductionKg(0.1);
      if (costPerUnit > 0) setCostPerPack(Math.round(costPerUnit * val));
      if (counterRatePerUnit > 0) setCounterRatePerPack(Math.round(counterRatePerUnit * val));
    } else if (id === 'custom_carton') {
      setIsCustomUnits(true);
      setUnitType('piece');
      const val = customUnitsInput || 12;
      setUnitsPerPack(val);
      setTareDeductionKg(0);
      if (costPerUnit > 0) setCostPerPack(Math.round(costPerUnit * val));
      if (counterRatePerUnit > 0) setCounterRatePerPack(Math.round(counterRatePerUnit * val));
    } else if (id === 'custom_liquid') {
      setIsCustomUnits(true);
      setUnitType('liter');
      const val = customUnitsInput || 5;
      setUnitsPerPack(val);
      setTareDeductionKg(0);
      if (costPerUnit > 0) setCostPerPack(Math.round(costPerUnit * val));
      if (counterRatePerUnit > 0) setCounterRatePerPack(Math.round(counterRatePerUnit * val));
    } else {
      setIsCustomUnits(false);
      const pr = getPackagingPreset(id);
      setUnitType(pr.unitType);
      setUnitsPerPack(pr.unitsPerPack);
      setTareDeductionKg(pr.tareDefault);
      if (costPerUnit > 0) setCostPerPack(Math.round(costPerUnit * pr.unitsPerPack));
      if (counterRatePerUnit > 0) setCounterRatePerPack(Math.round(counterRatePerUnit * pr.unitsPerPack));
    }
  };

  const handleCustomUnitsChange = (val: number) => {
    const safeVal = Math.max(1, val);
    setCustomUnitsInput(safeVal);
    setUnitsPerPack(safeVal);
    if (costPerUnit > 0) setCostPerPack(Math.round(costPerUnit * safeVal));
    if (counterRatePerUnit > 0) setCounterRatePerPack(Math.round(counterRatePerUnit * safeVal));
  };

  // Pricing Handlers
  const handleCostUnitChange = (val: number) => {
    setCostPerUnit(val);
    setCostPerPack(Math.round(val * currentUnitsPerPack));
  };

  const handleCostPackChange = (val: number) => {
    setCostPerPack(val);
    if (currentUnitsPerPack > 0) {
      setCostPerUnit(Math.round((val / currentUnitsPerPack) * 100) / 100);
    }
  };

  const handleRateUnitChange = (val: number) => {
    setCounterRatePerUnit(val);
    setCounterRatePerPack(Math.round(val * currentUnitsPerPack));
  };

  const handleRatePackChange = (val: number) => {
    setCounterRatePerPack(val);
    if (currentUnitsPerPack > 0) {
      setCounterRatePerUnit(Math.round((val / currentUnitsPerPack) * 100) / 100);
    }
  };

  const handlePacksCountChange = (count: number) => {
    setPacksCount(count);
    setPhysicalStockUnits(count * currentUnitsPerPack);
  };

  const currentMarginPerUnit = counterRatePerUnit - costPerUnit;
  const currentMarginPerPack = counterRatePerPack - costPerPack;
  const marginPct = costPerUnit > 0 ? (currentMarginPerUnit / costPerUnit) * 100 : 0;

  const handleAddNewCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const updated = saveCustomCategory(trimmed);
    setCustomCategories(updated);
    setCategory(trimmed);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
    notifySuccess(isUr ? `نئی کیٹگری "${trimmed}" شامل ہو گئی!` : `New category "${trimmed}" added!`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varietyName.trim()) {
      notifyWarning(isUr ? 'آئٹم کا نام درج کریں' : 'Please enter item/variety name');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl.trim();

      // If user selected a new local image file, upload it to Bunny CDN now
      if (selectedImageFile) {
        finalImageUrl = await uploadToBunny(selectedImageFile, 'products');
      }

      let resolvedPackaging = packagingId;
      if (isCustomUnits) {
        if (packagingId === 'custom_kg') resolvedPackaging = `${currentUnitsPerPack} kg Custom Bag`;
        else if (packagingId === 'custom_carton') resolvedPackaging = `Carton (${currentUnitsPerPack} Pieces)`;
        else if (packagingId === 'custom_liquid') resolvedPackaging = `${currentUnitsPerPack} Litre Custom Pack`;
      }

      const resolvedUnitLabel = unitType === 'piece' ? '/ pc' : unitType === 'liter' ? '/ liter' : '/ kg';

      await updateInventoryItem(item.id, {
        varietyName: varietyName.trim(),
        urduName: urduName.trim() || varietyName,
        imageUrl: finalImageUrl || undefined,
        category,
        packagingStandard: resolvedPackaging,
        tareDeductionKg,
        bagsCount: packsCount,
        bagTypeLabel: isUr ? packPluralUr : packPluralEn,
        physicalStockKg: physicalStockUnits,
        costPerKg: costPerUnit,
        counterRatePerKg: counterRatePerUnit,
        marginPerKg: Math.round(currentMarginPerUnit * 100) / 100,
        marginPercentage: Math.round(marginPct * 10) / 10,
        moisturePercentage,
        qualityNotes: qualityNotes.trim(),
        unitType,
        unitLabel: resolvedUnitLabel,
        unitsPerPack: currentUnitsPerPack,
        costPerBag: costPerPack,
        counterRatePerBag: counterRatePerPack,
        packTypeLabel: isUr ? packPluralUr : packPluralEn
      });

      notifySuccess(isUr ? `${varietyName} کے ریٹ و تفصیل کامیابی سے تبدیل ہو گئے!` : `Rates & Details updated successfully for ${varietyName}!`);
      setSelectedImageFile(null);
      onClose();
    } catch (err: any) {
      console.error('Error updating inventory item:', err);
      notifyWarning(isUr ? 'محفوظ کرتے ہوئے خرابی پیش آئی!' : 'Error updating item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    } else {
      deleteInventoryItem(item.id);
    }
    notifyInfo(isUr ? `${item.urduName || item.varietyName} گودام لسٹ سے نکال دیا گیا۔` : `${item.varietyName} removed from inventory.`);
    setShowDeleteConfirm(false);
    onClose();
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
                {isUr ? 'آئٹم کی تفصیل، پیکنگ و ریٹ تبدیل کریں' : 'Edit Item, Packaging & Rates'}
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
                {isUr ? 'انگریزی نام:' : 'Item Name:'}
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
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                    <span>{isUr ? 'خودکار' : 'Auto'}</span>
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setUrduName(transliterateEnglishToUrduName(varietyName))}
                  className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
                  title={isUr ? 'دوبارہ خودکار کریں' : 'Reset to Auto'}
                >
                  <span>{isUr ? 'خودکار ری سیٹ' : 'Reset Auto'}</span>
                </button>
              </div>
              <input
                type="text"
                value={urduName}
                onChange={(e) => setUrduName(e.target.value)}
                placeholder="خودکار اردو نام..."
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-emerald-300/80 bg-emerald-50/30 rounded focus:border-emerald-600 focus:bg-white focus:outline-hidden urdu-text text-sm font-semibold text-emerald-950 placeholder:text-emerald-800/40 transition-colors"
              />
            </div>
          </div>

          {/* Product Image */}
          <RiceImageUpload
            imageUrl={imageUrl}
            onChange={(url, file) => {
              setImageUrl(url);
              setSelectedImageFile(file ?? null);
            }}
            isUploading={isSubmitting}
          />

          {/* Packaging Standard Selection (Bags, Cartons, Tins, Custom) */}
          <div className="grid grid-cols-12 gap-2">
            <div className={isCustomUnits ? 'col-span-8' : 'col-span-12'}>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'پیکنگ کا معیار:' : 'Packaging Standard:'}
              </label>
              <select
                value={packagingId}
                onChange={(e) => handlePackagingChange(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded bg-white text-xs font-semibold focus:border-emerald-600 focus:outline-hidden"
              >
                <optgroup label={isUr ? 'بوریاں اور تھیلے (Bags & Sacks)' : 'Bags & Sacks (Weight)'}>
                  {PACKAGING_PRESETS.filter((p) => p.group === 'bag').map((p) => (
                    <option key={p.id} value={p.id}>
                      {isUr ? p.nameUr : p.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={isUr ? 'کارٹن اور پیٹیاں (Cartons & Boxes)' : 'Cartons & Boxes (Pieces)'}>
                  {PACKAGING_PRESETS.filter((p) => p.group === 'carton').map((p) => (
                    <option key={p.id} value={p.id}>
                      {isUr ? p.nameUr : p.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={isUr ? 'کنستر اور کین (Liquids / Tins)' : 'Liquids / Tins / Cans'}>
                  {PACKAGING_PRESETS.filter((p) => p.group === 'liquid').map((p) => (
                    <option key={p.id} value={p.id}>
                      {isUr ? p.nameUr : p.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={isUr ? 'انفرادی دانے / پرچون (Single Items)' : 'Single Items'}>
                  {PACKAGING_PRESETS.filter((p) => p.group === 'single').map((p) => (
                    <option key={p.id} value={p.id}>
                      {isUr ? p.nameUr : p.nameEn}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={isUr ? 'مرضی کی پیکنگ (Custom Packaging)' : 'Custom Packaging'}>
                  {PACKAGING_PRESETS.filter((p) => p.group === 'custom').map((p) => (
                    <option key={p.id} value={p.id}>
                      {isUr ? p.nameUr : p.nameEn}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {isCustomUnits && (
              <div className="col-span-4 animate-in fade-in">
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  {packagingId === 'custom_carton'
                    ? isUr
                      ? 'دانے فی کارٹن:'
                      : 'Pieces / Carton:'
                    : packagingId === 'custom_liquid'
                    ? isUr
                      ? 'لیٹر فی کین:'
                      : 'Litres / Can:'
                    : isUr
                    ? 'وزن فی بوری (کلو):'
                    : 'KG / Bag:'}
                </label>
                <NumberInput
                  min="1"
                  value={customUnitsInput}
                  onChange={handleCustomUnitsChange}
                  className="w-full px-2 py-1.5 border-2 border-emerald-600 rounded bg-emerald-50/40 text-xs font-bold font-mono-num text-slate-900"
                  placeholder="e.g. 16"
                  allowDecimals={packagingId !== 'custom_carton'}
                />
              </div>
            )}
          </div>

          {/* Pricing & Cost Structure */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              {/* Godown Cost */}
              <div className="bg-amber-50/60 p-2.5 rounded border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-950 uppercase block">
                  {isUr ? 'خریداری لاگت' : 'Purchase Cost'}
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">
                    {isUr ? `ریٹ فی ${unitNameUr}:` : `Cost per ${unitNameEn}:`}
                  </label>
                  <NumberInput
                    step="0.5"
                    min="0"
                    value={costPerUnit}
                    onChange={(val) => handleCostUnitChange(val)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-bold font-mono-num bg-white text-xs"
                    placeholder="0"
                  />
                </div>
                {currentUnitsPerPack > 1 && (
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">
                      {isUr ? `ریٹ فی ${packNameUr}:` : `Cost per ${packNameEn}:`}
                    </label>
                    <NumberInput
                      min="0"
                      value={costPerPack}
                      onChange={(val) => handleCostPackChange(val)}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-bold font-mono-num bg-white text-xs"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>

              {/* Selling Counter Rate */}
              <div className="bg-white p-2.5 rounded border-2 border-emerald-600 space-y-1.5">
                <span className="text-[10px] font-black text-emerald-800 uppercase block">
                  {isUr ? 'فروخت ریٹ' : 'Counter Selling Rate'}
                </span>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                    {isUr ? `ریٹ فی ${unitNameUr}:` : `Selling Rate per ${unitNameEn}:`}
                  </label>
                  <NumberInput
                    step="0.5"
                    min="0"
                    value={counterRatePerUnit}
                    onChange={(val) => handleRateUnitChange(val)}
                    className="w-full text-base font-black font-mono-num px-2.5 py-1 border-2 border-emerald-600 rounded text-emerald-950"
                    placeholder="0"
                  />
                </div>
                {currentUnitsPerPack > 1 && (
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                      {isUr ? `ریٹ فی ${packNameUr}:` : `Selling Rate per ${packNameEn}:`}
                    </label>
                    <NumberInput
                      min="0"
                      value={counterRatePerPack}
                      onChange={(val) => handleRatePackChange(val)}
                      className="w-full text-xs font-bold font-mono-num px-2 py-1 border border-slate-300 rounded text-slate-700"
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Calculated Profit Margin Display */}
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between font-mono-num">
              <div>
                <span className="text-[11px] font-bold text-emerald-950 block">
                  {isUr ? 'موجودہ منافع:' : 'Current Profit Margin:'}
                </span>
                <span className="text-[10px] text-emerald-700">
                  Rate (PKR {counterRatePerUnit}) - Cost (PKR {costPerUnit}) =
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-black ${
                    currentMarginPerUnit >= 0 ? 'text-emerald-800' : 'text-red-700'
                  }`}
                >
                  {currentMarginPerUnit >= 0 ? '+' : ''}PKR {currentMarginPerUnit.toFixed(2)} / {unitNameEn.toLowerCase()}
                </span>
                <span className="text-[10px] text-slate-600 block font-bold">
                  (+PKR {currentMarginPerPack.toLocaleString()} / {packNameEn.toLowerCase()} • {marginPct.toFixed(1)}% Markup)
                </span>
              </div>
            </div>
          </div>

          {/* Physical Stock & Counts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? `سٹاک (${packPluralUr}):` : `Stock (${packPluralEn}):`}
              </label>
              <NumberInput
                min="0"
                value={packsCount}
                onChange={(val) => handlePacksCountChange(val)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num"
                placeholder="0"
                allowDecimals={false}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? `کل فزیکل سٹاک (${unitNameUr}):` : `Total Stock (${unitNameEn}):`}
              </label>
              <NumberInput
                min="0"
                value={physicalStockUnits}
                onChange={(val) => setPhysicalStockUnits(val)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num"
                placeholder="0"
              />
            </div>
          </div>

          {/* Category & Quality Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'کیٹگری:' : 'Item Category:'}
              </label>

              {!isAddingNewCategory ? (
                <select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__NEW__') {
                      setIsAddingNewCategory(true);
                      setNewCategoryInput('');
                    } else {
                      setCategory(val);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs font-bold focus:border-emerald-600 focus:outline-hidden"
                >
                  {DEFAULT_CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {isUr ? opt.ur : opt.en}
                    </option>
                  ))}
                  {customCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__NEW__" className="text-emerald-700 font-bold bg-emerald-50">
                    {isUr ? '+ نئی کیٹگری درج کریں...' : '+ Add New Category...'}
                  </option>
                </select>
              ) : (
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder={isUr ? 'نئی کیٹگری لکھیں...' : 'New category name...'}
                    className="w-full pl-2.5 pr-14 py-1.5 border-2 border-emerald-600 rounded bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCategory();
                      } else if (e.key === 'Escape') {
                        setIsAddingNewCategory(false);
                        setNewCategoryInput('');
                      }
                    }}
                  />
                  <div className="absolute right-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddNewCategory()}
                      className="px-2 py-0.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[10px] font-bold cursor-pointer"
                    >
                      {isUr ? 'شامل' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewCategory(false);
                        setNewCategoryInput('');
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={isUr ? 'منسوخ' : 'Cancel'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? 'کوالٹی تفصیل:' : 'Quality / Lot Notes:'}
              </label>
              <input
                type="text"
                value={qualityNotes}
                onChange={(e) => setQualityNotes(e.target.value)}
                placeholder={isUr ? 'مثلاً فریش سیزن آمد' : 'e.g. 16 Pouches Box or Old Crop'}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-slate-50 px-4 py-2.5 -mx-4 -mb-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center space-x-1 cursor-pointer"
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
                disabled={isSubmitting}
                className="px-5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-400 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isUr ? 'تبدیل ہو رہا ہے...' : 'Updating...'}</span>
                  </>
                ) : (
                  <span>{isUr ? 'تبدیلیاں محفوظ کریں' : 'Save Changes'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal for Item Deletion */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title={isUr ? 'جنس / آئٹم حذف کرنے کی تصدیق' : 'Confirm Inventory Deletion'}
        description={
          isUr
            ? `کیا آپ واقعی اس جنس کو گودام انوینٹری اور کاؤنٹر لسٹ سے مستقل حذف کرنا چاہتے ہیں؟ اس کا تمام موجودہ سٹاک ریکارڈ ختم ہو جائے گا۔`
            : `Are you sure you want to permanently delete "${item.varietyName}" from godown inventory and the POS counter? All stock history for this item will be removed.`
        }
        itemName={`${item.varietyName} (${item.sku})`}
        itemType={isUr ? 'آئٹم / جنس:' : 'Inventory Item:'}
        confirmText={isUr ? 'ہاں، حذف کریں' : 'Yes, Delete Item'}
      />
    </div>
  );
};
