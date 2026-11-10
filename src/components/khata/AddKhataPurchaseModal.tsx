import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Trash2, Calendar, FileText } from 'lucide-react';
import type { KhataCustomer, KhataItemEntry } from '../../types';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';

interface AddKhataPurchaseModalProps {
  isOpen: boolean;
  customer: KhataCustomer | null;
  onClose: () => void;
}

export const AddKhataPurchaseModal: React.FC<AddKhataPurchaseModalProps> = ({
  isOpen,
  customer,
  onClose
}) => {
  const { products, addKhataPurchase } = usePos();

  const [items, setItems] = useState<KhataItemEntry[]>([
    {
      productName: products[0]?.name || 'Super Basmati Old',
      urduName: products[0]?.urduName || 'سوپر باسمتی پرانا',
      quantity: 50,
      unit: 'kg',
      rate: products[0]?.ratePerKg || 380,
      subtotal: (products[0]?.ratePerKg || 380) * 50
    }
  ]);

  const [manualDescription, setManualDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !customer) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const newBalance = customer.currentBalance + totalAmount;

  const handleProductSelect = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setItems((prev) => {
      const copy = [...prev];
      const qty = copy[index].quantity || 1;
      copy[index] = {
        productName: prod.name,
        urduName: prod.urduName,
        quantity: qty,
        unit: prod.unitLabel ? prod.unitLabel.replace('/', '').trim() : 'kg',
        rate: prod.ratePerKg,
        subtotal: prod.ratePerKg * qty
      };
      return copy;
    });
  };

  const handleQtyChange = (index: number, qty: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = qty;
      copy[index].subtotal = Math.round(qty * copy[index].rate);
      return copy;
    });
  };

  const handleRateChange = (index: number, rate: number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index].rate = rate;
      copy[index].subtotal = Math.round(copy[index].quantity * rate);
      return copy;
    });
  };

  const handleAddItemRow = () => {
    const defaultProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productName: defaultProd ? defaultProd.name : 'Other Item',
        urduName: defaultProd ? defaultProd.urduName : 'دیگر اشیاء',
        quantity: 1,
        unit: 'kg',
        rate: defaultProd ? defaultProd.ratePerKg : 100,
        subtotal: defaultProd ? defaultProd.ratePerKg : 100
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAmount <= 0) {
      notifyWarning('Please enter valid purchase items and amount (رقم درج کریں)');
      return;
    }

    const itemSummary = items
      .map((i) => `${i.productName} (${i.quantity} ${i.unit})`)
      .join(', ');

    const desc = manualDescription.trim() || `ادھار خریداری: ${itemSummary}`;

    addKhataPurchase(customer.id, totalAmount, desc, items, notes.trim());

    notifySuccess(
      `Rs. ${totalAmount.toLocaleString()} added to ${customer.shopName}'s Khata! (ادھار شامل ہو گیا)`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-xs my-4">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-emerald-200" />
            <div>
              <h2 className="text-sm font-bold flex items-center gap-2">
                <span>نیا ادھار خریداری اندراج</span>
                <span className="text-emerald-200 font-normal text-xs">(Record Credit Purchase)</span>
              </h2>
              <p className="text-[11px] text-emerald-100 font-mono-num">
                {customer.shopName} • موجودہ بقایا: PKR {customer.currentBalance.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-full hover:bg-emerald-700/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Customer Overview Ribbon */}
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-center justify-between font-mono-num">
            <div>
              <span className="text-[10px] text-slate-500 font-sans block">کھاتے دار (Customer):</span>
              <span className="text-sm font-bold text-slate-900 font-sans">{customer.shopName}</span>
              <span className="text-[10px] text-slate-500 ml-1">({customer.phone || 'No Phone'})</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-sans block">سابقہ بقایا رقم:</span>
              <span className="text-sm font-black text-amber-700">
                PKR {customer.currentBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-800">
                سامان / جنس کی تفصیلات (Items Taken on Credit):
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ مزید آئٹم شامل کریں (Add Row)</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">جنس / سامان (Item)</th>
                    <th className="py-2 px-2 text-right w-24">مقدار (Qty)</th>
                    <th className="py-2 px-2 text-right w-24">ریٹ (Rate)</th>
                    <th className="py-2 px-3 text-right w-28">رقم (Subtotal)</th>
                    <th className="py-2 px-1 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-mono-num">
                  {items.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <select
                          value={
                            products.find((p) => p.name === row.productName)?.id || ''
                          }
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-800"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.urduName})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <input
                            type="number"
                            min="0.1"
                            step="0.5"
                            value={row.quantity}
                            onChange={(e) =>
                              handleQtyChange(index, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-1.5 py-1 border border-slate-300 rounded text-right font-bold"
                          />
                          <span className="text-[10px] text-slate-500 font-sans">{row.unit}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          min="1"
                          value={row.rate}
                          onChange={(e) =>
                            handleRateChange(index, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-1.5 py-1 border border-slate-300 rounded text-right font-bold"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-black text-slate-900">
                        PKR {row.subtotal.toLocaleString()}
                      </td>
                      <td className="py-2 px-1 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                بل تفصیل (Memo / Voucher Description):
              </label>
              <input
                type="text"
                placeholder="مثلاً چاول اور دال کی ڈلیوری"
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                حوالہ / وصول کنندہ (Brought by / Reference):
              </label>
              <input
                type="text"
                placeholder="مثلاً شاپ بوائے آصف لے گیا"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:border-emerald-600 text-slate-900"
              />
            </div>
          </div>

          {/* Running Balance Calculation Banner */}
          <div className="bg-emerald-950 text-white p-3.5 rounded-xl font-mono-num flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] text-emerald-300 font-sans block">نئی خریداری رقم (This Bill):</span>
              <span className="text-lg font-black text-emerald-300">+ PKR {totalAmount.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 font-sans block">کل نیا بقایا (New Total Balance):</span>
              <span className="text-xl font-black text-amber-300">
                PKR {newBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
            >
              منسوخ کریں (Cancel)
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer flex items-center space-x-1.5"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>کھاتے میں شامل کریں (Add to Udhar Khata)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
