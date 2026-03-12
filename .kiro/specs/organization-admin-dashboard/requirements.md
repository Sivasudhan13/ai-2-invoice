# Requirements Document

## Introduction

The Organization Admin Dashboard is a comprehensive management interface for organization administrators in the Invoice OCR application. This feature enables organization admins to create and manage supplier and mentor accounts, monitor invoice processing activities, view analytics, and receive alerts about data quality issues. The dashboard provides role-based UI rendering to ensure users see only the features and data appropriate to their permissions.

## Glossary

- **Organization_Admin**: A user with the role "organization_admin" who manages an organization's supplier and mentor accounts
- **Supplier**: A user with the role "supplier" who can upload invoices and view analysis reports but cannot edit or delete data
- **Mentor**: A user with the role "mentor" who can view invoice details but cannot upload, edit, or delete data
- **Personal_User**: A user with the role "personal" who operates independently without organization affiliation
- **Dashboard**: The main interface component that displays different views based on user role
- **Invoice_Record**: A stored invoice document with extracted OCR data and metadata
- **Alert**: A notification triggered when invoice data quality falls below acceptable thresholds
- **Analytics_Widget**: A visual component displaying statistics, charts, or metrics about invoice processing
- **Permission_Set**: A collection of boolean flags (canUpload, canView, canEdit, canDelete, canManageUsers) that control user capabilities
- **Confidence_Score**: A numerical value (0-100) indicating the reliability of OCR-extracted data
- **Data_Quality_Threshold**: The minimum confidence score (typically 70%) below which an alert is triggered

## Requirements

### Requirement 1: User Account Management

**User Story:** As an organization admin, I want to create and manage supplier and mentor accounts, so that I can control who has access to our organization's invoice system.

#### Acceptance Criteria

1. WHEN an Organization_Admin accesses the dashboard, THE Dashboard SHALL display a user management section
2. WHEN an Organization_Admin creates a Supplier account, THE System SHALL validate the email is unique and create a user with role "supplier" and permissions {canUpload: true, canView: true, canEdit: false, canDelete: false, canManageUsers: false}
3. WHEN an Organization_Admin creates a Mentor account, THE System SHALL validate the email is unique and create a user with role "mentor" and permissions {canUpload: false, canView: true, canEdit: false, canDelete: false, canManageUsers: false}
4. WHEN an Organization_Admin submits a user creation form with an existing email, THE System SHALL return an error message "Email already in use"
5. THE System SHALL link created Supplier and Mentor accounts to the Organization_Admin's organization via organizationId
6. WHEN an Organization_Admin views the user list, THE System SHALL display all users belonging to their organization with name, email, role, and status
7. WHEN an Organization_Admin updates a user's status, THE System SHALL persist the change and reflect it immediately in the user list

### Requirement 2: Supplier Invoice History Tracking

**User Story:** As an organization admin, I want to view all invoices uploaded by my suppliers, so that I can monitor their activity and review extraction data.

#### Acceptance Criteria

1. WHEN an Organization_Admin accesses the invoice history section, THE System SHALL retrieve all Invoice_Records uploaded by Suppliers in their organization
2. THE System SHALL display each Invoice_Record with invoice number, supplier name, upload date, grand total, and processing status
3. WHEN an Organization_Admin selects an Invoice_Record, THE System SHALL display the complete extracted data including supplier details, line items, tax breakdown, and bank details
4. THE System SHALL associate each Invoice_Record with the Supplier who uploaded it via userId reference
5. WHEN an Organization_Admin filters invoices by supplier, THE System SHALL display only Invoice_Records uploaded by the selected Supplier
6. WHEN an Organization_Admin filters invoices by date range, THE System SHALL display only Invoice_Records uploaded within the specified dates
7. THE System SHALL display Confidence_Scores for each extracted field in the detailed invoice view

### Requirement 3: Analytics Dashboard Visualization

**User Story:** As an organization admin, I want to see charts and statistics about invoice processing, so that I can understand usage patterns and performance metrics.

#### Acceptance Criteria

1. WHEN an Organization_Admin accesses the analytics section, THE Dashboard SHALL display at least four Analytics_Widgets
2. THE System SHALL calculate and display the total number of invoices processed in the current month
3. THE System SHALL calculate and display the total invoice value processed in the current month
4. THE System SHALL generate a chart showing invoice upload trends over the last 30 days
5. THE System SHALL generate a chart showing the distribution of invoices by Supplier
6. THE System SHALL calculate and display the average Confidence_Score across all processed invoices
7. THE System SHALL calculate and display the percentage of invoices with Confidence_Score below Data_Quality_Threshold
8. WHEN invoice data changes, THE System SHALL update Analytics_Widgets to reflect current data

### Requirement 4: Data Quality Alert System

**User Story:** As an organization admin, I want to receive alerts when unreliable invoice data is detected, so that I can review and correct low-confidence extractions.

#### Acceptance Criteria

1. WHEN an Invoice_Record is processed with any field having Confidence_Score below Data_Quality_Threshold, THE System SHALL create an Alert
2. THE System SHALL display Alerts in a dedicated notification section on the Dashboard
3. THE Alert SHALL include the invoice number, affected field names, Confidence_Scores, and upload timestamp
4. WHEN an Organization_Admin clicks an Alert, THE System SHALL navigate to the detailed view of the associated Invoice_Record
5. THE System SHALL highlight fields with Confidence_Score below Data_Quality_Threshold in the invoice detail view
6. WHEN an Organization_Admin marks an Alert as reviewed, THE System SHALL update the Alert status to "reviewed"
7. THE System SHALL display a count of unreviewed Alerts in the Dashboard header

