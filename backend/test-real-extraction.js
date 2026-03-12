import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGeminiAPI() {
  try {
    console.log('🔑 Testing Gemini API Key...');
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Found' : 'Missing');

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in .env file');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    console.log('📤 Sending test request to Gemini...');
    
    const result = await model.generateContent('Say "Hello, API is working!" in JSON format with a key "message"');
    const response = result.response;
    const text = response.text();

    console.log('✅ Gemini API Response:');
    console.log(text);
    console.log('\n✅ API Key is valid and working!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('\n⚠️  Your API key is invalid. Please:');
      console.error('1. Go to https://makersuite.google.com/app/apikey');
      console.error('2. Generate a new API key');
      console.error('3. Update GEMINI_API_KEY in backend/.env');
    } else if (error.message.includes('404')) {
      console.error('\n⚠️  Model not found. Trying alternative models...');
      await testAlternativeModels();
    }
  }
}

async function testAlternativeModels() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`\n🔄 Testing model: ${modelName}...`);
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say hello');
      console.log(`✅ ${modelName} works!`);
      console.log(`Update your code to use: ${modelName}`);
      return;
    } catch (error) {
      console.log(`❌ ${modelName} failed:`, error.message);
    }
  }
}

testGeminiAPI();
