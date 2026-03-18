import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Sun, Thermometer, Wind, Calendar as CalendarIcon, AlertTriangle, CheckCircle, Edit3, Trash2, Leaf, Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usePlants, Task } from '../context/PlantContext';
import { useLanguage } from '../context/LanguageContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO, startOfDay, isSameWeek } from 'date-fns';
import { clsx } from 'clsx';

export default function PlantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plants, deletePlant, updatePlant, schedule, setSchedule, addTask } = usePlants();
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustFrequency, setAdjustFrequency] = useState(7);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');

  const plant = plants.find(p => p.id === id);

  const handleEditOpen = () => {
    if (plant) {
      setEditName(plant.name);
      setEditType(plant.type);
      setShowEditModal(true);
    }
  };

  const handleEditSave = () => {
    if (plant && id) {
      updatePlant(id, { name: editName, type: editType });
      setShowEditModal(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`${t('Are you sure you want to delete')} ${plant?.name}?`)) {
      if (id) {
        deletePlant(id);
        navigate('/plants');
      }
    }
  };

  if (!plant) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-stone-800 mb-2">{t('Plant Not Found')}</h2>
        <p className="text-stone-500 mb-6">{t('This plant might have been removed or doesn\'t exist.')}</p>
        <button onClick={() => navigate('/plants')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">
          {t('Back to My Plants')}
        </button>
      </div>
    );
  }

  const plantTasks = schedule.filter(t => t.plant === plant.name);

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const markAsWatered = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const existingTask = plantTasks.find(t => t.date === todayStr && (t.type === 'water' || !t.type));
    
    if (existingTask) {
      setSchedule(schedule.map(t => t.id === existingTask.id ? { ...t, completed: true } : t));
    } else {
      addTask({
        id: Date.now().toString(),
        plant: plant.name,
        time: 'Anytime',
        amount: 'Watered',
        completed: true,
        date: todayStr,
        type: 'water'
      });
    }

    // Update plant history and lastWatered
    updatePlant(plant.id, {
      lastWatered: 'Today',
      history: [
        { date: format(new Date(), 'MMM dd'), event: 'Watered', type: 'water' },
        ...plant.history
      ]
    });
  };

  const handleWeeklyScan = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    // Add a completed scan task for today
    addTask({
      id: Date.now().toString() + 'scan',
      plant: plant.name,
      time: 'Anytime',
      amount: 'Weekly Health Scan',
      completed: true,
      date: todayStr,
      type: 'scan'
    });

    // Update plant history
    updatePlant(plant.id, {
      health: Math.floor(Math.random() * 20) + 80, // Simulate a new health score between 80-100
      history: [
        { date: format(new Date(), 'MMM dd'), event: 'Weekly Health Scan', type: 'scan' },
        ...plant.history
      ]
    });
    
    alert(t('Weekly scan completed! Your plant looks healthy.'));
  };

  const handleAdjustSchedule = () => {
    // Remove future uncompleted water tasks for this plant
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const newSchedule = schedule.filter(t => {
      if (t.plant !== plant.name) return true;
      if (t.type !== 'water' && t.type !== undefined) return true;
      if (t.date <= todayStr || t.completed) return true;
      return false; // Remove future uncompleted water tasks
    });

    // Generate new tasks based on frequency
    const today = new Date();
    for (let i = adjustFrequency; i <= 60; i += adjustFrequency) {
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + i);
      newSchedule.push({
        id: Date.now().toString() + 'water' + i,
        plant: plant.name,
        time: 'Morning',
        amount: 'Regular watering',
        completed: false,
        date: format(taskDate, 'yyyy-MM-dd'),
        type: 'water'
      });
    }

    setSchedule(newSchedule);
    setShowAdjustModal(false);
  };

  const hasCompletedScanThisWeek = (date: Date) => {
    return plantTasks.some(t => t.type === 'scan' && t.completed && isSameWeek(parseISO(t.date), date));
  };

  return (
    <div className="pb-24 md:pb-8 bg-stone-50 min-h-screen">
      {/* Header Image & Actions */}
      <div className="relative h-72 md:h-96 w-full">
        <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <Link to="/plants" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex gap-2">
            <button onClick={handleEditOpen} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={handleDelete} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white z-10">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{plant.name}</h1>
              <p className="text-stone-300 font-medium">{plant.type}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-emerald-500/90 backdrop-blur-sm px-3 py-1.5 rounded-xl font-bold text-lg flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-5 h-5" />
                {plant.health}%
              </div>
              <span className="text-xs text-stone-300 mt-1 uppercase tracking-wider font-semibold">{t('Health Score')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 -mt-4 relative z-20">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button onClick={markAsWatered} className="bg-blue-600 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
            <Droplets className="w-6 h-6" />
            <span className="font-bold">{t('Mark as Watered')}</span>
          </button>
          <button onClick={() => setShowAdjustModal(true)} className="bg-white text-emerald-700 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-emerald-50 transition-colors">
            <CalendarIcon className="w-6 h-6" />
            <span className="font-bold">{t('Adjust Schedule')}</span>
          </button>
          <button onClick={handleWeeklyScan} className="bg-purple-600 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-colors col-span-2 md:col-span-1">
            <Camera className="w-6 h-6" />
            <span className="font-bold">{t('Weekly Scan')}</span>
          </button>
        </div>

        {/* Watering Calendar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-stone-800">{t('Watering Calendar')}</h2>
            <div className="flex items-center gap-4">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-stone-600" />
              </button>
              <span className="font-bold text-stone-800 min-w-[100px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button onClick={handleNextMonth} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <ChevronRight className="w-5 h-5 text-stone-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-stone-400 uppercase tracking-wider py-2">
                {t(day)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayTasks = plantTasks.filter(t => t.date === dateStr);
              const waterTask = dayTasks.find(t => t.type === 'water' || !t.type);
              
              // Weekly scan logic: show if no scan completed this week, and it's today or in the future
              const scanCompletedThisWeek = hasCompletedScanThisWeek(day);
              const isFutureOrToday = startOfDay(day) >= startOfDay(new Date());
              const showScanIcon = !scanCompletedThisWeek && isFutureOrToday;
              
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div 
                  key={idx} 
                  className={clsx(
                    "aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-all",
                    !isCurrentMonth ? "opacity-30 border-transparent" : "border-stone-100",
                    isToday(day) ? "bg-emerald-50 border-emerald-200" : "bg-white",
                    waterTask?.completed ? "bg-blue-50 border-blue-200" : ""
                  )}
                >
                  <span className={clsx(
                    "text-sm font-medium z-10",
                    isToday(day) ? "text-emerald-700 font-bold" : "text-stone-700"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex gap-1 mt-1">
                    {waterTask && (
                      <div className={clsx(
                        "w-1.5 h-1.5 rounded-full",
                        waterTask.completed ? "bg-blue-500" : "bg-blue-300"
                      )} />
                    )}
                    {showScanIcon && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-6 text-xs text-stone-500 justify-center">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-300"></div> {t('Scheduled Water')}</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> {t('Watered')}</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400"></div> {t('Needs Scan')}</div>
          </div>
        </div>

        {/* Care Requirements */}
        <div>
          <h2 className="text-xl font-bold text-stone-800 mb-4">{t('Care Requirements')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Water')}</p>
                <p className="font-bold text-stone-800 text-sm">{t('Every 7-10 days')}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Sunlight')}</p>
                <p className="font-bold text-stone-800 text-sm">{t(plant.sunlight)}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Temp')}</p>
                <p className="font-bold text-stone-800 text-sm">{t(plant.temperature)}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{t('Humidity')}</p>
                <p className="font-bold text-stone-800 text-sm">{t(plant.humidity)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-xl font-bold text-stone-800 mb-4">{t('Care History')}</h2>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {plant.history.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border-b border-stone-100 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.type === 'water' ? 'bg-blue-50 text-blue-500' :
                  item.type === 'feed' ? 'bg-emerald-50 text-emerald-500' :
                  'bg-purple-50 text-purple-500'
                }`}>
                  {item.type === 'water' && <Droplets className="w-5 h-5" />}
                  {item.type === 'feed' && <Leaf className="w-5 h-5" />}
                  {item.type === 'scan' && <Camera className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-stone-800">
                    {item.event.includes(':') 
                      ? `${t(item.event.split(':')[0])}: ${item.event.split(':')[1]}`
                      : t(item.event)}
                  </p>
                  <p className="text-sm text-stone-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adjust Schedule Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-900">{t('Adjust Watering Schedule')}</h3>
              <button onClick={() => setShowAdjustModal(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            
            <p className="text-stone-600 mb-6">{t('How often should')} {plant.name} {t('be watered?')}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-emerald-500 cursor-pointer" onClick={() => setAdjustFrequency(3)}>
                <span className="font-medium text-stone-800">{t('Every 3 days')}</span>
                <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center", adjustFrequency === 3 ? "border-emerald-500" : "border-stone-300")}>
                  {adjustFrequency === 3 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-emerald-500 cursor-pointer" onClick={() => setAdjustFrequency(7)}>
                <span className="font-medium text-stone-800">{t('Once a week (7 days)')}</span>
                <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center", adjustFrequency === 7 ? "border-emerald-500" : "border-stone-300")}>
                  {adjustFrequency === 7 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-emerald-500 cursor-pointer" onClick={() => setAdjustFrequency(14)}>
                <span className="font-medium text-stone-800">{t('Every 2 weeks (14 days)')}</span>
                <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center", adjustFrequency === 14 ? "border-emerald-500" : "border-stone-300")}>
                  {adjustFrequency === 14 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
              </div>
            </div>

            <button 
              onClick={handleAdjustSchedule}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              {t('Save Schedule')}
            </button>
          </div>
        </div>
      )}

      {/* Edit Plant Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-900">{t('Edit Plant')}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-stone-100 rounded-full">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t('Plant Name')}</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t('Plant Type')}</label>
                <input 
                  type="text" 
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <button 
              onClick={handleEditSave}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              {t('Save Changes')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
