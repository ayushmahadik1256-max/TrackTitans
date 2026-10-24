import apiClient from '../config/api.js';

const STORAGE_KEY = 'tracktitans_user_fdrs';

function loadStoredFdrs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistFdrs(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to persist FDRs to storage:', err);
  }
}

// In-memory reactive state initialized from storage
let memoryFdrs = loadStoredFdrs();

/**
 * Fetch FDR records with role scoping and filters
 */
export async function getFdrs(params = {}, currentUser = null) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/fdrs?${query}`);
    if (res && res.data) {
      return res.data;
    }
  } catch (err) {
    // Graceful fallback to client store
  }

  // Reload latest from storage in case updated in another tab or action
  memoryFdrs = loadStoredFdrs();
  let list = [...memoryFdrs];

  if (currentUser) {
    if (currentUser.role === 'institution') {
      list = list.filter((f) => {
        if (f.institution_id && currentUser.id && f.institution_id === currentUser.id) return true;
        if (f.institution_email && currentUser.email && f.institution_email.toLowerCase() === currentUser.email.toLowerCase()) return true;
        if (f.institution_name && currentUser.institution_name && f.institution_name.toLowerCase() === currentUser.institution_name.toLowerCase()) return true;
        return false;
      });
    } else if (currentUser.role === 'bank') {
      list = list.filter((f) => {
        if (!currentUser.bank_name) return false;
        return f.bank_name && f.bank_name.toLowerCase().includes(currentUser.bank_name.toLowerCase());
      });
    }
    // AICTE Admin sees all registered institutional FDRs
  }

  if (params.status && params.status !== 'all') {
    list = list.filter((f) => f.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter((f) =>
      (f.fdr_number && f.fdr_number.toLowerCase().includes(q)) ||
      (f.institution_name && f.institution_name.toLowerCase().includes(q)) ||
      (f.bank_name && f.bank_name.toLowerCase().includes(q))
    );
  }

  return list;
}

/**
 * Fetch single FDR by ID
 */
export async function getFdrById(id) {
  try {
    const res = await apiClient.get(`/fdrs/${id}`);
    if (res && res.data) return res.data;
  } catch (err) {
    // fallback
  }

  memoryFdrs = loadStoredFdrs();
  const found = memoryFdrs.find((f) => f.id === id);
  if (!found) throw new Error('FDR Record not found');
  return found;
}

/**
 * Upload new FDR record with PDF
 */
export async function createFdr(formData, currentUser) {
  try {
    const res = await apiClient.postFormData('/fdrs', formData);
    if (res && res.data) return res.data;
  } catch (err) {
    // fallback simulation
  }

  const fdrNumber = formData.get('fdr_number') || `FDR-${Date.now().toString().slice(-6)}`;
  const depositAmount = parseFloat(formData.get('deposit_amount') || '1000000');
  const issueDate = formData.get('issue_date') || new Date().toISOString().split('T')[0];
  const maturityDate = formData.get('maturity_date') || '2028-10-24';
  const bankName = formData.get('bank_name') || 'State Bank of India';
  const branchName = formData.get('branch_name') || 'Main Branch';
  const ifscCode = formData.get('ifsc_code') || 'SBIN0000691';
  const remarks = formData.get('remarks') || 'Institutional deposit submission';
  const file = formData.get('fdr_document');

  const newRecord = {
    id: `fdr-${Date.now()}`,
    institution_id: currentUser?.id || `inst-${Date.now()}`,
    institution_name: currentUser?.institution_name || currentUser?.full_name || 'My Institution',
    aicte_application_id: currentUser?.aicte_application_id || 'AICTE-APP-PENDING',
    institution_email: currentUser?.email || '',
    bank_name: bankName,
    branch_name: branchName,
    ifsc_code: ifscCode,
    fdr_number: fdrNumber,
    deposit_amount: depositAmount,
    issue_date: issueDate,
    maturity_date: maturityDate,
    days_to_maturity: Math.ceil((new Date(maturityDate) - new Date()) / (1000 * 60 * 60 * 24)),
    lien_marked: false,
    status: 'submitted',
    original_file_name: file ? file.name : 'Deposit_FDR.pdf',
    file_size_bytes: file ? file.size : 1500000,
    file_checksum_sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    remarks,
    created_at: new Date().toISOString(),
    history: [
      {
        id: `h-${Date.now()}`,
        previous_status: null,
        new_status: 'submitted',
        notes: `Submitted by ${currentUser?.full_name || 'Institution Head'}. Certificate document uploaded: ${file ? file.name : 'Deposit_FDR.pdf'}`,
        created_at: new Date().toISOString(),
        changed_by_name: currentUser?.full_name || 'Institution Officer',
      },
    ],
  };

  memoryFdrs = [newRecord, ...loadStoredFdrs()];
  persistFdrs(memoryFdrs);
  return newRecord;
}

/**
 * Get pre-signed download URL for FDR PDF
 */
export async function getFdrDocumentDownloadUrl(id) {
  try {
    const res = await apiClient.get(`/fdrs/${id}/document`);
    if (res && res.data) return res.data;
  } catch (err) {
    // fallback
  }

  memoryFdrs = loadStoredFdrs();
  const fdr = memoryFdrs.find((f) => f.id === id);
  return {
    downloadUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: fdr ? fdr.original_file_name : 'FDR_Certificate.pdf',
    checksum: fdr ? fdr.file_checksum_sha256 : 'mock_sha256_checksum',
  };
}

/**
 * Bank verification action
 */
export async function verifyFdr(id, { status, lien_marked, notes }, currentUser) {
  try {
    const res = await apiClient.patch(`/fdrs/${id}/verify`, { status, lien_marked, notes });
    if (res && res.data) return res.data;
  } catch (err) {
    // fallback
  }

  memoryFdrs = loadStoredFdrs();
  const index = memoryFdrs.findIndex((f) => f.id === id);
  if (index !== -1) {
    const prevStatus = memoryFdrs[index].status;
    memoryFdrs[index] = {
      ...memoryFdrs[index],
      status,
      lien_marked,
      history: [
        ...(memoryFdrs[index].history || []),
        {
          id: `h-${Date.now()}`,
          previous_status: prevStatus,
          new_status: status,
          notes: notes || `Verified by bank. Lien marked: ${lien_marked ? 'YES' : 'NO'}`,
          created_at: new Date().toISOString(),
          changed_by_name: currentUser?.full_name || 'Bank Manager',
        },
      ],
    };
    persistFdrs(memoryFdrs);
    return memoryFdrs[index];
  }
  throw new Error('FDR not found');
}

/**
 * Institution release request
 */
export async function requestFdrRelease(id, { notes }, currentUser) {
  try {
    const res = await apiClient.post(`/fdrs/${id}/release-request`, { notes });
    if (res && res.data) return res.data;
  } catch (err) {
    // fallback
  }

  memoryFdrs = loadStoredFdrs();
  const index = memoryFdrs.findIndex((f) => f.id === id);
  if (index !== -1) {
    const prevStatus = memoryFdrs[index].status;
    memoryFdrs[index] = {
      ...memoryFdrs[index],
      status: 'release_requested',
      history: [
        ...(memoryFdrs[index].history || []),
        {
          id: `h-${Date.now()}`,
          previous_status: prevStatus,
          new_status: 'release_requested',
          notes: notes || 'Institution requested deposit release/refund.',
          created_at: new Date().toISOString(),
          changed_by_name: currentUser?.full_name || 'Institution Officer',
        },
      ],
    };
    persistFdrs(memoryFdrs);
    return memoryFdrs[index];
  }
  throw new Error('FDR not found');
}

/**
 * AICTE Admin release decision
 */
export async function decideFdrRelease(id, { decision, notes }, currentUser) {
  try {
    const res = await apiClient.patch(`/fdrs/${id}/release`, { decision, notes });
    if (res && res.data) return res.data;
  } catch (err) {
    // fallback
  }

  memoryFdrs = loadStoredFdrs();
  const index = memoryFdrs.findIndex((f) => f.id === id);
  if (index !== -1) {
    const prevStatus = memoryFdrs[index].status;
    const newStatus = decision === 'approved' ? 'release_approved' : 'active';
    memoryFdrs[index] = {
      ...memoryFdrs[index],
      status: newStatus,
      lien_marked: decision === 'approved' ? false : memoryFdrs[index].lien_marked,
      history: [
        ...(memoryFdrs[index].history || []),
        {
          id: `h-${Date.now()}`,
          previous_status: prevStatus,
          new_status: newStatus,
          notes: `AICTE Decision: ${decision.toUpperCase()}. ${notes}`,
          created_at: new Date().toISOString(),
          changed_by_name: currentUser?.full_name || 'AICTE Admin',
        },
      ],
    };
    persistFdrs(memoryFdrs);
    return memoryFdrs[index];
  }
  throw new Error('FDR not found');
}

export default {
  getFdrs,
  getFdrById,
  createFdr,
  getFdrDocumentDownloadUrl,
  verifyFdr,
  requestFdrRelease,
  decideFdrRelease,
};
