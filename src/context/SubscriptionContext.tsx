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
  const [isPro, setIsPro] = useState(false);
  
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
      setIsPro(parsed.isPro || false);
      
      const today = new Date().toDateString();
      if (parsed.lastResetDate !== today) {
        // Reset daily limits
        setScansUsed(parsed.scansUsed || 0); // Scans might not be daily? Wait, "three scans allowed and after that they need to see a ad for each extra scan." It implies lifetime or session. Let's make it lifetime/session. Actually, usually it's daily. Let's make doctor and lessons daily as requested.
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
      isPro,
      scansUsed,
      doctorImagesUsed,
      lessonsUsed,
      lastResetDate
    };
    localStorage.setItem('biolife_subscription_state', JSON.stringify(state));
  }, [isPro, scansUsed, doctorImagesUsed, lessonsUsed, lastResetDate]);

  const upgradeToPro = () => {
    setIsPro(true);
    setShowPaywall(false);
    alert("Successfully upgraded to BioLife Pro! (RevenueCat Mock)");
  };

  const incrementScans = () => setScansUsed(prev => prev + 1);
  const incrementDoctorImages = () => setDoctorImagesUsed(prev => prev + 1);
  const incrementLessons = () => setLessonsUsed(prev => prev + 1);

  const canAddPlant = (currentCount: number) => {
    if (isPro) return true;
    return currentCount < 5;
  };

  return (
    <SubscriptionContext.Provider value={{
      isPro,
      upgradeToPro,
      scansUsed,
      incrementScans,
      doctorImagesUsed,
      incrementDoctorImages,
      lessonsUsed,
      incrementLessons,
      canAddPlant,
      showPaywall,
      setShowPaywall,
      paywallMessage,
      setPaywallMessage
    }}>
      {children}
      
      {/* Global Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🌟
              </div>
              <h2 className="text-2xl font-bold text-stone-800">BioLife Pro</h2>
              <p className="text-stone-600 mt-2">{paywallMessage || "Upgrade to Pro to unlock unlimited features!"}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span>
                <span className="text-stone-700">Unlimited AI Plant Diagnostics</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span>
                <span className="text-stone-700">Unlimited Plant Tracking (Max 5 on free)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span>
                <span className="text-stone-700">Unlimited AI Doctor Chat</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span>
                <span className="text-stone-700">Unlock Nearby Stores</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500">✓</span>
                <span className="text-stone-700">Ad-free Experience</span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button 
                onClick={upgradeToPro}
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Subscribe Now (Mock Purchase)
              </button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="w-full bg-stone-100 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-200 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
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
