import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Award,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Check
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { RouteName } from '../routes/RouteName';
import { notifySuccess, notifyError, notifyInfo } from '../utils/toast';

// Assets placed by user in src/assets
import logoImg from '../assets/logo.jpg';
import loginBg from '../assets/login background.jpg';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setIsTerminalLocked } = usePos();

  const [email, setEmail] = useState<string>('trade.partner@gulfcommodities.ae');
  const [password, setPassword] = useState<string>('••••••••••••••');
  const [actualPassword, setActualPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setActualPassword(val);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      notifyError('Please enter a valid email address (درست ای میل درج کریں)');
      return;
    }
    if (!actualPassword.trim()) {
      notifyError('Please enter your password (پاس ورڈ درج کریں)');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsTerminalLocked(false);
      notifySuccess('Terminal access authorized! Welcome to Bukhari Rice Traders.');
      navigate(RouteName.POS_COUNTER);
    }, 400);
  };

  const handleForgotPassword = () => {
    notifyInfo('Please contact Terminal Supervisor (Haji Bilal Bukhari: 0301-4421882) or Trade Desk to reset credentials.');
  };

  return (
    <div className="min-h-screen bg-[#eef1f5] p-3 sm:p-6 md:p-8 flex items-center justify-center font-sans antialiased select-none">
      {/* Outer Framed Canvas matching exact design in screenshot */}
      <div className="w-full max-w-6xl bg-white/95 rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col justify-between min-h-[92vh] p-5 sm:p-8 md:p-10 relative backdrop-blur-sm">
        
        {/* Top Header Row inside the Frame */}
        <header className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          {/* Left Brand with Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-emerald-900/30 bg-[#0c3c2b] flex items-center justify-center shadow-xs shrink-0">
              <img
                src={logoImg}
                alt="Bukhari Rice Traders Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Bukhari Rice Traders
              </span>
              <span className="text-slate-300 font-light text-base">|</span>
              <span className="urdu-text text-xs sm:text-sm text-emerald-900 font-bold" dir="rtl">
                بخاری رائس ٹریڈرز
              </span>
            </div>
          </div>

          {/* Right: Terminal Access Gateway Badge */}
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
            <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-slate-600 stroke-[3]" />
            </div>
            <span className="hidden sm:inline text-slate-600 font-medium text-[11px]">
              Terminal Access Gateway
            </span>
          </div>
        </header>

        {/* Main Content Area: 2-Column Exact Layout */}
        <main className="my-auto py-6 flex items-center justify-center">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* LEFT COLUMN: Green Hero Card (Harvest Lot & Brand Showcase) */}
            <div
              className="lg:col-span-6 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between border border-emerald-700/50 min-h-[500px]"
              style={{
                backgroundImage: `url("${loginBg}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Deep Emerald Gradient Overlay to match screenshot color and texture */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0c3e2d]/94 via-[#083324]/92 to-[#042016]/98 z-0"></div>

              {/* Foreground content on top of background */}
              <div className="relative z-10 space-y-4">
                {/* Harvest Lot Pill Badge */}
                <div>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-mono tracking-widest text-white/95 uppercase shadow-inner">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>HARVEST LOT #BRT-2024-EXP</span>
                  </span>
                </div>

                {/* Urdu Main Title */}
                <div className="pt-2">
                  <h1 className="urdu-text text-3xl sm:text-4xl font-black text-white tracking-wide leading-tight drop-shadow-sm" dir="rtl">
                    بخاری رائس ٹریڈرز
                  </h1>
                  <h2 className="text-xs sm:text-sm font-bold text-white/95 tracking-wide mt-1">
                    Bukhari Rice Traders • Est. 1988
                  </h2>
                  <p className="text-[11px] sm:text-xs text-white/75 leading-relaxed mt-2 font-normal max-w-md">
                    Leading exporters of authenticated Super Kernel & 1121 Steam Basmati consignments directly from the fertile Indus floodplains.
                  </p>
                </div>

                {/* Physical Spec Certificate Glass Card */}
                <div className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 shadow-lg space-y-2.5 mt-5">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-bold text-white tracking-wide">
                      Physical Spec Certificate
                    </span>
                  </div>

                  <p className="text-[10.5px] sm:text-[11px] italic text-white/80 leading-relaxed">
                    &ldquo;Supplying nature's unmatched aroma, average cooked grain elongation exceeding 8.35mm, strictly aged 18+ months.&rdquo;
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-wider font-bold text-amber-300 uppercase">
                    <span>LOT VARIETY: SUPER KERNEL</span>
                    <span>MOISTURE: &le; 11.8%</span>
                  </div>
                </div>
              </div>

              {/* Bottom 3 Stat Boxes Grid */}
              <div className="relative z-10 grid grid-cols-3 gap-3 pt-6">
                <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center shadow-inner">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight leading-none">
                    40+
                  </div>
                  <div className="text-[9px] text-white/75 font-semibold uppercase tracking-wider mt-1.5">
                    Global Dest.
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center shadow-inner">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight leading-none">
                    100%
                  </div>
                  <div className="text-[9px] text-white/75 font-semibold uppercase tracking-wider mt-1.5">
                    Pure Basmati
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center shadow-inner">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight leading-none">
                    ISO
                  </div>
                  <div className="text-[9px] text-white/75 font-semibold uppercase tracking-wider mt-1.5">
                    & Halal Audit
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Terminal Access Form Card */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-7 sm:p-9 flex flex-col justify-between">
                
                {/* Form Top Title Row */}
                <div className="flex items-start justify-between pb-2">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      Terminal Access
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      Sign in to access export orders, consignments, and mill dispatches.
                    </p>
                  </div>
                  <span className="urdu-text text-xl font-black text-amber-800 shrink-0 ml-2" dir="rtl">
                    لاگ ان
                  </span>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  {/* Email Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Email or Trader ID
                      </label>
                      <span className="urdu-text text-[11px] font-bold text-slate-400" dir="rtl">
                        ای میل
                      </span>
                    </div>
                    <div className="relative flex items-center bg-[#f0f4f9] rounded-xl border border-slate-200/90 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                      <div className="pl-3.5 pr-1.5 text-slate-400 pointer-events-none">
                        <AtSign className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="trade.partner@gulfcommodities.ae"
                        className="w-full py-3 pr-4 text-xs font-medium text-slate-800 bg-transparent focus:outline-hidden placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <span className="urdu-text text-[11px] font-bold text-slate-400" dir="rtl">
                        پاس ورڈ
                      </span>
                    </div>
                    <div className="relative flex items-center bg-[#f0f4f9] rounded-xl border border-slate-200/90 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all">
                      <div className="pl-3.5 pr-1.5 text-slate-400 pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••••••••"
                        className="w-full py-3 pr-10 text-xs font-medium text-slate-800 bg-transparent focus:outline-hidden tracking-wider"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password Row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 accent-emerald-800 cursor-pointer"
                      />
                      <span className="text-slate-700 font-semibold text-xs">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-bold text-slate-700 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0d4734] hover:bg-[#083526] active:scale-98 text-white py-3.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <LogIn className="w-4 h-4 text-white shrink-0" />
                      <span>Sign In • لاگ ان کریں</span>
                    </button>
                  </div>
                </form>

                {/* Bottom Support Text */}
                <div className="mt-8 text-center text-[11px] text-slate-500 font-medium">
                  Need support?{' '}
                  <span className="text-slate-800 font-bold hover:underline cursor-pointer">
                    Contact Trade Desk (+92 042 3578-RICE)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Footer info (subtle, non-intrusive) */}
        <footer className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100 shrink-0">
          Bukhari Rice Traders (بخاری رائس ٹریڈرز) • Secure Terminal Access Gateway • Ver 2.4.0
        </footer>

      </div>
    </div>
  );
};

export default LoginScreen;
