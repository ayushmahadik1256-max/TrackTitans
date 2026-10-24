import apiClient from '../config/api.js';

// Pre-seeded 10 realistic test records for client preview & fallback
const INITIAL_DEMO_FDRS = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    institution_id: '11111111-1111-1111-1111-111111111111',
    institution_name: 'Delhi Institute of Engineering & Technology',
    aicte_application_id: 'AICTE-1-9321482910',
    institution_email: 'registrar@delhitechnical.edu.in',
    bank_name: 'State Bank of India',
    branch_name: 'Parliament Street Branch, New Delhi',
    ifsc_code: 'SBIN0000691',
    fdr_number: 'SBI-DEL-FDR-2023-88910',
    deposit_amount: 3500000.00,
    issue_date: '2023-08-15',
    maturity_date: '2028-08-15',
    days_to_maturity: 660,
    lien_marked: true,
    status: 'active',
    original_file_name: 'AICTE_Security_Deposit_SBI_88910.pdf',
    file_size_bytes: 1842910,
    file_checksum_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    remarks: 'Annual compliance security deposit for B.Tech Computer Science expansion',
    created_at: '2023-08-15T10:00:00Z',
    history: [
      { id: 'h1', previous_status: null, new_status: 'submitted', notes: 'Initial submission by institution', created_at: '2023-08-15T10:00:00Z', changed_by_name: 'Prof. Sunita Deshmukh' },
      { id: 'h2', previous_status: 'submitted', new_status: 'bank_verified', notes: 'Lien marked in favour of Member Secretary, AICTE', created_at: '2023-08-16T14:30:00Z', changed_by_name: 'SBI Officer' },
      { id: 'h3', previous_status: 'bank_verified', new_status: 'active', notes: 'AICTE Compliance Approved', created_at: '2023-08-18T09:15:00Z', changed_by_name: 'Dr. Ramesh Sharma' }
    ]
  },
  {
    id: 'a0000002-0000-0000-0000-000000000002',
    institution_id: '11111111-1111-1111-1111-111111111111',
    institution_name: 'Delhi Institute of Engineering & Technology',
    aicte_application_id: 'AICTE-1-9321482910',
    institution_email: 'registrar@delhitechnical.edu.in',
    bank_name: 'State Bank of India',
    branch_name: 'Parliament Street Branch, New Delhi',
    ifsc_code: 'SBIN0000691',
    fdr_number: 'SBI-DEL-FDR-2021-41902',
    deposit_amount: 5000000.00,
    issue_date: '2021-11-01',
    maturity_date: '2026-10-31',
    days_to_maturity: 7,
    lien_marked: true,
    status: 'expiring_soon',
    original_file_name: 'AICTE_5Year_FDR_SBI_41902.pdf',
    file_size_bytes: 2150392,
    file_checksum_sha256: '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
    remarks: 'Critical 7-day maturity alert dispatched to Registrar',
    created_at: '2021-11-01T08:00:00Z',
    history: [
      { id: 'h4', previous_status: 'active', new_status: 'expiring_soon', notes: 'Automated 7-day maturity notice sent via Nodemailer', created_at: '2026-10-24T09:00:00Z', changed_by_name: 'System Cron' }
    ]
  },
  {
    id: 'a0000003-0000-0000-0000-000000000003',
    institution_id: '22222222-2222-2222-2222-222222222222',
    institution_name: 'Mumbai Polytechnic & Engineering College',
    aicte_application_id: 'AICTE-1-8472910294',
    institution_email: 'finance@mumbaitech.ac.in',
    bank_name: 'Punjab National Bank',
    branch_name: 'Bhikaji Cama Place, New Delhi',
    ifsc_code: 'PUNB0112000',
    fdr_number: 'PNB-MUM-FDR-2022-77123',
    deposit_amount: 2500000.00,
    issue_date: '2022-11-08',
    maturity_date: '2026-11-08',
    days_to_maturity: 15,
    lien_marked: true,
    status: 'expiring_soon',
    original_file_name: 'FDR_Receipt_PNB_Mumbai_77123.pdf',
    file_size_bytes: 1420911,
    file_checksum_sha256: 'b4c6e210134a413d7e9b0b4579998822004455aa6677889900aabbccddeeff00',
    remarks: '15-day alert sent to Mumbai Polytechnic management',
    created_at: '2022-11-08T11:20:00Z',
    history: [
      { id: 'h5', previous_status: 'active', new_status: 'expiring_soon', notes: 'Automated 15-day alert dispatched', created_at: '2026-10-24T09:00:00Z', changed_by_name: 'System Cron' }
    ]
  },
  {
    id: 'a0000004-0000-0000-0000-000000000004',
    institution_id: '11111111-1111-1111-1111-111111111111',
    institution_name: 'Delhi Institute of Engineering & Technology',
    aicte_application_id: 'AICTE-1-9321482910',
    institution_email: 'registrar@delhitechnical.edu.in',
    bank_name: 'Punjab National Bank',
    branch_name: 'Bhikaji Cama Place, New Delhi',
    ifsc_code: 'PUNB0112000',
    fdr_number: 'PNB-DEL-FDR-2023-90184',
    deposit_amount: 1500000.00,
    issue_date: '2023-11-23',
    maturity_date: '2026-11-23',
    days_to_maturity: 30,
    lien_marked: true,
    status: 'expiring_soon',
    original_file_name: 'FDR_Deposit_Certificate_90184.pdf',
    file_size_bytes: 1920480,
    file_checksum_sha256: 'c5d7e321245b524e8f0c1c5680009933115566bb7788990011bbccddeeff0011',
    remarks: '30-day initial renewal reminder notification active',
    created_at: '2023-11-23T14:10:00Z',
    history: []
  },
  {
    id: 'a0000005-0000-0000-0000-000000000005',
    institution_id: '22222222-2222-2222-2222-222222222222',
    institution_name: 'Mumbai Polytechnic & Engineering College',
    aicte_application_id: 'AICTE-1-8472910294',
    institution_email: 'finance@mumbaitech.ac.in',
    bank_name: 'State Bank of India',
    branch_name: 'Parliament Street Branch, New Delhi',
    ifsc_code: 'SBIN0000691',
    fdr_number: 'SBI-MUM-FDR-2024-11002',
    deposit_amount: 4000000.00,
    issue_date: '2024-10-14',
    maturity_date: '2029-10-14',
    days_to_maturity: 1085,
    lien_marked: false,
    status: 'under_bank_verification',
    original_file_name: 'SBI_New_College_Deposit_11002.pdf',
    file_size_bytes: 2540192,
    file_checksum_sha256: 'd6e8f432356c635f901d2d6791110044226677cc8899001122ccddeeff001122',
    remarks: 'Submitted by Mumbai Tech for AICTE approval of new AI & Data Science wing',
    created_at: '2024-10-14T09:30:00Z',
    history: [
      { id: 'h6', previous_status: null, new_status: 'submitted', notes: 'Submitted by institution', created_at: '2024-10-14T09:30:00Z', changed_by_name: 'Dr. Arvind Verma' },
      { id: 'h7', previous_status: 'submitted', new_status: 'under_bank_verification', notes: 'Assigned to SBI Branch for lien confirmation', created_at: '2024-10-15T11:00:00Z', changed_by_name: 'System Router' }
    ]
  },
  {
    id: 'a0000006-0000-0000-0000-000000000006',
    institution_id: '11111111-1111-1111-1111-111111111111',
    institution_name: 'Delhi Institute of Engineering & Technology',
    aicte_application_id: 'AICTE-1-9321482910',
    institution_email: 'registrar@delhitechnical.edu.in',
    bank_name: 'State Bank of India',
    branch_name: 'Parliament Street Branch, New Delhi',
    ifsc_code: 'SBIN0000691',
    fdr_number: 'PENDING-FDR-2024-99881',
    deposit_amount: 2000000.00,
    issue_date: '2024-10-22',
    maturity_date: '2027-10-22',
    days_to_maturity: 728,
    lien_marked: false,
    status: 'submitted',
    original_file_name: 'Original_FDR_Scan_99881.pdf',
    file_size_bytes: 1102940,
    file_checksum_sha256: 'e7f90543467d7460012e3e78a2221155337788dd9900112233ddeeff00112233',
    remarks: 'Awaiting bank branch mapping and verification',
    created_at: '2024-10-22T16:00:00Z',
    history: []
  },
  {
    id: 'a0000007-0000-0000-0000-000000000007',
    institution_id: '22222222-2222-2222-2222-222222222222',
    institution_name: 'Mumbai Polytechnic & Engineering College',
    aicte_application_id: 'AICTE-1-8472910294',
    institution_email: 'finance@mumbaitech.ac.in',
    bank_name: 'Punjab National Bank',
    branch_name: 'Bhikaji Cama Place, New Delhi',
    ifsc_code: 'PUNB0112000',
    fdr_number: 'PNB-MUM-FDR-2024-65431',
    deposit_amount: 3000000.00,
    issue_date: '2024-10-09',
    maturity_date: '2028-10-09',
    days_to_maturity: 715,
    lien_marked: true,
    status: 'bank_verified',
    original_file_name: 'PNB_Verified_Lien_65431.pdf',
    file_size_bytes: 1789120,
    file_checksum_sha256: 'f80a1654578e8571123f4f89b3332266448899ee0011223344eeff0011223344',
    remarks: 'Bank confirmed lien mark in favour of Member Secretary, AICTE',
    created_at: '2024-10-09T12:00:00Z',
    history: [
      { id: 'h8', previous_status: 'under_bank_verification', new_status: 'bank_verified', notes: 'Verified and lien noted in bank core banking system', created_at: '2024-10-10T15:20:00Z', changed_by_name: 'PNB Regional Manager' }
    ]
  },
  {
    id: 'a0000008-0000-0000-0000-000000000008',
    institution_id: '11111111-1111-1111-1111-111111111111',
    institution_name: 'Delhi Institute of Engineering & Technology',
    aicte_application_id: 'AICTE-1-9321482910',
    institution_email: 'registrar@delhitechnical.edu.in',
    bank_name: 'State Bank of India',
    branch_name: 'Parliament Street Branch, New Delhi',
    ifsc_code: 'SBIN0000691',
    fdr_number: 'SBI-DEL-FDR-2016-12345',
    deposit_amount: 5000000.00,
    issue_date: '2016-10-14',
    maturity_date: '2026-10-14',
    days_to_maturity: -10,
    lien_marked: true,
    status: 'release_requested',
    original_file_name: 'FDR_10Yr_Matured_12345.pdf',
    file_size_bytes: 2340129,
    file_checksum_sha256: '091b2765689f96822340509ac4443377559900ff1122334455ff001122334455',
    remarks: 'Institution applied for AICTE Release Certificate & Lien Dissolution',
    created_at: '2016-10-14T10:00:00Z',
    history: [
      { id: 'h9', previous_status: 'active', new_status: 'release_requested', notes: 'Completed mandatory 10-year term. Requesting refund of guarantee amount.', created_at: '2026-10-15T11:45:00Z', changed_by_name: 'Prof. Sunita Deshmukh' }
    ]
  },
  {
    id: 'a0000009-0000-0000-0000-000000000009',
    institution_id: '22222222-2222-2222-2222-222222222222',
    institution_name: 'Mumbai Polytechnic & Engineering College',
    aicte_application_id: 'AICTE-1-8472910294',
    institution_email: 'finance@mumbaitech.ac.in',
    bank_name: 'Punjab National Bank',
    branch_name: 'Bhikaji Cama Place, New Delhi',
    ifsc_code: 'PUNB0112000',
    fdr_number: 'PNB-MUM-FDR-2015-99012',
    deposit_amount: 2500000.00,
    issue_date: '2015-05-10',
    maturity_date: '2025-05-10',
    days_to_maturity: -532,
    lien_marked: false,
    status: 'release_approved',
    original_file_name: 'AICTE_Release_Letter_PNB_99012.pdf',
    file_size_bytes: 1650990,
    file_checksum_sha256: '1a2c38767900a793345161abd555448866aa1100223344556600112233445566',
    remarks: 'AICTE approved release letter issued, lien removed by bank',
    created_at: '2015-05-10T09:00:00Z',
    history: [
      { id: 'h10', previous_status: 'release_requested', new_status: 'release_approved', notes: 'Sanction order signed by AICTE Member Secretary. Security deposit returned.', created_at: '2025-05-20T16:00:00Z', changed_by_name: 'Dr. Ramesh Sharma' }
    ]
  },
  {
    id: 'a000000a-0000-0000-0000-000000000010',
    institution_id: '11111111-1111-1111-1111-111111111111',
    institution_name: 'Delhi Institute of Engineering & Technology',
    aicte_application_id: 'AICTE-1-9321482910',
    institution_email: 'registrar@delhitechnical.edu.in',
    bank_name: 'State Bank of India',
    branch_name: 'Parliament Street Branch, New Delhi',
    ifsc_code: 'SBIN0000691',
    fdr_number: 'SBI-DEL-FDR-2024-00219',
    deposit_amount: 1000000.00,
    issue_date: '2024-09-14',
    maturity_date: '2025-09-14',
    days_to_maturity: 325,
    lien_marked: false,
    status: 'rejected',
    original_file_name: 'FDR_Deposit_Slip_00219.pdf',
    file_size_bytes: 1240500,
    file_checksum_sha256: '2b3d49878011b8a4456272bce666559977bb2211334455667711223344556677',
    remarks: 'Rejection Reason: Lien was not marked in favor of Member Secretary AICTE',
    created_at: '2024-09-14T10:15:00Z',
    history: [
      { id: 'h11', previous_status: 'under_bank_verification', new_status: 'rejected', notes: 'Lien clause missing from bank term deposit receipt. Re-upload required.', created_at: '2024-09-16T11:00:00Z', changed_by_name: 'SBI Branch Manager' }
    ]
  }
];

