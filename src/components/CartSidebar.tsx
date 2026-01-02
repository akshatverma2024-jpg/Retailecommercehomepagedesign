import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckoutClick: () => void;
}

export function CartSidebar({ isOpen, onClose, onCheckoutClick }: CartSidebarProps) {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { settings } = useSettings();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0056D2]" />
            <h2 className="text-lg">Shopping Cart ({cartCount})</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg text-gray-600 mb-2">Your cart is empty</h3>
              <p className="text-sm text-gray-500">Add some products to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.filter(item => item?.product && item.product.id).map((item) => (
                <div 
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-4 bg-white border border-gray-200 rounded-lg p-3"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={item.product.image || ''} 
                      alt={item.product.title || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm mb-1 line-clamp-1">{item.product.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.product.brand}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600">Size: {item.size}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 border border-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm">{settings.currencySymbol}{((item.product.price || 0) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.size)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-xl" style={{ fontWeight: 600 }}>{settings.currencySymbol}{cartTotal.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full bg-[#0056D2] hover:bg-[#003d9a] text-white"
                size="lg"
                onClick={() => {
                  onCheckoutClick();
                  onClose();
                }}
              >
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}