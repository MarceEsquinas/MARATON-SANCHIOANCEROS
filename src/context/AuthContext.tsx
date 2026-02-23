import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          isAdmin: session.user.email === 'admin@quijoterun.com' || session.user.user_metadata?.role === 'admin'
        });
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          isAdmin: session.user.email === 'admin@quijoterun.com' || session.user.user_metadata?.role === 'admin'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, pass: string) => {
    // Transform username to email if it's not already an email
    const email = username.includes('@') ? username : `${username.toLowerCase()}@quijoterun.com`;
    
    // Special case for admin/admin if needed, but we try Supabase first
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      // If it's the fixed admin and Supabase fails (e.g. user not created yet), 
      // we could show a more specific error or handle it.
      throw error;
    }
  };

  const signUp = async (username: string, pass: string) => {
    const email = username.includes('@') ? username : `${username.toLowerCase()}@quijoterun.com`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
