import React, { createContext, useContext, useState } from 'react';
import { format, addDays } from 'date-fns';

export type Plant = {
  id: string;
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
  schedule: Task[];
  setSchedule: (schedule: Task[]) => void;
  addTask: (task: Task) => void;
};

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export function PlantProvider({ children }: { children: React.ReactNode }) {
  const [plants, setPlants] = useState<Plant[]>([
    { 
      id: '1', 
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
    { id: '2', name: 'Snake Plant', type: 'Sansevieria', health: 100, image: 'https://picsum.photos/seed/snakeplant/400/400', location: 'Bedroom', nextWater: 'In 3 days', lastWatered: '10 days ago', sunlight: 'Low to bright indirect', temperature: '15-30°C', humidity: 'Average', history: [] },
    { id: '3', name: 'Fiddle Leaf Fig', type: 'Ficus Lyrata', health: 78, image: 'https://picsum.photos/seed/fiddle/400/400', location: 'Office', nextWater: 'Tomorrow', lastWatered: '6 days ago', sunlight: 'Bright indirect', temperature: '18-24°C', humidity: 'High', history: [] },
    { id: '4', name: 'Aloe Vera', type: 'Aloe barbadensis', health: 95, image: 'https://picsum.photos/seed/aloe/400/400', location: 'Kitchen', nextWater: 'In 5 days', lastWatered: '14 days ago', sunlight: 'Bright direct', temperature: '13-27°C', humidity: 'Low', history: [] },
  ]);

  const [schedule, setSchedule] = useState<Task[]>([
    { id: '1', plant: 'Monstera Deliciosa', time: 'Morning', amount: '150ml', completed: false, date: format(new Date(), 'yyyy-MM-dd') },
    { id: '2', plant: 'Snake Plant', time: 'Afternoon', amount: '50ml', completed: true, date: format(new Date(), 'yyyy-MM-dd') },
    { id: '3', plant: 'Fiddle Leaf Fig', time: 'Morning', amount: '200ml', completed: false, date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
  ]);

  const addPlant = (plant: Plant) => {
    setPlants(prev => [...prev, plant]);
  };

  const addTask = (task: Task) => {
    setSchedule(prev => [...prev, task]);
  };

  return (
    <PlantContext.Provider value={{ plants, addPlant, schedule, setSchedule, addTask }}>
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
