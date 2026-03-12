# 🤖 AI Invoice Extractor - Complete Guide

## 📋 Overview

A complete AI-powered invoice data extraction system that uploads invoices (PDF/JPG/PNG), extracts structured data using Google Gemini Flash AI, and displays both the original invoice and extracted data side-by-side.

## 🎯 Features Implemented

### 1. **Upload & Extract**
- ✅ Upload PDF, JPG, or PNG invoices
- ✅ AI-powered extraction using Gemini Flash
- ✅ Real-time processing with loading states
- ✅ Error handling and validation

### 2. **Dual View Display**
- ✅ **Original Invoice**: Shows uploaded image with zoom functionality
- ✅ **Structured Data**: Beautiful UI cards displaying extracted information
- ✅ **Raw JSON**: Formatted JSON view for developers

### 3. **Data Export**
- ✅ Copy JSON to clipboard (one-click)
- ✅ Download JSON file
- ✅ Formatted and ready to use

### 4. **UI Features**
- ✅ Split-screen layout (invoice on left, data on right)
- ✅ Sticky invoice preview while scrolling
- ✅ Zoom in/out on invoice image
- ✅ Tab switching between Structured and JSON views
- ✅ Modern dark theme with animations
- ✅ Responsive design

## 📊 JSON Output Structure

```json
{
  "supplier": {
    "name": "ABC Textiles",
    "gstin": "33ABCDE1234F1Z5",
    "address": "Tiruppur, TN",
    "phone": "9XXXXXXXXX",
    "email": "contact@abctextiles.com"
  },
  "invoice": {
    "invoice_number": "INV-2451",
    "invoice_date": "2026-02-01",
    "due_date": "2026-02-16",
    "place_of_supply": "Tamil Nadu",
    "payment_terms": "15 days"
  },
  "bill_to": {
    "name": "XYZ Garments",
    "address": "Chennai, TN",
    "gstin": "33XYZAB5678G1H9",
    "phone": "9XXXXXXXXX"
  },
  "items": [
    {
      "name": "Cotton Fabric",
      "description": "Premium quality cotton",
      "hsn": "5208",
      "qty": 100,
      "uom": "mtr",
      "rate": 120,
      "amount": 12000,
      "tax_rate": 18
    }
  ],
  "tax": {
    "cgst": 1080,
    "sgst": 1080,
    "igst": 0
  },
  "totals": {
    "sub_total": 12000,
    "tax_total": 2160,
    "discount": 0,
    "grand_total": 14160
  },
  "bank_details": {
    "bank_name": "State Bank of India",
    "account_number": "1234567890",
    "ifsc": "SBIN0001234",
    "branch": "Tiruppur Main"
  },
  "notes": "Payment due within 15 days"
}
```

## 🚀 Access Points

### Main Routes
1. **Invoice Extractor**: `http://localhost:3000/extractor` (Landing page)
2. **Supplier Dashboard**: `http://localhost:3000/supplier/dashboard`
3. **Organization Dashboard**: `http://localhost:3000/organization/dashboard`

## 📝 Test Accounts

### Supplier Account
- **Email**: `supplier@invoiceai.com`
- **Password**: `supplier123`
- **Features**: Upload invoices, view analytics, charts

### Organization Admin
- **Email**: `admin@invoiceai.com`
- **Password**: `admin123`
- **Features**: Manage users, view all invoices, alerts, analytics

## 🎨 UI Components

### 1. **Upload Section**
- Drag-and-drop style interface
- File preview before extraction
- Supports multiple formats (PDF, JPG, PNG)

### 2. **Split View Layout**
```
┌─────────────────────────────────────────────┐
│  Original Invoice  │  Extracted Data        │
│  (with zoom)       │  (Structured/JSON)     │
│                    │                        │
│  [Invoice Image]   │  📦 Supplier Info      │
│                    │  📄 Invoice Details    │
│  [File Info]       │  📋 Line Items         │
│                    │  💰 Tax & Totals       │
│                    │  🏦 Bank Details       │
└─────────────────────────────────────────────┘
```

