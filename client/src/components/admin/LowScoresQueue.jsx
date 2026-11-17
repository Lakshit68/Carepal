import React, { useState } from 'react';
import {
  AlertCircle,
  Phone,
  User,
  Clock,
  CheckCircle,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Save,
  Check
} from 'lucide-react';
import StarRating from '../common/StarRating';

export default function LowScoresQueue({ lowScores = [], onUpdateFollowup, censorAbusive = true }) {
  const [editingId, setEditingId] = useState(null);
  const [notesState, setNotesState] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [savedSuccessId, setSavedSuccessId] = useState(null);

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await onUpdateFollowup(feedbackId, { followup_status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async (feedbackId) => {
    const noteText = notesState[feedbackId];
    setSavingId(feedbackId);
    try {
      await onUpdateFollowup(feedbackId, { followup_notes: noteText });
      setEditingId(null);
      setSavedSuccessId(feedbackId);
      setTimeout(() => setSavedSuccessId(null), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">
              Low Scores & At-Risk Follow-Up Queue
            </h3>
            <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
              {lowScores.filter((f) => f.followup_status !== 'resolved').length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visits with rating &le; 3.0, Detractor NPS, or negative comments requiring proactive family resolution
          </p>
        </div>
      </div>

      {lowScores.length === 0 ? (
        <div className="text-center py-12 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-emerald-900">Queue is Clear!</h4>
          <p className="text-xs text-emerald-700 mt-1">
            No unresolved low scores or complaints found. All family visits are in good standing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {lowScores.map((item) => {
            const isAbusive = item.has_abusive_language === 1;
            const displayText = censorAbusive ? item.comment_censored : item.comment;
            const currentNotes = notesState[item.id] !== undefined ? notesState[item.id] : (item.followup_notes || '');

            let statusBadge = 'bg-rose-100 text-rose-800 border-rose-300';
            if (item.followup_status === 'in_progress') statusBadge = 'bg-amber-100 text-amber-800 border-amber-300';
            if (item.followup_status === 'resolved') statusBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div
                key={item.id}
                className={`border rounded-2xl p-4 sm:p-5 transition-all ${
                  item.followup_status === 'resolved'
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-white border-rose-200/90 shadow-xs'
                }`}
              >
                {/* Top Info Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      {item.service_type}
                    </span>
                    <span className="text-xs text-slate-500">
                      Visit: <strong>{item.visit_date}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Status:</span>
                    <select
                      value={item.followup_status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg border focus:outline-none cursor-pointer ${statusBadge}`}
                    >
                      <option value="unassigned">🔴 Unassigned (Urgent)</option>
                      <option value="in_progress">🟡 In Progress</option>
                      <option value="resolved">🟢 Resolved</option>
                      <option value="no_action_needed">⚪ No Action</option>
                    </select>
                  </div>
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 mb-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Nurse:</span>
                    <span className="font-bold text-slate-900 text-sm">{item.nurse_name}</span>
                    <span className="block text-slate-500 text-[11px]">{item.nurse_specialization}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Patient & Family:</span>
                    <span className="font-bold text-slate-900">{item.patient_name}</span>
                    <span className="block text-slate-600">
                      Contact: {item.family_contact_name || 'N/A'} • {item.city}
                    </span>
                    {item.family_phone && (
                      <a
                        href={`tel:${item.family_phone}`}
                        className="inline-flex items-center gap-1 text-teal-700 font-bold hover:underline mt-0.5"
                      >
                        <Phone className="w-3 h-3" /> {item.family_phone}
                      </a>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Rating Breakdown:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-rose-600">
                        {item.rating_overall?.toFixed(1)} ★
                      </span>
                      <span className="text-[11px] text-slate-500">
                        (NPS: <strong className={item.nps_score <= 6 ? 'text-rose-600' : 'text-slate-700'}>{item.nps_score}/10</strong>)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Punc: {item.rating_punctuality}★ | Care: {item.rating_care_quality}★ | Hyg: {item.rating_hygiene}★ | Beh: {item.rating_behaviour}★
                    </div>
                  </div>
                </div>

                {/* Family Comment */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      Family Feedback:
                    </span>
                    {isAbusive && (
                      <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded border border-rose-200">
                        ⚠️ Abusive Language Masked ({item.flagged_words})
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic bg-amber-50/40 p-3 rounded-xl border border-amber-200/50">
                    "{displayText || 'No written comment provided with rating'}"
                  </p>
                </div>

                {/* Operations Resolution Notes */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-600">
                      Operations Action Notes:
                    </label>
                    {savedSuccessId === item.id && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <textarea
                      rows={2}
                      value={currentNotes}
                      placeholder="Add resolution details (e.g. Called family at 3 PM, replaced caregiver, verified patient condition...)"
                      onChange={(e) => setNotesState({ ...notesState, [item.id]: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white resize-none"
                    />
                    <button
                      type="button"
                      disabled={savingId === item.id}
                      onClick={() => handleSaveNotes(item.id)}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {savingId === item.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
