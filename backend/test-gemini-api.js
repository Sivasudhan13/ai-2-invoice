import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const testGeminiAPI = async () => {
  try {
    console.log('🧪 Testing Gemini API...\n');
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in .env file');
      process.exit(1);
    }
    
    console.log('✅ API Key found');
    console.log('🔑 Key starts with:', process.env.GEMINI_API_KEY.substring(0, 10) + '...\n');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 8192,
      }
    });
    
    console.log('📡 Sending test request to Gemini...\n');
    
    const prompt = `Return this exact JSON structure with sample invoice data:
{
  "supplier": {
    "name": "Test Company",
    "gstin": "29ABCDE1234F1Z5",
    "address": "123 Test St",
    "phone": "1234567890"
  },
  "invoice": {
    "invoice_number": "INV-001",
    "invoice_date": "2024-01-15",
    "place_of_supply": "Karnataka",
    "payment_terms": "Net 30"
  },
  "items": [
    {
      "name": "Test Item",
      "hsn": "1234",
      "qty": 10,
      "uom": "pcs",
      "rate": 100,
      "amount": 1000
    }
  ],
  "tax": {
    "cgst": 90,
    "sgst": 90,
    "igst": 0
  },
  "totals": {
    "sub_total": 1000,
    "tax_total": 180,
    "grand_total": 1180
  }
}

Return ONLY the JSON, no explanations.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    
    console.log('✅ Response received\n');
    console.log('📄 Raw response:');
    console.log(text);
    console.log('\n');
    
    // Clean up
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('🧹 Cleaned JSON:');
    console.log(text);
    console.log('\n');
    
    // Try to parse
    const parsed = JSON.parse(text);
    console.log('✅ JSON parsed successfully!\n');
    console.log('📊 Parsed data:');
    console.log(JSON.stringify(parsed, null, 2));
    console.log('\n');
    
    console.log('🎉 Gemini API is working correctly!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

testGeminiAPI();
