import React, { useState } from 'react';
import { X, Link as LinkIcon, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

export default function CreateLinkModal({
  isOpen,
  onClose,
  nurses = [],
  preselectedNurseId = '',
  onVisitCreated,
  onOpenTestLink
}) {
  const [nurseId, setNurseId] = useState(preselectedNurseId || (nurses[0]?.id || ''));
  const [patientName, setPatientName] = useState('');
  const [familyContactName, setFamilyContactName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [serviceType, setServiceType] = useState('Elderly Care');
  const [city, setCity] = useState('Bangalore');
  const [expiresInDays, setExpiresInDays] = useState(3);

  const [loading, setLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nurseId || !patientName.trim()) {
      setError('Please select a nurse and enter the patient name.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/visits/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nurse_id: nurseId,
          patient_name: patientName.trim(),
          family_contact_name: familyContactName.trim(),
          family_phone: familyPhone.trim(),
          service_type: serviceType,
          city,
          visit_date: new Date().toISOString().slice(0, 10),
          expires_in_days: parseInt(expiresInDays)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create feedback link');
      } else {
        setCreatedResult(data);
        if (onVisitCreated) onVisitCreated();
      }
    } catch (err) {
      console.error(err);
      setError('Network error creating feedback link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdResult) return;
    const url = `${window.location.origin}/feedback/${createdResult.token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCreatedResult(null);
    setPatientName('');
    setFamilyContactName('');
    setFamilyPhone('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-teal-300" />
            <h3 className="font-bold text-base">Generate Unique Visit Feedback Link</h3>
          </div>
          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {createdResult ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold text-slate-900">Unique Link Generated!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ready to be shared with the family via SMS or WhatsApp. Single-use and expires in{' '}
                  <strong>{createdResult.expiresInDays} days</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500 mb-1 font-semibold">Unique Survey URL:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/feedback/${createdResult.token}`}
                    className="w-full text-xs font-mono bg-white p-2 border border-slate-200 rounded-lg text-slate-800 select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTestLink(createdResult.token);
                  }}
                  className="w-1/2 py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Test Form Now
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-1/2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  Create Another Link
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Nurse Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Nurse / Caregiver *</label>
                <select
                  value={nurseId}
                  onChange={(e) => setNurseId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {nurses.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} ({n.specialization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name & Age *</label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Sarojini Sen (Age 74)"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              {/* Family Contact and Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Family Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh (Son)"
                    value={familyContactName}
                    onChange={(e) => setFamilyContactName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98450 12345"
                    value={familyPhone}
                    onChange={(e) => setFamilyPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Service Type and City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Elderly Care">Elderly Care</option>
                    <option value="Alzheimer's & Dementia Care">Alzheimer's & Dementia</option>
                    <option value="Post-Op Recovery">Post-Op Recovery</option>
                    <option value="Baby Care">Baby Care</option>
                    <option value="Critical Care">Critical Care</option>
                    <option value="Senior Companionship">Senior Companionship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
              </div>

              {/* Expiry Window */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link Expiry Window</label>
                <select
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value={1}>1 Day (Fast Track Post-Discharge)</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days (Standard CarePal Policy)</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days (Extended)</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Link works strictly once and deactivates after expiration.
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                  <span>Generate Link</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
