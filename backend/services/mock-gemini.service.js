/**
 * Mock Gemini Service for Testing
 * Use this when Gemini API key is not available
 */

export const extractInvoiceData = async (fileData, mimeType) => {
  console.log('🧪 Using MOCK Gemini service (for testing)');
  console.log('📄 File type:', mimeType);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return realistic mock invoice data
  return {
    supplier: {
      name: "ABC Textiles Private Limited",
      gstin: "33ABCDE1234F1Z5",
      address: "Plot No. 45, Industrial Area, Tiruppur, Tamil Nadu - 641604",
      phone: "9876543210",
      email: "sales@abctextiles.com"
    },
    invoice: {
      invoice_number: "INV-2024-2451",
      invoice_date: "2024-02-01",
      due_date: "2024-02-16",
      place_of_supply: "Tamil Nadu",
      payment_terms: "Net 15 days"
    },
    bill_to: {
      name: "XYZ Garments Pvt Ltd",
      address: "No. 78, Mount Road, Chennai, Tamil Nadu - 600002",
      gstin: "33XYZAB5678G1H9",
      phone: "9123456789"
    },
    items: [
      {
        name: "Cotton Fabric - Premium Quality",
        description: "100% Pure Cotton, 60s Count",
        hsn: "5208",
        qty: 100,
        uom: "mtr",
        rate: 120,
        amount: 12000,
        tax_rate: 18
      },
      {
        name: "Polyester Fabric",
        description: "High Quality Polyester Blend",
        hsn: "5407",
        qty: 50,
        uom: "mtr",
        rate: 150,
        amount: 7500,
        tax_rate: 18
      },
      {
        name: "Silk Fabric",
        description: "Pure Mulberry Silk",
        hsn: "5007",
        qty: 25,
        uom: "mtr",
        rate: 400,
        amount: 10000,
        tax_rate: 18
      }
    ],
    tax: {
      cgst: 2655,
      sgst: 2655,
      igst: 0
    },
    totals: {
      sub_total: 29500,
      tax_total: 5310,
      discount: 0,
      grand_total: 34810
    },
    bank_details: {
      bank_name: "State Bank of India",
      account_number: "12345678901234",
      ifsc: "SBIN0001234",
      branch: "Tiruppur Main Branch"
    },
    notes: "Payment due within 15 days from invoice date. Please make payment via NEFT/RTGS. Thank you for your business!"
  };
};
