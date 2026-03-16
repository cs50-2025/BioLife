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
  history: any[];
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
  addPlant: (plant: Plant) => void;
  deletePlant: (id: string) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  schedule: Task[];
  setSchedule: (schedule: Task[]) => void;
  addTask: (task: Task) => void;
};

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [schedule, setSchedule] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      setIsLoaded(false);
      const storedPlants = localStorage.getItem(`plant_app_plants_${user.id}`);
      const storedSchedule = localStorage.getItem(`plant_app_schedule_${user.id}`);
      
      if (storedPlants) {
        setPlants(JSON.parse(storedPlants));
      } else {
        // Default plants for new users
        const defaultPlants: Plant[] = [
          { 
            id: '1', 
            userId: user.id,
            name: 'Monstera Deliciosa', 
            type: 'Swiss Cheese Plant', 
            health: 92, 
            image: 'https://picsum.photos/seed/monstera/400/400', 
            location: 'Living Room', 
            nextWater: 'Today', 
            lastWatered: '3 days ago', 
            sunlight: 'Bright indirect', 
            temperature: '18-30°C', 
            humidity: 'High (60%+)', 
            history: [
              { date: 'Oct 12', event: 'Watered', type: 'water' },
              { date: 'Oct 05', event: 'Fertilized', type: 'feed' },
              { date: 'Sep 28', event: 'Health Scan: 92%', type: 'scan' },
            ] 
          },
          { id: '2', userId: user.id, name: 'Snake Plant', type: 'Sansevieria', health: 100, image: 'https://picsum.photos/seed/snakeplant/400/400', location: 'Bedroom', nextWater: 'In 3 days', lastWatered: '10 days ago', sunlight: 'Low to bright indirect', temperature: '15-30°C', humidity: 'Average', history: [] },
        ];
        setPlants(defaultPlants);
        localStorage.setItem(`plant_app_plants_${user.id}`, JSON.stringify(defaultPlants));
      }

      if (storedSchedule) {
        setSchedule(JSON.parse(storedSchedule));
      } else {
        // Default schedule for new users
        const defaultSchedule: Task[] = [
          { id: '1', userId: user.id, plant: 'Monstera Deliciosa', time: 'Morning', amount: '150ml', completed: false, date: format(new Date(), 'yyyy-MM-dd') },
          { id: '2', userId: user.id, plant: 'Snake Plant', time: 'Afternoon', amount: '50ml', completed: true, date: format(new Date(), 'yyyy-MM-dd') },
        ];
        setSchedule(defaultSchedule);
        localStorage.setItem(`plant_app_schedule_${user.id}`, JSON.stringify(defaultSchedule));
      }
      setIsLoaded(true);
    } else {
      setPlants([]);
      setSchedule([]);
      setIsLoaded(false);
    }
  }, [user]);

  // Save data when it changes
  useEffect(() => {
    if (user && isLoaded) {
      localStorage.setItem(`plant_app_plants_${user.id}`, JSON.stringify(plants));
    }
  }, [plants, user, isLoaded]);

  useEffect(() => {
    if (user && isLoaded) {
      localStorage.setItem(`plant_app_schedule_${user.id}`, JSON.stringify(schedule));
    }
  }, [schedule, user, isLoaded]);

  const addPlant = (plant: Plant) => {
    if (!user) return;
    setPlants(prev => [...prev, { ...plant, userId: user.id }]);
  };

  const deletePlant = (id: string) => {
    setPlants(prev => prev.filter(p => p.id !== id));
    setSchedule(prev => prev.filter(t => t.plant !== plants.find(p => p.id === id)?.name));
  };

  const updatePlant = (id: string, updates: Partial<Plant>) => {
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addTask = (task: Task) => {
    if (!user) return;
    setSchedule(prev => [...prev, { ...task, userId: user.id }]);
  };

  return (
    <PlantContext.Provider value={{ plants, addPlant, deletePlant, updatePlant, schedule, setSchedule, addTask }}>
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
