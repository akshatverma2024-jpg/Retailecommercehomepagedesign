import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from './CartContext';
import * as api from '../utils/api';

export interface OrderItem {
  productId: string;
  title: string;
  brand: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  createdAt?: string;
  userEmail?: string; // Add user email to associate orders with users
}

interface OrderContextType {
  orders: OrderDetails[];
  createOrder: (items: CartItem[], shippingAddress: any, paymentMethod: string, customerInfo?: any) => Promise<OrderDetails>;
  getOrder: (orderId: string) => OrderDetails | undefined;
  updateOrderStatus: (orderId: string, status: OrderDetails['status']) => void;
  loading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders from Supabase on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.fetchOrders();
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        // API returned but not successful - try localStorage
        const savedOrders = localStorage.getItem('urbanwear_all_orders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          setOrders([]);
        }
      }
    } catch (error) {
      console.error('Error loading orders from Supabase:', error);
      // Fallback to localStorage if server fails
      try {
        const savedOrders = localStorage.getItem('urbanwear_all_orders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          setOrders([]);
        }
      } catch (parseError) {
        console.error('Error parsing localStorage orders:', parseError);
        setOrders([]);
      }
    } finally {
      // ALWAYS set loading to false so app can render
      setLoading(false);
    }
  };

  const createOrder = async (items: CartItem[], shippingAddress: any, paymentMethod: string, customerInfo?: any): Promise<OrderDetails> => {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 100 ? 0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax

    const orderItems: OrderItem[] = items.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      brand: item.product.brand,
      image: item.product.image,
      size: item.size,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const newOrder: OrderDetails = {
      id: `ORD-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'pending',
      items: orderItems,
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      shippingAddress,
      paymentMethod,
      customerInfo,
      createdAt: new Date().toISOString(),
      userEmail: customerInfo?.email, // Add user email to associate orders with users
    };

    try {
      // Save to Supabase
      const response = await api.createOrder(newOrder);
      if (response.success) {
        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        // Also save to localStorage as backup
        try {
          localStorage.setItem('urbanwear_all_orders', JSON.stringify(updatedOrders));
        } catch (storageError) {
          console.warn('Failed to save orders to localStorage:', storageError);
        }
      }
    } catch (error) {
      console.error('Error creating order in Supabase:', error);
      // Fallback to localStorage only
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      try {
        localStorage.setItem('urbanwear_all_orders', JSON.stringify(updatedOrders));
      } catch (storageError) {
        console.warn('Failed to save orders to localStorage:', storageError);
      }
    }

    return newOrder;
  };

  const getOrder = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const updateOrderStatus = async (orderId: string, status: OrderDetails['status']) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    
    setOrders(updatedOrders);

    try {
      // Update in Supabase
      const orderToUpdate = updatedOrders.find(o => o.id === orderId);
      if (orderToUpdate) {
        await api.updateOrder(orderId, orderToUpdate);
      }
      // Also update localStorage as backup
      try {
        localStorage.setItem('urbanwear_all_orders', JSON.stringify(updatedOrders));
      } catch (storageError) {
        console.warn('Failed to save orders to localStorage:', storageError);
      }
    } catch (error) {
      console.error('Error updating order status in Supabase:', error);
      // Update localStorage anyway
      try {
        localStorage.setItem('urbanwear_all_orders', JSON.stringify(updatedOrders));
      } catch (storageError) {
        console.warn('Failed to save orders to localStorage:', storageError);
      }
    }
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, getOrder, updateOrderStatus, loading }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}