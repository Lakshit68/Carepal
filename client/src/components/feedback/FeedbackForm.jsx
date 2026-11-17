import React, { useState, useEffect } from 'react';
import {
  Heart,
  Clock,
  Sparkles,
  ShieldCheck,
  Smile,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Send,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import StarRating from '../common/StarRating';

export default function FeedbackForm({ token, onNavigateToAdmin }) {
  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null); // 'not_found', 'already_submitted', 'expired', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedAtDate, setSubmittedAtDate] = useState(null);

  // Form fields
  const [punctuality, setPunctuality] = useState(0);
  const [careQuality, setCareQuality] = useState(0);
  const [hygiene, setHygiene] = useState(0);
  const [behaviour, setBehaviour] = useState(0);
  const [npsScore, setNpsScore] = useState(null);
  const [comment, setComment] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetchLinkDetails();
  }, [token]);

  async function fetchLinkDetails() {
    setLoading(true);
    setErrorStatus(null);
    setValidationError('');
    try {
      const res = await fetch(`/api/feedback/link/${token}`);
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setErrorStatus(data.reason || 'error');
        setErrorMessage(data.message || 'Unable to verify feedback link.');
        if (data.submittedAt) setSubmittedAtDate(data.submittedAt);
        setLinkData(data);
      } else {
        setLinkData(data.visit);
      }
    } catch (err) {
      console.error('Fetch link error:', err);
      setErrorStatus('error');
      setErrorMessage('Could not connect to TheCarePal server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setValidationError('');

    if (!punctuality || !careQuality || !hygiene || !behaviour) {
      setValidationError('Please provide a star rating for all 4 care categories.');
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    if (npsScore === null) {
      setValidationError('Please select a recommendation score (0 to 10).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rating_punctuality: punctuality,
          rating_care_quality: careQuality,
          rating_hygiene: hygiene,
          rating_behaviour: behaviour,
          nps_score: npsScore,
          comment: comment.trim()
        })
      });

      const result = await res.json();
      if (!res.ok) {
        setValidationError(result.error || 'Failed to submit feedback. Please try again.');
      } else {
        setSubmittedSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Submission error:', err);
      setValidationError('Network error submitting feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // --- 1. Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Verifying Visit Link</h2>
          <p className="text-sm text-slate-500 mt-1">Retrieving details for your care visit...</p>
        </div>
      </div>
    );
  }

  // --- 2. Error / Expired / Already Submitted States ---
  if (errorStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-6 md:p-8">
          
          {errorStatus === 'already_submitted' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 mb-2">
                Feedback Recorded
              </span>
              <h2 className="text-xl font-bold text-slate-800">Feedback Already Submitted</h2>
              <p className="text-sm text-slate-600 mt-2">
                Thank you! You have already submitted feedback for this visit. To preserve survey integrity, each unique link can only be used once.
              </p>
              {submittedAtDate && (
                <p className="text-xs text-slate-400 mt-3">
                  Submitted on {new Date(submittedAtDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </>
          )}

          {errorStatus === 'expired' && (
            <>
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-9 h-9" />
              </div>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 mb-2">
                Link Expired
              </span>
              <h2 className="text-xl font-bold text-slate-800">Feedback Window Closed</h2>
              <p className="text-sm text-slate-600 mt-2">
                {errorMessage || 'This visit feedback link has expired.'}
              </p>
              <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-left">
                💡 <strong>Why do links expire?</strong> To spot care concerns quickly before they turn into complaints, TheCarePal feedback links are active for a set window following each visit.
              </p>
            </>
          )}

          {errorStatus === 'not_found' && (
            <>
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-9 h-9" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Invalid Feedback Link</h2>
              <p className="text-sm text-slate-600 mt-2">
                {errorMessage || 'We could not locate this visit feedback record.'}
              </p>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Go to Quality Dashboard <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Need assistance? Call TheCarePal Care Line at 1800-CARE-PAL
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. Thank You State ---
  if (submittedSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-center p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 mb-2">
            Submitted Successfully
          </span>
          <h2 className="text-2xl font-bold text-slate-800">Thank You, Family!</h2>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Your feedback for <strong>{linkData?.nurseName}</strong> has been directly logged into our Care Quality Dashboard.
          </p>

          <div className="mt-5 bg-teal-50/70 border border-teal-100 rounded-xl p-4 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-1">How your feedback helps:</h4>
            <p className="text-xs text-teal-900 leading-normal">
              Our clinical supervisors review every rating. If your visit score was lower than expected, our team will proactively follow up to ensure your loved one receives the finest care.
            </p>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              View in Quality Dashboard &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. Active Feedback Form ---
  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* TheCarePal Header Branding */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-teal-700 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">TheCarePal</span>
              <span className="block text-xs font-medium text-teal-700">Home Healthcare India</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
            className="text-xs font-medium text-slate-500 hover:text-teal-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            Switch to Admin &rarr;
          </button>
        </div>

        {/* Visit Context Card */}
        <div className="bg-gradient-to-r from-teal-900 to-teal-800 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="bg-teal-700/60 text-teal-200 text-xs px-2.5 py-1 rounded-full font-medium border border-teal-500/30">
                {linkData?.serviceType}
              </span>
              <span className="text-teal-200 text-xs flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Active Link (Expires in {Math.max(1, Math.ceil((new Date(linkData?.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))} days)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Visit Feedback: {linkData?.nurseName}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-teal-100/90 pt-3 border-t border-teal-700/50">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-300" />
                <span>Patient: <strong>{linkData?.patientName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-300" />
                <span>Visit: <strong>{linkData?.visitDate}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-300" />
                <span>City: <strong>{linkData?.city || 'Bangalore'}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feedback Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8">
          
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800">Care Quality Ratings</h2>
            <p className="text-xs text-slate-500 mt-1">
              Please rate Nurse {linkData?.nurseName}'s care on the following 4 pillars (1 to 5 stars).
            </p>
          </div>

          {/* 1. Punctuality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                1. Punctuality
              </label>
              <span className="text-xs text-slate-400">Did the nurse arrive on time?</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <StarRating
                value={punctuality}
                onChange={setPunctuality}
                size="lg"
                showLabel={true}
                labels={['Significantly Late', 'Late with Delay', 'On Time', 'Prompt & Prepared', 'Early & Ready']}
              />
            </div>
          </div>

          {/* 2. Quality of Care */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                2. Quality of Care
              </label>
              <span className="text-xs text-slate-400">Skill, attention, and thoroughness</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <StarRating
                value={careQuality}
                onChange={setCareQuality}
                size="lg"
                showLabel={true}
                labels={['Substandard', 'Needs Attention', 'Satisfactory', 'High Quality', 'Exceptional Care']}
              />
            </div>
          </div>

          {/* 3. Hygiene & Safety */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                3. Hygiene & Safety
              </label>
              <span className="text-xs text-slate-400">Hand sanitization, clean scrubs & sterile tools</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <StarRating
                value={hygiene}
                onChange={setHygiene}
                size="lg"
                showLabel={true}
                labels={['Unhygienic', 'Lacked Precautions', 'Acceptable Hygiene', 'Clean & Safe', 'Pristine & Sterile']}
              />
            </div>
          </div>

          {/* 4. Behaviour & Compassion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Smile className="w-4 h-4 text-teal-600" />
                4. Behaviour & Communication
              </label>
              <span className="text-xs text-slate-400">Polite, empathetic, and respectful with family</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <StarRating
                value={behaviour}
                onChange={setBehaviour}
                size="lg"
                showLabel={true}
                labels={['Rude / Dismissive', 'Cold / Inattentive', 'Courteous', 'Very Polite', 'Warm & Compassionate']}
              />
            </div>
          </div>

          {/* Net Promoter Score (NPS) 0-10 */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Net Promoter Score (NPS)
              </label>
              <span className="text-xs text-slate-500">0 = Not at all, 10 = Extremely likely</span>
            </div>
            <p className="text-xs text-slate-600">
              How likely are you to recommend <strong>TheCarePal</strong> to friends, relatives or colleagues needing home care?
            </p>

            <div className="grid grid-cols-11 gap-1 sm:gap-2 pt-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = npsScore === num;
                let activeColor = 'bg-teal-600 text-white ring-2 ring-teal-400';
                if (num <= 6) activeColor = 'bg-rose-600 text-white ring-2 ring-rose-400';
                else if (num <= 8) activeColor = 'bg-amber-500 text-white ring-2 ring-amber-300';
                else activeColor = 'bg-emerald-600 text-white ring-2 ring-emerald-300';

                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNpsScore(num)}
                    className={`h-11 sm:h-12 flex flex-col items-center justify-center font-bold text-sm sm:text-base rounded-xl transition-all border ${
                      isSelected
                        ? `${activeColor} shadow-md scale-105`
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1 pt-1">
              <span className="text-rose-600">0 - Not Likely (Detractor)</span>
              <span className="text-amber-600">7-8 - Neutral</span>
              <span className="text-emerald-600">9-10 - Extremely Likely (Promoter)</span>
            </div>
          </div>

          {/* Comment / Observations */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label htmlFor="feedback-comment" className="text-sm font-bold text-slate-800">
                Additional Comments & Observations
              </label>
              <span className="text-xs text-slate-400">{comment.length} / 500 characters</span>
            </div>
            <textarea
              id="feedback-comment"
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what went particularly well or where we can improve. (e.g., patient comfort, communication, medication support...)"
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-y"
            />
            <p className="text-[11px] text-slate-400">
              🔒 Your response is confidential and monitored by our Clinical Operations Team.
            </p>
          </div>

          {/* Validation Error banner */}
          {validationError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Feedback...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Visit Feedback</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              This link will expire after submission. Thank you for partnering with TheCarePal.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
