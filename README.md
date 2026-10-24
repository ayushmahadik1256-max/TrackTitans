# TrackTitans - Institutional FDR & Security Deposit Lifecycle Management
### Smart India Hackathon Problem Statement SIH26265

TrackTitans digitizes and secures the end-to-end lifecycle of institutional Fixed Deposit Receipts (FDRs) and Security Deposits between **Technical Institutions**, **Partner Commercial Banks**, and **AICTE Administrators**.

---

## 1. Architecture Overview

```
+-------------------------------------------------------------------------------+
|                                TRACKTITANS ARCHITECTURE                       |
+-------------------------------------------------------------------------------+
|                                                                               |
|  [ Technical Institution ]       [ Commercial Bank ]        [ AICTE Admin ]   |
|         |                                |                        |           |
|         +--------------------------------+------------------------+           |
|                                          |                                    |
|                                [ React Frontend SPA ]                         |
|                    (Role-based Views, Pre-signed S3 Download,                 |
|                       Maturity Countdowns & Recharts KPIs)                    |
|                                          |                                    |
|                     Firebase ID Token    | Bearer <JWT>                       |
|                     ====================>|                                    |
|                                          v                                    |
|                           [ Express.js REST API ]                             |
|          +-------------------------------+------------------------------+     |
|          |                               |                              |     |
|          v                               v                              v     |
|   [ Firebase Admin ]              [ AWS S3 SDK v3 ]             [ Node-Cron ] |
|  Token verification &           Private Vault Storage,          Daily 9:00 AM |
|    RBAC enforcement              Pre-signed 300s URLs            Asia/Kolkata |
|          |                               |                              |     |
|          |                               |                              v     |
|          |                               |                      [ Nodemailer ]|
|          |                               |                     Maturity alerts|
|          |                               |                     (30, 15, 7 days|
|          +-------------------------------+                              |     |
|                                          |                              |     |
|                                          v                              |     |
|                       [ Neon Serverless PostgreSQL ]                    |     |
|               (users, institutions, banks, fdr_records,                 |     |
|                    fdr_status_history, notifications) <-----------------+     |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 2. Complete Folder Structure

```text
tracktitans/
├── database/
│   ├── schema.sql                 # Complete PostgreSQL DDL (Neon Serverless)
│   └── seed.sql                   # 10 realistic test records across all lifecycle stages
├── server/
│   ├── .env.example               # Backend environment variables
│   ├── package.json               # Backend dependencies
│   ├── server.js                  # Express entry point, middleware, routes & cron
│   ├── config/
│   │   ├── db.js                  # Neon PostgreSQL connection pool & transactions
│   │   ├── firebaseAdmin.js       # Firebase Admin SDK initialization
│   │   ├── s3.js                  # AWS S3 v3 client & presigner configuration
│   │   └── mailer.js              # Nodemailer SMTP transporter & fallback
│   ├── middleware/
│   │   ├── firebaseAuth.js        # Firebase ID Token verification & DB user lookup
│   │   ├── requireRole.js         # Strict RBAC enforcement (institution, bank, aicte_admin)
│   │   ├── upload.js              # Multer memory storage, 10MB limit, PDF-only filter
│   │   └── errorHandler.js        # Centralized HTTP error handler
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/sync-user & /api/auth/me
│   │   ├── fdrRoutes.js           # /api/fdrs lifecycle endpoints
│   │   └── analyticsRoutes.js     # /api/analytics/summary
│   ├── controllers/
│   │   ├── authController.js      # Auth & profile sync logic
│   │   ├── fdrController.js       # FDR CRUD, bank verify & release approval logic
│   │   └── analyticsController.js # AICTE KPI calculations
│   ├── services/
│   │   ├── userService.js         # User, institution, and bank profile sync
│   │   ├── fdrService.js          # FDR lifecycle business logic & transactions
│   │   ├── s3Service.js           # Private S3 upload & pre-signed URL generation
│   │   ├── notificationService.js # Email dispatch & notifications table logging
│   │   └── analyticsService.js    # Executive summaries & status distributions
│   ├── validators/
│   │   └── fdrValidator.js        # Zod validation schemas
│   ├── jobs/
│   │   └── maturityAlertJob.js    # node-cron scheduled job (9:00 AM Asia/Kolkata)
│   ├── scripts/
│   │   └── seed.js                # Database migration & seed runner
│   └── utils/
│       ├── logger.js              # Structured JSON logging
│       ├── asyncHandler.js        # Async controller wrapper
│       └── checksum.js            # SHA-256 buffer checksum calculator
├── client/
│   ├── .env.example               # Frontend environment variables
│   ├── package.json               # Frontend dependencies
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── postcss.config.js          # PostCSS configuration
│   └── src/
│       ├── main.jsx               # React DOM entry point
│       ├── App.jsx                # React Router setup & protected routes
│       ├── config/
│       │   ├── firebase.js        # Firebase Web Client SDK initialization
│       │   └── api.js             # HTTP client with Bearer token injection
│       ├── context/
│       │   └── AuthContext.jsx    # Auth state, sync, and demo role switcher
│       ├── hooks/
│       │   ├── useAuth.js         # Auth consumer hook
│       │   └── useFdrs.js         # FDR data fetching & filter hook
│       ├── services/
│       │   ├── fdrService.js      # Client FDR API caller with mock store fallback
│       │   └── analyticsService.js# Client Analytics API caller
│       ├── components/
│       │   ├── Navbar.jsx         # Header with role badge & demo switcher
│       │   ├── ProtectedRoute.jsx # Route guard for authentication and roles
│       │   ├── RoleBadge.jsx      # Visual role pill
│       │   ├── StatusBadge.jsx    # Visual status badge with colors & icons
│       │   ├── FileUpload.jsx     # PDF-only 10MB drag-and-drop uploader
│       │   ├── FdrTable.jsx       # Interactive FDR list with countdown & download
│       │   ├── FdrStatusTimeline.jsx # Immutable audit trail visualizer
│       │   ├── AnalyticsCards.jsx # AICTE KPI summary cards
│       │   ├── AlertBanner.jsx    # Notice banners for critical expirations
│       │   ├── Loader.jsx         # Spinner loader
│       │   └── ErrorToast.jsx     # Dismissible error alert
│       └── pages/
│           ├── Login.jsx          # Login page with 1-click evaluator roles
│           ├── Register.jsx       # Multi-role registration page
│           ├── InstitutionDashboard.jsx # College dashboard & release application
│           ├── UploadFDR.jsx      # FDR upload & metadata registration form
│           ├── BankDashboard.jsx  # Bank verification queue & lien toggle
│           ├── AdminDashboard.jsx # AICTE oversight, charts, and release approvals
│           ├── FdrDetails.jsx     # Record view, checksum, and full audit history
│           └── NotFound.jsx       # 404 page
└── README.md
```

---

## 3. Prerequisites

- **Node.js**: v18.x or v20.x+
- **PostgreSQL**: Neon serverless database (or local PostgreSQL 15+)
- **Firebase Project**: With Firebase Authentication enabled (Email/Password)
- **AWS Account**: With S3 bucket for private document storage
- **SMTP Server**: Any SMTP provider (Gmail App Password, Amazon SES, Brevo, SendGrid)

---

## 4. Service Setup Guides

### 4.1 Neon Database Setup
1. Create a free project at [Neon](https://neon.tech).
2. Copy your pooled connection string:
   `postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require`
3. Execute the schema migration:
   ```bash
   psql "YOUR_NEON_DATABASE_URL" -f database/schema.sql
   psql "YOUR_NEON_DATABASE_URL" -f database/seed.sql
   ```

### 4.2 Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** -> **Sign-in method** -> **Email/Password**.
3. Generate Service Account credentials:
   - Project Settings -> Service accounts -> **Generate new private key**.
   - Copy `project_id`, `client_email`, and `private_key` into `server/.env`.
4. Copy Web App config keys into `client/.env`.

### 4.3 AWS S3 Setup
1. In AWS Management Console, create an S3 bucket (e.g. `tracktitans-fdr-documents`).
2. Keep **Block all public access** enabled (all documents are private).
3. Create an IAM User with policy `AmazonS3FullAccess` or restricted to this bucket.
4. Copy `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET` to `server/.env`.

### 4.4 Nodemailer Setup
1. Generate an App Password in your Google Account or SMTP provider.
2. Fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` in `server/.env`.

