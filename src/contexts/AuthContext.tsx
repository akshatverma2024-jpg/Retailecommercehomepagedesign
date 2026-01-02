import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../utils/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  joinedDate: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  trackingNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  orders: Order[];
  addOrder: (order: Order) => void; // Add method to add orders
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Load all data from localStorage on initial render
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('urbanwear_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const savedAddresses = localStorage.getItem('urbanwear_addresses');
    return savedAddresses ? JSON.parse(savedAddresses) : [];
  });
  
  const [orders, setOrders] = useState<Order[]>(() => {
    // Load user-specific orders if user exists
    const savedUser = localStorage.getItem('urbanwear_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const userOrdersKey = `urbanwear_orders_${user.email}`;
      const savedOrders = localStorage.getItem(userOrdersKey);
      return savedOrders ? JSON.parse(savedOrders) : [];
    }
    return [];
  });
  
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const savedWishlist = localStorage.getItem('urbanwear_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // Load user data from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadUserData(user.email);
    }
  }, []);

  const loadUserData = async (email: string) => {
    try {
      const response = await api.fetchUserByEmail(email);
      if (response.success && response.user) {
        // Sync Supabase data with local state
        if (response.user.addresses) {
          setAddresses(response.user.addresses);
        }
        if (response.user.wishlist) {
          setWishlist(response.user.wishlist);
        }
      }
    } catch (error) {
      console.error('Error loading user data from Supabase:', error);
    }
  };

  // Save user to localStorage and Supabase whenever it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('urbanwear_user', JSON.stringify(user));
      } catch (error) {
        console.warn('Failed to save user to localStorage:', error);
      }
      // Save to Supabase
      saveUserToSupabase();
    } else {
      try {
        localStorage.removeItem('urbanwear_user');
      } catch (error) {
        console.warn('Failed to remove user from localStorage:', error);
      }
    }
  }, [user]);

  // Save addresses to localStorage and Supabase whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('urbanwear_addresses', JSON.stringify(addresses));
    } catch (error) {
      console.warn('Failed to save addresses to localStorage:', error);
    }
    if (user) {
      saveUserToSupabase();
    }
  }, [addresses]);

  // Save orders to localStorage whenever they change (user-specific)
  useEffect(() => {
    if (user) {
      try {
        const userOrdersKey = `urbanwear_orders_${user.email}`;
        localStorage.setItem(userOrdersKey, JSON.stringify(orders));
      } catch (error) {
        console.warn('Failed to save orders to localStorage:', error);
      }
    }
  }, [orders, user]);

  // Save wishlist to localStorage and Supabase whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('urbanwear_wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.warn('Failed to save wishlist to localStorage:', error);
    }
    if (user) {
      saveUserToSupabase();
    }
  }, [wishlist]);

  const saveUserToSupabase = async () => {
    if (!user) return;
    
    try {
      await api.saveUser({
        ...user,
        addresses,
        wishlist,
      });
    } catch (error) {
      console.error('Error saving user to Supabase:', error);
    }
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Try to fetch existing user from Supabase
      const response = await api.fetchUserByEmail(email);
      
      let loggedInUser: User;
      
      if (response.success && response.user) {
        // User exists in Supabase - load their data
        loggedInUser = response.user;
        
        // Load user-specific addresses
        if (response.user.addresses) {
          setAddresses(response.user.addresses);
        } else {
          setAddresses([]);
        }
        
        // Load user-specific wishlist
        if (response.user.wishlist) {
          setWishlist(response.user.wishlist);
        } else {
          setWishlist([]);
        }
        
        // Load user-specific orders from localStorage (user-specific key)
        try {
          const userOrdersKey = `urbanwear_orders_${email}`;
          const savedOrders = localStorage.getItem(userOrdersKey);
          if (savedOrders) {
            setOrders(JSON.parse(savedOrders));
          } else {
            setOrders([]);
          }
        } catch (error) {
          console.error('Error loading user orders:', error);
          setOrders([]);
        }
      } else {
        // User not found in Supabase - check localStorage for existing user
        const userOrdersKey = `urbanwear_orders_${email}`;
        const savedOrders = localStorage.getItem(userOrdersKey);
        
        // Create user object
        loggedInUser = {
          id: Date.now().toString(),
          email,
          firstName: '',
          lastName: '',
          phone: '',
          joinedDate: new Date().toISOString(),
        };
        
        // Load any existing localStorage data for this email
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        } else {
          setOrders([]);
        }
        
        setAddresses([]);
        setWishlist([]);
      }
      
      setUser(loggedInUser);
    } catch (error) {
      console.error('Error during login:', error);
      // Fallback to local-only login
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        firstName: '',
        lastName: '',
        phone: '',
        joinedDate: new Date().toISOString(),
      };
      setUser(mockUser);
      setOrders([]);
      setAddresses([]);
      setWishlist([]);
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists in Supabase
    try {
      const response = await api.fetchUserByEmail(email);
      if (response.success && response.user) {
        // User already exists
        throw new Error('An account with this email already exists. Please login instead.');
      }
    } catch (error: any) {
      // If error message indicates user exists, throw it
      if (error.message && error.message.includes('already exists')) {
        throw error;
      }
      // Otherwise continue with registration (Supabase might be down)
    }
    
    // Also check localStorage for existing user data
    const userOrdersKey = `urbanwear_orders_${email}`;
    const existingUserOrders = localStorage.getItem(userOrdersKey);
    const existingUser = localStorage.getItem('urbanwear_user');
    
    if (existingUser) {
      const parsedUser = JSON.parse(existingUser);
      if (parsedUser.email === email) {
        throw new Error('An account with this email already exists. Please login instead.');
      }
    }
    
    // Check if there's any order history for this email (indicates previous account)
    if (existingUserOrders) {
      throw new Error('An account with this email already exists. Please login instead.');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      firstName,
      lastName,
      phone: '',
      joinedDate: new Date().toISOString(),
    };
    
    // Clear all previous user data for the new account
    setAddresses([]);
    setOrders([]);
    setWishlist([]);
    
    // Clear localStorage
    localStorage.removeItem('urbanwear_addresses');
    localStorage.removeItem('urbanwear_orders');
    localStorage.removeItem('urbanwear_wishlist');
    
    setUser(newUser);
    
    try {
      // Save to Supabase
      await api.saveUser(newUser);
    } catch (error) {
      console.error('Error saving new user to Supabase:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setAddresses([]);
    setOrders([]);
    setWishlist([]);
    // Clear from localStorage
    localStorage.removeItem('urbanwear_user');
    localStorage.removeItem('urbanwear_addresses');
    localStorage.removeItem('urbanwear_orders');
    localStorage.removeItem('urbanwear_wishlist');
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
    };
    setAddresses(prev => [...prev, newAddress]);
  };

  const updateAddress = (id: string, addressData: Partial<Address>) => {
    setAddresses(prev =>
      prev.map(addr => (addr.id === id ? { ...addr, ...addressData } : addr))
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [...prev, order]);
  };

  const addToWishlist = (productId: string) => {
    setWishlist(prev => [...prev, productId]);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        orders,
        addOrder,
        wishlist,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}