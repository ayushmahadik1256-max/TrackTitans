import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase.js';
import apiClient from '../config/api.js';

const AuthContext = createContext(null);

const ACCOUNTS_STORAGE_KEY = 'tracktitans_accounts';
const CURRENT_USER_STORAGE_KEY = 'tracktitans_current_user';
const TOKEN_STORAGE_KEY = 'tracktitans_token';

function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Failed to save accounts to localStorage:', err);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user profile from backend PostgreSQL using Firebase ID token
  const syncWithBackend = async (firebaseUser, profileOverrides = {}) => {
    try {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem(TOKEN_STORAGE_KEY, token);

      const response = await apiClient.post('/auth/sync-user', {
        role: profileOverrides.role || 'institution',
        full_name: profileOverrides.full_name || firebaseUser.displayName || 'Authorized User',
        institution_name: profileOverrides.institution_name || null,
        aicte_application_id: profileOverrides.aicte_application_id || null,
        bank_name: profileOverrides.bank_name || null,
        branch_name: profileOverrides.branch_name || null,
        ifsc_code: profileOverrides.ifsc_code || null,
        phone: profileOverrides.phone || null,
      });

      const userProfile = {
        ...response.data,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      };
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err) {
      console.warn('Backend sync warning, fallback to local profile:', err);
      const fallbackUser = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        full_name: profileOverrides.full_name || firebaseUser.displayName || 'User',
        role: profileOverrides.role || 'institution',
        institution_name: profileOverrides.institution_name || null,
        aicte_application_id: profileOverrides.aicte_application_id || null,
        bank_name: profileOverrides.bank_name || null,
        branch_name: profileOverrides.branch_name || null,
        ifsc_code: profileOverrides.ifsc_code || null,
        phone: profileOverrides.phone || null,
      };
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  };

  useEffect(() => {
    // Clean up any legacy demo state
    localStorage.removeItem('tracktitans_demo_role');

    if (!isFirebaseConfigured) {
      // Local authenticated session
      try {
        const storedUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
          const meRes = await apiClient.get('/auth/me');
          setCurrentUser({
            ...meRes.data,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          });
        } catch {
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'institution',
          });
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard Login
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isFirebaseConfigured) {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        const meRes = await apiClient.get('/auth/me');
        setCurrentUser({
          ...meRes.data,
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        });
      } else {
        // Local account validation
        const accounts = getStoredAccounts();
        const found = accounts.find((acc) => acc.email === normalizedEmail);

        if (!found) {
          throw new Error('Account not found with this email. Please register first.');
        }

        if (found.password && found.password !== password) {
          throw new Error('Incorrect password. Please verify your credentials.');
        }

        const authenticatedProfile = { ...found };
        delete authenticatedProfile.password;

        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(authenticatedProfile));
        localStorage.setItem(TOKEN_STORAGE_KEY, `session-token-${authenticatedProfile.role}-${Date.now()}`);
        setCurrentUser(authenticatedProfile);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Standard Register
  const register = async (email, password, role, profileData) => {
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isFirebaseConfigured) {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await syncWithBackend(userCredential.user, { role, ...profileData });
      } else {
        const accounts = getStoredAccounts();
        const existing = accounts.find((acc) => acc.email === normalizedEmail);
        if (existing) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }

        const newUser = {
          id: `usr-${Date.now()}`,
          uid: `uid-${Date.now()}`,
          email: normalizedEmail,
          role,
          full_name: profileData.full_name || normalizedEmail.split('@')[0],
          institution_name: role === 'institution' ? (profileData.institution_name || 'My Institution') : null,
          aicte_application_id: role === 'institution' ? (profileData.aicte_application_id || 'AICTE-APP-NEW') : null,
          bank_name: role === 'bank' ? (profileData.bank_name || 'Commercial Bank') : null,
          branch_name: role === 'bank' ? (profileData.branch_name || 'Main Branch') : null,
          ifsc_code: role === 'bank' ? (profileData.ifsc_code || 'BANK0000001') : null,
          phone: profileData.phone || '',
        };

        // Save account with password for local verification
        accounts.push({ ...newUser, password });
        saveStoredAccounts(accounts);

        // Save current session
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
        localStorage.setItem(TOKEN_STORAGE_KEY, `session-token-${role}-${Date.now()}`);
        setCurrentUser(newUser);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (isFirebaseConfigured) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Firebase signout error:', err);
    }
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('tracktitans_demo_role');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
