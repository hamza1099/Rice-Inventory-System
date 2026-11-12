import React from 'react';
import { Lock, Printer, CheckCircle2, ShieldAlert } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning, notifyInfo } from '../../utils/toast';

export const HandoverAuthCard: React.FC = () => {
  const {
    supervisorPin,
    setSupervisorPin,
    handoverNotes,
    setHandoverNotes,
    finalizeDayEnd,
    isDayClosed,
    language
  } = usePos();
  const isUr = language === 'ur';

  const handleFinalize = () => {
    if (supervisorPin.length < 4) {
      notifyWarning(isUr ? 'برائے مہربانی 4 ہندسوں کا درست ایڈمن پاس ورڈ درج کریں' : 'Please enter valid 4-digit admin password/code.');
      return;
    }
    const success = finalizeDayEnd();
    if (success) {
      notifySuccess(isUr ? 'دن کا اختتام کامیابی سے فائنل ہو گیا!' : 'Z-Report generated successfully! Day-End Register has been sealed and locked for handover.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
            {isUr ? 'اختتامِ شفٹ اور کیش ہینڈ اوور' : 'Closing Authorization & Handover Protocol'}
          </h3>
        </div>
        <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          {isUr ? 'فائنل تصدیق کے بعد شفٹ مستقل طور پر بند ہو جائے گی' : 'Shift will be permanently sealed upon final confirmation'}
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Admin Password */}
        <div className="col-span-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isUr ? 'ایڈمن پاس ورڈ:' : 'Admin Password:'}
          </label>
          <div className="relative">
            <input
              type="password"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              placeholder="Enter password"
              disabled={isDayClosed}
              className="w-full text-xs font-bold font-mono px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50"
            />
            <span className="absolute right-2.5 top-2 text-[10px] font-bold text-emerald-700">
              [OK]
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {isUr ? 'ایڈمن:' : 'Admin:'} <strong>bilal.bukhari@bukharirice.com</strong>
          </p>
        </div>

        {/* Handover Notes */}
        <div className="col-span-8">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">
            {isUr ? 'کیشیئر ریمارکس برائے گودام:' : 'Cashier Signature / Handover Notes:'}
          </label>
          <input
            type="text"
            value={handoverNotes}
            onChange={(e) => setHandoverNotes(e.target.value)}
            disabled={isDayClosed}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden bg-slate-50"
          />
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Digital signature auto-attached with terminal token: <strong>#01-SBUKHARI-OCT24</strong>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => notifyInfo("Printing Z-Report & Audit Slip to thermal printer...")}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Z-Report & Audit Slip [F5]</span>
          </button>
          <button
            onClick={() => notifySuccess("Kick pulse sent to cash drawer successfully!")}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
          >
            Test Drawer Eject
          </button>
        </div>

        <button
          onClick={handleFinalize}
          disabled={isDayClosed}
          className={`px-6 py-2.5 rounded-lg text-white font-extrabold text-xs flex items-center space-x-2 shadow-xs transition-all uppercase tracking-wider ${
            isDayClosed
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-800 hover:bg-emerald-900 active:scale-98 cursor-pointer'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isDayClosed ? (isUr ? 'شفٹ بند و رجسٹر مقفل' : 'Shift Sealed & Register Locked') : (isUr ? 'دن کا اختتام فائنل کریں [ENTER]' : 'Finalize Day-End & Lock Register [ENTER]')}</span>
        </button>
      </div>
    </div>
  );
};
