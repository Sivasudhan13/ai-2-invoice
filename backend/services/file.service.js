import fs from 'fs/promises';
import pdf from 'pdf-parse';

export const processFile = async (file) => {
  try {
    const fileBuffer = await fs.readFile(file.path);

    if (file.mimetype === 'application/pdf') {
      // Extract text from PDF
      const pdfData = await pdf(fileBuffer);
      return {
        text: pdfData.text,
        type: 'pdf'
      };
    } else {
      // For images, convert to base64
      const base64 = fileBuffer.toString('base64');
      return {
        base64: base64,
        type: 'image'
      };
    }
  } catch (error) {
    console.error('File processing error:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};
