import { useState } from 'react';
import { X, Check, AlertCircle, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

interface Notification {
  id: string;
  type: 'order' | 'stock' | 'revenue' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface AdminNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminNotifications({ isOpen, onClose }: AdminNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'New Order Received',
      message: 'Order #ORD-12345 has been placed',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'stock',
      title: 'Low Stock Alert',
      message: '3 products are running low on inventory',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'revenue',
      title: 'Revenue Milestone',
      message: 'You have reached ₹50,000 in sales today!',
      time: '2 hours ago',
      read: true
    },
    {
      id: '4',
      type: 'order',
      title: 'Order Delivered',
      message: 'Order #ORD-12340 has been delivered successfully',
      time: '3 hours ago',
      read: true
    },
    {
      id: '5',
      type: 'info',
      title: 'System Update',
      message: 'New features have been added to the admin panel',
      time: '1 day ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      case 'stock':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'revenue':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Notifications Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="w-full gap-2"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`text-sm ${!notification.read ? '' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-400">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
