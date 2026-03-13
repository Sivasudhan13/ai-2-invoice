import History from '../models/History.model.js';

/**
 * Fraud Detection Service
 * Analyzes invoices for duplicates and suspicious patterns
 */

/**
 * Calculate similarity between two strings (0-1)
 */
const calculateStringSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  // Levenshtein distance for similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Compare dates with tolerance
 */
const areDatesSimilar = (date1, date2, toleranceDays = 3) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= toleranceDays;
};

/**
 * Compare amounts with tolerance
 */
const areAmountsSimilar = (amount1, amount2, tolerancePercent = 1) => {
  if (!amount1 || !amount2) return false;
  
  const a1 = parseFloat(amount1);
  const a2 = parseFloat(amount2);
  
  if (isNaN(a1) || isNaN(a2)) return false;
  
  const diff = Math.abs(a1 - a2);
  const avgAmount = (a1 + a2) / 2;
  const percentDiff = (diff / avgAmount) * 100;
  
  return percentDiff <= tolerancePercent;
};

/**
 * Main fraud detection function
 * @param {Object} currentInvoice - The invoice being checked
 * @param {String} userId - User ID (optional, for user-specific checks)
 * @param {String} organizationId - Organization ID (optional, for org-specific checks)
 * @returns {Object} Fraud detection result
 */
