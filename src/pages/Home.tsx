import { Link } from 'react-router-dom';
import { Camera, Droplets, Sun, Thermometer, ChevronRight, Plus, CheckCircle, Circle } from 'lucide-react';
import { usePlants } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export default function Home() {
  const { plants, schedule, setSchedule } = usePlants();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysTasks = schedule.filter(task => task.date === todayStr);

  const toggleTask = (id: string) => {
    setSchedule(schedule.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const currentHour = new Date().getHours();
  let greeting = t('Good evening');
  if (currentHour >= 5 && currentHour < 12) {
    greeting = t('Good morning');
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = t('Good afternoon');
  }

  const userName = user?.name || 'Plant Lover';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{greeting}, {userName}! 🌿</h1>
          <p className="text-stone-500 mt-1">{t('Your plants are looking great today.')}</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden">
          <img src={user?.profilePicture || "https://picsum.photos/seed/user/100/100"} alt="User" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Quick Scan Action */}
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
        <div className="relative z-10 w-2/3">
          <h2 className="text-xl font-bold mb-2">{t('Check Plant Health')}</h2>
          <p className="text-emerald-100 text-sm mb-4">{t('Scan your plant to get instant AI diagnosis and care tips.')}</p>
          <Link to="/scan" className="inline-flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-full font-semibold text-sm hover:bg-emerald-50 transition-colors">
            <Camera className="w-4 h-4" />
            {t('Scan Now')}
          </Link>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-20">
          <Camera className="w-48 h-48" />
        </div>
      </div>

      {/* Today's Tasks */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-stone-800">{t("Today's Tasks")}</h2>
          <Link to="/schedule" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
            {t('View Schedule')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {todaysTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysTasks.map(task => (
              <div 
                key={task.id} 
                className={clsx(
                  "bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-4 transition-all",
                  task.completed ? "border-emerald-100 bg-emerald-50/30 opacity-75" : "border-stone-100 hover:border-emerald-200"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  task.completed ? "bg-emerald-50 text-emerald-500" : 
                  task.type === 'scan' ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500"
                )}>
                  {task.type === 'scan' ? <Camera className="w-6 h-6" /> : <Droplets className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={clsx(
                    "font-bold truncate",
                    task.completed ? "text-stone-500 line-through" : "text-stone-800"
                  )}>
                    {task.plant}
                  </h3>
                  <p className="text-sm text-stone-500 truncate">{t(task.amount)} • {t(task.time)}</p>
                </div>
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                    task.completed ? "text-emerald-500" : "text-stone-300 hover:text-emerald-400"
                  )}
                >
                  {task.completed ? <CheckCircle className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 border-dashed flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-8 h-8 text-stone-400 mb-2" />
            <h3 className="font-bold text-stone-800">{t('All caught up!')}</h3>
            <p className="text-sm text-stone-500">{t('No tasks scheduled for today.')}</p>
          </div>
        )}
      </div>

      {/* My Plants Overview */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-stone-800">{t('My Plants')}</h2>
          <Link to="/plants" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
            {t('See All')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {plants.slice(0, 5).map(plant => (
            <Link key={plant.id} to={`/plants/${plant.id}`} className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="aspect-square rounded-xl overflow-hidden mb-3 relative">
                <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-emerald-700 shadow-sm">
                  {plant.health}%
                </div>
              </div>
              <h3 className="font-bold text-stone-800 truncate">{plant.name}</h3>
              <p className="text-xs text-stone-500 truncate">{t(plant.type)}</p>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg w-fit">
                <Droplets className="w-3 h-3" />
                {t(plant.nextWater)}
              </div>
            </Link>
          ))}
          <Link to="/plants" className="bg-stone-100 rounded-2xl p-3 border border-stone-200 border-dashed flex flex-col items-center justify-center text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-colors min-h-[200px]">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-medium text-sm">{t('Add Plant')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
