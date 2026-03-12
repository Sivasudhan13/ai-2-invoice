# Implementation Tasks

## Task 1: Update History Model for Organization Support

**Status:** pending

**Description:**
Update the History model to include organizationId and confidenceScores fields to support multi-tenant invoice tracking and data quality monitoring.

**Requirements Addressed:**
- Requirement 9: Invoice Data Storage and Retrieval

**Acceptance Criteria:**
- [ ] Add organizationId field (ObjectId reference to Organization)
- [ ] Add confidenceScores field (Object type) to store field-level confidence scores
- [ ] Add indexes on organizationId and userId for efficient querying
- [ ] Ensure createdAt and updatedAt timestamps are enabled

**Files to Modify:**
- backend/models/History.model.js

---

## Task 2: Create Alert Model

**Status:** pending

**Description:**
Create a new Alert model to store data quality alerts for low-confidence invoice extractions.

**Requirements Addressed:**
- Requirement 4: Data Quality Alert System

**Acceptance Criteria:**
- [ ] Create Alert schema with fields: invoiceId, organizationId, affectedFields, confidenceScores, status, createdAt
- [ ] Add status enum: ['unreviewed', 'reviewed']
- [ ] Add index on organizationId and status
- [ ] Include reference to History model via invoiceId

**Files to Create:**
- backend/models/Alert.model.js

---

## Task 3: Update Invoice Controller to Store Organization Data

**Status:** pending

**Description:**
Modify the invoice extraction controller to store organizationId and confidenceScores when processing invoices.

**Requirements Addressed:**
- Requirement 9: Invoice Data Storage and Retrieval

**Acceptance Criteria:**
- [ ] Extract organizationId from authenticated user (req.user.organizationId)
- [ ] Store organizationId in History record
- [ ] Calculate and store confidenceScores for each extracted field
- [ ] Handle both organization and personal users

**Files to Modify:**
- backend/controllers/invoice.controller.js

---

## Task 4: Create Alert Generation Service

**Status:** pending

**Description:**
Create a service that automatically generates alerts when invoice data has confidence scores below the threshold (70%).

**Requirements Addressed:**
- Requirement 4: Data Quality Alert System

**Acceptance Criteria:**
- [ ] Create checkDataQuality function that analyzes confidenceScores
- [ ] Generate Alert when any field has confidence < 70%
- [ ] Store affected field names and their confidence scores
- [ ] Return alert data for immediate display

**Files to Create:**
- backend/services/alert.service.js

---

## Task 5: Create Organization Analytics Controller

**Status:** pending

**Description:**
Create controller endpoints to retrieve analytics data for organization admins including invoice counts, totals, trends, and confidence metrics.

**Requirements Addressed:**
- Requirement 3: Analytics Dashboard Visualization

**Acceptance Criteria:**
- [ ] Create GET /api/organization/analytics endpoint
- [ ] Calculate total invoices processed this month
- [ ] Calculate total invoice value this month
- [ ] Generate 30-day upload trend data
- [ ] Calculate invoice distribution by supplier
- [ ] Calculate average confidence score
- [ ] Calculate percentage of low-confidence invoices
- [ ] Verify user is organization_admin

**Files to Modify:**
- backend/controllers/organization.controller.js

---

## Task 6: Create Organization Invoice History Endpoints

**Status:** pending

**Description:**
Create API endpoints for organization admins to retrieve all invoices from their suppliers with filtering capabilities.

**Requirements Addressed:**
- Requirement 2: Supplier Invoice History Tracking

**Acceptance Criteria:**
- [ ] Create GET /api/organization/invoices endpoint
- [ ] Support query parameters: supplierId, startDate, endDate
- [ ] Return invoices with user details (supplier name)
- [ ] Include confidence scores in response
- [ ] Verify user has canView permission
- [ ] Sort by upload date (newest first)

**Files to Modify:**
- backend/controllers/organization.controller.js

---

## Task 7: Create Alert Management Endpoints

**Status:** pending

**Description:**
Create API endpoints for retrieving and managing data quality alerts.

**Requirements Addressed:**
- Requirement 4: Data Quality Alert System

