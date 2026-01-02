# 🔨 Build Commands - Local Development & Deployment

## 📋 Quick Command Reference

### **If You Want to Build Locally:**

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Build for production
npm run build

# 3. Check the dist folder
ls dist/
# Should show: index.html, assets/, etc.
```

**Output:** Creates `dist/` folder ready for deployment ✅

---

### **If You Want to Test Locally Before Deploying:**

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

**Then open:** http://localhost:4173

**This shows exactly what Netlify will serve!** ✅

---

## 🚀 Deployment Options

### **Option 1: Netlify via GitHub (NO BUILD NEEDED)**

**You don't build anything - Netlify does it!**

```bash
# Just push your code
git add .
git commit -m "Deploy to Netlify"
git push
```

**Netlify automatically:**
1. Runs `npm install`
2. Runs `npm run build`
3. Deploys the `dist/` folder
4. Site is live! ✅

**👉 THIS IS THE EASIEST WAY!**

---

### **Option 2: Netlify Drag & Drop (BUILD REQUIRED)**

**You build locally, then upload:**

```bash
# Step 1: Build locally
npm install
npm run build

# Step 2: Upload to Netlify
# Go to https://app.netlify.com/drop
# Drag the dist/ folder into the browser
```

**Done!** Site is live! ✅

---

### **Option 3: Netlify CLI (BUILD REQUIRED)**

```bash
# Step 1: Install Netlify CLI
npm install -g netlify-cli

# Step 2: Login
netlify login

# Step 3: Build
npm run build

# Step 4: Deploy
netlify deploy --prod --dir=dist
```

**Done!** Site is live! ✅

---

## 📁 What's in the dist/ Folder?

After running `npm run build`, you get:

```
dist/
├── index.html                          # Main HTML file
├── assets/
│   ├── index-[hash].js                # Your React app (minified)
│   ├── index-[hash].css               # All styles (minified)
│   ├── react-vendor-[hash].js         # React library
│   └── supabase-vendor-[hash].js      # Supabase library
└── vite.svg                           # Favicon (if any)
```

**This is what gets deployed!** ✅

---

## ⚡ Development Commands

### **Run Development Server:**

```bash
npm run dev
```

**Opens:** http://localhost:5173

**Features:**
- ✅ Hot reload (changes update instantly)
- ✅ Fast refresh
- ✅ Source maps for debugging

---

### **Build for Production:**

```bash
npm run build
```

**Output:** `dist/` folder

**Features:**
- ✅ Minified JavaScript
- ✅ Minified CSS
- ✅ Optimized images
- ✅ Code splitting
- ✅ Tree shaking (removes unused code)

---

### **Preview Production Build:**

```bash
npm run preview
```

**Opens:** http://localhost:4173

**What it does:**
- Serves the `dist/` folder
- Shows exactly what Netlify will serve
- Good for final testing before deployment

---

## 🔍 Verify Build is Correct

### **Step 1: Build**
```bash
npm run build
```

### **Step 2: Check Output**
```bash
# Check dist folder exists
ls -la dist/

# Should show:
# index.html
# assets/
```

### **Step 3: Check File Sizes**
```bash
# Build output shows sizes:
dist/index.html                    2.34 kB │ gzip: 1.12 kB
dist/assets/index-abc123.css      45.67 kB │ gzip: 12.34 kB
dist/assets/index-xyz789.js      234.56 kB │ gzip: 78.90 kB
```

**Good sizes:**
- ✅ HTML: <10 kB
- ✅ CSS: <100 kB
- ✅ JS: <500 kB (total)

### **Step 4: Test Locally**
```bash
npm run preview
# Open http://localhost:4173
# Test all features
```

**If it works locally, it will work on Netlify!** ✅

---

## 🐛 Common Build Errors

### **Error: "Command not found: npm"**

**Fix:** Install Node.js
```bash
# Download from: https://nodejs.org
# Install version 18 or higher
```

---

### **Error: "ENOENT: no such file or directory"**

**Fix:** You're in wrong folder
```bash
# Navigate to project folder
cd path/to/urban-wear-retail

# Verify you're in the right place
ls package.json  # Should exist
```

---

### **Error: "Cannot find module"**

**Fix:** Install dependencies first
```bash
# Remove old node_modules
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Then build
npm run build
```

---

### **Error: "JavaScript heap out of memory"**

**Fix:** Increase Node memory
```bash
# Temporarily increase memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

