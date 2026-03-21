import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { useAuth } from './AuthContext';

export type Plant = {
  id: string;
  userId?: string;
  name: string;
  type: string;
  health: number;
  image: string;
  location: string;
  nextWater: string;
  lastWatered: string;
  sunlight: string;
  temperature: string;
  humidity: string;
  wateringFrequency?: number;
  history: any[];
  createdAt?: string;
};

export type Task = {
  id: string;
  userId?: string;
  plant: string;
  title?: string;
  time: string;
  amount: string;
  completed: boolean;
  date: string;
  type?: 'water' | 'scan' | 'feed' | string;
};

type PlantContextType = {
  plants: Plant[];
  addPlant: (plant: Plant) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  schedule: Task[];
  setSchedule: (schedule: Task[]) => void;
  addTask: (task: Task) => void;
  incrementScanCount: () => void;
  optimizeSchedule: () => Promise<void>;
  streak: number;
  totalScans: number;
};

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [schedule, setSchedule] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load plants from localStorage
  useEffect(() => {
    if (user && isAuthReady) {
      const storedPlants = localStorage.getItem(`plant_app_plants_${user.id}`);
      if (storedPlants) {
        setPlants(JSON.parse(storedPlants));
      } else {
        setPlants([]);
      }
    } else {
      setPlants([]);
    }
  }, [user, isAuthReady]);

  // Load schedule from localStorage
  useEffect(() => {
    if (user && isAuthReady) {
      const storedSchedule = localStorage.getItem(`plant_app_schedule_${user.id}`);
      if (storedSchedule) {
        setSchedule(JSON.parse(storedSchedule));
      } else {
        setSchedule([]);
      }
      setIsLoaded(true);
    } else {
      setSchedule([]);
      setIsLoaded(false);
    }
  }, [user, isAuthReady]);

  // Save plants to localStorage
  useEffect(() => {
    if (user && isLoaded) {
      localStorage.setItem(`plant_app_plants_${user.id}`, JSON.stringify(plants));
    }
  }, [plants, user, isLoaded]);

  // Save schedule to localStorage
  useEffect(() => {
    if (user && isLoaded) {
      localStorage.setItem(`plant_app_schedule_${user.id}`, JSON.stringify(schedule));
    }
  }, [schedule, user, isLoaded]);

  const addPlant = async (plant: Plant) => {
    if (!user) return;
    const plantId = plant.id || Date.now().toString();
    const newPlant = { 
      ...plant, 
      id: plantId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      wateringFrequency: plant.wateringFrequency || 7 // default to 7 days if not provided
    };
    
    setPlants(prev => [...prev, newPlant]);
  };

  const deletePlant = async (id: string) => {
    if (!user) return;
    setPlants(prev => prev.filter(p => p.id !== id));
    setSchedule(prev => prev.filter(t => t.plant !== plants.find(p => p.id === id)?.name));
  };

  const updatePlant = async (id: string, updates: Partial<Plant>) => {
    if (!user) return;
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addTask = (task: Task) => {
    if (!user) return;
    setSchedule(prev => [...prev, { ...task, userId: user.id }]);
  };

  const incrementScanCount = () => {
    if (!user) return;
    addTask({
      id: Date.now().toString(),
      userId: user.id,
      plant: 'General',
      title: 'Scan',
      time: 'Anytime',
      amount: '1',
      completed: true,
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'scan'
    });
  };

  const optimizeSchedule = async () => {
    if (!user || plants.length === 0) return;
    
    try {
      // In a real app, this would call an AI endpoint with weather data.
      // For now, we'll simulate an adaptive shift based on plant health and season.
      const today = new Date();
      const currentMonth = today.getMonth();
      const isSummer = currentMonth >= 5 && currentMonth <= 7;
      const isWinter = currentMonth === 11 || currentMonth <= 1;

      const newSchedule = schedule.map(task => {
        if (task.type !== 'water' || task.completed) return task;
        
        const plant = plants.find(p => p.name === task.plant);
        if (!plant) return task;

        let shiftDays = 0;
        
        // Adaptive logic:
        // 1. If plant health is low, maybe it needs more frequent checking (shift closer)
        if (plant.health < 50) {
          shiftDays -= 1; 
        }
        
        // 2. Environmental logic (simulated)
        if (isSummer) {
          shiftDays -= 1; // Water more often in summer
        } else if (isWinter) {
          shiftDays += 2; // Water less often in winter
        }

        if (shiftDays !== 0) {
          const taskDate = new Date(task.date);
          const newDate = addDays(taskDate, shiftDays);
          // Don't shift to the past
          if (newDate >= today) {
             return { ...task, date: format(newDate, 'yyyy-MM-dd') };
          }
        }
        
        return task;
      });

      setSchedule(newSchedule);
    } catch (error) {
      console.error("Error optimizing schedule:", error);
    }
  };

  // Calculate streak based on completed tasks
  const calculateStreak = () => {
    if (schedule.length === 0) return 0;

    const completedDates = [...new Set(
      schedule
        .filter(t => t.completed)
        .map(t => t.date)
    )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (completedDates.length === 0) return 0;

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    
    // Check if today is completed
    const todayStr = format(today, 'yyyy-MM-dd');
    if (completedDates.includes(todayStr)) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    } else {
      // If today is not completed, check if yesterday is completed
      const yesterday = addDays(today, -1);
      const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
      if (completedDates.includes(yesterdayStr)) {
        checkDate = yesterday;
      } else {
        return 0; // Streak broken
      }
    }

    // Count backwards for consecutive days
    while (true) {
      const checkDateStr = format(checkDate, 'yyyy-MM-dd');
      if (completedDates.includes(checkDateStr)) {
        if (checkDateStr !== todayStr) { // Don't double count today
          currentStreak++;
        }
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    }

    return currentStreak;
  };

  const streak = calculateStreak();
  const totalScans = schedule.filter(t => t.type === 'scan' && t.completed).length;

  return (
    <PlantContext.Provider value={{ plants, addPlant, deletePlant, updatePlant, schedule, setSchedule, addTask, incrementScanCount, optimizeSchedule, streak, totalScans }}>
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
}
