import { Settings, Award, Droplets, Leaf, ChevronRight, Bell, Shield, LogOut, Moon, Sun, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, toggleDarkMode, updateProfilePicture, toggleNotifications } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: t('Plants'), value: '12', icon: Leaf, color: 'text-emerald-500 bg-emerald-50' },
    { label: t('Care Streak'), value: '14 Days', icon: Droplets, color: 'text-blue-500 bg-blue-50' },
    { label: t('Scans'), value: '45', icon: Award, color: 'text-amber-500 bg-amber-50' },
  ];

  const achievements = [
    { id: '1', title: 'Green Thumb', description: 'Kept 5 plants alive for 3 months', icon: '🌱', unlocked: true },
    { id: '2', title: 'Water Boy', description: 'Watered plants on time for 7 days', icon: '💧', unlocked: true },
    { id: '3', title: 'Plant Doctor', description: 'Scanned 10 sick plants', icon: '🩺', unlocked: false },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 dark:bg-stone-900 dark:text-stone-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100">{t('Profile')}</h1>
        <button className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* User Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-stone-200 dark:bg-stone-700 border-4 border-white dark:border-stone-800 shadow-md overflow-hidden shrink-0">
            <img src={user?.profilePicture || "https://picsum.photos/seed/user/200/200"} alt={user?.name} className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full shadow-md hover:bg-emerald-700 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{user?.name || t('Plant Parent')}</h2>
          <p className="text-stone-500 dark:text-stone-400">{t('Plant Parent since 2023')}</p>
          <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100 dark:border-emerald-800">
            <Award className="w-4 h-4" />
            {t('Level 5 Botanist')}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-stone-800 rounded-2xl p-4 border border-stone-100 dark:border-stone-700 shadow-sm flex flex-col items-center text-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color} dark:bg-opacity-20`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">{stat.value}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">{t('Achievements')}</h2>
          <button className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center">
            {t('See All')} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden">
          {achievements.map((achievement, i) => (
            <div key={achievement.id} className={`flex items-center gap-4 p-4 border-b border-stone-100 dark:border-stone-700 last:border-0 ${!achievement.unlocked ? 'opacity-50 grayscale' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-700 flex items-center justify-center text-2xl shrink-0">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-800 dark:text-stone-100">{t(achievement.title)}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">{t(achievement.description)}</p>
              </div>
              {achievement.unlocked && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Links */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">{t('Settings')}</h2>
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700 shadow-sm overflow-hidden">
          <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                {user?.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <span className="font-bold text-stone-800 dark:text-stone-100">{t('Dark Mode')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${user?.darkMode ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'} relative dark:border dark:border-white`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${user?.darkMode ? 'translate-x-7' : 'translate-x-1'} force-white-bg`} />
            </div>
          </button>
          <button onClick={toggleNotifications} className="w-full flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-bold text-stone-800 dark:text-stone-100">{t('Notifications')}</span>
            </div>
            <div className={`w-12 h-6 rounded-full transition-colors ${user?.notificationsEnabled ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-600'} relative dark:border dark:border-white`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${user?.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'} force-white-bg`} />
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-stone-800 dark:text-stone-100">{t('Privacy & Security')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
          <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-bold text-red-600 dark:text-red-400">{t('Log Out')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
