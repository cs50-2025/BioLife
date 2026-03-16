import React, { createContext, useContext, useState, useEffect } from 'react';
import { hashPassword } from '../utils/crypto';

export type User = {
  id: string;
  name: string;
  profilePicture?: string;
  darkMode: boolean;
  notificationsEnabled?: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (name: string, password?: string) => Promise<void>;
  signup: (name: string, password?: string) => Promise<void>;
  logout: () => void;
  updateProfilePicture: (url: string) => void;
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('plant_app_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.darkMode) {
        document.documentElement.classList.add('dark');
      }
      return parsedUser;
    }
    return null;
  });

  const saveUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('plant_app_user', JSON.stringify(newUser));
      if (newUser.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Update the user in the mock DB as well if they modify their profile
      const usersDb = JSON.parse(localStorage.getItem('plant_app_users_db') || '{}');
      if (usersDb[newUser.name]) {
        usersDb[newUser.name] = { ...usersDb[newUser.name], ...newUser };
        localStorage.setItem('plant_app_users_db', JSON.stringify(usersDb));
      }
    } else {
      localStorage.removeItem('plant_app_user');
      document.documentElement.classList.remove('dark');
    }
  };

  const login = async (name: string, password?: string) => {
    const usersDb = JSON.parse(localStorage.getItem('plant_app_users_db') || '{}');
    const dbUser = usersDb[name];
    
    if (!dbUser) {
      throw new Error('User not found. Please sign up first.');
    }
    
    const hashedPassword = password ? await hashPassword(password) : undefined;
    if (dbUser.password !== hashedPassword) {
      throw new Error('Incorrect password.');
    }

    const { password: _, ...userWithoutPassword } = dbUser;
    saveUser(userWithoutPassword as User);
  };

  const signup = async (name: string, password?: string) => {
    const usersDb = JSON.parse(localStorage.getItem('plant_app_users_db') || '{}');
    
    if (usersDb[name]) {
      throw new Error('User already exists. Please log in.');
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;

    const newUser = {
      id: Date.now().toString(),
      name,
      password: hashedPassword,
      darkMode: false,
      notificationsEnabled: false,
    };

    usersDb[name] = newUser;
    localStorage.setItem('plant_app_users_db', JSON.stringify(usersDb));

    const { password: _, ...userWithoutPassword } = newUser;
    saveUser(userWithoutPassword as User);
  };

  const logout = () => {
    saveUser(null);
  };

  const updateProfilePicture = (url: string) => {
    if (user) {
      saveUser({ ...user, profilePicture: url });
    }
  };

  const toggleDarkMode = () => {
    if (user) {
      saveUser({ ...user, darkMode: !user.darkMode });
    }
  };

  const toggleNotifications = async () => {
    if (user) {
      if (!user.notificationsEnabled) {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            saveUser({ ...user, notificationsEnabled: true });
          } else {
            alert('Notification permission denied. Please enable it in your browser settings.');
          }
        } else {
          alert('This browser does not support desktop notifications.');
        }
      } else {
        saveUser({ ...user, notificationsEnabled: false });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfilePicture, toggleDarkMode, toggleNotifications }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
