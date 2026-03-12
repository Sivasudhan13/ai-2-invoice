import Alert from '../models/Alert.model.js';

const DATA_QUALITY_THRESHOLD = 70;

/**
 * Check data quality and generate alerts for low-confidence fields
 * @param {Object} confidenceScores - Confidence scores object from invoice extraction
 * @param {ObjectId} invoiceId - Reference to the History (invoice) record
 * @param {ObjectId} organizationId - Reference to the organization
 * @returns {Object|null} - Alert data if created, null if all scores are above threshold
 */
export const checkDataQuality = async (confidenceScores, invoiceId, organizationId) => {
  try {
    // Find all fields with confidence scores below threshold
    const affectedFields = [];
    const lowConfidenceScores = {};

    const checkField = (fieldName, score) => {
      if (score !== null && score !== undefined && score < DATA_QUALITY_THRESHOLD) {
        affectedFields.push(fieldName);
        lowConfidenceScores[fieldName] = score;
      }
    };

    // Check top-level fields
    if (confidenceScores.invoice_number !== undefined) {
      checkField('invoice_number', confidenceScores.invoice_number);
    }
    if (confidenceScores.invoice_date !== undefined) {
      checkField('invoice_date', confidenceScores.invoice_date);
    }
    if (confidenceScores.due_date !== undefined) {
      checkField('due_date', confidenceScores.due_date);
    }
    if (confidenceScores.grand_total !== undefined) {
      checkField('grand_total', confidenceScores.grand_total);
    }
    if (confidenceScores.subtotal !== undefined) {
      checkField('subtotal', confidenceScores.subtotal);
    }
    if (confidenceScores.total_tax !== undefined) {
      checkField('total_tax', confidenceScores.total_tax);
    }
    if (confidenceScores.currency !== undefined) {
      checkField('currency', confidenceScores.currency);
    }
    if (confidenceScores.payment_terms !== undefined) {
      checkField('payment_terms', confidenceScores.payment_terms);
    }

    // Check supplier fields
    if (confidenceScores.supplier) {
      if (confidenceScores.supplier.name !== undefined) {
        checkField('supplier.name', confidenceScores.supplier.name);
      }
      if (confidenceScores.supplier.address !== undefined) {
        checkField('supplier.address', confidenceScores.supplier.address);
      }
      if (confidenceScores.supplier.phone !== undefined) {
        checkField('supplier.phone', confidenceScores.supplier.phone);
      }
      if (confidenceScores.supplier.email !== undefined) {
        checkField('supplier.email', confidenceScores.supplier.email);
      }
      if (confidenceScores.supplier.gstin !== undefined) {
        checkField('supplier.gstin', confidenceScores.supplier.gstin);
      }
    }

    // Check bill_to fields
    if (confidenceScores.bill_to) {
      if (confidenceScores.bill_to.name !== undefined) {
        checkField('bill_to.name', confidenceScores.bill_to.name);
      }
      if (confidenceScores.bill_to.address !== undefined) {
        checkField('bill_to.address', confidenceScores.bill_to.address);
      }
      if (confidenceScores.bill_to.gstin !== undefined) {
        checkField('bill_to.gstin', confidenceScores.bill_to.gstin);
      }
    }

    // Check line items
    if (confidenceScores.line_items !== undefined) {
      checkField('line_items', confidenceScores.line_items);
    }

    // Check tax details
    if (confidenceScores.tax_details !== undefined) {
      checkField('tax_details', confidenceScores.tax_details);
    }

    // Check bank details
    if (confidenceScores.bank_details) {
      if (confidenceScores.bank_details.bank_name !== undefined) {
        checkField('bank_details.bank_name', confidenceScores.bank_details.bank_name);
      }
      if (confidenceScores.bank_details.account_number !== undefined) {
        checkField('bank_details.account_number', confidenceScores.bank_details.account_number);
      }
      if (confidenceScores.bank_details.ifsc !== undefined) {
        checkField('bank_details.ifsc', confidenceScores.bank_details.ifsc);
      }
    }

    // If no low-confidence fields found, return null
    if (affectedFields.length === 0) {
      return null;
    }

    // Create alert record
    const alert = await Alert.create({
      invoiceId,
      organizationId,
      affectedFields,
      confidenceScores: lowConfidenceScores,
      status: 'unreviewed'
    });

    console.log(`⚠️  Alert created for invoice ${invoiceId} with ${affectedFields.length} low-confidence fields`);

    return {
      _id: alert._id,
      invoiceId: alert.invoiceId,
      organizationId: alert.organizationId,
      affectedFields: alert.affectedFields,
      confidenceScores: alert.confidenceScores,
      status: alert.status,
      createdAt: alert.createdAt
    };

  } catch (error) {
    console.error('Error checking data quality:', error);
    throw new Error(`Failed to check data quality: ${error.message}`);
  }
};
