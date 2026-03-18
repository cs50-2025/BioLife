import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';

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
  streak: number;
};

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthReady } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [schedule, setSchedule] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load plants from Firestore
  useEffect(() => {
    if (user && isAuthReady) {
      const q = query(collection(db, 'plants'), where('userId', '==', user.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedPlants: Plant[] = [];
        snapshot.forEach((doc) => {
          loadedPlants.push({ id: doc.id, ...doc.data() } as Plant);
        });
        setPlants(loadedPlants);
      }, (error) => {
        console.error("Error fetching plants:", error);
      });

      return () => unsubscribe();
    } else {
      setPlants([]);
    }
  }, [user, isAuthReady]);

  // Load schedule from localStorage (or could be moved to Firestore later)
  useEffect(() => {
    if (user) {
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
  }, [user]);

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
    
    // Optimistic update
    setPlants(prev => [...prev, newPlant]);
    
    try {
      await setDoc(doc(db, 'plants', plantId), newPlant);
    } catch (error) {
      console.error("Error adding plant:", error);
      // Revert optimistic update on failure
      setPlants(prev => prev.filter(p => p.id !== plantId));
    }
  };

  const deletePlant = async (id: string) => {
    if (!user) return;
    
    // Optimistic update
    const previousPlants = [...plants];
    setPlants(prev => prev.filter(p => p.id !== id));
    setSchedule(prev => prev.filter(t => t.plant !== plants.find(p => p.id === id)?.name));
    
    try {
      await deleteDoc(doc(db, 'plants', id));
    } catch (error) {
      console.error("Error deleting plant:", error);
      setPlants(previousPlants);
    }
  };

  const updatePlant = async (id: string, updates: Partial<Plant>) => {
    if (!user) return;
    
    // Optimistic update
    const previousPlants = [...plants];
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    
    try {
      await updateDoc(doc(db, 'plants', id), updates);
    } catch (error) {
      console.error("Error updating plant:", error);
      setPlants(previousPlants);
    }
  };

  const addTask = (task: Task) => {
    if (!user) return;
    setSchedule(prev => [...prev, { ...task, userId: user.id }]);
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

  return (
    <PlantContext.Provider value={{ plants, addPlant, deletePlant, updatePlant, schedule, setSchedule, addTask, streak }}>
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
