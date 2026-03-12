/**
 * Manual test for confidence score calculation
 * Run with: node backend/test-confidence-scores.js
 */

// Simulate the calculateConfidenceScores function
const calculateConfidenceScores = (data) => {
  const scores = {};
  
  const getFieldScore = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'string' && value.trim().length === 0) return 0;
    if (typeof value === 'string' && value.trim().length < 3) return 50;
    if (typeof value === 'number' && value === 0) return 50;
    if (typeof value === 'number' && value > 0) return 90;
    if (typeof value === 'string' && value.trim().length >= 3) return 85;
    return 70;
  };
  
  if (data.invoice_number !== undefined) scores.invoice_number = getFieldScore(data.invoice_number);
  if (data.invoice_date !== undefined) scores.invoice_date = getFieldScore(data.invoice_date);
  if (data.due_date !== undefined) scores.due_date = getFieldScore(data.due_date);
  if (data.grand_total !== undefined) scores.grand_total = getFieldScore(data.grand_total);
  if (data.subtotal !== undefined) scores.subtotal = getFieldScore(data.subtotal);
  if (data.total_tax !== undefined) scores.total_tax = getFieldScore(data.total_tax);
  if (data.currency !== undefined) scores.currency = getFieldScore(data.currency);
  if (data.payment_terms !== undefined) scores.payment_terms = getFieldScore(data.payment_terms);
  
  if (data.supplier) {
    scores.supplier = {};
    scores.supplier.name = getFieldScore(data.supplier.name);
    scores.supplier.address = getFieldScore(data.supplier.address);
    scores.supplier.phone = getFieldScore(data.supplier.phone);
    scores.supplier.email = getFieldScore(data.supplier.email);
    scores.supplier.gstin = getFieldScore(data.supplier.gstin);
  }
  
  if (data.bill_to) {
    scores.bill_to = {};
    scores.bill_to.name = getFieldScore(data.bill_to.name);
    scores.bill_to.address = getFieldScore(data.bill_to.address);
    scores.bill_to.gstin = getFieldScore(data.bill_to.gstin);
  }
  
  if (data.line_items && Array.isArray(data.line_items) && data.line_items.length > 0) {
    const itemScores = data.line_items.map(item => {
      const itemScore = (
        getFieldScore(item.description) +
        getFieldScore(item.quantity) +
        getFieldScore(item.unit_price) +
        getFieldScore(item.amount)
      ) / 4;
      return itemScore;
    });
    scores.line_items = Math.round(itemScores.reduce((a, b) => a + b, 0) / itemScores.length);
  } else {
    scores.line_items = 0;
  }
  
  if (data.tax_details) {
    const taxScores = [
      getFieldScore(data.tax_details.cgst),
      getFieldScore(data.tax_details.sgst),
      getFieldScore(data.tax_details.igst)
    ].filter(s => s > 0);
    scores.tax_details = taxScores.length > 0 
      ? Math.round(taxScores.reduce((a, b) => a + b, 0) / taxScores.length)
      : 50;
  }
  
  if (data.bank_details) {
    scores.bank_details = {};
    scores.bank_details.bank_name = getFieldScore(data.bank_details.bank_name);
    scores.bank_details.account_number = getFieldScore(data.bank_details.account_number);
    scores.bank_details.ifsc = getFieldScore(data.bank_details.ifsc);
  }
  
  return scores;
};

// Test cases
console.log('Testing confidence score calculation...\n');

// Test 1: Complete invoice data
const completeInvoice = {
  invoice_number: 'INV-2024-001',
  invoice_date: '15 January 2024',
  due_date: '15 February 2024',
  grand_total: 15000,
  subtotal: 12500,
  total_tax: 2500,
  currency: '₹',
  payment_terms: 'Net 30',
  supplier: {
    name: 'ABC Corp',
    address: '123 Main St, City',
    phone: '+91-1234567890',
    email: 'contact@abc.com',
    gstin: '29ABCDE1234F1Z5'
  },
  bill_to: {
    name: 'XYZ Ltd',
    address: '456 Park Ave',
    gstin: '27XYZAB5678G2W4'
  },
  line_items: [
    { description: 'Product A', quantity: 10, unit_price: 1000, amount: 10000 },
    { description: 'Product B', quantity: 5, unit_price: 500, amount: 2500 }
  ],
  tax_details: {
    cgst: 1250,
    sgst: 1250,
    igst: 0
  },
  bank_details: {
    bank_name: 'State Bank',
    account_number: '1234567890',
    ifsc: 'SBIN0001234'
  }
};

console.log('Test 1: Complete invoice data');
const scores1 = calculateConfidenceScores(completeInvoice);
console.log(JSON.stringify(scores1, null, 2));
console.log('\n---\n');

// Test 2: Partial invoice data (missing some fields)
const partialInvoice = {
  invoice_number: 'INV-002',
  invoice_date: null,
  grand_total: 5000,
  supplier: {
    name: 'Supplier Name',
    address: '',
    phone: null,
    email: 'test@example.com'
  },
  line_items: []
};

console.log('Test 2: Partial invoice data');
const scores2 = calculateConfidenceScores(partialInvoice);
console.log(JSON.stringify(scores2, null, 2));
console.log('\n---\n');

// Test 3: Empty/null values
const emptyInvoice = {
  invoice_number: '',
  invoice_date: null,
  grand_total: 0,
  supplier: {
    name: null,
    address: ''
  }
};

console.log('Test 3: Empty/null values');
const scores3 = calculateConfidenceScores(emptyInvoice);
console.log(JSON.stringify(scores3, null, 2));
console.log('\n---\n');

console.log('✅ All tests completed!');
console.log('\nExpected behavior:');
console.log('- Complete fields should score 85-90');
console.log('- Partial/short fields should score 50');
console.log('- Empty/null fields should score 0');
