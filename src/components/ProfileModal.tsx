import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Edit2,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  registerUser,
  loginUser,
  updateUserProfile,
  logoutUser,
} from '../services/authService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile | null) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign up fields
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    address: '',
    pinCode: '',
    password: '',
  });

  // Login fields
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Edit profile state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    address: '',
    pinCode: '',
    password: '',
  });

  useEffect(() => {
    if (currentUser) {
      setEditData({
        fullName: currentUser.fullName,
        email: currentUser.email,
        contactNumber: currentUser.contactNumber,
        address: currentUser.address,
        pinCode: currentUser.pinCode,
        password: currentUser.password,
      });
      setIsEditing(false);
    }
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = registerUser(signUpData);
    if (!res.success) {
      setErrorMsg(res.error || 'Sign up failed. Please check your inputs.');
      return;
    }

    setSuccessMsg('Account created successfully! Welcome to Friends 4 Ever Cafe.');
    setTimeout(() => {
      onAuthSuccess(res.user!);
    }, 600);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = loginUser(loginData.email, loginData.password);
    if (!res.success) {
      setErrorMsg(res.error || 'Login failed. Please check your email and 5-digit password.');
      return;
    }

    setSuccessMsg('Logged in successfully! Welcome back.');
    setTimeout(() => {
      onAuthSuccess(res.user!);
    }, 500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = updateUserProfile(currentUser.id, editData);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update profile.');
      return;
    }

    setSuccessMsg('Profile updated successfully!');
    setIsEditing(false);
    onAuthSuccess(res.user!);
  };

  const handleLogout = () => {
    logoutUser();
    onAuthSuccess(null);
    setSuccessMsg('Logged out successfully.');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 leading-tight">
                {currentUser ? 'My Profile' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-[11px] text-stone-500 font-medium">
                {currentUser ? 'Friends 4 Ever Cafe Member' : 'Friends 4 Ever Coffee Cafe'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-800 text-xs font-medium">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto no-scrollbar flex-1">
          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/20">
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-lg font-black truncate">{currentUser.fullName}</h4>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-400/30">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 truncate mt-0.5">{currentUser.email}</p>
                    <p className="text-[11px] text-rose-400 font-bold mt-1">
                      📞 {currentUser.contactNumber}
                    </p>
                  </div>
                </div>
              </div>

              {!isEditing ? (
                /* Profile Details Display */
                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-900 block">Saved Address:</span>
                        <span className="text-stone-600 leading-relaxed block mt-0.5">
                          {currentUser.address}
                        </span>
                        <span className="inline-block mt-1 font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 text-[11px]">
                          PIN: {currentUser.pinCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Lock className="w-4 h-4 text-stone-500" />
                      <span className="font-medium">5-Digit Password:</span>
                    </div>
                    <span className="font-mono font-bold tracking-widest text-stone-800">•••••</span>
                  </div>

                  {/* Actions: Edit Profile & Logout */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-200"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit Profile Form */
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={editData.contactNumber}
                      onChange={(e) => setEditData({ ...editData, contactNumber: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Pin Code (6 Digits)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={editData.pinCode}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            pinCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                          })
                        }
                        required
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        5-Digit Password
                      </label>
                      <input
                        type="password"
                        maxLength={5}
                        inputMode="numeric"
                        value={editData.password}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            password: e.target.value.replace(/\D/g, '').slice(0, 5),
                          })
                        }
                        required
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Not Logged In: Auth Tabs (Login | Sign Up) */
            <div>
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-stone-100 p-1 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {authMode === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">
                        5-Digit Password
                      </label>
                      <span className="text-[10px] text-stone-400 font-medium">
                        5 numeric digits
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        maxLength={5}
                        inputMode="numeric"
                        pattern="[0-9]{5}"
                        required
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value.replace(/\D/g, '').slice(0, 5),
                          })
                        }
                        placeholder="••••• (5 digits)"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-98 mt-2"
                  >
                    Log In
                  </button>

                  <p className="text-center text-xs text-stone-500 pt-2">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMsg(null);
                      }}
                      className="font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Sign Up here
                    </button>
                  </p>
                </form>
              ) : (
                /* Sign Up Form */
                <form onSubmit={handleSignUp} className="space-y-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={signUpData.fullName}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, fullName: e.target.value })
                        }
                        placeholder="e.g. Manish Sharma"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          placeholder="name@email.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Contact Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={signUpData.contactNumber}
                          onChange={(e) =>
                            setSignUpData({ ...signUpData, contactNumber: e.target.value })
                          }
                          placeholder="10-digit mobile"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={signUpData.address}
                        onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                        placeholder="House / Street / Colony / Landmark"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Pin Code & 5-Digit Password */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Pin Code *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={signUpData.pinCode}
                        onChange={(e) =>
                          setSignUpData({
                            ...signUpData,
                            pinCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                          })
                        }
                        placeholder="6-digit PIN"
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        5-Digit Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          maxLength={5}
                          inputMode="numeric"
                          pattern="[0-9]{5}"
                          required
                          value={signUpData.password}
                          onChange={(e) =>
                            setSignUpData({
                              ...signUpData,
                              password: e.target.value.replace(/\D/g, '').slice(0, 5),
                            })
                          }
                          placeholder="5 Digits"
                          className="w-full pl-3 pr-8 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2 text-stone-400 hover:text-stone-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span>Email & 5-digit password can be used to log in anytime.</span>
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-98 mt-1"
                  >
                    Create Account & Sign In
                  </button>

                  <p className="text-center text-xs text-stone-500 pt-1">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMsg(null);
                      }}
                      className="font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Log In here
                    </button>
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
