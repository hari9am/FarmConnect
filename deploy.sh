#!/bin/bash

echo "🚀 FarmConnect Vercel Deployment Script"
echo "======================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build the project
echo "🔨 Building the project..."
npm run build:vercel

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📝 Post-deployment checklist:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Test API endpoints"
echo "3. Test database connectivity"
echo "4. Test authentication flows"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
