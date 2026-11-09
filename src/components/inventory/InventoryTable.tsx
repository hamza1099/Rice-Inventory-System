import React from 'react';
import type { InventoryItem } from '../../types';
import { PlusCircle, Edit3, Trash2, FileText, TrendingUp, TrendingDown, Image as ImageIcon } from 'lucide-react';
import { notifyInfo } from '../../utils/toast';
import { DEFAULT_RICE_IMAGE, SVG_RICE_FALLBACK } from '../../utils/riceImages';

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
  const getStatusBadge = (status: InventoryItem['lotStatus']) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            • In Stock
          </span>
        );
      case 'Critical Low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 animate-pulse">
            ! Critical Low
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            • Low Stock
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            Out of Stock
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden text-xs">
      {/* Table Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
            Live Godown & Floor Ledger
          </h3>
          <span className="urdu-text text-xs text-slate-600 font-semibold" dir="rtl">
            (گودام اور بیوپاری لائیو رجسٹر)
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono-num">
          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
            WHOLESALE LOT VERIFIED
          </span>
          <button 
            onClick={() => notifyInfo("Generating & Printing Godown Inventory Stock Report...")}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3" />
            <span>[Ctrl+R Report]</span>
          </button>
        </div>
      </div>

      {/* Table Contents */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">RICE VARIETY & DESCRIPTION</th>
              <th className="py-2.5 px-3">GRAIN CATEGORY</th>
              <th className="py-2.5 px-3">PACKAGING STANDARD</th>
              <th className="py-2.5 px-3 text-right">PHYSICAL STOCK</th>
              <th className="py-2.5 px-3 text-center">LOT STATUS</th>
              <th className="py-2.5 px-3 text-right">COST (PKR/KG)</th>
              <th className="py-2.5 px-3 text-right">COUNTER RATE (PKR/KG)</th>
              <th className="py-2.5 px-3 text-center">FAST OPERATIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Rice Variety & Description + Thumbnail */}
                <td className="py-3 px-4 font-sans">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                      <img
                        src={item.imageUrl || DEFAULT_RICE_IMAGE}
                        alt={item.varietyName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = SVG_RICE_FALLBACK;
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">
                          {item.varietyName}
                        </span>
                      </div>
                      <div className="flex items-baseline space-x-2 text-[11px] mt-0.5">
                        <span className="urdu-text text-emerald-900 font-bold text-xs" dir="rtl">
                          {item.urduName}
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
                  {item.category}
                </td>

                {/* Packaging */}
                <td className="py-3 px-3 text-slate-600 font-sans">
                  <span className="font-bold text-slate-800 block text-[11px]">
                    {item.packagingStandard}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Tare: -{item.tareDeductionKg} kg/bag
                  </span>
                </td>

                {/* Stock in KG and Bags */}
                <td className="py-3 px-3 text-right">
                  <span className="text-sm font-black text-slate-900 block">
                    {item.physicalStockKg.toLocaleString()} kg
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {item.bagsCount} {item.bagTypeLabel}
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
                          +{item.costDifferencePerKg.toFixed(1)}/kg
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center">
                          <TrendingDown className="w-2.5 h-2.5 mr-0.5" />
                          {item.costDifferencePerKg?.toFixed(1)}/kg
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
                    Margin: +PKR {item.marginPerKg.toFixed(2)}/kg
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
                      title="Add Stock Inward (آمد گودام و لاگت)"
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-800 hover:text-white border border-emerald-300 text-emerald-800 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      <PlusCircle className="w-3 h-3" />
                      <span>+ Inward</span>
                    </button>
                    <button
                      onClick={() => onOpenRateEdit(item)}
                      title="Edit Variety & Adjust Rates (ریٹ و تفصیل)"
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>Edit & Rate</span>
                    </button>
                    {onDeleteItem && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${item.varietyName} from inventory?`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        title="Delete Product (چاول حذف کریں)"
                        className="inline-flex items-center p-1 rounded bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 text-slate-400 font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          <span>Showing </span>
          <strong className="text-slate-800 font-mono-num">{inventory.length}</strong>
          <span> of </span>
          <strong className="text-slate-800 font-mono-num">32</strong>
          <span> Recorded Varieties | Current Page Total: </span>
          <strong className="text-slate-800 font-mono-num">13,925 kg (~279 Bori)</strong>
        </div>

        <div className="flex items-center space-x-1 font-mono-num">
          <span>Page 1 of 4</span>
        </div>
      </div>
    </div>
  );
};
