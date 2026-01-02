# Urban Wear Retail - E-commerce Platform

A comprehensive retail e-commerce system built with React, Tailwind CSS, and Supabase.

## 🚀 Features

### Customer Portal
- ✅ Clean homepage with flash sale banner
- ✅ 4-column product grid with hover-based size pickers
- ✅ Comprehensive sidebar filters (category, size, color, price)
- ✅ Shopping cart with real-time updates
- ✅ Complete checkout system
- ✅ Payment integration (Cash on Delivery + Paytm)
- ✅ User authentication & account management
- ✅ Order tracking & history
- ✅ Wishlist functionality

### Admin Portal (Password: Akvv989898@@)
- ✅ Live inventory tracking
- ✅ Order processing & management
- ✅ Returns management
- ✅ Product uploader with drag-and-drop
- ✅ Size/color inventory matrix
- ✅ Password protection

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (Database, Auth, Edge Functions)
- **Payment:** Paytm Payment Gateway
- **Currency:** Indian Rupees (₹)
- **Storage:** localStorage + Supabase (cross-device sync)

## 📦 Deployment

### Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **For production:**
   ```bash
   vercel --prod
   ```

### Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect settings
5. Click "Deploy"

## 🔧 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🌐 Architecture

```
Frontend (Vercel)
    ↓
Supabase Backend
    ├── Database (PostgreSQL)
    ├── Authentication
    ├── Edge Functions (API)
    └── Storage
```

## 📝 Environment Variables

Your Supabase credentials are already configured in `/utils/supabase/info.tsx`.

No additional environment variables needed for deployment!

## 🔐 Admin Access

- **URL:** `/admin`
- **Password:** `Akvv989898@@`

## 💳 Payment Gateway

- **Cash on Delivery:** Available for all orders
- **Paytm:** Integrated with secure callback handling

## 📱 Responsive Design

Fully responsive across:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔄 Data Persistence

- **Local:** localStorage for offline capability
- **Cloud:** Supabase for cross-device synchronization
- **Per-user isolation:** Each user's data stored separately

## 📞 Support

For issues or questions, refer to the documentation files:
- `SUPABASE_INTEGRATION.md` - Backend integration details
- `PAYTM_AND_DOMAIN_SETUP.md` - Payment & domain setup
- `CRITICAL_ERRORS_FIXED.md` - Bug fixes log

---

**Built with ❤️ for Urban Wear Retail**
