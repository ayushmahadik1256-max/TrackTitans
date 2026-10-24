import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useFdrs } from '../hooks/useFdrs.js';
import { FdrTable } from '../components/FdrTable.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorToast } from '../components/ErrorToast.jsx';
import { verifyFdr } from '../services/fdrService.js';
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Search,
  X,
} from 'lucide-react';

export function BankDashboard() {
  const { currentUser } = useAuth();
  const { fdrs, loading, error, filters, setFilters, refresh } = useFdrs();

  // Verification modal state
  const [selectedFdr, setSelectedFdr] = useState(null);
  const [decisionStatus, setDecisionStatus] = useState('bank_verified');
  const [lienMarked, setLienMarked] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const activeTab = filters.status || 'all';

  const filterTabs = [
    { id: 'all', label: 'All Bank Records' },
    { id: 'submitted', label: 'Pending Verification' },
    { id: 'bank_verified', label: 'Verified & Lien Marked' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const handleOpenVerifyModal = (fdr) => {
    setSelectedFdr(fdr);
    setDecisionStatus('bank_verified');
    setLienMarked(true);
    setNotes(`Lien in favour of Member Secretary AICTE verified against bank term deposit ledger.`);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedFdr) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await verifyFdr(
        selectedFdr.id,
        {
          status: decisionStatus,
          lien_marked: decisionStatus === 'bank_verified' ? lienMarked : false,
          notes,
        },
        currentUser
      );

      setActionSuccess(`FDR ${selectedFdr.fdr_number} successfully recorded as ${decisionStatus}.`);
      setTimeout(() => {
        setSelectedFdr(null);
        refresh();
      }, 1200);
    } catch (err) {
      setActionError(err.message || 'Verification update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = fdrs.filter(f => f.status === 'submitted' || f.status === 'under_bank_verification').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-white">
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#F7F8FA] border border-[#E5E7EB] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B5563] mb-2">
              <Landmark className="w-4 h-4 text-[#64748B]" />
              <span>Commercial Bank Branch Verification Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              {currentUser?.bank_name || 'State Bank of India'}
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Branch: {currentUser?.branch_name || 'Main Treasury Branch'} · IFSC: <span className="font-mono">{currentUser?.ifsc_code || 'SBIN0000691'}</span>
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-center min-w-[200px] shadow-xs">
            <span className="text-xs text-[#6B7280]">Verification Queue</span>
            <div className="text-3xl font-bold text-[#111827] mt-0.5 font-mono tabular-nums">
              {pendingCount}
            </div>
            <span className="text-[11px] text-[#6B7280]">FDRs awaiting review</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 bg-[#F7F8FA] p-1 rounded-lg border border-[#E5E7EB]">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilters({ ...filters, status: tab.id })}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search FDR number or college..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-lg bg-white border border-[#E5E7EB] pl-9 pr-3.5 py-2 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <Loader message="Loading assigned bank FDR records..." />
        ) : error ? (
          <ErrorToast message={error} />
        ) : (
          <FdrTable
            fdrs={fdrs}
            currentUser={currentUser}
            onActionClick={handleOpenVerifyModal}
            actionButtonLabel="Verify / Lien Review"
          />
        )}
      </div>

      {/* Bank Verification Action Modal */}
      {selectedFdr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedFdr(null)}
              className="absolute right-4 top-4 text-[#6B7280] hover:text-[#111827] p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-1">
              <Landmark className="w-4 h-4 text-[#64748B]" />
              <span>Bank Verification & Lien Confirmation</span>
            </div>

            <h3 className="text-lg font-bold text-[#111827] mb-2">
              Review FDR: {selectedFdr.fdr_number}
            </h3>

            <div className="rounded-xl bg-[#F7F8FA] p-3.5 border border-[#E5E7EB] text-xs space-y-1 mb-4 font-mono tabular-nums">
              <div><span className="text-[#6B7280]">Institution:</span> <span className="text-[#111827] font-sans font-medium">{selectedFdr.institution_name}</span></div>
              <div><span className="text-[#6B7280]">Deposit Amount:</span> <span className="text-[#15803D] font-semibold">INR {Number(selectedFdr.deposit_amount).toLocaleString('en-IN')}</span></div>
              <div><span className="text-[#6B7280]">Issue Date:</span> <span className="text-[#111827]">{selectedFdr.issue_date}</span></div>
              <div><span className="text-[#6B7280]">Maturity Date:</span> <span className="text-[#B45309]">{selectedFdr.maturity_date}</span></div>
            </div>

            {actionError && <ErrorToast message={actionError} />}
            {actionSuccess && (
              <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-3 text-xs text-[#15803D] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {actionSuccess}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-2">
                  Verification Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      decisionStatus === 'bank_verified'
                        ? 'border-[#1F2937] bg-[#F7F8FA] text-[#111827]'
                        : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="bank_verified"
                      checked={decisionStatus === 'bank_verified'}
                      onChange={() => setDecisionStatus('bank_verified')}
                      className="text-[#1F2937] focus:ring-[#1F2937]"
                    />
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span className="text-xs font-semibold">Verify & Approve</span>
                  </label>

                  <label
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                      decisionStatus === 'rejected'
                        ? 'border-[#B91C1C] bg-[#FEF2F2] text-[#B91C1C]'
                        : 'border-[#E5E7EB] bg-white text-[#6B7280]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value="rejected"
                      checked={decisionStatus === 'rejected'}
                      onChange={() => setDecisionStatus('rejected')}
                      className="text-[#B91C1C] focus:ring-[#B91C1C]"
                    />
                    <XCircle className="w-4 h-4 text-[#B91C1C]" />
                    <span className="text-xs font-semibold">Reject Record</span>
                  </label>
                </div>
              </div>

              {/* Lien Confirmation Switch */}
              {decisionStatus === 'bank_verified' && (
                <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-[#111827] block">
                      Lien Marked in Favor of AICTE
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Lien formally noted in core banking register
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={lienMarked}
                    onChange={(e) => setLienMarked(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F2937] border-gray-300 focus:ring-[#1F2937] cursor-pointer"
                  />
                </div>
              )}

              {/* Bank Remarks */}
              <div>
                <label className="block text-xs font-medium text-[#111827] mb-1">
                  Bank Officer Audit Remarks
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes recorded into permanent regulatory audit trail..."
                  className="w-full rounded-lg bg-white border border-[#E5E7EB] p-3 text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1F2937]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFdr(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium text-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Commit Bank Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankDashboard;
