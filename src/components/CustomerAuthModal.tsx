import React from 'react';
import { Mail, Lock, X, User, Phone, MapPin, Building2, Map, ArrowLeft, Eye, EyeOff, ShieldCheck, MailCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Customer } from '../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (customer: Customer) => void;
  initialMode?: 'login' | 'signup';
}

export default function CustomerAuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signup' }: CustomerAuthModalProps) {
  const [mode, setMode] = React.useState<'login' | 'signup' | 'verify'>(initialMode);
  
  // Signup State
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [shippingAddress, setShippingAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  
  // UI & Auth States
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  // Verification Code State
  const [sentOtp, setSentOtp] = React.useState('');
  const [userOtp, setUserOtp] = React.useState('');
  const [showOtpBanner, setShowOtpBanner] = React.useState(false);

  // Sync mode with initialMode prop when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setFullName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setShippingAddress('');
      setCity('');
      setPincode('');
      setUserOtp('');
      setShowOtpBanner(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Form Validation
  const validateSignup = () => {
    if (!fullName.trim()) return 'Full Name is required';
    if (!email.trim() || !email.includes('@')) return 'Enter a valid email address';
    if (password.length < 4) return 'Password must be at least 4 characters';
    if (!phone.trim() || phone.trim().length < 10) return 'Enter a valid 10-digit phone number';
    if (!shippingAddress.trim()) return 'Shipping address is required';
    if (!city.trim()) return 'City is required';
    if (!pincode.trim() || pincode.trim().length !== 6) return 'Enter a valid 6-digit Pincode';
    return null;
  };

  // Step 1: Handle Initial Signup Submit -> Generates Verification Code (Localized)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validationError = validateSignup();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Check if email already exists locally
      const savedCustomersStr = localStorage.getItem('localmart_grocery_customers') || '[]';
      const savedCustomers: Customer[] = JSON.parse(savedCustomersStr);
      
      const emailExists = savedCustomers.some(
        (c: Customer) => c.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (emailExists) {
        throw new Error('An account with this email address already exists.');
      }

      // Generate a secure 4-digit code and transition to code verification mode
      const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
      setSentOtp(generatedCode);
      setMode('verify');
      setShowOtpBanner(true);
    } catch (err: any) {
      setError(err.message || 'Error initializing account registration.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Code Verification & Final Account Creation (Localized)
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (userOtp.trim() !== sentOtp) {
      setError('Invalid 4-digit verification code. Please check the code and try again.');
      return;
    }

    setLoading(true);
    try {
      const savedCustomersStr = localStorage.getItem('localmart_grocery_customers') || '[]';
      const savedCustomers: Customer[] = JSON.parse(savedCustomersStr);

      const newCustomer: Customer = {
        id: 'cust-' + Date.now(),
        fullName: fullName.trim(),
        email: email.trim(),
        password: password, // Store password locally for mock logins
        phone: phone.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      // Add to our local list and save to localStorage
      savedCustomers.push(newCustomer);
      localStorage.setItem('localmart_grocery_customers', JSON.stringify(savedCustomers));

      // Success
      onAuthSuccess(newCustomer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error finalizing account creation.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Log In Submit (Localized)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const savedCustomersStr = localStorage.getItem('localmart_grocery_customers') || '[]';
      const savedCustomers: Customer[] = JSON.parse(savedCustomersStr);

      // Check credentials
      const foundCustomer = savedCustomers.find(
        (c: Customer) => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
      );

      if (!foundCustomer) {
        throw new Error('Invalid email or password credentials.');
      }

      // Success
      onAuthSuccess(foundCustomer);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 py-8 overflow-y-auto" id="customer-auth-modal">
      <div className="w-full max-w-xl bg-[#111315] border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col text-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Dark Header with Back & Close */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#151719]">
          <button 
            type="button"
            onClick={() => {
              if (mode === 'verify') {
                setMode('signup');
                setError(null);
              } else if (mode === 'login') {
                setMode('signup');
                setError(null);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition"
            id="auth-back-btn"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back ❌</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="font-extrabold text-xs md:text-sm tracking-widest uppercase text-gray-200">
              {mode === 'login' ? 'SIGN IN TO YOUR ACCOUNT' : "CREATE BARI' MART ACCOUNT"}
            </span>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full transition"
            id="auth-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Simulated Email Verification Code Top Alert Box */}
        {showOtpBanner && mode === 'verify' && (
          <div className="bg-gradient-to-r from-indigo-950 to-emerald-950 border-b border-indigo-500/30 px-6 py-3 flex items-center justify-between text-xs animate-in slide-in-from-top duration-300" id="otp-alert-banner">
            <div className="flex items-center gap-2">
              <MailCheck className="h-4 w-4 text-emerald-400 animate-bounce" />
              <p className="text-gray-200">
                <span className="font-bold text-emerald-400">📧 Simulated Verification Email:</span> Your OTP verification code is <strong className="text-yellow-400 font-mono text-sm tracking-widest px-1.5 py-0.5 bg-black/40 rounded border border-yellow-500/30">{sentOtp}</strong>
              </p>
            </div>
            <button 
              onClick={() => {
                setUserOtp(sentOtp);
              }}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded transition"
            >
              Auto-Fill
            </button>
          </div>
        )}

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Section Titles */}
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {mode === 'signup' && 'Create Account'}
              {mode === 'verify' && 'Verify Email Address'}
              {mode === 'login' && 'Welcome Back'}
            </h2>
            <p className="text-xs md:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              {mode === 'signup' && 'Fill in your physical shipping address and profile details below'}
              {mode === 'verify' && `We have simulated sending a secure 4-digit code to ${email}`}
              {mode === 'login' && 'Sign in using your account email address and password'}
            </p>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-lg flex items-start gap-2.5 animate-pulse" id="auth-error-banner">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE: SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* FULL NAME */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Mohammad Shahnawaz"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    id="signup-fullname"
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="manish.ee.23031@recb.ac.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="signup-email"
                  />
                </div>
              </div>

              {/* PASSWORD & PHONE NUMBER */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-mono"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      id="signup-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9719852037"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium font-mono"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      id="signup-phone"
                    />
                  </div>
                </div>
              </div>

              {/* SHIPPING ADDRESS */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Shipping Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Quarsi Bypass Road"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    id="signup-address"
                  />
                </div>
              </div>

              {/* CITY & PIN CODE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Aligarh"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      id="signup-city"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Pin Code</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                      <Map className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="202001"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-medium font-mono"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      id="signup-pincode"
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-extrabold tracking-wider uppercase rounded-lg shadow-lg active:scale-[0.98] transition duration-150 disabled:opacity-50 disabled:pointer-events-none mt-6"
                id="signup-submit-btn"
              >
                {loading ? 'Processing...' : 'Sign Up & Verify'}
              </button>
            </form>
          )}

          {/* MODE: VERIFICATION SCREEN */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center space-y-2">
                <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-gray-300 leading-relaxed">
                  We sent a 4-digit code to <strong className="text-white">{email}</strong>. Enter it below to verify your email and activate your account.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Enter 4-Digit Code</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="0000"
                  className="w-40 mx-auto block text-center py-3 px-4 bg-[#17191b] border border-gray-800 rounded-xl text-2xl font-black text-white tracking-[0.4em] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-mono"
                  value={userOtp}
                  onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                  id="otp-verification-input"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="flex-1 py-3 text-xs font-bold text-gray-400 bg-gray-900 border border-gray-800 hover:text-white hover:bg-gray-800 rounded-lg transition"
                >
                  Edit Information
                </button>
                <button
                  type="submit"
                  disabled={loading || userOtp.length !== 4}
                  className="flex-1 py-3 bg-[#059669] hover:bg-[#047857] text-white text-xs font-extrabold tracking-wider uppercase rounded-lg shadow disabled:opacity-40 transition"
                  id="otp-verify-btn"
                >
                  {loading ? 'Activating...' : 'Verify & Sign In'}
                </button>
              </div>
            </form>
          )}

          {/* MODE: LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="example@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="login-email"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#17191b] border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-extrabold tracking-wider uppercase rounded-lg shadow-lg active:scale-[0.98] transition duration-150 disabled:opacity-50 mt-6"
                id="login-submit-btn"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Form Footer toggles */}
          <div className="pt-6 border-t border-gray-800 text-center text-xs">
            {mode === 'signup' && (
              <p className="text-gray-400">
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-emerald-400 hover:text-emerald-300 font-extrabold transition hover:underline"
                  id="switch-to-login-btn"
                >
                  Sign In here
                </button>
              </p>
            )}
            {mode === 'login' && (
              <p className="text-gray-400">
                Don't have an account yet?{' '}
                <button 
                  type="button" 
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="text-emerald-400 hover:text-emerald-300 font-extrabold transition hover:underline"
                  id="switch-to-signup-btn"
                >
                  Create account here
                </button>
              </p>
            )}
            {mode === 'verify' && (
              <p className="text-gray-400">
                Didn't get the code?{' '}
                <button 
                  type="button"
                  onClick={async () => {
                    setError(null);
                    setLoading(true);
                    try {
                      const response = await fetch('/api/customers/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email.trim(), fullName: fullName.trim() }),
                      });
                      const data = await response.json();
                      if (response.ok) {
                        setSentOtp(data.otp);
                        setShowOtpBanner(true);
                        alert('A new 4-digit verification code has been simulated!');
                      }
                    } catch (err) {
                      setError('Failed to resend code.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-extrabold transition hover:underline"
                  id="resend-otp-btn"
                >
                  Resend Code
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
