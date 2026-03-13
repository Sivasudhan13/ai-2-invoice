# Application Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                  (React + Vite)                              │
│              http://localhost:3000                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Public Routes:                                              │
│  • /login                                                    │
│  • /signup                                                   │
│  • /extractor (Guest Access)                                 │
│                                                              │
│  Personal Routes:                                            │
│  • /dashboard                                                │
│  • /history                                                  │
│  • /supplier/analytics                                       │
│                                                              │
│  Organization Routes:                                        │
│  • /organization/dashboard                                   │
│  • /organization/users                                       │
│  • /organization/invoices                                    │
│  • /organization/alerts                                      │
│  • /organization/settings                                    │
│                                                              │
│  Supplier Routes:                                            │
│  • /supplier/dashboard                                       │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTP Requests
                   │ (JWT Token in Headers)
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                        BACKEND                               │
│                  (Node.js + Express)                         │
│              http://localhost:5000                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  API Routes:                                                 │
│  • /api/auth/*        - Authentication                       │
│  • /api/invoice/*     - Invoice processing                   │
│  • /api/history/*     - Invoice history                      │
│  • /api/organization/* - Organization management             │
│                                                              │
│  Services:                                                   │
│  • OCR Service (Tesseract.js)                               │
│  • Gemini AI Service (Google Gemini 2.5 Flash)             │
│  • Fraud Detection Service                                   │
│  • Anomaly Detection Service                                 │
│  • Alert Service                                             │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Database Queries
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                      DATABASE                                │
│                  (MongoDB)                                   │
│         mongodb://localhost:27017/invoiceDB                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Collections:                                                │
│  • users          - User accounts                            │
│  • organizations  - Organization details                     │
│  • histories      - Invoice extraction history               │
│  • alerts         - Data quality alerts                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## User Journey Flows

### 1. Guest User Journey

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Visit /extractor    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Upload Invoice      │
│ (Image/PDF)         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ AI Processing       │
│ • OCR Extraction    │
│ • Gemini AI         │
│ • Confidence Calc   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ View Results        │
│ • Extracted Data    │
│ • Confidence Scores │
│ • Edit if needed    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Export Data         │
│ • Download JSON     │
│ • Download CSV      │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘

Note: No data saved (guest mode)
```

---

### 2. Personal User Journey

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Signup/Login        │
│ Role: personal      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Dashboard           │
│ /dashboard          │
└──────┬──────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ Upload Invoice  │   │ View History    │
│ /extractor      │   │ /history        │
└──────┬──────────┘   └──────┬──────────┘
       │                     │
       ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ AI Processing   │   │ Past Invoices   │
│ + Save History  │   │ • View          │
└──────┬──────────┘   │ • Delete        │
       │              └─────────────────┘
       ▼
┌─────────────────┐
│ View Results    │
│ • Data          │
│ • Confidence    │
│ • Fraud Check   │
│ • Anomaly Check │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Analytics       │
│ /supplier/      │
│ analytics       │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

### 3. Organization Admin Journey

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Signup/Login        │
│ Role: org_admin     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Organization Dashboard                   │
│ /organization/dashboard                  │
│                                          │
│ Tabs:                                    │
│ • Overview (Stats, Charts)               │
│ • Unusual Vendors (Analysis)             │
│ • Users (Management)                     │
│ • Invoices (All org invoices)            │
│ • Alerts (Data quality)                  │
└──────┬──────────────────────────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Manage      │ │ View All    │ │ Monitor     │ │ Vendor      │
│ Users       │ │ Invoices    │ │ Alerts      │ │ Analysis    │
│             │ │             │ │             │ │             │
│ • Create    │ │ • Filter    │ │ • Review    │ │ • Unusual   │
│   Supplier  │ │ • Search    │ │ • Mark      │ │   Patterns  │
│ • Create    │ │ • Delete    │ │   Reviewed  │ │ • Risk      │
│   Mentor    │ │             │ │ • Delete    │ │   Levels    │
│ • Update    │ │             │ │             │ │             │
│ • Delete    │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
                      ▼
              ┌─────────────┐
              │    END      │
              └─────────────┘
```

---

### 4. Supplier Journey

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Login               │
│ (Created by admin)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supplier Dashboard  │
│ /supplier/dashboard │
└──────┬──────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│ Upload Invoice  │   │ View Analytics  │
│ /extractor      │   │ • Total uploads │
└──────┬──────────┘   │ • Avg confidence│
       │              │ • Recent items  │
       ▼              └─────────────────┘
┌─────────────────┐
│ AI Processing   │
│ • OCR           │
│ • Gemini AI     │
│ • Confidence    │
│ • Fraud Check   │
│ • Anomaly Check │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ View Results    │
│ (Saved to org)  │
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│    END      │
└─────────────┘
```

---

## Invoice Processing Flow

```
┌─────────────────────┐
│ User Uploads Image  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend: POST /api/invoice/extract      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Step 1: OCR Extraction                  │
│ • Tesseract.js                          │
│ • Extract text from image               │
│ • Output: Raw text                      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Step 2: AI Structured Extraction        │
│ • Google Gemini 2.5 Flash               │
│ • Convert text → JSON                   │
│ • Output: Structured data               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Step 3: Confidence Calculation          │
│ • Text matching                         │
│ • Format validation                     │
│ • Data quality checks                   │
│ • Output: Confidence scores (0-100%)    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Step 4: Fraud Detection (if auth)       │
│ • Compare with existing invoices        │
│ • Check for duplicates                  │
│ • Detect suspicious patterns            │
│ • Output: Fraud status                  │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Step 5: Anomaly Detection (if auth)     │
│ • Analyze spending patterns             │
│ • Calculate statistics                  │
│ • Detect unusual amounts                │
│ • Output: Anomaly status                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Step 6: Save to Database (if auth)      │
│ • Save to History collection            │
│ • Link to user/organization             │
│ • Generate alerts if needed             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Step 7: Return Response                 │
│ • Extracted data                        │
│ • Confidence scores                     │
│ • Fraud detection results               │
│ • Anomaly detection results             │
│ • Metadata                              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend: Display Results               │
│ • Show data with confidence badges      │
│ • Color-coded (High/Medium/Low)         │
│ • Fraud/Anomaly alerts                  │
│ • Edit/Export options                   │
└─────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────┐
│ User: /signup       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ POST /api/auth/signup                   │
│ • Validate input                        │
│ • Hash password (bcrypt)                │
│ • Create user in DB                     │
│ • Set permissions based on role         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Generate JWT Token                      │
│ • Payload: { id, role, orgId }          │
│ • Secret: JWT_SECRET                    │
│ • Expiry: 30 days                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Return Response                         │
│ {                                       │
│   success: true,                        │
│   data: {                               │
│     id, name, email, role,              │
│     token, organizationId               │
│   }                                     │
│ }                                       │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend: Store Token                   │
│ • localStorage.setItem('token', token)  │
│ • Redirect based on role                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Protected Route Access                  │
│ • Add token to request headers          │
│ • Authorization: Bearer <token>         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend: Verify Token                   │
│ • jwt.verify(token, JWT_SECRET)         │
│ • Find user in DB                       │
│ • Check role/permissions                │
│ • Attach user to req.user               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Allow/Deny Access                       │
│ • If valid: Continue to route handler   │
│ • If invalid: Return 401 Unauthorized   │
└─────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│  (Frontend)  │
└──────┬───────┘
       │
       │ 1. Upload Invoice
       │
       ▼
┌──────────────────────────────────────────┐
│           Express Server                 │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Multer Middleware                 │ │
│  │  • Receive file                    │ │
│  │  • Save to /uploads                │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│           ▼                              │
│  ┌────────────────────────────────────┐ │
│  │  OCR Service                       │ │
│  │  • Tesseract.js                    │ │
│  │  • Extract text                    │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│           ▼                              │
│  ┌────────────────────────────────────┐ │
│  │  Gemini AI Service                 │ │
│  │  • Send text to Gemini             │ │
│  │  • Receive structured JSON         │ │
│  │  • Calculate confidence            │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│           ▼                              │
│  ┌────────────────────────────────────┐ │
│  │  Fraud Detection Service           │ │
│  │  • Query existing invoices         │ │
│  │  • Compare patterns                │ │
│  │  • Detect duplicates               │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│           ▼                              │
│  ┌────────────────────────────────────┐ │
│  │  Anomaly Detection Service         │ │
│  │  • Calculate statistics            │ │
│  │  • Detect unusual amounts          │ │
│  │  • Generate alerts                 │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│           ▼                              │
│  ┌────────────────────────────────────┐ │
│  │  Save to MongoDB                   │ │
│  │  • History collection              │ │
│  │  • Alert collection (if needed)    │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
└───────────┼──────────────────────────────┘
            │
            │ 2. Return Response
            │
            ▼
┌──────────────────────────────────────────┐
│           Browser                        │
│  • Display extracted data                │
│  • Show confidence badges                │
│  • Display fraud/anomaly alerts          │
│  • Enable edit/export                    │
└──────────────────────────────────────────┘
```

---

## Quick Reference

### Key URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: mongodb://localhost:27017/invoiceDB

### Main Routes
- **Login**: /login
- **Extractor**: /extractor
- **Dashboard**: /dashboard
- **Org Dashboard**: /organization/dashboard

### API Endpoints
- **Extract**: POST /api/invoice/extract
- **Login**: POST /api/auth/login
- **Analytics**: GET /api/organization/analytics

### User Roles
1. Guest (no auth)
2. Personal
3. Supplier
4. Mentor
5. Organization Admin

All flows are fully functional! 🎉
