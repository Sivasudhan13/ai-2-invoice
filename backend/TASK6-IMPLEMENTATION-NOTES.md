# Task 6: Organization Invoice History Endpoint - Implementation Notes

## Overview
Implemented the GET `/api/organization/invoices` endpoint to allow organization admins and users with `canView` permission to retrieve all invoices from their organization's suppliers with filtering capabilities.

## Implementation Details

### Endpoint
- **URL**: `GET /api/organization/invoices`
- **Authentication**: Required (JWT token)
- **Authorization**: User must have `canView` permission

### Query Parameters
All parameters are optional:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `supplierId` | String (ObjectId) | Filter invoices by specific supplier | `?supplierId=507f1f77bcf86cd799439011` |
| `startDate` | String (ISO Date) | Filter invoices from this date onwards | `?startDate=2024-01-01` |
| `endDate` | String (ISO Date) | Filter invoices up to this date (inclusive) | `?endDate=2024-12-31` |

### Response Format

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "invoiceNumber": "INV-2024-001",
      "supplier": {
        "id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "uploadDate": "2024-01-15T10:30:00.000Z",
      "grandTotal": 15000.50,
      "status": "processed",
      "filename": "invoice_jan_2024.pdf",
      "confidenceScores": {
        "invoiceNumber": 95,
        "grandTotal": 88,
        "supplierName": 92
      },
      "extractedData": {
        "invoiceNumber": "INV-2024-001",
        "grandTotal": 15000.50,
        // ... other extracted fields
      }
    }
  ]
}
```

### Features Implemented

#### 1. Permission-Based Access Control
- Verifies user has `canView` permission before allowing access
- Returns 403 error if permission is missing
- Works for both organization admins and mentors

#### 2. Organization Scoping
- Automatically filters invoices by user's `organizationId`
- Ensures users only see invoices from their organization
- No cross-organization data leakage

#### 3. Supplier Filtering
- Filter by specific supplier using `supplierId` query parameter
- Useful for viewing invoices from a single supplier
- Validates supplier belongs to the same organization

#### 4. Date Range Filtering
- Support for `startDate` and `endDate` parameters
- Can use either or both parameters
- `endDate` includes the entire day (set to 23:59:59.999)
- Dates should be in ISO format (YYYY-MM-DD)

#### 5. User Details Population
- Populates supplier information (name, email, role)
- Includes supplier ID for further filtering
- Handles cases where user might be deleted (shows "Unknown")

#### 6. Confidence Scores
- Includes confidence scores for each invoice
- Empty object if no confidence scores available
- Useful for identifying low-quality extractions

#### 7. Sorting
- Invoices sorted by upload date (newest first)
- Uses `createdAt` field with descending order
- Ensures most recent invoices appear first

#### 8. Complete Invoice Data
- Returns both summary and detailed extracted data
- Includes filename for reference
- Status field indicates processing state

## Files Modified

### 1. `backend/controllers/organization.controller.js`
Added new function `getOrganizationInvoices`:
- Implements all filtering logic
- Handles permission checks
- Formats response with supplier details
- Includes comprehensive error handling

### 2. `backend/routes/organization.routes.js`
- Added import for `getOrganizationInvoices`
- Added route: `router.get('/invoices', getOrganizationInvoices)`
- Route protected by `protect` middleware (applied to all routes)

## Testing

### Manual Testing
Use the provided test script:

```bash
node backend/test-invoice-endpoint-simple.js <admin-email> <admin-password>
```

### Test Cases Covered
1. ✓ Basic retrieval of all organization invoices
2. ✓ Filter by specific supplier
3. ✓ Filter by date range (start and end dates)
4. ✓ Verify sorting (newest first)
5. ✓ Verify response structure includes all required fields
6. ✓ Permission check (canView required)
7. ✓ Supplier details populated correctly
8. ✓ Confidence scores included in response

### Example API Calls

#### Get all invoices
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/organization/invoices
```

#### Filter by supplier
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/organization/invoices?supplierId=507f1f77bcf86cd799439011"
```

#### Filter by date range
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/organization/invoices?startDate=2024-01-01&endDate=2024-12-31"
```

#### Combined filters
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/organization/invoices?supplierId=507f1f77bcf86cd799439011&startDate=2024-01-01"
```

## Acceptance Criteria Status

- [x] Create GET /api/organization/invoices endpoint
- [x] Support query parameters: supplierId, startDate, endDate
- [x] Return invoices with user details (supplier name)
- [x] Include confidence scores in response
- [x] Verify user has canView permission
- [x] Sort by upload date (newest first)

## Requirements Addressed

✓ **Requirement 2: Supplier Invoice History Tracking**
- Organization admins can view all invoices from their suppliers
- Each invoice displays invoice number, supplier name, upload date, grand total, and status
- Complete extracted data available in response
- Confidence scores included for data quality monitoring
- Filtering by supplier and date range supported
- Invoices associated with uploading supplier via userId reference

## Error Handling

The endpoint handles the following error cases:

1. **Missing Permission (403)**
   ```json
   {
     "success": false,
     "error": "Access denied - canView permission required"
   }
   ```

2. **Invalid Date Format (500)**
   - Returns error if date cannot be parsed
   - Includes error message in response

3. **Database Errors (500)**
   ```json
   {
     "success": false,
     "error": "Failed to fetch organization invoices"
   }
   ```

4. **Missing Authentication (401)**
   - Handled by `protect` middleware
   - Returns "Unauthorized" error

## Security Considerations

1. **Authentication Required**: All requests must include valid JWT token
2. **Permission Check**: Verifies `canView` permission before access
3. **Organization Scoping**: Users can only access their organization's data
4. **No Data Leakage**: Supplier filtering validates supplier belongs to organization
5. **Input Validation**: Date parameters validated before use in queries

## Performance Considerations

1. **Indexed Queries**: Uses existing indexes on `organizationId` and `userId`
2. **Selective Population**: Only populates necessary user fields (name, email, role)
3. **Efficient Sorting**: Uses database-level sorting with index support
4. **Query Optimization**: Builds filter object dynamically to avoid unnecessary conditions

## Future Enhancements

Potential improvements for future iterations:

1. **Pagination**: Add limit/skip parameters for large datasets
2. **Additional Filters**: Status, invoice number search, amount range
3. **Aggregation**: Summary statistics in response (total amount, count by status)
4. **Export**: CSV/Excel export functionality
5. **Caching**: Cache frequently accessed invoice lists
6. **Search**: Full-text search across invoice fields

## Notes

- The endpoint works for both organization admins and mentors (anyone with `canView` permission)
- Empty confidence scores object returned if not available (backward compatibility)
- Supplier information gracefully handles deleted users (shows "Unknown")
- Date filtering is inclusive of the end date (entire day included)
- All dates returned in ISO 8601 format for consistency
