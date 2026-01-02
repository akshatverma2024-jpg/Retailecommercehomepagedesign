import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  adminPasswordModalOpen: boolean;
  setAdminPasswordModalOpen: (open: boolean) => void;
  viewHomepage: boolean;
  setViewHomepage: (view: boolean) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'Akvv989898@@';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    // Load admin auth state from localStorage on initial render
    const savedAdminAuth = localStorage.getItem('urbanwear_admin_auth');
    return savedAdminAuth === 'true';
  });
  const [adminPasswordModalOpen, setAdminPasswordModalOpen] = useState(false);
  const [viewHomepage, setViewHomepage] = useState(false);

  // Save admin auth state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('urbanwear_admin_auth', isAdminAuthenticated.toString());
  }, [isAdminAuthenticated]);

  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('urbanwear_admin_auth');
  };

  return (
    <AdminAuthContext.Provider value={{ 
      isAdminAuthenticated, 
      adminLogin, 
      adminLogout,
      adminPasswordModalOpen,
      setAdminPasswordModalOpen,
      viewHomepage,
      setViewHomepage
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}