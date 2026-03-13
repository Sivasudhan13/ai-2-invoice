# 🚨 Fraud Detection System - Complete

## Overview
Implemented a comprehensive fraud detection system that analyzes invoices against existing database records to identify duplicates and suspicious patterns.

## Features

### 1. 🔍 Duplicate Detection
Automatically checks for:
- **Exact Duplicates**: Same supplier name AND invoice number
- **Possible Duplicates**: Same supplier, date, and amount with similar invoice number
- **Suspicious Patterns**: Same supplier and amount with different invoice numbers

### 2. 🎯 Detection Rules

#### Rule 1: Exact Duplicate (Critical Risk)
```
IF supplier_name matches exactly
AND invoice_number matches exactly
THEN fraud_status = "Duplicate Invoice"
```

**Example:**
```
Current: ABC Textiles | INV-1023 | 10-03-2026 | ₹11,800
Existing: ABC Textiles | INV-1023 | 10-03-2026 | ₹11,800
Result: 🚨 DUPLICATE INVOICE
```

#### Rule 2: Possible Duplicate (High Risk)
```
IF supplier_name similarity > 85%
AND date within 3 days
AND amount within 1%
AND invoice_number similarity 50-99%
THEN fraud_status = "Possible Duplicate"
```

**Example:**
```
Current: ABC Textiles | INV-1023 | 10-03-2026 | ₹11,800
Existing: ABC Textiles | INV-1024 | 11-03-2026 | ₹11,800
Result: ⚠️ POSSIBLE DUPLICATE (invoice number slightly different)
```

#### Rule 3: Suspicious Pattern (Medium Risk)
```
IF supplier_name similarity > 90%
AND amount within 0.5%
AND invoice_number similarity < 50%
THEN fraud_status = "Suspicious Pattern"
```

**Example:**
```
Current: ABC Textiles | INV-5001 | 10-03-2026 | ₹11,800
Existing: ABC Textiles | INV-2023 | 05-03-2026 | ₹11,800
Result: 🔍 SUSPICIOUS PATTERN (multiple invoices with same amount)
```

#### Rule 4: Valid Invoice (Low Risk)
```
IF no matches found
THEN fraud_status = "Valid Invoice"
```

### 3. 📊 Detection Response Format

```json
{
  "fraud_status": "Duplicate Invoice",
  "reason": "Exact match found: Invoice INV-1023 from ABC Textiles already exists",
  "confidence": 100,
  "matched_invoice": {
    "supplier": "ABC Textiles",
    "invoice_number": "INV-1023",
    "date": "2026-03-10",
    "amount": 11800,
    "uploaded_at": "2026-03-12T10:30:00Z"
  },
  "risk_level": "critical",
  "action_required": "Reject this invoice - it has already been processed"
}
```

### 4. 🎨 Visual Indicators

#### Critical Risk (Red)
- 🚨 Icon
- Red background and border
- Status: "Duplicate Invoice"
- Action: Reject immediately

#### High Risk (Yellow)
- ⚠️ Icon
- Yellow background and border
- Status: "Possible Duplicate"
- Action: Review carefully

#### Medium Risk (Orange)
- 🔍 Icon
- Orange background and border
- Status: "Suspicious Pattern"
- Action: Verify with supplier

#### Low Risk (Green)
- ✅ Icon
- Green background and border
- Status: "Valid Invoice"
- Action: Process normally

## Technical Implementation

### Backend Service (`fraud-detection.service.js`)

#### Main Function: `detectFraud()`
```javascript
detectFraud(currentInvoice, userId, organizationId)
```

**Parameters:**
- `currentInvoice`: The invoice data being checked
- `userId`: User ID (optional)
- `organizationId`: Organization ID (optional)

**Returns:**
- `fraud_status`: Status string
- `reason`: Detailed explanation
- `confidence`: Confidence score (0-100)
- `matched_invoice`: Details of matched invoice
- `risk_level`: Risk level (critical/high/medium/low)
- `action_required`: Recommended action

#### Similarity Algorithms

**String Similarity (Levenshtein Distance)**
- Compares supplier names and invoice numbers
- Returns similarity score 0-1
- Threshold: 85% for supplier match

**Date Comparison**
- Tolerance: ±3 days
- Handles different date formats
- Accounts for data entry delays

**Amount Comparison**
- Tolerance: ±1% for possible duplicates
- Tolerance: ±0.5% for suspicious patterns
- Handles currency formatting

### Database Integration

**Query Scope:**
- Organization-level: Checks all invoices in organization
- User-level: Checks user's invoices only
- Performance: Limited to recent 1000 invoices

