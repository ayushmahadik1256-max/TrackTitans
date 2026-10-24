-- TrackTitans - PostgreSQL Schema for Neon Database
-- Smart India Hackathon SIH26265: Institutional FDR & Security Deposit Lifecycle Management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(32) NOT NULL CHECK (role IN ('institution', 'bank', 'aicte_admin')),
    institution_name VARCHAR(255),
    bank_name VARCHAR(255),
    phone VARCHAR(32),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. INSTITUTIONS TABLE
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    aicte_application_id VARCHAR(100) NOT NULL UNIQUE,
    institution_name VARCHAR(255) NOT NULL,
    address TEXT,
    state VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_institutions_user_id ON institutions(user_id);
CREATE INDEX IF NOT EXISTS idx_institutions_aicte_app_id ON institutions(aicte_application_id);

-- 3. BANKS TABLE
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(255) NOT NULL,
    branch_name VARCHAR(255),
    ifsc_code VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banks_user_id ON banks(user_id);
CREATE INDEX IF NOT EXISTS idx_banks_name ON banks(bank_name);
CREATE INDEX IF NOT EXISTS idx_banks_ifsc ON banks(ifsc_code);

-- 4. FDR RECORDS TABLE
CREATE TABLE IF NOT EXISTS fdr_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    bank_id UUID REFERENCES banks(id) ON DELETE SET NULL,
    fdr_number VARCHAR(100) NOT NULL UNIQUE,
    deposit_amount NUMERIC(15,2) NOT NULL CHECK (deposit_amount > 0),
    issue_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    lien_marked BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (
        status IN (
            'submitted',
            'under_bank_verification',
            'bank_verified',
            'active',
            'expiring_soon',
            'matured',
            'release_requested',
            'release_approved',
            'rejected'
        )
    ),
    s3_bucket_name VARCHAR(255) NOT NULL,
    s3_object_key VARCHAR(512) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 10485760),
    file_checksum_sha256 VARCHAR(64) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fdr_institution_id ON fdr_records(institution_id);
CREATE INDEX IF NOT EXISTS idx_fdr_bank_id ON fdr_records(bank_id);
CREATE INDEX IF NOT EXISTS idx_fdr_number ON fdr_records(fdr_number);
CREATE INDEX IF NOT EXISTS idx_fdr_status ON fdr_records(status);
CREATE INDEX IF NOT EXISTS idx_fdr_maturity_date ON fdr_records(maturity_date);
CREATE INDEX IF NOT EXISTS idx_fdr_lien_marked ON fdr_records(lien_marked);

-- 5. FDR STATUS HISTORY TABLE (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS fdr_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fdr_record_id UUID NOT NULL REFERENCES fdr_records(id) ON DELETE CASCADE,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_status VARCHAR(32),
    new_status VARCHAR(32) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fdr_history_record_id ON fdr_status_history(fdr_record_id);
CREATE INDEX IF NOT EXISTS idx_fdr_history_user_id ON fdr_status_history(changed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_fdr_history_created_at ON fdr_status_history(created_at);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fdr_record_id UUID REFERENCES fdr_records(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255) NOT NULL,
    notification_type VARCHAR(64) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_fdr_id ON notifications(fdr_record_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- 7. AUTOMATIC updated_at TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trg_fdr_records_updated_at ON fdr_records;
CREATE TRIGGER trg_fdr_records_updated_at
    BEFORE UPDATE ON fdr_records
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
