import { Settings, Award, Droplets, Leaf, ChevronRight, Bell, Shield, LogOut } from 'lucide-react';

export default function Profile() {
  const stats = [
    { label: 'Plants', value: '12', icon: Leaf, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Care Streak', value: '14 Days', icon: Droplets, color: 'text-blue-500 bg-blue-50' },
    { label: 'Scans', value: '45', icon: Award, color: 'text-amber-500 bg-amber-50' },
  ];

  const achievements = [
    { id: '1', title: 'Green Thumb', description: 'Kept 5 plants alive for 3 months', icon: '🌱', unlocked: true },
    { id: '2', title: 'Water Boy', description: 'Watered plants on time for 7 days', icon: '💧', unlocked: true },
    { id: '3', title: 'Plant Doctor', description: 'Scanned 10 sick plants', icon: '🩺', unlocked: false },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Profile</h1>
        <button className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* User Info */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="w-24 h-24 rounded-full bg-stone-200 border-4 border-white shadow-md overflow-hidden shrink-0">
          <img src="https://picsum.photos/seed/user/200/200" alt="Alex" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Alex Gardener</h2>
          <p className="text-stone-500">Plant Parent since 2023</p>
          <div className="mt-2 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100">
            <Award className="w-4 h-4" />
            Level 5 Botanist
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex flex-col items-center text-center gap-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold text-stone-800">Achievements</h2>
          <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {achievements.map((achievement, i) => (
            <div key={achievement.id} className={`flex items-center gap-4 p-4 border-b border-stone-100 last:border-0 ${!achievement.unlocked ? 'opacity-50 grayscale' : ''}`}>
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-800">{achievement.title}</h3>
                <p className="text-sm text-stone-500">{achievement.description}</p>
              </div>
              {achievement.unlocked && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Links */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 mb-4">Settings</h2>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <span className="font-bold text-stone-800">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-stone-800">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-stone-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors text-left group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-bold text-red-600">Log Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
