import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Droplets, CheckCircle, Circle, Edit2, Trash2, Plus, Save, X, Camera } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { clsx } from 'clsx';
import { usePlants, Task } from '../context/PlantContext';
import { useLanguage } from '../context/LanguageContext';

export default function Schedule() {
  const { schedule, setSchedule } = usePlants();
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', time: '', amount: '' });

  // Generate week days
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todaysTasks = schedule.filter(task => task.date === selectedDateStr);

  const toggleTask = (id: string) => {
    setSchedule(schedule.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditForm({ title: task.title || task.plant || '', time: task.time, amount: task.amount });
  };

  const saveEdit = (id: string) => {
    setSchedule(schedule.map(task => 
      task.id === id ? { ...task, title: editForm.title, time: editForm.time, amount: editForm.amount } : task
    ));
    setEditingTaskId(null);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  const deleteTask = (id: string) => {
    setSchedule(schedule.filter(task => task.id !== id));
  };

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      plant: t('New Plant'),
      title: t('New Task'),
      time: t('Morning'),
      amount: '100ml',
      completed: false,
      date: selectedDateStr,
    };
    setSchedule([...schedule, newTask]);
    startEditing(newTask);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{t('Watering Schedule')}</h1>
          <p className="text-stone-500 mt-1">{t('Keep your plants hydrated and happy.')}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors">
          <CalendarIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Strip */}
      <div className="bg-white rounded-3xl p-4 border border-stone-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="font-bold text-stone-800">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button onClick={prevWeek} className="p-1 rounded-full hover:bg-stone-100 text-stone-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextWeek} className="p-1 rounded-full hover:bg-stone-100 text-stone-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          {weekDays.map((day, i) => {
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={clsx(
                  "flex flex-col items-center justify-center w-12 h-16 rounded-2xl transition-all",
                  isSelected 
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 active-date" 
                    : "hover:bg-stone-50 text-stone-500"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                  {t(format(day, 'EEE'))}
                </span>
                <span className={clsx(
                  "text-lg font-bold",
                  isToday && !isSelected && "text-emerald-600"
                )}>
                  {format(day, 'd')}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-emerald-600 mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Suggestion Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-4 border border-blue-100 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm text-blue-500">
          <Droplets className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-stone-800 text-sm mb-1">{t('AI Smart Schedule Active')}</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            {t('Schedules are automatically adjusted based on your local weather, plant type, and recent health scans.')}
          </p>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-stone-800">
            {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
              ? t("Today's Tasks") 
              : `${t('Tasks for')} ${format(selectedDate, 'MMM d')}`}
          </h2>
          <button 
            onClick={addTask}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> {t('Add Task')}
          </button>
        </div>
        
        {todaysTasks.length > 0 ? (
          <div className="space-y-3">
            {todaysTasks.map(task => (
              <div 
                key={task.id} 
                className={clsx(
                  "bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-4 transition-all group",
                  task.completed ? "border-emerald-100 bg-emerald-50/30 opacity-75" : "border-stone-100 hover:border-emerald-200"
                )}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    task.completed ? "text-emerald-500" : "text-stone-300 hover:text-emerald-400"
                  )}
                >
                  {task.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <input 
                        type="text" 
                        value={editForm.title} 
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="text-sm font-bold text-stone-800 bg-stone-100 px-2 py-1 rounded-md border border-stone-200 focus:outline-none focus:border-emerald-500 w-full"
                        placeholder={t('Task Title')}
                      />
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={editForm.time} 
                          onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                          className="text-xs font-medium text-stone-700 bg-stone-100 px-2 py-1 rounded-md border border-stone-200 focus:outline-none focus:border-emerald-500 w-24"
                          placeholder={t('Time')}
                        />
                        <input 
                          type="text" 
                          value={editForm.amount} 
                          onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                          className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 focus:outline-none focus:border-blue-500 w-24"
                          placeholder={t('Amount')}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className={clsx(
                        "font-bold truncate",
                        task.completed ? "text-stone-500 line-through" : "text-stone-800"
                      )}>
                        {task.title || task.plant}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">{t(task.time)}</span>
                        <span className={clsx(
                          "text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1",
                          task.type === 'scan' ? "text-purple-600 bg-purple-50" : "text-blue-600 bg-blue-50"
                        )}>
                          {task.type === 'scan' ? <Camera className="w-3 h-3" /> : <Droplets className="w-3 h-3" />}
                          {t(task.amount)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingTaskId === task.id ? (
                    <>
                      <button onClick={() => saveEdit(task.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEdit} className="p-2 text-stone-400 hover:bg-stone-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(task)} className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200 border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-stone-800 mb-1">{t('All caught up!')}</h3>
            <p className="text-sm text-stone-500">{t('No tasks scheduled for this day.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
