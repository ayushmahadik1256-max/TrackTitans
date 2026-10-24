import React from 'react';
import {
  ShieldAlert,
  Clock,
  Landmark,
  IndianRupee,
  Layers,
  CheckCircle,
} from 'lucide-react';

export function AnalyticsCards({ kpis }) {
  if (!kpis) return null;

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  const cards = [
    {
      label: 'Total Locked Deposit Value',
      value: formatCurrency(kpis.totalLockedValue),
      subtext: `Across ${kpis.totalFdrs} active institutional FDRs`,
      icon: IndianRupee,
      iconColor: 'text-[#15803D]',
      iconBg: 'bg-[#F0FDF4] border-[#BBF7D0]',
      badge: `${kpis.totalLienMarked} Lien Marked`,
    },
    {
      label: 'Expiring in 7 Days (Critical)',
      value: kpis.expiring7Days,
      subtext: 'Mandatory roll-over notice',
      icon: ShieldAlert,
      iconColor: 'text-[#B91C1C]',
      iconBg: 'bg-[#FEF2F2] border-[#FECACA]',
      isCritical: kpis.expiring7Days > 0,
    },
    {
      label: 'Expiring in 15–30 Days',
      value: (kpis.expiring15Days || 0) + (kpis.expiring30Days || 0),
      subtext: `${kpis.expiring15Days} in 15d · ${kpis.expiring30Days} in 30d`,
      icon: Clock,
      iconColor: 'text-[#B45309]',
      iconBg: 'bg-[#FFFBEB] border-[#FDE68A]',
    },
    {
      label: 'Pending Bank Verification',
      value: kpis.pendingBankVerification,
      subtext: 'Awaiting branch confirmation',
      icon: Landmark,
      iconColor: 'text-[#475569]',
      iconBg: 'bg-[#F7F8FA] border-[#E5E7EB]',
    },
    {
      label: 'Release Requests Pending',
      value: kpis.releaseRequests,
      subtext: 'Colleges requesting deposit refund',
      icon: Layers,
      iconColor: 'text-[#1F2937]',
      iconBg: 'bg-[#F7F8FA] border-[#E5E7EB]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl bg-white border p-4 flex flex-col justify-between shadow-xs ${
              card.isCritical ? 'border-[#FECACA] bg-[#FEF2F2]/30' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${card.iconBg} ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold tracking-tight text-[#111827] mb-1 font-mono tabular-nums">
                {card.value}
              </div>
              <p className="text-xs text-[#6B7280]">{card.subtext}</p>
            </div>

            {card.badge && (
              <div className="mt-3 pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280]">Security Status</span>
                <span className="text-[#15803D] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {card.badge}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AnalyticsCards;
