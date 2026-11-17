import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  ShieldAlert,
  ThumbsUp,
  Minus,
  AlertTriangle,
  Calendar,
  User,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import StarRating from '../common/StarRating';

export default function FeedbackList({
  feedbacks = [],
  nurses = [],
  censorAbusive,
  onToggleCensorAbusive,
  onExportCsv
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNurse, setSelectedNurse] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [onlyAbusive, setOnlyAbusive] = useState(false);

  const filteredFeedbacks = feedbacks.filter((f) => {
    if (selectedNurse && f.nurse_id !== selectedNurse) return false;
    if (selectedSentiment && f.sentiment !== selectedSentiment) return false;
    if (selectedRating && Math.round(f.rating_overall) !== parseInt(selectedRating)) return false;
    if (onlyAbusive && f.has_abusive_language !== 1) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchComment = (f.comment || '').toLowerCase().includes(q);
      const matchPatient = (f.patient_name || '').toLowerCase().includes(q);
      const matchNurse = (f.nurse_name || '').toLowerCase().includes(q);
      if (!matchComment && !matchPatient && !matchNurse) return false;
    }

    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      
      {/* Header with Title and Abusive Filter Toggle */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            All Visit Feedback & Comment Moderation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of family ratings, sentiment tagging, and profanity moderation
          </p>
        </div>

        {/* Abusive Language Filter Switch */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 px-3 rounded-xl border border-slate-200">
            {censorAbusive ? (
              <EyeOff className="w-4 h-4 text-emerald-700" />
            ) : (
              <Eye className="w-4 h-4 text-rose-600" />
            )}
            <span className="text-xs font-semibold text-slate-700">
              Profanity Filter:
            </span>
            <button
              type="button"
              onClick={onToggleCensorAbusive}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                censorAbusive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-rose-600 text-white shadow-xs'
              }`}
            >
              {censorAbusive ? 'Active (Censored)' : 'Audit View (Unmasked)'}
            </button>
          </div>

          <button
            type="button"
            onClick={onExportCsv}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, nurse, text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <select
            value={selectedNurse}
            onChange={(e) => setSelectedNurse(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="">All Nurses</option>
            {nurses.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="">All Sentiments</option>
            <option value="positive">🟢 Positive Sentiment</option>
            <option value="neutral">⚪ Neutral Sentiment</option>
            <option value="negative">🔴 Negative Sentiment</option>
          </select>
        </div>

        <div>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyAbusive}
              onChange={(e) => setOnlyAbusive(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <span>Show Flagged Abuse Only</span>
          </label>
        </div>
      </div>

      {/* Feedback Feed */}
      {filteredFeedbacks.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          No feedback matching the selected filters.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredFeedbacks.map((f) => {
            const isAbusive = f.has_abusive_language === 1;
            const displayText = censorAbusive ? f.comment_censored : f.comment;

            return (
              <div
                key={f.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-200 hover:shadow-xs transition-all text-xs"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{f.nurse_name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{f.service_type}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" /> {f.patient_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Sentiment Tag */}
                    {f.sentiment === 'positive' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" /> Positive
                      </span>
                    )}
                    {f.sentiment === 'neutral' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                        <Minus className="w-3 h-3 text-slate-500" /> Neutral
                      </span>
                    )}
                    {f.sentiment === 'negative' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Negative
                      </span>
                    )}

                    {/* Abusive Badge */}
                    {isAbusive && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300 text-[11px]">
                        <ShieldAlert className="w-3 h-3 text-rose-600" /> Flagged Words: {f.flagged_words}
                      </span>
                    )}

                    {/* Visit Date */}
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 ml-1">
                      <Calendar className="w-3 h-3" /> {f.visit_date}
                    </span>
                  </div>
                </div>

                {/* Star Ratings & NPS */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-sm text-slate-900">{f.rating_overall?.toFixed(1)}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Punc: <strong>{f.rating_punctuality}★</strong> | Care: <strong>{f.rating_care_quality}★</strong> | Hyg: <strong>{f.rating_hygiene}★</strong> | Beh: <strong>{f.rating_behaviour}★</strong>
                    </div>
                  </div>

                  <div className="text-[11px]">
                    NPS Score: <strong className={f.nps_score >= 9 ? 'text-emerald-600' : f.nps_score <= 6 ? 'text-rose-600' : 'text-amber-600'}>{f.nps_score}/10</strong> ({f.nps_score >= 9 ? 'Promoter' : f.nps_score <= 6 ? 'Detractor' : 'Passive'})
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{displayText || 'No comment provided'}"
                </p>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
