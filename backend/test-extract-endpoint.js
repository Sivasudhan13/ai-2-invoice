import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const testExtractEndpoint = async () => {
  try {
    console.log('Testing extract endpoint...\n');

    // Check if we have a test image
    const testImagePath = 'test-invoice.jpg'; // You'll need to provide this
    
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ No test image found at:', testImagePath);
      console.log('\nPlease:');
      console.log('1. Place a test invoice image in backend folder');
      console.log('2. Name it "test-invoice.jpg"');
      console.log('3. Run this script again');
      return;
    }

    const formData = new FormData();
    formData.append('invoice', fs.createReadStream(testImagePath));

    console.log('📤 Uploading test invoice...');
    const response = await fetch('http://localhost:5000/api/invoice/extract', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    console.log('Response status:', response.status);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ SUCCESS!\n');
      console.log('Extracted Data:', JSON.stringify(data.data, null, 2));
      console.log('\nConfidence Scores:', JSON.stringify(data.confidenceScores, null, 2));
    } else {
      console.log('\n❌ ERROR:', data.error);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
};

testExtractEndpoint();
