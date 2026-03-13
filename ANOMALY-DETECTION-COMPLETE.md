# 📊 Anomaly Detection System - Complete

## Overview
Implemented an intelligent anomaly detection system that analyzes invoice amounts against historical spending patterns to identify unusual or high-risk expenses.

## Features

### 1. 📈 Statistical Analysis
- Calculates mean, median, standard deviation
- Identifies typical spending ranges (Q1-Q3)
- Computes Z-scores for outlier detection
- Tracks min/max historical amounts

### 2. 🎯 Detection Rules

#### Rule 1: High Risk Expense (Critical)
```
IF amount > 3x average OR z-score > 3
THEN status = "High Risk Expense"
```

**Example:**
```
Supplier: ABC Textiles
Current: ₹85,000
Average: ₹7,500 (from 15 invoices)
Ratio: 11.3x
Result: 🚨 HIGH RISK EXPENSE
```

#### Rule 2: Unusual Expense (High Risk)
```
IF amount 2-3x average OR z-score 2-3
THEN status = "Unusual Expense"
```

**Example:**
```
Supplier: ABC Textiles
Current: ₹18,000
Average: ₹7,500
Ratio: 2.4x
Result: ⚠️ UNUSUAL EXPENSE
```

#### Rule 3: Elevated Expense (Medium Risk)
```
IF amount 1.5-2x average OR z-score 1.5-2
THEN status = "Elevated Expense"
```

#### Rule 4: Unusually Low (Medium Risk)
```
IF amount < 0.5x average AND below Q1
THEN status = "Unusually Low"
```

#### Rule 5: Normal Expense (Low Risk)
```
IF amount within typical range
THEN status = "Normal Expense"
```


### 3. 📊 Response Format

```json
{
  "status": "Unusual Expense",
  "risk_level": "high",
  "alert_message": "⚠️ WARNING: Invoice amount is unusually high",
  "reason": "Amount is 2.4x higher than average (₹7,500). Typical range: ₹5,000 - ₹10,000.",
  "current_amount": 18000,
  "statistics": {
    "supplier": "ABC Textiles",
    "historical_count": 15,
    "average_amount": 7500,
    "median_amount": 7200,
    "min_amount": 4500,
    "max_amount": 12000,
    "typical_range": {
      "lower": 5000,
      "upper": 10000
    },
    "standard_deviation": 2100
  },
  "analysis": {
    "ratio_to_average": 2.4,
    "z_score": 5.0,
    "deviation_amount": 10500,
    "percentage_difference": 140
  }
}
```

### 4. 🎨 Visual Indicators

- 🚨 **Critical (Red)**: High Risk Expense - >3x average
- ⚠️ **High (Yellow)**: Unusual Expense - 2-3x average
- 📊 **Medium (Blue)**: Elevated/Low - 1.5-2x or <0.5x
- ✅ **Low (Green)**: Normal Expense - within range
- ℹ️ **Info (Purple)**: First invoice or insufficient data

## Technical Implementation

### Statistical Methods

**Mean (Average)**
```javascript
mean = sum(amounts) / count
```

**Standard Deviation**
```javascript
variance = sum((amount - mean)²) / count
stdDev = √variance
```

**Z-Score (Outlier Detection)**
```javascript
z_score = |current_amount - mean| / stdDev
```

**Quartiles (Typical Range)**
```javascript
Q1 = 25th percentile
Q3 = 75th percentile
typical_range = [Q1, Q3]
```

### Supplier Matching
- Normalizes supplier names (lowercase, trim, remove special chars)
- Handles variations (e.g., "ABC Ltd" matches "ABC")
- Case-insensitive comparison

## Usage Examples

### Example 1: Normal Expense
```
Current: ₹8,000
Historical: ₹5,000 - ₹10,000 (avg ₹7,500)
Result: ✅ Normal Expense
```

### Example 2: Unusual Expense
```
Current: ₹18,000
Historical: ₹5,000 - ₹10,000 (avg ₹7,500)
Ratio: 2.4x
Result: ⚠️ Unusual Expense - Review required
```

### Example 3: High Risk
```
Current: ₹85,000
Historical: ₹5,000 - ₹10,000 (avg ₹7,500)
Ratio: 11.3x
Result: 🚨 High Risk Expense - Approval required
```

### Example 4: First Invoice
```
Current: ₹15,000
Historical: None
Result: ℹ️ First Invoice - No comparison data
```

## Integration

### Backend
- Service: `anomaly-detection.service.js`
- Integrated in: `invoice.controller.js`
- Runs automatically for authenticated users
- Returns results in API response

### Frontend
- Component: `AnomalyDetectionBanner`
- Displays after fraud detection banner
- Shows statistics and analysis
- Provides recommendations

## Recommendations System

For High Risk or Unusual expenses, the system suggests:
- Verify invoice details with supplier
- Check for additional line items or bulk orders
- Confirm pricing and quantities are correct
- Obtain approval from finance team

## Configuration

Adjustable thresholds in `anomaly-detection.service.js`:
```javascript
// High risk threshold
const HIGH_RISK_RATIO = 3.0;
const HIGH_RISK_Z_SCORE = 3.0;

// Unusual threshold
const UNUSUAL_RATIO = 2.0;
const UNUSUAL_Z_SCORE = 2.0;

// Elevated threshold
const ELEVATED_RATIO = 1.5;
const ELEVATED_Z_SCORE = 1.5;
```

## Summary

✅ Statistical analysis implemented
✅ Historical spending patterns tracked
✅ Z-score outlier detection
✅ Multiple risk levels (critical/high/medium/low)
✅ Visual alerts with detailed statistics
✅ Supplier-specific analysis
✅ Actionable recommendations
✅ First invoice handling
✅ Database integration complete
