import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PublicStatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  variant?: 'blue' | 'emerald' | 'amber' | 'slate';
}

export const PublicStatCard: React.FC<PublicStatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'blue'
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-700',
      valueColor: 'text-[#022C4F]',
      badgeColor: 'text-blue-700 bg-blue-50'
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-700',
      valueColor: 'text-emerald-950',
      badgeColor: 'text-emerald-700 bg-emerald-50'
    },
    amber: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-700',
      valueColor: 'text-amber-950',
      badgeColor: 'text-amber-700 bg-amber-50'
    },
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
      badgeColor: 'text-slate-700 bg-slate-100'
    }
  };

  const style = variantStyles[variant];

  return (
    <div className={`p-6 rounded-2xl border ${style.border} ${style.bg} shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.iconBg} shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${style.valueColor}`}>
          {value}
        </div>
        <p className="text-xs text-slate-500 mt-1.5 font-medium">
          {subtext}
        </p>
      </div>
    </div>
  );
};
