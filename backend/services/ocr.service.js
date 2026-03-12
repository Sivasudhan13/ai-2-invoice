import Tesseract from 'tesseract.js';
import path from 'path';

/**
 * Extract text from image using Tesseract OCR
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromImage = async (imagePath) => {
  try {
    console.log('🔍 Starting OCR extraction...');
    console.log('📄 Image path:', imagePath);

    const result = await Tesseract.recognize(
      imagePath,
      'eng', // Language
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`📊 OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    const extractedText = result.data.text;
    console.log('✅ OCR completed');
    console.log('📝 Extracted text length:', extractedText.length, 'characters');
    console.log('📄 Text preview:', extractedText.substring(0, 200) + '...');

    return extractedText;
  } catch (error) {
    console.error('❌ OCR extraction error:', error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

/**
 * Extract text and send to Gemini for structured extraction
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - Structured invoice data
 */
export const extractInvoiceWithOCR = async (imagePath) => {
  try {
    // Step 1: Extract text using OCR
    const extractedText = await extractTextFromImage(imagePath);

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the image');
    }

    // Step 2: Return the text (will be sent to Gemini)
    return extractedText;
  } catch (error) {
    console.error('❌ Invoice extraction error:', error);
    throw error;
  }
};
