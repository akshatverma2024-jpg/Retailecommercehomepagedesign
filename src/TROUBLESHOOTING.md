# 🔧 Troubleshooting Guide

## Common Issues and Solutions

---

## 🏗️ Build Issues

### ❌ Error: "Cannot find module 'path'"

**Symptom:**
```
Error: Cannot find module 'path'
```

**Cause:** Old version of `vite.config.ts` with Node.js imports

**Solution:**
✅ **Already Fixed!** The latest `vite.config.ts` doesn't use `path`.

Verify your `vite.config.ts` looks like this:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',  // ✅ No path.resolve
    },
  },
  // ...
});
```

If you still see this error:
```bash
rm -rf node_modules
npm install
npm run build
```

---

### ❌ Error: "Module not found"

**Symptom:**
```
Error: Cannot find module 'react' or '@supabase/supabase-js'
```

**Cause:** Dependencies not installed

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

---

### ❌ Build takes too long (> 2 minutes)

**Symptom:** Build hangs or takes very long

**Cause:** 
- Large node_modules
- Network issues downloading packages
- Low system resources

**Solution:**
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Build with more memory (if needed)
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

### ❌ Error: "ENOSPC: no space left on device"

**Symptom:** Build fails with disk space error

**Cause:** Not enough disk space

**Solution:**
```bash
# Check disk space
df -h

# Clean npm cache
npm cache clean --force

# Clean old builds
rm -rf dist node_modules
npm install
npm run build
```

---

## 🚀 Deployment Issues

### ❌ Vercel: "Build failed"

**Symptom:** Deployment fails on Vercel

**Check Vercel Build Logs:**
1. Go to Vercel Dashboard
2. Click on your project
3. Click on failed deployment
4. Click "View Build Logs"

**Common Causes & Solutions:**

**1. Missing files:**
- Make sure all files are committed to Git
- Check `.gitignore` isn't excluding important files

**2. Build command wrong:**
- Vercel should auto-detect: `vite build`
- Output directory should be: `dist`

**3. Environment variables:**
- Your Supabase credentials are in `/utils/supabase/info.tsx`
- No environment variables needed in Vercel!

**4. Node version:**
- Vercel uses Node 18+ by default
- Should work automatically

---

### ❌ Vercel: "Build succeeded but site shows 404"

**Symptom:** Build works, but visiting URL shows 404

**Cause:** Output directory misconfigured

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings
2. Under "Build & Development Settings"
3. Verify:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

### ❌ GitHub: "Repository not found"

**Symptom:** Can't find repository when importing to Vercel

**Solution:**
1. Make sure repository is created on GitHub
2. Make sure files are committed and pushed
3. In Vercel, click "Adjust GitHub App Permissions"
4. Grant access to the repository

---

## 🌐 Runtime Issues

### ❌ White screen after deployment

**Symptom:** Site loads but shows blank white page

**Cause:** JavaScript error or Supabase connection issue

**Solution:**

1. **Open Browser DevTools** (Press F12)
2. **Check Console tab** for errors

**Common errors:**

**Error: "Supabase URL is undefined"**
```
Solution: Check /utils/supabase/info.tsx
Make sure it has:
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-anon-key';
```

**Error: "Failed to fetch"**
```
Solution: Check network tab in DevTools
Verify API calls are going to correct URL
Should be: https://YOUR-ID.supabase.co/functions/v1/...
```

**Error: "Unexpected token '<'"**
```
Solution: This means HTML is being served instead of JS
Usually a routing issue
Check vercel.json has:
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### ❌ Products not loading

**Symptom:** Homepage loads but no products show

**Cause:** Supabase connection or data issue

**Solution:**

1. **Check browser console** (F12) for errors

2. **Verify Supabase connection:**
   - Open `/utils/supabase/info.tsx`
   - Check `projectId` and `publicAnonKey` are correct

3. **Check if data exists:**
   - Go to Supabase Dashboard
   - Open "Table Editor"
   - Look for `kv_store_3ada1a0a` table
   - Check if there are rows with key starting with `product:`

