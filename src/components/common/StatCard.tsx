import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface StatCardProps {
  title: string;
  urduTitle?: string;
  value: string | number;
  subValue?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'red';
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  urduTitle,
  value,
  subValue,
  badge,
  badgeColor = 'emerald',
  icon: Icon,
  iconBg = 'bg-emerald-50',
  iconColor = 'text-emerald-700',
  compact = false
}) => {
  const { language } = usePos();
  const badgeClasses = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  }[badgeColor];

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg shadow-xs relative flex flex-col justify-between hover:border-slate-300 transition-all ${
        compact ? 'p-2' : 'p-3'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            {language === 'ur' ? (
              <span className={`urdu-text font-bold text-slate-700 !leading-none ${compact ? 'text-[11px]' : 'text-[12px]'}`} dir="rtl">
                {urduTitle || title}
              </span>
            ) : (
              <span className={`font-bold text-slate-500 uppercase tracking-tight ${compact ? 'text-[10px]' : 'text-[11px]'}`}>
                {title}
              </span>
            )}
          </div>
          <div className={`flex items-baseline space-x-2 ${compact ? 'mt-0.5' : 'mt-1'}`}>
            <span className={`font-black text-slate-900 tracking-tight font-mono-num ${compact ? 'text-base' : 'text-xl font-extrabold'}`}>
              {value}
            </span>
            {badge && (
              <span className={`font-bold rounded border ${compact ? 'text-[9px] px-1 py-0.2' : 'text-[10px] px-1.5 py-0.5'} ${badgeClasses}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`rounded-md shrink-0 ${compact ? 'p-1.5' : 'p-2'} ${iconBg} ${iconColor}`}>
            <Icon className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </div>
        )}
      </div>

      {subValue && (
        <div className={`border-t border-slate-100 text-slate-500 font-medium flex items-center justify-between ${compact ? 'mt-1 pt-1 text-[9.5px]' : 'mt-2 pt-2 text-[10px]'}`}>
          <span className="truncate">{subValue}</span>
        </div>
      )}
    </div>
  );
};
