import React from 'react';
import { Loader2 } from 'lucide-react';

export function Loader({ message = 'Loading records...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#6B7280]">
      <Loader2 className="w-7 h-7 animate-spin text-[#1F2937]" />
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
}

export default Loader;
