import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Calendar, IndianRupee, Layers, TrendingUp } from 'lucide-react';

export function MaturityDistributionChart({ fdrs = [] }) {
  const [metric, setMetric] = useState('count'); // 'count' or 'value'

  // Generate upcoming 12 months data starting from current month
  const monthlyData = useMemo(() => {
    const today = new Date();
    const months = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      const fullMonthName = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const label = `${monthName} '${String(year).slice(-2)}`;

      months.push({
        year,
        month,
        label,
        fullMonthName,
        isCurrentMonth: i === 0,
        isNextMonth: i === 1,
        count: 0,
        totalValue: 0,
        fdrs: [],
      });
    }

    // Populate months with FDR maturity data
    fdrs.forEach((fdr) => {
      if (!fdr.maturity_date) return;
      if (fdr.status === 'release_approved') return;

      const matDate = new Date(fdr.maturity_date);
      const matYear = matDate.getFullYear();
      const matMonth = matDate.getMonth();

      const targetMonth = months.find((m) => m.year === matYear && m.month === matMonth);
      if (targetMonth) {
        targetMonth.count += 1;
        targetMonth.totalValue += Number(fdr.deposit_amount || 0);
        targetMonth.fdrs.push({
          fdrNumber: fdr.fdr_number,
          bankName: fdr.bank_name || 'Bank',
          amount: Number(fdr.deposit_amount || 0),
          status: fdr.status,
          maturityDate: fdr.maturity_date,
        });
      }
    });

    return months;
  }, [fdrs]);

  const totalUpcomingCount = monthlyData.reduce((acc, m) => acc + m.count, 0);
  const totalUpcomingValue = monthlyData.reduce((acc, m) => acc + m.totalValue, 0);

  const peakMonth = useMemo(() => {
    let peak = monthlyData[0];
    monthlyData.forEach((m) => {
      if ((metric === 'count' ? m.count : m.totalValue) > (metric === 'count' ? peak.count : peak.totalValue)) {
        peak = m;
      }
    });
    return peak;
  }, [monthlyData, metric]);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-white border border-[#E5E7EB] p-3 shadow-lg text-xs max-w-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-1.5">
            <span className="font-semibold text-[#111827]">{data.fullMonthName}</span>
            {data.isCurrentMonth && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                Current Window
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 py-0.5 font-mono tabular-nums">
            <div>
              <span className="text-[#6B7280] block text-[11px]">Maturing:</span>
              <span className="font-semibold text-[#111827] text-sm">{data.count} FDRs</span>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[11px]">Deposit Value:</span>
              <span className="font-semibold text-[#15803D] text-xs">
                {formatCurrency(data.totalValue)}
              </span>
            </div>
          </div>

          {data.fdrs.length > 0 && (
            <div className="pt-1.5 border-t border-[#F3F4F6] space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-medium block">
                Certificate Details
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                {data.fdrs.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] bg-[#F7F8FA] px-2 py-1 rounded border border-[#E5E7EB]">
                    <span className="text-[#111827] font-mono truncate max-w-[120px]">{item.fdrNumber}</span>
                    <span className="text-[#15803D] font-mono font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] p-6 shadow-xs space-y-5">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] tracking-tight mb-1">
            <TrendingUp className="w-4 h-4 text-[#64748B]" />
            <span>12-Month Regulatory Liquidity & Maturity Schedule</span>
          </div>
          <h3 className="text-base font-bold text-[#111827] tracking-tight">
            FDR Maturity Distribution Forecast
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Projected maturity timeline across the upcoming 12 consecutive calendar months
          </p>
        </div>

        {/* Metric Selector Button Group */}
        <div className="flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-lg border border-[#E5E7EB] shrink-0">
          <button
            type="button"
            onClick={() => setMetric('count')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              metric === 'count'
                ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>FDR Count</span>
          </button>
          <button
            type="button"
            onClick={() => setMetric('value')}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
              metric === 'value'
                ? 'bg-white text-[#111827] shadow-xs border border-[#E5E7EB]'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Deposit Value (₹)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#6B7280] block font-medium">12-Month Maturing FDRs</span>
            <span className="text-xl font-bold text-[#111827] font-mono tabular-nums">{totalUpcomingCount} Certificates</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#4B5563] flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#6B7280] block font-medium">Capital Maturing in 12M</span>
            <span className="text-xl font-bold text-[#15803D] font-mono tabular-nums">{formatCurrency(totalUpcomingValue)}</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#15803D] flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>

        <div className="rounded-xl bg-[#F7F8FA] border border-[#E5E7EB] p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#6B7280] block font-medium">Peak Month</span>
            <span className="text-xl font-bold text-[#111827] font-mono tabular-nums">
              {peakMonth ? peakMonth.label : 'N/A'}
              <span className="text-xs font-normal text-[#6B7280] ml-1.5 font-sans">
                ({metric === 'count' ? `${peakMonth.count} FDRs` : formatCurrency(peakMonth.totalValue)})
              </span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] text-[#4B5563] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 15, right: 10, left: -15, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(val) => {
                if (metric === 'value') {
                  if (val === 0) return '₹0';
                  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                  return `₹${(val / 100000).toFixed(0)}L`;
                }
                return val;
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 244, 246, 0.6)' }} />
            <Bar
              dataKey={metric === 'count' ? 'count' : 'totalValue'}
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
            >
              {monthlyData.map((entry, index) => {
                let fill = '#E5E7EB'; // Empty month
                if (entry.count > 0) {
                  if (entry.isCurrentMonth) {
                    fill = '#B91C1C'; // Danger/critical window
                  } else if (entry.isNextMonth) {
                    fill = '#B45309'; // Warning/urgent window
                  } else {
                    fill = '#1F2937'; // Primary action slate
                  }
                }
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B91C1C] inline-block shrink-0" />
            <span>Current Month (Critical Window)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B45309] inline-block shrink-0" />
            <span>Next Month (Urgent Notice)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1F2937] inline-block shrink-0" />
            <span>Scheduled Maturing Window</span>
          </div>
        </div>

        <span className="text-[11px] text-[#9CA3AF] font-mono">
          Hover over bars to inspect underlying FDRs
        </span>
      </div>
    </div>
  );
}

export default MaturityDistributionChart;
