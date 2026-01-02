import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../utils/api';

export interface Product {
  id: string;
  brand: string;
  title: string;
  price: number;
  originalPrice: number | null;
  category: string;
  sizes: string[];
  colors: string[];
  image: string;
  images: string[];
  sku: string;
  barcode: string;
  totalStock: number;
  createdAt: string;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  refreshProducts: () => Promise<void>;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from Supabase on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Loading products from Supabase with images...');
      const response = await api.fetchProducts(true); // Include images for homepage display
      console.log('Products API response:', response);
      
      if (response.success) {
        const validProducts = (response.products || []).map((product: any) => {
          // Ensure all image fields are valid
          const validImage = product.image && typeof product.image === 'string' && product.image.length > 0;
          const validImages = Array.isArray(product.images) ? product.images.filter((img: any) => img && typeof img === 'string' && img.length > 0) : [];
          
          return {
            ...product,
            image: validImage ? product.image : '',
            images: validImages,
          };
        });
        
        console.log(`Loaded ${validProducts.length} products from Supabase`);
        setProducts(validProducts);
        
        // Store only product metadata (no images) in localStorage to avoid quota issues
        const lightProducts = validProducts.map((p: Product) => ({
          id: p.id,
          brand: p.brand,
          title: p.title,
          price: p.price,
          originalPrice: p.originalPrice,
          category: p.category,
          sizes: p.sizes,
          colors: p.colors,
          sku: p.sku,
          barcode: p.barcode,
          totalStock: p.totalStock,
          createdAt: p.createdAt,
          // Store only image references, not full base64 data
          hasImages: (p.images || []).length > 0
        }));
        
        try {
          localStorage.setItem('urbanwear_products_meta', JSON.stringify(lightProducts));
        } catch (storageError) {
          console.warn('localStorage quota exceeded, clearing old data');
          localStorage.removeItem('urbanwear_products'); // Remove old format
          localStorage.removeItem('urbanwear_products_meta');
          // Don't fail, just continue without localStorage
        }
      } else {
        // API returned but not successful - try localStorage
        console.warn('API response not successful, falling back to localStorage');
        const savedMeta = localStorage.getItem('urbanwear_products_meta');
        if (savedMeta) {
          const parsed = JSON.parse(savedMeta);
          const productsFromMeta = parsed.map((p: any) => ({
            ...p,
            image: '',
            images: []
          }));
          setProducts(productsFromMeta);
        } else {
          setProducts([]);
        }
      }
    } catch (error) {
      console.error('Error loading products from Supabase:', error);
      // Fallback to localStorage metadata if server fails
      try {
        const savedMeta = localStorage.getItem('urbanwear_products_meta');
        if (savedMeta) {
          const parsed = JSON.parse(savedMeta);
          // Use metadata with placeholder images
          const productsFromMeta = parsed.map((p: any) => ({
            ...p,
            image: '',
            images: []
          }));
          setProducts(productsFromMeta);
        } else {
          // No localStorage either, set empty array so app can load
          console.warn('No products available, starting with empty array');
          setProducts([]);
        }
      } catch (parseError) {
        console.error('Error parsing localStorage products:', parseError);
        // Clear all corrupted data
        localStorage.removeItem('urbanwear_products');
        localStorage.removeItem('urbanwear_products_meta');
        setProducts([]);
      }
    } finally {
      // ALWAYS set loading to false so app can render, even if everything fails
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    
    console.log('Adding product:', newProduct.title, 'ID:', newProduct.id);
    
    try {
      // Save to Supabase
      const response = await api.addProduct(newProduct);
      console.log('Add product API response:', response);
      
      if (response.success) {
        console.log('Product saved to server successfully');
        setProducts(prev => {
          const updatedProducts = [newProduct, ...prev];
          console.log(`Products updated in state. Total: ${updatedProducts.length}`);
          
          // Save only metadata to localStorage (no images)
          const lightProducts = updatedProducts.map((p: Product) => ({
            id: p.id,
            brand: p.brand,
            title: p.title,
            price: p.price,
            originalPrice: p.originalPrice,
            category: p.category,
            sizes: p.sizes,
            colors: p.colors,
            sku: p.sku,
            barcode: p.barcode,
            totalStock: p.totalStock,
            createdAt: p.createdAt,
            hasImages: (p.images || []).length > 0
          }));
          
          try {
            localStorage.setItem('urbanwear_products_meta', JSON.stringify(lightProducts));
          } catch (storageError) {
            console.warn('localStorage quota exceeded during add, skipping cache');
          }
          
          return updatedProducts;
        });
      } else {
        console.error('Server returned unsuccessful response:', response);
      }
    } catch (error) {
      console.error('Error adding product to Supabase:', error);
      // Still add to state, but don't save to localStorage to avoid quota issues
      setProducts(prev => [newProduct, ...prev]);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Delete from Supabase
      const response = await api.deleteProduct(id);
      if (response.success) {
        const updatedProducts = products.filter(product => product.id !== id);
        setProducts(updatedProducts);
        
        // Update localStorage with metadata only (no images)
        const lightProducts = updatedProducts.map((p: Product) => ({
          id: p.id,
          brand: p.brand,
          title: p.title,
          price: p.price,
          originalPrice: p.originalPrice,
          category: p.category,
          sizes: p.sizes,
          colors: p.colors,
          sku: p.sku,
          barcode: p.barcode,
          totalStock: p.totalStock,
          createdAt: p.createdAt,
          hasImages: (p.images || []).length > 0
        }));
        
        try {
          localStorage.setItem('urbanwear_products_meta', JSON.stringify(lightProducts));
          // Clean up old format if it exists
          localStorage.removeItem('urbanwear_products');
        } catch (storageError) {
          console.warn('localStorage quota exceeded during delete, skipping cache');
        }
      }
    } catch (error) {
      console.error('Error deleting product from Supabase:', error);
      // Still delete from state
      const updatedProducts = products.filter(product => product.id !== id);
      setProducts(updatedProducts);
      
      // Try to update localStorage, but don't fail if quota exceeded
      try {
        const lightProducts = updatedProducts.map((p: Product) => ({
          id: p.id,
          brand: p.brand,
          title: p.title,
          price: p.price,
          originalPrice: p.originalPrice,
          category: p.category,
          sizes: p.sizes,
          colors: p.colors,
          sku: p.sku,
          barcode: p.barcode,
          totalStock: p.totalStock,
          createdAt: p.createdAt,
          hasImages: (p.images || []).length > 0
        }));
        localStorage.setItem('urbanwear_products_meta', JSON.stringify(lightProducts));
        localStorage.removeItem('urbanwear_products');
      } catch (storageError) {
        console.warn('localStorage quota exceeded, skipping cache update');
      }
    }
  };

  const refreshProducts = async () => {
    await loadProducts();
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, deleteProduct, refreshProducts, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}