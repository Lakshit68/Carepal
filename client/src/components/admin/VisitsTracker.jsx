import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Check,
  Clock,
  CheckCircle2,
  AlertOctagon,
  User,
  Calendar,
  Plus
} from 'lucide-react';

export default function VisitsTracker({ visits = [], onOpenCreateModal, onSelectTokenToTest }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedToken, setCopiedToken] = useState(null);

  const filtered = visits.filter((v) => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  const handleCopy = (token) => {
    const url = `${window.location.origin}/feedback/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-teal-600" />
            Visit Feedback Links Tracker
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Single-use unique survey URLs with expiry tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'all' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              All ({visits.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'pending' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Pending ({visits.filter((v) => v.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'submitted' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Submitted
            </button>
            <button
              onClick={() => setFilterStatus('expired')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterStatus === 'expired' ? 'bg-white text-teal-800 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Expired
            </button>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Link
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3">Visit ID / Token</th>
              <th className="py-2.5 px-3">Patient & Family</th>
              <th className="py-2.5 px-3">Nurse</th>
              <th className="py-2.5 px-3">Care Service</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Expires At</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((v) => {
              const isCopied = copiedToken === v.token;
              const isExpired = new Date(v.expires_at) < new Date() && v.status !== 'submitted';

              return (
                <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    <div>{v.id}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{v.token}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{v.patient_name}</div>
                    <div className="text-[11px] text-slate-500">{v.family_contact_name || 'N/A'} ({v.city})</div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{v.nurse_name}</div>
                    <div className="text-[11px] text-slate-500">{v.nurse_specialization}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
                      {v.service_type}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {v.status === 'submitted' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Submitted
                      </span>
                    )}
                    {v.status === 'pending' && !isExpired && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px]">
                        <Clock className="w-3 h-3 text-blue-600" /> Pending (Active)
                      </span>
                    )}
                    {(v.status === 'expired' || (v.status === 'pending' && isExpired)) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px]">
                        <AlertOctagon className="w-3 h-3 text-slate-500" /> Expired
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-500 text-[11px]">
                    {new Date(v.expires_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(v.token)}
                        title="Copy unique link to clipboard"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectTokenToTest(v.token)}
                        title="Test link in form view"
                        className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" /> Test Form
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
