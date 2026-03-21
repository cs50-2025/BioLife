import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const { signup, user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthReady && user) {
      navigate('/', { replace: true });
    }
  }, [user, isAuthReady, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 100));
      }, 50);
    } else if (!isHolding && progress < 100) {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, progress]);

  useEffect(() => {
    if (progress === 100) {
      setIsVerified(true);
    }
  }, [progress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      setError(t('Please complete the bot check'));
      return;
    }
    setError('');
    try {
      await signup(name, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('Failed to sign up'));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <Leaf className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-stone-900">{t('Create a new account')}</h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          {t('Or')}{' '}
          <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
            {t('sign in to your existing account')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                {t('Username')}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                {t('Password')}
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-stone-700">
                {t('Bot Check')}
              </label>
              <div
                className="w-full h-6 bg-stone-200 rounded-md overflow-hidden cursor-pointer relative select-none"
                onMouseDown={() => !isVerified && setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onMouseLeave={() => setIsHolding(false)}
                onTouchStart={() => !isVerified && setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
              >
                <div
                  className="h-full bg-emerald-500 transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-700">
                  {isVerified ? t('Verified') : t('Hold to verify')}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!isVerified}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-stone-400 disabled:cursor-not-allowed"
              >
                {t('Sign up')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
