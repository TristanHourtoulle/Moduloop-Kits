'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useSession } from '@/lib/auth-client';

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface UserContextType {
  user: UserData | null;
  updateUser: (userData: Partial<UserData>) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);

  // Initialize user from session and fetch role from DB
  useEffect(() => {
    const initializeUser = async () => {
      if (session?.user) {
        try {
          // Fetch user data including role from API
          const response = await fetch('/api/profile');
          if (response.ok) {
            const data = await response.json();
            if (data.user) {
              setUser({
                id: data.user.id,
                name: data.user.name || session.user.name || '',
                email: data.user.email || session.user.email,
                image: data.user.image || session.user.image || undefined,
                role: data.user.role || 'USER', // Use role from DB or fallback to USER
              });
            }
          } else {
            // Fallback to session data if API call fails
            setUser({
              id: session.user.id,
              name: session.user.name || '',
              email: session.user.email,
              image: session.user.image ?? undefined,
              role: 'USER', // Default fallback role
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to session data if error occurs
          setUser({
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email,
            image: session.user.image ?? undefined,
            role: 'USER', // Default fallback role
          });
        }
      } else {
        setUser(null);
      }
    };

    initializeUser();
  }, [session]);

  const updateUser = (userData: Partial<UserData>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name || '',
            email: data.user.email,
            image: data.user.image,
            role: data.user.role,
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const contextValue: UserContextType = {
    user,
    updateUser,
    refreshUser,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
