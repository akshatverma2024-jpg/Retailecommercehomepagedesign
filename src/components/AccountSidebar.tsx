import { useState } from 'react';
import { X, User, Package, MapPin, Heart, LogOut, Mail, Phone, Calendar, Edit2, Plus, Trash2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useProducts } from '../contexts/ProductContext';
import { useOrders } from '../contexts/OrderContext';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner@2.0.3';

interface AccountSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'login' | 'register' | 'profile' | 'orders' | 'addresses' | 'wishlist';

export function AccountSidebar({ isOpen, onClose }: AccountSidebarProps) {
  const { user, isAuthenticated, login, register, logout, updateProfile, addresses, addAddress, deleteAddress, orders, wishlist, removeFromWishlist } = useAuth();
  const { products } = useProducts();
  const { orders: completedOrders } = useOrders();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filter orders to only show the current user's orders
  const userCompletedOrders = completedOrders.filter(order => 
    order.userEmail === user?.email || order.customerInfo?.email === user?.email
  );

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');

  // Profile edit state
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Address form state
  const [addressForm, setAddressForm] = useState({
    type: 'shipping' as 'shipping' | 'billing',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      setActiveTab('profile');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerEmail, registerPassword, registerFirstName, registerLastName);
      toast.success('Account created successfully!');
      setActiveTab('profile');
    } catch (error: any) {
      console.error('Registration error:', error);
      // Show specific error message if available
      const errorMessage = error?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    logout();
    setActiveTab('login');
    toast.success('Logged out successfully');
  };

  const handleUpdateProfile = () => {
    updateProfile({
      firstName: editFirstName,
      lastName: editLastName,
      phone: editPhone,
    });
    toast.success('Profile updated successfully');
  };

  const startEditing = () => {
    if (user) {
      setEditFirstName(user.firstName);
      setEditLastName(user.lastName);
      setEditPhone(user.phone);
    }
    setIsEditing(true);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(addressForm);
    setShowAddressForm(false);
    setAddressForm({
      type: 'shipping',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
      phone: '',
      isDefault: false,
    });
    toast.success('Address added successfully');
  };

  const handleDeleteAddress = (id: string) => {
    deleteAddress(id);
    toast.success('Address deleted');
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#0056D2]" />
            <h2 className="text-lg">
              {isAuthenticated ? 'My Account' : 'Login / Register'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (for authenticated users) */}
        {isAuthenticated && (
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'addresses'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-2" />
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'wishlist'
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Wishlist
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Login Form */}
          {!isAuthenticated && activeTab === 'login' && (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl mb-6">Login to Your Account</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#0056D2] hover:bg-[#003d9a] text-white">
                  Login
                </Button>
              </form>
              <p className="text-center mt-6 text-sm text-gray-600">
                Don't have an account?{' '}
                <button 
                  onClick={() => setActiveTab('register')}
                  className="text-[#0056D2] hover:underline"
                >
                  Register here
                </button>
              </p>
            </div>
          )}

          {/* Register Form */}
          {!isAuthenticated && activeTab === 'register' && (
            <div className="max-w-md mx-auto">
              <h3 className="text-xl mb-6">Create New Account</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-firstname">First Name</Label>
                    <Input
                      id="reg-firstname"
                      type="text"
                      value={registerFirstName}
                      onChange={(e) => setRegisterFirstName(e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-lastname">Last Name</Label>
                    <Input
                      id="reg-lastname"
                      type="text"
                      value={registerLastName}
                      onChange={(e) => setRegisterLastName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#0056D2] hover:bg-[#003d9a] text-white">
                  Create Account
                </Button>
              </form>
              <p className="text-center mt-6 text-sm text-gray-600">
                Already have an account?{' '}
                <button 
                  onClick={() => setActiveTab('login')}
                  className="text-[#0056D2] hover:underline"
                >
                  Login here
                </button>
              </p>
            </div>
          )}

          {/* Profile Tab */}
          {isAuthenticated && activeTab === 'profile' && user && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl">Profile Information</h3>
                {!isEditing ? (
                  <Button onClick={startEditing} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} size="sm" className="bg-[#0056D2] hover:bg-[#003d9a] text-white">
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>First Name</Label>
                      <Input
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p>{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p>{new Date(user.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button onClick={handleLogout} variant="outline" className="text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {isAuthenticated && activeTab === 'orders' && (
            <div>
              <h3 className="text-xl mb-6">Order History</h3>
              <div className="space-y-4">
                {[...orders, ...userCompletedOrders].map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Order {order.id}</p>
                        <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{order.items?.length || order.itemCount || 0} items</p>
                        {order.trackingNumber && (
                          <p className="text-xs text-gray-500">Tracking: {order.trackingNumber}</p>
                        )}
                      </div>
                      <p className="text-lg" style={{ fontWeight: 600 }}>{settings.currencySymbol}{order.total.toFixed(2)}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addresses Tab */}
          {isAuthenticated && activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl">Saved Addresses</h3>
                <Button 
                  onClick={() => setShowAddressForm(true)}
                  size="sm"
                  className="bg-[#0056D2] hover:bg-[#003d9a] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </Button>
              </div>

              {showAddressForm && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <h4 className="mb-4">Add New Address</h4>
                  <form onSubmit={handleAddAddress} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={addressForm.firstName}
                          onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={addressForm.lastName}
                          onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Street Address</Label>
                      <Input
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ZIP Code</Label>
                        <Input
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-[#0056D2] hover:bg-[#003d9a] text-white">
                        Save Address
                      </Button>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm uppercase text-gray-500">{address.type}</span>
                        {address.isDefault && (
                          <Badge className="bg-[#0056D2] text-white text-xs">Default</Badge>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <p>{address.firstName} {address.lastName}</p>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wishlist Tab */}
          {isAuthenticated && activeTab === 'wishlist' && (
            <div>
              <h3 className="text-xl mb-6">My Wishlist ({wishlistProducts.length})</h3>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Your wishlist is empty</p>
                  <p className="text-sm text-gray-500">Save items you love for later!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {wishlistProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="relative aspect-square bg-gray-100 rounded-md mb-3 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <h4 className="text-sm mb-1 line-clamp-1">{product.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                      <p className="text-sm" style={{ fontWeight: 600 }}>${product.price.toFixed(2)}</p>
                      <Button size="sm" className="w-full mt-2 bg-[#0056D2] hover:bg-[#003d9a] text-white">
                        Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}