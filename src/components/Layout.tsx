import { Outlet, NavLink } from 'react-router-dom';
import { Home, Camera, Leaf, Calendar, BookOpen, MapPin, MessageCircle, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/plants', icon: Leaf, label: 'My Plants' },
    { to: '/scan', icon: Camera, label: 'Scan' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/doctor', icon: MessageCircle, label: 'Doctor' },
  ];

  return (
    <div className="flex h-screen bg-stone-50 text-stone-900 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 bg-white border-r border-stone-200 flex-col py-4 px-2 z-50 shrink-0">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-stone-800 tracking-tight">BioLife</span>
        </div>
        
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <div className="mt-8 mb-2 px-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
            Explore
          </div>
          <NavLink
            to="/guide"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )
            }
          >
            <BookOpen className="w-5 h-5" />
            <span>Care Guide</span>
          </NavLink>
          <NavLink
            to="/stores"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )
            }
          >
            <MapPin className="w-5 h-5" />
            <span>Nearby Stores</span>
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                isActive ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
              )
            }
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-stone-200 px-2 py-2 flex justify-around items-center z-50 md:hidden pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center p-2 rounded-xl transition-colors min-w-[64px]',
                isActive ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-6 h-6 mb-1 transition-transform", isActive && "scale-110")} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
