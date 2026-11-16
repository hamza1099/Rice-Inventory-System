import React, { useState } from 'react';
import type { InventoryItem } from '../../types';
import { X, PlusCircle, Sparkles, DollarSign, Loader2 } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { transliterateEnglishToUrduName } from '../../utils/urduTransliterator';
import { notifySuccess, notifyWarning } from '../../utils/toast';
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
  getDefaultPackagingForCategory,
  getCategorySkuPrefix,
  PackagingUnitType
} from '../../utils/packaging';

interface AddVarietyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVarietyModal: React.FC<AddVarietyModalProps> = ({ isOpen, onClose }) => {
  const { addInventoryItem, inventory, language } = usePos();
  const isUr = language === 'ur';

  const [category, setCategory] = useState<string>('Rice');
  const [varietyName, setVarietyName] = useState<string>('');
  const [urduName, setUrduName] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUrduManual, setIsUrduManual] = useState<boolean>(false);
  const [sku, setSku] = useState<string>(() => getCategorySkuPrefix('Rice', inventory.length + 1));

  const [customCategories, setCustomCategories] = useState<string[]>(() => getCustomCategories());
  const [isAddingNewCategory, setIsAddingNewCategory] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');

  // Packaging & Unit States
  const [packagingId, setPackagingId] = useState<string>('25 kg PP Bag');
  const [unitType, setUnitType] = useState<PackagingUnitType>('kg');
  const [unitsPerPack, setUnitsPerPack] = useState<number>(25);
  const [isCustomUnits, setIsCustomUnits] = useState<boolean>(false);
  const [customUnitsInput, setCustomUnitsInput] = useState<number>(25);
  const [tareDeductionKg, setTareDeductionKg] = useState<number>(0.12);

  const [packsCount, setPacksCount] = useState<number>(0);
  const [costPerPack, setCostPerPack] = useState<number>(0);
  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [counterRatePerPack, setCounterRatePerPack] = useState<number>(0);
  const [counterRatePerUnit, setCounterRatePerUnit] = useState<number>(0);

  const [moisturePercentage, setMoisturePercentage] = useState<number>(11.0);
  const [qualityNotes, setQualityNotes] = useState<string>('');

  if (!isOpen) return null;

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

  const handleNameChange = (val: string) => {
    setVarietyName(val);
    if (!isUrduManual || !urduName.trim()) {
      setUrduName(transliterateEnglishToUrduName(val));
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    // Update SKU prefix automatically if it matches standard pattern
    if (sku.startsWith('SKU-')) {
      setSku(getCategorySkuPrefix(newCat, inventory.length + 1));
    }
    // Auto-suggest packaging preset
    const defPreset = getDefaultPackagingForCategory(newCat);
    setPackagingId(defPreset.id);
    setUnitType(defPreset.unitType);
    setUnitsPerPack(defPreset.unitsPerPack);
    setIsCustomUnits(false);
    setTareDeductionKg(defPreset.tareDefault);

    if (costPerUnit > 0) {
      setCostPerPack(Math.round(costPerUnit * defPreset.unitsPerPack));
      setCounterRatePerPack(Math.round(counterRatePerUnit * defPreset.unitsPerPack));
    }
  };

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
  const handleCostPackChange = (val: number) => {
    setCostPerPack(val);
    if (currentUnitsPerPack > 0) {
      setCostPerUnit(Math.round((val / currentUnitsPerPack) * 100) / 100);
    }
  };

  const handleCostUnitChange = (val: number) => {
    setCostPerUnit(val);
    setCostPerPack(Math.round(val * currentUnitsPerPack));
  };

  const handleRatePackChange = (val: number) => {
    setCounterRatePerPack(val);
    if (currentUnitsPerPack > 0) {
      setCounterRatePerUnit(Math.round((val / currentUnitsPerPack) * 100) / 100);
    }
  };

  const handleRateUnitChange = (val: number) => {
    setCounterRatePerUnit(val);
    setCounterRatePerPack(Math.round(val * currentUnitsPerPack));
  };

  const totalUnits = packsCount * currentUnitsPerPack;
  const marginPerUnit = counterRatePerUnit - costPerUnit;
  const marginPerPack = counterRatePerPack - costPerPack;
  const marginPct = costPerUnit > 0 ? (marginPerUnit / costPerUnit) * 100 : 0;

  const handleAddNewCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const updated = saveCustomCategory(trimmed);
    setCustomCategories(updated);
    handleCategoryChange(trimmed);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
    notifySuccess(isUr ? `نئی کیٹگری "${trimmed}" شامل ہو گئی!` : `New category "${trimmed}" added!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!varietyName.trim()) {
      notifyWarning(isUr ? 'آئٹم کا نام درج کریں' : 'Please enter item/variety name');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl.trim();

      // If user selected a local file, upload it to Bunny CDN now
      if (selectedImageFile) {
        finalImageUrl = await uploadToBunny(selectedImageFile, 'products');
      }

      // Build resolved packaging standard label
      let resolvedPackaging = packagingId;
      if (isCustomUnits) {
        if (packagingId === 'custom_kg') resolvedPackaging = `${currentUnitsPerPack} kg Custom Bag`;
        else if (packagingId === 'custom_carton') resolvedPackaging = `Carton (${currentUnitsPerPack} Pieces)`;
        else if (packagingId === 'custom_liquid') resolvedPackaging = `${currentUnitsPerPack} Litre Custom Pack`;
      }

      const resolvedUnitLabel = unitType === 'piece' ? '/ pc' : unitType === 'liter' ? '/ liter' : '/ kg';

      const newItem: InventoryItem = {
        id: `inv-${Date.now()}`,
        varietyName: varietyName.trim(),
        urduName: urduName.trim() || transliterateEnglishToUrduName(varietyName) || varietyName,
        sku: sku.trim() || `SKU-${Date.now()}`,
        category,
        packagingStandard: resolvedPackaging,
        tareDeductionKg,
        physicalStockKg: totalUnits,
        bagsCount: packsCount,
        bagTypeLabel: isUr ? packPluralUr : packPluralEn,
        lotStatus: totalUnits > 100 ? 'In Stock' : totalUnits > 0 ? 'Low Stock' : 'Out of Stock',
        costPerKg: costPerUnit,
        previousCostPerKg: costPerUnit,
        latestInwardCostPerKg: costPerUnit,
        counterRatePerKg: counterRatePerUnit,
        marginPerKg: Math.round(marginPerUnit * 100) / 100,
        marginPercentage: Math.round(marginPct * 10) / 10,
        moisturePercentage,
        qualityNotes: qualityNotes.trim(),
        imageUrl: finalImageUrl || undefined,
        unitType,
        unitLabel: resolvedUnitLabel,
        unitsPerPack: currentUnitsPerPack,
        costPerBag: costPerPack,
        counterRatePerBag: counterRatePerPack,
        packTypeLabel: isUr ? packPluralUr : packPluralEn
      };

      await addInventoryItem(newItem);
      notifySuccess(isUr ? `کامیابی سے شامل کر دیا گیا!` : `Successfully added ${newItem.varietyName}!`);
      setImageUrl('');
      setSelectedImageFile(null);
      onClose();
    } catch (err: any) {
      console.error('Error adding inventory item:', err);
      notifyWarning(isUr ? 'محفوظ کرتے ہوئے خرابی پیش آئی!' : 'Error saving item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4 text-xs">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">
                {isUr ? `نیا آئٹم / جنس درج کریں (${category})` : `Add New Item / Variety (${category})`}
              </h3>
              <p className="text-[11px] text-emerald-100 font-sans">
                {isUr ? 'نام، پیکنگ معیار، خریداری لاگت اور کاؤنٹر ریٹ' : 'Name, packaging standard, purchase cost & selling rate'}
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
                {isUr ? 'آئٹم / جنس کا نام:' : 'Item / Variety Name:'}
              </label>
              <input
                type="text"
                required
                value={varietyName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={
                  category.includes('Oil') || category.includes('Ghee')
                    ? 'e.g. Habib Oil 1L / Dalda Ghee'
                    : category.includes('Pulse') || category.includes('Daal')
                    ? 'e.g. Daal Chana / Daal Mash'
                    : category.includes('Shan') || category.includes('National')
                    ? 'e.g. National Ketchup / Shan Masala'
                    : 'e.g. Super Basmati Old'
                }
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
                {isUrduManual && (
                  <button
                    type="button"
                    onClick={() => {
                      setUrduName(transliterateEnglishToUrduName(varietyName));
                      setIsUrduManual(false);
                    }}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer underline"
                    title={isUr ? 'دوبارہ خودکار کریں' : 'Reset to Auto'}
                  >
                    <span>{isUr ? 'خودکار ری سیٹ' : 'Reset Auto'}</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={urduName}
                onChange={(e) => {
                  setUrduName(e.target.value);
                  if (!e.target.value.trim()) {
                    setIsUrduManual(false);
                    setUrduName(transliterateEnglishToUrduName(varietyName));
                  } else {
                    setIsUrduManual(true);
                  }
                }}
                placeholder="خودکار اردو نام..."
                dir="rtl"
                className="w-full px-2.5 py-1.5 border border-emerald-300/80 bg-emerald-50/30 rounded focus:border-emerald-600 focus:bg-white focus:outline-hidden urdu-text text-sm font-semibold text-emerald-950 placeholder:text-emerald-800/40 transition-colors"
              />
            </div>
          </div>

          {/* Commodity / Product Image Upload */}
          <RiceImageUpload
            imageUrl={imageUrl}
            onChange={(url, file) => {
              setImageUrl(url);
              setSelectedImageFile(file ?? null);
            }}
            isUploading={isSubmitting}
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
                      handleCategoryChange(val);
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
          </div>

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

          {/* Dynamic Stock Counts & Total Calculation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? `موجودہ سٹاک (${packPluralUr}):` : `Initial Stock (${packPluralEn}):`}
              </label>
              <NumberInput
                min="0"
                value={packsCount}
                onChange={(val) => setPacksCount(val)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num text-xs"
                placeholder="0"
                allowDecimals={false}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                {isUr ? `کل مقدار (${unitNameUr}):` : `Total Quantity (${unitNameEn}):`}
              </label>
              <div className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded font-bold font-mono-num text-slate-800 text-xs flex items-center justify-between">
                <span>{totalUnits.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">{unitNameEn}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Cost Structure (Purchase Cost & Selling Counter Rate) */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center space-x-1 font-bold text-slate-900 border-b border-slate-200 pb-1.5">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>{isUr ? 'خریداری لاگت اور کاؤنٹر فروخت ریٹ' : 'Purchase Cost & Selling Counter Rate'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Purchase Cost */}
              <div className="bg-amber-50/60 p-2.5 rounded border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold text-amber-950 uppercase block">
                  {isUr ? 'خریداری لاگت' : 'Purchase Cost'}
                </span>
                {currentUnitsPerPack > 1 && (
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">
                      {isUr ? `ریٹ فی ${packNameUr}:` : `Rate per ${packNameEn}:`}
                    </label>
                    <NumberInput
                      min="0"
                      value={costPerPack}
                      onChange={handleCostPackChange}
                      className="w-full px-2 py-1 border border-slate-300 rounded font-bold font-mono-num bg-white"
                      placeholder="0"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">
                    {isUr ? `ریٹ فی ${unitNameUr}:` : `Rate per ${unitNameEn}:`}
                  </label>
                  <NumberInput
                    step="0.5"
                    min="0"
                    value={costPerUnit}
                    onChange={handleCostUnitChange}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-bold font-mono-num bg-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Selling Rate */}
              <div className="bg-emerald-50/60 p-2.5 rounded border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-950 uppercase block">
                  {isUr ? 'فروخت ریٹ' : 'Counter Selling Rate'}
                </span>
                {currentUnitsPerPack > 1 && (
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5">
                      {isUr ? `ریٹ فی ${packNameUr}:` : `Rate per ${packNameEn}:`}
                    </label>
                    <NumberInput
                      min="0"
                      value={counterRatePerPack}
                      onChange={handleRatePackChange}
                      className="w-full px-2 py-1 border border-emerald-500 rounded font-bold font-mono-num bg-white"
                      placeholder="0"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">
                    {isUr ? `ریٹ فی ${unitNameUr}:` : `Rate per ${unitNameEn}:`}
                  </label>
                  <NumberInput
                    step="0.5"
                    min="0"
                    value={counterRatePerUnit}
                    onChange={handleRateUnitChange}
                    className="w-full px-2 py-1 border border-emerald-500 rounded font-bold font-mono-num bg-white"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Profit Margin Banner */}
            <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between font-mono-num">
              <span className="text-[11px] font-bold text-slate-700">{isUr ? 'متوقع منافع:' : 'Projected Profit Margin:'}</span>
              <div className="text-right">
                <span className={`text-xs font-black ${marginPerUnit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {marginPerUnit >= 0 ? '+' : ''}PKR {marginPerPack.toLocaleString()} / {packNameEn.toLowerCase()} (+PKR {marginPerUnit.toFixed(2)}/{unitNameEn.toLowerCase()})
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
              {isUr ? 'کوالٹی تفصیل:' : 'Quality / Lot Notes:'}
            </label>
            <input
              type="text"
              value={qualityNotes}
              onChange={(e) => setQualityNotes(e.target.value)}
              placeholder={isUr ? 'مثلاً فریش سیزن آمد' : 'e.g. 16 Pouches Box or Old Crop 2023'}
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
                  <span>{isUr ? 'محفوظ ہو رہا ہے...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>{isUr ? 'محفوظ کریں' : 'Save & Add Item'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