**Data Source:**
- Collection: `History` model
- Fields checked: `extractedData.supplier.name`, `extractedData.invoice.invoice_number`, etc.

### Frontend Integration

**Component: `FraudDetectionBanner`**
- Displays fraud detection results
- Color-coded by risk level
- Shows matched invoice details
- Provides action recommendations

**Display Logic:**
- Appears after successful extraction
- Only shown if fraud detection ran (authenticated users)
- Positioned between success banner and view toggle

## Usage Examples

### Example 1: First Invoice (Valid)
```
Upload: ABC Textiles | INV-1001 | ₹10,000
Database: Empty
Result: ✅ Valid Invoice - First invoice from this supplier
```

### Example 2: Exact Duplicate (Critical)
```
Upload: ABC Textiles | INV-1001 | ₹10,000
Database: ABC Textiles | INV-1001 | ₹10,000 (uploaded yesterday)
Result: 🚨 Duplicate Invoice - Reject immediately
```

### Example 3: Modified Invoice Number (High Risk)
```
Upload: ABC Textiles | INV-1001A | 10-03-2026 | ₹10,000
Database: ABC Textiles | INV-1001 | 10-03-2026 | ₹10,000
Result: ⚠️ Possible Duplicate - Review carefully
```

### Example 4: Same Amount Pattern (Medium Risk)
```
Upload: ABC Textiles | INV-5001 | ₹10,000
Database: 
  - ABC Textiles | INV-2001 | ₹10,000
  - ABC Textiles | INV-3001 | ₹10,000
Result: 🔍 Suspicious Pattern - Verify with supplier
```

## API Response Structure

### Success Response with Fraud Detection
```json
{
  "success": true,
  "data": { /* extracted invoice data */ },
  "confidenceScores": { /* confidence scores */ },
  "fraudDetection": {
    "fraud_status": "Valid Invoice",
    "reason": "No duplicates or suspicious patterns detected",
    "confidence": 100,
    "matched_invoice": null,
    "risk_level": "low",
    "action_required": "None - invoice can be processed"
  },
  "metadata": { /* processing metadata */ }
}
```

## Configuration

### Adjustable Parameters

**In `fraud-detection.service.js`:**
```javascript
// String similarity threshold
const SUPPLIER_SIMILARITY_THRESHOLD = 0.85; // 85%

// Date tolerance
const DATE_TOLERANCE_DAYS = 3; // ±3 days

// Amount tolerance
const AMOUNT_TOLERANCE_PERCENT = 1; // ±1%

// Invoice number similarity range
const INVOICE_NUM_MIN_SIMILARITY = 0.5; // 50%
const INVOICE_NUM_MAX_SIMILARITY = 1.0; // 100%
```

## Security Considerations

1. **Data Isolation**: 
   - Organization users only see their organization's invoices
   - Individual users only see their own invoices

2. **Performance**:
   - Limited to 1000 recent invoices per check
   - Efficient string comparison algorithms
   - Indexed database queries

3. **Privacy**:
   - No cross-organization data leakage
   - Matched invoice details only shown to authorized users

## Testing

### Test Scenarios

1. **Upload same invoice twice**
   - Expected: Duplicate Invoice (Critical)

2. **Upload invoice with modified number**
   - Expected: Possible Duplicate (High Risk)

3. **Upload multiple invoices with same amount**
   - Expected: Suspicious Pattern (Medium Risk)

4. **Upload unique invoice**
   - Expected: Valid Invoice (Low Risk)

### Test Script
```bash
# Test fraud detection
cd backend
node test-fraud-detection.js
```

## Future Enhancements

- [ ] Machine learning for pattern detection
- [ ] Supplier blacklist/whitelist
- [ ] Historical fraud analytics dashboard
- [ ] Email alerts for critical duplicates
- [ ] Bulk invoice fraud checking
- [ ] Custom fraud rules per organization
- [ ] Integration with accounting systems

## Troubleshooting

### Issue: Fraud detection not running
**Solution**: Ensure user is authenticated (fraud detection only runs for logged-in users)

### Issue: False positives
**Solution**: Adjust similarity thresholds in `fraud-detection.service.js`

### Issue: Performance slow
**Solution**: Reduce invoice limit or add database indexes

## Summary

✅ Duplicate detection implemented
✅ Suspicious pattern detection
✅ Database integration complete
✅ Visual fraud alerts in UI
✅ Risk-based action recommendations
✅ Configurable detection rules
✅ Organization and user-level isolation
✅ Comprehensive logging and reporting
