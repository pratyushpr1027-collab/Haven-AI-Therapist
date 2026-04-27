import React from 'react';
import { Activity } from '../types';

interface ActivityTrackerProps {
  onLogActivity: (activity: Activity) => void;
}

const activities: { name: Activity; icon: string; gradient: string }[] = [
  { name: 'Meditate', icon: 'fa-om', gradient: 'from-purple-500/20 to-indigo-500/20' },
  { name: 'Exercise', icon: 'fa-dumbbell', gradient: 'from-green-500/20 to-emerald-500/20' },
  { name: 'Journal', icon: 'fa-pencil-alt', gradient: 'from-teal-500/20 to-cyan-500/20' },
  { name: 'Socialize', icon: 'fa-users', gradient: 'from-blue-500/20 to-sky-500/20' },
  { name: 'Work', icon: 'fa-briefcase', gradient: 'from-amber-500/20 to-yellow-500/20' },
  { name: 'Hobby', icon: 'fa-paint-brush', gradient: 'from-rose-500/20 to-pink-500/20' },
];

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ onLogActivity }) => {
  return (
    <div className="glass-card p-5 h-full">
      <h3 className="font-semibold text-gray-300 mb-3 font-heading flex items-center gap-2">
        <i className="fas fa-running text-green-400 text-sm"></i>
        What have you been up to?
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {activities.map(({ name, icon, gradient }) => (
          <button
            key={name}
            onClick={() => onLogActivity(name)}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-teal-400/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400/30 group ripple"
            aria-label={`Log activity: ${name}`}
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-1.5 transition-transform duration-300 group-hover:scale-110`}>
              <i className={`fas ${icon} text-sm text-gray-300`}></i>
            </div>
            <span className="text-[11px] text-gray-500 group-hover:text-gray-300 transition-colors">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActivityTracker;