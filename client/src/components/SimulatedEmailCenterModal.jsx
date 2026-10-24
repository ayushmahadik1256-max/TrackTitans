import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Server,
  Inbox,
} from 'lucide-react';
import { getSimulatedEmails, triggerAll30DayAlerts, triggerMaturityAlert } from '../services/notificationSimulator.js';

export function SimulatedEmailCenterModal({
  isOpen,
  onClose,
  fdrs = [],
  onAlertTriggered,
}) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const loadEmails = () => {
    const list = getSimulatedEmails();
    setEmails(list);
    if (!selectedEmail && list.length > 0) {
      setSelectedEmail(list[0]);
    } else if (selectedEmail) {
      const found = list.find((e) => e.id === selectedEmail.id);
      if (found) setSelectedEmail(found);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const eligible30DayFdrs = fdrs.filter((f) => {
    const days = f.days_to_maturity !== undefined
      ? f.days_to_maturity
      : Math.ceil((new Date(f.maturity_date) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= 0 && f.status !== 'release_approved';
  });

  const handleTriggerAll = async () => {
    setTriggering(true);
    setToastMessage(null);
    try {
      const dispatched = await triggerAll30DayAlerts(fdrs);
      loadEmails();
      if (dispatched.length > 0) {
        setSelectedEmail(dispatched[0]);
        setToastMessage(`Dispatched ${dispatched.length} Nodemailer maturity alert email(s) for 30, 15, and 7 day thresholds.`);
      } else {
        setToastMessage('Triggered simulated 30-day compliance alert.');
        if (fdrs.length > 0) {
          const testEmail = await triggerMaturityAlert(fdrs[0], 7);
          loadEmails();
          setSelectedEmail(testEmail);
        }
      }
      if (onAlertTriggered) onAlertTriggered();
    } catch (err) {
      setToastMessage('Failed to trigger simulation: ' + err.message);
    } finally {
      setTriggering(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'critical') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] flex items-center gap-1 font-mono">
          <ShieldAlert className="w-3 h-3" /> Critical (≤ 7d)
        </span>
      );
    }
    if (urgency === 'urgent') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3" /> Urgent (≤ 15d)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F7F8FA] text-[#475569] border border-[#E5E7EB] flex items-center gap-1 font-mono">
        <Clock className="w-3 h-3" /> Notice (≤ 30d)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1F2937] flex items-center justify-center text-white shrink-0">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#111827] tracking-tight">
                  Nodemailer Simulated Outbox & Delivery Center
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
                  SMTP Active
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                Dispatches regulatory compliance notices for FDRs maturing within 30, 15, and 7 days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerAll}
              disabled={triggering}
              className="px-3.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${triggering ? 'animate-spin' : ''}`} />
              <span>{triggering ? 'Dispatching...' : 'Trigger 30-Day Alert Check'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-[#F0FDF4] border-b border-[#BBF7D0] px-6 py-2.5 text-xs text-[#15803D] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-[#15803D] hover:underline text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Two-Pane Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: List of Notifications */}
          <div className="md:col-span-5 border-r border-[#E5E7EB] overflow-y-auto bg-[#F7F8FA]/40 p-3 space-y-2">
            <div className="px-3 py-1.5 flex items-center justify-between text-xs text-[#6B7280] font-medium border-b border-[#E5E7EB]">
              <span>Outbox ({emails.length})</span>
              <span className="text-[11px] font-mono text-[#4B5563] tabular-nums">
                {eligible30DayFdrs.length} in 30-day window
              </span>
            </div>

            {emails.length === 0 ? (
              <div className="text-center py-12 text-[#9CA3AF] text-xs space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-[#9CA3AF]" />
                <p>No simulated emails dispatched yet.</p>
                <button
                  onClick={handleTriggerAll}
                  className="text-[#1F2937] underline font-medium"
                >
                  Click to trigger test 30-day alert
                </button>
              </div>
            ) : (
              emails.map((item) => {
                const isSelected = selectedEmail?.id === item.id;
                const formattedTime = new Date(item.sentAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEmail(item)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-white border-[#1F2937] shadow-xs'
                        : 'bg-white border-[#E5E7EB] hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getUrgencyBadge(item.urgency)}
                      <span className="text-[10px] font-mono text-[#6B7280] tabular-nums">{formattedTime}</span>
                    </div>

                    <div className="text-xs font-semibold text-[#111827] line-clamp-1">
                      {item.subject}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6B7280]">
                      <span className="truncate max-w-[170px]">{item.recipientEmail}</span>
                      <span className="text-[#15803D] flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Sent
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Full Email View */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-white overflow-y-auto p-5 space-y-4">
            {selectedEmail ? (
              <>
                {/* Envelope Meta Bar */}
                <div className="rounded-xl bg-[#F7F8FA] p-3.5 border border-[#E5E7EB] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">From:</span>
                    <span className="text-[#111827] font-medium">{selectedEmail.sender}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">To:</span>
                    <span className="text-[#111827] font-mono">{selectedEmail.recipientEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Subject:</span>
                    <span className="text-[#111827] font-semibold">{selectedEmail.subject}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-[#E5E7EB] text-[11px] text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3 text-[#15803D]" />
                      {selectedEmail.transporter}
                    </span>
                    <span className="font-mono text-[#9CA3AF]">ID: {selectedEmail.messageId}</span>
                  </div>
                </div>

                {/* Rendered HTML Email Body Preview */}
                <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-5 text-[#111827] overflow-y-auto max-h-[48vh] shadow-xs">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#E5E7EB]">
                  <span>Audit Trail: Recorded in PostgreSQL notifications table</span>
                  <span className="text-[#15803D] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Deduplication Lock Active
                  </span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#9CA3AF] space-y-2">
                <Mail className="w-10 h-10 text-[#9CA3AF]" />
                <p className="text-xs font-medium">Select a notification on the left to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulatedEmailCenterModal;
