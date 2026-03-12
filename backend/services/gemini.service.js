import { getGeminiModel } from '../config/gemini.config.js';

const INVOICE_EXTRACTION_PROMPT = `You are an expert invoice data extraction system. Analyze the provided invoice image/document and extract ALL information into a structured JSON format.

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

export const extractInvoiceData = async (fileData, mimeType) => {
  try {
    const model = getGeminiModel();

    let parts;
    if (mimeType === 'application/pdf') {
      // For PDFs, we'll use the text content
      parts = [
        { text: INVOICE_EXTRACTION_PROMPT },
        { text: `\n\nInvoice Content:\n${fileData.text}` }
      ];
    } else {
      // For images, use inline data
      parts = [
        { text: INVOICE_EXTRACTION_PROMPT },
        {
          inlineData: {
            mimeType: mimeType,
            data: fileData.base64
          }
        }
      ];
    }

    const result = await model.generateContent(parts);
    const response = result.response;
    let text = response.text();

    console.log('Raw Gemini response:', text);

    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any text before the first { and after the last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No valid JSON found in response');
    }
    
    text = text.substring(firstBrace, lastBrace + 1);

    console.log('Cleaned JSON:', text);

    // Parse JSON
    let extractedData;
    try {
      extractedData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed text:', text);
      
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

    return extractedData;

  } catch (error) {
    console.error('Gemini extraction error:', error);
    throw new Error(`Failed to extract invoice data: ${error.message}`);
  }
};
