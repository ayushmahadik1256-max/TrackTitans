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
      style: 'text-[#475569] bg-[#F7F8FA] border-[#E5E7EB]',
      icon: FileText,
    },
    under_bank_verification: {
      label: 'Bank Review',
      style: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
      icon: Building,
    },
    bank_verified: {
      label: 'Bank Verified',
      style: 'text-[#1F2937] bg-[#F3F4F6] border-[#E5E7EB]',
      icon: CheckCircle2,
    },
    active: {
      label: 'Active & Compliant',
      style: 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]',
      icon: CheckCircle2,
    },
    expiring_soon: {
      label: 'Expiring Soon',
      style: 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]',
      icon: AlertTriangle,
    },
    matured: {
      label: 'Matured',
      style: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
      icon: Clock,
    },
    release_requested: {
      label: 'Release Requested',
      style: 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]',
      icon: RefreshCw,
    },
    release_approved: {
      label: 'Released / Refunded',
      style: 'text-[#15803D] bg-[#F0FDF4] border-[#BBF7D0]',
      icon: Archive,
    },
    rejected: {
      label: 'Rejected',
      style: 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]',
      icon: XCircle,
    },
  };

  const config = configs[status] || {
    label: status ? status.replace('_', ' ') : 'Unknown',
    style: 'text-[#4B5563] bg-[#F7F8FA] border-[#E5E7EB]',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${config.style}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}

export default StatusBadge;
