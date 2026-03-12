import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  try {
    console.log('🔍 Listing available Gemini models...\n');
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try to list models using the API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available models:\n');
      data.models.forEach(model => {
        console.log(`📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });
      
      // Find models that support generateContent
      const contentModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (contentModels.length > 0) {
        console.log('\n✅ Models that support text generation:');
        contentModels.forEach(m => {
          const modelId = m.name.replace('models/', '');
          console.log(`   - ${modelId}`);
        });
        
        console.log('\n💡 Update your code to use one of these models!');
      }
    } else {
      console.log('❌ No models found or error:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
