import React from 'react';

export default function KpiCard({
  title,
  value,
  subvalue,
  icon: Icon,
  badge,
  badgeColor = 'emerald',
  color = 'teal',
  children
}) {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-100',
      iconBg: 'bg-teal-100 text-teal-700'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-700'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100 text-amber-700'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-100',
      iconBg: 'bg-rose-100 text-rose-700'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-100 text-indigo-700'
    }
  };

  const scheme = colorMap[color] || colorMap.teal;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {badge && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              badgeColor === 'rose'
                ? 'bg-rose-100 text-rose-700'
                : badgeColor === 'amber'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {subvalue && <p className="text-xs text-slate-500 mt-1 font-medium">{subvalue}</p>}

      {children && <div className="mt-3 pt-3 border-t border-slate-100">{children}</div>}
    </div>
  );
}
