# NativeWrite Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Node.js 18+ installed
- Git installed
- Vercel account
- GitHub account

### 1. Run Deployment Script
```bash
./deploy.sh
```

### 2. Manual Steps After Script

#### GitHub Repository
1. Create repository at: https://github.com/nativewrite/nativewrite-app.git
2. Run these commands:
```bash
git remote add origin https://github.com/nativewrite/nativewrite-app.git
git push -u origin main
```

#### Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your NativeWrite project
3. Go to Settings > Environment Variables
4. Add these variables (copy from `app/.env.local`):

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `ASSEMBLYAI_API_KEY` | AssemblyAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `RESEND_API_KEY` | Resend email API key |
| `AUTH_SECRET` | NextAuth secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ZEROGPT_API_KEY` | ZeroGPT API key |

#### Stripe Webhook Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `https://nativewrite.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook secret to Vercel environment variables

### 3. Test Deployment
- Visit: https://nativewrite.vercel.app
- Test health endpoint: https://nativewrite.vercel.app/api/health
- Test Stripe webhook (use Stripe CLI or dashboard)

## 🔧 Manual Deployment (Alternative)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Deploy
```bash
cd app
vercel --prod
```

### Link Project (if not already linked)
```bash
vercel link
```

## 📁 Project Structure
```
Nativewrite/
├── app/                    # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/        # API routes
│   │   │   └── (marketing)/ # Marketing pages
│   │   ├── components/     # React components
│   │   └── lib/           # Utilities
│   ├── .env.local         # Environment variables
│   └── package.json
├── vercel.json            # Vercel configuration
├── deploy.sh              # Deployment script
└── .gitignore            # Git ignore rules
```

## 🐛 Troubleshooting

### Build Errors
- Check Node.js version (18+ required)
- Verify all dependencies in `package.json`
- Check for TypeScript errors

### Environment Variables
- Ensure all required variables are set in Vercel
- Check variable names match exactly
- Verify no extra spaces in values

### Stripe Webhooks
- Test webhook endpoint manually
- Check Stripe webhook logs
- Verify webhook secret matches

### Git Issues
- Remove embedded git repo: `git rm --cached app`
- Re-add as submodule if needed
- Check `.gitignore` includes all necessary exclusions

## 🔄 Updates
To update deployment:
1. Make changes to code
2. Commit changes: `git add . && git commit -m "Update"`
3. Push to GitHub: `git push`
4. Vercel will auto-deploy

## 📞 Support
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Stripe Docs: https://stripe.com/docs
