import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Leaf, Droplets, Calendar, ArrowLeft } from 'lucide-react';
import { usePlants } from '../context/PlantContext';
import { useLanguage } from '../context/LanguageContext';
import { format, addDays } from 'date-fns';

export default function AddPlant() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState(7);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addPlant, addTask } = usePlants();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nextWaterDate = addDays(new Date(), wateringFrequency);
    
    const newPlant = {
      id: Date.now().toString(),
      name,
      type,
      health: 100, // Default healthy
      image: image || 'https://picsum.photos/seed/plant/400/400',
      location: 'Indoor',
      wateringFrequency,
      lastWatered: format(new Date(), 'yyyy-MM-dd'),
      nextWater: format(nextWaterDate, 'yyyy-MM-dd'),
      sunlight: 'Moderate',
      temperature: 'Room Temperature',
      humidity: 'Average',
      history: [
        { date: format(new Date(), 'MMM dd'), event: 'Added to BioLife', type: 'scan' }
      ]
    };

    await addPlant(newPlant);
    
    // Add initial watering task
    addTask({
      id: Date.now().toString() + '_task',
      plant: name,
      time: 'Morning',
      amount: 'Moderate',
      completed: false,
      date: format(nextWaterDate, 'yyyy-MM-dd'),
      type: 'water'
    });

    navigate('/plants');
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{t('Add New Plant')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
        
        {/* Image Upload */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div 
            className="w-32 h-32 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 flex items-center justify-center overflow-hidden relative cursor-pointer hover:bg-emerald-100 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {image ? (
              <img src={image} alt="Plant preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-emerald-600">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-xs font-medium">{t('Upload Photo')}</span>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              {t('Plant Name')}
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monstera Deliciosa"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              {t('Plant Type / Species')}
            </label>
            <input 
              type="text" 
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Swiss Cheese Plant"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              {t('Watering Frequency (Days)')}
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={wateringFrequency}
                onChange={(e) => setWateringFrequency(parseInt(e.target.value))}
                className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="w-16 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-center font-bold text-stone-700">
                {wateringFrequency}
              </div>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              {t('Next watering will be scheduled for')} <span className="font-semibold text-emerald-600">{format(addDays(new Date(), wateringFrequency), 'MMM dd, yyyy')}</span>
            </p>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('Save Plant')}
        </button>
      </form>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