### 3. **Data Cards**
- **Supplier Information**: Name, GSTIN, Address, Phone, Email
- **Invoice Details**: Number, Date, Due Date, Place of Supply, Terms
- **Bill To**: Customer information
- **Line Items**: Table with HSN, Qty, UOM, Rate, Amount
- **Tax Details**: CGST, SGST, IGST breakdown
- **Totals**: Sub-total, Tax Total, Grand Total (highlighted)
- **Bank Details**: Account information
- **Notes**: Additional terms and conditions

## 🔧 Technical Implementation

### Backend
- **AI Model**: Google Gemini 1.5 Flash
- **Endpoint**: `/api/invoice/extract`
- **Method**: POST with multipart/form-data
- **Authentication**: Optional (works for guests and authenticated users)

### Frontend
- **Framework**: React with inline styles
- **State Management**: React hooks (useState, useEffect)
- **File Handling**: FileReader API for preview
- **Clipboard**: Navigator Clipboard API
- **Download**: Blob API for JSON download

### Data Flow
```
1. User uploads invoice (PDF/JPG/PNG)
2. Frontend creates preview (for images)
3. File sent to backend via FormData
4. Backend processes with Gemini AI
5. AI extracts structured JSON
6. Backend calculates confidence scores
7. Data saved to database (if authenticated)
8. JSON returned to frontend
9. Frontend displays in split view
10. User can copy/download JSON
```

## 📱 Responsive Features

- **Desktop**: Full split-screen layout
- **Tablet**: Stacked layout with sticky invoice
- **Mobile**: Single column, scrollable

## 🎯 Use Cases

1. **Accounting Teams**: Quick invoice data entry
2. **Suppliers**: Upload and track invoices
3. **Organizations**: Bulk invoice processing
4. **Developers**: API integration testing
5. **Data Entry**: Automated extraction

## 🔐 Security Features

- File type validation
- Size limits enforced
- Secure file storage
- JWT authentication (optional)
- CORS protection

## 📊 Analytics Integration

- Confidence scores for data quality
- Processing time tracking
- Invoice history
- Monthly trends
- Tax analysis

## 🚀 Getting Started

### 1. Start Backend
```bash
cd backend
npm install
node server.js
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Access Application
Open `http://localhost:3000/extractor`

### 4. Upload Invoice
- Click upload area or drag file
- Wait for AI extraction
- View results in split view
- Copy or download JSON

## 💡 Tips

1. **Best Results**: Use clear, high-resolution invoice images
2. **Zoom Feature**: Click zoom button to inspect invoice details
3. **JSON View**: Switch to JSON tab to see raw data
4. **Copy/Download**: Use buttons to export data
5. **New Upload**: Click reset to process another invoice

## 🎨 Customization

### Colors
- Primary: `#6c63ff` (Purple)
- Success: `#34d399` (Green)
- Warning: `#fbbf24` (Yellow)
- Error: `#ef4444` (Red)
- Background: `#0f0f23` (Dark Blue)

### Fonts
- Headers: System font, 800 weight
- Body: System font, 600 weight
- Code: Monospace

## 📈 Future Enhancements

- [ ] Batch upload (multiple invoices)
- [ ] Excel export
- [ ] Email integration
- [ ] Template customization
- [ ] Multi-language support
- [ ] OCR fallback for poor quality images
- [ ] Invoice validation rules
- [ ] Duplicate detection

## 🐛 Troubleshooting

### Issue: AI extraction fails
- **Solution**: Check Gemini API key in `.env`
- **Solution**: Verify image quality and format

### Issue: Preview not showing
- **Solution**: Ensure file is an image (not PDF)
- **Solution**: Check file size limits

### Issue: JSON not copying
- **Solution**: Check browser clipboard permissions
- **Solution**: Use download instead

## 📞 Support

For issues or questions:
1. Check console for errors
2. Verify API keys are set
3. Test with sample invoice
4. Check network requests

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
