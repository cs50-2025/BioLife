import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Droplets, Sun, Thermometer } from 'lucide-react';
import { usePlants } from '../context/PlantContext';
import { useLanguage } from '../context/LanguageContext';

export default function MyPlants() {
  const { plants } = usePlants();
  const { t } = useLanguage();

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{t('My Plants')}</h1>
        <Link to="/scan" className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-sm">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map(plant => (
          <Link key={plant.id} to={`/plants/${plant.id}`} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md transition-all group flex gap-4 items-center">
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
              <img src={plant.image} alt={plant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md text-[10px] font-bold text-emerald-700 shadow-sm">
                {plant.health}%
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-stone-800 truncate text-lg">{plant.name}</h3>
              <p className="text-sm text-stone-500 truncate">{t(plant.type)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded-md">{t(plant.location)}</span>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {t(plant.nextWater)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
