import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-[#F7F8FA] text-[#4B5563] border border-[#E5E7EB] flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7 text-[#64748B]" />
        </div>
        <h1 className="text-2xl font-bold text-[#111827]">404 - Page Not Found</h1>
        <p className="text-xs text-[#6B7280]">
          The requested compliance route or FDR record does not exist on TrackTitans.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
