import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const INVOICE_EXTRACTION_PROMPT = `You are an expert invoice data extraction system. Analyze the provided invoice text and extract ALL information into a structured JSON format.

Extract the following fields in this EXACT structure (use null if not found):

{
  "supplier": {
    "name": "supplier/vendor company name",
    "gstin": "GST number",
    "address": "full address",
    "phone": "phone number",
    "email": "email address"
  },
  "invoice": {
    "invoice_number": "invoice number",
    "invoice_date": "date in YYYY-MM-DD format",
    "due_date": "due date in YYYY-MM-DD format",
    "place_of_supply": "place of supply/state",
    "payment_terms": "payment terms"
  },
  "bill_to": {
    "name": "customer/bill to name",
    "address": "customer address",
    "gstin": "customer GST number",
    "phone": "customer phone"
  },
  "items": [
    {
      "name": "item/product name",
      "description": "item description",
      "hsn": "HSN/SAC code",
      "qty": number,
      "uom": "unit of measurement (mtr, pcs, kg, etc)",
      "rate": number,
      "amount": number,
      "tax_rate": number
    }
  ],
  "tax": {
    "cgst": number,
    "sgst": number,
    "igst": number
  },
  "totals": {
    "sub_total": number,
    "tax_total": number,
    "discount": number,
    "grand_total": number
  },
  "bank_details": {
    "bank_name": "bank name",
    "account_number": "account number",
    "ifsc": "IFSC code",
    "branch": "branch name"
  },
  "notes": "any additional notes or terms"
}

IMPORTANT:
- Return ONLY valid JSON, no markdown or explanations
- All numbers must be actual numbers, not strings
- Date format must be YYYY-MM-DD
- Extract ALL line items from the invoice
- Calculate totals accurately
- Use null for missing fields`;

