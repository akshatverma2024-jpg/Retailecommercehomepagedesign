import { useState } from 'react';
import { Search, ShoppingCart, User, Heart, Shield, Phone, Mail, MapPin } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { useProducts, Product } from '../contexts/ProductContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { CartSidebar } from './CartSidebar';
import { AccountSidebar } from './AccountSidebar';
import { AdminPasswordModal } from './AdminPasswordModal';
import { AdminPortal } from './AdminPortal';
import { CheckoutModal } from './CheckoutModal';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useAuth();

  const isInWishlist = wishlist.includes(product.id);

  const handleAddToCart = (size: string) => {
    setSelectedSize(size);
    addToCart(product, size);
    toast.success('Added to cart!', {
      description: `${product.title} - Size ${size}`
    });
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    
    if (isInWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
      onMouseEnter={() => setShowSizePicker(true)}
      onMouseLeave={() => setShowSizePicker(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        )}
        <img 
          src={product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23f3f4f6" width="400" height="500"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="250" dx="50" text-anchor="start"%3ENo Image%3C/text%3E%3C/svg%3E'} 
          alt={product.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500"%3E%3Crect fill="%23f3f4f6" width="400" height="500"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="250" dx="120" text-anchor="start"%3ENo Image%3C/text%3E%3C/svg%3E';
            setImageLoaded(true);
          }}
        />
        <button 
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50" 
          onClick={handleToggleWishlist}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>
      
      <div className="p-3">
        <p className="text-xs text-gray-500 uppercase mb-1">{product.brand}</p>
        <h3 className="text-sm mb-2 line-clamp-2">{product.title}</h3>
        
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-red-600" style={{ fontSize: '16px', fontWeight: 600 }}>₹{product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <>
              <span className="text-gray-400 line-through" style={{ fontSize: '14px' }}>₹{product.originalPrice.toFixed(2)}</span>
              <span className="text-xs text-red-600">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>

        {/* Quick Add Size Picker */}
        <div 
          className={`transition-all duration-200 ${
            showSizePicker ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
          }`}
        >
          <p className="text-xs text-gray-600 mb-1.5">Quick Add:</p>
          <div className="flex gap-1.5 flex-wrap">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => handleAddToCart(size)}
                className="flex-1 min-w-[40px] py-1.5 text-xs border border-gray-300 rounded hover:bg-[#0056D2] hover:text-white hover:border-[#0056D2] transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {!showSizePicker && (
          <Button 
            className="w-full bg-[#0056D2] hover:bg-[#003d9a] text-white"
            size="sm"
          >
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}

