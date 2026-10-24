import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge.jsx';
import {
  Download,
  ExternalLink,
  ShieldCheck,
  Clock,
  FileText,
} from 'lucide-react';
import { getFdrDocumentDownloadUrl } from '../services/fdrService.js';

export function FdrTable({
  fdrs = [],
  currentUser,
  onActionClick,
  actionButtonLabel,
}) {
  const [downloadingId, setDownloadingId] = useState(null);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  const handleDownload = async (e, fdr) => {
    e.stopPropagation();
    try {
      setDownloadingId(fdr.id);
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
      console.error('Failed to download document:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const getMaturityCountdownBadge = (fdr) => {
    const days = fdr.days_to_maturity !== undefined
      ? fdr.days_to_maturity
      : Math.ceil((new Date(fdr.maturity_date) - new Date()) / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B91C1C] font-mono tabular-nums">
          <Clock className="w-3 h-3 text-[#B91C1C]" /> Matured ({Math.abs(days)}d ago)
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B91C1C] bg-[#FEF2F2] border border-[#FECACA] px-1.5 py-0.5 rounded font-mono tabular-nums">
          In {days} days (Critical)
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-1.5 py-0.5 rounded font-mono tabular-nums">
          In {days} days (Urgent)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B45309] font-mono tabular-nums">
          In {days} days
        </span>
      );
    }
    if (days > 365) {
      const years = (days / 365.25).toFixed(1);
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280] font-mono tabular-nums">
          {years} yrs left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-[#4B5563] font-mono tabular-nums">
        {days} days left
      </span>
    );
  };

  if (!fdrs || fdrs.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-12 text-center text-[#6B7280]">
        <FileText className="w-10 h-10 mx-auto mb-3 text-[#9CA3AF]" />
        <h4 className="font-semibold text-[#111827] text-sm mb-1">No FDR Records Found</h4>
        <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
          No records match the active criteria. Adjust search filter or register a new FDR.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F7F8FA] font-semibold text-[#4B5563]">
            <th className="py-3 px-4">FDR Number</th>
            <th className="py-3 px-4">Institution</th>
            <th className="py-3 px-4">Bank & Branch</th>
            <th className="py-3 px-4 text-right">Deposit Amount</th>
            <th className="py-3 px-4">Maturity Countdown</th>
            <th className="py-3 px-4 text-center">Lien Marked</th>
            <th className="py-3 px-4">Compliance Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F3F4F6]">
          {fdrs.map((fdr) => (
            <tr
              key={fdr.id}
              className="hover:bg-[#F7F8FA] transition-colors"
            >
              <td className="py-3 px-4 whitespace-nowrap">
                <Link
                  to={`/fdrs/${fdr.id}`}
                  className="font-mono font-medium text-[#111827] hover:underline hover:text-[#1F2937] block"
                >
                  {fdr.fdr_number}
                </Link>
                <span className="text-[11px] text-[#6B7280] font-sans">
                  Issued: {fdr.issue_date}
                </span>
              </td>

              <td className="py-3 px-4">
                <div className="font-medium text-[#111827] line-clamp-1">
                  {fdr.institution_name}
                </div>
                <div className="text-[11px] text-[#6B7280] font-mono">
                  {fdr.aicte_application_id || 'AICTE Application'}
                </div>
              </td>

              <td className="py-3 px-4">
                <div className="text-[#111827] font-medium line-clamp-1">
                  {fdr.bank_name || 'Unassigned'}
                </div>
                <div className="text-[11px] text-[#6B7280] line-clamp-1">
                  {fdr.branch_name || fdr.ifsc_code || 'Main Branch'}
                </div>
              </td>

              <td className="py-3 px-4 text-right font-semibold text-[#111827] whitespace-nowrap font-mono tabular-nums">
                {formatCurrency(fdr.deposit_amount)}
              </td>

              <td className="py-3 px-4 whitespace-nowrap">
                <div className="text-[11px] text-[#6B7280] mb-0.5 font-mono tabular-nums">
                  {fdr.maturity_date}
                </div>
                {getMaturityCountdownBadge(fdr)}
              </td>

              <td className="py-3 px-4 text-center whitespace-nowrap">
                {fdr.lien_marked ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3.5 h-3.5" /> Marked
                  </span>
                ) : (
                  <span className="text-[11px] text-[#9CA3AF]">
                    Not Marked
                  </span>
                )}
              </td>

              <td className="py-3 px-4 whitespace-nowrap">
                <StatusBadge status={fdr.status} />
              </td>

              <td className="py-3 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, fdr)}
                    disabled={downloadingId === fdr.id}
                    className="p-1.5 rounded border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#4B5563] hover:text-[#111827] transition-colors"
                    title="Download FDR Certificate (PDF / Image)"
                  >
                    <Download className={`w-3.5 h-3.5 ${downloadingId === fdr.id ? 'animate-bounce' : ''}`} />
                  </button>

                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="p-1.5 rounded border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#4B5563] hover:text-[#111827] transition-colors"
                    title="View Lifecycle Audit Trail"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {onActionClick && (
                    <button
                      type="button"
                      onClick={() => onActionClick(fdr)}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-[#1F2937] hover:bg-[#111827] text-white transition-colors"
                    >
                      {actionButtonLabel || 'Action'}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FdrTable;
