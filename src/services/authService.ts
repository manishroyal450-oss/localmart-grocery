export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
  pinCode: string;
  password: string; // 5-digit password
  createdAt: string;
}

const USERS_STORAGE_KEY = 'friends4ever_registered_users_v1';
const CURRENT_USER_STORAGE_KEY = 'friends4ever_active_user_v1';

export const FIXED_PIN_CODE = '246725';
export const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
export const INDIA_COUNTRY_CODE = '+91';

export function extractIndianTenDigits(input: string): string {
  const trimmed = (input || '').trim();
  let stripped = trimmed;
  if (stripped.startsWith('+91')) {
    stripped = stripped.slice(3);
  } else if (stripped.startsWith('0091')) {
    stripped = stripped.slice(4);
  } else {
    const rawDigits = stripped.replace(/\D/g, '');
    if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
      return rawDigits.slice(2, 12);
    }
  }
  return stripped.replace(/\D/g, '').slice(0, 10);
}

export function parseIndianContactNumber(input: string): {
  valid: boolean;
  digits: string;
  formatted: string;
  error?: string;
} {
  const trimmed = (input || '').trim();
  if (!trimmed) {
    return {
      valid: false,
      digits: '',
      formatted: '',
      error: 'Please enter a 10-digit Indian mobile number (+91).',
    };
  }

  // Reject any foreign country code
  if (trimmed.startsWith('+') && !trimmed.startsWith('+91')) {
    return {
      valid: false,
      digits: '',
      formatted: '',
      error: 'Only India country code (+91) is valid.',
    };
  }
  if (trimmed.startsWith('00') && !trimmed.startsWith('0091')) {
    return {
      valid: false,
      digits: '',
      formatted: '',
      error: 'Only India country code (+91) is valid.',
    };
  }

  let body = trimmed;
  if (body.startsWith('+91')) {
    body = body.slice(3);
  } else if (body.startsWith('0091')) {
    body = body.slice(4);
  } else {
    const rawDigits = body.replace(/\D/g, '');
    if (rawDigits.length === 12 && rawDigits.startsWith('91')) {
      body = rawDigits.slice(2);
    }
  }

  const digitsOnly = body.replace(/\D/g, '');
  if (digitsOnly.length > 10) {
    return {
      valid: false,
      digits: digitsOnly,
      formatted: '',
      error: 'Contact number 10 digits se zyada nahi ho sakta (+91 India only).',
    };
  }
  if (digitsOnly.length !== 10) {
    return {
      valid: false,
      digits: digitsOnly,
      formatted: '',
      error: 'Please enter an exact 10-digit mobile number (+91 India code).',
    };
  }

  return {
    valid: true,
    digits: digitsOnly,
    formatted: `${INDIA_COUNTRY_CODE} ${digitsOnly}`,
  };
}

export function getRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse registered users:', e);
    return [];
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to parse current user:', e);
    return null;
  }
}

export function saveCurrentUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user:', e);
  }
}

export function registerUser(data: {
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
  pinCode: string;
  password: string;
}): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();

  const normalizedEmail = data.email.trim().toLowerCase();
  const trimmedPassword = data.password.trim();

  // Validation
  if (!data.fullName.trim()) {
    return { success: false, error: 'Please enter your Full Name.' };
  }
  if (!normalizedEmail || !GMAIL_REGEX.test(normalizedEmail)) {
    return {
      success: false,
      error: 'Email address must end with @gmail.com (e.g. yourname@gmail.com).',
    };
  }
  const phoneCheck = parseIndianContactNumber(data.contactNumber);
  if (!phoneCheck.valid) {
    return { success: false, error: phoneCheck.error || 'Please enter a valid 10-digit +91 mobile number.' };
  }
  if (!data.address.trim()) {
    return { success: false, error: 'Please enter your Delivery Address.' };
  }
  const trimmedPinCode = (data.pinCode || FIXED_PIN_CODE).trim();
  if (trimmedPinCode !== FIXED_PIN_CODE) {
    return {
      success: false,
      error: `Pin Code is fixed to ${FIXED_PIN_CODE} only.`,
    };
  }
  // 5 digit password rule
  if (!/^\d{5}$/.test(trimmedPassword)) {
    return { success: false, error: 'Password must be exactly 5 digits (e.g. 12345).' };
  }

  // Check if email is already registered
  const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return { success: false, error: 'This email is already registered. Please log in instead.' };
  }

  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    fullName: data.fullName.trim(),
    email: normalizedEmail,
    contactNumber: phoneCheck.formatted,
    address: data.address.trim(),
    pinCode: FIXED_PIN_CODE,
    password: trimmedPassword,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to storage', e);
  }

  saveCurrentUser(newUser);
  return { success: true, user: newUser };
}

