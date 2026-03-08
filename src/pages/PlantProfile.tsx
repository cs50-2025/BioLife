import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Sun, Thermometer, Wind, Calendar, AlertTriangle, CheckCircle, Edit3, Trash2, Leaf, Camera } from 'lucide-react';
import { usePlants } from '../context/PlantContext';

export default function PlantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { plants } = usePlants();

  const plant = plants.find(p => p.id === id);

  if (!plant) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-stone-800 mb-2">Plant Not Found</h2>
        <p className="text-stone-500 mb-6">This plant might have been removed or doesn't exist.</p>
        <button onClick={() => navigate('/plants')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">
          Back to My Plants
        </button>
      </div>
    );
  }

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
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors">
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
              <span className="text-xs text-stone-300 mt-1 uppercase tracking-wider font-semibold">Health Score</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 -mt-4 relative z-20">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
            <Droplets className="w-6 h-6" />
            <span className="font-bold">Mark as Watered</span>
          </button>
          <button className="bg-white text-emerald-700 border border-emerald-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-emerald-50 transition-colors">
            <Calendar className="w-6 h-6" />
            <span className="font-bold">Adjust Schedule</span>
          </button>
          <button onClick={() => navigate('/scan')} className="bg-purple-600 text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-colors col-span-2 md:col-span-1">
            <Camera className="w-6 h-6" />
            <span className="font-bold">Weekly Scan</span>
          </button>
        </div>

        {/* Care Requirements */}
        <div>
          <h2 className="text-xl font-bold text-stone-800 mb-4">Care Requirements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Water</p>
                <p className="font-bold text-stone-800 text-sm">Every 7-10 days</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Sunlight</p>
                <p className="font-bold text-stone-800 text-sm">{plant.sunlight}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Temp</p>
                <p className="font-bold text-stone-800 text-sm">{plant.temperature}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-stone-100 flex flex-col items-center text-center gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-500 flex items-center justify-center">
                <Wind className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Humidity</p>
                <p className="font-bold text-stone-800 text-sm">{plant.humidity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-xl font-bold text-stone-800 mb-4">Care History</h2>
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
                  <p className="font-bold text-stone-800">{item.event}</p>
                  <p className="text-sm text-stone-500">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
