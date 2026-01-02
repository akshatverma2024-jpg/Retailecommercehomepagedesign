import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './ProductContext';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('urbanwear_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        // Convert light cart format back to full CartItem format
        return parsed.map((item: any) => ({
          product: {
            id: item.productId || item.product?.id,
            brand: item.brand || item.product?.brand,
            title: item.title || item.product?.title,
            price: item.price || item.product?.price,
            image: item.image || item.product?.image,
            originalPrice: item.originalPrice || item.product?.originalPrice,
            category: item.category || item.product?.category,
            sizes: item.sizes || item.product?.sizes || [],
            colors: item.colors || item.product?.colors || [],
            sku: item.sku || item.product?.sku,
            barcode: item.barcode || item.product?.barcode,
            totalStock: item.totalStock || item.product?.totalStock || 0,
            createdAt: item.createdAt || item.product?.createdAt || new Date().toISOString()
          },
          size: item.size,
          quantity: item.quantity
        })).filter((item: CartItem) => item.product && item.product.id); // Filter out invalid items
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        return [];
      }
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      // Store cart without full product images to save space
      const lightCart = cartItems.map(item => ({
        productId: item.product.id,
        brand: item.product.brand,
        title: item.product.title,
        price: item.product.price,
        image: item.product.image,
        size: item.size,
        quantity: item.quantity
      }));
      localStorage.setItem('urbanwear_cart', JSON.stringify(lightCart));
    } catch (error) {
      console.warn('Failed to save cart to localStorage:', error);
      // Cart will still work in memory, just won't persist
    }
  }, [cartItems]);

  const addToCart = (product: Product, size: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(
        item => item.product.id === product.id && item.size === size
      );

      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { product, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setCartItems(prev =>
      prev.filter(item => !(item.product.id === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => {
      // Add safety check to ensure product and price exist
      if (item?.product?.price && typeof item.product.price === 'number') {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    },
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}