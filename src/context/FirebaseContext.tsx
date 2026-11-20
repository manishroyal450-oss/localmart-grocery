import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, ADMIN_EMAIL, OperationType, handleFirestoreError } from '../firebase';

interface FirebaseContextValue {
  firebaseUser: User | null;
  isAuthReady: boolean;
  isFirebaseAdmin: boolean;
  firebaseLoading: boolean;
  firebaseError: string | null;
  signInWithGoogle: () => Promise<User | null>;
  signOutFirebase: () => Promise<void>;
  clearFirebaseError: () => void;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState<boolean>(false);
  const [firebaseLoading, setFirebaseLoading] = useState<boolean>(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user || !user.emailVerified) {
        setIsFirebaseAdmin(false);
        setIsAuthReady(true);
        return;
      }

      if (user.email?.toLowerCase() === ADMIN_EMAIL) {
        setIsFirebaseAdmin(true);
        setIsAuthReady(true);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        setIsFirebaseAdmin(adminSnap.exists());
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, `admins/${user.uid}`);
        } catch {
          setIsFirebaseAdmin(false);
        }
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    setFirebaseLoading(true);
    setFirebaseError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      return credential.user;
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        setFirebaseError('Google sign-in popup band ho gaya. Dubara try karein.');
      } else if (code === 'auth/popup-blocked') {
        setFirebaseError('Browser ne popup block kiya. Popup allow karke try karein.');
      } else {
        setFirebaseError(err?.message || 'Google sign-in failed.');
      }
      return null;
    } finally {
      setFirebaseLoading(false);
    }
  }, []);

  const signOutFirebase = useCallback(async () => {
    setFirebaseLoading(true);
    setFirebaseError(null);
    try {
      await signOut(auth);
      setIsFirebaseAdmin(false);
    } catch (err: any) {
      setFirebaseError(err?.message || 'Sign out failed.');
    } finally {
      setFirebaseLoading(false);
    }
  }, []);

  const clearFirebaseError = useCallback(() => setFirebaseError(null), []);

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        isAuthReady,
        isFirebaseAdmin,
        firebaseLoading,
        firebaseError,
        signInWithGoogle,
        signOutFirebase,
        clearFirebaseError,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export function useFirebase(): FirebaseContextValue {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return ctx;
}
