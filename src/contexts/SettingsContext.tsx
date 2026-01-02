import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../utils/api';

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storePincode: string;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  notifications: {
    newOrders: boolean;
    lowStock: boolean;
    dailySales: boolean;
  };
  categories: string[];
  sizes: string[];
  colors: string[];
  priceRangeMin: number;
  priceRangeMax: number;
}

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  getCurrencySymbol: () => string;
  formatPrice: (price: number) => string;
  loading: boolean;
}

const defaultSettings: StoreSettings = {
  storeName: 'Urban Wear Retail',
  storeEmail: 'contact@urbanwear.com',
  storePhone: '+91 98765 43210',
  storeAddress: '123 Fashion Street',
  storeCity: 'Mumbai',
  storeState: 'Maharashtra',
  storePincode: '400001',
  currency: 'INR',
  currencySymbol: '₹',
  taxRate: 18,
  shippingFee: 50,
  freeShippingThreshold: 999,
  lowStockThreshold: 10,
  notifications: {
    newOrders: true,
    lowStock: true,
    dailySales: true
  },
  categories: ['T-shirts', 'Jeans', 'Jackets', 'Shoes', 'Accessories'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Black', 'White', 'Blue', 'Red', 'Gray', 'Navy', 'Pink', 'Green'],
  priceRangeMin: 500,
  priceRangeMax: 10000
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from Supabase on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.fetchSettings();
      if (response.success && response.settings && Object.keys(response.settings).length > 0) {
        setSettings({ ...defaultSettings, ...response.settings });
      } else {
        // API returned but no data - try localStorage
        const saved = localStorage.getItem('storeSettings');
        if (saved) {
          setSettings(JSON.parse(saved));
        } else {
          setSettings(defaultSettings);
        }
      }
    } catch (error) {
      console.error('Error loading settings from Supabase:', error);
      // Fallback to localStorage if server fails
      try {
        const saved = localStorage.getItem('storeSettings');
        if (saved) {
          setSettings(JSON.parse(saved));
        } else {
          setSettings(defaultSettings);
        }
      } catch (parseError) {
        console.error('Error parsing localStorage settings:', parseError);
        setSettings(defaultSettings);
      }
    } finally {
      // ALWAYS set loading to false so app can render
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    
    // Update currency symbol based on currency
    if (newSettings.currency) {
      const symbols = {
        INR: '₹',
        USD: '$',
        EUR: '€',
        GBP: '£'
      };
      updated.currencySymbol = symbols[newSettings.currency];
    }

    setSettings(updated);

    try {
      // Save to Supabase
      await api.saveSettings(updated);
      // Also save to localStorage as backup
      localStorage.setItem('storeSettings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving settings to Supabase:', error);
      // Save to localStorage anyway
      localStorage.setItem('storeSettings', JSON.stringify(updated));
    }
  };

  const getCurrencySymbol = () => settings.currencySymbol;

  const formatPrice = (price: number) => {
    return `${settings.currencySymbol}${price.toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, getCurrencySymbol, formatPrice, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}