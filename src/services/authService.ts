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
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid Email address.' };
  }
  if (!data.contactNumber.trim() || data.contactNumber.replace(/\D/g, '').length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit Contact Number.' };
  }
  if (!data.address.trim()) {
    return { success: false, error: 'Please enter your Delivery Address.' };
  }
  if (!data.pinCode.trim() || !/^\d{6}$/.test(data.pinCode.trim())) {
    return { success: false, error: 'Please enter a valid 6-digit Pin Code.' };
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
    contactNumber: data.contactNumber.trim(),
    address: data.address.trim(),
    pinCode: data.pinCode.trim(),
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

  if (!normalizedEmail) {
    return { success: false, error: 'Please enter your Email.' };
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

  if (updates.password && !/^\d{5}$/.test(updates.password.trim())) {
    return { success: false, error: 'New password must be exactly 5 digits.' };
  }

  const updatedUser: UserProfile = {
    ...users[index],
    ...updates,
    email: updates.email ? updates.email.trim().toLowerCase() : users[index].email,
  };

  users[index] = updatedUser;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  saveCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

export function logoutUser(): void {
  saveCurrentUser(null);
}
