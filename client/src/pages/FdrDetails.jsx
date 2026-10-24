import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { getFdrById, getFdrDocumentDownloadUrl } from '../services/fdrService.js';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { FdrStatusTimeline } from '../components/FdrStatusTimeline.jsx';
import { Loader } from '../components/Loader.jsx';
import { ErrorToast } from '../components/ErrorToast.jsx';
import {
  ArrowLeft,
  Download,
  ShieldCheck,
  Building2,
  Landmark,
  Calendar,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function FdrDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [fdr, setFdr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadFdrData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFdrById(id);
      setFdr(data);
    } catch (err) {
      setError(err.message || 'Failed to load FDR details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFdrData();
  }, [id]);

  const handleDownload = async () => {
    if (!fdr) return;
    try {
      setDownloading(true);
      const data = await getFdrDocumentDownloadUrl(fdr.id);
      if (data && data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.fileName || `${fdr.fdr_number}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <Loader message="Decrypting and loading FDR record audit trail..." />;
  }

  if (error || !fdr) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <ErrorToast message={error || 'FDR record not found'} />
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#111827] hover:underline mt-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F8FA] text-[#4B5563] border border-[#E5E7EB] text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
          <span>{downloading ? 'Generating Pre-signed S3 URL...' : 'Download Verified Certificate'}</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-4 text-xs text-[#15803D] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {actionSuccess}
        </div>
      )}

      {/* Main FDR Details Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F3F4F6]">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-[#111827]">
                {fdr.fdr_number}
              </h1>
              <StatusBadge status={fdr.status} />
            </div>
            <p className="text-xs text-[#6B7280]">
              Institutional Security Deposit Record ID: <span className="font-mono text-[#111827]">{fdr.id}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#6B7280] block">Deposit Principal Amount</span>
            <span className="text-3xl font-bold text-[#15803D] font-mono tabular-nums">
              {formatCurrency(fdr.deposit_amount)}
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl bg-[#F7F8FA] p-4 border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1.5 uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#4B5563]" /> Depositing College
            </span>
            <div className="text-sm font-semibold text-[#111827] pt-0.5">{fdr.institution_name}</div>
            <div className="text-xs font-mono text-[#6B7280]">{fdr.aicte_application_id}</div>
            <div className="text-xs text-[#6B7280]">{fdr.institution_email}</div>
          </div>

          <div className="rounded-xl bg-[#F7F8FA] p-4 border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1.5 uppercase">
              <Landmark className="w-3.5 h-3.5 text-[#4B5563]" /> Issuing Partner Bank
            </span>
            <div className="text-sm font-semibold text-[#111827] pt-0.5">{fdr.bank_name || 'Commercial Bank'}</div>
            <div className="text-xs text-[#4B5563]">{fdr.branch_name || 'Main Branch'}</div>
            <div className="text-xs font-mono text-[#6B7280]">IFSC: {fdr.ifsc_code || 'SBIN0000691'}</div>
          </div>

          <div className="rounded-xl bg-[#F7F8FA] p-4 border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4B5563]" /> Regulatory Lien Status
            </span>
            <div className="pt-0.5">
              {fdr.lien_marked ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> Marked in Favor of Member Secretary AICTE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-0.5 rounded">
                  <AlertTriangle className="w-3.5 h-3.5" /> Not Marked / Pending Bank Action
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-[#F7F8FA] p-4 border border-[#E5E7EB] space-y-1">
            <span className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1.5 uppercase">
              <Calendar className="w-3.5 h-3.5 text-[#4B5563]" /> Term Timeline
            </span>
            <div className="text-xs text-[#4B5563] pt-0.5 font-mono tabular-nums">
              <span className="text-[#6B7280]">Issue Date:</span> <span className="font-medium text-[#111827]">{fdr.issue_date}</span>
            </div>
            <div className="text-xs text-[#4B5563] font-mono tabular-nums">
              <span className="text-[#6B7280]">Maturity Date:</span> <span className="font-medium text-[#B45309]">{fdr.maturity_date}</span>
            </div>
          </div>

          <div className="rounded-xl bg-[#F7F8FA] p-4 border border-[#E5E7EB] space-y-1 md:col-span-2">
            <span className="text-[11px] font-semibold text-[#6B7280] flex items-center gap-1.5 uppercase">
              <Lock className="w-3.5 h-3.5 text-[#4B5563]" /> Integrity Checksum (SHA-256)
            </span>
            <div className="text-xs font-mono text-[#111827] break-all pt-1 bg-white p-2 rounded border border-[#E5E7EB] tabular-nums">
              {fdr.file_checksum_sha256}
            </div>
            <div className="text-[11px] text-[#6B7280]">
              Original File: {fdr.original_file_name} ({(fdr.file_size_bytes / 1024 / 1024).toFixed(2)} MB)
            </div>
          </div>
        </div>

        {fdr.remarks && (
          <div className="rounded-xl bg-[#F7F8FA] p-4 border border-[#E5E7EB]">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider block mb-1">
              FDR Purpose & Remarks
            </span>
            <p className="text-xs text-[#111827]">{fdr.remarks}</p>
          </div>
        )}
      </div>

      {/* Audit Trail Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#111827] tracking-tight">
            Immutable Regulatory Audit History
          </h2>
          <p className="text-xs text-[#6B7280]">
            Chronological audit trail of all lifecycle states, bank confirmations, and regulatory approvals
          </p>
        </div>

        <FdrStatusTimeline history={fdr.history || []} />
      </div>
    </div>
  );
}

export default FdrDetails;
