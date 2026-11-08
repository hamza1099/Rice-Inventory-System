import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const LockScreenModal: React.FC = () => {
  const { isTerminalLocked, setIsTerminalLocked } = usePos();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isTerminalLocked) return null;

  const handleUnlock = () => {
    if (pin === '9921' || pin === '1234' || pin.length === 4) {
      setIsTerminalLocked(false);
      setPin('');
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN! Try 9921 or 1234');
      setPin('');
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        if (nextPin === '9921' || nextPin === '1234' || nextPin.length === 4) {
          setIsTerminalLocked(false);
          setPin('');
          setErrorMsg('');
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Terminal Locked
          </h2>
          <p className="urdu-text text-xs text-emerald-900 font-bold" dir="rtl">
            بخاری رائس ٹریڈرز - کاؤنٹر لاک
          </p>
          <p className="text-[11px] text-slate-500 mt-1 font-mono-num">
            Terminal #01 • Cashier: S. Bukhari
          </p>
        </div>

        {/* PIN Display */}
        <div className="py-2">
          <div className="flex justify-center space-x-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-emerald-700 border-emerald-700 scale-110'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            ))}
          </div>
          {errorMsg && (
            <p className="text-[11px] text-red-600 font-bold mt-2 animate-bounce">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 font-mono text-base font-bold">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 transition-all font-mono-num cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => setPin('')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 transition-all font-mono-num cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleUnlock}
            className="py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1"
          >
            <Unlock className="w-4 h-4" />
            <span>Enter</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400">
          Enter 4-digit Cashier or Supervisor PIN (Default: 9921)
        </p>
      </div>
    </div>
  );
};
