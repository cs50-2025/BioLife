import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Sparkles, Droplets, Activity, Bot, ChevronRight } from 'lucide-react';
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
    navigate('/signup');
  };

  const handleSignIn = () => {
    if (onComplete) {
      onComplete();
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-emerald-500/30 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-emerald-200 flex items-center justify-center bg-emerald-50">
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">BioLife</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleSignIn}
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            {t('Sign In')}
          </button>
          <button 
            onClick={handleGetStarted}
            className="text-sm font-medium text-emerald-700 px-5 py-2 rounded-full border border-emerald-200 hover:bg-emerald-50 transition-colors"
          >
            {t('Get Started')}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-5xl mx-auto w-full text-center">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-200 bg-stone-50 mb-8">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[10px] font-semibold tracking-widest text-stone-600 uppercase">
            {t('BioLife Plant Intelligence')}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black tracking-tighter leading-[0.9] mb-6">
          <span className="text-stone-900 block">{t('Your Garden,')}</span>
          <span className="text-emerald-600 block mt-2">{t('Reimagined')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          {t('BioLife fuses botanical intelligence with futuristic design. Track, nurture, and diagnose your plants with AI-powered precision.')}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-24">
          <button 
            onClick={handleGetStarted}
            className="group flex items-center gap-2 bg-emerald-600 border border-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
          >
            {t('Enter BioLife')}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={handleSignIn}
            className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            {t('I have an account')}
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
          
          {/* Card 1 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 transition-colors shadow-sm">
            <div className="w-10 h-10 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-center mb-5">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 tracking-tight">{t('Smart Tracking')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t('Monitor every plant in your garden with real-time health scores and growth data.')}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 transition-colors shadow-sm">
            <div className="w-10 h-10 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-center mb-5">
              <Droplets className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 tracking-tight">{t('Water Intelligence')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t("AI-calculated watering schedules that adapt to each plant's unique needs.")}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 transition-colors shadow-sm">
            <div className="w-10 h-10 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-center mb-5">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 tracking-tight">{t('Health Diagnostics')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t('Visual health indicators and trend analysis for your entire botanical collection.')}
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 transition-colors shadow-sm">
            <div className="w-10 h-10 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-center mb-5">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 tracking-tight">{t('AI Plant Doctor')}</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t('Describe symptoms, get instant diagnosis and treatment plans powered by AI.')}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
