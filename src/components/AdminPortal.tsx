import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Lock,
  Shield,
  ChevronDown,
  ChevronRight,
  X,
  Home
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { useSettings } from '../contexts/SettingsContext';
import { ProductUploader } from './ProductUploader';
import { AdminNotifications } from './AdminNotifications';
import { toast } from 'sonner@2.0.3';
import React from 'react';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'analytics' | 'settings';

export function AdminPortal() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { adminLogout, setViewHomepage } = useAdminAuth();
  const { products, deleteProduct } = useProducts();
  const { orders } = useOrders();
  const { settings, updateSettings } = useSettings();

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out successfully');
  };

  const handleViewHomepage = () => {
    setViewHomepage(true);
    toast.success('Viewing homepage as customer');
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProduct(productId);
      toast.success('Product deleted successfully!');
    }
  };

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const lowStockProducts = products.filter(p => p.totalStock < 10).length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `${settings.currencySymbol}${totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: orders.length.toString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      change: '-3.1%',
      trend: 'down',
      icon: Clock,
      color: 'bg-orange-500'
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts.toString(),
      change: '+5.4%',
      trend: 'up',
      icon: AlertCircle,
      color: 'bg-red-500'
    }
  ];

  const navItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as AdminTab, label: 'Products', icon: Package },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag },
    { id: 'customers' as AdminTab, label: 'Customers', icon: Users },
    { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0056D2] rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm">Urban Wear</h1>
              <p className="text-xs text-gray-500">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#0056D2] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleViewHomepage}
              variant="outline"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden md:inline">View Homepage</span>
            </Button>
            <button 
              className="relative p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setNotificationsOpen(true)}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-[#0056D2] rounded-full flex items-center justify-center">
                <span className="text-white text-sm">A</span>
              </div>
              <div>
                <p className="text-sm">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8">
          {activeTab === 'dashboard' && <DashboardContent stats={stats} />}
          {activeTab === 'products' && <ProductsContent />}
          {activeTab === 'orders' && <OrdersContent />}
          {activeTab === 'customers' && <CustomersContent />}
          {activeTab === 'analytics' && <AnalyticsContent />}
          {activeTab === 'settings' && <SettingsContent />}
        </main>
      </div>

      {/* Notifications Panel */}
      <AdminNotifications 
        isOpen={notificationsOpen} 
        onClose={() => setNotificationsOpen(false)} 
      />
    </div>
  );
}

function DashboardContent({ stats }: { stats: any[] }) {
  const { orders } = useOrders();
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl mb-1">Dashboard Overview</h2>
        <p className="text-gray-600 text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Order ID</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Customer</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Items</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Total</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Status</th>
                <th className="text-left px-6 py-3 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm">{order.customerInfo?.name || 'Guest'}</td>
                  <td className="px-6 py-4 text-sm">{order.items.length} items</td>
                  <td className="px-6 py-4 text-sm">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#0056D2] hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const { products, deleteProduct } = useProducts();
  const [showUploader, setShowUploader] = useState(false);

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Are you sure you want to delete "${productName}"?`)) {
      deleteProduct(productId);
      toast.success('Product deleted successfully!');
    }
  };

  if (showUploader) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Add New Product</h2>
          <Button
            variant="outline"
            onClick={() => setShowUploader(false)}
          >
            ← Back to Products
          </Button>
        </div>
        <ProductUploader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Products</h2>
          <p className="text-gray-600 text-sm">Manage your product inventory</p>
        </div>
        <Button
          onClick={() => setShowUploader(true)}
          className="bg-[#0056D2] hover:bg-[#003d9a] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          className="max-w-xs"
        />
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100">
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteProduct(product.id, product.title)}
                  className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2">
                <Badge className="text-xs">{product.category}</Badge>
              </div>
              <h3 className="text-sm mb-2">{product.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg text-[#0056D2]">${product.price}</span>
                <span className="text-sm text-gray-500">
                  Stock: {product.totalStock}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersContent() {
  const { orders, updateOrderStatus } = useOrders();
  const { settings } = useSettings();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const handleStatusChange = (orderId: string, newStatus: any) => {
    updateOrderStatus(orderId, newStatus);
    toast.success('Order status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Orders</h2>
          <p className="text-gray-600 text-sm">Manage and process customer orders</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterStatus === status
                ? 'bg-[#0056D2] text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-gray-600"></th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Order ID</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Date</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Phone</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Items</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Total</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Payment</th>
                <th className="text-left px-6 py-4 text-sm text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {expandedOrder === order.id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">#{order.id.slice(-8)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm">{new Date(order.createdAt || order.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt || order.date).toLocaleTimeString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm">{order.customerInfo?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.customerInfo?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.customerInfo?.phone || order.shippingAddress?.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm">{settings.currencySymbol}{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                  
                  {/* Expanded Details Row */}
                  {expandedOrder === order.id && (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-6">
                          {/* Order Items */}
                          <div>
                            <h4 className="text-sm mb-3">Order Items</h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                  <img 
                                    src={item.image} 
                                    alt={item.title}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm">{item.title}</p>
                                    <p className="text-xs text-gray-500">{item.brand}</p>
                                    <p className="text-xs text-gray-600 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                                  </div>
                                  <p className="text-sm">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping & Payment Details */}
                          <div className="space-y-4">
                            {/* Shipping Address */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="text-sm mb-2">Shipping Address</h4>
                              <div className="text-sm text-gray-700 space-y-1">
                                <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                                <p>{order.shippingAddress?.street}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
                                <p>{order.shippingAddress?.country || 'N/A'}</p>
                                <p className="text-gray-600 mt-2">Phone: {order.shippingAddress?.phone}</p>
                              </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="text-sm mb-2">Price Breakdown</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal</span>
                                  <span>{settings.currencySymbol}{order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Shipping</span>
                                  <span>{order.shipping === 0 ? 'FREE' : `${settings.currencySymbol}${order.shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tax</span>
                                  <span>{settings.currencySymbol}{order.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                  <span>Total</span>
                                  <span className="text-[#0056D2]">{settings.currencySymbol}{order.total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="text-sm mb-2">Payment Method</h4>
                              <p className="text-sm text-gray-700">{order.paymentMethod}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomersContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Customers</h2>
        <p className="text-gray-600 text-sm">Manage customer relationships</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Customer management coming soon</p>
      </div>
    </div>
  );
}

function AnalyticsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Analytics</h2>
        <p className="text-gray-600 text-sm">Track your business performance</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Analytics dashboard coming soon</p>
      </div>
    </div>
  );
}

function SettingsContent() {
  const { settings, updateSettings } = useSettings();
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail || '');
  const [storePhone, setStorePhone] = useState(settings.storePhone || '');
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress || '');
  const [storeCity, setStoreCity] = useState(settings.storeCity || '');
  const [storeState, setStoreState] = useState(settings.storeState || '');
  const [storePincode, setStorePincode] = useState(settings.storePincode || '');
  const [currency, setCurrency] = useState(settings.currency || 'INR');
  const [taxRate, setTaxRate] = useState(settings.taxRate?.toString() || '18');
  const [shippingFee, setShippingFee] = useState(settings.shippingFee?.toString() || '50');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings.freeShippingThreshold?.toString() || '999');
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.lowStockThreshold?.toString() || '10');
  
  // Categories and Filters
  const [categories, setCategories] = useState<string[]>(settings.categories || []);
  const [newCategory, setNewCategory] = useState('');
  const [sizes, setSizes] = useState<string[]>(settings.sizes || []);
  const [newSize, setNewSize] = useState('');
  const [colors, setColors] = useState<string[]>(settings.colors || []);
  const [newColor, setNewColor] = useState('');
  const [priceRangeMin, setPriceRangeMin] = useState(settings.priceRangeMin?.toString() || '500');
  const [priceRangeMax, setPriceRangeMax] = useState(settings.priceRangeMax?.toString() || '10000');

  const handleSaveSettings = () => {
    const newSettings = {
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      storeCity,
      storeState,
      storePincode,
      currency: currency as any,
      taxRate: parseFloat(taxRate) || 18,
      shippingFee: parseFloat(shippingFee) || 50,
      freeShippingThreshold: parseFloat(freeShippingThreshold) || 999,
      lowStockThreshold: parseInt(lowStockThreshold) || 10,
      categories,
      sizes,
      colors,
      priceRangeMin: parseFloat(priceRangeMin) || 500,
      priceRangeMax: parseFloat(priceRangeMax) || 10000
    };
    updateSettings(newSettings);
    toast.success('Settings saved and synced to cloud! ☁️');
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleAddSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes([...sizes, newSize.trim()]);
      setNewSize('');
    }
  };

  const handleRemoveSize = (size: string) => {
    setSizes(sizes.filter(s => s !== size));
  };

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor('');
    }
  };

  const handleRemoveColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1">Settings</h2>
        <p className="text-gray-600 text-sm">Configure your store settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Store Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Store Name</label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter store name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Contact Email</label>
              <Input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                placeholder="Enter contact email"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Phone Number</label>
              <Input
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Store Address</label>
              <Input
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Enter store address"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">City</label>
              <Input
                value={storeCity}
                onChange={(e) => setStoreCity(e.target.value)}
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">State</label>
              <Input
                value={storeState}
                onChange={(e) => setStoreState(e.target.value)}
                placeholder="Enter state"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Pincode</label>
              <Input
                value={storePincode}
                onChange={(e) => setStorePincode(e.target.value)}
                placeholder="Enter pincode"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Currency & Tax Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Tax Rate (%)</label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Enter tax rate"
              />
              <p className="text-xs text-gray-500 mt-1">GST/Tax percentage applied to orders</p>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Shipping Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Shipping Fee (₹)</label>
              <Input
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                placeholder="Enter shipping fee"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Free Shipping Threshold (₹)</label>
              <Input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                placeholder="Enter minimum amount for free shipping"
              />
              <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Inventory Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Low Stock Alert Threshold</label>
              <Input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder="Enter low stock threshold"
              />
              <p className="text-xs text-gray-500 mt-1">Get alerted when stock falls below this number</p>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm">Auto-reorder notifications</p>
                  <p className="text-xs text-gray-500">Get notified for low stock items</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">New Order Alerts</p>
                <p className="text-xs text-gray-500">Get notified of new orders</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Low Stock Alerts</p>
                <p className="text-xs text-gray-500">Get notified when items are low</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Daily Sales Report</p>
                <p className="text-xs text-gray-500">Receive daily sales summary</p>
              </div>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Security</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Lock className="w-4 h-4" />
              Change Admin Password
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Shield className="w-4 h-4" />
              Two-Factor Authentication
            </Button>
          </div>
        </div>

        {/* Product Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Product Filters</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    className="bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200 flex items-center gap-1"
                    onClick={() => handleRemoveCategory(category)}
                  >
                    {category}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  className="w-full"
                />
                <Button
                  onClick={handleAddCategory}
                  className="bg-[#0056D2] hover:bg-[#003d9a] text-white"
                >
                  Add
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Sizes</label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Badge
                    key={size}
                    className="bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200 flex items-center gap-1"
                    onClick={() => handleRemoveSize(size)}
                  >
                    {size}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  placeholder="Add new size"
                  className="w-full"
                />
                <Button
                  onClick={handleAddSize}
                  className="bg-[#0056D2] hover:bg-[#003d9a] text-white"
                >
                  Add
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Colors</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Badge
                    key={color}
                    className="bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200 flex items-center gap-1"
                    onClick={() => handleRemoveColor(color)}
                  >
                    {color}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add new color"
                  className="w-full"
                />
                <Button
                  onClick={handleAddColor}
                  className="bg-[#0056D2] hover:bg-[#003d9a] text-white"
                >
                  Add
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={priceRangeMin}
                  onChange={(e) => setPriceRangeMin(e.target.value)}
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  value={priceRangeMax}
                  onChange={(e) => setPriceRangeMax(e.target.value)}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">
          Cancel
        </Button>
        <Button 
          onClick={handleSaveSettings}
          className="bg-[#0056D2] hover:bg-[#003d9a] text-white"
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}