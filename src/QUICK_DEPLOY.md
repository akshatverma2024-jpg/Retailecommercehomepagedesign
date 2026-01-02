# ⚡ Quick Deploy Reference Card

## 🎯 Easiest Method (No Coding Required)

### 3 Simple Steps:

#### 1️⃣ Upload to GitHub
- Go to https://github.com/new
- Name: `urban-wear-retail`
- Drag & drop your project files
- Click "Commit"

#### 2️⃣ Deploy to Vercel  
- Go to https://vercel.com
- Sign up with GitHub
- Click "Import Project"
- Select `urban-wear-retail`
- Click "Deploy"

#### 3️⃣ Get Your URL
- Wait 2 minutes
- Get: `https://urban-wear-retail.vercel.app`
- **Done! 🎉**

---

## 💻 Terminal Method (For Developers)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## ✅ What You Get (FREE)

- ✅ Professional URL: `yourapp.vercel.app`
- ✅ HTTPS/SSL automatic
- ✅ Global CDN (fast worldwide)
- ✅ Auto-deployments
- ✅ All features work (cart, checkout, admin, payments)
- ✅ **Cost: ₹0**

---

## 🔗 Important URLs

After deployment:

| Service | URL |
|---------|-----|
| **Frontend** | `https://urban-wear-retail.vercel.app` |
| **Backend** | `https://your-project-id.supabase.co` (unchanged) |
| **Admin** | `https://urban-wear-retail.vercel.app/admin` |
| **Vercel Dashboard** | `https://vercel.com/dashboard` |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Run `npm install` first |
| Supabase not working | Check `/utils/supabase/info.tsx` |
| Admin not accessible | Go to `/admin`, password: `Akvv989898@@` |
| Payment issues | Check Paytm callback URL in Supabase |

---

## 📞 Need Help?

Read the full guide: `/VERCEL_DEPLOYMENT_GUIDE.md`

---

**🚀 Ready? Start with Step 1 above!**
