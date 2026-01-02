import { useState, useEffect } from 'react';
import { Homepage } from './components/Homepage';
import { Toaster } from './components/ui/sonner';
import { LoadingScreen } from './components/LoadingScreen';
import { DataMigration } from './components/DataMigration';
import { DataCleanup } from './components/DataCleanup';
import { ProductDebug } from './components/ProductDebug';
import { ProductProvider, useProducts } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { OrderProvider, useOrders } from './contexts/OrderContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

// Clean up old localStorage format on app startup
function cleanupOldStorage() {
  try {
    // Remove old product format that includes base64 images
    const oldProducts = localStorage.getItem('urbanwear_products');
    if (oldProducts) {
      const parsed = JSON.parse(oldProducts);
      // If it has base64 images (large data), remove it
      if (JSON.stringify(parsed).length > 100000) { // Over 100KB
        console.log('Removing old product format with embedded images');
        localStorage.removeItem('urbanwear_products');
      }
    }
    
    // Check overall localStorage usage and clean if needed
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    // If total size is over 4MB (close to 5MB limit), do aggressive cleanup
    if (totalSize > 4 * 1024 * 1024) {
      console.warn('localStorage nearly full, performing cleanup');
      localStorage.removeItem('urbanwear_products');
      // Keep only essential data
      const essentialKeys = ['urbanwear_products_meta', 'storeSettings', 'urbanwear_auth_user', 'adminAuthenticated'];
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && !essentialKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.warn('Error cleaning old storage, clearing old format:', error);
    // If there's any error (including QuotaExceeded), clear the old format
    try {
      localStorage.removeItem('urbanwear_products');
    } catch (e) {
      // If even removing fails, we're in a bad state - try clearing everything non-essential
      console.error('Critical storage error, attempting emergency cleanup');
      try {
        const essentialData: any = {};
        // Save essential data first
        try { essentialData.auth = localStorage.getItem('urbanwear_auth_user'); } catch {}
        try { essentialData.admin = localStorage.getItem('adminAuthenticated'); } catch {}
        try { essentialData.settings = localStorage.getItem('storeSettings'); } catch {}
        
        // Clear everything
        localStorage.clear();
        
        // Restore essential data
        if (essentialData.auth) localStorage.setItem('urbanwear_auth_user', essentialData.auth);
        if (essentialData.admin) localStorage.setItem('adminAuthenticated', essentialData.admin);
        if (essentialData.settings) localStorage.setItem('storeSettings', essentialData.settings);
      } catch (criticalError) {
        console.error('Emergency cleanup failed:', criticalError);
      }
    }
  }
}

function AppContent() {
  const { loading: productsLoading } = useProducts();
  const { loading: ordersLoading } = useOrders();
  const { loading: settingsLoading } = useSettings();

  // Show loading screen only briefly (max 2 seconds) or until critical data loads
  const [showLoading, setShowLoading] = useState(true);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  // Minimum loading time for smooth UX (500ms for animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Clean up old storage on mount
  useEffect(() => {
    cleanupOldStorage();
  }, []);

  // Hide loading screen as soon as settings load (settings are fast and required)
  // Products and orders can load in the background
  useEffect(() => {
    if (!settingsLoading && minLoadingComplete) {
      setShowLoading(false);
    }
  }, [settingsLoading, minLoadingComplete]);

  // Force hide loading after 2 seconds maximum to prevent hanging
  useEffect(() => {
    const maxLoadingTimer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);
    return () => clearTimeout(maxLoadingTimer);
  }, []);

  if (showLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Homepage />
      <Toaster position="top-right" />
      <DataMigration />
      <DataCleanup />
      <ProductDebug />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <AdminAuthProvider>
                <AppContent />
              </AdminAuthProvider>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}