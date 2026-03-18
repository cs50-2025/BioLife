import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to convert username to a dummy email for Firebase Auth
const getDummyEmail = (username: string) => `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@biolife.local`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<User, 'id'>;
            const fullUser = { id: firebaseUser.uid, ...userData };
            setUser(fullUser);
            if (fullUser.darkMode) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        document.documentElement.classList.remove('dark');
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (name: string, password?: string) => {
    if (!password) throw new Error('Password is required');
    const email = getDummyEmail(name);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new Error('Incorrect username or password.');
      }
      throw error;
    }
  };

  const signup = async (name: string, password?: string) => {
    if (!password) throw new Error('Password is required');
    const email = getDummyEmail(name);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: Omit<User, 'id'> = {
        name,
        darkMode: false,
        notificationsEnabled: false,
        tutorialSeen: false,
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        username: name,
        createdAt: new Date().toISOString(),
        ...newUser
      });
      
      await updateProfile(userCredential.user, { displayName: name });
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Username already exists. Please log in.');
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfilePicture = async (url: string) => {
    if (user) {
      const updatedUser = { ...user, profilePicture: url };
      setUser(updatedUser);
      await updateDoc(doc(db, 'users', user.id), { profilePicture: url });
    }
  };

  const toggleDarkMode = async () => {
    if (user) {
      const newDarkMode = !user.darkMode;
      const updatedUser = { ...user, darkMode: newDarkMode };
      setUser(updatedUser);
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      await updateDoc(doc(db, 'users', user.id), { darkMode: newDarkMode });
    }
  };

  const toggleNotifications = async () => {
    if (user) {
      if (!user.notificationsEnabled) {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            const updatedUser = { ...user, notificationsEnabled: true };
            setUser(updatedUser);
            await updateDoc(doc(db, 'users', user.id), { notificationsEnabled: true });
          } else {
            alert('Notification permission denied. Please enable it in your browser settings.');
          }
        } else {
          alert('This browser does not support desktop notifications.');
        }
      } else {
        const updatedUser = { ...user, notificationsEnabled: false };
        setUser(updatedUser);
        await updateDoc(doc(db, 'users', user.id), { notificationsEnabled: false });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, signup, logout, updateProfilePicture, toggleDarkMode, toggleNotifications }}>
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