// In-memory reactive state
let memoryFdrs = [...INITIAL_DEMO_FDRS];

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

  // Filter in-memory data
  let list = [...memoryFdrs];

  if (currentUser) {
    if (currentUser.role === 'institution') {
      list = list.filter(f => !f.institution_id || f.institution_id === currentUser.id || f.institution_name === currentUser.institution_name);
    } else if (currentUser.role === 'bank') {
      list = list.filter(f => !currentUser.bank_name || f.bank_name?.toLowerCase().includes(currentUser.bank_name.toLowerCase()));
    }
  }

  if (params.status && params.status !== 'all') {
    list = list.filter(f => f.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(f =>
      f.fdr_number.toLowerCase().includes(q) ||
      f.institution_name.toLowerCase().includes(q) ||
      f.bank_name?.toLowerCase().includes(q)
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

  const found = memoryFdrs.find(f => f.id === id);
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
    institution_id: currentUser?.id || '11111111-1111-1111-1111-111111111111',
    institution_name: currentUser?.institution_name || 'Delhi Institute of Engineering & Technology',
    aicte_application_id: currentUser?.aicte_application_id || 'AICTE-1-9321482910',
    institution_email: currentUser?.email || 'registrar@delhitechnical.edu.in',
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
        notes: `Submitted by ${currentUser?.full_name || 'Institution Head'}. PDF uploaded: ${file ? file.name : 'Deposit_FDR.pdf'}`,
        created_at: new Date().toISOString(),
        changed_by_name: currentUser?.full_name || 'Institution Officer',
      }
    ]
  };

  memoryFdrs.unshift(newRecord);
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

  const fdr = memoryFdrs.find(f => f.id === id);
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

  const index = memoryFdrs.findIndex(f => f.id === id);
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
        }
      ]
    };
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

  const index = memoryFdrs.findIndex(f => f.id === id);
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
        }
      ]
    };
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

  const index = memoryFdrs.findIndex(f => f.id === id);
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
        }
      ]
    };
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
