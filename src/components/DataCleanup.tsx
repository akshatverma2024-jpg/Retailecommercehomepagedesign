import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-3ada1a0a`;

export function DataCleanup() {
  const [isCleanupMode, setIsCleanupMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCleanup = async () => {
    if (!confirm('⚠️ WARNING: This will delete ALL products from the database. This cannot be undone. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/products/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`✅ ${data.message}. Please refresh the page.`);
        
        // Clear all localStorage keys
        localStorage.removeItem('urbanwear_products');
        localStorage.removeItem('urbanwear_products_meta');
        
        // Reload page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error('Failed to cleanup: ' + data.error);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Network error during cleanup');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show if there's a data issue (check localStorage)
  const hasLocalData = localStorage.getItem('urbanwear_products');
  
  if (!hasLocalData) {
    return null;
  }

  return (
    <>
      {/* Floating cleanup button */}
      {!isCleanupMode && (
        <button
          onClick={() => setIsCleanupMode(true)}
          className="fixed bottom-4 right-4 z-50 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
          title="Database Cleanup Tool"
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
      )}

      {/* Cleanup modal */}
      {isCleanupMode && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Database Cleanup</h3>
                <p className="text-sm text-gray-600">Fix connection timeout errors</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-700">
                If you're experiencing "connection closed" errors, this is likely due to large images in the database.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800 font-medium mb-2">This will:</p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Delete all products from Supabase</li>
                  <li>Clear local storage</li>
                  <li>Allow you to start fresh with compressed images</li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-800 font-semibold">⚠️ Warning: This action cannot be undone!</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsCleanupMode(false)}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCleanup}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Cleaning...'
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clean Database
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}