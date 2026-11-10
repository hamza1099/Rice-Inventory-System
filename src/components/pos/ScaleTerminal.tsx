import React, { useState } from 'react';
import { Scale, Lock, RefreshCw, CheckCircle2, Plus } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const ScaleTerminal: React.FC = () => {
  const {
    products,
    addToCart,
    liveScaleWeight,
    setLiveScaleWeight,
    isScaleLocked,
    setIsScaleLocked,
    scaleTare,
    setScaleTare
  } = usePos();

  const [customUnit, setCustomUnit] = useState<'kg' | 'mund' | 'bag'>('kg');
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<string>(products[0]?.id || '');

  const quickPresets = [1, 2, 4.5, 5, 10, 25, 50];

  const handleAddDirect = () => {
    const prod = products.find((p) => p.id === selectedQuickProduct) || products[0];
    if (!prod) return;

    let netKg = liveScaleWeight;
    if (customUnit === 'mund') netKg = liveScaleWeight * 40;
    if (customUnit === 'bag') netKg = liveScaleWeight * 50;

    const subtotal = netKg * prod.ratePerKg;

    addToCart({
      id: `cart-${Date.now()}`,
      product: prod,
      mode: customUnit === 'bag' ? 'bags' : customUnit === 'mund' ? 'mund' : 'kg',
      grossWeight: netKg + scaleTare,
      tareWeight: scaleTare,
      tareName: scaleTare > 0 ? 'Scale Tare' : 'Zero Tare',
      netWeight: netKg,
      ratePerKg: prod.ratePerKg,
      subtotal
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs text-xs space-y-2.5">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Scale className="w-4 h-4 text-emerald-700" />
          <span className="font-extrabold text-[11px] text-slate-800 tracking-tight uppercase">
            Integrated Heavy Scale Terminal
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
            CALIBRATED & STABLE
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScaleTare(scaleTare === 0 ? 0.10 : 0)}
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors"
          >
            <span>TARE (تولہ/بوری) [T]</span>
          </button>
          <button
            onClick={() => setIsScaleLocked(!isScaleLocked)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded font-bold text-[10px] transition-colors ${
              isScaleLocked
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>HOLD WT [H]</span>
          </button>
        </div>
      </div>

      {/* Main Digital Scale Display & Manual Override */}
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Digital Readout */}
        <div className="col-span-5 bg-slate-950 text-emerald-400 p-2.5 rounded-lg border-2 border-slate-800 font-mono flex items-center justify-between shadow-inner">
          <div>
            <div className="flex items-center space-x-1.5 text-[9px] text-emerald-600 uppercase font-bold tracking-widest">
              <span>LIVE SENSOR WEIGHT</span>
              {isScaleLocked && (
                <span className="bg-emerald-900/60 text-emerald-300 px-1 rounded text-[8px]">
                  AUTO LOCK
                </span>
              )}
            </div>
            <div className="text-3xl font-black tracking-wider text-emerald-400 leading-none my-1">
              {String(liveScaleWeight.toFixed(2)).padStart(5, '0')}
              <span className="text-xs text-emerald-600 ml-1">KG</span>
            </div>
            <div className="text-[9px] text-slate-500">
              Tare: {scaleTare.toFixed(2)} kg • Platform #01
            </div>
          </div>
          <button
            title="Simulate Weight Change"
            onClick={() => setLiveScaleWeight(parseFloat((Math.random() * 20 + 2).toFixed(2)))}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-emerald-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Manual Weight & Fast Add */}
        <div className="col-span-7 space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                Target Grain:
              </span>
              <select
                value={selectedQuickProduct}
                onChange={(e) => setSelectedQuickProduct(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - PKR {p.ratePerKg} {p.unitLabel || '/kg'}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-28">
              <span className="text-[10px] text-slate-500 font-semibold block mb-0.5">
                Weight Entry:
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={liveScaleWeight}
                  onChange={(e) => setLiveScaleWeight(parseFloat(e.target.value) || 0)}
                  className="w-full font-mono-num font-bold text-xs bg-white border border-slate-300 rounded px-2 py-1 focus:outline-hidden focus:border-emerald-600"
                />
                <span className="absolute right-1.5 top-1 text-[10px] font-bold text-slate-400">
                  KG
                </span>
              </div>
            </div>
          </div>

          {/* Quick presets and Add to Bill CTA */}
          <div className="flex items-center justify-between gap-1 pt-1">
            <div className="flex items-center gap-1 flex-wrap">
              {quickPresets.map((wt) => (
                <button
                  key={wt}
                  onClick={() => setLiveScaleWeight(wt)}
                  className={`px-1.5 py-0.5 rounded font-mono-num text-[10px] font-bold border transition-colors ${
                    liveScaleWeight === wt
                      ? 'bg-emerald-800 text-white border-emerald-900'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {wt} {wt === 50 ? 'Bori' : 'kg'}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddDirect}
              className="bg-emerald-800 hover:bg-emerald-900 active:scale-98 text-white px-3 py-1.5 rounded font-bold text-xs flex items-center space-x-1 shadow-xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add To Bill [ENTER]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
