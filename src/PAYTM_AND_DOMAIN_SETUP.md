# Paytm Payment Gateway & Custom Domain Setup Guide

## 🎉 Paytm Integration Complete!

Your e-commerce system now supports **Paytm Payment Gateway** with full integration for:
- ✅ UPI Payments
- ✅ Credit/Debit Cards
- ✅ Net Banking
- ✅ Paytm Wallet
- ✅ All major payment methods supported by Paytm

---

## 📱 Part 1: Paytm Payment Gateway Configuration

### Step 1: Get Paytm Merchant Credentials

1. **Sign up for Paytm Business Account**
   - Visit: https://business.paytm.com/
   - Sign up or login to your Paytm Business account
   - Complete KYC verification

2. **Get Your Credentials**
   After approval, you'll receive:
   - **Merchant ID (MID)**: Your unique merchant identifier
   - **Merchant Key**: Secret key for checksum generation
   - **Website Name**: `WEBSTAGING` for testing, `DEFAULT` for production

### Step 2: Configure Environment Variables

In your Supabase project dashboard:

1. Go to **Project Settings** → **Edge Functions** → **Secrets**
2. Add the following environment variables:

```
PAYTM_MID=YOUR_MERCHANT_ID_HERE
PAYTM_MERCHANT_KEY=YOUR_MERCHANT_KEY_HERE
PAYTM_WEBSITE=WEBSTAGING
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_CHANNEL_ID=WEB
```

### Step 3: Update for Production

When going live, update these values:

```
PAYTM_WEBSITE=DEFAULT
```

And update your callback URL to your production domain.

---

## 🌐 Part 2: Custom Domain Setup

### Method 1: Using Supabase Custom Domain (Recommended)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Navigate to **Settings** → **Custom Domains**

2. **Add Your Domain**
   - Click "Add custom domain"
   - Enter your domain name (e.g., `yourstore.com`)
   - Follow the DNS configuration instructions

3. **Configure DNS Records**
   In your domain registrar (GoDaddy, Namecheap, etc.):
   
   Add these DNS records:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: [PROVIDED_BY_SUPABASE]
   TTL: 3600
   ```

4. **SSL Certificate**
   - Supabase automatically provisions SSL certificates
   - Your site will be accessible via `https://yourstore.com`

### Method 2: Using Cloudflare (Advanced)

1. **Add Site to Cloudflare**
   - Go to https://dash.cloudflare.com/
   - Click "Add a Site"
   - Enter your domain name
   - Follow nameserver update instructions

2. **Update Nameservers at Your Registrar**
   - Copy the nameservers provided by Cloudflare
   - Update them in your domain registrar's settings

3. **Configure DNS in Cloudflare**
   ```
   Type: CNAME
   Name: @
   Content: YOUR_SUPABASE_PROJECT_URL.supabase.co
   Proxy status: Proxied (Orange cloud)
   ```

4. **Enable SSL/TLS**
   - Go to SSL/TLS → Overview
   - Set encryption mode to "Full (strict)"

5. **Page Rules (Optional)**
   - Always Use HTTPS
   - Cache settings
   - Security settings

---

## 🔄 Part 3: Testing Paytm Integration

### Test Mode (Staging)

Use these test credentials provided by Paytm:

**Test Card Details:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date
OTP: 489871
```

**Test UPI:**
```
UPI ID: success@paytm
```

### Testing Flow:

1. Add products to cart
2. Proceed to checkout
3. Select "Paytm" payment method
4. Review order and click "Place Order"
5. You'll be redirected to Paytm's payment page
6. Complete test payment
7. You'll be redirected back to your site

---

## 📋 Part 4: Payment Status Tracking

### Check Payment Status

Payments are tracked in your Supabase database with:
- Order ID
- Transaction ID
- Payment Status
- Amount
- Payment Mode
- Timestamp

### View in Admin Portal

1. Login to Admin Portal (password: `Akvv989898@@`)
2. Go to **Orders** tab
3. View all orders with payment status
4. Filter by payment method

---

## 🚀 Part 5: Going Live Checklist

### Before Production:

- [ ] Complete Paytm KYC verification
- [ ] Get production Merchant ID and Key
- [ ] Update `PAYTM_WEBSITE` to `DEFAULT`
- [ ] Configure custom domain with SSL
- [ ] Test all payment methods
- [ ] Set up webhook for payment notifications
- [ ] Configure email notifications for orders
- [ ] Test order fulfillment workflow
- [ ] Set up backup payment gateway (optional)

### Security Checklist:

- [ ] SSL certificate is active (HTTPS)
- [ ] Admin portal password is secure
- [ ] Database access is restricted
- [ ] API keys are stored in environment variables
- [ ] Paytm webhook endpoint is secured
- [ ] Payment logs are monitored

---

## 🛠️ Part 6: Troubleshooting

### Issue: "Checksum verification failed"
**Solution:** Ensure your Merchant Key is correct and matches your Merchant ID.

### Issue: "Payment gateway not responding"
**Solution:** 
1. Check if `PAYTM_WEBSITE` matches your environment (WEBSTAGING/DEFAULT)
2. Verify your server can access Paytm's API
3. Check server logs for detailed error messages

### Issue: "Domain not accessible"
**Solution:**
1. Verify DNS records have propagated (use https://dnschecker.org/)
2. Wait 24-48 hours for full DNS propagation
3. Clear browser cache and try incognito mode

### Issue: "SSL certificate error"
**Solution:**
1. Ensure custom domain is properly configured in Supabase
2. Wait for SSL certificate provisioning (can take up to 24 hours)
3. Force HTTPS in your domain settings

---

## 📞 Support Resources

### Paytm Support:
- Documentation: https://developer.paytm.com/docs/
- Support Email: support@paytm.com
- Phone: 1800-1800-1234

### Supabase Support:
- Documentation: https://supabase.com/docs
- Community: https://github.com/supabase/supabase/discussions
- Support: https://supabase.com/support

### Your Domain Registrar:
- GoDaddy: https://www.godaddy.com/help
- Namecheap: https://www.namecheap.com/support
- Cloudflare: https://support.cloudflare.com/

---

## 🎯 Quick Start Summary

1. **Get Paytm Credentials** → Add to Supabase Environment Variables
2. **Buy Domain** → Configure DNS to point to Supabase
3. **Wait for Propagation** → Usually 24-48 hours
4. **Test Payment Flow** → Use test credentials first
5. **Go Live** → Switch to production credentials

---

## 📊 Current Payment Methods Available

| Method | Status | Description |
|--------|--------|-------------|
| Cash on Delivery | ✅ Active | Pay when delivered |
| Paytm | ✅ Active | UPI, Cards, Wallets, Net Banking |
| Credit/Debit Card | ⚠️ Placeholder | Needs gateway integration |

---

## 💡 Tips for Success

1. **Start with Test Mode**: Always test Paytm in WEBSTAGING mode first
2. **Monitor Transactions**: Regularly check your Paytm dashboard for payment status
3. **Keep Backups**: Backup your environment variables securely
4. **Update Regularly**: Keep your Paytm SDK and credentials updated
5. **Customer Support**: Have a clear refund and support policy

---

## 🔐 Security Best Practices

1. Never commit Paytm credentials to version control
2. Use environment variables for all sensitive data
3. Enable 2FA on your Paytm Business account
4. Regularly rotate your Merchant Key
5. Monitor for suspicious transactions
6. Implement rate limiting on payment endpoints
7. Log all payment attempts for audit trail

---

**Need Help?** If you encounter any issues during setup, refer to the troubleshooting section or contact support.

**Last Updated:** January 2, 2026
