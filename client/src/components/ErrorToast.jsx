import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export function ErrorToast({ message, errors = [], onDismiss }) {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-4 text-[#B91C1C] text-sm mb-6 flex items-start gap-3 shadow-xs">
      <AlertCircle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-[#B91C1C]">{message || 'An error occurred'}</h4>
        {errors && errors.length > 0 && (
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-[#B91C1C]/90">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[#B91C1C] hover:opacity-75 transition-opacity p-1"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default ErrorToast;