export const extractInvoiceDataFromText = async (extractedText) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 8192,
      }
    });

    console.log('🤖 Sending text to Gemini for structured extraction...');

    const prompt = `${INVOICE_EXTRACTION_PROMPT}

Here is the extracted text from the invoice:

${extractedText}

Return ONLY the JSON structure, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    console.log('✅ Gemini response received');
    console.log('📄 Raw response length:', text.length);

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any text before the first { and after the last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON found in response');
    }
    
    text = text.substring(firstBrace, lastBrace + 1);

    console.log('🧹 Cleaned JSON length:', text.length);

    // Parse JSON
    let extractedData;
    try {
      extractedData = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Failed text:', text.substring(0, 500));
      
      // Try to fix common JSON issues
      text = text
        .replace(/,\s*}/g, '}')  // Remove trailing commas
        .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
        .replace(/\n/g, ' ')      // Remove newlines
        .replace(/\r/g, '')       // Remove carriage returns
        .replace(/\t/g, ' ');     // Replace tabs with spaces
      
      try {
        extractedData = JSON.parse(text);
      } catch (secondError) {
        throw new Error(`Failed to parse JSON: ${parseError.message}`);
      }
    }

    // Validate and ensure required structure
    if (!extractedData || typeof extractedData !== 'object') {
      throw new Error('Invalid data structure returned');
    }

    // Ensure all required top-level keys exist
    const requiredKeys = ['supplier', 'invoice', 'items', 'tax', 'totals'];
    requiredKeys.forEach(key => {
      if (!extractedData[key]) {
        extractedData[key] = key === 'items' ? [] : {};
      }
    });

    // Calculate confidence scores based on data quality
    const confidenceScores = calculateConfidenceScores(extractedData, extractedText);

    console.log('✅ JSON parsed and validated successfully');
    console.log('📊 Confidence scores calculated');
    
    return { 
      data: extractedData,
      confidenceScores 
    };

  } catch (error) {
    console.error('❌ Gemini extraction error:', error);
    throw new Error(`Failed to extract invoice data: ${error.message}`);
  }
};

// Calculate confidence scores based on data quality and completeness
function calculateConfidenceScores(data, originalText) {
  const scores = {};
  
  // Helper function to calculate field confidence
  const getFieldConfidence = (value, fieldName, originalText) => {
    if (!value || value === null || value === undefined) return 0;
    
    let score = 50; // Base score for having a value
    
    // Check if value exists in original text (case-insensitive)
    const valueStr = String(value).toLowerCase();
    const textLower = originalText.toLowerCase();
    
    if (textLower.includes(valueStr)) {
      score += 30; // Found in original text
    }
    
    // Length and format checks
    if (typeof value === 'string') {
      if (value.trim().length === 0) return 0;
      if (value.trim().length < 2) return 40;
      if (value.trim().length >= 3) score += 10;
      
      // Specific field validations
      if (fieldName === 'gstin' && /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
        score = 95; // Valid GSTIN format
      }
      if (fieldName === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        score = 95; // Valid email format
      }
      if (fieldName === 'phone' && /^[0-9]{10,}$/.test(value.replace(/[^0-9]/g, ''))) {
        score = 90; // Valid phone format
      }
      if ((fieldName === 'invoice_date' || fieldName === 'due_date') && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        score = 92; // Valid date format
      }
    }
    
    if (typeof value === 'number') {
      if (value === 0) return 50;
      if (value > 0) score += 20;
      if (value > 100) score += 10; // Reasonable invoice amounts
    }
    
    return Math.min(100, score);
  };
  
  // Calculate supplier confidence
  if (data.supplier) {
    scores.supplier = {};
    Object.keys(data.supplier).forEach(key => {
      scores.supplier[key] = getFieldConfidence(data.supplier[key], key, originalText);
    });
  }
  
  // Calculate invoice confidence
  if (data.invoice) {
    scores.invoice = {};
    Object.keys(data.invoice).forEach(key => {
      scores.invoice[key] = getFieldConfidence(data.invoice[key], key, originalText);
    });
  }
  
  // Calculate bill_to confidence
  if (data.bill_to) {
    scores.bill_to = {};
    Object.keys(data.bill_to).forEach(key => {
      scores.bill_to[key] = getFieldConfidence(data.bill_to[key], key, originalText);
    });
  }
  
  // Calculate items confidence (average of all items)
  if (data.items && data.items.length > 0) {
    const itemScores = data.items.map(item => {
      const nameScore = getFieldConfidence(item.name, 'name', originalText);
      const qtyScore = getFieldConfidence(item.qty, 'qty', originalText);
      const rateScore = getFieldConfidence(item.rate, 'rate', originalText);
      const amountScore = getFieldConfidence(item.amount, 'amount', originalText);
      return (nameScore + qtyScore + rateScore + amountScore) / 4;
    });
    scores.items = Math.round(itemScores.reduce((a, b) => a + b, 0) / itemScores.length);
  } else {
    scores.items = 0;
  }
  
  // Calculate tax confidence
  if (data.tax) {
    const taxValues = [data.tax.cgst, data.tax.sgst, data.tax.igst].filter(v => v > 0);
    if (taxValues.length > 0) {
      const taxScores = taxValues.map(v => getFieldConfidence(v, 'tax', originalText));
      scores.tax = Math.round(taxScores.reduce((a, b) => a + b, 0) / taxScores.length);
    } else {
      scores.tax = 50; // Neutral score if no tax
    }
  }
  
  // Calculate totals confidence
  if (data.totals) {
    scores.totals = {};
    Object.keys(data.totals).forEach(key => {
      scores.totals[key] = getFieldConfidence(data.totals[key], key, originalText);
    });
    
    // Boost confidence if calculations are consistent
    if (data.items && data.items.length > 0) {
      const calculatedSubTotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      if (Math.abs(calculatedSubTotal - (data.totals.sub_total || 0)) < 1) {
        scores.totals.sub_total = Math.min(100, scores.totals.sub_total + 10);
      }
    }
  }
  
  // Calculate bank details confidence
  if (data.bank_details) {
    scores.bank_details = {};
    Object.keys(data.bank_details).forEach(key => {
      scores.bank_details[key] = getFieldConfidence(data.bank_details[key], key, originalText);
    });
  }
  
  return scores;
}

