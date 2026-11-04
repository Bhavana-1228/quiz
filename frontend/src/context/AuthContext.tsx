import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';

interface SignUpData {
  email: string;
  password?: string;
  display_name: string;
  full_name?: string;
  username?: string;
}

interface SignUpResult {
  success: boolean;
  message: string;
  registered_identifier: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGooglePayload: (payload: { sub?: string; email: string; name?: string; picture?: string }) => Promise<User>;
  signInWithPassword: (identifier: string, password: string) => Promise<User>;
  signUpWithPassword: (data: SignUpData) => Promise<SignUpResult>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = () => {
    const current = db.getCurrentUser();
    setUser(current);
  };

  useEffect(() => {
    const checkSession = async () => {
      const current = db.getCurrentUser();
      if (current) {
        setUser(current);
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'x-user-id': current.id },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              db.saveCurrentUser(data.user);
            }
          }
        } catch {
          // Keep local if backend warming up
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const loginWithGooglePayload = async (payload: {
    sub?: string;
    email: string;
    name?: string;
    picture?: string;
  }): Promise<User> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Google authentication failed.');
      }

      const data = await res.json();
      db.saveCurrentUser(data.user);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async (identifier: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in.');
      }

      db.saveCurrentUser(data.user);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithPassword = async (data: SignUpData): Promise<SignUpResult> => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to create account.');
      }

      return resData;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    db.logout();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        db.saveCurrentUser(data.user);
        return;
      }
    } catch {
      // Fallback
    }
    const updated = db.updateUserProfile(user.id, updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGooglePayload,
        signInWithPassword,
        signUpWithPassword,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