### Requirement 5: Role-Based Dashboard Rendering

**User Story:** As a user of any role, I want to see a dashboard tailored to my permissions, so that I can access only the features relevant to my responsibilities.

#### Acceptance Criteria

1. WHEN a Personal_User logs in, THE Dashboard SHALL display only the invoice upload and personal history sections
2. WHEN an Organization_Admin logs in, THE Dashboard SHALL display user management, invoice history, analytics, and alert sections
3. WHEN a Supplier logs in, THE Dashboard SHALL display invoice upload and personal upload history sections
4. WHEN a Mentor logs in, THE Dashboard SHALL display organization invoice history in read-only mode
5. THE System SHALL hide navigation items for features the user lacks permissions to access
6. WHEN a user attempts to access a route without required permissions, THE System SHALL redirect to their default dashboard view
7. THE Dashboard SHALL display the user's role and organization name in the header

### Requirement 6: User Interface Theme Consistency

**User Story:** As a user, I want the organization admin dashboard to match the existing application design, so that I have a consistent visual experience.

#### Acceptance Criteria

1. THE Dashboard SHALL use background color #0f0f23 as the primary background
2. THE Dashboard SHALL apply glass morphism effects to card components with rgba(255,255,255,0.04) background
3. THE Dashboard SHALL use gradient colors from #6c63ff to #a78bfa for primary action buttons
4. THE Dashboard SHALL apply glow animations to active processing indicators
5. THE Dashboard SHALL use the monospace font family for data labels and technical information
6. THE Dashboard SHALL maintain consistent border radius of 10-14px for card components
7. THE Dashboard SHALL use the existing color scheme: #34d399 for success, #fbbf24 for warnings, #ef4444 for errors

### Requirement 7: Supplier Account Creation Form

**User Story:** As an organization admin, I want a form to create supplier accounts, so that I can quickly onboard new suppliers.

#### Acceptance Criteria

1. WHEN an Organization_Admin clicks "Create Supplier", THE Dashboard SHALL display a modal form
2. THE Form SHALL include input fields for name, email, and password
3. WHEN the Organization_Admin submits the form with valid data, THE System SHALL call the /api/organization/supplier endpoint with POST method
4. WHEN the API returns success, THE System SHALL close the modal and refresh the user list
5. WHEN the API returns an error, THE System SHALL display the error message below the form
6. THE Form SHALL validate that email follows standard email format before submission
7. THE Form SHALL validate that password is at least 6 characters before submission

### Requirement 8: Mentor Account Creation Form

**User Story:** As an organization admin, I want a form to create mentor accounts, so that I can grant view-only access to advisors.

#### Acceptance Criteria

1. WHEN an Organization_Admin clicks "Create Mentor", THE Dashboard SHALL display a modal form
2. THE Form SHALL include input fields for name, email, and password
3. WHEN the Organization_Admin submits the form with valid data, THE System SHALL call the /api/organization/mentor endpoint with POST method
4. WHEN the API returns success, THE System SHALL close the modal and refresh the user list
5. WHEN the API returns an error, THE System SHALL display the error message below the form
6. THE Form SHALL validate that email follows standard email format before submission
7. THE Form SHALL validate that password is at least 6 characters before submission

### Requirement 9: Invoice Data Storage and Retrieval

**User Story:** As a developer, I want invoice data to be stored with user and organization references, so that the system can support multi-tenant invoice tracking.

#### Acceptance Criteria

1. WHEN a user uploads an invoice, THE System SHALL create an Invoice_Record with fields: userId, organizationId, extractedData, uploadDate, status, and confidenceScores
2. THE System SHALL store the complete extracted JSON data in the extractedData field
3. THE System SHALL store individual field Confidence_Scores in the confidenceScores object
4. WHEN retrieving invoices for an Organization_Admin, THE System SHALL query Invoice_Records where organizationId matches the admin's organization
5. WHEN retrieving invoices for a Supplier, THE System SHALL query Invoice_Records where userId matches the supplier's ID
6. THE System SHALL index Invoice_Records by organizationId and userId for efficient querying
7. THE System SHALL include createdAt and updatedAt timestamps on all Invoice_Records

### Requirement 10: Authentication and Authorization Middleware

**User Story:** As a developer, I want protected API endpoints for organization admin features, so that unauthorized users cannot access sensitive data.

#### Acceptance Criteria

1. WHEN a request is made to /api/organization/*, THE System SHALL verify a valid JWT token is present in the Authorization header
2. WHEN a request is made to /api/organization/supplier or /api/organization/mentor, THE System SHALL verify the user's role is "organization_admin"
3. WHEN a request is made to /api/organization/invoices, THE System SHALL verify the user has canView permission
4. WHEN authentication fails, THE System SHALL return HTTP status 401 with error message "Unauthorized"
5. WHEN authorization fails, THE System SHALL return HTTP status 403 with error message "Access denied"
6. THE System SHALL extract user information from the JWT token and attach it to req.user
7. THE System SHALL validate the JWT token has not expired before processing the request
