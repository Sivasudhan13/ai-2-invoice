# Routes Quick Reference Card

## 🌐 Frontend Routes

### Public (No Auth)
```
http://localhost:3000/login          - User login
http://localhost:3000/signup         - User registration
http://localhost:3000/extractor      - AI Invoice extractor (guest access)
```

### Personal User
```
http://localhost:3000/dashboard      - Personal dashboard
http://localhost:3000/history        - Invoice history
http://localhost:3000/supplier/analytics - Analytics
```

### Organization
```
http://localhost:3000/organization/dashboard  - Org dashboard
http://localhost:3000/organization/users      - User management
http://localhost:3000/organization/invoices   - All invoices
http://localhost:3000/organization/alerts     - Data alerts
http://localhost:3000/organization/settings   - Settings
```

### Supplier
```
http://localhost:3000/supplier/dashboard - Supplier dashboard
```

---

## 🔌 Backend API Routes

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
POST   /api/auth/signup    - Register user
POST   /api/auth/login     - Login user
GET    /api/auth/me        - Get current user (auth required)
```

### Invoice Processing
```
POST   /api/invoice/extract          - Extract invoice data (optional auth)
POST   /api/invoice/upload           - Upload invoice (auth required)
GET    /api/invoice/supplier/stats   - Get supplier stats (auth required)
```

### History
```
GET    /api/history        - Get invoice history (auth required)
DELETE /api/history/:id    - Delete invoice (auth required)
```

### Organization
```
POST   /api/organization/create              - Create organization
POST   /api/organization/supplier            - Create supplier (admin)
POST   /api/organization/mentor              - Create mentor (admin)
GET    /api/organization/users               - List users (admin)
PUT    /api/organization/user/status         - Update user status (admin)
PUT    /api/organization/user/:userId        - Update user (admin)
DELETE /api/organization/user/:userId        - Delete user (admin)
GET    /api/organization/analytics           - Get analytics (admin)
GET    /api/organization/invoices            - Get invoices (member)
DELETE /api/organization/invoice/:invoiceId  - Delete invoice (admin)
```

### Alerts
```
GET    /api/organization/alerts     - List alerts (admin)
PATCH  /api/organization/alerts/:id - Mark reviewed (admin)
DELETE /api/organization/alerts/:id - Delete alert (admin)
```

---

## 🔑 Test Credentials

```
Email: sivasudhan87@gmail.com
Password: password123
Role: organization_admin
```

---

## 📊 User Roles & Access

| Feature | Guest | Personal | Supplier | Mentor | Org Admin |
|---------|-------|----------|----------|--------|-----------|
| Invoice Extraction | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save History | ❌ | ✅ | ✅ | ❌ | ✅ |
| View Analytics | ❌ | ✅ | ✅ | ✅ | ✅ |
| Upload Invoices | ✅ | ✅ | ✅ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Org Data | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Alerts | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Quick Start

### 1. Start Services
```bash
# MongoDB
mongod

# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### 2. Access Application
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
Health:   http://localhost:5000/health
```

### 3. Test Flow
```
1. Go to http://localhost:3000/extractor
2. Upload invoice image
3. View extracted data with confidence scores
4. (Optional) Login to save history
```

---

## 📝 API Request Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sivasudhan87@gmail.com","password":"password123"}'
```

### Extract Invoice
```bash
curl -X POST http://localhost:5000/api/invoice/extract \
  -F "invoice=@invoice.jpg"
```

### Get Analytics (with auth)
```bash
curl http://localhost:5000/api/organization/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Main Features

### Invoice Extraction
- **OCR**: Tesseract.js
- **AI**: Google Gemini 2.5 Flash
- **Confidence**: Per-field scores (0-100%)
- **Fraud Detection**: Duplicate checking
- **Anomaly Detection**: Spending pattern analysis

### Organization Management
- **User Management**: Create/update/delete users
- **Analytics**: Charts, stats, trends
- **Vendor Analysis**: Unusual pattern detection
- **Alerts**: Data quality monitoring

### Data Export
- **JSON**: Download structured data
- **CSV**: Export to spreadsheet
- **Edit**: Modify extracted data

---

## 🔄 Typical Workflows

### Guest User
```
/extractor → Upload → View Results → Export
```

### Personal User
```
/login → /dashboard → Upload → /history → /analytics
```

### Supplier
```
/login → /supplier/dashboard → Upload → View Stats
```

### Organization Admin
```
/login → /organization/dashboard → 
  → Manage Users
  → View Invoices
  → Check Alerts
  → Analyze Vendors
```

---

## 📦 Response Structures

### Login Response
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "organization_admin",
    "token": "eyJhbGci...",
    "organizationId": "...",
    "organizationName": "..."
  }
}
```

### Extract Response
```json
{
  "success": true,
  "data": {
    "supplier": {...},
    "invoice": {...},
    "items": [...],
    "tax": {...},
    "totals": {...}
  },
  "confidenceScores": {
    "supplier": {"name": 95, "gstin": 95, ...},
    "invoice": {"invoice_number": 92, ...},
    "items": 88,
    "tax": 85,
    "totals": {"sub_total": 95, ...}
  },
  "fraudDetection": {...},
  "anomalyDetection": {...},
  "metadata": {
    "filename": "invoice.jpg",
    "processingTime": "3.2s",
    "provider": "OCR + Gemini AI"
  }
}
```

### Analytics Response
```json
{
  "success": true,
  "data": {
    "totalInvoices": 150,
    "totalValue": 5000000,
    "avgConfidence": 87.5,
    "lowConfidencePercent": 12.3,
    "uploadTrend": [...],
    "supplierDistribution": [...],
    "vendorAnalysis": [...]
  }
}
```

---

## 🛠️ Troubleshooting

### Backend not responding
```bash
# Check if running
curl http://localhost:5000/health

# Restart
cd backend
npm start
```

### Frontend not loading
```bash
# Check if running on port 3000 or 5173
# Restart
cd frontend
npm run dev
```

### MongoDB connection error
```bash
# Start MongoDB
mongod

# Check connection
mongosh
```

### Authentication issues
```bash
# Reset admin password
cd backend
node reset-admin-password.js
```

---

## 📚 Documentation Files

- `COMPLETE-ROUTES-AND-FLOW.md` - Detailed routes documentation
- `APPLICATION-FLOW-DIAGRAM.md` - Visual flow diagrams
- `CONFIDENCE-SCORES-READY.md` - Confidence scores guide
- `BACKEND-FIXED-SUMMARY.md` - Backend fixes summary
- `START-TESTING.md` - Testing instructions

---

## ✅ Status

- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MongoDB connected
- ✅ All routes functional
- ✅ Confidence scores working
- ✅ Fraud detection active
- ✅ Anomaly detection active

**Everything is ready to use!** 🎉
