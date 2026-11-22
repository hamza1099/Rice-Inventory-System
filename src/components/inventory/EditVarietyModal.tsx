import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../../types';
import { X, DollarSign, Trash2, Sparkles, Loader2, AlertCircle } from 'lucide-react';
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
  const [minStockThreshold, setMinStockThreshold] = useState<number>(item?.minStockThreshold ?? 20);

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

      const isLoose =
        item.packagingStandard?.includes('Loose') ||
        item.packagingStandard?.includes('Minor') ||
        item.packagingStandard === 'loose_minor' ||
        item.bagTypeLabel?.includes('Loose') ||
        item.bagTypeLabel?.includes('کھلا');

      const matchedPreset = isLoose
        ? (PACKAGING_PRESETS.find((p) => p.id === 'loose_minor') || PACKAGING_PRESETS[0])
        : getPackagingPreset(item.packagingStandard);

      const isCustom = !isLoose && (
        item.packagingStandard.includes('Custom') ||
        (!PACKAGING_PRESETS.some((p) => p.id === item.packagingStandard) && Boolean(item.unitsPerPack))
      );

      const uType = (item.unitType || matchedPreset.unitType) as PackagingUnitType;
      const uPerPack = isLoose ? 1 : (item.unitsPerPack || matchedPreset.unitsPerPack || 25);

      setPackagingId(isLoose ? 'loose_minor' : isCustom ? (uType === 'piece' ? 'custom_carton' : uType === 'liter' ? 'custom_liquid' : 'custom_kg') : matchedPreset.id);
      setIsCustomUnits(isCustom);
      setCustomUnitsInput(uPerPack);
      setUnitType(uType);
      setUnitsPerPack(uPerPack);
      setTareDeductionKg(isLoose ? 0 : (item.tareDeductionKg ?? matchedPreset.tareDefault ?? 0.12));

      setPacksCount(isLoose ? 0 : item.bagsCount);
      setPhysicalStockUnits(item.physicalStockKg);
      setMinStockThreshold(item.minStockThreshold !== undefined ? item.minStockThreshold : 20);

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

  // Check if current item is a loose / minor item (dry fruit, spices, badam, etc - no bags)
  const isMinorLoose = packagingId === 'loose_minor' || packagingId.includes('Loose') || packagingId.includes('Minor');

  // Derive dynamic labels based on unitType and unitsPerPack
  const currentUnitsPerPack = isMinorLoose ? 1 : Math.max(1, isCustomUnits ? customUnitsInput : unitsPerPack);
  const isBag = unitType === 'kg';
  const isLiquid = unitType === 'liter';
  const isCarton = unitType === 'piece' && currentUnitsPerPack > 1;

  const packNameEn = isMinorLoose ? 'Loose' : isBag ? 'Bag' : isLiquid ? (currentUnitsPerPack >= 16 ? 'Tin' : 'Can') : isCarton ? 'Carton' : 'Piece';
  const packNameUr = isMinorLoose ? 'کھلا' : isBag ? 'بوری' : isLiquid ? (currentUnitsPerPack >= 16 ? 'ٹن' : 'کین') : isCarton ? 'کارٹن' : 'دانہ';

  const packPluralEn = isMinorLoose ? 'Loose' : isBag ? 'Bags' : isLiquid ? (currentUnitsPerPack >= 16 ? 'Tins' : 'Cans') : isCarton ? 'Cartons' : 'Pieces';
  const packPluralUr = isMinorLoose ? 'کھلا' : isBag ? 'بوریاں' : isLiquid ? (currentUnitsPerPack >= 16 ? 'ٹن' : 'کین') : isCarton ? 'کارٹن' : 'دانے';

  const unitNameEn = isBag ? 'KG' : isLiquid ? 'Litre' : 'Piece';
  const unitNameUr = isBag ? 'کلو' : isLiquid ? 'لیٹر' : 'دانہ';

  const formatGramsHelper = (kgVal: number) => {
    if (kgVal <= 0) return '';
    if (kgVal < 1) {
      const grams = Math.round(kgVal * 1000);
      return `= ${grams} Grams (${grams} گرام)`;
    }
    const wholeKg = Math.floor(kgVal);
    const remGrams = Math.round((kgVal - wholeKg) * 1000);
    if (remGrams === 0) {
      return `= ${wholeKg} KG (${wholeKg} کلو)`;
    }
    return `= ${wholeKg} KG ${remGrams}g (${wholeKg} کلو ${remGrams} گرام)`;
  };

  const handlePackagingChange = (id: string) => {
    setPackagingId(id);
    if (id === 'loose_minor') {
      setIsCustomUnits(false);
      setUnitType('kg');
      setUnitsPerPack(1);
      setTareDeductionKg(0);
      setPacksCount(0);
      if (costPerUnit > 0) {
        setCostPerPack(costPerUnit);
        setCounterRatePerPack(counterRatePerUnit);
      }
    } else if (id === 'custom_kg') {
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
      if (packsCount > 0) setPhysicalStockUnits(Math.round(packsCount * pr.unitsPerPack * 100) / 100);
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
    setPhysicalStockUnits(Math.round(count * currentUnitsPerPack * 100) / 100);
  };

  const handlePhysicalStockChange = (val: number) => {
    setPhysicalStockUnits(val);
    if (!isMinorLoose && currentUnitsPerPack > 0) {
      setPacksCount(Math.floor(val / currentUnitsPerPack));
    }
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
      if (isMinorLoose) {
        resolvedPackaging = 'Loose / Minor Item (No Bags)';
      } else if (isCustomUnits) {
        if (packagingId === 'custom_kg') resolvedPackaging = `${currentUnitsPerPack} kg Custom Bag`;
        else if (packagingId === 'custom_carton') resolvedPackaging = `Carton (${currentUnitsPerPack} Pieces)`;
        else if (packagingId === 'custom_liquid') resolvedPackaging = `${currentUnitsPerPack} Litre Custom Pack`;
      }

      const resolvedUnitLabel = unitType === 'piece' ? '/ pc' : unitType === 'liter' ? '/ liter' : '/ kg';

      const threshold = minStockThreshold !== undefined ? Number(minStockThreshold) : (isMinorLoose ? 0.2 : 20);
      const lotStatus = physicalStockUnits <= 0
        ? 'Out of Stock'
        : physicalStockUnits <= (threshold / 2)
          ? 'Critical Low'
          : physicalStockUnits <= threshold
            ? 'Low Stock'
            : 'In Stock';

      await updateInventoryItem(item.id, {
        varietyName: varietyName.trim(),
        urduName: urduName.trim() || varietyName,
        imageUrl: finalImageUrl || undefined,
        category,
        packagingStandard: resolvedPackaging,
        tareDeductionKg: isMinorLoose ? 0 : tareDeductionKg,
        bagsCount: isMinorLoose ? 0 : packsCount,
        bagTypeLabel: isMinorLoose ? (isUr ? 'کھلا' : 'Loose') : (isUr ? packPluralUr : packPluralEn),
        physicalStockKg: physicalStockUnits,
        minStockThreshold: threshold,
        lotStatus,
        costPerKg: costPerUnit,
        counterRatePerKg: counterRatePerUnit,
        marginPerKg: Math.round(currentMarginPerUnit * 100) / 100,
        marginPercentage: Math.round(marginPct * 10) / 10,
        moisturePercentage,
        qualityNotes: qualityNotes.trim(),
        unitType,
        unitLabel: resolvedUnitLabel,
        unitsPerPack: isMinorLoose ? 1 : currentUnitsPerPack,
        costPerBag: isMinorLoose ? costPerUnit : costPerPack,
        counterRatePerBag: isMinorLoose ? counterRatePerUnit : counterRatePerPack,
        packTypeLabel: isMinorLoose ? (isUr ? 'کھلا' : 'Loose') : (isUr ? packPluralUr : packPluralEn)
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
            {isMinorLoose ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Godown Cost */}
                <div className="bg-amber-50/60 p-2.5 rounded border border-amber-200 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-950 uppercase block">
                    {isUr ? 'خریداری لاگت' : 'Purchase Cost'}
                  </span>
                  <div>
                    <label className="block text-[10px] text-slate-600 mb-0.5 font-bold">
                      {isUr ? 'لاگت فی کلو:' : 'Cost per KG:'}
                    </label>
                    <NumberInput
                      step="1"
                      min="0"
                      value={costPerUnit}
                      onChange={(val) => handleCostUnitChange(val)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold font-mono-num bg-white text-xs"
                      placeholder="0"
                    />
                    {costPerUnit > 0 && (
                      <span className="text-[10px] text-amber-800 font-mono-num font-semibold mt-0.5 block">
                        ≈ PKR {(costPerUnit / 10).toFixed(1)} / 100g
                      </span>
                    )}
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
                    <NumberInput
                      step="1"
                      min="0"
                      value={counterRatePerUnit}
                      onChange={(val) => handleRateUnitChange(val)}
                      className="w-full text-base font-black font-mono-num px-2.5 py-1 border-2 border-emerald-600 rounded text-emerald-950"
                      placeholder="0"
                    />
                    {counterRatePerUnit > 0 && (
                      <span className="text-[10px] text-emerald-700 font-mono-num font-bold mt-0.5 block">
                        ≈ PKR {(counterRatePerUnit / 10).toFixed(1)} / 100g
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
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
                      step="any"
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
                      step="any"
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
            )}

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
                  {isMinorLoose ? (
                    `${currentMarginPerUnit >= 0 ? '+' : ''}PKR ${currentMarginPerUnit.toFixed(2)} / kg (+PKR ${(currentMarginPerUnit / 10).toFixed(2)} / 100g)`
                  ) : (
                    `${currentMarginPerUnit >= 0 ? '+' : ''}PKR ${currentMarginPerUnit.toFixed(2)} / ${unitNameEn.toLowerCase()}`
                  )}
                </span>
                <span className="text-[10px] text-slate-600 block font-bold">
                  {isMinorLoose ? (
                    `Markup: ${marginPct.toFixed(1)}%`
                  ) : (
                    `(+PKR ${currentMarginPerPack.toLocaleString()} / ${packNameEn.toLowerCase()} • ${marginPct.toFixed(1)}% Markup)`
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Stock & Counts */}
          {isMinorLoose ? (
            <div className="bg-emerald-50/70 border-2 border-emerald-600 rounded-lg p-3 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <span>{isUr ? 'موجودہ سٹاک (کلو گرام / گرام):' : 'Stock Quantity (KG / Grams):'}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                    {isUr ? 'بغیر بوری - کھلا مال' : 'Loose Item (No Bags)'}
                  </span>
                </label>
                {physicalStockUnits > 0 && (
                  <span className="text-xs font-black text-emerald-800 font-mono-num bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-2xs">
                    {formatGramsHelper(physicalStockUnits)}
                  </span>
                )}
              </div>
              <div className="relative">
                <NumberInput
                  min="0"
                  value={physicalStockUnits}
                  onChange={(val) => handlePhysicalStockChange(val)}
                  className="w-full pl-3 pr-20 py-2 border-2 border-emerald-600 rounded bg-white text-sm font-black font-mono-num text-slate-900 focus:outline-hidden"
                  placeholder="e.g. 0.400"
                  allowDecimals={true}
                  step="any"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-800 uppercase">
                  KG / کلو
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-0.5">
                <span>
                  {isUr
                    ? 'مثال: 400 گرام کے لیے 0.400 لکھیں، 50 گرام کے لیے 0.050 لکھیں۔'
                    : 'Example: Enter 0.400 for 400 grams, 0.050 for 50 grams, 1.250 for 1kg 250g.'}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{isUr ? `سٹاک (${packPluralUr}):` : `Stock (${packPluralEn}):`}</span>
                  <span className="text-[10px] text-slate-500 font-mono-num font-semibold">
                    {currentUnitsPerPack} {unitNameEn}/{packNameEn}
                  </span>
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{isUr ? `کل فزیکل سٹاک (${unitNameUr}):` : `Total Stock (${unitNameEn}):`}</span>
                  {packsCount > 0 && Math.abs(physicalStockUnits - packsCount * currentUnitsPerPack) > 0.01 && (
                    <button
                      type="button"
                      onClick={() => setPhysicalStockUnits(packsCount * currentUnitsPerPack)}
                      className="text-[9.5px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                      title={isUr ? 'مکمل بوری وزن پر سیٹ کریں' : 'Sync to full bags weight'}
                    >
                      {isUr ? `سیٹ کریں ${packsCount * currentUnitsPerPack} کلو` : `Set ${packsCount * currentUnitsPerPack} ${unitNameEn}`}
                    </button>
                  )}
                </label>
                <NumberInput
                  min="0"
                  value={physicalStockUnits}
                  onChange={(val) => handlePhysicalStockChange(val)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-bold font-mono-num"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Low Stock Alert Threshold Setting */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{isUr ? 'کم سٹاک الرٹ کی حد (وارننگ پوائنٹ):' : 'Low Stock Alert Limit / Threshold:'}</span>
              </label>
              <span className="text-[10px] text-amber-800 font-semibold">
                {isUr ? 'کس مقدار پر الرٹ دکھائے؟' : 'When should alert trigger?'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-36">
                <NumberInput
                  min="0"
                  value={minStockThreshold}
                  onChange={(val) => setMinStockThreshold(val)}
                  className="w-full pl-2.5 pr-12 py-1.5 border border-amber-300 rounded font-bold font-mono-num text-xs bg-white text-amber-950 focus:border-amber-500 focus:outline-hidden"
                  placeholder="20"
                  allowDecimals={true}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-700 uppercase">
                  {unitNameEn}
                </span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">
                {isUr 
                  ? `جب سٹاک ${minStockThreshold} ${unitNameUr} یا اس سے کم رہ جائے گا تو پیلا "Low Stock" الرٹ آئے گا۔`
                  : `Shows yellow "Low Stock" badge only when available drops to ≤ ${minStockThreshold} ${unitNameEn}.`}
              </span>
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
