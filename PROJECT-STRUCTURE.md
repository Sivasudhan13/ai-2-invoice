# Project Folder Structure

## Root Directory
```
invoice-ai-system/
├── backend/                    # Node.js + Express backend
├── frontend/                   # React + Vite frontend
├── .git/                       # Git repository
├── .kiro/                      # Kiro IDE configuration
├── .vscode/                    # VS Code settings
├── start-all.bat               # Windows batch script to start both servers
├── FIX-AND-START.bat          # Quick fix and start script
├── TEST-CREATE-SUPPLIER.bat   # Test supplier creation
└── *.md                       # Documentation files
```

## Backend Structure (`/backend`)
```
backend/
├── config/                     # Configuration files
│   ├── database.js            # MongoDB connection config
│   ├── gemini.config.js       # Google Gemini AI config
│   └── multer.config.js       # File upload config
│
├── controllers/               # Request handlers
│   ├── alert.controller.js    # Alert management
│   ├── auth.controller.js     # Authentication (login, signup)
│   ├── history.controller.js  # Invoice history
│   ├── invoice.controller.js  # Invoice extraction & processing
│   └── organization.controller.js  # Organization management
│
├── middleware/                # Express middleware
│   ├── auth.js               # JWT authentication & authorization
│   └── errorHandler.js       # Global error handling
│
├── models/                    # MongoDB schemas
│   ├── Alert.model.js        # Alert schema
│   ├── History.model.js      # Invoice history schema
│   ├── Organization.model.js # Organization schema
│   └── User.model.js         # User schema
│
├── routes/                    # API route definitions
│   ├── alert.routes.js       # /api/alerts
│   ├── auth.routes.js        # /api/auth
│   ├── history.routes.js     # /api/history
│   ├── invoice.routes.js     # /api/invoice
│   └── organization.routes.js # /api/organization
│
├── services/                  # Business logic
│   ├── alert.service.js      # Alert generation logic
│   ├── anomaly-detection.service.js  # Spending anomaly detection
│   ├── file.service.js       # File handling utilities
│   ├── fraud-detection.service.js    # Duplicate invoice detection
│   ├── gemini-text.service.js        # Gemini AI text extraction
│   ├── gemini.service.js     # Gemini AI service (legacy)
│   ├── mock-gemini.service.js        # Mock service for testing
│   └── ocr.service.js        # Tesseract OCR service
│
├── node_modules/              # Dependencies
├── uploads/                   # Uploaded invoice files (gitignored)
│
├── .env                       # Environment variables (SECRET!)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies & scripts
├── package-lock.json         # Locked dependency versions
├── server.js                 # Main server entry point
│
├── check-admin.js            # Utility: Check admin user
├── create-org-admin.js       # Utility: Create org admin
├── create-supplier.js        # Utility: Create supplier
├── quick-fix-db.js           # Utility: Database quick fix
├── quick-test-supplier.js    # Utility: Test supplier
├── reset-admin-password.js   # Utility: Reset admin password
├── seed-admin.js             # Utility: Seed admin user
├── start-server.js           # Alternative server starter
├── start-with-mongodb.bat    # Windows: Start with MongoDB
│
├── eng.traineddata           # Tesseract English language data
├── out.log                   # Server output log
├── log2.txt                  # Log file 2
└── log3.txt                  # Log file 3
```

