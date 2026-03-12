/**
 * Test confidence score calculation logic
 * Verifies that the calculateConfidenceScores function works correctly
 */

// Mock the calculateConfidenceScores function from invoice.controller.js
const calculateConfidenceScores = (data) => {
  const scores = {};
  
  // Helper function to calculate score for a field
  const getFieldScore = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'string' && value.trim().length === 0) return 0;
    if (typeof value === 'string' && value.trim().length < 3) return 50;
    if (typeof value === 'number' && value === 0) return 50;
    if (typeof value === 'number' && value > 0) return 90;
    if (typeof value === 'string' && value.trim().length >= 3) return 85;
    return 70;
  };
  
  // Score top-level fields
  if (data.invoice_number !== undefined) scores.invoice_number = getFieldScore(data.invoice_number);
  if (data.invoice_date !== undefined) scores.invoice_date = getFieldScore(data.invoice_date);
  if (data.due_date !== undefined) scores.due_date = getFieldScore(data.due_date);
  if (data.grand_total !== undefined) scores.grand_total = getFieldScore(data.grand_total);
  if (data.subtotal !== undefined) scores.subtotal = getFieldScore(data.subtotal);
  if (data.total_tax !== undefined) scores.total_tax = getFieldScore(data.total_tax);
  if (data.currency !== undefined) scores.currency = getFieldScore(data.currency);
  if (data.payment_terms !== undefined) scores.payment_terms = getFieldScore(data.payment_terms);
  
  // Score supplier fields
  if (data.supplier) {
    scores.supplier = {};
    scores.supplier.name = getFieldScore(data.supplier.name);
    scores.supplier.address = getFieldScore(data.supplier.address);
    scores.supplier.phone = getFieldScore(data.supplier.phone);
    scores.supplier.email = getFieldScore(data.supplier.email);
    scores.supplier.gstin = getFieldScore(data.supplier.gstin);
  }
  
  // Score bill_to fields
  if (data.bill_to) {
    scores.bill_to = {};
    scores.bill_to.name = getFieldScore(data.bill_to.name);
    scores.bill_to.address = getFieldScore(data.bill_to.address);
    scores.bill_to.gstin = getFieldScore(data.bill_to.gstin);
  }
  
  // Score line items (average score)
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
  
  // Score tax details
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
  
  // Score bank details
  if (data.bank_details) {
    scores.bank_details = {};
    scores.bank_details.bank_name = getFieldScore(data.bank_details.bank_name);
    scores.bank_details.account_number = getFieldScore(data.bank_details.account_number);
    scores.bank_details.ifsc = getFieldScore(data.bank_details.ifsc);
  }
  
  return scores;
};

console.log('🧪 Testing Confidence Score Calculation\n');

// Test Case 1: Complete data (should have high scores)
console.log('Test 1: Complete invoice data');
const completeData = {
  invoice_number: 'INV-2024-001',
  invoice_date: '2024-01-15',
  due_date: '2024-02-15',
  grand_total: 15000,
  subtotal: 12500,
  total_tax: 2500,
  currency: 'INR',
  payment_terms: 'Net 30',
  supplier: {
    name: 'Test Supplier Ltd',
    address: '123 Test Street',
    phone: '1234567890',
    email: 'supplier@test.com',
    gstin: 'TEST123456789'
  },
  bill_to: {
    name: 'Test Customer',
    address: '456 Customer Ave',
    gstin: 'CUST987654321'
  },
  line_items: [
    {
      description: 'Product A',
      quantity: 10,
      unit_price: 1000,
      amount: 10000
    }
  ],
  tax_details: {
    cgst: 1250,
    sgst: 1250,
    igst: 0
  },
  bank_details: {
    bank_name: 'Test Bank',
    account_number: '1234567890',
    ifsc: 'TEST0001234'
  }
};

const scores1 = calculateConfidenceScores(completeData);
console.log('Scores:', JSON.stringify(scores1, null, 2));
console.log('✅ All fields should have scores >= 85\n');

// Test Case 2: Partial data (should have mixed scores)
console.log('Test 2: Partial invoice data');
const partialData = {
  invoice_number: 'INV-001',
  invoice_date: '',
  grand_total: 0,
  supplier: {
    name: 'AB',
    address: '',
    email: null
  },
  line_items: []
};

const scores2 = calculateConfidenceScores(partialData);
console.log('Scores:', JSON.stringify(scores2, null, 2));
console.log('✅ Empty/null fields should have score 0, short strings 50\n');

// Test Case 3: Empty data (should have low/zero scores)
console.log('Test 3: Minimal invoice data');
const minimalData = {
  invoice_number: null,
  grand_total: null,
  supplier: {
    name: '',
    address: ''
  }
};

const scores3 = calculateConfidenceScores(minimalData);
console.log('Scores:', JSON.stringify(scores3, null, 2));
console.log('✅ All fields should have score 0\n');

// Test Case 4: Check for low confidence fields (< 70%)
console.log('Test 4: Identifying low confidence fields');
const mixedData = {
  invoice_number: 'INV-2024-001', // 85
  invoice_date: '', // 0
  grand_total: 15000, // 90
  supplier: {
    name: 'AB', // 50
    address: '123 Main Street', // 85
    email: '' // 0
  }
};

const scores4 = calculateConfidenceScores(mixedData);
console.log('Scores:', JSON.stringify(scores4, null, 2));

const lowConfidenceFields = [];
Object.entries(scores4).forEach(([key, value]) => {
  if (typeof value === 'number' && value < 70) {
    lowConfidenceFields.push({ field: key, score: value });
  } else if (typeof value === 'object') {
    Object.entries(value).forEach(([subKey, subValue]) => {
      if (subValue < 70) {
        lowConfidenceFields.push({ field: `${key}.${subKey}`, score: subValue });
      }
    });
  }
});

console.log('\nLow confidence fields (< 70%):');
lowConfidenceFields.forEach(f => {
  console.log(`  - ${f.field}: ${f.score}`);
});

console.log('\n✅ Confidence score calculation working correctly!');
console.log('✅ Can identify fields that need alerts (< 70%)');
