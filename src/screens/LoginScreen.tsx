import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Award,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';
import { usePos } from '../context/PosContext';
import { RouteName } from '../routes/RouteName';
import { notifySuccess, notifyError, notifyInfo } from '../utils/toast';

// User assets
import logoImg from '../assets/logo.jpg';
import loginBg from '../assets/login background.jpg';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setIsTerminalLocked, language } = usePos();
  const isUr = language === 'ur';

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
      notifyError(isUr ? 'براہ کرم درست ای میل درج کریں۔' : 'Please enter a valid email address.');
      return;
    }
    if (!actualPassword.trim()) {
      notifyError(isUr ? 'براہ کرم اپنا پاس ورڈ درج کریں۔' : 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsTerminalLocked(false);
      notifySuccess(
        isUr
          ? 'ٹرمینل میں خوش آمدید! بخاری رائس ٹریڈرز'
          : 'Terminal access authorized! Welcome to Bukhari Rice Traders.'
      );
      navigate(RouteName.POS_COUNTER);
    }, 400);
  };

  const handleForgotPassword = () => {
    notifyInfo(
      isUr
        ? 'پاس ورڈ ری سیٹ کے لیے سسٹم ایڈمن (0331-7726262) سے رابطہ کریں۔'
        : 'Please contact System Admin (0331-7726262) or Trade Desk to reset credentials.'
    );
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative flex flex-col font-sans antialiased select-none bg-[#111f17]">
      {/* 1. Heavy Artistic Blur Background Layer (Exact like Screenshot) */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-[14px] scale-110 z-0"
        style={{
          backgroundImage: `url("${loginBg}")`,
        }}
      />

      {/* 2. Soft Muted Olive-Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-black/40 bg-gradient-to-b from-black/55 via-emerald-950/30 to-black/65 z-0" />

      {/* 3. Top Navbar Header with Golden Divider Line (Exact like Screenshot) */}
      <header className="relative z-10 w-full px-6 sm:px-10 lg:px-12 py-2.5 bg-[#e4eae4]/85 backdrop-blur-md border-b-2 border-[#bfa268] flex items-center justify-between shrink-0 shadow-sm">
        {/* Left: Brand with Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 shadow-xs shrink-0 border border-slate-300">
            <img
              src={logoImg}
              alt="Bukhari Rice Traders"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-sm sm:text-base font-extrabold text-[#15291e] tracking-tight">
              Bukhari Rice Traders
            </span>
            <span className="text-[#a58b53] font-light text-base">|</span>
            <span className="urdu-text text-xs sm:text-sm text-[#234232] font-bold !leading-none" dir="rtl">
              بخاری رائس ٹریڈرز
            </span>
          </div>
        </div>
      </header>

      {/* 4. Main Viewport: Balanced Centered 2-Column Exact Cards Layout */}
      <main className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[1140px] flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 my-auto">
          
          {/* LEFT COLUMN: Deep Emerald Card with Neon Halo Glow */}
          <div className="flex-1 w-full bg-gradient-to-b from-[#0a2e20] via-[#07251a] to-[#04150e] rounded-3xl p-6 sm:p-7 lg:p-8 text-white relative overflow-hidden shadow-[0_0_40px_rgba(52,211,153,0.22)] border border-emerald-400/40 flex flex-col justify-between">
            {/* Subtle inner radial gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none"></div>

            {/* Top & Middle Content */}
            <div className="relative z-10 space-y-3">
              {/* Harvest Lot Pill with Golden Border */}
              <div>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#c4a563]/60 text-[10px] font-mono tracking-wider text-[#e6cb85] uppercase shadow-inner">
                  <MapPin className="w-3 h-3 text-[#d4af37] shrink-0" />
                  <span>HARVEST LOT #BRT-2024-EXP</span>
                </span>
              </div>

              {/* Urdu Big Calligraphy Heading */}
              <div className="pt-0.5">
                <h1 className="urdu-text text-4xl sm:text-5xl lg:text-[54px] font-black text-white tracking-wide !leading-tight drop-shadow-md text-right" dir="rtl">
                  بخاری رائس ٹریڈرز
                </h1>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide mt-1">
                  Bukhari Rice Traders • Est. 1988
                </h2>
                <p className="text-xs text-white/80 leading-relaxed mt-1.5 font-normal max-w-lg">
                  Leading exporters of authenticated Super Kernel & 1121 Steam Basmati consignments directly from the fertile Indus floodplains.
                </p>
              </div>

              {/* Physical Spec Certificate Glass Card with Golden Border */}
              <div className="bg-[#051a11]/60 backdrop-blur-md border border-[#c4a563]/40 rounded-2xl p-4 shadow-lg space-y-2 mt-2.5">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    Physical Spec Certificate
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs italic text-white/90 leading-relaxed">
                  &ldquo;Supplying nature's unmatched aroma, average cooked grain elongation exceeding 8.35mm, strictly aged 18+ months.&rdquo;
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-wider font-bold text-[#e6cb85] uppercase">
                  <span>LOT VARIETY: SUPER KERNEL</span>
                  <span>MOISTURE: &le; 11.8%</span>
                </div>
              </div>
            </div>

            {/* Bottom 3 Stat Boxes Grid - Light 3D Glossy Cards with Golden Metallic Numbers */}
            <div className="relative z-10 grid grid-cols-3 gap-3 pt-4">
              {/* Stat 1 */}
              <div className="bg-gradient-to-b from-[#f6f8f6] via-[#eaeeea] to-[#dce2dc] rounded-2xl p-3 text-center shadow-md border border-white/90">
                <div className="text-2xl sm:text-3xl font-black text-[#b8860b] font-mono tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
                  40+
                </div>
                <div className="text-[10px] text-slate-700 font-black uppercase tracking-wider mt-1.5">
                  Global Dest.
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-gradient-to-b from-[#f6f8f6] via-[#eaeeea] to-[#dce2dc] rounded-2xl p-3 text-center shadow-md border border-white/90">
                <div className="text-2xl sm:text-3xl font-black text-[#b8860b] font-mono tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
                  100%
                </div>
                <div className="text-[10px] text-slate-700 font-black uppercase tracking-wider mt-1.5">
                  Pure Basmati
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-gradient-to-b from-[#f6f8f6] via-[#eaeeea] to-[#dce2dc] rounded-2xl p-3 text-center shadow-md border border-white/90">
                <div className="text-2xl sm:text-3xl font-black text-[#b8860b] font-mono tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
                  ISO
                </div>
                <div className="text-[10px] text-slate-700 font-black uppercase tracking-wider mt-1.5">
                  & Halal Audit
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Terminal Access Frosted Sage-Silver Card (Exact Match) */}
          <div className="w-full lg:w-[440px] shrink-0 bg-gradient-to-b from-[#f3f7f3] via-[#e8eee8] to-[#dde4dd] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/90 p-7 sm:p-8 flex flex-col justify-between">
            
            {/* Card Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#15241b] tracking-tight leading-none">
                    Login
                  </h2>
                  <p className="text-xs text-slate-600 mt-2 leading-normal">
                    Sign in to access export orders, consignments, and mill dispatches.
                  </p>
                </div>
                <span className="urdu-text text-3xl sm:text-4xl font-black text-[#9a6728] shrink-0 !leading-none select-none drop-shadow-xs" dir="rtl">
                  لاگ ان
                </span>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Email or Trader ID
                    </label>
                    <span className="urdu-text text-xs font-bold text-slate-500 !leading-none" dir="rtl">
                      ای میل
                    </span>
                  </div>
                  <div className="relative flex items-center bg-[#dde5dd]/80 rounded-xl border border-slate-300/90 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all shadow-inner">
                    <div className="pl-3.5 pr-1.5 text-slate-500 pointer-events-none">
                      <AtSign className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="trade.partner@gulfcommodities.ae"
                      className="w-full py-3 pr-3 text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Password
                    </label>
                    <span className="urdu-text text-xs font-bold text-slate-500 !leading-none" dir="rtl">
                      پاس ورڈ
                    </span>
                  </div>
                  <div className="relative flex items-center bg-[#dde5dd]/80 rounded-xl border border-slate-300/90 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-700/20 transition-all shadow-inner">
                    <div className="pl-3.5 pr-1.5 text-slate-500 pointer-events-none">
                      <Lock className="w-4 h-4 text-slate-500" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••••••••"
                      className="w-full py-3 pr-10 text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-500 hover:text-slate-700 cursor-pointer p-1 transition-colors"
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
                      className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-400 accent-[#0b4330] cursor-pointer"
                    />
                    <span className="text-slate-800 font-semibold">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-bold text-slate-700 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button with subtle gold border & rich emerald gradient */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#0d3b2b] via-[#0f4432] to-[#1a4a32] hover:from-[#0a2e22] hover:to-[#143d28] active:scale-98 text-white py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg border border-emerald-500/50 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <LogIn className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>Sign In • لاگ ان کریں</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Support Text */}
            <div className="mt-6 text-center text-xs text-slate-500 font-medium">
              Need support?{' '}
              <span className="text-slate-800 font-bold hover:underline cursor-pointer">
                Contact Trade Desk (0331-7726262)
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
