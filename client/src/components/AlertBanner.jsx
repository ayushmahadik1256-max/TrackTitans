import React from 'react';
import { AlertTriangle, Clock, Info } from 'lucide-react';

export function AlertBanner({ type = 'warning', title, message, actionText, onAction }) {
  const configs = {
    warning: {
      border: 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]',
      icon: AlertTriangle,
      iconColor: 'text-[#B45309]',
    },
    critical: {
      border: 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]',
      icon: Clock,
      iconColor: 'text-[#B91C1C]',
    },
    info: {
      border: 'border-[#E5E7EB] bg-[#F7F8FA] text-[#111827]',
      icon: Info,
      iconColor: 'text-[#475569]',
    },
  };

  const config = configs[type] || configs.warning;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${config.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 sm:mt-0 ${config.iconColor}`} />
        <div>
          <span className="font-semibold">{title} </span>
          <span className="text-sm opacity-90">{message}</span>
        </div>
      </div>
      {actionText && (
        <button
          onClick={onAction}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-colors shrink-0 text-[#111827]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default AlertBanner;
