#!/bin/bash

# NativeWrite Deployment Script
# Deploys to Vercel with GitHub integration

set -e

echo "🚀 Starting NativeWrite deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Git Setup
print_status "Setting up Git repository..."

if [ ! -d ".git" ]; then
    print_status "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    print_warning ".gitignore not found, creating one..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Next.js
.next/
out/
build/

# Vercel
.vercel

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
    print_success ".gitignore created"
fi

# Add all files to git
print_status "Adding files to Git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    git commit -m "Deploy NativeWrite to Vercel"
    print_success "Files committed to Git"
fi

# Set main branch
git branch -M main

# 2. GitHub Setup (placeholder - user needs to create repo)
print_status "GitHub repository setup..."
print_warning "Please create a GitHub repository at: ghttps://github.com/nativewrite/nativewrite-app.git"
print_warning "Then run: git remote add origin https://github.com/nativewrite/nativewrite-app.git"
print_warning "And: git push -u origin main"

# 3. Vercel Configuration
print_status "Creating Vercel configuration..."

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    print_warning "vercel.json not found, creating one..."
    cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "app/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app/$1"
    }
  ],
}
EOF
    print_success "vercel.json created"
else
    print_status "vercel.json already exists"
fi

# 4. Environment Variables Validation
print_status "Validating environment variables..."

if [ ! -f "app/.env.local" ]; then
    print_error "app/.env.local not found!"
    print_error "Please create app/.env.local with all required environment variables"
    exit 1
fi

# Required environment variables
REQUIRED_VARS=(
    "OPENAI_API_KEY"
    "ANTHROPIC_API_KEY"
    "ASSEMBLYAI_API_KEY"
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SUPABASE_URL"
    "SUPABASE_ANON_KEY"
    "RESEND_API_KEY"
    "AUTH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "ZEROGPT_API_KEY"
)

print_status "Checking required environment variables in app/.env.local..."

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" app/.env.local; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    print_success "All required environment variables found in app/.env.local"
else
    print_warning "Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        print_warning "  - $var"
    done
    print_warning "Please add these to app/.env.local before deployment"
fi

# 5. Install Vercel CLI if not present
print_status "Checking Vercel CLI..."

if ! command -v vercel &> /dev/null; then
    print_status "Installing Vercel CLI..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_status "Vercel CLI already installed"
fi

# 6. Deploy to Vercel
print_status "Deploying to Vercel..."

# Check if already linked to Vercel project
if [ ! -f ".vercel/project.json" ]; then
    print_status "Linking to Vercel project..."
    vercel link --yes
fi

print_status "Deploying to production..."
vercel --prod --confirm

print_success "✅ NativeWrite successfully deployed!"
print_success "Live URL: https://nativewrite.vercel.app"

echo ""
print_status "Next steps:"
echo "1. Add environment variables in Vercel Dashboard:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Select your project"
echo "   - Go to Settings > Environment Variables"
echo "   - Add all variables from app/.env.local"
echo ""
echo "2. Set up Stripe webhook:"
echo "   - Go to Stripe Dashboard > Webhooks"
echo "   - Add endpoint: https://nativewrite.vercel.app/api/webhooks/stripe"
echo "   - Select events: checkout.session.completed, invoice.payment_succeeded, etc."
echo ""
echo "3. Test your deployment:"
echo "   - Visit https://nativewrite.vercel.app"
echo "   - Test API endpoints"
echo "   - Verify Stripe integration"

print_success "🎉 Deployment complete!"