**Acceptance Criteria:**
- [ ] Create GET /api/organization/alerts endpoint (list all alerts)
- [ ] Create PATCH /api/organization/alerts/:id endpoint (mark as reviewed)
- [ ] Filter alerts by organizationId
- [ ] Include invoice details in alert response
- [ ] Return unreviewed alert count
- [ ] Verify user is organization_admin

**Files to Create:**
- backend/controllers/alert.controller.js
- backend/routes/alert.routes.js

---

## Task 8: Add Authorization Middleware for Organization Routes

**Status:** pending

**Description:**
Create middleware to verify organization admin role and permissions for protected routes.

**Requirements Addressed:**
- Requirement 10: Authentication and Authorization Middleware

**Acceptance Criteria:**
- [ ] Create requireRole middleware that checks req.user.role
- [ ] Create requirePermission middleware that checks req.user.permissions
- [ ] Return 403 error for unauthorized access
- [ ] Apply to organization management routes
- [ ] Verify JWT token validity

**Files to Modify:**
- backend/middleware/auth.js

---

## Task 9: Update Organization Routes

**Status:** pending

**Description:**
Add new routes for analytics, invoice history, and alerts to the organization router.

**Requirements Addressed:**
- Requirements 2, 3, 4

**Acceptance Criteria:**
- [ ] Add GET /api/organization/analytics route
- [ ] Add GET /api/organization/invoices route
- [ ] Add GET /api/organization/alerts route
- [ ] Add PATCH /api/organization/alerts/:id route
- [ ] Apply auth and role middleware to all routes

**Files to Modify:**
- backend/routes/organization.routes.js

---

## Task 10: Create Organization Admin Dashboard Component

**Status:** pending

**Description:**
Create the main dashboard component for organization admins with sections for user management, analytics, invoice history, and alerts.

**Requirements Addressed:**
- Requirements 1, 2, 3, 4, 5, 6

