import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeProps {
  onComplete?: () => void;
}

export default function Welcome({ onComplete }: WelcomeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const handleGetStarted = () => {
    if (onComplete) {
      onComplete();
    }
    // Re-evaluate the current route now that hasVisitedSession is true
    navigate(location.pathname + location.search, { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-8">
        
        {/* Icon & App Name */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-sm">
            <Leaf className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-700 tracking-tight">{t('BioLife')}</h1>
        </div>

        {/* Headline & Description */}
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-stone-900 leading-tight">
            {t('Take Care of Your Plants, Effortlessly')}
          </h2>
          <p className="text-lg text-stone-600">
            {t('Track your plants, get reminders, and help them grow healthy every day.')}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-stone-100 space-y-4 text-left">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <span className="text-stone-700 font-medium">{t('Track all your plants in one place')}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <span className="text-stone-700 font-medium">{t('Get watering reminders')}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <span className="text-stone-700 font-medium">{t('Monitor plant health easily')}</span>
          </div>
        </div>

        {/* Friendly Line */}
        <p className="text-stone-600 font-medium italic">
          {t('Your plants deserve the best care — and we’re here to help 🌱')}
        </p>

        {/* Action Button */}
        <div className="w-full pt-4">
          <button
            onClick={handleGetStarted}
            className="w-full bg-emerald-600 text-white py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            {t('Get Started')}
          </button>
          <p className="text-sm text-stone-400 mt-4">
            {t('It only takes a few seconds to begin')}
          </p>
        </div>

      </div>
    </div>
  );
}
