# Testing Confidence Scores

## Quick Test Steps

### 1. Check Backend is Running
```bash
# Should show: Server running on port 5000
curl http://localhost:5000/health
```

### 2. Check Frontend is Running
Open: http://localhost:3000/extractor

### 3. Upload an Invoice

1. Go to http://localhost:3000/extractor
2. Click to upload an invoice image
3. Click "Extract Data with AI"
4. Open browser console (F12)
5. Look for these logs:

```
✅ API Response: { success: true, data: {...}, confidenceScores: {...} }
📊 Confidence Scores: { supplier: {...}, invoice: {...}, ... }
```

### 4. Check if Confidence Badges Appear

After extraction, you should see badges like:

```
Supplier Name: ABC Company    [High 95%] 🟢
GSTIN: 29ABCDE1234F1Z5       [High 95%] 🟢
```

## If Confidence Scores Don't Show

### Check 1: Backend Logs

Look at backend terminal for:
```
🤖 Sending text to Gemini for structured extraction...
✅ Gemini response received
📊 Confidence scores calculated
```

### Check 2: Frontend Console

Open browser console (F12) and check for:
- API response structure
- Confidence scores object
- Any JavaScript errors

### Check 3: API Response Structure

The response should look like:
```json
{
  "success": true,
  "data": {
    "supplier": { "name": "...", ... },
    "invoice": { ... },
    ...
  },
  "confidenceScores": {
    "supplier": {
      "name": 95,
      "gstin": 95,
      ...
    },
    "invoice": {
      "invoice_number": 92,
      ...
    },
    ...
  }
}
```

## Common Issues

### Issue 1: Confidence Scores is null/undefined
**Cause**: Backend not returning confidence scores
**Fix**: Check backend logs for errors in gemini-text.service.js

### Issue 2: Badges not showing
**Cause**: Frontend not receiving confidence scores
**Fix**: Check browser console for API response

### Issue 3: All scores are 0
**Cause**: Confidence calculation failing
**Fix**: Check if original OCR text is being passed correctly

## Manual Test

### Test Backend Directly

Create a test file `backend/test-confidence.js`:

```javascript
import { extractInvoiceDataFromText } from './services/gemini-text.service.js';

const testText = `
INVOICE
Invoice No: INV-001
Date: 2024-03-12
Supplier: ABC Company
GSTIN: 29ABCDE1234F1Z5
Amount: Rs. 50,000
`;

const test = async () => {
  const result = await extractInvoiceDataFromText(testText);
  console.log('Data:', result.data);
  console.log('Confidence Scores:', result.confidenceScores);
};

test();
```

Run:
```bash
cd backend
node test-confidence.js
```

Should output confidence scores for each field.

## Expected Output

### Backend Console
```
🤖 Sending text to Gemini for structured extraction...
✅ Gemini response received
📄 Raw response length: 1234
🧹 Cleaned JSON length: 1200
✅ JSON parsed and validated successfully
📊 Confidence scores calculated
```

### Frontend Console
```
✅ API Response: {
  success: true,
  data: { supplier: {...}, invoice: {...}, ... },
  confidenceScores: {
    supplier: { name: 95, gstin: 95, ... },
    invoice: { invoice_number: 92, ... },
    items: 88,
    tax: 85,
    totals: { sub_total: 95, ... }
  }
}
```

### UI Display
```
┌─────────────────────────────────────────┐
│ 📦 Supplier Information                 │
├─────────────────────────────────────────┤
│ Name    ABC Company    [High 95%] 🟢   │
│ GSTIN   29ABC...       [High 95%] 🟢   │
│ Address 123 Main St    [Medium 80%] 🟡 │
└─────────────────────────────────────────┘
```

## Debugging Commands

### Check if backend is returning confidence scores:
```bash
curl -X POST http://localhost:5000/api/invoice/extract \
  -F "invoice=@test-invoice.jpg" \
  | jq '.confidenceScores'
```

### Check frontend state:
Open browser console and type:
```javascript
// After uploading an invoice
console.log(window.confidenceScores);
```

## Status Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000/5173
- [ ] MongoDB connected
- [ ] Gemini API key configured
- [ ] Test invoice uploaded
- [ ] Confidence scores in API response
- [ ] Confidence badges visible in UI

If all checked, confidence scores should be working! 🎉