## Frontend Structure (`/frontend`)
```
frontend/
├── src/                       # Source code
│   ├── components/           # React components
│   │   ├── ChartTest.jsx    # Chart testing component
│   │   ├── EditableField.jsx # Editable field component
│   │   ├── EnhancedInvoiceOCR.jsx  # Enhanced OCR component
│   │   ├── EvaluationPanel.jsx     # Evaluation display
│   │   ├── History.jsx      # History component
│   │   ├── InvoiceOCRDemo.jsx      # OCR demo
│   │   ├── InvoiceUploadExtractor.jsx  # Main invoice extractor
│   │   ├── Login.jsx        # Login form
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── OrganizationAdminDashboard.jsx  # Org admin dashboard
│   │   ├── OrganizationLayout.jsx  # Org layout wrapper
│   │   ├── OrganizationSidebar.jsx # Org sidebar navigation
│   │   ├── PrivateRoute.jsx # Protected route wrapper
│   │   └── VendorAnalysisPanel.jsx # Vendor analysis display
│   │
│   ├── context/              # React context
│   │   └── AuthContext.jsx  # Authentication context
│   │
│   ├── pages/                # Page components
│   │   ├── Dashboard.jsx    # Personal dashboard
│   │   ├── History.jsx      # History page
│   │   ├── InvoiceExtractor.jsx    # Invoice extractor page
│   │   ├── Login.jsx        # Login page
│   │   ├── OrganizationAlerts.jsx  # Org alerts page
│   │   ├── OrganizationDashboard.jsx  # Org dashboard page
│   │   ├── OrganizationInvoices.jsx   # Org invoices page
│   │   ├── OrganizationSettings.jsx   # Org settings page
│   │   ├── OrganizationUsers.jsx      # Org users page
│   │   ├── Signup.jsx       # Signup page
│   │   ├── SupplierAnalytics.jsx      # Supplier analytics
│   │   └── SupplierDashboard.jsx      # Supplier dashboard
│   │
│   ├── utils/                # Utility functions
│   │   ├── confidenceScore.js  # Confidence score calculations
│   │   ├── csvExport.js     # CSV export utilities
│   │   └── validation.js    # Form validation
│   │
│   ├── App.css              # Global styles
│   ├── App.jsx              # Main app component with routing
│   ├── index.css            # Base CSS
│   ├── main.jsx             # React entry point
│   └── theme.js             # Custom color theme
│
├── node_modules/             # Dependencies
├── public/                   # Static assets
│
├── index.html               # HTML template
├── package.json             # Dependencies & scripts
├── package-lock.json        # Locked dependency versions
├── vite.config.js           # Vite configuration
├── test-recharts-import.js  # Test recharts import
│
└── *.md                     # Documentation files
```

## Documentation Files (Root)
```
├── ANOMALY-DETECTION-COMPLETE.md      # Anomaly detection docs
├── APPLICATION-FLOW-DIAGRAM.md        # Flow diagrams
├── BACKEND-FIXED-SUMMARY.md           # Backend fixes summary
├── BONUS-FEATURES.md                  # Bonus features list
├── COMPLETE-ROUTES-AND-FLOW.md        # Complete routes documentation
├── COMPLETE-SYSTEM-SUMMARY.md         # System overview
├── CONFIDENCE-SCORES-ENHANCED.md      # Confidence scores docs
├── CONFIDENCE-SCORES-READY.md         # Confidence scores ready
├── CONFIDENCE-SCORES-VISUAL-GUIDE.md  # Visual guide
├── CORS-ERROR-FIXED.md                # CORS fix documentation
├── CREATE-SUPPLIER-DEBUG-GUIDE.md     # Supplier creation debug
├── CREATE-SUPPLIER-FIX-SUMMARY.md     # Supplier fix summary
├── CRUD-VENDOR-ANALYSIS-COMPLETE.md   # CRUD operations docs
├── DATABASE-FIXED.md                  # Database fixes
├── ENHANCED-DASHBOARD-COMPLETE.md     # Dashboard enhancements
├── EVALUATION-FEATURE-COMPLETE.md     # Evaluation feature docs
├── EXTRACTOR-NAVIGATION-ADDED.md      # Navigation updates
├── FIX-CREATE-SUPPLIER-ERROR.md       # Supplier error fixes
├── FRAUD-DETECTION-COMPLETE.md        # Fraud detection docs
├── GEMINI-API-SETUP.md                # Gemini API setup guide
├── INVOICE-DETAIL-MODAL-COMPLETE.md   # Invoice modal docs
├── INVOICE-EXTRACTOR-GUIDE.md         # Extractor guide
├── LOGIN-SIGNUP-FIXED.md              # Login/signup fixes
├── MONGODB-CONNECTION-FIX.md          # MongoDB connection fix
├── OCR-GEMINI-SETUP.md                # OCR + Gemini setup
├── ORGANIZATION-DASHBOARD-API-FIXED.md # Dashboard API fixes
├── QUICK-FIX-REFERENCE.md             # Quick fix reference
├── QUICK-START.md                     # Quick start guide
├── README.md                          # Main readme
├── REAL-AI-INTEGRATION-COMPLETE.md    # AI integration docs
├── ROUTES-QUICK-REFERENCE.md          # Routes reference
├── START-HERE.md                      # Getting started
├── START-TESTING.md                   # Testing guide
├── TEST-CHECKLIST.md                  # Test checklist
├── TEST-CONFIDENCE-SCORES.md          # Confidence testing
├── TEST-UI-NOW.md                     # UI testing guide
└── UI-TROUBLESHOOTING-GUIDE.md        # UI troubleshooting
```

