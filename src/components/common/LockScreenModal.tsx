import React, { useState } from 'react';
import { Lock, Unlock, Mail, Eye, EyeOff, User } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const LockScreenModal: React.FC = () => {
  const { isTerminalLocked, setIsTerminalLocked } = usePos();
  const [email, setEmail] = useState<string>('s.bukhari@bukharirice.com');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isTerminalLocked) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter password.');
      return;
    }

    // Success login
    setIsTerminalLocked(false);
    setPassword('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Top Avatar Icon */}
        <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div className="text-center">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Terminal Locked
          </h2>
          <p className="urdu-text text-xs text-emerald-900 font-bold" dir="rtl">
            بخاری رائس ٹریڈرز - کاؤنٹر لاگ ان
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Please sign in with your email and password to resume.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-center font-bold text-[11px]">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>Login Email (ای میل ایڈریس):</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="s.bukhari@bukharirice.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Password (پاس ورڈ):</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-hidden font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer mt-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Terminal (لاگ ان کریں)</span>
          </button>
        </form>

        {/* Quick Accounts Hint */}
        <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400">
          <span>Active Session: </span>
          <strong className="text-slate-600">S. Bukhari (Terminal #01)</strong>
        </div>
      </div>
    </div>
  );
};
