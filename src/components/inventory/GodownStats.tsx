import React from 'react';
import { Warehouse, Layers, Scale, CheckCircle2 } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export const GodownStats: React.FC = () => {
  const { language } = usePos();
  const isUr = language === 'ur';

  return (
    <div className="grid grid-cols-12 gap-3 text-xs">
      {/* Godown Bay A */}
      <div className="col-span-4 bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <Warehouse className="w-4 h-4 text-emerald-700" />
            <span>{isUr ? 'گودام چاول سٹاک' : 'Godown Bay A'}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono-num">
            78% CAPACITY
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono-num">
            <span className="text-slate-500">
              {isUr ? 'بوری گنجائش: 520 / 650' : 'Bori Occupancy: 520 / 650 Bags Max'}
            </span>
            <span className="font-bold text-emerald-800">78% FULL</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full w-[78%]"></div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 font-mono-num">
          <span>{isUr ? 'نمی: 11.2% (محفوظ)' : 'Moisture: 11.2% (Passed)'}</span>
          <span>{isUr ? 'سٹیک اونچائی: 8 بوریاں' : 'Stack Height: 8 Tiers Safe'}</span>
        </div>
      </div>

      {/* Counter Floor Stacks */}
      <div className="col-span-4 bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>{isUr ? 'سامنے اوپن ڈھیریاں' : 'Counter Floor Stacks'}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
            ACTIVE DECK
          </span>
        </div>

        <div className="flex items-baseline space-x-2 font-mono-num">
          <span className="text-xl font-black text-slate-900">45</span>
          <span className="text-[11px] text-slate-600 font-sans">
            {isUr ? 'ڈسپلے بوریاں' : 'Bags Display (Retail stacks)'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
          <span>{isUr ? 'فلور منشی: بشیر احمد' : 'Floor Attendant: Munshi Bashir'}</span>
          <span className="text-emerald-700 font-semibold">{isUr ? 'صفر نقصان' : 'Zero Spillage'}</span>
        </div>
      </div>

      {/* Munshi Scale Tare */}
      <div className="col-span-4 bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 font-bold text-slate-800">
            <Scale className="w-4 h-4 text-emerald-700" />
            <span>{isUr ? 'منشی تولہ کاٹ وزن' : 'Munshi Scale Tare'}</span>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            MANDI RULES
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-num bg-slate-50 p-1.5 rounded border border-slate-100">
          <div>
            <span className="text-slate-500 block">
              {isUr ? '25 کلو جوٹ بوری کاٹ:' : '25kg Jute Bori Tare:'}
            </span>
            <strong className="text-slate-900">-0.50 kg</strong>
          </div>
          <div>
            <span className="text-slate-500 block">
              {isUr ? 'پلاسٹک تھیلی کاٹ:' : 'Plastic PP Bag Tare:'}
            </span>
            <strong className="text-slate-900">-0.12 kg</strong>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
          <span>{isUr ? 'کنڈہ کیلیبریشن:' : 'Platform Scale Calibration:'}</span>
          <span className="text-emerald-700 font-bold inline-flex items-center">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            OK (Zero Error)
          </span>
        </div>
      </div>
    </div>
  );
};
