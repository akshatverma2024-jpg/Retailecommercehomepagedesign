import { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

export function DataMigration() {
  const [hasMigrated, setHasMigrated] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showMigration, setShowMigration] = useState(false);

  useEffect(() => {
    // Check if there's local data that hasn't been migrated
    const migrated = localStorage.getItem('urbanwear_migrated_to_supabase');
    const hasLocalProducts = localStorage.getItem('urbanwear_products');
    const hasLocalOrders = localStorage.getItem('urbanwear_all_orders');
    const hasLocalSettings = localStorage.getItem('storeSettings');
    
    // Only show migration if:
    // 1. Not already migrated AND
    // 2. Has actual data (not empty arrays/objects)
    if (!migrated) {
      let hasActualData = false;
      
      if (hasLocalProducts) {
        const products = JSON.parse(hasLocalProducts);
        if (Array.isArray(products) && products.length > 0) {
          hasActualData = true;
        }
      }
      
      if (hasLocalOrders) {
        const orders = JSON.parse(hasLocalOrders);
        if (Array.isArray(orders) && orders.length > 0) {
          hasActualData = true;
        }
      }
      
      if (hasLocalSettings) {
        const settings = JSON.parse(hasLocalSettings);
        // Check if it has custom store name (not default)
        if (settings.storeName && settings.storeName !== 'Urban Wear Retail') {
          hasActualData = true;
        }
      }
      
      if (hasActualData) {
        setShowMigration(true);
      } else {
        // No actual data, just mark as migrated to not show again
        localStorage.setItem('urbanwear_migrated_to_supabase', 'true');
      }
    } else if (migrated) {
      setHasMigrated(true);
    }
  }, []);

  const migrateData = async () => {
    setIsMigrating(true);
    
    try {
      // Migrate products
      const productsData = localStorage.getItem('urbanwear_products');
      if (productsData) {
        const products = JSON.parse(productsData);
        for (const product of products) {
          await api.addProduct(product);
        }
      }

      // Migrate orders
      const ordersData = localStorage.getItem('urbanwear_all_orders');
      if (ordersData) {
        const orders = JSON.parse(ordersData);
        for (const order of orders) {
          await api.createOrder(order);
        }
      }

      // Migrate settings
      const settingsData = localStorage.getItem('storeSettings');
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        await api.saveSettings(settings);
      }

      // Mark as migrated
      localStorage.setItem('urbanwear_migrated_to_supabase', 'true');
      setHasMigrated(true);
      setShowMigration(false);
      toast.success('Data successfully migrated to cloud database!');
      
      // Reload to fetch from Supabase
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Failed to migrate data. Please try again.');
    } finally {
      setIsMigrating(false);
    }
  };

  const skipMigration = () => {
    localStorage.setItem('urbanwear_migrated_to_supabase', 'true');
    setShowMigration(false);
    toast.info('Migration skipped. You can start fresh with cloud sync.');
  };

  if (!showMigration) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Upload className="w-6 h-6 text-[#0056D2]" />
          </div>
          <div>
            <h3 className="text-xl mb-2">Migrate to Cloud Database</h3>
            <p className="text-sm text-gray-600">
              We've upgraded to cloud storage! Your data is currently stored only on this device. 
              Would you like to migrate it to the cloud so it's accessible from anywhere?
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#0056D2] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="mb-2"><strong>What will be migrated:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Products and inventory</li>
                <li>Orders and customer data</li>
                <li>Store settings (including store name)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={skipMigration}
            variant="outline"
            className="flex-1"
            disabled={isMigrating}
          >
            Skip for Now
          </Button>
          <Button
            onClick={migrateData}
            className="flex-1 bg-[#0056D2] hover:bg-[#003d9a] text-white"
            disabled={isMigrating}
          >
            {isMigrating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Migrating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Migrate Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}