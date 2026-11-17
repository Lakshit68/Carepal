import React, { useState } from 'react';
import { Star, AlertTriangle, ShieldCheck, Clock, Smile, Award, Sparkles, Plus } from 'lucide-react';
import StarRating from '../common/StarRating';

export default function NurseLeaderboard({ nurses = [], onSelectNurseForLink }) {
  const [sortField, setSortField] = useState('avg_rating'); // 'avg_rating', 'total_feedback', 'low_score_alerts'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNurses = nurses
    .filter((n) => {
      const q = searchTerm.toLowerCase();
      return n.name.toLowerCase().includes(q) || n.specialization.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortField === 'avg_rating') return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortField === 'total_feedback') return (b.total_feedback || 0) - (a.total_feedback || 0);
      if (sortField === 'low_score_alerts') return (b.low_score_alerts || 0) - (a.low_score_alerts || 0);
      return 0;
    });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            Nurse Care Quality & Performance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Average ratings and 4-pillar quality breakdown per caregiver
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search nurse or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-48"
          />

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="avg_rating">Highest Rated</option>
            <option value="total_feedback">Most Visits</option>
            <option value="low_score_alerts">Most Alerts</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNurses.map((nurse) => {
          const rating = nurse.avg_rating || 0;
          let badgeColor = 'bg-teal-50 text-teal-700 border-teal-200';
          if (rating >= 4.7) badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
          else if (rating < 3.5 && rating > 0) badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';

          return (
            <div
              key={nurse.id}
              className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-200">
                      {nurse.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{nurse.name}</h4>
                      <p className="text-xs text-teal-700 font-medium">{nurse.specialization}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 font-extrabold text-slate-900 text-base">
                      <span>{rating ? rating.toFixed(2) : 'N/A'}</span>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <span className="text-[11px] text-slate-500">{nurse.total_feedback || 0} reviews</span>
                  </div>
                </div>

                {/* Micro indicators */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500" /> Punctuality
                    </span>
                    <span className="font-bold text-slate-800">{nurse.avg_punctuality?.toFixed(1) || '-'} ★</span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-500" /> Care
                    </span>
                    <span className="font-bold text-slate-800">{nurse.avg_care_quality?.toFixed(1) || '-'} ★</span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-500" /> Hygiene
                    </span>
                    <span className="font-bold text-slate-800">{nurse.avg_hygiene?.toFixed(1) || '-'} ★</span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Smile className="w-3 h-3 text-amber-500" /> Behaviour
                    </span>
                    <span className="font-bold text-slate-800">{nurse.avg_behaviour?.toFixed(1) || '-'} ★</span>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {nurse.low_score_alerts > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 rounded-md text-[11px] font-bold text-rose-700">
                      <AlertTriangle className="w-3 h-3 text-rose-500" /> {nurse.low_score_alerts} Follow-ups
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      ✓ All Clear
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectNurseForLink && onSelectNurseForLink(nurse.id)}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Link
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
