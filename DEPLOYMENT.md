# FarmConnect Vercel Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Vercel CLI installed (`npm i -g vercel`)
- Git repository with your code

## Environment Variables Required
Add these in your Vercel dashboard under Environment Variables:

### Database
- `DATABASE_URL` - MongoDB connection string
- `MONGODB_URI` - Alternative MongoDB connection string

### Authentication
- `JWT_SECRET` - Your JWT secret key
- `SESSION_SECRET` - Session secret for Express sessions

### Payment (Optional)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Communication (Optional)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

### Other
- `NODE_ENV` - Set to `production`

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Root Directory
```bash
cd d:\FarmConnect
vercel --prod
```

### 4. Follow the Prompts
- Link to existing Vercel project or create new one
- Confirm settings (the vercel.json file handles most configuration)
- Add environment variables when prompted or add them in Vercel dashboard

### 5. Deploy Updates
For subsequent deployments:
```bash
vercel --prod
```

## Configuration Files Created
- `vercel.json` - Vercel configuration
- `api/index.ts` - Serverless function for API routes
- `.vercelignore` - Files to exclude from deployment

## Build Process
- Frontend builds to `dist/public`
- API routes served as serverless functions
- Static files served from build directory

## Post-Deployment Checklist
1. Verify environment variables are set in Vercel dashboard
2. Test API endpoints are working
3. Test database connectivity
4. Test authentication flows
5. Test payment integration (if applicable)
6. Test mobile app connectivity

## Troubleshooting
- Check Vercel function logs for API errors
- Verify MongoDB connection string allows Vercel IPs
- Ensure all environment variables are correctly set
- Check build logs for any compilation errors

## Custom Domain (Optional)
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain
5. Configure DNS records as instructed
