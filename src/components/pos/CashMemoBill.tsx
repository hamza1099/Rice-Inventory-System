import React, { useState } from 'react';
import { Trash2, Printer, CreditCard, Banknote, User } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const CashMemoBill: React.FC = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    spotDiscount,
    setSpotDiscount,
    paymentMode,
    setPaymentMode,
    cashReceived,
    setCashReceived,
    completeSale
  } = usePos();

  const [customerType, setCustomerType] = useState<string>('Spot Customer');

  const grossSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalNetKg = cart.reduce((sum, item) => sum + item.netWeight, 0);
  const totalPayable = Math.max(0, grossSubtotal - spotDiscount);
  const changeDue = Math.max(0, cashReceived - totalPayable);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty! Add products first.');
      return;
    }
    completeSale();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col justify-between h-full text-xs">
      {/* Memo Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-black text-slate-900 tracking-tight font-mono-num">
              Cash Memo #1085
            </span>
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <User className="w-2.5 h-2.5" />
              <span>{customerType} •</span>
            </span>
          </div>
          <button
            onClick={clearCart}
            title="Clear all rows"
            className="text-[10px] text-red-600 hover:text-red-800 font-bold hover:underline"
          >
            Clear Bill [DEL]
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono-num">
          <span>24 Oct 2024 • 14:32</span>
          <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
            SPOT CASH / RAAST ONLY
          </span>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 overflow-y-auto max-h-[300px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase sticky top-0 border-b border-slate-200">
            <tr>
              <th className="py-2 px-3">Item Description</th>
              <th className="py-2 px-2 text-right">Rate</th>
              <th className="py-2 px-2 text-right">Net Wt/Qty</th>
              <th className="py-2 px-3 text-right">Amount (PKR)</th>
              <th className="py-2 px-1 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono-num">
            {cart.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <p className="font-sans text-xs">No items added to current memo.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click "Weigh & Add" on any variety.</p>
                </td>
              </tr>
            ) : (
              cart.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3">
                    <span className="font-bold text-slate-900 block leading-tight font-sans">
                      {item.product.name}
                    </span>
                    <span className="urdu-text text-[10px] text-slate-500 block leading-none font-sans" dir="rtl">
                      {item.product.urduName}
                    </span>
                    {item.tareWeight > 0 && (
                      <span className="text-[9px] text-slate-400 block font-sans">
                        Tare: -{item.tareWeight.toFixed(2)} kg ({item.tareName})
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-700 font-medium">
                    {item.ratePerKg}
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-900">
                    {item.netWeight.toFixed(2)} kg
                  </td>
                  <td className="py-2 px-3 text-right font-extrabold text-slate-900">
                    {Math.round(item.subtotal).toLocaleString()}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                      title="Void row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bill Calculation & Tender Box */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2.5">
        {/* Calculations */}
        <div className="space-y-1 font-mono-num text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Gross Subtotal ({totalNetKg.toFixed(2)} KG):</span>
            <span className="font-bold text-slate-800">PKR {Math.round(grossSubtotal).toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-amber-800">
            <span className="flex items-center gap-1 font-sans text-[11px]">
              Mandi Spot Rounding / Discount:
            </span>
            <div className="flex items-center space-x-1">
              <span>- PKR</span>
              <input
                type="number"
                value={spotDiscount}
                onChange={(e) => setSpotDiscount(parseFloat(e.target.value) || 0)}
                className="w-16 bg-white border border-amber-300 rounded px-1.5 py-0.5 text-right font-bold text-amber-900 focus:outline-hidden text-xs"
              />
            </div>
          </div>

          <div className="flex items-baseline justify-between border-t border-slate-200 pt-2 text-slate-900">
            <span className="font-extrabold uppercase tracking-tight text-xs font-sans">
              TOTAL PAYABLE:
            </span>
            <span className="text-2xl font-black text-emerald-800 tracking-tight">
              PKR {Math.round(totalPayable).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Channels (Spot Cash / Raast) */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Payment Channel (NO CREDIT ALLOWED):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPaymentMode('SPOT CASH')}
              className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                paymentMode === 'SPOT CASH'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>Spot Cash [F8]</span>
            </button>
            <button
              onClick={() => setPaymentMode('RAAST ONLINE')}
              className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                paymentMode === 'RAAST ONLINE'
                  ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>RAAST / Online [F7]</span>
            </button>
          </div>
        </div>

        {/* Cash Tender & Change Due */}
        <div className="grid grid-cols-2 gap-2 font-mono-num bg-white p-2 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">Cash Received (PKR):</span>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
              className="w-full text-base font-black px-2 py-1 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-hidden focus:border-emerald-600 mt-0.5"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-sans">Change Due (بقایا رقم):</span>
            <div className="text-base font-black text-amber-700 mt-1.5">
              PKR {Math.round(changeDue).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Big Complete Sale CTA */}
        <button
          onClick={handleCheckout}
          className="w-full py-3 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-md transition-all uppercase tracking-wide cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>
            Complete Sale & Print Receipt [ENTER] - PKR {Math.round(totalPayable).toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
};
