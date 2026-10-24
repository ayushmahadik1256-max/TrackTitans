import React from 'react';
import { ShieldCheck, Building2, Landmark } from 'lucide-react';

export function RoleBadge({ role, size = 'md' }) {
  const configs = {
    aicte_admin: {
      label: 'AICTE Administrator',
      style: 'text-purple-700 bg-purple-50 border-purple-200',
      icon: ShieldCheck,
    },
    bank: {
      label: 'Partner Bank',
      style: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      icon: Landmark,
    },
    institution: {
      label: 'Technical Institution',
      style: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: Building2,
    },
  };

  const config = configs[role] || {
    label: role ? role.replace('_', ' ') : 'User',
    style: 'text-slate-700 bg-slate-50 border-slate-200',
    icon: Building2,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-semibold' : 'px-3 py-1 text-sm font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border ${config.style} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  );
}

export default RoleBadge;
