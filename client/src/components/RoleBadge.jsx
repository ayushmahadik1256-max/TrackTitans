import React from 'react';
import { ShieldCheck, Building2, Landmark } from 'lucide-react';

export function RoleBadge({ role, size = 'md' }) {
  const configs = {
    aicte_admin: {
      label: 'AICTE Administrator',
      style: 'text-gray-900 bg-gray-100 border-gray-300',
      icon: ShieldCheck,
    },
    bank: {
      label: 'Partner Bank',
      style: 'text-gray-800 bg-gray-100 border-gray-300',
      icon: Landmark,
    },
    institution: {
      label: 'Technical Institution',
      style: 'text-gray-800 bg-gray-100 border-gray-300',
      icon: Building2,
    },
  };

  const config = configs[role] || {
    label: role ? role.replace('_', ' ') : 'User',
    style: 'text-gray-700 bg-gray-50 border-gray-200',
    icon: Building2,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${config.style} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3 text-gray-500' : 'w-3.5 h-3.5 text-gray-600'} />
      <span>{config.label}</span>
    </span>
  );
}

export default RoleBadge;
