import History from '../models/History.model.js';

/**
 * Anomaly Detection Service
 * Analyzes invoice amounts against historical spending patterns
 */

/**
 * Calculate statistics for a dataset
 */
const calculateStatistics = (amounts) => {
  if (!amounts || amounts.length === 0) {
    return null;
  }

  const sorted = [...amounts].sort((a, b) => a - b);
  const sum = amounts.reduce((acc, val) => acc + val, 0);
  const mean = sum / amounts.length;
  
  // Calculate standard deviation
  const squaredDiffs = amounts.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate median
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
  
  // Calculate quartiles
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;
  
  return {
    count: amounts.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean),
    median: Math.round(median),
    stdDev: Math.round(stdDev),
    q1: Math.round(q1),
    q3: Math.round(q3),
    iqr: Math.round(iqr),
    range: {
      lower: Math.round(mean - stdDev),
      upper: Math.round(mean + stdDev)
    },
    normalRange: {
      lower: Math.round(q1),
      upper: Math.round(q3)
    }
  };
};

/**
 * Normalize supplier name for comparison
 */
const normalizeSupplierName = (name) => {
  if (!name) return '';
  return name.toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
};

/**
 * Check if two supplier names match
 */
const isSameSupplier = (name1, name2) => {
  const normalized1 = normalizeSupplierName(name1);
  const normalized2 = normalizeSupplierName(name2);
  
  if (normalized1 === normalized2) return true;
  
  // Check if one contains the other (for variations like "ABC Ltd" vs "ABC")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }
  
  return false;
};

/**
 * Detect spending anomalies
 * @param {Object} currentInvoice - The invoice being analyzed
 * @param {String} userId - User ID (optional)
 * @param {String} organizationId - Organization ID (optional)
 * @returns {Object} Anomaly detection result
 */
