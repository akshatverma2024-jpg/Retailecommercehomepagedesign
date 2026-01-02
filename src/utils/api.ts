import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3ada1a0a`;
const REQUEST_TIMEOUT = 15000; // 15 seconds - reduced for faster failure
const MAX_RETRIES = 1; // Reduced to 1 retry for faster response

// Helper function to delay between retries
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to make API calls with timeout and retry logic
async function apiCall(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = 'API request failed';
      try {
        const error = await response.json();
        errorMsg = error.error || error.message || errorMsg;
      } catch (e) {
        errorMsg = `${response.status}: ${response.statusText}`;
      }
      console.error(`API Error at ${endpoint}:`, errorMsg);
      
      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(errorMsg);
      }
      
      // Retry on server errors (5xx) for GET requests
      if (retryCount < MAX_RETRIES && (!options.method || options.method === 'GET')) {
        console.log(`Server error, retrying ${endpoint} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(1000 * (retryCount + 1));
        return apiCall(endpoint, options, retryCount + 1);
      }
      
      throw new Error(errorMsg);
    }

    // Parse JSON response with error handling
    try {
      return await response.json();
    } catch (jsonError) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, jsonError);
      
      // Retry on parse errors for GET requests
      if (retryCount < MAX_RETRIES && (!options.method || options.method === 'GET')) {
        console.log(`JSON parse error, retrying ${endpoint} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(1000 * (retryCount + 1));
        return apiCall(endpoint, options, retryCount + 1);
      }
      
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Request timeout at ${endpoint}`);
      
      // Retry on timeout for GET requests only
      if (retryCount < MAX_RETRIES && (!options.method || options.method === 'GET')) {
        console.log(`Retrying ${endpoint} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(1000 * (retryCount + 1)); // Exponential backoff
        return apiCall(endpoint, options, retryCount + 1);
      }
      
      throw new Error('Request timed out. Please try again.');
    }
    
    // Handle connection errors (including "connection closed" errors)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Connection error at ${endpoint}:`, error);
      
      // Retry on connection errors for GET requests
      if (retryCount < MAX_RETRIES && (!options.method || options.method === 'GET')) {
        console.log(`Connection error, retrying ${endpoint} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await delay(1000 * (retryCount + 1));
        return apiCall(endpoint, options, retryCount + 1);
      }
      
      throw new Error('Connection failed. Please check your internet connection.');
    }
    
    // Retry on other network errors for GET requests
    if (retryCount < MAX_RETRIES && (!options.method || options.method === 'GET')) {
      console.log(`Network error, retrying ${endpoint} (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      await delay(1000 * (retryCount + 1)); // Exponential backoff
      return apiCall(endpoint, options, retryCount + 1);
    }
    
    console.error(`Network error calling ${endpoint}:`, error);
    throw error;
  }
}

// ===== PRODUCTS API =====

export async function fetchProducts(includeImages = false) {
  const params = includeImages ? '?includeImages=true' : '';
  return apiCall(`/products${params}`);
}

export async function addProduct(product: any) {
  return apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id: string, product: any) {
  return apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id: string) {
  return apiCall(`/products/${id}`, {
    method: 'DELETE',
  });
}

// ===== ORDERS API =====

export async function fetchOrders() {
  return apiCall('/orders');
}

export async function createOrder(order: any) {
  return apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
}

export async function updateOrder(id: string, order: any) {
  return apiCall(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  });
}

// ===== SETTINGS API =====

export async function fetchSettings() {
  return apiCall('/settings');
}

export async function saveSettings(settings: any) {
  return apiCall('/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

// ===== USERS API =====

export async function fetchUsers() {
  return apiCall('/users');
}

export async function fetchUserByEmail(email: string) {
  return apiCall(`/users/${encodeURIComponent(email)}`);
}

export async function saveUser(user: any) {
  return apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}