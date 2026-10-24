import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  IndianRupee,
  Layers,
  AlertTriangle,
  Landmark,
  CheckCircle2,
  Mail,
  Send,
} from 'lucide-react';
import { MaturityDistributionChart } from './MaturityDistributionChart.jsx';

export function InstitutionSummaryDashboard({
  fdrs = [],
  institutionName = 'Affiliated Technical Institution',
  aicteApplicationId = 'AICTE-1-XXXXXXXX',
  onSelectFilter,
  onRequestRelease,
  onOpenEmailCenter,
  onSimulateEmailForFdr,
}) {
  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  // 1. Calculate Active FDRs & Financials
  const activeFdrs = fdrs.filter(f => f.status === 'active' || f.status === 'expiring_soon' || f.status === 'bank_verified');
  const activeCount = activeFdrs.length;

  const totalActiveValue = activeFdrs.reduce((acc, f) => acc + Number(f.deposit_amount || 0), 0);
  const totalAllValue = fdrs.reduce((acc, f) => acc + Number(f.deposit_amount || 0), 0);

  const pendingVerificationCount = fdrs.filter(f => f.status === 'submitted' || f.status === 'under_bank_verification').length;

  // Lien coverage calculation
  const lienMarkedCount = fdrs.filter(f => f.lien_marked).length;
  const lienCoveragePercent = fdrs.length > 0 ? Math.round((lienMarkedCount / fdrs.length) * 100) : 100;

  // 2. Identify upcoming maturity alerts
  const critical7Days = [];
  const urgent15Days = [];
  const notice30Days = [];
  const alreadyMatured = [];

  fdrs.forEach(fdr => {
    if (fdr.status === 'release_approved' || fdr.status === 'rejected') return;

    const days = fdr.days_to_maturity !== undefined
      ? fdr.days_to_maturity
      : Math.ceil((new Date(fdr.maturity_date) - new Date()) / (1000 * 60 * 60 * 24));

    if (days < 0) {
      alreadyMatured.push({ ...fdr, days });
    } else if (days <= 7) {
      critical7Days.push({ ...fdr, days });
    } else if (days <= 15) {
      urgent15Days.push({ ...fdr, days });
    } else if (days <= 30) {
      notice30Days.push({ ...fdr, days });
    }
  });

  const totalUpcomingAlerts = critical7Days.length + urgent15Days.length + notice30Days.length + alreadyMatured.length;

  return (
    <div className="space-y-6">
      {/* Central Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active FDRs */}
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-5 soft-card hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Active Compliant FDRs
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-[#4B5563] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#111827] tracking-tight mb-1 font-mono tabular-nums">
            {activeCount}
            <span className="text-xs font-normal text-[#6B7280] ml-2 font-sans">of {fdrs.length} total</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F3F4F6]">
            <span className="text-[#6B7280]">Under Bank Review:</span>
            <span className="text-[#B45309] font-medium font-mono tabular-nums">{pendingVerificationCount} FDR(s)</span>
          </div>
        </div>

        {/* Card 2: Total Locked Deposit Value */}
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-5 soft-card hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Total Locked Deposit Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#15803D] tracking-tight mb-1 font-mono tabular-nums">
            {formatCurrency(totalActiveValue)}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F3F4F6]">
            <span className="text-[#6B7280]">Total Registered:</span>
            <span className="text-[#111827] font-medium font-mono tabular-nums">{formatCurrency(totalAllValue)}</span>
          </div>
        </div>

        {/* Card 3: Upcoming Maturity Alerts */}
        <div className={`rounded-2xl bg-white border p-5 soft-card hover-lift ${
          critical7Days.length > 0
            ? 'border-[#FECACA] bg-[#FEF2F2]/30'
            : totalUpcomingAlerts > 0
            ? 'border-[#FDE68A] bg-[#FFFBEB]/30'
            : 'border-[#E5E7EB]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Maturity Notices (≤ 30 Days)
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              critical7Days.length > 0
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#B91C1C]'
                : 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#111827] tracking-tight mb-1 flex items-baseline gap-2 font-mono tabular-nums">
            <span className={critical7Days.length > 0 ? 'text-[#B91C1C]' : totalUpcomingAlerts > 0 ? 'text-[#B45309]' : 'text-[#111827]'}>
              {totalUpcomingAlerts}
            </span>
            <span className="text-xs font-normal text-[#6B7280] font-sans">
              {critical7Days.length > 0 ? `(${critical7Days.length} critical)` : 'notices active'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F3F4F6]">
            <span className="text-[#6B7280]">Nodemailer Alerts:</span>
            <button
              type="button"
              onClick={onOpenEmailCenter}
              className="text-[#1F2937] hover:underline font-medium flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-[#64748B]" /> Outbox
            </button>
          </div>
        </div>

        {/* Card 4: AICTE Lien Compliance Health */}
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-5 soft-card hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
              Lien Marking Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] border border-[#E5E7EB] text-[#4B5563] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#111827] tracking-tight mb-1 flex items-center gap-2 font-mono tabular-nums">
            <span>{lienCoveragePercent}%</span>
            <span className="text-xs font-medium text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded font-sans">
              Verified
            </span>
          </div>
          <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-[#1F2937] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${lienCoveragePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs pt-2 text-[#6B7280] mt-1">
            <span>In Favor of AICTE</span>
            <span className="text-[#111827] font-medium font-mono tabular-nums">{lienMarkedCount} of {fdrs.length}</span>
          </div>
        </div>
      </div>

      {/* 1. RECHARTS BAR CHART: 12-Month FDR Maturity Dates Distribution */}
      <MaturityDistributionChart fdrs={fdrs} />

      {/* 2. Central Maturity Alert Command Center with Simulated Email Trigger */}
      {totalUpcomingAlerts > 0 ? (
        <div className="rounded-2xl bg-white border border-[#E5E7EB] p-6 soft-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B45309] tracking-tight mb-0.5">
                <Clock className="w-4 h-4 text-[#B45309]" />
                <span>Upcoming Maturity Alerts & Nodemailer Notification Service</span>
              </div>
              <h3 className="text-base font-bold text-[#111827]">
                FDRs Maturing within 30 Days (Automated Email Alerts)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenEmailCenter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB] text-xs font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Open Simulated Email Outbox</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Critical 7 Days Alert Cards */}
            {critical7Days.map(fdr => (
              <div
                key={fdr.id}
                className="rounded-xl bg-[#FEF2F2]/50 border border-[#FECACA] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Critical ({fdr.days} Days Left)
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#111827] tabular-nums">
                    {formatCurrency(fdr.deposit_amount)}
                  </span>
                </div>

                <div>
                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="text-sm font-mono font-bold text-[#111827] hover:underline block truncate"
                  >
                    {fdr.fdr_number}
                  </Link>
                  <div className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <Landmark className="w-3 h-3 text-[#9CA3AF]" />
                    <span>{fdr.bank_name || 'Bank'}</span>
                  </div>
                  <div className="text-xs text-[#B91C1C] font-medium mt-1 font-mono tabular-nums">
                    Maturity: {fdr.maturity_date}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#FECACA] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSimulateEmailForFdr ? onSimulateEmailForFdr(fdr) : onOpenEmailCenter()}
                    className="text-[11px] text-[#4B5563] hover:text-[#111827] flex items-center gap-1 hover:underline"
                    title="Send simulated Nodemailer 7-day maturity alert"
                  >
                    <Send className="w-3 h-3 text-[#64748B]" /> Send Email Alert
                  </button>

                  <button
                    onClick={() => onRequestRelease ? onRequestRelease(fdr) : null}
                    className="px-3 py-1 text-xs font-medium rounded bg-[#B91C1C] hover:bg-[#991B1B] text-white transition-colors"
                  >
                    Apply Release
                  </button>
                </div>
              </div>
            ))}

            {/* Urgent 15 Days Alert Cards */}
            {urgent15Days.map(fdr => (
              <div
                key={fdr.id}
                className="rounded-xl bg-[#FFFBEB]/50 border border-[#FDE68A] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Urgent ({fdr.days} Days Left)
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#111827] tabular-nums">
                    {formatCurrency(fdr.deposit_amount)}
                  </span>
                </div>

                <div>
                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="text-sm font-mono font-bold text-[#111827] hover:underline block truncate"
                  >
                    {fdr.fdr_number}
                  </Link>
                  <div className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <Landmark className="w-3 h-3 text-[#9CA3AF]" />
                    <span>{fdr.bank_name || 'Bank'}</span>
                  </div>
                  <div className="text-xs text-[#B45309] font-medium mt-1 font-mono tabular-nums">
                    Maturity: {fdr.maturity_date}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#FDE68A] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSimulateEmailForFdr ? onSimulateEmailForFdr(fdr) : onOpenEmailCenter()}
                    className="text-[11px] text-[#4B5563] hover:text-[#111827] flex items-center gap-1 hover:underline"
                    title="Send simulated Nodemailer 15-day alert"
                  >
                    <Send className="w-3 h-3 text-[#64748B]" /> Send Email Alert
                  </button>

                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="px-3 py-1 text-xs font-medium rounded bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB] transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}

            {/* Notice 30 Days Alert Cards */}
            {notice30Days.map(fdr => (
              <div
                key={fdr.id}
                className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white text-[#4B5563] border border-[#E5E7EB] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#64748B]" /> Notice ({fdr.days} Days Left)
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#111827] tabular-nums">
                    {formatCurrency(fdr.deposit_amount)}
                  </span>
                </div>

                <div>
                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="text-sm font-mono font-bold text-[#111827] hover:underline block truncate"
                  >
                    {fdr.fdr_number}
                  </Link>
                  <div className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <Landmark className="w-3 h-3 text-[#9CA3AF]" />
                    <span>{fdr.bank_name || 'Bank'}</span>
                  </div>
                  <div className="text-xs text-[#4B5563] mt-1 font-mono tabular-nums">
                    Maturity: {fdr.maturity_date}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSimulateEmailForFdr ? onSimulateEmailForFdr(fdr) : onOpenEmailCenter()}
                    className="text-[11px] text-[#4B5563] hover:text-[#111827] flex items-center gap-1 hover:underline"
                    title="Send simulated Nodemailer 30-day notice"
                  >
                    <Send className="w-3 h-3 text-[#64748B]" /> Send Email Alert
                  </button>

                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="text-xs text-[#6B7280] hover:text-[#111827]"
                  >
                    Audit Log &rarr;
                  </Link>
                </div>
              </div>
            ))}

            {/* Already Matured without Release */}
            {alreadyMatured.map(fdr => (
              <div
                key={fdr.id}
                className="rounded-xl bg-[#FFFBEB]/50 border border-[#FDE68A] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Matured ({Math.abs(fdr.days)}d ago)
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#111827] tabular-nums">
                    {formatCurrency(fdr.deposit_amount)}
                  </span>
                </div>

                <div>
                  <Link
                    to={`/fdrs/${fdr.id}`}
                    className="text-sm font-mono font-bold text-[#111827] hover:underline block truncate"
                  >
                    {fdr.fdr_number}
                  </Link>
                  <div className="text-xs text-[#6B7280]">{fdr.bank_name}</div>
                </div>

                <div className="pt-2 border-t border-[#FDE68A] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#6B7280]">Term ended</span>
                  <button
                    onClick={() => onRequestRelease ? onRequestRelease(fdr) : null}
                    className="px-3 py-1 text-xs font-medium rounded bg-[#1F2937] hover:bg-[#111827] text-white transition-colors"
                  >
                    Apply for Refund
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-4 flex items-center justify-between gap-3 text-xs text-[#15803D]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
            <div>
              <span className="font-semibold text-[#111827]">All FDRs in Good Regulatory Standing: </span>
              <span className="text-[#4B5563]">No active security deposits are maturing within the next 30 days. Daily 9:00 AM IST monitoring active.</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenEmailCenter}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB] font-medium shrink-0 transition-colors flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Email Outbox</span>
            </button>
            <Link
              to="/upload-fdr"
              className="px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#111827] text-white font-medium shrink-0 transition-colors"
            >
              + Register New
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstitutionSummaryDashboard;
