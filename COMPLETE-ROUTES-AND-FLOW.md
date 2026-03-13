# Complete Routes and Application Flow

## Table of Contents
1. [Frontend Routes](#frontend-routes)
2. [Backend API Routes](#backend-api-routes)
3. [User Flows](#user-flows)
4. [Authentication Flow](#authentication-flow)
5. [Route Access Control](#route-access-control)

---

## Frontend Routes

### Public Routes (No Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | Login.jsx | User login page |
| `/signup` | Signup.jsx | User registration page |
| `/extractor` | InvoiceExtractor.jsx | AI Invoice extraction (guest access) |

### Personal User Routes (Authentication Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard.jsx | Personal user dashboard |
| `/history` | History.jsx | Invoice upload history |
| `/supplier/analytics` | SupplierAnalytics.jsx | Supplier analytics and stats |

### Organization Routes (Organization Members Only)

| Route | Component | Description |
|-------|-----------|-------------|
| `/organization/dashboard` | OrganizationDashboard.jsx | Organization admin dashboard |
| `/organization/users` | OrganizationUsers.jsx | Manage organization users |
| `/organization/invoices` | OrganizationInvoices.jsx | View all organization invoices |
| `/organization/alerts` | OrganizationAlerts.jsx | Data quality alerts |
| `/organization/settings` | OrganizationSettings.jsx | Organization settings |

### Supplier Routes (Supplier Role)

| Route | Component | Description |
|-------|-----------|-------------|
| `/supplier/dashboard` | SupplierDashboard.jsx | Supplier dashboard with analytics |

---

## Backend API Routes

### Base URL
```
http://localhost:5000/api
```

### 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register new user |
| POST | `/auth/login` | No | User login |
| GET | `/auth/me` | Yes | Get current user info |

**Request Examples:**

```javascript
// Signup
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "personal" // or "supplier", "mentor"
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Get Me
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
```

---

### 2. Invoice Routes (`/api/invoice`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/invoice/extract` | Optional | Extract invoice data (OCR + AI) |
| POST | `/invoice/upload` | Yes | Upload invoice (authenticated) |
| GET | `/invoice/supplier/stats` | Yes | Get supplier statistics |

**Request Examples:**

```javascript
// Extract Invoice (with or without auth)
POST /api/invoice/extract
Content-Type: multipart/form-data
Body: { invoice: <file> }
Headers: { Authorization: "Bearer <token>" } // Optional

// Response
{
  "success": true,
  "data": {
    "supplier": { ... },
    "invoice": { ... },
    "items": [ ... ],
    "tax": { ... },
    "totals": { ... }
  },
  "confidenceScores": {
    "supplier": { "name": 95, "gstin": 95, ... },
    "invoice": { "invoice_number": 92, ... },
    ...
  },
  "fraudDetection": { ... },
  "anomalyDetection": { ... },
  "metadata": {
    "filename": "invoice.jpg",
    "processingTime": "3.2s",
    "provider": "OCR + Gemini AI"
  }
}

// Get Supplier Stats
GET /api/invoice/supplier/stats
Headers: { Authorization: "Bearer <token>" }
```

---

### 3. History Routes (`/api/history`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/history` | Yes | Get user's invoice history |
| DELETE | `/history/:id` | Yes | Delete invoice from history |

**Request Examples:**

```javascript
// Get History
GET /api/history
Headers: { Authorization: "Bearer <token>" }

// Delete History Item
DELETE /api/history/507f1f77bcf86cd799439011
Headers: { Authorization: "Bearer <token>" }
```

---

### 4. Organization Routes (`/api/organization`)

#### Organization Management

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/organization/create` | Yes | Any | Create organization |
| POST | `/organization/supplier` | Yes | Admin | Create supplier account |
| POST | `/organization/mentor` | Yes | Admin | Create mentor account |
| GET | `/organization/users` | Yes | Admin | List organization users |
| PUT | `/organization/user/status` | Yes | Admin | Update user status |
| PUT | `/organization/user/:userId` | Yes | Admin | Update user details |
| DELETE | `/organization/user/:userId` | Yes | Admin | Delete user |
| GET | `/organization/analytics` | Yes | Admin | Get organization analytics |
| GET | `/organization/invoices` | Yes | Member | Get organization invoices |
| DELETE | `/organization/invoice/:invoiceId` | Yes | Admin | Delete invoice |

**Request Examples:**

```javascript
// Create Supplier
POST /api/organization/supplier
Headers: { Authorization: "Bearer <token>" }
{
  "name": "Supplier Name",
  "email": "supplier@example.com",
  "password": "password123"
}

// Get Organization Users
GET /api/organization/users
Headers: { Authorization: "Bearer <token>" }

// Get Analytics
GET /api/organization/analytics
Headers: { Authorization: "Bearer <token>" }

// Response
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "totalValue": 5000000,
    "avgConfidence": 87.5,
    "lowConfidencePercent": 12.3,
    "uploadTrend": [ ... ],
    "supplierDistribution": [ ... ],
    "vendorAnalysis": [ ... ]
  }
}

// Get Organization Invoices
GET /api/organization/invoices?supplierId=xxx&startDate=2024-01-01&endDate=2024-12-31
Headers: { Authorization: "Bearer <token>" }

// Delete User
DELETE /api/organization/user/507f1f77bcf86cd799439011
Headers: { Authorization: "Bearer <token>" }
```

---

### 5. Alert Routes (`/api/organization/alerts`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/organization/alerts` | Yes | Admin | List all alerts |
| PATCH | `/organization/alerts/:id` | Yes | Admin | Mark alert as reviewed |
| DELETE | `/organization/alerts/:id` | Yes | Admin | Delete alert |

**Request Examples:**

```javascript
// Get Alerts
GET /api/organization/alerts
Headers: { Authorization: "Bearer <token>" }

// Mark as Reviewed
PATCH /api/organization/alerts/507f1f77bcf86cd799439011
Headers: { Authorization: "Bearer <token>" }
{
  "status": "reviewed"
}

// Delete Alert
DELETE /api/organization/alerts/507f1f77bcf86cd799439011
Headers: { Authorization: "Bearer <token>" }
```

---

## User Flows

### 1. Guest User Flow (No Registration)

```
1. Visit http://localhost:3000/extractor
2. Upload invoice image
3. AI extracts data with confidence scores
4. View/edit/download extracted data
5. No data saved (guest mode)
```

**Features Available:**
- ✅ Invoice extraction
- ✅ Confidence scores
- ✅ Fraud detection
- ✅ Anomaly detection
- ✅ Data editing
- ✅ JSON/CSV export
- ❌ History (not saved)
- ❌ Analytics

---

### 2. Personal User Flow

```
1. Signup → /signup
2. Login → /login
3. Dashboard → /dashboard
   - Upload invoices
   - View extraction results
4. History → /history
   - View past invoices
   - Delete invoices
5. Analytics → /supplier/analytics
   - View statistics
   - Track performance
```

**Features Available:**
- ✅ All guest features
- ✅ Invoice history
- ✅ Personal analytics
- ✅ Data persistence
- ❌ Organization features

---

### 3. Organization Admin Flow

```
1. Signup with organization → /signup
2. Login → /login
3. Organization Dashboard → /organization/dashboard
   - View analytics
   - Monitor invoices
   - Check alerts
4. Manage Users → /organization/users
   - Create suppliers
   - Create mentors
   - Update/delete users
5. View Invoices → /organization/invoices
   - All organization invoices
   - Filter by supplier/date
6. Manage Alerts → /organization/alerts
   - Review data quality issues
   - Mark as reviewed
   - Delete alerts
7. Settings → /organization/settings
   - Update organization details
```

**Features Available:**
- ✅ All personal features
- ✅ Organization analytics
- ✅ User management
- ✅ Invoice monitoring
- ✅ Alert management
- ✅ Vendor analysis
- ✅ Fraud detection across org
- ✅ Anomaly detection across org

---

### 4. Supplier Flow

```
1. Created by organization admin
2. Login → /login
3. Supplier Dashboard → /supplier/dashboard
   - Upload invoices
   - View analytics
   - Track submissions
4. Extractor → /extractor
   - Upload invoices
   - View extraction results
```

**Features Available:**
- ✅ Invoice upload
- ✅ Extraction with AI
- ✅ Personal analytics
- ✅ History
- ❌ Organization management
- ❌ User management

---

### 5. Mentor Flow

```
1. Created by organization admin
2. Login → /login
3. View Organization Data
   - View invoices (read-only)
   - View analytics
   - Monitor quality
4. Cannot upload or edit
```

**Features Available:**
- ✅ View organization invoices
- ✅ View analytics
- ❌ Upload invoices
- ❌ Edit data
- ❌ User management

---

## Authentication Flow

### 1. Signup Process

```
User → /signup
  ↓
Fill form (name, email, password, role)
  ↓
POST /api/auth/signup
  ↓
User created in database
  ↓
Auto-login with token
  ↓
Redirect to dashboard
```

### 2. Login Process

```
User → /login
  ↓
Enter email & password
  ↓
POST /api/auth/login
  ↓
Verify credentials
  ↓
Generate JWT token
  ↓
Store token in localStorage
  ↓
Redirect based on role:
  - personal → /dashboard
  - organization_admin → /organization/dashboard
  - supplier → /supplier/dashboard
  - mentor → /organization/dashboard
```

### 3. Protected Route Access

```
User visits protected route
  ↓
Check localStorage for token
  ↓
If no token → Redirect to /login
  ↓
If token exists → Verify with GET /api/auth/me
  ↓
If valid → Allow access
  ↓
If invalid → Clear token, redirect to /login
```

---

## Route Access Control

### Role-Based Access

| Route | Guest | Personal | Supplier | Mentor | Org Admin |
|-------|-------|----------|----------|--------|-----------|
| `/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/signup` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/extractor` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `/history` | ❌ | ✅ | ✅ | ❌ | ❌ |
| `/supplier/dashboard` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `/organization/dashboard` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/organization/users` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/organization/invoices` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `/organization/alerts` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/organization/settings` | ❌ | ❌ | ❌ | ❌ | ✅ |

### Permission-Based Access

**Suppliers:**
- `canUpload`: true
- `canView`: true
- `canEdit`: false
- `canDelete`: false
- `canManageUsers`: false

**Mentors:**
- `canUpload`: false
- `canView`: true
- `canEdit`: false
- `canDelete`: false
- `canManageUsers`: false

**Organization Admins:**
- `canUpload`: true
- `canView`: true
- `canEdit`: true
- `canDelete`: true
- `canManageUsers`: true

---

## Main Application Flow

### Invoice Extraction Flow

```
1. User uploads invoice image
   ↓
2. POST /api/invoice/extract
   ↓
3. Backend: OCR extraction (Tesseract.js)
   ↓
4. Backend: Text → Structured JSON (Gemini AI)
   ↓
5. Backend: Calculate confidence scores
   ↓
6. Backend: Fraud detection (if authenticated)
   ↓
7. Backend: Anomaly detection (if authenticated)
   ↓
8. Backend: Save to history (if authenticated)
   ↓
9. Return response with:
   - Extracted data
   - Confidence scores
   - Fraud detection results
   - Anomaly detection results
   ↓
10. Frontend: Display with confidence badges
```

### Organization Dashboard Flow

```
1. Admin logs in
   ↓
2. Redirect to /organization/dashboard
   ↓
3. Load data:
   - GET /api/organization/analytics
   - GET /api/organization/users
   - GET /api/organization/invoices
   - GET /api/organization/alerts
   ↓
4. Display:
   - Overview tab: Stats, charts, recent invoices
   - Unusual Vendors tab: Vendor analysis
   - Users tab: User list with CRUD
   - Invoices tab: All invoices with filters
   - Alerts tab: Data quality alerts
```

---

## Quick Reference

### Frontend URLs
- **Base**: http://localhost:3000 or http://localhost:5173
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Extractor**: http://localhost:3000/extractor
- **Dashboard**: http://localhost:3000/dashboard
- **Org Dashboard**: http://localhost:3000/organization/dashboard

### Backend URLs
- **Base**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api

### Test Credentials
- **Email**: sivasudhan87@gmail.com
- **Password**: password123
- **Role**: organization_admin

---

## Summary

### Total Routes
- **Frontend**: 12 routes
- **Backend**: 25+ API endpoints
- **Public**: 3 routes
- **Protected**: 9 routes

### User Roles
1. **Guest**: Extractor only
2. **Personal**: Dashboard + History
3. **Supplier**: Upload + Analytics
4. **Mentor**: View only
5. **Organization Admin**: Full access

### Key Features
- ✅ AI Invoice Extraction (OCR + Gemini)
- ✅ Confidence Scores per Field
- ✅ Fraud Detection
- ✅ Anomaly Detection
- ✅ Organization Management
- ✅ User Management
- ✅ Analytics & Charts
- ✅ Alert System
- ✅ Vendor Analysis

All routes are fully functional and ready to use! 🎉
