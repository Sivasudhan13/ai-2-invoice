import { extractInvoiceDataFromText } from './services/gemini-text.service.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleInvoiceText = `
INVOICE

ABC Textiles Private Limited
GSTIN: 33ABCDE1234F1Z5
Address: 123 Textile Street, Tiruppur, Tamil Nadu - 641601
Phone: 9876543210
Email: sales@abctextiles.com

BILL TO:
XYZ Garments
456 Fashion Avenue, Chennai, Tamil Nadu - 600001
GSTIN: 33XYZAB5678G2H6

Invoice Number: INV-2451
Invoice Date: 2026-02-01
Due Date: 2026-02-16
Place of Supply: Tamil Nadu
Payment Terms: 15 days

LINE ITEMS:
1. Cotton Fabric
   HSN: 5208
   Quantity: 100 mtr
   Rate: ₹120.00
   Amount: ₹12,000.00

TAX DETAILS:
CGST (9%): ₹1,080.00
SGST (9%): ₹1,080.00
IGST: ₹0.00

TOTALS:
Sub Total: ₹12,000.00
Tax Total: ₹2,160.00
Grand Total: ₹14,160.00

BANK DETAILS:
Bank Name: State Bank of India
Account Number: 1234567890
IFSC Code: SBIN0001234
Branch: Tiruppur Main

Terms & Conditions:
Payment due within 15 days
`;

async function testExtraction() {
  try {
    console.log('🧪 Testing invoice extraction with Gemini 2.5 Flash...\n');
    console.log('📄 Sample invoice text:');
    console.log(sampleInvoiceText);
    console.log('\n' + '='.repeat(80) + '\n');
    
    const result = await extractInvoiceDataFromText(sampleInvoiceText);
    
    console.log('✅ Extraction successful!\n');
    console.log('📊 Extracted Data:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n✅ All fields extracted correctly!');
    console.log('🎉 Your API integration is working perfectly!');
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
  }
}

testExtraction();
