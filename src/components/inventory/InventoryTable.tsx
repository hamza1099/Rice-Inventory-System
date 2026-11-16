import React, { useState } from 'react';
import type { InventoryItem } from '../../types';
import { PlusCircle, Edit3, Trash2, FileText, TrendingUp, TrendingDown, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifyInfo, notifySuccess } from '../../utils/toast';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/productImages';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface InventoryTableProps {
  inventory: InventoryItem[];
  onOpenInward: (item: InventoryItem) => void;
  onOpenRateEdit: (item: InventoryItem) => void;
  onDeleteItem?: (id: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  onOpenInward,
  onOpenRateEdit,
  onDeleteItem
}) => {
  const { openImagePreview, language } = usePos();
  const isUr = language === 'ur';
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const getCleanCategory = (cat: string) => {
    if (isUr) {
      if (cat.includes('Rice') || cat.includes('چاول')) return 'چاول';
      if (cat.includes('Pulses') || cat.includes('Daal') || cat.includes('دال')) return 'دالیں';
      if (cat.includes('Spices') || cat.includes('مصالحہ')) return 'کھلا مصالحہ';
      if (cat.includes('Shan') || cat.includes('National')) return 'ڈبہ مصالحہ';
      if (cat.includes('Oil') || cat.includes('Ghee') || cat.includes('تیل')) return 'تیل و گھی';
      if (cat.includes('Atta') || cat.includes('Sugar') || cat.includes('آٹا')) return 'آٹا و چینی';
      return cat.replace(/\([^)]*\)/g, '').trim();
    }
    return cat.replace(/\s*\([^)]*[\u0600-\u06FF]+[^)]*\)/g, '').trim();
  };

  const getCleanPackaging = (pkg: string) => {
    if (isUr) {
      if (pkg.includes('50 kg Jute')) return '50 کلو جوٹ بوری';
      if (pkg.includes('50 kg PP')) return '50 کلو پی پی بوری';
      if (pkg.includes('25 kg Poly') || pkg.includes('25 kg PP')) return '25 کلو پی پی بیگ';
      if (pkg.includes('40 kg')) return '40 کلو (1 من)';
      if (pkg.includes('Master Carton')) return 'ماسٹر کارٹن (72 ڈبے)';
      if (pkg.includes('Carton')) return 'کارٹن (4 ٹین)';
      if (pkg.includes('10 kg')) return '10 کلو پرنٹڈ بیگ';
      return pkg.replace(/\([^)]*\)/g, '').trim();
    }
    return pkg.replace(/\s*\([^)]*[\u0600-\u06FF]+[^)]*\)/g, '').trim();
  };

  const getCleanBagLabel = (label: string) => {
    if (isUr) {
      if (label.includes('ڈبے') || label.toLowerCase().includes('packet')) return 'ڈبے';
      if (label.includes('ٹین') || label.toLowerCase().includes('tin')) return 'ٹین';
      if (label.includes('تھیلے')) return 'تھیلے';
      if (label.includes('بوری') || label.toLowerCase().includes('bag')) return 'بوریاں';
      return label;
    }
    return label.replace(/\s*\([^)]*[\u0600-\u06FF]+[^)]*\)/g, '').trim();
  };

  const getStatusBadge = (status: InventoryItem['lotStatus']) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            • {isUr ? 'دستیاب سٹاک' : 'In Stock'}
          </span>
        );
      case 'Critical Low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            ! {isUr ? 'انتہائی کم' : 'Critical Low'}
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            • {isUr ? 'کم سٹاک' : 'Low Stock'}
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            {isUr ? 'ختم' : 'Out of Stock'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden text-xs flex-1 flex flex-col h-full min-h-0">
      {/* Table Header Bar */}
      <div className="shrink-0 bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
            {isUr ? 'گودام اور بیوپاری لائیو رجسٹر' : 'Live Godown & Floor Ledger'}
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono-num">
          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
            {isUr ? 'تصدیق شدہ مال' : 'WHOLESALE LOT VERIFIED'}
          </span>
          <button 
            onClick={() => notifyInfo("Generating & Printing Godown Inventory Stock Report...")}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>{isUr ? 'رپورٹ پرنٹ' : '[Ctrl+R Report]'}</span>
          </button>
        </div>
      </div>

      {/* Table Contents - ONLY THIS AREA SCROLLS */}
      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
            <tr>
              <th className="py-2.5 px-4">{isUr ? 'آئٹم نام و کوڈ' : 'ITEM NAME & SKU'}</th>
              <th className="py-2.5 px-3">{isUr ? 'کیٹیگری' : 'CATEGORY'}</th>
              <th className="py-2.5 px-3">{isUr ? 'پیکنگ معیار' : 'PACKAGING STANDARD'}</th>
              <th className="py-2.5 px-3 text-right">{isUr ? 'موجودہ سٹاک' : 'PHYSICAL STOCK'}</th>
              <th className="py-2.5 px-3 text-center">{isUr ? 'سٹاک اسٹیٹس' : 'LOT STATUS'}</th>
              <th className="py-2.5 px-3 text-right">{isUr ? 'خریداری لاگت' : 'COST (PKR/UNIT)'}</th>
              <th className="py-2.5 px-3 text-right">{isUr ? 'کاؤنٹر ریٹ' : 'COUNTER RATE (PKR/UNIT)'}</th>
              <th className="py-2.5 px-3 text-center">{isUr ? 'فوری کارروائی' : 'FAST OPERATIONS'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xs text-slate-800">
                      {isUr ? 'گودام میں ابھی کوئی جنس / چاول موجود نہیں ہے' : 'No inventory items in godown yet'}
                    </span>
                    <span className="text-[11px] text-slate-500 max-w-sm">
                      {isUr
                        ? 'سٹاک شامل کرنے کے لیے اوپر موجود "+ نئی جنس / آئٹم" یا "+ گودام مال آمد" پر کلک کریں۔'
                        : 'Click "+ Add New Item / Variety" above to add your first commodity.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Rice Variety & Description + Thumbnail */}
                <td className="py-3 px-4 font-sans">
                  <div className="flex items-center space-x-3">
                    <div
                      onClick={() =>
                        openImagePreview({
                          imageUrl: item.imageUrl || DEFAULT_RICE_IMAGE,
                          title: item.varietyName,
                          urduTitle: item.urduName,
                          category: item.category,
                          badgeLabel: item.lotStatus,
                          rate: item.counterRatePerKg,
                          stock: `${item.physicalStockKg} KG (${item.bagsCount} Bags)`,
                          binLocation: item.packagingStandard
                        })
                      }
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs cursor-pointer group hover:border-emerald-600 transition-colors relative"
                      title={isUr ? 'بڑی تصویر دیکھیں' : 'Click to preview image'}
                    >
                      <img
                        src={item.imageUrl || DEFAULT_RICE_IMAGE}
                        alt={item.varietyName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = SVG_RICE_FALLBACK;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {isUr ? (item.urduName || item.varietyName) : item.varietyName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {item.sku}
                        </span>
                      </div>
                      {item.qualityNotes && (
                        <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                          {item.qualityNotes}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-3 px-3 font-sans text-slate-700 font-medium">
                  {getCleanCategory(item.category)}
                </td>

                {/* Packaging */}
                <td className="py-3 px-3 text-slate-600 font-sans">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    {getCleanPackaging(item.packagingStandard)}
                  </span>
                  {item.unitType === 'kg' && item.tareDeductionKg > 0 ? (
                    <span className="text-[10px] text-slate-500">
                      {isUr ? `کاٹ: -${item.tareDeductionKg} کلو` : `Tare: -${item.tareDeductionKg} kg/bag`}
                    </span>
                  ) : null}
                </td>

                {/* Stock in KG/Pieces/Litres and Packs */}
                <td className="py-3 px-3 text-right">
                  <span className="text-sm font-black text-slate-900 block">
                    {item.physicalStockKg.toLocaleString()}{' '}
                    {item.unitType === 'piece'
                      ? isUr ? 'دانے' : 'pcs'
                      : item.unitType === 'liter'
                      ? isUr ? 'لیٹر' : 'L'
                      : isUr ? 'کلو' : 'kg'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {item.bagsCount} {getCleanBagLabel(item.bagTypeLabel)}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="py-3 px-3 text-center">
                  {getStatusBadge(item.lotStatus)}
                </td>

                {/* Cost */}
                <td className="py-3 px-3 text-right">
                  <span className="text-xs font-bold text-slate-800 block">
                    PKR {item.costPerKg.toFixed(2)}
                  </span>
                  {item.previousCostPerKg && item.previousCostPerKg !== item.costPerKg && (
                    <div className="flex items-center justify-end gap-0.5 text-[9px] font-bold">
                      {item.costDifferencePerKg && item.costDifferencePerKg > 0 ? (
                        <span className="text-red-600 flex items-center">
                          <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                          +{item.costDifferencePerKg.toFixed(1)}/unit
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center">
                          <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                          {item.costDifferencePerKg?.toFixed(1)}/unit
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Counter Rate & Margin */}
                <td className="py-3 px-3 text-right">
                  <span className="text-sm font-black text-emerald-800 block">
                    PKR {item.counterRatePerKg.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    {isUr
                      ? `منافع: +${item.marginPerKg.toFixed(2)} فی ${
                          item.unitType === 'piece' ? 'دانہ' : item.unitType === 'liter' ? 'لیٹر' : 'کلو'
                        }`
                      : `Margin: +PKR ${item.marginPerKg.toFixed(2)}/${
                          item.unitType === 'piece' ? 'pc' : item.unitType === 'liter' ? 'L' : 'kg'
                        }`}
                  </span>
                  {item.marginPercentage && (
                    <span className="text-[9px] text-slate-500 font-mono">
                      ({item.marginPercentage}% Markup)
                    </span>
                  )}
                </td>

                {/* Fast Operations */}
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center space-x-1.5">
                    <button
                      onClick={() => onOpenInward(item)}
                      title={isUr ? 'گودام میں مال آمد' : 'Add Stock Inward'}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-800 hover:text-white border border-emerald-300 text-emerald-800 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>{isUr ? '+ مال آمد' : '+ Inward'}</span>
                    </button>
                    <button
                      onClick={() => onOpenRateEdit(item)}
                      title={isUr ? 'ریٹ و تفصیل تبدیل کریں' : 'Edit Variety & Adjust Rates'}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>{isUr ? 'ریٹ تبدیل' : 'Edit & Rate'}</span>
                    </button>
                    {onDeleteItem && (
                      <button
                        onClick={() => setItemToDelete(item)}
                        title={isUr ? 'حذف کریں' : 'Delete Item'}
                        className="inline-flex items-center p-1 rounded bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-400 font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Pagination & Inventory Summary Footer */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          <span>{isUr ? 'موجودہ لسٹ: ' : 'Showing '}</span>
          <strong className="text-slate-800 font-mono-num">{inventory.length}</strong>
          <span>{isUr ? ' اجناس | کل موجودہ سٹاک: ' : ' Recorded Varieties | Current Total: '}</span>
          <strong className="text-slate-800 font-mono-num">
            {inventory.reduce((sum, item) => sum + item.physicalStockKg, 0).toLocaleString()} kg (~{inventory.reduce((sum, item) => sum + item.bagsCount, 0)} {isUr ? 'بوریاں' : 'Bags'})
          </strong>
        </div>

        <div className="flex items-center space-x-1 font-mono-num">
          <span>{inventory.length > 0 ? (isUr ? 'صفحہ 1 از 1' : 'Page 1 of 1') : (isUr ? 'خالی' : 'Empty')}</span>
        </div>
      </div>

      {/* Custom Confirmation Modal for Deleting Inventory Item */}
      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete && onDeleteItem) {
            onDeleteItem(itemToDelete.id);
            notifySuccess(
              isUr
                ? `${itemToDelete.urduName || itemToDelete.varietyName} گودام سے حذف کر دیا گیا`
                : `${itemToDelete.varietyName} removed from inventory`
            );
          }
          setItemToDelete(null);
        }}
        title={isUr ? 'جنس / آئٹم حذف کرنے کی تصدیق' : 'Confirm Inventory Deletion'}
        description={
          isUr
            ? `کیا آپ واقعی اس جنس کو گودام انوینٹری اور کاؤنٹر لسٹ سے مستقل حذف کرنا چاہتے ہیں؟ اس کا تمام موجودہ سٹاک ریکارڈ ختم ہو جائے گا۔`
            : `Are you sure you want to permanently delete this item from godown inventory and the POS counter? All stock history for this item will be removed.`
        }
        itemName={itemToDelete ? `${itemToDelete.varietyName} (${itemToDelete.sku})` : ''}
        itemType={isUr ? 'آئٹم / جنس:' : 'Inventory Item:'}
        confirmText={isUr ? 'ہاں، حذف کریں' : 'Yes, Delete Item'}
      />
    </div>
  );
};
