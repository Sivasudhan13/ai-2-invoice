// Validate extracted invoice data
export const validateInvoiceData = (data) => {
  const errors = [];
  const warnings = [];
  let score = 100;

  // Required fields validation
  if (!data.invoice_number) {
    errors.push('Missing invoice number');
    score -= 15;
  }

  if (!data.grand_total || data.grand_total <= 0) {
    errors.push('Invalid or missing grand total');
    score -= 20;
  }

  if (!data.invoice_date) {
    warnings.push('Missing invoice date');
    score -= 5;
  }

  // Supplier validation
  if (!data.supplier || !data.supplier.name) {
    errors.push('Missing supplier information');
    score -= 15;
  }

  // Line items validation
  if (!data.line_items || data.line_items.length === 0) {
    warnings.push('No line items found');
    score -= 10;
  } else {
    data.line_items.forEach((item, index) => {
      if (!item.description) {
        warnings.push(`Line item ${index + 1}: Missing description`);
        score -= 2;
      }
      if (!item.amount || item.amount <= 0) {
        warnings.push(`Line item ${index + 1}: Invalid amount`);
        score -= 3;
      }
    });
  }

  // Tax validation
  if (data.subtotal && data.grand_total) {
    const calculatedTotal = data.subtotal + (data.total_tax || 0) - (data.discount_total || 0);
    const difference = Math.abs(calculatedTotal - data.grand_total);
    
    if (difference > 1) {
      warnings.push(`Total calculation mismatch: ${difference.toFixed(2)}`);
      score -= 5;
    }
  }

  // JSON structure validation
  const hasConsistentKeys = validateJSONStructure(data);
  if (!hasConsistentKeys) {
    warnings.push('Inconsistent JSON structure detected');
    score -= 5;
  }

  return {
    isValid: errors.length === 0,
    score: Math.max(0, Math.min(100, score)),
    errors,
    warnings,
    grade: getGrade(Math.max(0, score))
  };
};

const validateJSONStructure = (data) => {
  const requiredKeys = ['invoice_number', 'invoice_date', 'grand_total'];
  const hasRequired = requiredKeys.every(key => key in data);
  
  // Check line items structure consistency
  if (data.line_items && data.line_items.length > 0) {
    const firstItemKeys = Object.keys(data.line_items[0]);
    const allConsistent = data.line_items.every(item => {
      const itemKeys = Object.keys(item);
      return firstItemKeys.length === itemKeys.length &&
             firstItemKeys.every(key => key in item);
    });
    return hasRequired && allConsistent;
  }
  
  return hasRequired;
};

const getGrade = (score) => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  return 'D';
};

export const getGradeColor = (grade) => {
  if (grade.startsWith('A')) return '#34d399';
  if (grade.startsWith('B')) return '#fbbf24';
  if (grade.startsWith('C')) return '#fb923c';
  return '#ef4444';
};

// File validation
export const validateFile = (file) => {
  const errors = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  if (file.size > maxSize) {
    errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max 10MB)`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Only PDF, JPG, and PNG are allowed.`);
  }

  if (file.size < 1024) {
    errors.push('File too small, might be corrupted');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
