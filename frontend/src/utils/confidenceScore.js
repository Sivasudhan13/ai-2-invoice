// Generate confidence scores for extracted data
export const generateConfidenceScores = (data) => {
  const confidence = {
    invoice_number: calculateFieldConfidence(data.invoice_number, 'string', true),
    invoice_date: calculateFieldConfidence(data.invoice_date, 'date'),
    due_date: calculateFieldConfidence(data.due_date, 'date'),
    payment_terms: calculateFieldConfidence(data.payment_terms, 'string'),
    grand_total: calculateFieldConfidence(data.grand_total, 'number', true),
    supplier: {},
    bill_to: {},
    line_items: 'High'
  };

  if (data.supplier) {
    confidence.supplier = {
      name: calculateFieldConfidence(data.supplier.name, 'string', true),
      address: calculateFieldConfidence(data.supplier.address, 'string', true),
      phone: calculateFieldConfidence(data.supplier.phone, 'phone'),
      email: calculateFieldConfidence(data.supplier.email, 'email'),
      gstin: calculateFieldConfidence(data.supplier.gstin, 'gstin')
    };
  }

  if (data.bill_to) {
    confidence.bill_to = {
      name: calculateFieldConfidence(data.bill_to.name, 'string', true),
      address: calculateFieldConfidence(data.bill_to.address, 'string'),
      gstin: calculateFieldConfidence(data.bill_to.gstin, 'gstin')
    };
  }

  return confidence;
};

const calculateFieldConfidence = (value, type, required = false) => {
  if (!value && required) return 'Low';
  if (!value) return 'Medium';

  switch (type) {
    case 'string':
      return value.length > 3 ? 'High' : 'Medium';
    
    case 'number':
      return value > 0 ? 'High' : 'Low';
    
    case 'date':
      const datePattern = /\d{1,2}[\s\-\/]\w+[\s\-\/]\d{2,4}/;
      return datePattern.test(value) ? 'High' : 'Medium';
    
    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(value) ? 'High' : 'Medium';
    
    case 'phone':
      const phonePattern = /[\d\s\-\+\(\)]{10,}/;
      return phonePattern.test(value) ? 'High' : 'Medium';
    
    case 'gstin':
      return value.length === 15 ? 'High' : 'Medium';
    
    default:
      return 'Medium';
  }
};

export const getConfidenceColor = (confidence) => {
  switch (confidence) {
    case 'High':
      return '#34d399';
    case 'Medium':
      return '#fbbf24';
    case 'Low':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

export const getConfidenceIcon = (confidence) => {
  switch (confidence) {
    case 'High':
      return '✓';
    case 'Medium':
      return '⚠';
    case 'Low':
      return '✗';
    default:
      return '?';
  }
};
