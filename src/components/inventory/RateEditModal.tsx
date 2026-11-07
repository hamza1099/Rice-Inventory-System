import React, { useState } from 'react';
import type { InventoryItem } from '../../types';
import { X, Check, DollarSign } from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface RateEditModalProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export const RateEditModal: React.FC<RateEditModalProps> = ({ item, onClose }) => {
  const { updateInventoryRate } = usePos();
  const [newRate, setNewRate] = useState<number>(item?.counterRatePerKg || 0);

  if (!item) return null;

  const currentMargin = newRate - item.costPerKg;

  const handleSave = () => {
    updateInventoryRate(item.id, newRate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 font-bold">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Update Counter Rate: {item.varietyName}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div className="space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200 font-mono-num">
            <div className="flex justify-between text-slate-500">
              <span>Godown Purchase Cost:</span>
              <span className="font-bold text-slate-900">PKR {item.costPerKg.toFixed(2)}/kg</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Current Counter Rate:</span>
              <span className="font-bold text-slate-900">PKR {item.counterRatePerKg.toFixed(2)}/kg</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              New Counter Selling Rate (PKR / KG):
            </label>
            <input
              type="number"
              step="1"
              autoFocus
              value={newRate}
              onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
              className="w-full text-lg font-black font-mono-num px-3 py-2 border-2 border-emerald-600 rounded-lg focus:outline-hidden text-slate-900"
            />
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between font-mono-num">
            <span className="text-[11px] font-bold text-emerald-800">Calculated Profit Margin:</span>
            <span className={`text-sm font-black ${currentMargin >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
              {currentMargin >= 0 ? '+' : ''}PKR {currentMargin.toFixed(2)} / kg
            </span>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Update Rate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
