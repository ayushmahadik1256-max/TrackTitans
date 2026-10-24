import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    // Clean up any legacy demo state
    localStorage.removeItem('tracktitans_demo_role');

    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend Neon PostgreSQL API
        const meRes = await apiClient.get('/auth/me');
        const userProfile = meRes.user || meRes.data;
        setCurrentUser(userProfile);
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(userProfile));
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          // Token expired or invalid
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
          setCurrentUser(null);
        } else {
          // Offline fallback if backend server is starting up
          try {
            const stored = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
            if (stored) {
              setCurrentUser(JSON.parse(stored));
            } else {
              setCurrentUser(null);
            }
          } catch {
            setCurrentUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Standard Login via Neon PostgreSQL (with offline fallback)
  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate with backend Neon DB
      try {
        const response = await apiClient.post('/auth/login', {
          email: normalizedEmail,
          password,
        });

        if (response && response.token) {
          const authenticatedUser = response.user || response.data;
          localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
          setCurrentUser(authenticatedUser);
          return authenticatedUser;
        }
      } catch (apiErr) {
        // If it's a real 401/400 credential error from server, throw it directly
        if (apiErr.status === 401 || apiErr.status === 400 || apiErr.status === 403) {
          throw apiErr;
        }

        // If backend connection is unreachable (e.g. offline dev mode), use local accounts
        const accounts = getStoredAccounts();
        const found = accounts.find((acc) => acc.email === normalizedEmail);

        if (!found) {
          throw new Error('Account not found with this email. Please register first.');
        }

        if (found.password && found.password !== password) {
          throw new Error('Incorrect password. Please verify your credentials.');
        }

        const localProfile = { ...found };
        delete localProfile.password;

        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(localProfile));
        localStorage.setItem(TOKEN_STORAGE_KEY, `local-jwt-${localProfile.role}-${Date.now()}`);
        setCurrentUser(localProfile);
        return localProfile;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Standard Register via Neon PostgreSQL (with offline fallback)
  const register = async (email, password, role, profileData) => {
    setError(null);
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Register with backend Neon DB
      try {
        const payload = {
          email: normalizedEmail,
          password,
          role,
          full_name: profileData.full_name || normalizedEmail.split('@')[0],
          institution_name: role === 'institution' ? (profileData.institution_name || 'Technical Institution') : null,
          aicte_application_id: role === 'institution' ? (profileData.aicte_application_id || 'AICTE-APP-NEW') : null,
          bank_name: role === 'bank' ? (profileData.bank_name || 'Commercial Bank') : null,
          branch_name: role === 'bank' ? (profileData.branch_name || 'Main Branch') : null,
          ifsc_code: role === 'bank' ? (profileData.ifsc_code || 'BANK0000001') : null,
          phone: profileData.phone || '',
          address: profileData.address || null,
          state: profileData.state || null,
        };

        const response = await apiClient.post('/auth/register', payload);

        if (response && response.token) {
          const registeredUser = response.user || response.data;
          localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
          localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(registeredUser));
          setCurrentUser(registeredUser);
          return registeredUser;
        }
      } catch (apiErr) {
        // If conflict error (409) or bad request (400), propagate
        if (apiErr.status === 409 || apiErr.status === 400) {
          throw apiErr;
        }

        // If backend connection is unreachable (e.g. offline dev mode), use local store
        const accounts = getStoredAccounts();
        const existing = accounts.find((acc) => acc.email === normalizedEmail);
        if (existing) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }

        const newUser = {
          id: `usr-${Date.now()}`,
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

        accounts.push({ ...newUser, password });
        saveStoredAccounts(accounts);

        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(newUser));
        localStorage.setItem(TOKEN_STORAGE_KEY, `local-jwt-${role}-${Date.now()}`);
        setCurrentUser(newUser);
        return newUser;
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