export function loginUser(
  email: string,
  password: string
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!normalizedEmail || !GMAIL_REGEX.test(normalizedEmail)) {
    return {
      success: false,
      error: 'Please enter a valid Email ending with @gmail.com.',
    };
  }
  if (!/^\d{5}$/.test(trimmedPassword)) {
    return { success: false, error: 'Password must be exactly 5 digits.' };
  }

  const user = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === trimmedPassword
  );

  if (!user) {
    // Check if email exists to give friendly guidance
    const emailExists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      return { success: false, error: 'Incorrect 5-digit password. Please try again.' };
    }
    return {
      success: false,
      error: 'No account found with this email. Please sign up first.',
    };
  }

  saveCurrentUser(user);
  return { success: true, user };
}

export function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    return { success: false, error: 'User not found.' };
  }

  if (updates.email !== undefined) {
    const normalizedEditEmail = updates.email.trim().toLowerCase();
    if (!GMAIL_REGEX.test(normalizedEditEmail)) {
      return {
        success: false,
        error: 'Email address must end with @gmail.com (e.g. yourname@gmail.com).',
      };
    }
  }

  let formattedContact = users[index].contactNumber;
  if (updates.contactNumber !== undefined) {
    const phoneCheck = parseIndianContactNumber(updates.contactNumber);
    if (!phoneCheck.valid) {
      return {
        success: false,
        error: phoneCheck.error || 'Please enter a valid 10-digit +91 mobile number.',
      };
    }
    formattedContact = phoneCheck.formatted;
  }

  if (updates.pinCode !== undefined && updates.pinCode.trim() !== FIXED_PIN_CODE) {
    return { success: false, error: `Pin Code is fixed to ${FIXED_PIN_CODE} only.` };
  }

  if (updates.password && !/^\d{5}$/.test(updates.password.trim())) {
    return { success: false, error: 'New password must be exactly 5 digits.' };
  }

  const updatedUser: UserProfile = {
    ...users[index],
    ...updates,
    email: updates.email ? updates.email.trim().toLowerCase() : users[index].email,
    contactNumber: formattedContact,
    pinCode: FIXED_PIN_CODE,
  };

  users[index] = updatedUser;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  saveCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

export function logoutUser(): void {
  saveCurrentUser(null);
}

export async function sendEmailOtp(
  email: string,
  fullName?: string
): Promise<{
  success: boolean;
  deliveryMode?: 'email' | 'preview';
  previewOtp?: string;
  message?: string;
  error?: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !GMAIL_REGEX.test(normalizedEmail)) {
    return {
      success: false,
      error: 'Email address must end with @gmail.com (e.g. yourname@gmail.com).',
    };
  }

  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, fullName: fullName || '' }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to send 3-digit OTP.' };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to connect to OTP service.',
    };
  }
}

export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<{
  success: boolean;
  verified?: boolean;
  message?: string;
  error?: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedOtp = otp.trim();

  if (!normalizedEmail || !GMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid @gmail.com address.' };
  }
  if (!/^\d{3}$/.test(trimmedOtp)) {
    return { success: false, error: 'Please enter a valid 3-digit OTP.' };
  }

  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, otp: trimmedOtp }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Invalid 3-digit OTP.' };
    }
    return data;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Unable to verify OTP.',
    };
  }
}
