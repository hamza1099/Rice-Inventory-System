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
    <div
      className="h-screen w-screen overflow-hidden relative flex flex-col font-sans antialiased select-none"
      style={{
        backgroundImage: `url("${loginBg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark vignette overlay covering the whole screen background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-emerald-950/40 to-black/75 backdrop-blur-[2px] z-0"></div>

      {/* Top Navbar Header spanning full width */}
      <header className="relative z-10 w-full px-6 sm:px-10 lg:px-14 py-3 bg-black/40 backdrop-blur-md border-b border-[#c5a059]/40 flex items-center justify-between shrink-0 shadow-md">
        {/* Left: Brand with Logo in rounded white box */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 shadow-sm shrink-0 border border-white/60">
            <img
              src={logoImg}
              alt="Bukhari Rice Traders"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Bukhari Rice Traders
            </span>
            <span className="text-amber-400/60 font-light text-base">|</span>
            <span className="urdu-text text-xs sm:text-sm text-amber-100 font-semibold !leading-none" dir="rtl">
              بخاری رائس ٹریڈرز
            </span>
          </div>
        </div>
      </header>

      {/* Main Viewport: Centered 2-Column Exact Layout */}
      <main className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[1180px] flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-8 my-auto">
          
          {/* LEFT COLUMN: Deep Emerald Card with Neon Halo Glow */}
          <div className="flex-1 w-full bg-gradient-to-b from-[#0c3123] via-[#09261b] to-[#04150e] rounded-3xl p-6 sm:p-8 lg:p-8 text-white relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.22)] border border-emerald-500/40 flex flex-col justify-between">
            {/* Subtle inner background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_60%)] pointer-events-none"></div>

            {/* Top & Middle Content */}
            <div className="relative z-10 space-y-3.5">
              {/* Harvest Lot Pill */}
              <div>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/40 text-[10px] font-mono tracking-wider text-amber-300 uppercase shadow-inner">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>HARVEST LOT #BRT-2024-EXP</span>
                </span>
              </div>

              {/* Urdu Big Calligraphy Heading */}
              <div className="pt-1">
                <h1 className="urdu-text text-4xl sm:text-5xl lg:text-[52px] font-black text-white tracking-wide !leading-tight drop-shadow-md text-right" dir="rtl">
                  بخاری رائس ٹریڈرز
                </h1>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide mt-1.5">
                  Bukhari Rice Traders • Est. 1988
                </h2>
                <p className="text-xs text-emerald-100/80 leading-relaxed mt-2 font-normal max-w-lg">
                  Leading exporters of authenticated Super Kernel & 1121 Steam Basmati consignments directly from the fertile Indus floodplains.
                </p>
              </div>

              {/* Physical Spec Certificate Glass Card */}
              <div className="bg-black/30 backdrop-blur-md border border-amber-400/30 rounded-2xl p-4 shadow-lg space-y-2 mt-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-200 tracking-wide">
                    Physical Spec Certificate
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs italic text-white/90 leading-relaxed">
                  &ldquo;Supplying nature's unmatched aroma, average cooked grain elongation exceeding 8.35mm, strictly aged 18+ months.&rdquo;
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono tracking-wider font-bold text-amber-400 uppercase">
                  <span>LOT VARIETY: SUPER KERNEL</span>
                  <span>MOISTURE: &le; 11.8%</span>
                </div>
              </div>
            </div>

            {/* Bottom 3 Stat Boxes Grid - Light 3D Glossy Cards with Golden Metallic Numbers */}
            <div className="relative z-10 grid grid-cols-3 gap-3 pt-5">
              {/* Stat 1 */}
              <div className="bg-gradient-to-b from-[#fbfcfd] to-[#e4e7eb] rounded-2xl p-3 text-center shadow-md border border-white/80">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent font-mono tracking-tight leading-none drop-shadow-xs">
                  40+
                </div>
                <div className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider mt-1.5">
                  Global Dest.
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-gradient-to-b from-[#fbfcfd] to-[#e4e7eb] rounded-2xl p-3 text-center shadow-md border border-white/80">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent font-mono tracking-tight leading-none drop-shadow-xs">
                  100%
                </div>
                <div className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider mt-1.5">
                  Pure Basmati
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-gradient-to-b from-[#fbfcfd] to-[#e4e7eb] rounded-2xl p-3 text-center shadow-md border border-white/80">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent font-mono tracking-tight leading-none drop-shadow-xs">
                  ISO
                </div>
                <div className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider mt-1.5">
                  & Halal Audit
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Terminal Access White Frosted Card */}
          <div className="w-full lg:w-[450px] shrink-0 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/90 p-7 sm:p-8 flex flex-col justify-between">
            
            {/* Card Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    Terminal Access
                  </h2>
                  <p className="text-xs text-slate-500 mt-2 leading-normal">
                    Sign in to access export orders, consignments, and mill dispatches.
                  </p>
                </div>
                <span className="urdu-text text-3xl sm:text-4xl font-black text-[#9c591e] shrink-0 !leading-none select-none" dir="rtl">
                  لاگ ان
                </span>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                {/* Email Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Email or Trader ID
                    </label>
                    <span className="urdu-text text-xs font-bold text-slate-400 !leading-none" dir="rtl">
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
                      className="w-full py-3 pr-3 text-xs sm:text-sm font-medium text-slate-800 bg-transparent focus:outline-hidden placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <span className="urdu-text text-xs font-bold text-slate-400 !leading-none" dir="rtl">
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
                      className="w-full py-3 pr-10 text-xs sm:text-sm font-medium text-slate-800 bg-transparent focus:outline-hidden tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1 transition-colors"
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
                      className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 border-slate-300 accent-[#0b4330] cursor-pointer"
                    />
                    <span className="text-slate-700 font-semibold">Remember me</span>
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
                    className="w-full bg-gradient-to-r from-[#0c3c2b] via-[#093223] to-[#07281c] hover:from-[#093022] hover:to-[#052017] active:scale-98 text-white py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-lg border border-emerald-500/40 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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
                Contact Trade Desk (+92 042 3578-RICE)
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LoginScreen;
