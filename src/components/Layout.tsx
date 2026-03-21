import { Outlet, NavLink } from 'react-router-dom';
import { Home, Camera, Leaf, Calendar, BookOpen, MapPin, MessageCircle, User, Globe, Download } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import { usePWAInstall } from '../hooks/usePWAInstall';
import TutorialPopup from './TutorialPopup';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { t, language, setLanguage } = useLanguage();
  const { isInstallable, installApp } = usePWAInstall();
  useNotifications();

  const mobileNavItems = [
    { to: '/', icon: Home, label: t('Home') },
    { to: '/plants', icon: Leaf, label: t('My Plants') },
    { to: '/scan', icon: Camera, label: t('Scan'), id: 'nav-scan' },
    { to: '/schedule', icon: Calendar, label: t('Schedule') },
    { to: '/doctor', icon: MessageCircle, label: t('Doctor') || 'Doctor' },
    { to: '/guide', icon: BookOpen, label: t('Care Guide') || 'Care Guide' },
    { to: '/stores', icon: MapPin, label: t('Nearby Stores') || 'Nearby Stores' },
    { to: '/profile', icon: User, label: t('Profile') },
  ];

  const desktopNavItems = [
    { to: '/', icon: Home, label: t('Home') },
    { to: '/plants', icon: Leaf, label: t('My Plants') },
    { to: '/scan', icon: Camera, label: t('Scan'), id: 'nav-scan' },
    { to: '/schedule', icon: Calendar, label: t('Schedule') },
    { to: '/doctor', icon: MessageCircle, label: t('Doctor') || 'Doctor' },
  ];

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans overflow-hidden">
      <TutorialPopup />
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col py-4 px-2 z-50 shrink-0">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-stone-800 tracking-tight">BioLife</span>
        </div>
        
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto px-2">
          {desktopNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm active-nav-link' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="mt-8 mb-2 px-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
            {t('Explore') || 'Explore'}
          </div>
          <NavLink
            to="/guide"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm active-nav-link' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )
            }
          >
            <BookOpen className="w-5 h-5" />
            <span>{t('Care Guide') || 'Care Guide'}</span>
          </NavLink>
          <NavLink
            to="/stores"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm active-nav-link' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )
            }
          >
            <MapPin className="w-5 h-5" />
            <span>{t('Nearby Stores') || 'Nearby Stores'}</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm active-nav-link' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )
            }
          >
            <User className="w-5 h-5" />
            <span>{t('Profile')}</span>
          </NavLink>

          <div className="mt-auto pt-4 px-4">
            {isInstallable && (
              <button 
                onClick={installApp}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-bold transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>{t('Install App')}</span>
              </button>
            )}
            <div className="mt-6 text-stone-500 text-sm font-medium text-center">
              &copy; BioLife
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-stone-200 z-50 md:hidden pb-safe">
        <div className="flex overflow-x-auto hide-scrollbar px-4 py-2 gap-2 overscroll-x-contain items-center justify-around" style={{ WebkitOverflowScrolling: 'touch' }}>
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[72px] shrink-0',
                  isActive ? 'text-emerald-600 active-nav-link bg-emerald-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-6 h-6 mb-1 transition-transform", isActive && "scale-110")} />
                  <span className="text-[10px] font-semibold whitespace-nowrap">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
          {/* Spacer to ensure the last item isn't cut off by padding */}
          <div className="w-2 shrink-0" aria-hidden="true" />
        </div>
      </nav>
    </div>
  );
}