## Key Technologies by Folder

### Backend (`/backend`)
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **AI/ML**: Google Gemini 2.5 Flash, Tesseract.js OCR
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Security**: bcryptjs, cors, helmet

### Frontend (`/frontend`)
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Styling**: Inline styles with custom theme
- **HTTP**: Fetch API
- **State**: React Context API + useState/useEffect

## Environment Files

### Backend `.env` (Required)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invoiceDB
JWT_SECRET=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### Frontend (No .env needed)
- API URL hardcoded: `http://localhost:5000`

## Port Configuration
- **Backend**: Port 5000 (`http://localhost:5000`)
- **Frontend**: Port 3000 (`http://localhost:3000`)
- **MongoDB**: Port 27017 (default)

## Important Directories (Gitignored)
```
backend/node_modules/     # Backend dependencies
backend/uploads/          # Uploaded invoice files
frontend/node_modules/    # Frontend dependencies
frontend/dist/            # Production build
.env                      # Environment secrets
```

## Scripts Location

### Backend Scripts (`backend/package.json`)
```json
{
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Frontend Scripts (`frontend/package.json`)
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Root Scripts (Windows Batch Files)
- `start-all.bat` - Start both backend and frontend
- `FIX-AND-START.bat` - Fix database and start servers
- `TEST-CREATE-SUPPLIER.bat` - Test supplier creation

## Data Flow
```
User Upload (Frontend)
    ↓
API Request (/api/invoice/extract)
    ↓
Multer (File Upload) → backend/uploads/
    ↓
OCR Service (Tesseract.js) → Extract text
    ↓
Gemini Service (AI) → Structure JSON
    ↓
Fraud Detection Service → Check duplicates
    ↓
Anomaly Detection Service → Check patterns
    ↓
History Model → Save to MongoDB
    ↓
Response to Frontend → Display results
```

## Database Collections
```
MongoDB (invoiceDB)
├── users              # User accounts
├── organizations      # Organization data
├── histories          # Invoice history
└── alerts             # Data quality alerts
```

## API Endpoints Structure
```
/api/auth/*            # Authentication routes
/api/invoice/*         # Invoice processing routes
/api/history/*         # History routes
/api/organization/*    # Organization routes
/api/alerts/*          # Alert routes
```

## Component Hierarchy (Frontend)
```
App.jsx (Router)
├── AuthProvider (Context)
├── Public Routes
│   ├── Login
│   └── Signup
├── Personal Routes (PrivateRoute)
│   ├── Dashboard
│   ├── InvoiceExtractor
│   └── History
├── Organization Routes (PrivateRoute + OrganizationLayout)
│   ├── OrganizationDashboard
│   ├── OrganizationInvoices
│   ├── OrganizationUsers
│   ├── OrganizationAlerts
│   └── OrganizationSettings
└── Supplier Routes (PrivateRoute)
    ├── SupplierDashboard
    └── SupplierAnalytics
```

---

**Total Files**: 100+ files
**Total Lines of Code**: ~15,000+ lines
**Languages**: JavaScript (JSX), JSON, Markdown, Batch
**Database**: MongoDB (NoSQL)
**Architecture**: MERN Stack (MongoDB, Express, React, Node.js)
