#!/bin/bash

# Frontend Deployment Script

echo "🚀 Deploying Frontend to Production..."
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found"
    echo "Please run this script from the project root"
    exit 1
fi

cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building production bundle..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Production files are in: frontend/dist"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to Vercel: vercel --prod"
    echo "2. Deploy to Netlify: netlify deploy --prod"
    echo "3. Or upload the 'dist' folder to your hosting provider"
    echo ""
    echo "Don't forget to set environment variable:"
    echo "VITE_API_URL=https://ai-invoice-2f1n.onrender.com"
else
    echo "❌ Build failed!"
    exit 1
fi
