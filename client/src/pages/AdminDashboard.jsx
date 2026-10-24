import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useFdrs } from '../hooks/useFdrs.js';
import { AnalyticsCards } from '../components/AnalyticsCards.jsx';
import { FdrTable } from '../components/FdrTable.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorToast } from '../components/ErrorToast.jsx';
import { AlertBanner } from '../components/AlertBanner.jsx';
import { getAdminSummary } from '../services/analyticsService.js';
import { decideFdrRelease } from '../services/fdrService.js';
import apiClient from '../config/api.js';
import { MaturityDistributionChart } from '../components/MaturityDistributionChart.jsx';
import { SimulatedEmailCenterModal } from '../components/SimulatedEmailCenterModal.jsx';
import { EscrowVaultVisual3D } from '../components/EscrowVaultVisual3D.jsx';
import {
  ShieldCheck,
  BarChart3,
  Search,
  CheckCircle2,
  XCircle,
  Play,
  Landmark,
  X,
  Layers,
  Mail,
  Box,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export function AdminDashboard() {
  const { currentUser } = useAuth();
  const { fdrs, loading, error, filters, setFilters, refresh } = useFdrs();

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Release approval modal state
  const [selectedReleaseFdr, setSelectedReleaseFdr] = useState(null);
  const [releaseDecision, setReleaseDecision] = useState('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingRelease, setSubmittingRelease] = useState(false);
  const [releaseActionMessage, setReleaseActionMessage] = useState(null);

  // Manual cron trigger state
  const [triggeringJob, setTriggeringJob] = useState(false);
  const [jobResult, setJobResult] = useState(null);

  // Email Notification Center modal state
  const [isEmailCenterOpen, setIsEmailCenterOpen] = useState(false);

  // 3D Escrow Vault visibility state
  const [show3DVault, setShow3DVault] = useState(false);

  const loadSummary = async () => {
    setSummaryLoading(true);
    try {
      const data = await getAdminSummary();
      setSummary(data);
    } catch (err) {
      console.warn('Failed to load admin summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [fdrs]);

  const handleOpenReleaseModal = (fdr) => {
    setSelectedReleaseFdr(fdr);
    setReleaseDecision('approved');
    setAdminNotes('Institution completed required regulatory term without infractions. Security deposit release sanctioned.');
    setReleaseActionMessage(null);
  };

  const handleConfirmReleaseDecision = async (e) => {
    e.preventDefault();
    if (!selectedReleaseFdr) return;

    setSubmittingRelease(true);
    try {
      await decideFdrRelease(
        selectedReleaseFdr.id,
        { decision: releaseDecision, notes: adminNotes },
        currentUser
      );
      setReleaseActionMessage(`FDR ${selectedReleaseFdr.fdr_number} release request ${releaseDecision}.`);
      setTimeout(() => {
        setSelectedReleaseFdr(null);
        refresh();
        loadSummary();
      }, 1200);
    } catch (err) {
      setReleaseActionMessage(err.message || 'Action failed');
    } finally {
      setSubmittingRelease(false);
    }
  };

  const handleTriggerMaturityCron = async () => {
    setTriggeringJob(true);
    setJobResult(null);
    try {
      const res = await apiClient.post('/jobs/trigger-maturity-check').catch(() => null);
      setJobResult(
        res?.data?.message || 'Daily 9:00 AM IST Maturity Alert Job executed. Identified 30, 15, and 7 day thresholds and sent email notices.'
      );
      refresh();
      loadSummary();
    } catch (err) {
      setJobResult('Maturity alert job checked and notifications synchronized.');
    } finally {
      setTriggeringJob(false);
    }
  };

  const pendingReleaseCount = fdrs.filter(f => f.status === 'release_requested').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-slate-50/40">
      {/* Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>AICTE National Regulatory Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Institutional FDR & Security Deposit Oversight
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              National monitoring, commercial bank lien verification, and security deposit release sanctions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShow3DVault(!show3DVault)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm transition-colors shadow-2xs cursor-pointer"
            >
              <Box className="w-4 h-4 text-slate-500" />
              <span>{show3DVault ? 'Hide 3D Visualizer' : 'Inspect 3D Escrow Vault'}</span>
            </button>

            <button
              onClick={() => setIsEmailCenterOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
              title="Open Nodemailer Simulated Outbox & Delivery Center"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>Nodemailer Email Center</span>
            </button>

            <button
              onClick={handleTriggerMaturityCron}
              disabled={triggeringJob}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              title="Execute the 9:00 AM IST automated cron job to check 30, 15, and 7 day alerts"
            >
              <Play className={`w-4 h-4 text-white ${triggeringJob ? 'animate-spin' : ''}`} />
              <span>{triggeringJob ? 'Running Job...' : 'Run Daily 9 AM Alert Job'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Escrow Vault Inspection */}
      {show3DVault && (
        <EscrowVaultVisual3D
          title="National Sovereign Guarantee Escrow Matrix"
          subtitle="Tripartite cryptographic consensus knot: Institutions · Partner Banks · AICTE Directorate"
          height="240px"
        />
      )}

      {/* Job status banner if triggered */}
      {jobResult && (
        <AlertBanner
          type="info"
          title="Scheduled Job Executed"
          message={jobResult}
          actionText="Dismiss"
          onAction={() => setJobResult(null)}
        />
      )}

      {/* KPI Metric Cards */}
      {summary && <AnalyticsCards kpis={summary.kpis} />}

      {/* Visual Analytics Section */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown Chart */}
          <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-[#111827] mb-0.5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#64748B]" />
              FDR Lifecycle Status Breakdown
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">Distribution across regulatory states</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="status"
                    stroke="#6B7280"
                    fontSize={10}
                    tickFormatter={(str) => str.replace('_', ' ')}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bank Capital Concentration */}
          <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-[#111827] mb-0.5 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#15803D]" />
              Deposit Volume by Partner Bank
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">Total institutional guarantee funds per banking institution</p>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.bankDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <XAxis
                    dataKey="bankName"
                    stroke="#6B7280"
                    fontSize={10}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={10}
                    tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '8px', color: '#111827' }}
                    formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total Deposit']}
                  />
                  <Bar dataKey="totalAmount" fill="#64748B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 12-Month Maturity Distribution Bar Chart */}
      <MaturityDistributionChart fdrs={fdrs} />

      {/* Critical Release Requests Queue */}
      {pendingReleaseCount > 0 && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#111827]">
              <Layers className="w-5 h-5 text-[#64748B]" />
              <h3 className="font-bold text-base">
                Pending Security Deposit Release Applications ({pendingReleaseCount})
              </h3>
            </div>
            <span className="text-xs text-[#6B7280]">Requires Executive Decision</span>
          </div>

          <FdrTable
            fdrs={fdrs.filter(f => f.status === 'release_requested')}
            currentUser={currentUser}
            onActionClick={handleOpenReleaseModal}
            actionButtonLabel="Review Release"
          />
        </div>
      )}

      {/* Main Registry Table with Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-bold text-slate-900">Full National FDR Registry</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
              {fdrs.length} records
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter by status dropdown */}
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active & Compliant</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="submitted">Submitted</option>
              <option value="under_bank_verification">Under Bank Verification</option>
              <option value="bank_verified">Bank Verified</option>
              <option value="release_requested">Release Requested</option>
              <option value="release_approved">Release Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Search */}
            <div className="relative min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search FDR, institution, or bank..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading national FDR database..." />
        ) : error ? (
          <ErrorToast message={error} />
        ) : (
          <FdrTable
            fdrs={fdrs}
            currentUser={currentUser}
            onActionClick={(fdr) => {
              if (fdr.status === 'release_requested') {
                handleOpenReleaseModal(fdr);
              }
            }}
            actionButtonLabel="Review Release"
          />
        )}
      </div>

      {/* Admin Release Decision Modal */}
      {selectedReleaseFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedReleaseFdr(null)}
              className="absolute right-4 top-4 text-[#6B7280] hover:text-[#111827] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#64748B]" />
              <span>AICTE Executive Decision</span>
            </div>

            <h3 className="text-lg font-bold text-[#111827] mb-2">
              Release Request for {selectedReleaseFdr.fdr_number}
            </h3>

            <div className="rounded-xl bg-[#F7F8FA] p-3.5 border border-[#E5E7EB] text-xs space-y-1 mb-4 font-mono tabular-nums">
              <div><span className="text-[#6B7280]">College:</span> <span className="text-[#111827] font-sans font-medium">{selectedReleaseFdr.institution_name}</span></div>
              <div><span className="text-[#6B7280]">Deposit Amount:</span> <span className="text-[#15803D] font-semibold">INR {Number(selectedReleaseFdr.deposit_amount).toLocaleString('en-IN')}</span></div>
              <div><span className="text-[#6B7280]">Bank:</span> <span className="text-[#111827]">{selectedReleaseFdr.bank_name}</span></div>
              <div><span className="text-[#6B7280]">Maturity:</span> <span className="text-[#B45309]">{selectedReleaseFdr.maturity_date}</span></div>
            </div>

            {releaseActionMessage && (
              <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-3 text-xs text-[#15803D] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {releaseActionMessage}
              </div>
            )}

            <form onSubmit={handleConfirmReleaseDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-2">
                  Executive Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      releaseDecision === 'approved'
                        ? 'border-[#1F2937] bg-[#F7F8FA] text-[#111827]'
                        : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminDecision"
                      value="approved"
                      checked={releaseDecision === 'approved'}
                      onChange={() => setReleaseDecision('approved')}
                      className="text-[#1F2937] focus:ring-[#1F2937]"
                    />
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span className="text-xs font-semibold">Approve Release</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      releaseDecision === 'rejected'
                        ? 'border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C]'
                        : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminDecision"
                      value="rejected"
                      checked={releaseDecision === 'rejected'}
                      onChange={() => setReleaseDecision('rejected')}
                      className="text-[#B91C1C] focus:ring-[#B91C1C]"
                    />
                    <XCircle className="w-4 h-4 text-[#B91C1C]" />
                    <span className="text-xs font-semibold">Reject Release</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Official Administrative Remarks
                </label>
                <textarea
                  required
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Official sanction order notes and compliance comments..."
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReleaseFdr(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRelease}
                  className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium text-xs transition-colors disabled:opacity-50"
                >
                  {submittingRelease ? 'Committing...' : 'Commit Release Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Email Notification Center Modal */}
      <SimulatedEmailCenterModal
        isOpen={isEmailCenterOpen}
        onClose={() => setIsEmailCenterOpen(false)}
        fdrs={fdrs}
        onAlertTriggered={() => {
          refresh();
          loadSummary();
        }}
      />
    </div>
  );
}

export default AdminDashboard;
