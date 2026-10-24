import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Building,
  RefreshCw,
  Archive,
} from 'lucide-react';

export function StatusBadge({ status }) {
  const configs = {
    submitted: {
      label: 'Submitted',
      style: 'text-slate-700 bg-slate-100 border-slate-200',
      icon: FileText,
    },
    under_bank_verification: {
      label: 'Bank Review',
      style: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: Building,
    },
    bank_verified: {
      label: 'Bank Verified',
      style: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: CheckCircle2,
    },
    active: {
      label: 'Active & Compliant',
      style: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: CheckCircle2,
    },
    expiring_soon: {
      label: 'Expiring Soon',
      style: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: AlertTriangle,
    },
    matured: {
      label: 'Matured',
      style: 'text-amber-800 bg-amber-50 border-amber-200',
      icon: Clock,
    },
    release_requested: {
      label: 'Release Requested',
      style: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      icon: RefreshCw,
    },
    release_approved: {
      label: 'Released / Refunded',
      style: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Archive,
    },
    rejected: {
      label: 'Rejected',
      style: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: XCircle,
    },
  };

  const config = configs[status] || {
    label: status ? status.replace('_', ' ') : 'Unknown',
    style: 'text-slate-700 bg-slate-100 border-slate-200',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.style}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
