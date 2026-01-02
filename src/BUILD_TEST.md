# 🧪 Build Test - Quick Verification

## Run These Commands Before Deploying

### 1. Clean Install
```bash
# Remove old files
rm -rf node_modules dist package-lock.json

# Fresh install
npm install
```

**Expected:** No errors, packages installed successfully

---

### 2. Build for Production
```bash
npm run build
```

**Expected Output:**
```
vite v5.1.0 building for production...
✓ 247 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.21 kB
dist/assets/index-xyz789.js     245.67 kB │ gzip: 89.12 kB
✓ built in 4.32s
```

**If you see this, build is successful!** ✅

---

### 3. Check Build Output
```bash
# List dist folder contents
ls -lh dist/

# OR on Windows:
dir dist
```

**Expected Files:**
```
dist/
├── index.html
├── favicon.svg
└── assets/
    ├── index-[hash].js
    ├── index-[hash].css
    ├── react-vendor-[hash].js
    └── supabase-vendor-[hash].js
```

---

### 4. Preview Production Build
```bash
npm run preview
```

**Expected:**
```
  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### 5. Test in Browser

Open: `http://localhost:4173`

**Checklist:**
- [ ] Homepage loads (no white screen)
- [ ] Products display
- [ ] Can click "Add to Cart"
- [ ] Cart icon updates (shows count)
- [ ] Click cart → sidebar opens
- [ ] Click "Checkout" → modal opens
- [ ] Navigate to `/admin`
- [ ] Admin login works (password: Akvv989898@@)
- [ ] Can click "Upload Product" in admin
- [ ] No errors in browser console (F12)

---

## 🔍 Common Issues

### Issue: `npm: command not found`
**Solution:** Install Node.js from https://nodejs.org/

### Issue: Build fails with "Module not found"
**Solution:** 
```bash
rm -rf node_modules
npm install
npm run build
```

### Issue: `dist/` folder is empty
**Solution:** Check terminal for build errors, fix them, rebuild

### Issue: White screen in preview
**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Usually a Supabase configuration issue
4. Verify `/utils/supabase/info.tsx`

### Issue: "Cannot find module 'path'"
**Solution:** This is already fixed! Run:
```bash
npm install
npm run build
```

---

## ✅ All Tests Passing?

If all 5 tests above pass, you're ready to deploy!

**Next:** Read `QUICK_DEPLOY.md` and deploy to Vercel!

---

## 🚨 Build Failed?

**Check these:**
1. Node.js version: `node --version` (should be 18+)
2. Clean install: `rm -rf node_modules && npm install`
3. No syntax errors in code
4. All imports are correct
5. `/utils/supabase/info.tsx` exists

**Still failing?** Check the error message carefully and fix the specific issue mentioned.

---

## 📊 Expected Build Size

Your build should be approximately:

| File | Size | Gzipped |
|------|------|---------|
| HTML | ~500 bytes | ~300 bytes |
| CSS | ~12 KB | ~3 KB |
| JavaScript | ~250 KB | ~90 KB |
| **Total** | **~262 KB** | **~93 KB** |

If your build is significantly larger (> 500 KB), check for:
- Accidentally bundled server code
- Large unused dependencies
- Unoptimized images

---

## 🎯 Quick Verify Script

Copy and paste this into terminal:

```bash
# Full verification
echo "🧪 Starting build test..."
echo ""
echo "1️⃣ Installing dependencies..."
npm install && \
echo "" && \
echo "2️⃣ Building for production..." && \
npm run build && \
echo "" && \
echo "3️⃣ Checking output..." && \
ls -lh dist/ && \
echo "" && \
echo "✅ Build test complete!" && \
echo "📦 Build size:" && \
du -sh dist/ && \
echo "" && \
echo "🚀 Ready to deploy! Run: npm run preview to test locally"
```

**If this completes without errors, you're 100% ready!** ✅

---

**Next Step:** Deploy to Vercel using `QUICK_DEPLOY.md`! 🚀
