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

// Demo profile templates for Hackathon and quick testing
const DEMO_PROFILES = {
  institution: {
    id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    uid: 'demo_uid_institution',
    email: 'registrar@delhitechnical.edu.in',
    full_name: 'Prof. Sunita Deshmukh',
    role: 'institution',
    institution_name: 'Delhi Institute of Engineering & Technology',
    aicte_application_id: 'AICTE-1-9321482910',
    phone: '+91-9876543210',
  },
  bank: {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    uid: 'demo_uid_bank',
    email: 'mgr.delhi@sbi.co.in',
    full_name: 'Rajeev Menon (Branch Manager)',
    role: 'bank',
    bank_name: 'State Bank of India',
    branch_name: 'Parliament Street Branch, New Delhi',
    ifsc_code: 'SBIN0000691',
    phone: '+91-11-23374821',
  },
  aicte_admin: {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    uid: 'demo_uid_aicte_admin',
    email: 'admin@aicte-india.org',
    full_name: 'Dr. Ramesh Sharma (Deputy Director)',
    role: 'aicte_admin',
    institution_name: null,
    bank_name: null,
    phone: '+91-11-29581000',
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync user profile from backend PostgreSQL using Firebase ID token
  const syncWithBackend = async (firebaseUser, profileOverrides = {}) => {
    try {
      const token = await firebaseUser.getIdToken();
      localStorage.setItem('tracktitans_token', token);

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
      // Fallback in case backend DB is initializing
      const fallbackUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        full_name: profileOverrides.full_name || firebaseUser.displayName || 'User',
        role: profileOverrides.role || 'institution',
        institution_name: profileOverrides.institution_name,
        bank_name: profileOverrides.bank_name,
      };
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }
  };

  useEffect(() => {
    // Check saved demo user or listen to Firebase
    const savedDemoRole = localStorage.getItem('tracktitans_demo_role');
    if (savedDemoRole && DEMO_PROFILES[savedDemoRole]) {
      setCurrentUser(DEMO_PROFILES[savedDemoRole]);
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured) {
      // Default to institution demo so app is immediately usable in live demo
      setCurrentUser(DEMO_PROFILES.institution);
      localStorage.setItem('tracktitans_token', 'mock-token-institution');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('tracktitans_token', token);
          // Fetch current profile from backend
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
        localStorage.removeItem('tracktitans_token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Standard Login
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        localStorage.setItem('tracktitans_token', token);
        const meRes = await apiClient.get('/auth/me');
        setCurrentUser({
          ...meRes.data,
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        });
      } else {
        // Match demo user email if Firebase not configured
        if (email.includes('admin')) {
          loginAsDemoRole('aicte_admin');
        } else if (email.includes('bank') || email.includes('sbi')) {
          loginAsDemoRole('bank');
        } else {
          loginAsDemoRole('institution');
        }
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
    try {
      if (isFirebaseConfigured) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await syncWithBackend(userCredential.user, { role, ...profileData });
      } else {
        const customUser = {
          id: `custom-${Date.now()}`,
          uid: `uid-${Date.now()}`,
          email,
          role,
          full_name: profileData.full_name || 'Registered User',
          institution_name: profileData.institution_name,
          bank_name: profileData.bank_name,
          phone: profileData.phone,
        };
        setCurrentUser(customUser);
        localStorage.setItem('tracktitans_token', `mock-token-${role}`);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Demo Role Switcher for instant evaluator walkthrough
  const loginAsDemoRole = (role) => {
    const profile = DEMO_PROFILES[role] || DEMO_PROFILES.institution;
    localStorage.setItem('tracktitans_demo_role', role);
    localStorage.setItem('tracktitans_token', `mock-token-${role}`);
    setCurrentUser(profile);
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
    localStorage.removeItem('tracktitans_demo_role');
    localStorage.removeItem('tracktitans_token');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    loginAsDemoRole,
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
