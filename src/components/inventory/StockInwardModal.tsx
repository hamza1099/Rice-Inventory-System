import React, { useState } from 'react';
import type { InventoryItem } from '../../types';
import { X, PackagePlus, ArrowDownToLine } from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface StockInwardModalProps {
  item: InventoryItem | null;
  onClose: () => void;
}

export const StockInwardModal: React.FC<StockInwardModalProps> = ({ item, onClose }) => {
  const { addStockInward } = usePos();
  const [bags, setBags] = useState<number>(20);
  const [weightPerBag, setWeightPerBag] = useState<number>(50);
  const [sourceMandi, setSourceMandi] = useState<string>('Sheikhupura Rice Mandi');
  const [lotNote, setLotNote] = useState<string>('Lot #2024-B4 Fresh Inward Arrival');

  if (!item) return null;

  const totalKg = bags * weightPerBag;

  const handleConfirm = () => {
    if (bags <= 0) return;
    addStockInward(item.id, totalKg, bags);
    alert(`Added ${bags} bags (${totalKg} KG) of ${item.varietyName} to Godown.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ArrowDownToLine className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-bold text-sm">New Stock Inward (آمد گودام)</h3>
              <p className="text-[11px] text-emerald-100">
                {item.varietyName} ({item.urduName})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3 font-mono-num bg-slate-50 p-2.5 rounded border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 font-sans block">Current Godown Stock:</span>
              <span className="text-sm font-bold text-slate-900">{item.physicalStockKg} KG</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-sans block">Current Bags:</span>
              <span className="text-sm font-bold text-emerald-700">{item.bagsCount} Bori</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Number of Bags (تعداد بوری):
              </label>
              <input
                type="number"
                min="1"
                value={bags}
                onChange={(e) => setBags(parseInt(e.target.value) || 0)}
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
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Source Mandi / Seller (منڈی / بیوپاری):
            </label>
            <input
              type="text"
              value={sourceMandi}
              onChange={(e) => setSourceMandi(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Inward Lot Chit Notes:
            </label>
            <input
              type="text"
              value={lotNote}
              onChange={(e) => setLotNote(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>

          {/* Subtotal Inward Added */}
          <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-950 flex items-center justify-between font-mono-num">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase block font-sans">
                Total Inward Weight Added:
              </span>
              <span className="text-xs text-emerald-800">
                {bags} Bags × {weightPerBag} KG =
              </span>
            </div>
            <div className="text-xl font-black text-emerald-800">
              +{totalKg.toLocaleString()} KG
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Confirm Inward Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