---

## 5. Local Installation & Running

### Backend Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed     # Applies schema & seeds 10 test records
npm run dev      # Starts API server on http://localhost:5000
```

### Frontend Client
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your VITE_API_BASE_URL and Firebase keys
npm run dev      # Starts Vite dev server on http://localhost:3000
```

---

## 6. API Testing Examples

### 1. Sync User Profile (Firebase token required)
```bash
curl -X POST http://localhost:5000/api/auth/sync-user \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "institution",
    "full_name": "Prof. Sunita Deshmukh",
    "institution_name": "Delhi Institute of Engineering & Technology",
    "aicte_application_id": "AICTE-1-9321482910"
  }'
```

### 2. Upload FDR Record (Institution Only)
```bash
curl -X POST http://localhost:5000/api/fdrs \
  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  -F "fdr_number=SBI-DEL-FDR-2024-99123" \
  -F "deposit_amount=3500000" \
  -F "issue_date=2024-01-15" \
  -F "maturity_date=2029-01-15" \
  -F "bank_name=State Bank of India" \
  -F "branch_name=Parliament Street, New Delhi" \
  -F "ifsc_code=SBIN0000691" \
  -F "fdr_document=@/path/to/receipt.pdf"
```

### 3. Bank Verification & Lien Confirmation (Bank Only)
```bash
curl -X PATCH http://localhost:5000/api/fdrs/RECORD_UUID/verify \
  -H "Authorization: Bearer <BANK_FIREBASE_ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "bank_verified",
    "lien_marked": true,
    "notes": "Verified against bank term deposit register. Lien marked in favor of AICTE."
  }'
```

### 4. AICTE Admin Analytics Summary (Admin Only)
```bash
curl -X GET http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer <ADMIN_FIREBASE_ID_TOKEN>"
```

### 5. Trigger Daily Maturity Alert Job Manually (Admin Only)
```bash
curl -X POST http://localhost:5000/api/jobs/trigger-maturity-check \
  -H "Authorization: Bearer <ADMIN_FIREBASE_ID_TOKEN>"
```

---

## 7. Automated Maturity Job Logic

The daily cron job runs at **9:00 AM Asia/Kolkata (`0 9 * * *`)**:
1. Queries all FDRs where status is not `release_approved` or `rejected`.
2. Evaluates `(maturity_date - CURRENT_DATE)`.
3. If days elapsed is `< 0`, status transitions to `matured`.
4. If days remaining is exactly **30**, **15**, or **7** days:
   - Queries `notifications` table to prevent duplicate dispatches.
   - Dispatches formatted HTML alert to institution contact email.
   - Logs status in `notifications` (`queued`, `sent`, `failed`).
   - Updates status to `expiring_soon`.
