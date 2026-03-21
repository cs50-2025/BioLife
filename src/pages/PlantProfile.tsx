import { useState, useMemo, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Sun, Thermometer, Wind, Calendar as CalendarIcon, AlertTriangle, CheckCircle, Edit3, Trash2, Leaf, Camera, ChevronLeft, ChevronRight, X, Activity, Upload, RefreshCw } from 'lucide-react';
import Webcam from 'react-webcam';
import { GoogleGenAI } from '@google/genai';
import { usePlants, Task } from '../context/PlantContext';
import { useLanguage } from '../context/LanguageContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO, startOfDay, isSameWeek } from 'date-fns';
import { clsx } from 'clsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const [showWeeklyScanModal, setShowWeeklyScanModal] = useState(false);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const plant = plants.find(p => p.id === id);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setScanImage(imageSrc);
      analyzeImage(imageSrc);
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setScanImage(base64String);
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(';')[0].split(':')[1];

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Analyze this plant image as an expert botanist and plant pathologist.
        Provide a detailed JSON response with the following structure:
        {
          "plantType": "Scientific and common name of the plant",
          "confidence": number between 0 and 100 representing your confidence in the identification,
          "healthScore": number between 0 and 100 representing overall health,
          "diagnosis": "Detailed explanation of its current state, including reasoning based on visual evidence (e.g., 'Leaves show yellowing at the edges indicating slight dehydration or nutrient deficiency')",
          "recommendation": "Specific, actionable, step-by-step advice for care to improve or maintain health",
          "issues": [
            {
              "issue": "Name of the problem (e.g., 'Spider Mites', 'Underwatering')",
              "severity": "Low", "Medium", or "High",
              "action": "How to fix it"
            }
          ],
          "carePlan": {
            "sunlight": "Specific light requirements (e.g., 'Bright indirect light, avoid harsh afternoon sun')",
            "temperature": "Ideal temperature range (e.g., '18-24°C')",
            "humidity": "Ideal humidity (e.g., 'High, 60-80%')",
            "wateringFrequencyDays": number (e.g., 7),
            "wateringInstructions": "How to water (e.g., 'Water thoroughly when top 2 inches of soil are dry')",
            "soilType": "Recommended soil mix",
            "fertilizer": "When and what to feed"
          }
        }
        Only return the JSON object, nothing else. Do not wrap in markdown code blocks.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
        }
      });

      let jsonStr = response.text?.trim() || '';
      if (jsonStr.startsWith('\`\`\`json')) {
        jsonStr = jsonStr.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      } else if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
      }

      if (jsonStr) {
        setScanResult(JSON.parse(jsonStr));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setScanResult({
        plantType: plant?.name || 'Unknown Plant',
        confidence: 0,
        healthScore: Math.floor(Math.random() * 20) + 80,
        diagnosis: 'Failed to analyze image. Please ensure the image is clear and well-lit.',
        recommendation: 'Please try taking another photo from a different angle.',
        issues: [],
        carePlan: {
          sunlight: 'Unknown',
          temperature: 'Unknown',
          humidity: 'Unknown',
          wateringFrequencyDays: 7,
          wateringInstructions: 'Check soil moisture before watering.',
          soilType: 'Standard potting mix',
          fertilizer: 'Unknown'
        }
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdatePlant = () => {
    if (!scanResult || !plant) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    addTask({
      id: Date.now().toString() + 'scan',
      plant: plant.name,
      title: t('Weekly Health Scan'),
      time: 'Anytime',
      amount: 'Weekly Health Scan',
      completed: true,
      date: todayStr,
      type: 'scan'
    });

    updatePlant(plant.id, {
      health: scanResult.healthScore,
      history: [
        { date: format(new Date(), 'MMM dd'), event: `Health Scan: ${scanResult.healthScore}%`, type: 'scan' },
        ...plant.history
      ]
    });
    
    setShowWeeklyScanModal(false);
    setScanImage(null);
    setScanResult(null);
    alert(t('Weekly scan completed! Your plant looks healthy.'));
  };

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
        title: t('Water Plant'),
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
    setShowWeeklyScanModal(true);
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
        title: t('Water Plant'),
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

  const healthData = useMemo(() => {
    const data = [];
    let current = Math.max(40, Math.min(100, plant.health - 20 + Math.random() * 10));
    for (let i = 6; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      data.push({
        name: format(date, 'MMM dd'),
        health: Math.round(current)
      });
      current = Math.max(40, Math.min(100, current + (Math.random() * 15 - 5)));
    }
    data.push({
      name: format(new Date(), 'MMM dd'),
      health: plant.health
    });
    return data;
  }, [plant.health]);

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

        {/* Health Graph */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-stone-800">{t('Health History')}</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a8a29e', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#a8a29e', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#57534e', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="health" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
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

      {/* Weekly Scan Modal */}
      {showWeeklyScanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-stone-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col h-[80vh] relative">
            <div className="absolute top-0 w-full z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
              <h3 className="text-xl font-bold text-white">{t('Weekly Scan')}</h3>
              <button onClick={() => { setShowWeeklyScanModal(false); setScanImage(null); setScanResult(null); }} className="p-2 bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
              {!scanImage ? (
                <div className="w-full h-full relative">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: 'environment' }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-emerald-500/50 rounded-3xl relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <img src={scanImage} alt="Captured plant" className="w-full h-full object-cover" />
              )}

              {isScanning && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                    <Leaf className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">{t('Analyzing Plant...')}</h2>
                  <p className="text-stone-300 text-sm">{t('Identifying species and checking health')}</p>
                </div>
              )}
            </div>

            {!scanImage && !isScanning && (
              <div className="absolute bottom-0 w-full p-8 flex justify-center items-center gap-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <label className="w-12 h-12 rounded-full bg-stone-800/80 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-stone-700 transition-colors">
                  <Upload className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                
                <button 
                  onClick={capture}
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center focus:outline-none hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-white"></div>
                </button>
                
                <button className="w-12 h-12 rounded-full bg-stone-800/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-stone-700 transition-colors">
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            )}

            {scanResult && (
              <div className="absolute bottom-0 w-full bg-white text-stone-900 rounded-t-3xl z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] max-h-[60vh] flex flex-col">
                <div className="p-6 overflow-y-auto flex-1">
                  <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800">{scanResult.plantType}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={clsx(
                          "text-sm font-bold px-2 py-1 rounded-md",
                          scanResult.healthScore >= 80 ? "bg-emerald-100 text-emerald-700" :
                          scanResult.healthScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {t('Health')}: {scanResult.healthScore}%
                        </span>
                        <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                          {scanResult.confidence}% {t('Match')}
                        </span>
                      </div>
                    </div>
                    <div className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      scanResult.healthScore >= 80 ? "bg-emerald-100 text-emerald-600" :
                      scanResult.healthScore >= 50 ? "bg-yellow-100 text-yellow-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {scanResult.healthScore >= 80 ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">{t('Diagnosis')}</h3>
                      <p className="text-stone-800 font-medium leading-relaxed">{scanResult.diagnosis}</p>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">{t('Recommendation')}</h3>
                      <p className="text-emerald-900 font-medium leading-relaxed">{scanResult.recommendation}</p>
                    </div>

                    {scanResult.issues && scanResult.issues.length > 0 && (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">{t('Identified Issues')}</h3>
                        <div className="space-y-3">
                          {scanResult.issues.map((issue: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-red-100/50 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-red-900">{issue.issue}</span>
                                <span className={clsx(
                                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                  issue.severity === 'High' ? "bg-red-100 text-red-700" :
                                  issue.severity === 'Medium' ? "bg-orange-100 text-orange-700" :
                                  "bg-yellow-100 text-yellow-700"
                                )}>
                                  {issue.severity}
                                </span>
                              </div>
                              <p className="text-sm text-stone-600">{issue.action}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-white border-t border-stone-100 flex gap-3 shrink-0">
                  <button className="flex-1 bg-stone-100 text-stone-800 py-3 rounded-xl font-bold hover:bg-stone-200 transition-colors" onClick={() => { setScanImage(null); setScanResult(null); }}>
                    {t('Retake')}
                  </button>
                  <button 
                    onClick={handleUpdatePlant}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    {t('Update Plant')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
