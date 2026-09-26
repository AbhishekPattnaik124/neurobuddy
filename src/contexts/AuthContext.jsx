/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://neurobuddy-backend.onrender.com';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedGuest = localStorage.getItem('snapdragon_guest_user');
      return savedGuest ? JSON.parse(savedGuest) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('snapdragon_guest_user');
        // Sync user with backend
        try {
          const token = await currentUser.getIdToken();
          await fetch(`${BACKEND}/api/auth/sync-user`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (e) {
          console.error('Failed to sync user', e);
        }
      } else {
        const savedGuest = localStorage.getItem('snapdragon_guest_user');
        if (savedGuest) {
          setUser(JSON.parse(savedGuest));
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginAsGuest = () => {
    const guest = {
      uid: 'snapdragon-guest-' + Math.random().toString(36).substring(2, 7),
      email: 'scholar@snapdragon.pc',
      displayName: 'Snapdragon Scholar',
      isGuest: true,
      getIdToken: async () => 'snapdragon-offline-token'
    };
    setUser(guest);
    localStorage.setItem('snapdragon_guest_user', JSON.stringify(guest));
  };

  const logout = async () => {
    try {
      localStorage.removeItem('snapdragon_guest_user');
      await signOut(auth);
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
