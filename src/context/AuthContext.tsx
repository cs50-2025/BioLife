import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  id: string;
  name: string;
  profilePicture?: string;
  darkMode: boolean;
  notificationsEnabled?: boolean;
  tutorialSeen?: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthReady: boolean;
  login: (name: string, password?: string) => Promise<void>;
  signup: (name: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePicture: (url: string) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('biolife_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    setIsAuthReady(true);
  }, []);

  const saveUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('biolife_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('biolife_user');
    }
  };

  const login = async (name: string, password?: string) => {
    if (!password) throw new Error('Password is required');
    
    // Mock login logic
    const storedUsers = JSON.parse(localStorage.getItem('biolife_users_db') || '{}');
    const userRecord = storedUsers[name.toLowerCase()];
    
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Incorrect username or password.');
    }
    
    const loggedInUser: User = {
      id: userRecord.id,
      name: userRecord.name,
      profilePicture: userRecord.profilePicture,
      darkMode: userRecord.darkMode || false,
      notificationsEnabled: userRecord.notificationsEnabled || false,
      tutorialSeen: userRecord.tutorialSeen || false,
    };
    
    saveUser(loggedInUser);
    if (loggedInUser.darkMode) {
      document.documentElement.classList.add('dark');
    }
  };

  const signup = async (name: string, password?: string) => {
    if (!password) throw new Error('Password is required');
    
    const storedUsers = JSON.parse(localStorage.getItem('biolife_users_db') || '{}');
    if (storedUsers[name.toLowerCase()]) {
      throw new Error('Username already exists. Please log in.');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      darkMode: false,
      notificationsEnabled: false,
      tutorialSeen: false,
    };
    
    storedUsers[name.toLowerCase()] = { ...newUser, password };
    localStorage.setItem('biolife_users_db', JSON.stringify(storedUsers));
    
    saveUser(newUser);
  };

  const logout = async () => {
    saveUser(null);
    document.documentElement.classList.remove('dark');
  };

  const updateProfilePicture = async (url: string) => {
    if (user) {
      const updatedUser = { ...user, profilePicture: url };
      saveUser(updatedUser);
      
      // Update in mock DB
      const storedUsers = JSON.parse(localStorage.getItem('biolife_users_db') || '{}');
      if (storedUsers[user.name.toLowerCase()]) {
        storedUsers[user.name.toLowerCase()].profilePicture = url;
        localStorage.setItem('biolife_users_db', JSON.stringify(storedUsers));
      }
    }
  };

  const toggleDarkMode = async () => {
    if (user) {
      const newDarkMode = !user.darkMode;
      const updatedUser = { ...user, darkMode: newDarkMode };
      saveUser(updatedUser);
      
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Update in mock DB
      const storedUsers = JSON.parse(localStorage.getItem('biolife_users_db') || '{}');
      if (storedUsers[user.name.toLowerCase()]) {
        storedUsers[user.name.toLowerCase()].darkMode = newDarkMode;
        localStorage.setItem('biolife_users_db', JSON.stringify(storedUsers));
      }
    }
  };

  const toggleNotifications = async () => {
    if (user) {
      if (!user.notificationsEnabled) {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const updatedUser = { ...user, notificationsEnabled: true };
            saveUser(updatedUser);
            
            const storedUsers = JSON.parse(localStorage.getItem('biolife_users_db') || '{}');
            if (storedUsers[user.name.toLowerCase()]) {
              storedUsers[user.name.toLowerCase()].notificationsEnabled = true;
              localStorage.setItem('biolife_users_db', JSON.stringify(storedUsers));
            }
          } else {
            alert('Notification permission denied. Please enable it in your browser settings.');
          }
        } else {
          alert('This browser does not support desktop notifications.');
        }
      } else {
        const updatedUser = { ...user, notificationsEnabled: false };
        saveUser(updatedUser);
        
        const storedUsers = JSON.parse(localStorage.getItem('biolife_users_db') || '{}');
        if (storedUsers[user.name.toLowerCase()]) {
          storedUsers[user.name.toLowerCase()].notificationsEnabled = false;
          localStorage.setItem('biolife_users_db', JSON.stringify(storedUsers));
        }
      }
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      saveUser(updatedUser);
      
      const storedUsers = JSON.parse(localStorage.getItem('biolife_users_db') || '{}');
      if (storedUsers[user.name.toLowerCase()]) {
        storedUsers[user.name.toLowerCase()] = { ...storedUsers[user.name.toLowerCase()], ...updates };
        localStorage.setItem('biolife_users_db', JSON.stringify(storedUsers));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, signup, logout, updateProfilePicture, toggleDarkMode, toggleNotifications, updateProfile }}>
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
