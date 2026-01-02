import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createHmac } from "node:crypto";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Global error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  }, 500);
});

// Health check endpoint
app.get("/make-server-3ada1a0a/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== PRODUCTS ENDPOINTS =====

// Get all products with pagination to prevent timeouts
app.get("/make-server-3ada1a0a/products", async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '1000'); // Default to 1000 to get all products
    const offset = parseInt(c.req.query('offset') || '0');
    const includeImages = c.req.query('includeImages') === 'true'; // Only include images if explicitly requested
    
    const allProducts = await kv.getByPrefix("product:");
    
    console.log(`Fetching products: total=${allProducts.length}, includeImages=${includeImages}, limit=${limit}, offset=${offset}`);
    
    // Sort by creation date (newest first)
    const sortedProducts = (allProducts || []).sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    // Paginate
    const paginatedProducts = sortedProducts.slice(offset, offset + limit);
    
    // CRITICAL: Exclude images by default to reduce response size by 10-100x
    // This prevents "connection closed before message completed" errors
    const optimizedProducts = paginatedProducts.map(product => {
      if (includeImages) {
        // Only include images if explicitly requested (e.g., for product detail pages)
        const images = (product.images || []).slice(0, 2);
        return {
          ...product,
          images: images,
          image: product.image || (images.length > 0 ? images[0] : '')
        };
      } else {
        // Default: exclude all base64 image data to prevent timeouts
        // Return only metadata that's needed for product listings
        return {
          id: product.id,
          brand: product.brand,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          sizes: product.sizes,
          colors: product.colors,
          sku: product.sku,
          barcode: product.barcode,
          totalStock: product.totalStock,
          createdAt: product.createdAt,
          // Flag to indicate images exist (but don't include the actual data)
          hasImages: (product.images || []).length > 0
        };
      }
    });
    
    console.log(`Returning ${optimizedProducts.length} products with images=${includeImages}`);
    
    return c.json({ 
      success: true, 
      products: optimizedProducts,
      total: sortedProducts.length,
      limit,
      offset,
      hasMore: offset + limit < sortedProducts.length
    }, 200);
  } catch (error) {
    console.error("Error fetching products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Add a new product
app.post("/make-server-3ada1a0a/products", async (c) => {
  try {
    const product = await c.req.json();
    
    // Validate product data
    if (!product || !product.id) {
      return c.json({ success: false, error: 'Invalid product data' }, 400);
    }
    
    await kv.set(`product:${product.id}`, product);
    
    return c.json({ success: true, product }, 200);
  } catch (error) {
    console.error("Error adding product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update a product
app.put("/make-server-3ada1a0a/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await c.req.json();
    await kv.set(`product:${id}`, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a product
app.delete("/make-server-3ada1a0a/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Clean up all products (admin utility)
app.post("/make-server-3ada1a0a/products/cleanup", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    
    // Delete all products
    for (const product of products || []) {
      await kv.del(`product:${product.id}`);
    }
    
    return c.json({ success: true, message: `Deleted ${products?.length || 0} products` });
  } catch (error) {
    console.error("Error cleaning up products:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== ORDERS ENDPOINTS =====

// Get all orders
app.get("/make-server-3ada1a0a/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    return c.json({ success: true, orders: orders || [] });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create a new order
app.post("/make-server-3ada1a0a/orders", async (c) => {
  try {
    const order = await c.req.json();
    await kv.set(`order:${order.id}`, order);
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update order status
app.put("/make-server-3ada1a0a/orders/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const order = await c.req.json();
    await kv.set(`order:${id}`, order);
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error updating order:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== SETTINGS ENDPOINTS =====

// Get settings
app.get("/make-server-3ada1a0a/settings", async (c) => {
  try {
    const settings = await kv.get("app:settings");
    return c.json({ success: true, settings: settings || {} });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update settings
app.post("/make-server-3ada1a0a/settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set("app:settings", settings);
    return c.json({ success: true, settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== USER ACCOUNTS ENDPOINTS =====

// Get all users
app.get("/make-server-3ada1a0a/users", async (c) => {
  try {
    const users = await kv.getByPrefix("user:");
    return c.json({ success: true, users: users || [] });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get user by email
app.get("/make-server-3ada1a0a/users/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const user = await kv.get(`user:${email}`);
    return c.json({ success: true, user: user || null });
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create or update user
app.post("/make-server-3ada1a0a/users", async (c) => {
  try {
    const user = await c.req.json();
    await kv.set(`user:${user.email}`, user);
    return c.json({ success: true, user });
  } catch (error) {
    console.error("Error saving user:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ===== PAYTM PAYMENT GATEWAY ENDPOINTS =====

// Helper function to generate Paytm checksum
function generatePaytmChecksum(params: any, merchantKey: string): string {
  // Sort parameters and create string
  const paramStr = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  // Generate HMAC SHA256 checksum
  const checksum = createHmac('sha256', merchantKey)
    .update(paramStr)
    .digest('hex');
  
  return checksum;
}

// Initiate Paytm payment - generates payment token
app.post("/make-server-3ada1a0a/paytm/initiate", async (c) => {
  try {
    const { orderId, amount, customerInfo } = await c.req.json();
    
    // Get Paytm credentials from environment
    const PAYTM_MID = Deno.env.get('PAYTM_MID') || 'YOUR_MERCHANT_ID';
    const PAYTM_MERCHANT_KEY = Deno.env.get('PAYTM_MERCHANT_KEY') || 'YOUR_MERCHANT_KEY';
    const PAYTM_WEBSITE = Deno.env.get('PAYTM_WEBSITE') || 'WEBSTAGING'; // WEBSTAGING for test, DEFAULT for production
    const PAYTM_INDUSTRY_TYPE = Deno.env.get('PAYTM_INDUSTRY_TYPE') || 'Retail';
    const PAYTM_CHANNEL_ID = Deno.env.get('PAYTM_CHANNEL_ID') || 'WEB';
    
    // Get callback URL from environment or use default
    const CALLBACK_URL = Deno.env.get('PAYTM_CALLBACK_URL') || `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-3ada1a0a/paytm/callback`;
    
    console.log('Initiating Paytm payment:', { orderId, amount, MID: PAYTM_MID });
    
    // Paytm payment parameters
    const paytmParams: any = {
      MID: PAYTM_MID,
      WEBSITE: PAYTM_WEBSITE,
      INDUSTRY_TYPE_ID: PAYTM_INDUSTRY_TYPE,
      CHANNEL_ID: PAYTM_CHANNEL_ID,
      ORDER_ID: orderId,
      CUST_ID: customerInfo.email,
      TXN_AMOUNT: amount.toString(),
      CALLBACK_URL: CALLBACK_URL,
      EMAIL: customerInfo.email,
      MOBILE_NO: customerInfo.phone || '9999999999',
    };
    
    // Generate checksum
    const checksum = generatePaytmChecksum(paytmParams, PAYTM_MERCHANT_KEY);
    paytmParams.CHECKSUMHASH = checksum;
    
    // Determine payment URL based on environment
    const isProduction = PAYTM_WEBSITE === 'DEFAULT';
    const paytmUrl = isProduction 
      ? 'https://securegw.paytm.in/order/process'
      : 'https://securegw-stage.paytm.in/order/process';
    
    console.log('Paytm payment initiated successfully:', { orderId, paytmUrl });
    
    return c.json({ 
      success: true, 
      paytmUrl,
      paytmParams,
      orderId 
    });
  } catch (error) {
    console.error("Error initiating Paytm payment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Paytm payment callback - verify payment status
app.post("/make-server-3ada1a0a/paytm/callback", async (c) => {
  try {
    const paytmResponse = await c.req.json();
    
    console.log('Paytm payment callback received:', paytmResponse);
    
    const PAYTM_MERCHANT_KEY = Deno.env.get('PAYTM_MERCHANT_KEY') || 'YOUR_MERCHANT_KEY';
    
    // Verify checksum
    const receivedChecksum = paytmResponse.CHECKSUMHASH;
    delete paytmResponse.CHECKSUMHASH;
    
    const calculatedChecksum = generatePaytmChecksum(paytmResponse, PAYTM_MERCHANT_KEY);
    
    if (receivedChecksum !== calculatedChecksum) {
      console.error('Checksum verification failed');
      return c.json({ success: false, error: 'Checksum verification failed' }, 400);
    }
    
    // Check payment status
    const isSuccess = paytmResponse.STATUS === 'TXN_SUCCESS';
    
    if (isSuccess) {
      console.log('Payment successful:', paytmResponse.ORDERID);
      
      // Store payment details
      await kv.set(`payment:${paytmResponse.ORDERID}`, {
        orderId: paytmResponse.ORDERID,
        transactionId: paytmResponse.TXNID,
        amount: paytmResponse.TXNAMOUNT,
        status: 'SUCCESS',
        paymentMode: paytmResponse.PAYMENTMODE,
        bankTxnId: paytmResponse.BANKTXNID,
        gatewayName: paytmResponse.GATEWAYNAME,
        timestamp: new Date().toISOString(),
        rawResponse: paytmResponse
      });
    }
    
    return c.json({ 
      success: isSuccess, 
      orderId: paytmResponse.ORDERID,
      transactionId: paytmResponse.TXNID,
      amount: paytmResponse.TXNAMOUNT,
      status: paytmResponse.STATUS,
      message: paytmResponse.RESPMSG
    });
  } catch (error) {
    console.error("Error processing Paytm callback:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Verify Paytm payment status - for manual verification
app.post("/make-server-3ada1a0a/paytm/verify", async (c) => {
  try {
    const { orderId } = await c.req.json();
    
    // Get stored payment details
    const payment = await kv.get(`payment:${orderId}`);
    
    if (!payment) {
      return c.json({ 
        success: false, 
        error: 'Payment not found',
        status: 'PENDING' 
      });
    }
    
    return c.json({ 
      success: true, 
      payment,
      status: payment.status 
    });
  } catch (error) {
    console.error("Error verifying Paytm payment:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Catch-all 404 handler - must be last
app.all("*", (c) => {
  return c.json({ 
    success: false, 
    error: "Not found",
    path: c.req.url 
  }, 404);
});

Deno.serve(app.fetch);