import React from 'react';
import { DollarSign, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const SystemSalesSummary: React.FC = () => {
  const { openingFloat } = usePos();

  const spotCashCollected = 112000;
  const onlineRaastTransfers = 36250;
  const expectedDrawerCash = openingFloat + spotCashCollected;
  const totalGrossBusiness = spotCashCollected + onlineRaastTransfers;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5 text-xs">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
        <DollarSign className="w-4 h-4 text-emerald-700" />
        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
          System Sales & Expected Cash
        </h3>
        <span className="urdu-text text-xs text-slate-500 font-semibold" dir="rtl">
          (حسابات سسٹم)
        </span>
      </div>

      {/* Figures Breakdown */}
      <div className="space-y-2 font-mono-num">
        <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-800 font-sans block">
              Starting Cash Float:
            </span>
            <span className="urdu-text text-[10px] text-slate-500 font-sans block leading-none" dir="rtl">
              صبح کی اوپننگ رقم (کاؤنٹر فلوٹ)
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-extrabold text-slate-900">
              PKR {openingFloat.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-sans block">Opening Session</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-emerald-900 font-sans block">
              Spot Cash Collected:
            </span>
            <span className="urdu-text text-[10px] text-emerald-700 font-sans block leading-none" dir="rtl">
              کاؤنٹر نقد وصولی (براہ راست کیش)
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-extrabold text-emerald-800">
              PKR {spotCashCollected.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-sans block">In Drawer • 68 Memos</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-blue-900 font-sans block">
              Online / RAAST Transfers:
            </span>
            <span className="urdu-text text-[10px] text-blue-700 font-sans block leading-none" dir="rtl">
              آن لائن و راست ٹرانسفر (بینک کلیئرڈ)
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-extrabold text-blue-800">
              PKR {onlineRaastTransfers.toLocaleString()}
            </span>
            <span className="text-[10px] text-blue-600 font-sans block">16 Trans • Verified Instant</span>
          </div>
        </div>

        {/* Spot Only Tag */}
        <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-600 font-sans">
          <span className="flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Spot Only Policy Enforced
          </span>
          <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
            CREDIT / ادھار: PKR 0
          </span>
        </div>
      </div>

      {/* Expected Physical Drawer Cash Box (Highlighted green banner from Image 5) */}
      <div className="bg-emerald-50 border-2 border-emerald-600 rounded-lg p-3 text-emerald-950 font-mono-num">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase block font-sans tracking-tight">
              Expected Physical Drawer Cash
            </span>
            <span className="text-[10px] text-emerald-700 font-sans">
              (Float + Counter Cash Memos)
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-900 tracking-tight">
              PKR {expectedDrawerCash.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Total Gross Business Done */}
      <div className="flex items-center justify-between p-2 rounded bg-slate-100 border border-slate-200 font-mono-num">
        <span className="text-xs font-bold text-slate-700 font-sans">
          TOTAL GROSS BUSINESS DONE:
        </span>
        <span className="text-sm font-black text-slate-900">
          PKR {totalGrossBusiness.toLocaleString()}
        </span>
      </div>

      {/* Digital Settlement Audit */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center space-x-1.5">
          <QrCode className="w-4 h-4 text-slate-600" />
          <div>
            <span className="font-bold text-slate-800 block">Digital Settlement Audit</span>
            <span className="text-[10px] text-slate-500 font-mono">Raast QR Ref: #LHR-RAAST-0821-X</span>
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-emerald-600" />
          16/16 Cleared
        </span>
      </div>
    </div>
  );
};
