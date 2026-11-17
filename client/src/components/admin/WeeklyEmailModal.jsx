import React, { useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle2, Eye, Sparkles, ExternalLink } from 'lucide-react';

export default function WeeklyEmailModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [emailData, setEmailData] = useState(null);
  const [recipient, setRecipient] = useState('ops-team@thecarepal.com');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPreview();
    }
  }, [isOpen]);

  const fetchPreview = async () => {
    setLoading(true);
    setError('');
    setSendResult(null);
    try {
      const res = await fetch('/api/reports/weekly-summary/preview');
      const data = await res.json();
      if (!res.ok) {
        setError('Failed to load email preview');
      } else {
        setEmailData(data);
      }
    } catch (e) {
      console.error(e);
      setError('Network error fetching email preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/reports/weekly-summary/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to dispatch email');
      } else {
        setSendResult(data);
      }
    } catch (e) {
      console.error(e);
      setError('Network error dispatching email');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="font-bold text-base">Weekly Quality Summary Digest</h3>
              <p className="text-xs text-teal-200">
                Automated weekly email dispatched to operations lead & clinical team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body & Preview */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {sendResult ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-emerald-950">Email Successfully Dispatched!</h4>
              <p className="text-xs text-emerald-800">
                {sendResult.message}
              </p>

              {sendResult.emailRecord?.previewUrl && (
                <div className="pt-2">
                  <a
                    href={sendResult.emailRecord.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Ethereal Mailbox Preview
                  </a>
                </div>
              )}

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSendResult(null)}
                  className="text-xs font-semibold text-emerald-800 underline cursor-pointer"
                >
                  Send to another recipient or preview again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Recipient bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="recipient-email" className="font-bold text-slate-700 shrink-0">Send To:</label>
                  <input
                    id="recipient-email"
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full sm:w-64 p-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full sm:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {sending ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Digest Now</span>
                </button>
              </div>

              {/* Email Live Preview Render */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-teal-600" /> Live HTML Email Preview
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Subject: Weekly Care Quality Digest ({emailData?.data?.weekRange})
                  </span>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Generating weekly digest snapshot...
                  </div>
                ) : (
                  <div
                    className="p-4 overflow-x-auto max-h-[480px] text-xs"
                    dangerouslySetInnerHTML={{ __html: emailData?.html || '' }}
                  />
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
