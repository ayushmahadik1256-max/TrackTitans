import React from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { Calendar, User, CheckCircle2 } from 'lucide-react';

export function FdrStatusTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-[#6B7280] italic">
        No lifecycle status transitions recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7EB]">
      {history.map((event, index) => {
        const isLatest = index === history.length - 1;
        const formattedDate = new Date(event.created_at).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });

        return (
          <div key={event.id || index} className="relative">
            <div
              className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isLatest
                  ? 'border-[#1F2937] bg-[#1F2937] text-white shadow-xs'
                  : 'border-[#9CA3AF] bg-white text-[#9CA3AF]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
            </div>

            <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={event.new_status} />
                  {event.previous_status && (
                    <span className="text-xs text-[#6B7280]">
                      (from {event.previous_status.replace('_', ' ')})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {event.notes && (
                <p className="text-xs text-[#111827] leading-relaxed bg-white p-2.5 rounded-lg border border-[#E5E7EB] mb-2">
                  {event.notes}
                </p>
              )}

              <div className="flex items-center gap-1 text-[11px] text-[#6B7280]">
                <User className="w-3 h-3 text-[#9CA3AF]" />
                <span>Action by:</span>
                <span className="font-semibold text-[#111827]">
                  {event.changed_by_name || 'System'}
                </span>
                {event.changed_by_role && (
                  <span className="text-[#6B7280]">({event.changed_by_role})</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FdrStatusTimeline;
