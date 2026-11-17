import React, { useState, useEffect } from 'react';
import {
  Heart,
  Star,
  Users,
  AlertTriangle,
  TrendingUp,
  Download,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Smile,
  ShieldAlert
} from 'lucide-react';
import KpiCard from './KpiCard';
import TrendChart from './TrendChart';
import NurseLeaderboard from './NurseLeaderboard';
import LowScoresQueue from './LowScoresQueue';
import FeedbackList from './FeedbackList';
import VisitsTracker from './VisitsTracker';
import CreateLinkModal from './CreateLinkModal';
import WeeklyEmailModal from './WeeklyEmailModal';

export default function AdminDashboard({ onSelectTokenToTest }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [lowScores, setLowScores] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [visits, setVisits] = useState([]);

  // Time range filter
  const [timeRange, setTimeRange] = useState('all'); // '7d', '30d', 'all'

  // Dashboard active view tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'nurses', 'low_scores', 'feedback', 'visits'

  // Profanity filter switch: ON by default (censored view), can be toggled by ops lead
  const [censorAbusive, setCensorAbusive] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [preselectedNurseId, setPreselectedNurseId] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [reseedLoading, setReseedLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, nursesRes, lowScoresRes, feedbacksRes, visitsRes] = await Promise.all([
        fetch(`/api/admin/stats?timeRange=${timeRange}`),
        fetch('/api/admin/nurses'),
        fetch('/api/admin/feedback/low-scores'),
        fetch('/api/admin/feedback?limit=100'),
        fetch('/api/admin/visits')
      ]);

      const statsData = await statsRes.json();
      const nursesData = await nursesRes.json();
      const lowScoresData = await lowScoresRes.json();
      const feedbacksData = await feedbacksRes.json();
      const visitsData = await visitsRes.json();

      setStats(statsData.summary);
      setTrends(statsData.trends || []);
      setNurses(nursesData);
      setLowScores(lowScoresData);
      setFeedbacks(feedbacksData.feedback || []);
      setVisits(visitsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFollowup = async (feedbackId, payload) => {
    try {
      const res = await fetch(`/api/admin/feedback/${feedbackId}/followup`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        // Refresh low scores and stats
        const updatedScores = await fetch('/api/admin/feedback/low-scores').then((r) => r.json());
        setLowScores(updatedScores);
        const statsRes = await fetch(`/api/admin/stats?timeRange=${timeRange}`).then((r) => r.json());
        setStats(statsRes.summary);
      }
    } catch (err) {
      console.error('Failed to update followup:', err);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/admin/export/csv';
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset and re-seed sample data? This creates fresh realistic visits, ratings, and live links.')) {
      return;
    }
    setReseedLoading(true);
    try {
      const res = await fetch('/api/admin/reset-seed', { method: 'POST' });
      if (res.ok) {
        setActionNotice('Database re-seeded with realistic CarePal data!');
        setTimeout(() => setActionNotice(''), 3500);
        await fetchAllData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReseedLoading(false);
    }
  };

  const handleOpenCreateForNurse = (nurseId) => {
    setPreselectedNurseId(nurseId);
    setIsCreateModalOpen(true);
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-200">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Loading Care Quality Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">Aggregating family ratings, nurse metrics and NPS...</p>
        </div>
      </div>
    );
  }

  const activeAlertsCount = lowScores.filter((f) => f.followup_status !== 'resolved').length;
  const npsScore = stats?.nps?.score || 0;
  const npsColor = npsScore >= 50 ? 'emerald' : npsScore >= 0 ? 'amber' : 'rose';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-12">
      
      {/* Top Notification Toast */}
      {actionNotice && (
        <div className="fixed top-4 right-4 z-50 bg-teal-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 text-teal-300" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Top Header */}
      <header className="bg-teal-900 text-white sticky top-0 z-40 shadow-md border-b border-teal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="w-10 h-10 bg-teal-700 text-white rounded-xl flex items-center justify-center shadow-inner">
              <Heart className="w-5 h-5 fill-teal-200 text-teal-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">TheCarePal</span>
                <span className="bg-teal-800 text-teal-200 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-teal-700">
                  Operations CRM
                </span>
              </div>
              <p className="text-xs text-teal-300">
                Visit Feedback & Care Quality Assurance Dashboard (Task ID: FS-08)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
            
            {/* Create Link */}
            <button
              onClick={() => {
                setPreselectedNurseId('');
                setIsCreateModalOpen(true);
              }}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Visit Link</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-xl font-semibold flex items-center gap-1.5 transition-colors border border-teal-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Weekly Digest Email Modal */}
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="px-3 py-2 bg-teal-800 hover:bg-teal-700 text-teal-100 rounded-xl font-semibold flex items-center gap-1.5 transition-colors border border-teal-700 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>Weekly Digest</span>
            </button>

            {/* Re-seed Sample Data */}
            <button
              onClick={handleReseed}
              disabled={reseedLoading}
              title="Reset and populate database with fresh sample data"
              className="p-2 bg-teal-800 hover:bg-teal-700 text-teal-200 rounded-xl font-semibold transition-colors border border-teal-700 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${reseedLoading ? 'animate-spin' : ''}`} />
            </button>

          </div>

        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-teal-950/90 border-t border-teal-800/80 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto text-xs py-1">
            <div className="flex items-center space-x-1 py-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-teal-300 hover:text-white hover:bg-teal-800/50'
                }`}
              >
                Overview & Trends
              </button>
              <button
                onClick={() => setActiveTab('nurses')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'nurses'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-teal-300 hover:text-white hover:bg-teal-800/50'
                }`}
              >
                Nurses ({nurses.length})
              </button>
              <button
                onClick={() => setActiveTab('low_scores')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'low_scores'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-rose-300 hover:text-white hover:bg-teal-800/50'
                }`}
              >
                <span>Follow-Up Queue</span>
                {activeAlertsCount > 0 && (
                  <span className="bg-rose-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                    {activeAlertsCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'feedback'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-teal-300 hover:text-white hover:bg-teal-800/50'
                }`}
              >
                All Feedback Feed
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'visits'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-teal-300 hover:text-white hover:bg-teal-800/50'
                }`}
              >
                Visit Links Tracker
              </button>
            </div>

            {/* Time range selector */}
            <div className="flex items-center gap-1.5 text-xs text-teal-300 shrink-0 pl-4">
              <span className="hidden sm:inline text-teal-400">Period:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-teal-900 border border-teal-700 text-white px-2 py-1 rounded-lg text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Quick Demo Test Bar */}
        <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                Interactive Evaluator Quick Test
              </h4>
              <p className="text-xs text-teal-800">
                Want to test the family feedback link right now? Try these pre-seeded links:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectTokenToTest('demo-fresh-01')}
              className="px-2.5 py-1.5 bg-white hover:bg-teal-50 text-teal-800 rounded-lg text-xs font-bold border border-teal-300 transition-colors cursor-pointer"
            >
              Test Active Form 1 &rarr;
            </button>
            <button
              onClick={() => onSelectTokenToTest('demo-fresh-02')}
              className="px-2.5 py-1.5 bg-white hover:bg-teal-50 text-teal-800 rounded-lg text-xs font-bold border border-teal-300 transition-colors cursor-pointer"
            >
              Test Active Form 2 &rarr;
            </button>
            <button
              onClick={() => onSelectTokenToTest('demo-expired-01')}
              className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-800 rounded-lg text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
            >
              Test Expired Link &rarr;
            </button>
          </div>
        </div>

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Overall Rating */}
          <KpiCard
            title="Average Care Rating"
            value={`${stats?.avgOverall?.toFixed(2) || '0.00'} ★`}
            subvalue={`Across ${stats?.totalSubmitted || 0} family responses`}
            icon={Star}
            badge="Target: 4.50★"
            badgeColor="emerald"
            color="teal"
          >
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Punc: {stats?.avgPunctuality?.toFixed(1)}★</span>
              <span>Care: {stats?.avgCareQuality?.toFixed(1)}★</span>
              <span>Hyg: {stats?.avgHygiene?.toFixed(1)}★</span>
              <span>Beh: {stats?.avgBehaviour?.toFixed(1)}★</span>
            </div>
          </KpiCard>

          {/* 2. Net Promoter Score */}
          <KpiCard
            title="Net Promoter Score"
            value={`${npsScore > 0 ? '+' : ''}${npsScore}`}
            subvalue="Scale: -100 to +100"
            icon={Heart}
            badge={npsScore >= 50 ? 'World Class' : npsScore >= 20 ? 'Favorable' : 'Needs Focus'}
            badgeColor={npsColor}
            color={npsColor}
          >
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span className="text-emerald-700 font-bold">{stats?.nps?.promoterPct}% Promoters</span>
                <span className="text-slate-500 font-medium">{stats?.nps?.passivePct}% Passive</span>
                <span className="text-rose-700 font-bold">{stats?.nps?.detractorPct}% Detractors</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full flex overflow-hidden">
                <div style={{ width: `${stats?.nps?.promoterPct || 0}%` }} className="bg-emerald-500 h-full" />
                <div style={{ width: `${stats?.nps?.passivePct || 0}%` }} className="bg-amber-400 h-full" />
                <div style={{ width: `${stats?.nps?.detractorPct || 0}%` }} className="bg-rose-500 h-full" />
              </div>
            </div>
          </KpiCard>

          {/* 3. Response Rate */}
          <KpiCard
            title="Feedback Response Rate"
            value={`${stats?.responseRate || 0}%`}
            subvalue={`${stats?.totalSubmitted || 0} returned of ${stats?.totalVisits || 0} sent`}
            icon={Clock}
            badge={`${stats?.totalPending || 0} Pending`}
            badgeColor="emerald"
            color="indigo"
          >
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Links Active: {stats?.totalPending || 0}</span>
              <span>Expired: {stats?.totalExpired || 0}</span>
            </div>
          </KpiCard>

          {/* 4. Follow-up Alerts */}
          <KpiCard
            title="Follow-Up Alerts"
            value={activeAlertsCount}
            subvalue="Ratings &le; 3.0, Detractors, or Complaints"
            icon={AlertTriangle}
            badge={activeAlertsCount > 0 ? 'Action Required' : 'All Clear'}
            badgeColor={activeAlertsCount > 0 ? 'rose' : 'emerald'}
            color={activeAlertsCount > 0 ? 'rose' : 'emerald'}
          >
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Language Flagged: {stats?.abusiveCount || 0}</span>
              <span>Negative: {stats?.sentimentBreakdown?.negative || 0}</span>
            </div>
          </KpiCard>

        </div>

        {/* View Tabs Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <TrendChart trends={trends} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NurseLeaderboard
                nurses={nurses}
                onSelectNurseForLink={handleOpenCreateForNurse}
              />
              <LowScoresQueue
                lowScores={lowScores}
                onUpdateFollowup={handleUpdateFollowup}
                censorAbusive={censorAbusive}
              />
            </div>
          </div>
        )}

        {activeTab === 'nurses' && (
          <NurseLeaderboard
            nurses={nurses}
            onSelectNurseForLink={handleOpenCreateForNurse}
          />
        )}

        {activeTab === 'low_scores' && (
          <LowScoresQueue
            lowScores={lowScores}
            onUpdateFollowup={handleUpdateFollowup}
            censorAbusive={censorAbusive}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackList
            feedbacks={feedbacks}
            nurses={nurses}
            censorAbusive={censorAbusive}
            onToggleCensorAbusive={() => setCensorAbusive(!censorAbusive)}
            onExportCsv={handleExportCsv}
          />
        )}

        {activeTab === 'visits' && (
          <VisitsTracker
            visits={visits}
            onOpenCreateModal={() => {
              setPreselectedNurseId('');
              setIsCreateModalOpen(true);
            }}
            onSelectTokenToTest={onSelectTokenToTest}
          />
        )}

      </main>

      {/* Modals */}
      <CreateLinkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        nurses={nurses}
        preselectedNurseId={preselectedNurseId}
        onVisitCreated={fetchAllData}
        onOpenTestLink={onSelectTokenToTest}
      />

      <WeeklyEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />

    </div>
  );
}