**Acceptance Criteria:**
- [ ] Create OrganizationAdminDashboard component
- [ ] Display user management section with create buttons
- [ ] Display analytics widgets (4 stat cards + 2 charts)
- [ ] Display alert notification section
- [ ] Display invoice history table/grid
- [ ] Use dark theme (#0f0f23) with glass morphism
- [ ] Apply gradient buttons (#6c63ff to #a78bfa)
- [ ] Show organization name in header

**Files to Create:**
- frontend/src/components/OrganizationAdminDashboard.jsx

---

## Task 11: Create User Management Section Component

**Status:** pending

**Description:**
Create a component to display and manage organization users (suppliers and mentors).

**Requirements Addressed:**
- Requirement 1: User Account Management

**Acceptance Criteria:**
- [ ] Display list of organization users in grid/table
- [ ] Show name, email, role, status for each user
- [ ] Add "Create Supplier" button
- [ ] Add "Create Mentor" button
- [ ] Implement real-time list refresh after creation
- [ ] Use glass morphism card design
- [ ] Add role badges with colors

**Files to Create:**
- frontend/src/components/UserManagementSection.jsx

---

## Task 12: Create Supplier Account Creation Modal

**Status:** pending

**Description:**
Create a modal form component for creating supplier accounts.

**Requirements Addressed:**
- Requirement 7: Supplier Account Creation Form

**Acceptance Criteria:**
- [ ] Create modal with form fields: name, email, password
- [ ] Validate email format before submission
- [ ] Validate password length (min 6 characters)
- [ ] Call POST /api/organization/supplier on submit
- [ ] Display success message and close modal
- [ ] Display error message if API fails
- [ ] Use dark theme with glass morphism
- [ ] Add loading spinner during submission

**Files to Create:**
- frontend/src/components/CreateSupplierModal.jsx

---

## Task 13: Create Mentor Account Creation Modal

**Status:** pending

**Description:**
Create a modal form component for creating mentor accounts.

**Requirements Addressed:**
- Requirement 8: Mentor Account Creation Form

**Acceptance Criteria:**
- [ ] Create modal with form fields: name, email, password
- [ ] Validate email format before submission
- [ ] Validate password length (min 6 characters)
- [ ] Call POST /api/organization/mentor on submit
- [ ] Display success message and close modal
- [ ] Display error message if API fails
- [ ] Use dark theme with glass morphism
- [ ] Add loading spinner during submission

**Files to Create:**
- frontend/src/components/CreateMentorModal.jsx

---

## Task 14: Create Analytics Dashboard Component

**Status:** pending

**Description:**
Create a component to display analytics widgets with charts and statistics.

**Requirements Addressed:**
- Requirement 3: Analytics Dashboard Visualization

**Acceptance Criteria:**
- [ ] Display 4 stat cards: total invoices, total value, avg confidence, low-confidence %
- [ ] Create line chart for 30-day upload trends
- [ ] Create bar/pie chart for invoice distribution by supplier
- [ ] Fetch data from GET /api/organization/analytics
- [ ] Auto-refresh data every 30 seconds
- [ ] Use glass morphism cards with glow effects
- [ ] Format currency values properly
- [ ] Use chart library (recharts or chart.js)

**Files to Create:**
- frontend/src/components/AnalyticsDashboard.jsx

---

## Task 15: Create Alert Notification Component

**Status:** pending

**Description:**
Create a component to display data quality alerts with notification badges.

**Requirements Addressed:**
- Requirement 4: Data Quality Alert System

**Acceptance Criteria:**
- [ ] Display alert count badge in dashboard header
- [ ] Show list of unreviewed alerts
- [ ] Display invoice number, affected fields, confidence scores
- [ ] Add "Mark as Reviewed" button for each alert
- [ ] Navigate to invoice detail on alert click
- [ ] Fetch alerts from GET /api/organization/alerts
- [ ] Update count after marking as reviewed
- [ ] Use warning colors (#fbbf24) for alert badges

**Files to Create:**
- frontend/src/components/AlertNotifications.jsx

---

## Task 16: Create Organization Invoice History Component

**Status:** pending

**Description:**
Create a component to display all invoices uploaded by organization suppliers with filtering.

**Requirements Addressed:**
- Requirement 2: Supplier Invoice History Tracking

**Acceptance Criteria:**
- [ ] Display invoice grid/table with invoice number, supplier, date, total
- [ ] Add filter dropdown for supplier selection
- [ ] Add date range filter inputs
- [ ] Fetch data from GET /api/organization/invoices
- [ ] Show confidence scores for each invoice
- [ ] Open invoice detail modal on click
- [ ] Use glass morphism cards
- [ ] Highlight low-confidence invoices

**Files to Create:**
- frontend/src/components/OrganizationInvoiceHistory.jsx

---

## Task 17: Update Dashboard Page with Role-Based Rendering

**Status:** pending

**Description:**
Update the main Dashboard page to render different components based on user role.

**Requirements Addressed:**
- Requirement 5: Role-Based Dashboard Rendering

**Acceptance Criteria:**
- [ ] Check user.role from AuthContext
- [ ] Render OrganizationAdminDashboard for organization_admin
- [ ] Render EnhancedInvoiceOCR for personal users
- [ ] Render SupplierDashboard for supplier role
- [ ] Render MentorDashboard for mentor role
- [ ] Display role and organization name in header
- [ ] Redirect to appropriate view if accessing wrong route

**Files to Modify:**
- frontend/src/pages/Dashboard.jsx

---

## Task 18: Create Supplier Dashboard Component

**Status:** pending

**Description:**
Create a simplified dashboard for supplier users with upload and personal history only.

**Requirements Addressed:**
- Requirement 5: Role-Based Dashboard Rendering

**Acceptance Criteria:**
- [ ] Display EnhancedInvoiceOCR component for uploads
- [ ] Display personal upload history (only user's own invoices)
- [ ] Hide edit and delete buttons (read-only after upload)
- [ ] Use same dark theme styling
- [ ] Show "Supplier" role badge in header

**Files to Create:**
- frontend/src/components/SupplierDashboard.jsx

---

## Task 19: Create Mentor Dashboard Component

**Status:** pending

**Description:**
Create a read-only dashboard for mentor users to view organization invoice history.

**Requirements Addressed:**
- Requirement 5: Role-Based Dashboard Rendering

**Acceptance Criteria:**
- [ ] Display OrganizationInvoiceHistory in read-only mode
- [ ] Remove all action buttons (no create/edit/delete)
- [ ] Fetch invoices from GET /api/organization/invoices
- [ ] Show invoice details in modal view
- [ ] Use same dark theme styling
- [ ] Show "Mentor" role badge in header

**Files to Create:**
- frontend/src/components/MentorDashboard.jsx

---

## Task 20: Update Navbar with Role-Based Navigation

**Status:** pending

**Description:**
Update the Navbar component to show/hide navigation items based on user permissions.

**Requirements Addressed:**
- Requirement 5: Role-Based Dashboard Rendering

**Acceptance Criteria:**
- [ ] Show "Dashboard" link for all authenticated users
- [ ] Show "History" link only if user.permissions.canView is true
- [ ] Show "Manage Users" link only for organization_admin
- [ ] Show "Analytics" link only for organization_admin
- [ ] Display user role badge next to username
- [ ] Display organization name for organization users

**Files to Modify:**
- frontend/src/components/Navbar.jsx

---

## Task 21: Install Chart Library Dependencies

**Status:** pending

**Description:**
Install necessary npm packages for chart visualization in the analytics dashboard.

**Requirements Addressed:**
- Requirement 3: Analytics Dashboard Visualization

**Acceptance Criteria:**
- [ ] Install recharts or chart.js library
- [ ] Verify installation in package.json
- [ ] Test basic chart rendering

**Files to Modify:**
- frontend/package.json

---

## Task 22: Update AuthContext with Organization Data

**Status:** pending

**Description:**
Update AuthContext to include organization information and permissions in user state.

**Requirements Addressed:**
- Requirement 5: Role-Based Dashboard Rendering

**Acceptance Criteria:**
- [ ] Include organizationId in user state
- [ ] Include permissions object in user state
- [ ] Include organization name in user state
- [ ] Fetch organization details on login
- [ ] Persist organization data in localStorage

**Files to Modify:**
- frontend/src/context/AuthContext.jsx

---

## Task 23: Create Protected Route for Organization Admin

**Status:** pending

**Description:**
Create a route guard component that restricts access to organization admin features.

**Requirements Addressed:**
- Requirement 5: Role-Based Dashboard Rendering

**Acceptance Criteria:**
- [ ] Check if user.role === 'organization_admin'
- [ ] Redirect to dashboard if unauthorized
- [ ] Show 403 error message for unauthorized access
- [ ] Allow access if role matches

**Files to Create:**
- frontend/src/components/AdminRoute.jsx

---

## Task 24: Update Invoice Extraction to Generate Confidence Scores

**Status:** pending

**Description:**
Update the Gemini service to calculate confidence scores for each extracted field based on AI response quality.

**Requirements Addressed:**
- Requirement 9: Invoice Data Storage and Retrieval
- Requirement 4: Data Quality Alert System

**Acceptance Criteria:**
- [ ] Analyze Gemini response for field completeness
- [ ] Assign confidence score (0-100) to each field
- [ ] Use heuristics: empty = 0, partial = 50, complete = 80-100
- [ ] Return confidenceScores object alongside extractedData
- [ ] Integrate with alert generation service

**Files to Modify:**
- backend/services/gemini.service.js

---

## Task 25: Integration Testing

**Status:** pending

**Description:**
Test the complete organization admin dashboard workflow end-to-end.

**Requirements Addressed:**
- All requirements

**Acceptance Criteria:**
- [ ] Test organization admin login and dashboard access
- [ ] Test creating supplier account
- [ ] Test creating mentor account
- [ ] Test supplier uploading invoice
- [ ] Test viewing supplier invoices as admin
- [ ] Test analytics data display
- [ ] Test alert generation for low-confidence data
- [ ] Test marking alerts as reviewed
- [ ] Test mentor read-only access
- [ ] Test role-based navigation hiding/showing
- [ ] Test filtering invoices by supplier and date
- [ ] Verify all UI elements match dark theme design

**Files to Test:**
- All created and modified files
