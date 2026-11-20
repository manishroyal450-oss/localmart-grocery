import React, { useState, useEffect, useCallback } from 'react';
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
  KeyRound,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Cloud,
  LogIn,
} from 'lucide-react';
import {
  UserProfile,
  registerUser,
  loginUser,
  updateUserProfile,
  logoutUser,
  sendEmailOtp,
  verifyEmailOtp,
  getRegisteredUsers,
  saveCurrentUser,
  FIXED_PIN_CODE,
  GMAIL_REGEX,
  INDIA_COUNTRY_CODE,
  extractIndianTenDigits,
  parseIndianContactNumber,
} from '../services/authService';
import { CafeAdminOrder } from '../types';
import {
  CAFE_ORDERS_UPDATED_EVENT,
  fetchCustomerOrders,
  getLocalCustomerOrders,
  mergeOrdersLists,
} from '../services/cafeOrderAdminService';
import { useFirebase } from '../context/FirebaseContext';
import {
  fetchUserProfileFromFirestore,
  subscribeToCustomerOrdersFirestore,
  syncUserProfileToFirestore,
} from '../services/firestoreOrdersService';

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
    pinCode: FIXED_PIN_CODE,
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
    pinCode: FIXED_PIN_CODE,
    password: '',
  });

  // 3-digit Email OTP verification state (Sign Up)
  const [otpSentToEmail, setOtpSentToEmail] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState<string>('');
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [otpDeliveryMode, setOtpDeliveryMode] = useState<'email' | 'preview' | null>(null);
  const [previewOtpHint, setPreviewOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const {
    firebaseUser,
    isAuthReady,
    firebaseLoading,
    firebaseError,
    signInWithGoogle,
    signOutFirebase,
  } = useFirebase();

  // Customer's own dynamic live orders (strictly scoped to currentUser & firebaseUser)
  const [localCustomerOrders, setLocalCustomerOrders] = useState<CafeAdminOrder[]>([]);
  const [firestoreOrders, setFirestoreOrders] = useState<CafeAdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);

  const myOrders = React.useMemo(
    () => mergeOrdersLists(localCustomerOrders, firestoreOrders),
    [localCustomerOrders, firestoreOrders]
  );

  const loadMyOrders = useCallback(
    async (silent = false) => {
      if (!currentUser && !firebaseUser?.uid) {
        setLocalCustomerOrders([]);
        return;
      }
      if (!silent) setIsLoadingOrders(true);
      try {
        const latest = await fetchCustomerOrders(currentUser, firebaseUser?.uid);
        setLocalCustomerOrders(latest);
      } finally {
        if (!silent) setIsLoadingOrders(false);
      }
    },
    [currentUser, firebaseUser?.uid]
  );

  useEffect(() => {
    if (!isOpen || !currentUser) {
      if (!currentUser) {
        setLocalCustomerOrders([]);
        setFirestoreOrders([]);
      }
      return;
    }

    setLocalCustomerOrders(getLocalCustomerOrders(currentUser, firebaseUser?.uid));
    loadMyOrders(false);

    const handleSync = () => {
      setLocalCustomerOrders(getLocalCustomerOrders(currentUser, firebaseUser?.uid));
      loadMyOrders(true);
    };
    window.addEventListener(CAFE_ORDERS_UPDATED_EVENT, handleSync);
    window.addEventListener('storage', handleSync);
    const pollTimer = window.setInterval(() => loadMyOrders(true), 4000);

    return () => {
      window.removeEventListener(CAFE_ORDERS_UPDATED_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
      window.clearInterval(pollTimer);
    };
  }, [isOpen, currentUser, firebaseUser?.uid, loadMyOrders]);

  // Real-time Firestore orders stream for authenticated Google user
  useEffect(() => {
    if (!isOpen || !currentUser || !isAuthReady || !firebaseUser?.emailVerified) {
      if (!firebaseUser?.emailVerified) setFirestoreOrders([]);
      return;
    }

    const unsubscribe = subscribeToCustomerOrdersFirestore(
      firebaseUser.uid,
      (orders) => {
        setFirestoreOrders(orders);
      },
      (err) => {
        console.warn('Profile Firestore orders stream warning:', err);
      }
    );

    return () => unsubscribe();
  }, [isOpen, currentUser, isAuthReady, firebaseUser?.uid, firebaseUser?.emailVerified]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (currentUser) {
      setEditData({
        fullName: currentUser.fullName,
        email: currentUser.email,
        contactNumber: extractIndianTenDigits(currentUser.contactNumber),
        address: currentUser.address,
        pinCode: FIXED_PIN_CODE,
        password: currentUser.password,
      });
      setIsEditing(false);
    } else {
      setSignUpData((prev) => ({ ...prev, pinCode: FIXED_PIN_CODE }));
    }
    setOtpSentToEmail(null);
    setVerifiedEmail(null);
    setOtpInput('');
    setOtpDeliveryMode(null);
    setPreviewOtpHint(null);
    setResendCooldown(0);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSendSignUpOtp = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const normalizedEmail = signUpData.email.trim().toLowerCase();
    if (!GMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Email address ke end me @gmail.com hona zaroori hai (e.g. yourname@gmail.com).');
      return;
    }

    setIsSendingOtp(true);
    const res = await sendEmailOtp(normalizedEmail, signUpData.fullName);
    setIsSendingOtp(false);

    if (!res.success) {
      setErrorMsg(res.error || '3-digit OTP send nahi ho saka. Dubara try karein.');
      return;
    }

    setOtpSentToEmail(normalizedEmail);
    setVerifiedEmail(null);
    setOtpInput('');
    setOtpDeliveryMode(res.deliveryMode || 'email');
    setPreviewOtpHint(res.previewOtp || null);
    setResendCooldown(30);
    setSuccessMsg(
      res.deliveryMode === 'email'
        ? `${normalizedEmail} par 3-digit OTP bheja gaya hai.`
        : `3-digit OTP generated for ${normalizedEmail}.`
    );
  };

  const handleVerifySignUpOtp = async (): Promise<boolean> => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const normalizedEmail = signUpData.email.trim().toLowerCase();
    if (!/^\d{3}$/.test(otpInput.trim())) {
      setErrorMsg('Please enter the 3-digit OTP sent to your email.');
      return false;
    }

    setIsVerifyingOtp(true);
    const res = await verifyEmailOtp(normalizedEmail, otpInput.trim());
    setIsVerifyingOtp(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Incorrect 3-digit OTP. Please try again.');
      return false;
    }

    setVerifiedEmail(normalizedEmail);
    setPreviewOtpHint(null);
    setSuccessMsg('Email verified! Ab aap Create Account & Sign In kar sakte hain.');
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const normalizedEmail = signUpData.email.trim().toLowerCase();
    if (!GMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Email address ke end me @gmail.com hona zaroori hai (e.g. yourname@gmail.com).');
      return;
    }

    const phoneCheck = parseIndianContactNumber(
      signUpData.contactNumber.trim().startsWith('+')
        ? signUpData.contactNumber
        : `${INDIA_COUNTRY_CODE} ${signUpData.contactNumber}`
    );
    if (!phoneCheck.valid) {
      setErrorMsg(phoneCheck.error || 'Only +91 India code with exact 10 digits is valid.');
      return;
    }

    // Require 3-digit Email OTP verification before creating account
    if (verifiedEmail !== normalizedEmail) {
      if (otpSentToEmail !== normalizedEmail) {
        await handleSendSignUpOtp();
        return;
      }
      if (/^\d{3}$/.test(otpInput.trim())) {
        const verifiedNow = await handleVerifySignUpOtp();
        if (!verifiedNow) return;
      } else {
        setErrorMsg('Account banane se pehle email par aaya 3-digit OTP enter karke verify karein.');
        return;
      }
    }

    const res = registerUser({
      ...signUpData,
      email: normalizedEmail,
      contactNumber: phoneCheck.formatted,
      pinCode: FIXED_PIN_CODE,
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Sign up failed. Please check your inputs.');
      return;
    }

    if (firebaseUser?.emailVerified) {
      syncUserProfileToFirestore(firebaseUser, {
        fullName: res.user!.fullName,
        email: res.user!.email,
        contactNumber: res.user!.contactNumber,
        address: res.user!.address,
        pinCode: FIXED_PIN_CODE,
      }).catch((err) => console.warn('Firestore profile sync warning:', err));
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

    const normalizedEmail = loginData.email.trim().toLowerCase();
    if (!GMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Please enter a valid Gmail address ending with @gmail.com.');
      return;
    }

    const res = loginUser(normalizedEmail, loginData.password);
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

    const normalizedEmail = editData.email.trim().toLowerCase();
    if (!GMAIL_REGEX.test(normalizedEmail)) {
      setErrorMsg('Email address ke end me @gmail.com hona zaroori hai (e.g. yourname@gmail.com).');
      return;
    }

    const phoneCheck = parseIndianContactNumber(
      editData.contactNumber.trim().startsWith('+')
        ? editData.contactNumber
        : `${INDIA_COUNTRY_CODE} ${editData.contactNumber}`
    );
    if (!phoneCheck.valid) {
      setErrorMsg(phoneCheck.error || 'Only +91 India code with exact 10 digits is valid.');
      return;
    }

    const res = updateUserProfile(currentUser.id, {
      ...editData,
      email: normalizedEmail,
      contactNumber: phoneCheck.formatted,
      pinCode: FIXED_PIN_CODE,
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to update profile.');
      return;
    }

    if (firebaseUser?.emailVerified) {
      syncUserProfileToFirestore(firebaseUser, {
        fullName: res.user!.fullName,
        email: res.user!.email,
        contactNumber: res.user!.contactNumber,
        address: res.user!.address,
        pinCode: FIXED_PIN_CODE,
      }).catch((err) => console.warn('Firestore profile update warning:', err));
    }

    setSuccessMsg('Profile updated successfully!');
    setIsEditing(false);
    onAuthSuccess(res.user!);
  };

  const handleGoogleSync = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const gUser = await signInWithGoogle();
    if (!gUser) return;

    const gEmail = (gUser.email || '').trim().toLowerCase();
    if (!GMAIL_REGEX.test(gEmail)) {
      setErrorMsg('Email address ke end me @gmail.com hona zaroori hai.');
      return;
    }

    if (currentUser) {
      try {
        await syncUserProfileToFirestore(gUser, {
          fullName: currentUser.fullName,
          email: currentUser.email,
          contactNumber: currentUser.contactNumber,
          address: currentUser.address,
          pinCode: FIXED_PIN_CODE,
        });
        setSuccessMsg(`Firebase Cloud Sync connected (${gEmail})!`);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Could not sync profile to Firebase.');
      }
      return;
    }

    // Not logged into cafe profile yet: check local accounts or Firestore
    const existingLocal = getRegisteredUsers().find(
      (u) => u.email.toLowerCase() === gEmail
    );
    if (existingLocal) {
      saveCurrentUser(existingLocal);
      syncUserProfileToFirestore(gUser, existingLocal).catch(() => {});
      setSuccessMsg(`Google & Cafe Profile connected (${gEmail})!`);
      setTimeout(() => onAuthSuccess(existingLocal), 400);
      return;
    }

    try {
      const fsProfile = await fetchUserProfileFromFirestore(gUser);
      if (fsProfile && fsProfile.contactNumber && fsProfile.address) {
        setAuthMode('signup');
        setSignUpData((prev) => ({
          ...prev,
          fullName: fsProfile.fullName || gUser.displayName || '',
          email: gEmail,
          contactNumber: extractIndianTenDigits(fsProfile.contactNumber),
          address: fsProfile.address,
          pinCode: FIXED_PIN_CODE,
        }));
        setVerifiedEmail(gEmail);
        setOtpSentToEmail(gEmail);
        setSuccessMsg('Google & Firestore details load ho gaye! 5-digit password set karke Sign In karein.');
        return;
      }
    } catch {
      // continue to prefill sign up
    }

    setAuthMode('signup');
    setSignUpData((prev) => ({
      ...prev,
      fullName: gUser.displayName || prev.fullName,
      email: gEmail,
      pinCode: FIXED_PIN_CODE,
    }));
    setVerifiedEmail(gEmail);
    setOtpSentToEmail(gEmail);
    setSuccessMsg(`Google verified (${gEmail})! Ab +91 mobile, address aur 5-digit password bharein.`);
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
        className="relative w-full max-w-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl shadow-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                {currentUser ? 'My Profile' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {currentUser ? 'Friends 4 Ever Cafe Member' : 'Friends 4 Ever Coffee Cafe'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-rose-800 dark:text-rose-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto no-scrollbar flex-1">

          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-md relative overflow-hidden border border-stone-700/60">
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
                  <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 space-y-2 text-xs">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-stone-500 dark:text-stone-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100 block">Saved Address:</span>
                        <span className="text-stone-600 dark:text-stone-300 leading-relaxed block mt-0.5">
                          {currentUser.address}
                        </span>
                        <span className="inline-block mt-1 font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/60 text-[11px]">
                          PIN: {FIXED_PIN_CODE}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                      <Lock className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                      <span className="font-medium">5-Digit Password:</span>
                    </div>
                    <span className="font-mono font-bold tracking-widest text-stone-800 dark:text-stone-200">•••••</span>
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

                  {/* Firebase Cloud Sync Bar */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      firebaseUser?.emailVerified
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Cloud
                        className={`w-4 h-4 shrink-0 ${
                          firebaseUser?.emailVerified ? 'text-emerald-600' : 'text-stone-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 text-[11px]">
                          {firebaseUser?.emailVerified
                            ? 'Firebase Cloud Sync Active'
                            : 'Firebase Cloud Sync'}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {firebaseUser?.emailVerified
                            ? firebaseUser.email
                            : 'Orders ko Firestore me save aur live track karne ke liye connect karein'}
                        </p>
                      </div>
                    </div>

                    {firebaseUser?.emailVerified ? (
                      <button
                        type="button"
                        onClick={signOutFirebase}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-[11px] font-semibold shrink-0 cursor-pointer"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleSync}
                        disabled={firebaseLoading}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shrink-0 cursor-pointer disabled:opacity-60 flex items-center gap-1"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>{firebaseLoading ? 'Connecting...' : 'Connect'}</span>
                      </button>
                    )}
                  </div>
                  {firebaseError && (
                    <p className="text-[11px] font-semibold text-rose-600">{firebaseError}</p>
                  )}

                  {/* Dynamic Profile-Scoped Live Order Status Section */}
                  <div className="pt-3 border-t border-stone-200 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
                          <span>My Orders &amp; Live Status</span>
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Sirf {currentUser.fullName.split(' ')[0]} ke orders ka real-time status
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => loadMyOrders(false)}
                        disabled={isLoadingOrders}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
                        title="Refresh live order status"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {myOrders.length === 0 ? (
                      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                        <p className="text-xs font-semibold text-stone-700">
                          Abhi aapke profile par koi order nahi hai
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Jab aap WhatsApp se order karenge, uska live status (Pending / Order Confirmed) yahan dikhega.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-0.5">
                        {myOrders.map((order) => {
                          const isConfirmed = order.status === 'confirmed';
                          const orderTime = (() => {
                            try {
                              return new Date(order.createdAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              });
                            } catch {
                              return '';
                            }
                          })();
                          return (
                            <div
                              key={order.orderId}
                              className={`p-3 rounded-xl border transition-colors ${
                                isConfirmed
                                  ? 'bg-emerald-50/70 border-emerald-200'
                                  : 'bg-amber-50/60 border-amber-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-stone-900">
                                      #{order.orderId}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                                      {order.orderType}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500 mt-0.5 tabular-nums">
                                    {orderTime}
                                  </p>
                                </div>

                                <span className="font-mono text-sm font-bold text-stone-900 tabular-nums shrink-0">
                                  ₹{order.grandTotal.toLocaleString('en-IN')}
                                </span>
                              </div>

                              <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                                {order.itemSummary}
                              </p>

                              <div className="mt-2.5 pt-2 border-t border-stone-200/70 flex items-center justify-between gap-2">
                                <span
                                  className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                    isConfirmed ? 'text-emerald-700' : 'text-amber-700'
                                  }`}
                                >
                                  {isConfirmed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  ) : (
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                  )}
                                  <span>
                                    {isConfirmed
                                      ? 'Order Confirmed'
                                      : 'Pending • Waiting for Confirmation'}
                                  </span>
                                </span>

                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    isConfirmed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Edit Profile Form */
                <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Email Address (must end with @gmail.com)
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                    {editData.email.trim().length > 0 &&
                      !GMAIL_REGEX.test(editData.email.trim().toLowerCase()) && (
                        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                          Email address ke end me @gmail.com hona chahiye
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Contact Number (+91 India • 10 Digits)
                    </label>
                    <div className="flex items-center rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus-within:bg-white dark:focus-within:bg-stone-850 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 overflow-hidden">
                      <span className="px-2.5 py-2 bg-stone-100 dark:bg-stone-700/80 border-r border-stone-200 dark:border-stone-700 text-xs font-black text-stone-700 dark:text-stone-200 select-none flex-shrink-0">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={editData.contactNumber}
                        onChange={(e) => {
                          const raw = e.target.value.trim();
                          if (raw.startsWith('+') && !raw.startsWith('+91')) {
                            setErrorMsg('Only India country code (+91) is valid.');
                            return;
                          }
                          setErrorMsg(null);
                          setEditData({
                            ...editData,
                            contactNumber: extractIndianTenDigits(raw),
                          });
                        }}
                        placeholder="10-digit mobile"
                        required
                        className="w-full px-3 py-2 bg-transparent text-stone-900 dark:text-stone-100 text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Pin Code (Fixed)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={FIXED_PIN_CODE}
                          readOnly
                          aria-readonly="true"
                          className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-black tracking-wider cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
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
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
                      className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
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
              {/* One-Tap Google Sign-In for Firebase Cloud Sync */}
              <div className="mb-3.5">
                <button
                  type="button"
                  onClick={handleGoogleSync}
                  disabled={firebaseLoading}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  <Cloud className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {firebaseLoading
                      ? 'Connecting Google...'
                      : firebaseUser?.emailVerified
                      ? `Synced with ${firebaseUser.email}`
                      : 'Continue with Google (Firebase Sync)'}
                  </span>
                </button>
                {firebaseError && (
                  <p className="text-[11px] font-semibold text-rose-600 mt-1 text-center">
                    {firebaseError}
                  </p>
                )}
              </div>

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
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Email Address (Gmail Only)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                    {loginData.email.trim().length > 0 &&
                      !GMAIL_REGEX.test(loginData.email.trim().toLowerCase()) && (
                        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                          Email address ke end me @gmail.com hona chahiye
                        </p>
                      )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
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
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-bold tracking-widest focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
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
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                          Email Address * <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">(@gmail.com)</span>
                        </label>
                        {verifiedEmail && verifiedEmail === signUpData.email.trim().toLowerCase() && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={signUpData.email}
                          onChange={(e) => {
                            const nextEmail = e.target.value;
                            setSignUpData({ ...signUpData, email: nextEmail });
                            const normalizedNext = nextEmail.trim().toLowerCase();
                            if (verifiedEmail && verifiedEmail !== normalizedNext) {
                              setVerifiedEmail(null);
                            }
                            if (otpSentToEmail && otpSentToEmail !== normalizedNext) {
                              setOtpSentToEmail(null);
                              setOtpInput('');
                              setPreviewOtpHint(null);
                              setOtpDeliveryMode(null);
                            }
                          }}
                          placeholder="yourname@gmail.com"
                          className="w-full pl-9 pr-20 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                        {GMAIL_REGEX.test(signUpData.email.trim().toLowerCase()) &&
                          verifiedEmail !== signUpData.email.trim().toLowerCase() && (
                            <button
                              type="button"
                              onClick={handleSendSignUpOtp}
                              disabled={isSendingOtp || (otpSentToEmail === signUpData.email.trim().toLowerCase() && resendCooldown > 0)}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-stone-300 text-white text-[10px] font-black transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              {isSendingOtp ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : otpSentToEmail === signUpData.email.trim().toLowerCase() && resendCooldown > 0 ? (
                                <span>{resendCooldown}s</span>
                              ) : (
                                <>
                                  <Send className="w-2.5 h-2.5" />
                                  <span>{otpSentToEmail === signUpData.email.trim().toLowerCase() ? 'Resend' : 'OTP'}</span>
                                </>
                              )}
                            </button>
                          )}
                      </div>
                      {signUpData.email.trim().length > 0 &&
                        !GMAIL_REGEX.test(signUpData.email.trim().toLowerCase()) && (
                          <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                            End me @gmail.com hona zaroori hai
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Contact Number * <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">(+91 Only)</span>
                      </label>
                      <div className="flex items-center rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus-within:bg-white dark:focus-within:bg-stone-850 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:border-rose-500 overflow-hidden">
                        <span className="px-2.5 py-2 bg-stone-100 dark:bg-stone-700/80 border-r border-stone-200 dark:border-stone-700 text-[11px] font-black text-stone-700 dark:text-stone-200 select-none flex-shrink-0">
                          🇮🇳 +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          required
                          value={signUpData.contactNumber}
                          onChange={(e) => {
                            const raw = e.target.value.trim();
                            if (raw.startsWith('+') && !raw.startsWith('+91')) {
                              setErrorMsg('Only India country code (+91) is valid.');
                              return;
                            }
                            setErrorMsg(null);
                            setSignUpData({
                              ...signUpData,
                              contactNumber: extractIndianTenDigits(raw),
                            });
                          }}
                          placeholder="10-digit number"
                          className="w-full px-2.5 py-2 bg-transparent text-stone-900 dark:text-stone-100 text-xs font-medium focus:outline-none"
                        />
                      </div>
                      {signUpData.contactNumber.length > 0 && signUpData.contactNumber.length < 10 && (
                        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                          {signUpData.contactNumber.length}/10 digits (+91 India only)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3-Digit Email OTP Verification Panel */}
                  {otpSentToEmail === signUpData.email.trim().toLowerCase() &&
                    verifiedEmail !== signUpData.email.trim().toLowerCase() && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                            <span className="text-xs font-black text-stone-900">
                              Enter 3-Digit Email OTP
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-full border border-rose-200">
                            3 Digits
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-600 leading-snug">
                          {otpDeliveryMode === 'email' ? (
                            <>
                              3-digit OTP <strong className="text-stone-900">{otpSentToEmail}</strong> par bhej diya gaya hai.
                            </>
                          ) : (
                            <>
                              Email SMTP secrets configure nahi hain — Test Preview OTP:{' '}
                              <span className="font-mono font-black text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200">
                                {previewOtpHint}
                              </span>
                            </>
                          )}
                        </p>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={3}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 3))}
                            placeholder="123"
                            className="w-28 text-center font-mono font-black text-base tracking-[0.4em] px-3 py-2 rounded-xl bg-white border border-rose-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                          />
                          <button
                            type="button"
                            onClick={handleVerifySignUpOtp}
                            disabled={isVerifyingOtp || otpInput.length !== 3}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-black text-xs transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            {isVerifyingOtp ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Verify 3-Digit OTP</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
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
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-medium focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Pin Code (Fixed 246725) & 5-Digit Password */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Pin Code * <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">(Fixed)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={FIXED_PIN_CODE}
                          readOnly
                          aria-readonly="true"
                          required
                          className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-black tracking-wider cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
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
                          className="w-full pl-3 pr-8 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-bold tracking-widest focus:bg-white dark:focus:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
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
                    disabled={isSendingOtp || isVerifyingOtp}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-70 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-98 mt-1"
                  >
                    {verifiedEmail === signUpData.email.trim().toLowerCase() && verifiedEmail
                      ? 'Create Account & Sign In'
                      : otpSentToEmail === signUpData.email.trim().toLowerCase() && otpSentToEmail
                      ? 'Verify 3-Digit OTP & Create Account'
                      : 'Send 3-Digit Email OTP'}
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
