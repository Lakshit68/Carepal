import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export default function TrendChart({ trends = [] }) {
  const [metricView, setMetricView] = useState('overall'); // 'overall', 'pillars', 'nps'

  // Format data for display
  const chartData = trends.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    })
  }));

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center py-12">
        <p className="text-sm text-slate-400">No trend data available for selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Care Quality Trend Over Time</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily tracking of ratings, category pillars, and NPS progression
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMetricView('overall')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricView === 'overall'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overall Rating
          </button>
          <button
            onClick={() => setMetricView('pillars')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricView === 'pillars'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4 Pillars
          </button>
          <button
            onClick={() => setMetricView('nps')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricView === 'nps'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NPS Trend
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricView === 'overall' && (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
                formatter={(val) => [`${val} ★`, 'Avg Rating']}
              />
              <Area type="monotone" dataKey="avg_rating" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorOverall)" name="Average Rating" />
            </AreaChart>
          )}

          {metricView === 'pillars' && (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="avg_punctuality" stroke="#3b82f6" strokeWidth={2} dot={false} name="Punctuality" />
              <Line type="monotone" dataKey="avg_care_quality" stroke="#10b981" strokeWidth={2} dot={false} name="Care Quality" />
              <Line type="monotone" dataKey="avg_hygiene" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Hygiene" />
              <Line type="monotone" dataKey="avg_behaviour" stroke="#f59e0b" strokeWidth={2} dot={false} name="Behaviour" />
            </LineChart>
          )}

          {metricView === 'nps' && (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[-100, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px'
                }}
                formatter={(val) => [`${val > 0 ? '+' : ''}${val}`, 'NPS']}
              />
              <Area type="monotone" dataKey="nps_trend" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNps)" name="Net Promoter Score" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
