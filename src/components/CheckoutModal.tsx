import { useState, useEffect } from 'react';
import { X, ChevronRight, MapPin, CreditCard, Package, CheckCircle2, Truck, Banknote, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrderContext';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CheckoutStep = 'auth' | 'shipping' | 'payment' | 'review' | 'confirmation';

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated, addresses, login, register } = useAuth();
  const { createOrder } = useOrders();
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('auth');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Reset to correct step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(isAuthenticated ? 'shipping' : 'auth');
      setCompletedOrder(null);
    }
  }, [isOpen, isAuthenticated]);

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'guest'>('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Shipping form state
  const [useExistingAddress, setUseExistingAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Use settings for shipping and tax calculations
  const shipping = cartTotal > settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const tax = cartTotal * (settings.taxRate / 100);
  const total = cartTotal + shipping + tax;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(authForm.email, authForm.password);
        setCurrentStep('shipping');
        toast.success('Logged in successfully!');
      } else if (authMode === 'signup') {
        await register(authForm.email, authForm.password, authForm.firstName, authForm.lastName);
        setCurrentStep('shipping');
        toast.success('Account created successfully!');
      } else {
        setCurrentStep('shipping');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      // Show specific error message if available
      const errorMessage = error?.message || 'Authentication failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Allow guest checkout - don't require authentication
    if (useExistingAddress && !selectedAddressId && addresses.length > 0) {
      toast.error('Please select a shipping address');
      return;
    }

    // Validate new address fields if entering new address
    if (!useExistingAddress || addresses.length === 0) {
      if (!shippingForm.firstName || !shippingForm.lastName || !shippingForm.street || 
          !shippingForm.city || !shippingForm.state || !shippingForm.zipCode || !shippingForm.phone) {
        toast.error('Please fill in all address fields');
        return;
      }
    }

    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    // Get the actual shipping address based on selection
    const shippingAddress = useExistingAddress 
      ? addresses.find(addr => addr.id === selectedAddressId) || shippingForm
      : shippingForm;

    const customerInfo = {
      name: user ? `${user.firstName} ${user.lastName}` : `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      email: user?.email || 'customer@example.com',
      phone: user?.phone || shippingAddress.phone,
    };

    // If Paytm payment is selected, initiate Paytm payment
    if (paymentMethod === 'paytm') {
      try {
        // Create order first
        const order = await createOrder(cartItems, shippingAddress, 'Paytm Payment - Pending', customerInfo);
        
        // Initiate Paytm payment
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-3ada1a0a/paytm/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            orderId: order.id,
            amount: total,
            customerInfo
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // Create a form and submit to Paytm
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = data.paytmUrl;
          
          // Add all Paytm parameters as hidden fields
          Object.keys(data.paytmParams).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.paytmParams[key];
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          toast.success('Redirecting to Paytm...');
          form.submit();
        } else {
          toast.error('Failed to initiate Paytm payment. Please try again.');
        }
      } catch (error) {
        console.error('Paytm payment error:', error);
        toast.error('Failed to initiate Paytm payment. Please try again.');
      }
      return;
    }

    // For COD and Card payments
    const paymentMethodText = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment';
    const order = await createOrder(cartItems, shippingAddress, paymentMethodText, customerInfo);
    setCompletedOrder(order);
    clearCart();
    setCurrentStep('confirmation');
    toast.success('Order placed successfully!');
  };

  const handleClose = () => {
    onClose();
    
    // If order was just completed, scroll to top to show homepage
    if (currentStep === 'confirmation') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    setTimeout(() => {
      setCurrentStep('auth');
      setCompletedOrder(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl">
                  {currentStep === 'confirmation' ? 'Order Confirmed' : 'Checkout'}
                </h2>
                <button 
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Steps */}
              {currentStep !== 'confirmation' && (
                <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 border-b border-gray-200">
                  <div className={`flex items-center gap-2 ${currentStep === 'auth' ? 'text-[#0056D2]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === 'auth' ? 'bg-[#0056D2] text-white' : 'bg-gray-200'
                    }`}>
                      1
                    </div>
                    <span className="text-sm">Auth</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className={`flex items-center gap-2 ${currentStep === 'shipping' ? 'text-[#0056D2]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === 'shipping' ? 'bg-[#0056D2] text-white' : 'bg-gray-200'
                    }`}>
                      2
                    </div>
                    <span className="text-sm">Shipping</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-[#0056D2]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === 'payment' ? 'bg-[#0056D2] text-white' : 'bg-gray-200'
                    }`}>
                      3
                    </div>
                    <span className="text-sm">Payment</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <div className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-[#0056D2]' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep === 'review' ? 'bg-[#0056D2] text-white' : 'bg-gray-200'
                    }`}>
                      4
                    </div>
                    <span className="text-sm">Review</span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Auth Step */}
                {currentStep === 'auth' && (
                  <form onSubmit={handleAuthSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg mb-4">Authentication</h3>
                      
                      <RadioGroup value={authMode} onValueChange={setAuthMode}>
                        <div className="space-y-3">
                          <label
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              authMode === 'login'
                                ? 'border-[#0056D2] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value="login" id="login" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Banknote className="w-5 h-5 text-green-600" />
                                  <span className="font-medium">Login</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Login to your account to proceed with checkout
                                </p>
                              </div>
                            </div>
                          </label>

                          <label
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              authMode === 'signup'
                                ? 'border-[#0056D2] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value="signup" id="signup" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CreditCard className="w-5 h-5 text-blue-600" />
                                  <span className="font-medium">Signup</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Create a new account to proceed with checkout
                                </p>
                              </div>
                            </div>
                          </label>

                          <label
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              authMode === 'guest'
                                ? 'border-[#0056D2] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value="guest" id="guest" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CreditCard className="w-5 h-5 text-blue-600" />
                                  <span className="font-medium">Checkout as Guest</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Proceed with checkout without creating an account
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </RadioGroup>

                      {authMode === 'login' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-green-800 mb-1" style={{ fontWeight: 600 }}>
                                Login Selected
                              </p>
                              <p className="text-sm text-green-700">
                                Please enter your login credentials to proceed.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {authMode === 'signup' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-green-800 mb-1" style={{ fontWeight: 600 }}>
                                Signup Selected
                              </p>
                              <p className="text-sm text-green-700">
                                Please enter your details to create a new account.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {authMode === 'guest' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-green-800 mb-1" style={{ fontWeight: 600 }}>
                                Guest Checkout Selected
                              </p>
                              <p className="text-sm text-green-700">
                                You can proceed with checkout without creating an account.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {authMode === 'login' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={authForm.email}
                              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={authForm.password}
                              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {authMode === 'signup' && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              value={authForm.email}
                              onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              value={authForm.password}
                              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={authForm.firstName}
                                onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={authForm.lastName}
                                onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              value={authForm.phone}
                              onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-[#0056D2] hover:bg-[#003d9a] text-white" size="lg">
                      Continue to Shipping
                    </Button>
                  </form>
                )}

                {/* Shipping Step */}
                {currentStep === 'shipping' && (
                  <form onSubmit={handleShippingSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg mb-4">Shipping Address</h3>
                      
                      {addresses.length > 0 && (
                        <div className="mb-6">
                          <RadioGroup value={useExistingAddress ? 'existing' : 'new'} onValueChange={(value) => setUseExistingAddress(value === 'existing')}>
                            <div className="flex items-center space-x-2 mb-4">
                              <RadioGroupItem value="existing" id="existing" />
                              <Label htmlFor="existing">Use existing address</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="new" id="new" />
                              <Label htmlFor="new">Use new address</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      {useExistingAddress && addresses.length > 0 ? (
                        <div className="space-y-3">
                          {addresses.map((address) => (
                            <label
                              key={address.id}
                              className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                selectedAddressId === address.id
                                  ? 'border-[#0056D2] bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="address"
                                value={address.id}
                                checked={selectedAddressId === address.id}
                                onChange={() => setSelectedAddressId(address.id)}
                                className="sr-only"
                              />
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p>{address.firstName} {address.lastName}</p>
                                  <p className="text-sm text-gray-600">{address.street}</p>
                                  <p className="text-sm text-gray-600">
                                    {address.city}, {address.state} {address.zipCode}
                                  </p>
                                  <p className="text-sm text-gray-600">{address.phone}</p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={shippingForm.firstName}
                                onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={shippingForm.lastName}
                                onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="street">Street Address</Label>
                            <Input
                              id="street"
                              value={shippingForm.street}
                              onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={shippingForm.city}
                                onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                value={shippingForm.state}
                                onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="zipCode">ZIP Code</Label>
                              <Input
                                id="zipCode"
                                value={shippingForm.zipCode}
                                onChange={(e) => setShippingForm({ ...shippingForm, zipCode: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={shippingForm.phone}
                                onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full bg-[#0056D2] hover:bg-[#003d9a] text-white" size="lg">
                      Continue to Payment
                    </Button>
                  </form>
                )}

                {/* Payment Step */}
                {currentStep === 'payment' && (
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-lg mb-4">Payment Method</h3>
                      
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="space-y-3">
                          <label
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              paymentMethod === 'cod'
                                ? 'border-[#0056D2] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value="cod" id="cod" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Banknote className="w-5 h-5 text-green-600" />
                                  <span className="font-medium">Cash on Delivery</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Pay with cash when your order is delivered to your doorstep
                                </p>
                              </div>
                            </div>
                          </label>

                          <label
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              paymentMethod === 'paytm'
                                ? 'border-[#0056D2] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value="paytm" id="paytm" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Smartphone className="w-5 h-5 text-[#002970]" />
                                  <span className="font-medium">Paytm</span>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">UPI, Cards, Wallets</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Pay securely with Paytm - UPI, Debit/Credit Card, Net Banking, Wallets
                                </p>
                              </div>
                            </div>
                          </label>

                          <label
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              paymentMethod === 'card'
                                ? 'border-[#0056D2] bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem value="card" id="card" className="mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <CreditCard className="w-5 h-5 text-blue-600" />
                                  <span className="font-medium">Credit/Debit Card</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Pay securely with your credit or debit card
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </RadioGroup>

                      {paymentMethod === 'cod' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-green-800 mb-1" style={{ fontWeight: 600 }}>
                                Cash on Delivery Selected
                              </p>
                              <p className="text-sm text-green-700">
                                You will pay {settings.currencySymbol}{total.toFixed(2)} in cash when your order is delivered. Please keep exact change ready.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'paytm' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-blue-800 mb-1" style={{ fontWeight: 600 }}>
                                Paytm Payment Selected
                              </p>
                              <p className="text-sm text-blue-700">
                                You will be redirected to Paytm's secure payment gateway to complete your payment of {settings.currencySymbol}{total.toFixed(2)}.
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">UPI</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Debit Card</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Credit Card</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Net Banking</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Paytm Wallet</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep('shipping')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 bg-[#0056D2] hover:bg-[#003d9a] text-white" size="lg">
                        Review Order
                      </Button>
                    </div>
                  </form>
                )}

                {/* Review Step */}
                {currentStep === 'review' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg mb-4">Order Summary</h3>
                      
                      {/* Items */}
                      <div className="space-y-3 mb-6">
                        {cartItems.filter(item => item?.product && item.product.id).map((item) => (
                          <div key={`${item.product.id}-${item.size}`} className="flex gap-4 p-3 border border-gray-200 rounded-lg">
                            <img 
                              src={item.product.image || ''} 
                              alt={item.product.title || 'Product'}
                              className="w-20 h-20 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h4 className="text-sm mb-1">{item.product.title}</h4>
                              <p className="text-xs text-gray-500">{item.product.brand}</p>
                              <p className="text-xs text-gray-600 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm" style={{ fontWeight: 600 }}>
                              {settings.currencySymbol}{((item.product.price || 0) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      <div className="mb-6">
                        <h4 className="text-sm mb-2 text-gray-700">Shipping Address</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          {useExistingAddress ? (
                            <>
                              {addresses.find(addr => addr.id === selectedAddressId) && (
                                <>
                                  <p className="text-sm">
                                    {addresses.find(addr => addr.id === selectedAddressId)?.firstName}{' '}
                                    {addresses.find(addr => addr.id === selectedAddressId)?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {addresses.find(addr => addr.id === selectedAddressId)?.street}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {addresses.find(addr => addr.id === selectedAddressId)?.city},{' '}
                                    {addresses.find(addr => addr.id === selectedAddressId)?.state}{' '}
                                    {addresses.find(addr => addr.id === selectedAddressId)?.zipCode}
                                  </p>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-sm">{shippingForm.firstName} {shippingForm.lastName}</p>
                              <p className="text-sm text-gray-600">{shippingForm.street}</p>
                              <p className="text-sm text-gray-600">
                                {shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="mb-6">
                        <h4 className="text-sm mb-2 text-gray-700">Payment Method</h4>
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center gap-3">
                          {paymentMethod === 'cod' ? (
                            <>
                              <Banknote className="w-5 h-5 text-green-600" />
                              <span className="text-sm">Cash on Delivery</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 text-blue-600" />
                              <span className="text-sm">Credit/Debit Card</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span>{settings.currencySymbol}{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span>{shipping === 0 ? 'FREE' : `${settings.currencySymbol}${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax ({settings.taxRate}%)</span>
                          <span>{settings.currencySymbol}{tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span style={{ fontWeight: 600 }}>Total</span>
                          <span className="text-xl text-[#0056D2]" style={{ fontWeight: 600 }}>
                            {settings.currencySymbol}{total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setCurrentStep('payment')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handlePlaceOrder}
                        className="flex-1 bg-[#0056D2] hover:bg-[#003d9a] text-white" 
                        size="lg"
                      >
                        Place Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Confirmation Step */}
                {currentStep === 'confirmation' && completedOrder && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    
                    <h3 className="text-2xl mb-2">Order Confirmed!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for your order. Your order has been placed successfully.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Order Number</span>
                        <span style={{ fontWeight: 600 }}>{completedOrder.id}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Order Date</span>
                        <span>{new Date(completedOrder.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <span className="flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-green-600" />
                          {completedOrder.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-xl text-[#0056D2]" style={{ fontWeight: 600 }}>
                          {settings.currencySymbol}{completedOrder.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto mb-6">
                      <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <p className="text-sm text-blue-800 mb-1" style={{ fontWeight: 600 }}>
                          Estimated Delivery
                        </p>
                        <p className="text-sm text-blue-700">
                          Your order will be delivered within 3-5 business days. You will receive a confirmation email shortly.
                        </p>
                      </div>
                    </div>

                    <Button 
                      onClick={handleClose}
                      className="bg-[#0056D2] hover:bg-[#003d9a] text-white"
                      size="lg"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}