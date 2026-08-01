import React, { createContext, useContext, useState, useEffect } from 'react';

export type SubscriptionContextType = {
  isPro: boolean;
  upgradeToPro: () => void;
  scansUsed: number;
  incrementScans: () => void;
  doctorImagesUsed: number;
  incrementDoctorImages: () => void;
  lessonsUsed: number;
  incrementLessons: () => void;
  canAddPlant: (currentCount: number) => boolean;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
  paywallMessage: string;
  setPaywallMessage: (message: string) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPro] = useState(true);
  
  // Usage tracking
  const [scansUsed, setScansUsed] = useState(0);
  const [doctorImagesUsed, setDoctorImagesUsed] = useState(0);
  const [lessonsUsed, setLessonsUsed] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(new Date().toDateString());
  
  // UI State
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState('');

  // Load from local storage and check daily resets
  useEffect(() => {
    const savedState = localStorage.getItem('biolife_subscription_state');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      const today = new Date().toDateString();
      if (parsed.lastResetDate !== today) {
        setDoctorImagesUsed(0);
        setLessonsUsed(0);
        setLastResetDate(today);
      } else {
        setScansUsed(parsed.scansUsed || 0);
        setDoctorImagesUsed(parsed.doctorImagesUsed || 0);
        setLessonsUsed(parsed.lessonsUsed || 0);
        setLastResetDate(parsed.lastResetDate || today);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    const state = {
      isPro: true,
      scansUsed,
      doctorImagesUsed,
      lessonsUsed,
      lastResetDate
    };
    localStorage.setItem('biolife_subscription_state', JSON.stringify(state));
  }, [scansUsed, doctorImagesUsed, lessonsUsed, lastResetDate]);

  const upgradeToPro = () => {
    setShowPaywall(false);
  };

  const incrementScans = () => setScansUsed(prev => prev + 1);
  const incrementDoctorImages = () => setDoctorImagesUsed(prev => prev + 1);
  const incrementLessons = () => setLessonsUsed(prev => prev + 1);

  const canAddPlant = (_currentCount: number) => {
    return true;
  };

  return (
    <SubscriptionContext.Provider value={{
      isPro: true,
      upgradeToPro,
      scansUsed,
      incrementScans,
      doctorImagesUsed,
      incrementDoctorImages,
      lessonsUsed,
      incrementLessons,
      canAddPlant,
      showPaywall: false,
      setShowPaywall: () => {},
      paywallMessage: '',
      setPaywallMessage: () => {}
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
