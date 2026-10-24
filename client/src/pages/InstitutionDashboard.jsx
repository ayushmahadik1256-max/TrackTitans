import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFdrs } from '../hooks/useFdrs.js';
import { FdrTable } from '../components/FdrTable.jsx';
import { InstitutionSummaryDashboard } from '../components/InstitutionSummaryDashboard.jsx';
import { SimulatedEmailCenterModal } from '../components/SimulatedEmailCenterModal.jsx';
import { EscrowVaultVisual3D } from '../components/EscrowVaultVisual3D.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorToast } from '../components/ErrorToast.jsx';
import { requestFdrRelease } from '../services/fdrService.js';
import { triggerMaturityAlert } from '../services/notificationSimulator.js';
import {
  Building2,
  Upload,
  Search,
  CheckCircle2,
  FileCheck,
  X,
  Mail,
  Box,
} from 'lucide-react';

export function InstitutionDashboard() {
  const { currentUser } = useAuth();
  const { fdrs, loading, error, filters, setFilters, refresh } = useFdrs();

  // Release request modal state
  const [selectedFdrForRelease, setSelectedFdrForRelease] = useState(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [submittingRelease, setSubmittingRelease] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState(null);
  const [releaseError, setReleaseError] = useState(null);

  // Email Notification Center state
  const [isEmailCenterOpen, setIsEmailCenterOpen] = useState(false);
  const [emailAlertSuccess, setEmailAlertSuccess] = useState(null);

  // 3D Escrow Vault visibility state
  const [show3DVault, setShow3DVault] = useState(true);

  // Status Filter tabs
  const activeStatus = filters.status || 'all';

  const filterTabs = [
    { id: 'all', label: 'All Records' },
    { id: 'active', label: 'Active & Compliant' },
    { id: 'expiring_soon', label: 'Expiring Soon' },
    { id: 'submitted', label: 'Pending Bank Review' },
    { id: 'release_requested', label: 'Release Requested' },
  ];

  const handleOpenReleaseModal = (fdr) => {
    setSelectedFdrForRelease(fdr);
    setReleaseNotes('');
    setReleaseError(null);
    setReleaseSuccess(null);
  };

  const handleConfirmReleaseRequest = async (e) => {
    e.preventDefault();
    if (!selectedFdrForRelease) return;

    setSubmittingRelease(true);
    setReleaseError(null);

    try {
      await requestFdrRelease(selectedFdrForRelease.id, { notes: releaseNotes }, currentUser);
      setReleaseSuccess(`Release request for FDR ${selectedFdrForRelease.fdr_number} submitted to AICTE.`);
      setTimeout(() => {
        setSelectedFdrForRelease(null);
        refresh();
      }, 1500);
    } catch (err) {
      setReleaseError(err.message || 'Failed to submit release request.');
    } finally {
      setSubmittingRelease(false);
    }
  };

  const handleSimulateEmailForFdr = async (fdr) => {
    try {
      await triggerMaturityAlert(fdr);
      setEmailAlertSuccess(`Simulated 30-day maturity alert dispatched via Nodemailer for FDR ${fdr.fdr_number}`);
      setIsEmailCenterOpen(true);
      setTimeout(() => setEmailAlertSuccess(null), 4000);
    } catch (err) {
      console.error('Failed to trigger email alert:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white">
      {/* Institution Banner */}
      <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] mb-2">
              <Building2 className="w-4 h-4 text-[#64748B]" />
              <span>Technical Institution Central Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              {currentUser?.institution_name || 'Delhi Institute of Engineering & Technology'}
            </h1>
            <p className="text-xs text-[#6B7280] mt-1 font-mono">
              AICTE Application ID: {currentUser?.aicte_application_id || 'AICTE-1-9321482910'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShow3DVault(!show3DVault)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB] font-medium text-xs transition-colors"
            >
              <Box className="w-3.5 h-3.5 text-[#64748B]" />
              <span>{show3DVault ? 'Hide 3D Vault' : 'View 3D Vault'}</span>
            </button>

            <button
              onClick={() => setIsEmailCenterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB] font-medium text-xs transition-colors"
              title="Open Nodemailer Simulated Outbox"
            >
              <Mail className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Nodemailer Email Center</span>
            </button>

            <Link
              to="/upload-fdr"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium text-xs transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Register New FDR</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3D Tripartite Escrow Vault Visualizer */}
      {show3DVault && (
        <EscrowVaultVisual3D
          title="Digital Escrow Consensus Architecture"
          subtitle="Real-time multi-party guarantee state: Institution · State Bank · AICTE"
          height="240px"
        />
      )}

      {/* Email Alert Banner */}
      {emailAlertSuccess && (
        <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-4 text-xs text-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>{emailAlertSuccess}</span>
          </div>
          <button
            onClick={() => setIsEmailCenterOpen(true)}
            className="text-xs text-[#15803D] hover:underline font-medium"
          >
            View in Outbox
          </button>
        </div>
      )}

      {/* Institution Summary Dashboard (KPIs, Recharts Bar Chart, and Alerts) */}
      <InstitutionSummaryDashboard
        fdrs={fdrs}
        institutionName={currentUser?.institution_name}
        aicteApplicationId={currentUser?.aicte_application_id}
        onSelectFilter={(status) => setFilters({ ...filters, status })}
        onRequestRelease={handleOpenReleaseModal}
        onOpenEmailCenter={() => setIsEmailCenterOpen(true)}
        onSimulateEmailForFdr={handleSimulateEmailForFdr}
      />

      {/* FDR Records Registry & Filters */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-[#F7F8FA] p-1 rounded-lg border border-[#E5E7EB]">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilters({ ...filters, status: tab.id })}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  activeStatus === tab.id
                    ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search FDR number or bank..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
            />
          </div>
        </div>

        {/* FDR Table */}
        {loading ? (
          <Loader message="Loading your institutional FDR registry..." />
        ) : error ? (
          <ErrorToast message={error} />
        ) : (
          <FdrTable
            fdrs={fdrs}
            currentUser={currentUser}
            onActionClick={(fdr) => {
              if (['active', 'expiring_soon', 'matured'].includes(fdr.status)) {
                handleOpenReleaseModal(fdr);
              }
            }}
            actionButtonLabel="Request Release"
          />
        )}
      </div>

      {/* Release Request Modal */}
      {selectedFdrForRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedFdrForRelease(null)}
              className="absolute right-4 top-4 text-[#6B7280] hover:text-[#111827] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-1">
              <FileCheck className="w-4 h-4 text-[#64748B]" />
              <span>AICTE Security Deposit Release Application</span>
            </div>
            <h3 className="text-lg font-bold text-[#111827] mb-1">
              Request FDR Release & Refund
            </h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Apply to AICTE administrators for release of security deposit upon fulfillment of terms.
            </p>

            <div className="rounded-xl bg-[#F7F8FA] p-3.5 border border-[#E5E7EB] text-xs space-y-1 mb-4 font-mono tabular-nums">
              <div><span className="text-[#6B7280]">FDR Number:</span> <span className="text-[#111827] font-semibold">{selectedFdrForRelease.fdr_number}</span></div>
              <div><span className="text-[#6B7280]">Bank:</span> <span className="text-[#111827]">{selectedFdrForRelease.bank_name}</span></div>
              <div><span className="text-[#6B7280]">Amount:</span> <span className="text-[#15803D] font-semibold">INR {Number(selectedFdrForRelease.deposit_amount).toLocaleString('en-IN')}</span></div>
              <div><span className="text-[#6B7280]">Maturity:</span> <span className="text-[#B45309]">{selectedFdrForRelease.maturity_date}</span></div>
            </div>

            {releaseError && <ErrorToast message={releaseError} />}
            {releaseSuccess && (
              <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-3 text-xs text-[#15803D] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {releaseSuccess}
              </div>
            )}

            <form onSubmit={handleConfirmReleaseRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Justification / Remarks for AICTE Administration
                </label>
                <textarea
                  required
                  rows={3}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="e.g., Institution has completed mandatory term without regulatory infractions. Requesting release certificate."
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFdrForRelease(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRelease || !releaseNotes.trim()}
                  className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium text-xs transition-colors disabled:opacity-50"
                >
                  {submittingRelease ? 'Submitting...' : 'Submit Release Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Email Center Modal */}
      <SimulatedEmailCenterModal
        isOpen={isEmailCenterOpen}
        onClose={() => setIsEmailCenterOpen(false)}
        fdrs={fdrs}
        onAlertTriggered={() => refresh()}
      />
    </div>
  );
}

export default InstitutionDashboard;
