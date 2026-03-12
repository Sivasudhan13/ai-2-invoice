# 🔑 Gemini API Setup Guide

## ❌ Current Issue

**Error**: `Failed to extract invoice data: Unexpected end of JSON input`

**Root Cause**: The Gemini API key is either:
1. Invalid or expired
2. Doesn't have access to the required models
3. Has reached its quota limit

## ✅ Solution: Get a New API Key

### Step 1: Visit Google AI Studio
Go to: https://aistudio.google.com/app/apikey

### Step 2: Create API Key
1. Click "Get API Key" or "Create API Key"
2. Select your Google Cloud project (or create new)
3. Copy the generated API key

### Step 3: Update .env File
Open `backend/.env` and update:

```env
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 4: Restart Backend Server
```bash
cd backend
# Stop the server (Ctrl+C)
node server.js
```

### Step 5: Test the API
```bash
cd backend
node test-gemini-api.js
```

You should see:
```
✅ API Key found
📡 Sending test request to Gemini...
✅ Response received
✅ JSON parsed successfully!
🎉 Gemini API is working correctly!
```

## 🔍 Troubleshooting

### Issue: "API key not valid"
- **Solution**: Generate a new API key from Google AI Studio
- **Link**: https://aistudio.google.com/app/apikey

### Issue: "Quota exceeded"
- **Solution**: Wait for quota reset or upgrade your plan
- **Check**: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### Issue: "Model not found"
- **Solution**: The API key might not have access to Gemini models
- **Fix**: Create a new API key with proper permissions

### Issue: "Network error"
- **Solution**: Check your internet connection
- **Solution**: Check if Google AI services are accessible in your region

## 📝 Alternative: Use Mock Data (For Testing)

If you can't get a Gemini API key right now, you can use mock data:

### Create Mock Service
Create `backend/services/mock-gemini.service.js`:

```javascript
export const extractInvoiceData = async (fileData, mimeType) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock data
  return {
    supplier: {
      name: "ABC Textiles",
      gstin: "33ABCDE1234F1Z5",
      address: "123 Business St, Tiruppur, TN",
      phone: "9876543210",
      email: "contact@abctextiles.com"
    },
    invoice: {
      invoice_number: "INV-2451",
      invoice_date: "2024-02-01",
      due_date: "2024-02-16",
      place_of_supply: "Tamil Nadu",
      payment_terms: "15 days"
    },
    bill_to: {
      name: "XYZ Garments",
      address: "456 Market Rd, Chennai, TN",
      gstin: "33XYZAB5678G1H9",
      phone: "9123456789"
    },
    items: [
      {
        name: "Cotton Fabric",
        description: "Premium quality cotton",
        hsn: "5208",
        qty: 100,
        uom: "mtr",
        rate: 120,
        amount: 12000,
        tax_rate: 18
      },
      {
        name: "Polyester Fabric",
        description: "High quality polyester",
        hsn: "5407",
        qty: 50,
        uom: "mtr",
        rate: 150,
        amount: 7500,
        tax_rate: 18
      }
    ],
    tax: {
      cgst: 1755,
      sgst: 1755,
      igst: 0
    },
    totals: {
      sub_total: 19500,
      tax_total: 3510,
      discount: 0,
      grand_total: 23010
    },
    bank_details: {
      bank_name: "State Bank of India",
      account_number: "1234567890",
      ifsc: "SBIN0001234",
      branch: "Tiruppur Main"
    },
    notes: "Payment due within 15 days. Thank you for your business!"
  };
};
```

### Update Invoice Controller
In `backend/controllers/invoice.controller.js`, change the import:

```javascript
// Comment out real service
// import { extractInvoiceData } from '../services/gemini.service.js';

// Use mock service
import { extractInvoiceData } from '../services/mock-gemini.service.js';
```

## 🎯 Recommended: Get Real API Key

For production use, you should get a real Gemini API key:

1. **Free Tier**: 60 requests per minute
2. **No Credit Card Required**: For testing
3. **Easy Setup**: Takes 2 minutes

**Get your key**: https://aistudio.google.com/app/apikey

## 📊 Current Status

- ❌ Gemini API: Not working (invalid/expired key)
- ✅ Frontend: Working perfectly
- ✅ Backend: Working (except AI extraction)
- ✅ All Features: Implemented and ready

**Once you update the API key, everything will work!**

---

## 🚀 Quick Fix Commands

```bash
# 1. Get new API key from: https://aistudio.google.com/app/apikey

# 2. Update backend/.env
# GEMINI_API_KEY=YOUR_NEW_KEY_HERE

# 3. Test the API
cd backend
node test-gemini-api.js

# 4. If test passes, restart server
node server.js

# 5. Try uploading invoice at: http://localhost:3000/extractor
```

**Need help?** Check the error messages in the backend console for more details.