export function Homepage() {
  const { products } = useProducts();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { isAdminAuthenticated, adminPasswordModalOpen, setAdminPasswordModalOpen, viewHomepage, setViewHomepage } = useAdminAuth();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([500, 10000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const categories = settings.categories || ['T-shirts', 'Jeans', 'Jackets'];
  const sizes = settings.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = settings.colors || ['Black', 'White', 'Blue', 'Red', 'Gray', 'Navy', 'Pink', 'Green'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesSize = selectedSizes.length === 0 || product.sizes.some(s => selectedSizes.includes(s));
    const matchesColor = selectedColors.length === 0 || product.colors.some(c => selectedColors.includes(c));
    return matchesCategory && matchesPrice && matchesSize && matchesColor;
  });

  const handleBackToAdmin = () => {
    setViewHomepage(false);
    toast.success('Returning to admin portal');
  };

  // If admin is authenticated, show admin portal instead of homepage
  if (isAdminAuthenticated && !viewHomepage) {
    return <AdminPortal />;
  }

  return (
    <div className="bg-white">
      {/* Admin View Indicator - Fixed button to go back to admin panel */}
      {isAdminAuthenticated && viewHomepage && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleBackToAdmin}
            className="bg-[#0056D2] hover:bg-[#003d9a] text-white shadow-lg gap-2"
            size="lg"
          >
            <Shield className="w-5 h-5" />
            <span>Back to Admin Portal</span>
          </Button>
        </div>
      )}
      
      {/* Flash Sale Banner */}
      <div className="bg-[#0056D2] text-white py-2.5 px-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-2 md:gap-3">
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 text-xs">FLASH SALE</Badge>
          <span className="text-xs md:text-sm text-center">Buy 2 Get 1 Free on All Items! Limited Time Only!</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
            {/* Logo */}
            <h1 className="text-lg md:text-xl lg:text-2xl text-[#0056D2] whitespace-nowrap" style={{ fontWeight: 700 }}>{settings.storeName}</h1>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 md:pl-10 pr-4 py-2 md:py-2.5 w-full border-2 border-gray-300 focus:border-[#0056D2] rounded-md text-sm"
              />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <button className="flex flex-col md:flex-row items-center gap-0 md:gap-2 text-gray-700 hover:text-[#0056D2] relative" onClick={() => setAccountOpen(true)}>
                <User className="w-5 h-5" />
                <span className="text-xs md:text-sm hidden sm:inline">Account</span>
                {isAuthenticated && (
                  <Badge className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-green-500 text-white px-1 md:px-1.5 py-0.5 text-xs">✓</Badge>
                )}
              </button>
              <button 
                onClick={() => setCartOpen(true)}
                className="flex flex-col md:flex-row items-center gap-0 md:gap-2 text-gray-700 hover:text-[#0056D2] relative"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-xs md:text-sm hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white px-1 md:px-1.5 py-0.5 text-xs">{cartCount}</Badge>
                )}
              </button>
              <button
                onClick={() => setAdminPasswordModalOpen(true)}
                className="hidden lg:flex items-center gap-2 text-gray-700 hover:text-[#0056D2] relative"
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm">Admin</span>
                {isAdminAuthenticated && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white px-1.5 py-0.5 text-xs">Admin</Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Filters Sidebar - Hidden on mobile, collapsible on tablet */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-4">
              <h3 className="text-lg mb-4">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm mb-3 text-gray-700">Category</h4>
                <div className="space-y-2.5">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-6">
                <h4 className="text-sm mb-3 text-gray-700">Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        if (selectedSizes.includes(size)) {
                          setSelectedSizes(selectedSizes.filter(s => s !== size));
                        } else {
                          setSelectedSizes([...selectedSizes, size]);
                        }
                      }}
                      className={`py-1.5 text-xs border rounded transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-[#0056D2] text-white border-[#0056D2]'
                          : 'border-gray-300 text-gray-700 hover:border-[#0056D2]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="mb-6">
                <h4 className="text-sm mb-3 text-gray-700">Color</h4>
                <div className="space-y-2.5">
                  {colors.map((color) => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedColors.includes(color)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedColors([...selectedColors, color]);
                          } else {
                            setSelectedColors(selectedColors.filter(c => c !== color));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-sm mb-3 text-gray-700">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={500}
                  max={10000}
                  step={500}
                  className="mb-3"
                />
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>₹{priceRange[0]}</span>
                  <span>₹{priceRange[1]}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedSizes([]);
                  setSelectedColors([]);
                  setPriceRange([500, 10000]);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} products
              </p>
              <select className="text-sm border border-gray-300 rounded-md px-3 py-2 w-full sm:w-auto">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </main>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        onCheckoutClick={() => setCheckoutOpen(true)}
      />
      {/* Account Sidebar */}
      <AccountSidebar isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
      {/* Admin Password Modal */}
      <AdminPasswordModal isOpen={adminPasswordModalOpen} onClose={() => setAdminPasswordModalOpen(false)} />
      {/* Checkout Modal */}
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-[1600px] mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-xl mb-4" style={{ fontWeight: 700 }}>{settings.storeName}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Your one-stop destination for premium fashion. Quality clothing at affordable prices with exceptional customer service.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm uppercase mb-4" style={{ fontWeight: 600 }}>Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Shop All</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">New Arrivals</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Sale</a></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-sm uppercase mb-4" style={{ fontWeight: 600 }}>Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Track Order</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping Info</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">FAQs</a></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm uppercase mb-4" style={{ fontWeight: 600 }}>Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-[#0056D2] flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">{settings.storePhone}</p>
                    <p className="text-gray-500 text-xs">Mon-Sat, 9AM-8PM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-[#0056D2] flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">{settings.storeEmail}</p>
                    <p className="text-gray-500 text-xs">24/7 Support</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#0056D2] flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm">{settings.storeAddress}</p>
                    <p className="text-gray-400 text-sm">{settings.storeCity}, {settings.storeState}</p>
                    <p className="text-gray-400 text-sm">India - {settings.storePincode}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 {settings.storeName}. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}