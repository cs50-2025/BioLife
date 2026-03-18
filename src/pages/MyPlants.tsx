import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Droplets, Sun, Thermometer, Edit, Trash2 } from 'lucide-react';
import { usePlants, Plant } from '../context/PlantContext';
import { useLanguage } from '../context/LanguageContext';
import { format, isToday, isPast, parseISO } from 'date-fns';

export default function MyPlants() {
  const { plants, deletePlant, updatePlant } = usePlants();
  const { t } = useLanguage();

  const getStatusBadge = (plant: Plant) => {
    const nextWaterDate = parseISO(plant.nextWater);
    if (isPast(nextWaterDate) && !isToday(nextWaterDate)) {
      return <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{t('Needs Water')}</span>;
    }
    if (isToday(nextWaterDate)) {
      return <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{t('Water Today')}</span>;
    }
    if (plant.health < 50) {
      return <span className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{t('Needs Sunlight')}</span>;
    }
    return <span className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-sm">{t('Healthy')}</span>;
  };

  const handleWater = async (e: React.MouseEvent, plant: Plant) => {
    e.preventDefault();
    const today = format(new Date(), 'yyyy-MM-dd');
    const nextWater = format(new Date(Date.now() + (plant.wateringFrequency || 7) * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    await updatePlant(plant.id, { lastWatered: today, nextWater });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (window.confirm(t('Are you sure you want to delete this plant?'))) {
      await deletePlant(id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{t('My Plants')}</h1>
        <Link to="/add" className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder={t('Search plants...')} 
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <button className="px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <span className="hidden md:inline">{t('Filter')}</span>
        </button>
      </div>

      {/* Plant List */}
      {plants.length === 0 ? (
        <div className="bg-stone-50 rounded-3xl p-8 text-center border border-stone-100 border-dashed mt-8">
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.map(plant => (
            <Link key={plant.id} to={`/plants/${plant.id}`} className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="w-full h-48 relative overflow-hidden">
                <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {getStatusBadge(plant)}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-stone-800 text-lg truncate">{plant.name}</h3>
                <p className="text-sm text-stone-500 truncate mb-4">{t(plant.type)}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    {t(plant.nextWater)}
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-stone-100">
                  <button 
                    onClick={(e) => handleWater(e, plant)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <Droplets className="w-4 h-4" />
                    {t('Water Now')}
                  </button>
                  <Link 
                    to={`/plants/${plant.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-10 h-10 bg-stone-50 hover:bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={(e) => handleDelete(e, plant.id)}
                    className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Leaf(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
