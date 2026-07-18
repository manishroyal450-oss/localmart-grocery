import React from 'react';
import { Mail, Lock, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Clear state when opened/closed
  React.useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setError(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields.');
      return;
    }

    // Exact required credentials matching
    if (trimmedEmail === 'manishroyal450@gmail.com' && trimmedPassword === 'Ashu@#12_') {
      onLoginSuccess();
      onClose();
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" id="admin-login-modal">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col text-gray-800 animate-in fade-in zoom-in-95 duration-150 border border-gray-200">
        
        {/* Flipkart Blue Header */}
        <div className="bg-[#2874f0] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-yellow-400" />
            <span className="font-bold text-base tracking-wide">Admin Control Access</span>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff9f00] hover:bg-orange-600 text-white font-extrabold text-[11px] rounded-lg transition-all shadow-md"
            id="close-login-btn"
          >
            <span>Close ❌</span>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-gray-900">Sign in to Store Console</h3>
            <p className="text-xs text-gray-500">Authorized personnel only. Please verify your administrator credentials below.</p>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded flex items-center gap-2 animate-pulse" id="login-error-banner">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="admin@example.com"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="login-email-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Security Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-sm font-extrabold text-white bg-[#fb641b] hover:bg-[#e15310] rounded shadow transition"
              id="login-submit-btn"
            >
              LOG IN
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
