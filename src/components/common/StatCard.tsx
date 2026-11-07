import React from 'react';
import type { LucideIcon } from 'lucide-react';

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
  iconColor = 'text-emerald-700'
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  }[badgeColor];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs relative flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
              {title}
            </span>
            {urduTitle && (
              <span className="urdu-text text-[11px] text-slate-400 font-semibold" dir="rtl">
                ({urduTitle})
              </span>
            )}
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono-num">
              {value}
            </span>
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeClasses}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={`p-2 rounded-md ${iconBg} ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {subValue && (
        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium flex items-center justify-between">
          <span>{subValue}</span>
        </div>
      )}
    </div>
  );
};
