import apiClient from '../config/api.js';
import { getFdrs } from './fdrService.js';

export async function getAdminSummary() {
  try {
    const res = await apiClient.get('/analytics/summary');
    if (res && res.data) {
      return res.data;
    }
  } catch (err) {
    // fallback to calculating from current FDR records
  }

  const allFdrs = await getFdrs();

  let totalValue = 0;
  let totalLocked = 0;
  let pendingBank = 0;
  let releaseRequests = 0;
  let exp7 = 0;
  let exp15 = 0;
  let exp30 = 0;
  let expired = 0;

  const statusMap = {};
  const bankMap = {};

  allFdrs.forEach((fdr) => {
    const amt = Number(fdr.deposit_amount) || 0;
    totalValue += amt;

    if (['active', 'bank_verified', 'expiring_soon'].includes(fdr.status)) {
      totalLocked += amt;
    }
    if (['submitted', 'under_bank_verification'].includes(fdr.status)) {
      pendingBank++;
    }
    if (fdr.status === 'release_requested') {
      releaseRequests++;
    }

    const days = fdr.days_to_maturity !== undefined
      ? fdr.days_to_maturity
      : Math.ceil((new Date(fdr.maturity_date) - new Date()) / (1000 * 60 * 60 * 24));

    if (days < 0 && fdr.status !== 'release_approved') {
      expired++;
    } else if (days <= 7 && days >= 0) {
      exp7++;
    } else if (days <= 15 && days > 7) {
      exp15++;
    } else if (days <= 30 && days > 15) {
      exp30++;
    }

    // Status map
    statusMap[fdr.status] = (statusMap[fdr.status] || 0) + 1;

    // Bank map
    const bName = fdr.bank_name || 'Unassigned';
    bankMap[bName] = (bankMap[bName] || 0) + amt;
  });

  const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
    status,
    count,
  }));

  const bankDistribution = Object.entries(bankMap).map(([bankName, totalAmount]) => ({
    bankName,
    totalAmount,
    fdrCount: allFdrs.filter(f => (f.bank_name || 'Unassigned') === bankName).length,
  }));

  const criticalExpiries = allFdrs
    .filter(f => {
      const days = f.days_to_maturity ?? 999;
      return days <= 30 && f.status !== 'release_approved';
    })
    .sort((a, b) => (a.days_to_maturity ?? 0) - (b.days_to_maturity ?? 0));

  return {
    kpis: {
      totalFdrs: allFdrs.length,
      totalDepositValue: totalValue,
      totalLockedValue: totalLocked,
      pendingBankVerification: pendingBank,
      releaseRequests,
      totalLienMarked: allFdrs.filter(f => f.lien_marked).length,
      expiring7Days: exp7,
      expiring15Days: exp15,
      expiring30Days: exp30,
      expiredUnreleased: expired,
    },
    statusDistribution,
    bankDistribution,
    criticalExpiries,
  };
}

export default {
  getAdminSummary,
};
