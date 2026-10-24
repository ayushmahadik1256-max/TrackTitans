-- TrackTitans Realistic Seed Data for Neon PostgreSQL
-- Pre-populates 3 users (one per role), institutions, banks, 10 FDR records in various lifecycle states, history, and notifications.

-- 1. Insert seed users (one AICTE Admin, one Bank Manager, one College Principal)
INSERT INTO users (id, firebase_uid, email, full_name, role, institution_name, bank_name, phone)
VALUES 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'firebase_uid_aicte_admin_01', 'admin@aicte-india.org', 'Dr. Ramesh Sharma (AICTE Admin)', 'aicte_admin', NULL, NULL, '+91-11-29581000'),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'firebase_uid_bank_sbi_01', 'mgr.delhi@sbi.co.in', 'Rajeev Menon (SBI Branch Manager)', 'bank', NULL, 'State Bank of India', '+91-11-23374821'),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'firebase_uid_inst_iitd_01', 'registrar@delhitechnical.edu.in', 'Prof. Sunita Deshmukh (Delhi Tech Institute)', 'institution', 'Delhi Institute of Engineering & Technology', NULL, '+91-9876543210'),
  ('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'firebase_uid_inst_vjti_02', 'finance@mumbaitech.ac.in', 'Dr. Arvind Verma (Mumbai Institute)', 'institution', 'Mumbai Polytechnic & Engineering College', NULL, '+91-9820012345'),
  ('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'firebase_uid_bank_pnb_02', 'fdr.cell@pnb.co.in', 'Amit Saxena (PNB Regional Officer)', 'bank', NULL, 'Punjab National Bank', '+91-11-26123456')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Institutions
INSERT INTO institutions (id, user_id, aicte_application_id, institution_name, address, state, contact_email, contact_phone)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'AICTE-1-9321482910', 'Delhi Institute of Engineering & Technology', 'Sector 12, Dwarka, New Delhi 110078', 'Delhi', 'registrar@delhitechnical.edu.in', '+91-9876543210'),
  ('22222222-2222-2222-2222-222222222222', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'AICTE-1-8472910294', 'Mumbai Polytechnic & Engineering College', 'Mahim Causeway, Mumbai, Maharashtra 400016', 'Maharashtra', 'finance@mumbaitech.ac.in', '+91-9820012345')
ON CONFLICT (aicte_application_id) DO NOTHING;

-- 3. Insert Banks
INSERT INTO banks (id, user_id, bank_name, branch_name, ifsc_code)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'State Bank of India', 'Parliament Street Branch, New Delhi', 'SBIN0000691'),
  ('44444444-4444-4444-4444-444444444444', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Punjab National Bank', 'Bhikaji Cama Place, New Delhi', 'PUNB0112000')
ON CONFLICT DO NOTHING;

-- 4. Insert 10 Realistic FDR Records across all lifecycle stages
INSERT INTO fdr_records (
  id, institution_id, bank_id, fdr_number, deposit_amount, issue_date, maturity_date, 
  lien_marked, status, s3_bucket_name, s3_object_key, original_file_name, file_size_bytes, 
  file_checksum_sha256, remarks
) VALUES
  -- 1. Active FDR with SBI, Lien marked (healthy)
  (
    'a0000001-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'SBI-DEL-FDR-2023-88910',
    3500000.00,
    CURRENT_DATE - INTERVAL '1 year',
    CURRENT_DATE + INTERVAL '2 years',
    TRUE,
    'active',
    'tracktitans-fdr-documents',
    'institutions/11111111/fdr_sbi_88910.pdf',
    'AICTE_Security_Deposit_SBI_88910.pdf',
    1842910,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'Annual compliance security deposit for B.Tech Computer Science expansion'
  ),

  -- 2. Expiring soon in 7 days
  (
    'a0000002-0000-0000-0000-000000000002',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'SBI-DEL-FDR-2021-41902',
    5000000.00,
    CURRENT_DATE - INTERVAL '5 years' + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '7 days',
    TRUE,
    'expiring_soon',
    'tracktitans-fdr-documents',
    'institutions/11111111/fdr_sbi_41902.pdf',
    'AICTE_5Year_FDR_SBI_41902.pdf',
    2150392,
    '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
    'Critical 7-day maturity alert dispatched to Registrar'
  ),

  -- 3. Expiring in 15 days
  (
    'a0000003-0000-0000-0000-000000000003',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'PNB-MUM-FDR-2022-77123',
    2500000.00,
    CURRENT_DATE - INTERVAL '3 years' + INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '15 days',
    TRUE,
    'expiring_soon',
    'tracktitans-fdr-documents',
    'institutions/22222222/fdr_pnb_77123.pdf',
    'FDR_Receipt_PNB_Mumbai_77123.pdf',
    1420911,
    'b4c6e210134a413d7e9b0b4579998822004455aa6677889900aabbccddeeff00',
    '15-day alert sent to Mumbai Polytechnic management'
  ),

  -- 4. Expiring in 30 days
  (
    'a0000004-0000-0000-0000-000000000004',
    '11111111-1111-1111-1111-111111111111',
    '44444444-4444-4444-4444-444444444444',
    'PNB-DEL-FDR-2023-90184',
    1500000.00,
    CURRENT_DATE - INTERVAL '3 years' + INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '30 days',
    TRUE,
    'expiring_soon',
    'tracktitans-fdr-documents',
    'institutions/11111111/fdr_pnb_90184.pdf',
    'FDR_Deposit_Certificate_90184.pdf',
    1920480,
    'c5d7e321245b524e8f0c1c5680009933115566bb7788990011bbccddeeff0011',
    '30-day initial renewal reminder notification active'
  ),

  -- 5. Under Bank Verification (Waiting for Bank Officer)
  (
    'a0000005-0000-0000-0000-000000000005',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    'SBI-MUM-FDR-2024-11002',
    4000000.00,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '5 years',
    FALSE,
    'under_bank_verification',
    'tracktitans-fdr-documents',
    'institutions/22222222/fdr_sbi_11002.pdf',
    'SBI_New_College_Deposit_11002.pdf',
    2540192,
    'd6e8f432356c635f901d2d6791110044226677cc8899001122ccddeeff001122',
    'Submitted by Mumbai Tech for AICTE approval of new AI & Data Science wing'
  ),

  -- 6. Submitted (Fresh upload by institution)
  (
    'a0000006-0000-0000-0000-000000000006',
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'PENDING-FDR-2024-99881',
    2000000.00,
    CURRENT_DATE - INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '3 years',
    FALSE,
    'submitted',
    'tracktitans-fdr-documents',
    'institutions/11111111/fdr_pending_99881.pdf',
    'Original_FDR_Scan_99881.pdf',
    1102940,
    'e7f90543467d7460012e3e78a2221155337788dd9900112233ddeeff00112233',
    'Awaiting bank branch mapping and verification'
  ),

  -- 7. Bank Verified (Awaiting AICTE final activation)
  (
    'a0000007-0000-0000-0000-000000000007',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'PNB-MUM-FDR-2024-65431',
    3000000.00,
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '4 years',
    TRUE,
    'bank_verified',
    'tracktitans-fdr-documents',
    'institutions/22222222/fdr_pnb_65431.pdf',
    'PNB_Verified_Lien_65431.pdf',
    1789120,
    'f80a1654578e8571123f4f89b3332266448899ee0011223344eeff0011223344',
    'Bank confirmed lien mark in favour of Member Secretary, AICTE'
  ),

  -- 8. Release Requested (Institution completed 10-year term and requested security deposit refund)
  (
    'a0000008-0000-0000-0000-000000000008',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'SBI-DEL-FDR-2016-12345',
    5000000.00,
    CURRENT_DATE - INTERVAL '10 years',
    CURRENT_DATE - INTERVAL '10 days',
    TRUE,
    'release_requested',
    'tracktitans-fdr-documents',
    'institutions/11111111/fdr_sbi_12345.pdf',
    'FDR_10Yr_Matured_12345.pdf',
    2340129,
    '091b2765689f96822340509ac4443377559900ff1122334455ff001122334455',
    'Institution applied for AICTE Release Certificate & Lien Dissolution'
  ),

  -- 9. Release Approved (AICTE administrator sanctioned refund)
  (
    'a0000009-0000-0000-0000-000000000009',
    '22222222-2222-2222-2222-222222222222',
    '44444444-4444-4444-4444-444444444444',
    'PNB-MUM-FDR-2015-99012',
    2500000.00,
    CURRENT_DATE - INTERVAL '11 years',
    CURRENT_DATE - INTERVAL '1 year',
    FALSE,
    'release_approved',
    'tracktitans-fdr-documents',
    'institutions/22222222/fdr_pnb_99012.pdf',
    'AICTE_Release_Letter_PNB_99012.pdf',
    1650990,
    '1a2c38767900a793345161abd555448866aa1100223344556600112233445566',
    'AICTE approved release letter issued, lien removed by bank'
  ),

  -- 10. Rejected by Bank (Mismatch in depositor name and amount)
  (
    'a000000a-0000-0000-0000-000000000010',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'SBI-DEL-FDR-2024-00219',
    1000000.00,
    CURRENT_DATE - INTERVAL '40 days',
    CURRENT_DATE + INTERVAL '1 year',
    FALSE,
    'rejected',
    'tracktitans-fdr-documents',
    'institutions/11111111/fdr_sbi_00219.pdf',
    'FDR_Deposit_Slip_00219.pdf',
    1240500,
    '2b3d49878011b8a4456272bce666559977bb2211334455667711223344556677',
    'Rejection Reason: Lien was not marked in favor of Member Secretary AICTE'
  )
ON CONFLICT (fdr_number) DO NOTHING;

-- 5. Insert Status History for Audit Logs
INSERT INTO fdr_status_history (fdr_record_id, changed_by_user_id, previous_status, new_status, notes)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', NULL, 'submitted', 'Uploaded by institution with original PDF'),
  ('a0000001-0000-0000-0000-000000000001', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'submitted', 'bank_verified', 'Verified by SBI Parliament St Branch with Lien marked in favor of AICTE'),
  ('a0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'bank_verified', 'active', 'AICTE Admin validated record and activated institutional compliance status'),
  ('a0000008-0000-0000-0000-000000000008', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'active', 'release_requested', 'Institution requested return of security deposit post mandatory 10 year term'),
  ('a000000a-0000-0000-0000-000000000010', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'submitted', 'rejected', 'Lien clause missing from bank term deposit receipt');

-- 6. Insert Historical Maturity and Expiry Notifications
INSERT INTO notifications (fdr_record_id, recipient_email, notification_type, subject, body, status, sent_at)
VALUES
  (
    'a0000002-0000-0000-0000-000000000002',
    'registrar@delhitechnical.edu.in',
    'maturity_alert_7_days',
    'CRITICAL: AICTE FDR SBI-DEL-FDR-2021-41902 Maturing in 7 Days',
    'Dear Principal/Registrar, Fixed Deposit Receipt SBI-DEL-FDR-2021-41902 of amount INR 50,00,000.00 will mature on ' || (CURRENT_DATE + INTERVAL '7 days')::text || '. Please submit renewal receipt or lien extension immediately.',
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
  ),
  (
    'a0000003-0000-0000-0000-000000000003',
    'finance@mumbaitech.ac.in',
    'maturity_alert_15_days',
    'URGENT: AICTE FDR PNB-MUM-FDR-2022-77123 Maturing in 15 Days',
    'Dear Institution Head, Your FDR with PNB for INR 25,00,000.00 matures in 15 days. Please initiate renewal paperwork.',
    'sent',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
  );
