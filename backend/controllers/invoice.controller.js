import { processFile } from '../services/file.service.js';
import History from '../models/History.model.js';
import fs from 'fs/promises';

// OCR + Gemini approach (works with text instead of images)
import { extractTextFromImage } from '../services/ocr.service.js';
import { extractInvoiceDataFromText } from '../services/gemini-text.service.js';

// Fraud detection
import { detectFraud } from '../services/fraud-detection.service.js';

// Anomaly detection
import { detectAnomalies } from '../services/anomaly-detection.service.js';

/**
 * Calculate confidence scores for extracted invoice fields
 * Uses heuristics: empty/null = 0, partial data = 50, complete data = 80-100
 * @param {Object} data - Extracted invoice data
 * @returns {Object} - Confidence scores for each field
 */
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
  
  // Score supplier fields
  if (data.supplier) {
    scores.supplier = {};
    scores.supplier.name = getFieldScore(data.supplier.name);
    scores.supplier.gstin = getFieldScore(data.supplier.gstin);
    scores.supplier.address = getFieldScore(data.supplier.address);
    scores.supplier.phone = getFieldScore(data.supplier.phone);
    scores.supplier.email = getFieldScore(data.supplier.email);
  }
  
  // Score invoice fields
  if (data.invoice) {
    scores.invoice = {};
    scores.invoice.invoice_number = getFieldScore(data.invoice.invoice_number);
    scores.invoice.invoice_date = getFieldScore(data.invoice.invoice_date);
    scores.invoice.due_date = getFieldScore(data.invoice.due_date);
    scores.invoice.place_of_supply = getFieldScore(data.invoice.place_of_supply);
    scores.invoice.payment_terms = getFieldScore(data.invoice.payment_terms);
  }
  
  // Score bill_to fields
  if (data.bill_to) {
    scores.bill_to = {};
    scores.bill_to.name = getFieldScore(data.bill_to.name);
    scores.bill_to.address = getFieldScore(data.bill_to.address);
    scores.bill_to.gstin = getFieldScore(data.bill_to.gstin);
  }
  
  // Score items (average score)
  if (data.items && Array.isArray(data.items) && data.items.length > 0) {
    const itemScores = data.items.map(item => {
      const itemScore = (
        getFieldScore(item.name) +
        getFieldScore(item.qty) +
        getFieldScore(item.rate) +
        getFieldScore(item.amount)
      ) / 4;
      return itemScore;
    });
    scores.items = Math.round(itemScores.reduce((a, b) => a + b, 0) / itemScores.length);
  } else {
    scores.items = 0;
  }
  
  // Score tax details
  if (data.tax) {
    const taxScores = [
      getFieldScore(data.tax.cgst),
      getFieldScore(data.tax.sgst),
      getFieldScore(data.tax.igst)
    ].filter(s => s > 0);
    scores.tax = taxScores.length > 0 
      ? Math.round(taxScores.reduce((a, b) => a + b, 0) / taxScores.length)
      : 50;
  }
  
  // Score totals
  if (data.totals) {
    scores.totals = {};
    scores.totals.sub_total = getFieldScore(data.totals.sub_total);
    scores.totals.tax_total = getFieldScore(data.totals.tax_total);
    scores.totals.grand_total = getFieldScore(data.totals.grand_total);
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


export const uploadAndExtract = async (req, res) => {
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('📄 File received:', req.file.originalname);
    console.log('📍 File path:', req.file.path);

    // Step 1: Extract text using OCR
    console.log('🔍 Step 1: Extracting text with OCR...');
    const extractedText = await extractTextFromImage(req.file.path);

    if (!extractedText || extractedText.trim().length < 50) {
      throw new Error('Insufficient text extracted from image. Please ensure the image is clear and contains readable text.');
    }

    // Step 2: Send text to Gemini for structured extraction
    console.log('🤖 Step 2: Sending text to Gemini AI...');
    const geminiResult = await extractInvoiceDataFromText(extractedText);
    const extractedData = geminiResult.data;
    const confidenceScores = geminiResult.confidenceScores;
    const usedMethod = 'OCR + Gemini AI';

    // Perform fraud detection and anomaly detection
    let fraudDetection = null;
    let anomalyDetection = null;
    
    if (req.user) {
      const organizationId = req.user.organizationId || null;
      
      // Run fraud detection
      fraudDetection = await detectFraud(extractedData, req.user._id, organizationId);
      console.log('🔍 Fraud Detection Result:', fraudDetection.fraud_status);
      
      // Run anomaly detection
      anomalyDetection = await detectAnomalies(extractedData, req.user._id, organizationId);
      console.log('📊 Anomaly Detection Result:', anomalyDetection.status);
    }

    // Save to history if user is authenticated
    if (req.user) {
      // Extract organizationId from authenticated user (for organization users)
      const organizationId = req.user.organizationId || null;
      
      await History.create({
        userId: req.user._id,
        organizationId: organizationId,
        filename: req.file.originalname,
        filePath: req.file.path,
        extractedData,
        confidenceScores: confidenceScores,
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
        provider: 'Gemini Flash'
      });
      console.log('✅ Saved to history for user:', req.user.email);
      if (organizationId) {
        console.log('✅ Linked to organization:', organizationId);
      }
    } else {
      // Clean up uploaded file for guest users
      await fs.unlink(req.file.path);
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`✅ Extraction complete in ${processingTime}s`);

    res.json({
      success: true,
      data: extractedData,
      confidenceScores: confidenceScores,
      fraudDetection: fraudDetection,
      anomalyDetection: anomalyDetection,
      metadata: {
        filename: req.file.originalname,
        processingTime: `${processingTime}s`,
        provider: usedMethod,
        note: 'Real AI extraction using OCR + Gemini'
      }
    });

  } catch (error) {
    console.error('Upload and extract error:', error);
    
    // Clean up file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process invoice'
    });
  }
};


// Get supplier statistics
export const getSupplierStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all invoices for this supplier
    const invoices = await History.find({ userId }).sort({ createdAt: -1 });

    // Calculate total amount
    let totalAmount = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    invoices.forEach(invoice => {
      // Sum up grand totals - check both old and new structure
      const grandTotal = invoice.extractedData?.totals?.grand_total || 
                        invoice.extractedData?.grandTotal || 
                        invoice.extractedData?.grand_total || 0;
      totalAmount += typeof grandTotal === 'string' 
        ? parseFloat(grandTotal.replace(/[^0-9.-]+/g, '')) || 0
        : grandTotal;

      // Calculate average confidence
      if (invoice.confidenceScores) {
        const scores = Object.values(invoice.confidenceScores).flat();
        scores.forEach(score => {
          if (typeof score === 'number') {
            totalConfidence += score;
            confidenceCount++;
          } else if (typeof score === 'object') {
            Object.values(score).forEach(s => {
              if (typeof s === 'number') {
                totalConfidence += s;
                confidenceCount++;
              }
            });
          }
        });
      }
    });

    const avgConfidence = confidenceCount > 0 
      ? Math.round(totalConfidence / confidenceCount) 
      : 0;

    // Get recent 5 invoices
    const recentInvoices = invoices.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalInvoices: invoices.length,
        totalAmount: Math.round(totalAmount),
        avgConfidence,
        recentInvoices
      }
    });
  } catch (error) {
    console.error('Get supplier stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch supplier statistics'
    });
  }
};