export const detectAnomalies = async (currentInvoice, userId = null, organizationId = null) => {
  try {
    // Extract current invoice details
    const currentSupplier = currentInvoice.supplier?.name || '';
    const currentInvoiceNumber = currentInvoice.invoice?.invoice_number || '';
    const currentDate = currentInvoice.invoice?.invoice_date || '';
    const currentAmount = parseFloat(currentInvoice.totals?.grand_total) || 0;

    console.log('📊 Anomaly Detection - Current Invoice:');
    console.log(`   Supplier: ${currentSupplier}`);
    console.log(`   Invoice #: ${currentInvoiceNumber}`);
    console.log(`   Date: ${currentDate}`);
    console.log(`   Amount: ₹${currentAmount.toLocaleString('en-IN')}`);

    if (!currentSupplier || currentAmount === 0) {
      return {
        status: 'Unable to Analyze',
        risk_level: 'unknown',
        alert_message: 'Insufficient data for analysis',
        reason: 'Missing supplier name or invoice amount',
        statistics: null
      };
    }

    // Build query to fetch existing invoices
    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    } else if (userId) {
      query.userId = userId;
    }

    // Fetch all invoices from database
    const allInvoices = await History.find(query)
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    console.log(`📦 Found ${allInvoices.length} total invoices`);

    // Filter invoices from the same supplier
    const supplierInvoices = allInvoices.filter(inv => {
      const invSupplier = inv.extractedData?.supplier?.name;
      return invSupplier && isSameSupplier(invSupplier, currentSupplier);
    });

    console.log(`🏢 Found ${supplierInvoices.length} invoices from ${currentSupplier}`);

    // If this is the first invoice from this supplier
    if (supplierInvoices.length === 0) {
      return {
        status: 'First Invoice',
        risk_level: 'low',
        alert_message: 'This is the first invoice from this supplier',
        reason: `No historical data available for ${currentSupplier}`,
        current_amount: currentAmount,
        statistics: null
      };
    }

    // Extract amounts from historical invoices
    const historicalAmounts = supplierInvoices
      .map(inv => parseFloat(inv.extractedData?.totals?.grand_total))
      .filter(amount => !isNaN(amount) && amount > 0);

    if (historicalAmounts.length === 0) {
      return {
        status: 'Insufficient Data',
        risk_level: 'low',
        alert_message: 'Not enough historical data for comparison',
        reason: 'Previous invoices have invalid amounts',
        current_amount: currentAmount,
        statistics: null
      };
    }

    // Calculate statistics
    const stats = calculateStatistics(historicalAmounts);
    
    console.log('📈 Historical Statistics:');
    console.log(`   Count: ${stats.count} invoices`);
    console.log(`   Average: ₹${stats.mean.toLocaleString('en-IN')}`);
    console.log(`   Range: ₹${stats.min.toLocaleString('en-IN')} - ₹${stats.max.toLocaleString('en-IN')}`);
    console.log(`   Normal Range: ₹${stats.normalRange.lower.toLocaleString('en-IN')} - ₹${stats.normalRange.upper.toLocaleString('en-IN')}`);

    // Analyze current amount against historical data
    const ratio = currentAmount / stats.mean;
    const deviationFromMean = Math.abs(currentAmount - stats.mean);
    const zScore = stats.stdDev > 0 ? deviationFromMean / stats.stdDev : 0;

    console.log(`🔍 Analysis:`);
    console.log(`   Ratio to average: ${ratio.toFixed(2)}x`);
    console.log(`   Z-Score: ${zScore.toFixed(2)}`);

    // Determine status and risk level
    let status, risk_level, alert_message, reason;

    // Rule 1: Extremely high (>3x average or >3 standard deviations)
    if (ratio > 3 || zScore > 3) {
      status = 'High Risk Expense';
      risk_level = 'critical';
      alert_message = '🚨 CRITICAL: Invoice amount is extremely high!';
      reason = `Amount is ${ratio.toFixed(1)}x higher than average (₹${stats.mean.toLocaleString('en-IN')}). This is ${zScore.toFixed(1)} standard deviations above normal.`;
    }
    // Rule 2: Unusual (2-3x average or 2-3 standard deviations)
    else if (ratio >= 2 || zScore >= 2) {
      status = 'Unusual Expense';
      risk_level = 'high';
      alert_message = '⚠️ WARNING: Invoice amount is unusually high';
      reason = `Amount is ${ratio.toFixed(1)}x higher than average (₹${stats.mean.toLocaleString('en-IN')}). Typical range: ₹${stats.normalRange.lower.toLocaleString('en-IN')} - ₹${stats.normalRange.upper.toLocaleString('en-IN')}.`;
    }
    // Rule 3: Slightly elevated (1.5-2x average)
    else if (ratio >= 1.5 || zScore >= 1.5) {
      status = 'Elevated Expense';
      risk_level = 'medium';
      alert_message = '📊 NOTICE: Invoice amount is higher than usual';
      reason = `Amount is ${ratio.toFixed(1)}x the average (₹${stats.mean.toLocaleString('en-IN')}). Please verify this is expected.`;
    }
    // Rule 4: Unusually low (<0.5x average)
    else if (ratio < 0.5 && currentAmount < stats.normalRange.lower) {
      status = 'Unusually Low';
      risk_level = 'medium';
      alert_message = '📉 NOTICE: Invoice amount is unusually low';
      reason = `Amount is ${ratio.toFixed(1)}x the average (₹${stats.mean.toLocaleString('en-IN')}). This is significantly lower than typical invoices.`;
    }
    // Rule 5: Normal range
    else {
      status = 'Normal Expense';
      risk_level = 'low';
      alert_message = '✅ Invoice amount is within normal range';
      reason = `Amount is consistent with historical spending. Average: ₹${stats.mean.toLocaleString('en-IN')}, Current: ₹${currentAmount.toLocaleString('en-IN')}.`;
    }

    return {
      status,
      risk_level,
      alert_message,
      reason,
      current_amount: currentAmount,
      statistics: {
        supplier: currentSupplier,
        historical_count: stats.count,
        average_amount: stats.mean,
        median_amount: stats.median,
        min_amount: stats.min,
        max_amount: stats.max,
        typical_range: {
          lower: stats.normalRange.lower,
          upper: stats.normalRange.upper
        },
        standard_deviation: stats.stdDev
      },
      analysis: {
        ratio_to_average: parseFloat(ratio.toFixed(2)),
        z_score: parseFloat(zScore.toFixed(2)),
        deviation_amount: Math.round(deviationFromMean),
        percentage_difference: Math.round(((currentAmount - stats.mean) / stats.mean) * 100)
      }
    };

  } catch (error) {
    console.error('❌ Anomaly detection error:', error);
    return {
      status: 'Error',
      risk_level: 'unknown',
      alert_message: 'Failed to analyze invoice amount',
      reason: `Analysis error: ${error.message}`,
      statistics: null
    };
  }
};

/**
 * Get spending trends for a supplier
 */
export const getSupplierSpendingTrends = async (supplierName, userId = null, organizationId = null) => {
  try {
    const query = {};
    if (organizationId) {
      query.organizationId = organizationId;
    } else if (userId) {
      query.userId = userId;
    }

    const allInvoices = await History.find(query)
      .sort({ createdAt: 1 })
      .lean();

    const supplierInvoices = allInvoices.filter(inv => {
      const invSupplier = inv.extractedData?.supplier?.name;
      return invSupplier && isSameSupplier(invSupplier, supplierName);
    });

    const trends = supplierInvoices.map(inv => ({
      date: inv.extractedData?.invoice?.invoice_date || inv.createdAt,
      amount: parseFloat(inv.extractedData?.totals?.grand_total) || 0,
      invoice_number: inv.extractedData?.invoice?.invoice_number
    }));

    return {
      supplier: supplierName,
      total_invoices: trends.length,
      trends
    };
  } catch (error) {
    console.error('❌ Error getting spending trends:', error);
    return null;
  }
};
