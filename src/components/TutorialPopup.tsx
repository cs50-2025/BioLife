import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function TutorialPopup() {
  const { t } = useLanguage();
  const { user, isAuthReady, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!user || user.tutorialSeen || !isAuthReady || !isVisible) {
    return null;
  }

  const steps = [
    {
      title: t('Welcome to BioLife'),
      description: t('Track your plants, get AI diagnosis, and earn achievements!'),
      target: null,
    },
    {
      title: t('Add Your First Plant'),
      description: t('Tap the + button to add a plant to your collection.'),
      target: 'add-plant-btn',
    },
    {
      title: t('Track Health & Schedule'),
      description: t('Scan plants for AI diagnosis and follow the smart watering schedule.'),
      target: 'nav-scan',
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsVisible(false);
    if (user) {
      try {
        await updateProfile({ tutorialSeen: true });
      } catch (error) {
        console.error("Error updating tutorial status:", error);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={handleComplete}
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white dark:bg-stone-800 rounded-3xl p-8 max-w-sm w-[90%] shadow-2xl pointer-events-auto overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mb-6 text-3xl">
              {step === 0 ? '👋' : step === 1 ? '🌱' : '📷'}
            </div>
            
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
              {steps[step].title}
            </h2>
            
            <p className="text-stone-600 dark:text-stone-300 mb-8 leading-relaxed">
              {steps[step].description}
            </p>

            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-emerald-500' : 'w-2 bg-stone-200 dark:bg-stone-700'}`}
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleComplete}
                  className="px-4 py-2 text-sm font-semibold text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
                >
                  {t('Skip')}
                </button>
                <button 
                  onClick={handleNext}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-full shadow-md transition-colors"
                >
                  {step === steps.length - 1 ? t('Get Started') : t('Next')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
