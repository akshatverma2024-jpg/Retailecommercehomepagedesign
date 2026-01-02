import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { toast } from 'sonner@2.0.3';

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin } = useAdminAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = adminLogin(password);
    
    if (success) {
      toast.success('Login successful!');
    } else {
      toast.error('Invalid password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0056D2] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl mb-2">Admin Portal</h1>
          <p className="text-gray-600 text-sm">Urban Wear Retail</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="password">Admin Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#0056D2] hover:bg-[#003d9a] text-white"
            size="lg"
          >
            Login to Admin Portal
          </Button>
        </form>

        {/* Back to Store Link */}
        <div className="mt-6 text-center">
          <a 
            href="#/" 
            className="text-sm text-gray-600 hover:text-[#0056D2] hover:underline"
          >
            ← Back to Store
          </a>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            🔒 This is a secure admin area. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
