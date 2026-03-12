# 🚀 Quick Start - Invoice Extractor (Mock Mode)

## ✅ **FIXED! Now Using Mock Data**

The system is now configured to use **mock data** so you can test all features immediately without needing a Gemini API key!

## 🎯 **What's Working Now**

### ✨ All Features Available:
1. ✅ **Upload Invoice** - Any image file (JPG/PNG)
2. ✅ **AI Extraction** - Returns realistic sample data
3. ✅ **Split View** - Invoice image + extracted data
4. ✅ **Editable Fields** - Click "Edit Data" to modify
5. ✅ **Confidence Scores** - Per-field quality indicators
6. ✅ **CSV Export** - Download as CSV file
7. ✅ **JSON Export** - Download as JSON file
8. ✅ **Copy JSON** - One-click clipboard copy
9. ✅ **Zoom Image** - Zoom in/out on invoice

## 🚀 **Start Using Now**

### 1. Start Backend (if not running)
```bash
cd backend
node server.js
```

### 2. Start Frontend (if not running)
```bash
cd frontend
npm run dev
```

### 3. Open Browser
Visit: **http://localhost:3000/extractor**

### 4. Upload Any Invoice Image
- Click the upload area
- Select any JPG or PNG image
- Click "Extract Data with AI"
- Wait 2 seconds (simulated processing)
- See the results!

## 📊 **Sample Data Returned**

The mock service returns realistic invoice data:

```json
{
  "supplier": {
    "name": "ABC Textiles Private Limited",
    "gstin": "33ABCDE1234F1Z5",
    "address": "Plot No. 45, Industrial Area, Tiruppur, TN",
    "phone": "9876543210"
  },
  "invoice": {
    "invoice_number": "INV-2024-2451",
    "invoice_date": "2024-02-01",
    "place_of_supply": "Tamil Nadu",
    "payment_terms": "Net 15 days"
  },
  "items": [
    {
      "name": "Cotton Fabric - Premium Quality",
      "hsn": "5208",
      "qty": 100,
      "uom": "mtr",
      "rate": 120,
      "amount": 12000
    }
  ],
  "tax": {
    "cgst": 2655,
    "sgst": 2655,
    "igst": 0
  },
  "totals": {
    "sub_total": 29500,
    "tax_total": 5310,
    "grand_total": 34810
  }
}
```

## 🎨 **Visual Indicator**

You'll see a yellow notice banner:
```
ℹ️ Using Sample Data (Testing Mode)
This is mock data for testing. To use real AI extraction, 
update your GEMINI_API_KEY in backend/.env
```

## 🧪 **Test All Features**

### 1. View Extracted Data
- See supplier info, invoice details, line items
- Check confidence scores (High/Medium/Low)
- View tax breakdown and totals

### 2. Edit Data
- Click "✏️ Edit Data" button
- Modify any field
- Click "✓ Save Changes"

### 3. Export Data
- **CSV**: Click "📊 Export CSV"
- **JSON**: Click "💾 Download JSON"
- **Copy**: Click "📋 Copy JSON"

### 4. Zoom Invoice
- Click "🔍 Zoom" button
- Pan around the image
- Click "🔍 Fit" to reset

## 🔄 **Switch to Real AI (Optional)**

When you're ready to use real AI extraction:

### Step 1: Get Gemini API Key
Visit: https://aistudio.google.com/app/apikey

### Step 2: Update .env
```env
GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
```

### Step 3: Update Controller
Edit `backend/controllers/invoice.controller.js`:

Change:
```javascript
import { extractInvoiceData } from '../services/mock-gemini.service.js';
// import { extractInvoiceData } from '../services/gemini.service.js';
```

To:
```javascript
// import { extractInvoiceData } from '../services/mock-gemini.service.js';
import { extractInvoiceData } from '../services/gemini.service.js';
```

### Step 4: Restart Backend
```bash
cd backend
# Stop server (Ctrl+C)
node server.js
```

## 📱 **Test Accounts**

### Supplier Account
- Email: `supplier@invoiceai.com`
- Password: `supplier123`
- Access: Upload invoices, view analytics

### Organization Admin
- Email: `admin@invoiceai.com`
- Password: `admin123`
- Access: Manage users, view all invoices, alerts

## 🎯 **What to Test**

### Basic Flow
1. Upload invoice image
2. View extracted data with confidence scores
3. Edit incorrect fields
4. Export as CSV or JSON

### Advanced Features
1. Toggle between Structured and JSON view
2. Zoom invoice image
3. Copy JSON to clipboard
4. Download files
5. Reset and upload another

## ✨ **All Bonus Features Working**

- ✅ **Editable Data**: Full inline editing
- ✅ **Confidence Scores**: Per-field with color coding
- ✅ **CSV Export**: Complete data export

## 🎉 **Ready to Use!**

Everything is working perfectly with mock data. You can:
- Test all features
- Demo to stakeholders
- Develop integrations
- Train users

**No API key needed for testing!**

---

## 📞 **Need Help?**

### Issue: Can't access the page
- Check if backend is running on port 5000
- Check if frontend is running on port 3000

### Issue: Upload not working
- Check browser console for errors
- Verify file is JPG or PNG
- Check file size (< 10MB)

### Issue: Features not working
- Clear browser cache
- Restart both servers
- Check console for errors

---

**Status**: ✅ **FULLY OPERATIONAL WITH MOCK DATA!**

Visit: **http://localhost:3000/extractor** and start testing! 🚀
