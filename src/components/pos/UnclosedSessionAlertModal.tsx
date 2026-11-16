import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, ArrowRight, RefreshCw, Calendar, Banknote } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { RouteName } from '../../routes/RouteName';

export const UnclosedSessionAlertModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isUnclosedModalOpen,
    setIsUnclosedModalOpen,
    drawerOpenedAt,
    openingFloat,
    closeDrawer,
    startNewDay,
    language
  } = usePos();

  if (!isUnclosedModalOpen) return null;

  const isUr = language === 'ur';

  // Format date of unclosed session
  let formattedDate = 'Previous Session';
  let formattedTime = '';
  if (drawerOpenedAt) {
    try {
      const d = new Date(drawerOpenedAt);
      formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      formattedTime = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (_) {}
  }

  const handleGoToDayEnd = () => {
    setIsUnclosedModalOpen(false);
    navigate(RouteName.DAY_END);
  };

  const handleAutoSealAndStartFresh = () => {
    closeDrawer();
    startNewDay();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-amber-300 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">
              {isUr ? 'گزشتہ سیشن بند نہیں کیا گیا!' : 'Previous Session Unclosed!'}
            </h2>
            <p className="text-[11px] text-amber-100 font-medium">
              {isUr ? 'پہلے پچھلے دن کا حساب کلوز کرنا لازمی ہے' : 'Previous day shift must be closed first'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Unclosed Session Info Card */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center space-x-1.5 font-bold text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>{isUr ? 'اوپننگ تاریخ و وقت:' : 'Opened Date & Time:'}</span>
              </span>
              <span className="font-mono font-bold text-slate-900">
                {formattedDate} {formattedTime ? `• ${formattedTime}` : ''}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-700 pt-1.5 border-t border-amber-200/60">
              <span className="flex items-center space-x-1.5 font-bold text-[11px]">
                <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isUr ? 'سابقہ اوپننگ گلہ (Float):' : 'Previous Opening Float:'}</span>
              </span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                PKR {openingFloat.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="text-[11.5px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            <p className="font-medium">
              {isUr
                ? 'پچھلی تاریخ کا کاؤنٹر رجسٹر کلوز کیے بغیر نیا دن شروع نہیں کیا جا سکتا۔ برائے مہربانی پہلے پچھلے سیشن کا Day-End Closing فائنل کریں تاکہ کیش کا حساب اور Z-Report بالکل درست رہے۔'
                : 'A new business day cannot be started while a previous session is still open. Please complete the Day-End Closing for the previous session first to ensure accurate cash reconciliation and Z-Report audit.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleGoToDayEnd}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <span>{isUr ? 'Day-End کلوزنگ پر جائیں' : 'Go to Day-End Closing'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleAutoSealAndStartFresh}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{isUr ? 'سابقہ سیشن فوراً سیل کریں اور نیا دن شروع کریں' : 'Auto-Seal & Start Fresh Day'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
