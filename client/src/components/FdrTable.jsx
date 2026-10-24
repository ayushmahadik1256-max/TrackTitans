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
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg font-mono tabular-nums">
          <Clock className="w-3.5 h-3.5 text-rose-600" /> Matured ({Math.abs(days)}d ago)
        </span>
      );
    }
    if (days <= 7) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg font-mono tabular-nums">
          In {days} days (Critical)
        </span>
      );
    }
    if (days <= 15) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-mono tabular-nums">
          In {days} days (Urgent)
        </span>
      );
    }
    if (days <= 30) {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50/70 border border-amber-200 px-2 py-0.5 rounded-lg font-mono tabular-nums">
          In {days} days
        </span>
      );
    }
    if (days > 365) {
      const years = (days / 365.25).toFixed(1);
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-mono tabular-nums">
          {years} yrs left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-mono tabular-nums">
        {days} days left
      </span>
    );
  };

  if (!fdrs || fdrs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 soft-card">
        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <h4 className="font-bold text-slate-900 text-base mb-1">No FDR Records Found</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          No records match the active criteria. Adjust search filter or register a new FDR.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white soft-card">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 font-bold text-xs uppercase tracking-wider text-slate-600">
            <th className="py-3.5 px-4">FDR Number</th>
            <th className="py-3.5 px-4">Institution</th>
            <th className="py-3.5 px-4">Bank & Branch</th>
            <th className="py-3.5 px-4 text-right">Deposit Amount</th>
            <th className="py-3.5 px-4">Maturity Countdown</th>
            <th className="py-3.5 px-4 text-center">Lien Marked</th>
            <th className="py-3.5 px-4">Compliance Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {fdrs.map((fdr) => (
            <tr
              key={fdr.id}
              className="hover:bg-slate-50/70 transition-colors"
            >
              <td className="py-3.5 px-4 whitespace-nowrap">
                <Link
                  to={`/fdrs/${fdr.id}`}
                  className="font-mono font-semibold text-slate-900 hover:text-blue-600 hover:underline block text-sm"
                >
                  {fdr.fdr_number}
                </Link>
                <span className="text-xs text-slate-500 font-sans">
                  Issued: {fdr.issue_date}
                </span>
              </td>

              <td className="py-3.5 px-4">
                <div className="font-semibold text-slate-900 line-clamp-1 text-sm">
                  {fdr.institution_name}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {fdr.aicte_application_id || 'AICTE Application'}
                </div>
              </td>

              <td className="py-3.5 px-4">
                <div className="text-slate-900 font-semibold line-clamp-1 text-sm">
                  {fdr.bank_name || 'Unassigned'}
                </div>
                <div className="text-xs text-slate-500 line-clamp-1">
                  {fdr.branch_name || fdr.ifsc_code || 'Main Branch'}
                </div>
              </td>

              <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap font-mono tabular-nums text-sm">
                {formatCurrency(fdr.deposit_amount)}
              </td>

              <td className="py-3.5 px-4 whitespace-nowrap">
                <div className="text-xs text-slate-500 mb-0.5 font-mono tabular-nums">
                  {fdr.maturity_date}
                </div>
                {getMaturityCountdownBadge(fdr)}
              </td>

              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                {fdr.lien_marked ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Marked
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">
                    Not Marked
                  </span>
                )}
              </td>

              <td className="py-3.5 px-4 whitespace-nowrap">
                <StatusBadge status={fdr.status} />
              </td>

              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, fdr)}
                    disabled={downloadingId === fdr.id}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors hover-lift"
                    title="Download FDR Certificate (PDF / Image)"
                  >
                    <Download className={`w-4 h-4 ${downloadingId === fdr.id ? 'animate-bounce' : ''}`} />
                  </button>

                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors hover-lift"
                    title="View Lifecycle Audit Trail"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {onActionClick && (
                    <button
                      type="button"
                      onClick={() => onActionClick(fdr)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg soft-button-primary hover-lift cursor-pointer"
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
