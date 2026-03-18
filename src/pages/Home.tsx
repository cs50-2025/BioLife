import { Link } from 'react-router-dom';
import { Camera, Droplets, Sun, Thermometer, ChevronRight, Plus, CheckCircle, Circle, Leaf, Award, Calendar } from 'lucide-react';
import { usePlants } from '../context/PlantContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { clsx } from 'clsx';

export default function Home() {
  const { plants, schedule, setSchedule, streak } = usePlants();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysTasks = schedule.filter(task => task.date === todayStr);
  const completedTasks = todaysTasks.filter(task => task.completed);
  const pendingTasks = todaysTasks.filter(task => !task.completed);

  const toggleTask = (id: string) => {
    setSchedule(schedule.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">
            {t("Welcome back! Let's take care of your plants 🌱")}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-stone-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
          <img src={user?.profilePicture || "https://picsum.photos/seed/user/100/100"} alt="User" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Dashboard Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-stone-800">{plants.length}</p>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Total Plants')}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-stone-800">{pendingTasks.length}</p>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Needs Water')}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-500">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-stone-800">{completedTasks.length}</p>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Cared For')}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-amber-50 text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold text-stone-800">{streak}</p>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Day Streak')}</p>
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      {pendingTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-full shrink-0">
            <Droplets className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-blue-900">{t('Watering Alert')}</h3>
            <p className="text-blue-800 text-sm">{t(`You have ${pendingTasks.length} plant(s) that need water today.`)}</p>
          </div>
        </div>
      )}

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
                  "bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-4 transition-all cursor-pointer",
                  task.completed ? "border-emerald-100 bg-emerald-50/30 opacity-75" : "border-stone-100 hover:border-emerald-200"
                )}
                onClick={() => toggleTask(task.id)}
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
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                    task.completed ? "text-emerald-500" : "text-stone-300 hover:text-emerald-400"
                  )}
                >
                  {task.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-3xl p-8 text-center border border-stone-100 border-dashed">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-1">{t("All caught up!")}</h3>
            <p className="text-stone-500 text-sm mb-6">{t("You don't have any tasks scheduled for today.")}</p>
            <Link to="/add" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
              <Plus className="w-5 h-5" />
              {t('Add a Plant')}
            </Link>
          </div>
        )}
      </div>

      {/* Your Plants Preview */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-stone-800">{t("Your Plants")}</h2>
          <Link to="/plants" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
            {t('View All')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {plants.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {plants.slice(0, 5).map(plant => (
              <Link key={plant.id} to={`/plants/${plant.id}`} className="bg-white rounded-3xl p-3 border border-stone-100 shadow-sm min-w-[160px] shrink-0 group hover:shadow-md transition-all">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 relative">
                  <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">
                    {plant.health}%
                  </div>
                </div>
                <h3 className="font-bold text-stone-800 truncate">{plant.name}</h3>
                <p className="text-xs text-stone-500 truncate">{t(plant.type)}</p>
              </Link>
            ))}
            <Link to="/add" className="bg-stone-50 rounded-3xl p-3 border-2 border-dashed border-stone-200 min-w-[160px] shrink-0 flex flex-col items-center justify-center text-stone-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm">{t('Add Plant')}</span>
            </Link>
          </div>
        ) : (
          <div className="bg-stone-50 rounded-3xl p-8 text-center border border-stone-100 border-dashed">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-1">{t("No plants yet 🌱")}</h3>
            <p className="text-stone-500 text-sm mb-6">{t("Add your first plant to start tracking its care.")}</p>
            <Link to="/add" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">
              <Plus className="w-5 h-5" />
              {t('Add your first plant')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