4. **Test API directly:**
   ```javascript
   // Open browser console on your site
   // Run this:
   fetch('https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-3ada1a0a/products', {
     headers: {
       'Authorization': 'Bearer YOUR-ANON-KEY'
     }
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

---

### ❌ Cart not working

**Symptom:** Can't add items to cart or cart doesn't persist

**Cause:** localStorage issue or cart context problem

**Solution:**

1. **Check localStorage:**
   ```javascript
   // Browser console
   console.log(localStorage.getItem('cart'))
   ```

2. **Clear and test:**
   ```javascript
   // Browser console
   localStorage.clear()
   // Refresh page and try adding to cart again
   ```

3. **Check browser privacy settings:**
   - Make sure localStorage is enabled
   - Not in incognito/private mode (or localStorage is allowed)

---

### ❌ Admin portal: "Invalid password"

**Symptom:** Can't login to admin with correct password

**Cause:** Password mismatch or context issue

**Solution:**

1. **Verify password:** `Akvv989898@@` (case-sensitive)

2. **Check AdminPasswordModal component:**
   ```typescript
   // Should have:
   const ADMIN_PASSWORD = "Akvv989898@@";
   ```

3. **Clear localStorage and try again:**
   ```javascript
   localStorage.removeItem('adminAuthenticated')
   ```

---

### ❌ Images not loading

**Symptom:** Product images show broken or don't load

**Cause:** Image import issue or Supabase storage

**Solution:**

1. **Check image source in browser:**
   - Right-click broken image → "Inspect"
   - Check `src` attribute
   - Should be base64 or Supabase Storage URL

2. **If base64 (starts with `data:image/`):**
   - Images are stored in database
   - Check if data is present in Supabase

3. **If Supabase Storage URL:**
   - Go to Supabase Dashboard → Storage
   - Check if bucket and files exist
   - Verify URLs are signed correctly

---

### ❌ Payment not working (Paytm)

**Symptom:** Paytm payment fails or doesn't redirect

**Cause:** Callback URL or Paytm configuration issue

**Solution:**

1. **Check Paytm environment variables in Supabase:**
   - Go to Supabase Dashboard → Edge Functions → Secrets
   - Verify these are set:
     - `PAYTM_MERCHANT_ID`
     - `PAYTM_MERCHANT_KEY`
     - `PAYTM_CALLBACK_URL`

2. **Verify callback URL:**
   ```
   Should be:
   https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-3ada1a0a/paytm/callback
   ```

3. **Check Paytm credentials:**
   - Make sure you're using test credentials for testing
   - Production credentials for live

---

## 📱 Browser Compatibility Issues

### ❌ Site not working on Safari

**Symptom:** Works on Chrome but not Safari

**Cause:** Safari has stricter security/compatibility

**Common Issues:**

1. **localStorage blocked:**
   - Safari blocks localStorage in some scenarios
   - Solution: Check "Prevent cross-site tracking" is not blocking

2. **fetch API:**
   - Should work on Safari 14+
   - Update Safari if using older version

---

### ❌ Site not working on mobile

**Symptom:** Works on desktop but not mobile

**Cause:** Responsive design or mobile browser issue

**Solution:**

1. **Check viewport:**
   - `index.html` should have:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```

2. **Test responsive:**
   - Open DevTools (F12)
   - Click "Toggle device toolbar"
   - Test different screen sizes

---

## 🔍 Debugging Tips

### Enable Verbose Logging

Add this to your code temporarily for debugging:

```javascript
// In /utils/api.ts, add more console logs:
console.log('API Call:', endpoint, options);
console.log('Response:', response);
```

### Check Network Requests

1. Open DevTools (F12)
2. Go to "Network" tab
3. Refresh page
4. Check all API calls:
   - Are they going to correct URL?
   - What's the response status? (200 = OK, 404 = Not found, 500 = Server error)
   - What's the response body?

### Check Local vs Production

**Test locally first:**
```bash
npm run build
npm run preview
# Test at http://localhost:4173
```

**If works locally but not in production:**
- Issue is likely with deployment config
- Check Vercel settings
- Verify environment variables

**If doesn't work locally:**
- Issue is in code
- Fix locally before redeploying

---

## 🆘 Emergency Fixes

### Nuclear Option: Full Rebuild

If nothing works, start fresh:

```bash
# 1. Clean everything
rm -rf node_modules dist package-lock.json
rm -rf .vercel

# 2. Fresh install
npm install

# 3. Test locally
npm run build
npm run preview

# 4. If local works, redeploy
vercel --prod
```

---

### Rollback to Previous Version

On Vercel:
1. Go to Deployments tab
2. Find a working previous deployment
3. Click "..." → "Promote to Production"

---

## 📞 Getting Help

### Before asking for help, gather this info:

1. **Error message** (exact text)
2. **Where it happens** (build, deployment, runtime)
3. **Browser console errors** (screenshot)
4. **Build logs** (from Vercel)
5. **What you tried** (list solutions attempted)

### Resources:

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

### Community:

- **Vercel Discord:** https://vercel.com/discord
- **Supabase Discord:** https://discord.supabase.com

---

## ✅ Quick Diagnostic Checklist

Run through this when something breaks:

- [ ] `npm install` completes without errors
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` works and site loads at localhost:4173
- [ ] No errors in browser console (F12)
- [ ] `/utils/supabase/info.tsx` has correct credentials
- [ ] Supabase is online and accessible
- [ ] `vercel.json` is present and correct
- [ ] All files are committed to Git (if using Git)
- [ ] Internet connection is stable

---

## 🎯 Most Common Issues (90% of problems)

1. **Missing `npm install`** → Run `npm install`
2. **Wrong Supabase credentials** → Check `/utils/supabase/info.tsx`
3. **Files not committed** → `git add . && git commit -m "fix"`
4. **Old build cached** → `rm -rf dist && npm run build`
5. **Browser cache** → Hard refresh (Ctrl+Shift+R)

---

**Still stuck?** Read the error message carefully - it usually tells you exactly what's wrong! 

**Remember:** If it works locally (`npm run preview`), it will work on Vercel!