Or update package.json:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max_old_space_size=4096 vite build"
  }
}
```

---

### **Error: Build succeeds but site is blank**

**Fix:** Check console for errors
```bash
# Preview locally
npm run preview

# Open browser console (F12)
# Look for errors

# Common issues:
# - Missing environment variables
# - Incorrect base path
# - JavaScript errors
```

---

## 📊 Build Performance

**Expected build times:**

| Step | Time | What Happens |
|------|------|--------------|
| npm install | 20-60s | Downloads dependencies |
| Vite transform | 10-20s | Processes source files |
| Vite build | 15-30s | Bundles and minifies |
| **Total** | **45-110s** | Complete build |

**On Netlify:**
- First build: ~90-120s (includes npm install)
- Subsequent builds: ~30-60s (cached dependencies)

---

## ✅ Pre-Deployment Checklist

Before deploying, verify:

```bash
# 1. Dependencies are installed
npm install

# 2. No TypeScript errors (if using TS)
npm run lint  # If you have linting

# 3. Build succeeds
npm run build

# 4. Preview works locally
npm run preview
# Test all features at http://localhost:4173

# 5. No console errors
# Open browser console (F12) and check

# 6. Environment variables set (if needed)
# Check .env.local or Netlify settings
```

**If all pass, you're ready to deploy!** ✅

---

## 🎯 Recommended Workflow

### **For Local Development:**
```bash
# Start dev server
npm run dev

# Make changes
# Browser auto-refreshes ✅

# When done:
git add .
git commit -m "Feature: Added new products"
git push
```

**Netlify auto-deploys!** ✅

---

### **For Manual Deployment:**
```bash
# Build locally
npm run build

# Test locally
npm run preview
# Verify at http://localhost:4173

# Deploy to Netlify
# Drag dist/ folder to netlify.com/drop
```

**Site is live!** ✅

---

## 🔧 Build Configuration Files

**Your project has:**

| File | Purpose | Status |
|------|---------|--------|
| `package.json` | Dependencies & scripts | ✅ Correct |
| `vite.config.ts` | Build configuration | ✅ Correct |
| `tsconfig.json` | TypeScript config | ✅ Correct |
| `.vercelignore` | Excludes from Vercel | ✅ Correct |
| `.npmrc` | npm configuration | ✅ Correct |

**All build configs are correct!** No changes needed! ✅

---

## 📦 Package.json Scripts

**Your available commands:**

```json
{
  "scripts": {
    "dev": "vite",              // Development server
    "build": "vite build",      // Production build
    "preview": "vite preview",  // Preview production build
    "lint": "echo 'No linter'"  // Placeholder
  }
}
```

**Usage:**
```bash
npm run dev      # Development
npm run build    # Production build
npm run preview  # Test production build
```

---

## 🚀 Deployment Platform Commands

### **Netlify:**
```bash
# Via GitHub (recommended)
git push  # Automatic deploy

# Via CLI
netlify deploy --prod --dir=dist

# Via drag & drop
# Build first: npm run build
# Then: https://app.netlify.com/drop
```

### **Cloudflare Pages:**
```bash
# Via GitHub (recommended)
git push  # Automatic deploy

# Via CLI
npx wrangler pages publish dist
```

### **Firebase:**
```bash
# Build first
npm run build

# Deploy
firebase deploy --only hosting
```

---

## 💡 Tips & Best Practices

### **Always test locally before deploying:**
```bash
npm run build
npm run preview
# Test thoroughly at http://localhost:4173
```

### **Clean build if something breaks:**
```bash
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### **Check build output size:**
```bash
# After building
du -sh dist/
# Should be <5 MB total

# If too large:
# - Optimize images
# - Remove unused dependencies
# - Enable tree shaking
```

---

## ✅ Summary

**To build locally:**
```bash
npm install
npm run build
```

**To deploy to Netlify (easiest):**
```bash
git push  # Netlify builds automatically
```

**To deploy manually:**
```bash
npm run build
# Drag dist/ to netlify.com/drop
```

**No dist folder needed if using GitHub + Netlify!** ✅

---

**🎯 RECOMMENDATION: Use Netlify + GitHub**

**Why:**
- ✅ No local building needed
- ✅ Automatic deployments
- ✅ Just push code
- ✅ Netlify does the rest

**See: DEPLOY_TO_NETLIFY.md for full guide** 📚