export const detectFraud = async (currentInvoice, userId = null, organizationId = null) => {
  try {
    // Extract current invoice details
    const currentSupplier = currentInvoice.supplier?.name || '';
    const currentInvoiceNumber = currentInvoice.invoice?.invoice_number || '';
    const currentDate = currentInvoice.invoice?.invoice_date || '';
    const currentAmount = currentInvoice.totals?.grand_total || 0;

    console.log('🔍 Fraud Detection - Current Invoice:');
    console.log(`   Supplier: ${currentSupplier}`);
    console.log(`   Invoice #: ${currentInvoiceNumber}`);
    console.log(`   Date: ${currentDate}`);
    console.log(`   Amount: ₹${currentAmount}`);

    // Build query to fetch existing invoices
    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    } else if (userId) {
      query.userId = userId;
    }

    // Fetch existing invoices from database
    const existingInvoices = await History.find(query)
      .sort({ createdAt: -1 })
      .limit(1000) // Limit to recent 1000 invoices for performance
      .lean();

    console.log(`📊 Found ${existingInvoices.length} existing invoices to compare`);

    if (existingInvoices.length === 0) {
      return {
        fraud_status: 'Valid Invoice',
        reason: 'First invoice from this supplier',
        confidence: 100,
        matched_invoice: null,
        risk_level: 'low'
      };
    }

    // Check for duplicates and suspicious patterns
    let exactMatch = null;
    let possibleDuplicates = [];
    let suspiciousMatches = [];

    for (const existing of existingInvoices) {
      const existingData = existing.extractedData;
      if (!existingData) continue;

      const existingSupplier = existingData.supplier?.name || '';
      const existingInvoiceNumber = existingData.invoice?.invoice_number || '';
      const existingDate = existingData.invoice?.invoice_date || '';
      const existingAmount = existingData.totals?.grand_total || 0;

      // Rule 1: Exact duplicate (same supplier AND invoice number)
      if (currentSupplier && existingSupplier && 
          currentSupplier.toLowerCase().trim() === existingSupplier.toLowerCase().trim() &&
          currentInvoiceNumber && existingInvoiceNumber &&
          currentInvoiceNumber.toLowerCase().trim() === existingInvoiceNumber.toLowerCase().trim()) {
        
        exactMatch = {
          supplier: existingSupplier,
          invoice_number: existingInvoiceNumber,
          date: existingDate,
          amount: existingAmount,
          uploaded_at: existing.createdAt
        };
        break;
      }

      // Rule 2: Possible duplicate (same supplier, date, amount but different invoice number)
      const supplierSimilarity = calculateStringSimilarity(currentSupplier, existingSupplier);
      const invoiceNumberSimilarity = calculateStringSimilarity(currentInvoiceNumber, existingInvoiceNumber);
      
      if (supplierSimilarity > 0.85 && // Supplier name is very similar
          areDatesSimilar(currentDate, existingDate, 3) && // Date within 3 days
          areAmountsSimilar(currentAmount, existingAmount, 1) && // Amount within 1%
          invoiceNumberSimilarity > 0.5 && invoiceNumberSimilarity < 1) { // Invoice number similar but not exact
        
        possibleDuplicates.push({
          supplier: existingSupplier,
          invoice_number: existingInvoiceNumber,
          date: existingDate,
          amount: existingAmount,
          uploaded_at: existing.createdAt,
          similarity_score: Math.round((supplierSimilarity + invoiceNumberSimilarity) * 50)
        });
      }

      // Rule 3: Suspicious pattern (same supplier and amount, different invoice number)
      if (supplierSimilarity > 0.9 &&
          areAmountsSimilar(currentAmount, existingAmount, 0.5) &&
          invoiceNumberSimilarity < 0.5) {
        
        suspiciousMatches.push({
          supplier: existingSupplier,
          invoice_number: existingInvoiceNumber,
          date: existingDate,
          amount: existingAmount,
          uploaded_at: existing.createdAt,
          reason: 'Same supplier and amount with different invoice number'
        });
      }
    }

    // Return results based on findings
    if (exactMatch) {
      return {
        fraud_status: 'Duplicate Invoice',
        reason: `Exact match found: Invoice ${exactMatch.invoice_number} from ${exactMatch.supplier} already exists`,
        confidence: 100,
        matched_invoice: exactMatch,
        risk_level: 'critical',
        action_required: 'Reject this invoice - it has already been processed'
      };
    }

    if (possibleDuplicates.length > 0) {
      const topMatch = possibleDuplicates[0];
      return {
        fraud_status: 'Possible Duplicate',
        reason: `Similar invoice found: ${topMatch.invoice_number} from ${topMatch.supplier} with matching date and amount`,
        confidence: topMatch.similarity_score,
        matched_invoice: topMatch,
        all_matches: possibleDuplicates.slice(0, 3), // Top 3 matches
        risk_level: 'high',
        action_required: 'Review carefully - this may be a duplicate with modified invoice number'
      };
    }

    if (suspiciousMatches.length > 0) {
      const topMatch = suspiciousMatches[0];
      return {
        fraud_status: 'Suspicious Pattern',
        reason: `Found ${suspiciousMatches.length} invoice(s) from ${topMatch.supplier} with same amount but different invoice numbers`,
        confidence: 75,
        matched_invoice: topMatch,
        all_matches: suspiciousMatches.slice(0, 3),
        risk_level: 'medium',
        action_required: 'Verify with supplier - multiple invoices with same amount detected'
      };
    }

    // No issues found
    return {
      fraud_status: 'Valid Invoice',
      reason: 'No duplicates or suspicious patterns detected',
      confidence: 100,
      matched_invoice: null,
      risk_level: 'low',
      action_required: 'None - invoice can be processed'
    };

  } catch (error) {
    console.error('❌ Fraud detection error:', error);
    return {
      fraud_status: 'Error',
      reason: `Fraud detection failed: ${error.message}`,
      confidence: 0,
      matched_invoice: null,
      risk_level: 'unknown'
    };
  }
};

/**
 * Get fraud statistics for a user or organization
 */
export const getFraudStatistics = async (userId = null, organizationId = null) => {
  try {
    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    } else if (userId) {
      query.userId = userId;
    }

    const invoices = await History.find(query).lean();
    
    // Analyze for patterns
    const supplierCounts = {};
    const invoiceNumbers = new Set();
    let duplicateCount = 0;

    invoices.forEach(inv => {
      const supplier = inv.extractedData?.supplier?.name;
      const invoiceNum = inv.extractedData?.invoice?.invoice_number;
      
      if (supplier) {
        supplierCounts[supplier] = (supplierCounts[supplier] || 0) + 1;
      }
      
      if (invoiceNum) {
        if (invoiceNumbers.has(invoiceNum)) {
          duplicateCount++;
        }
        invoiceNumbers.add(invoiceNum);
      }
    });

    return {
      total_invoices: invoices.length,
      unique_suppliers: Object.keys(supplierCounts).length,
      duplicate_invoice_numbers: duplicateCount,
      top_suppliers: Object.entries(supplierCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    };
  } catch (error) {
    console.error('❌ Error getting fraud statistics:', error);
    return null;
  }
};
