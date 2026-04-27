import React from 'react';
import { EnvironmentData } from '../types';

interface EnvironmentCardProps {
  data: EnvironmentData;
}

const MiniGauge: React.FC<{ value: number; min: number; max: number; color: string; label: string; unit: string; icon: string }> = ({
  value, min, max, color, label, unit, icon
}) => {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className={`fas ${icon} text-sm`} style={{ color }}></i>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
        <span className="text-sm font-semibold text-white">{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}{unit}</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }}
        />
      </div>
    </div>
  );
};

const EnvironmentCard: React.FC<EnvironmentCardProps> = ({ data }) => {
  const { temperature, humidity, light } = data;

  const getComfortLevel = () => {
    let score = 0;
    if (temperature >= 18 && temperature <= 26) score++;
    if (humidity >= 30 && humidity <= 60) score++;
    if (light >= 300 && light <= 700) score++;
    
    if (score === 3) return { text: 'Optimal', color: 'text-green-400', icon: 'fa-check-circle' };
    if (score >= 2) return { text: 'Good', color: 'text-teal-400', icon: 'fa-thumbs-up' };
    return { text: 'Needs Attention', color: 'text-yellow-400', icon: 'fa-exclamation-circle' };
  };

  const comfort = getComfortLevel();

  return (
    <div className="glass-card p-5 h-full flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-gray-300 mb-5 font-heading flex items-center gap-2">
          <i className="fas fa-cloud-sun text-blue-300 text-sm"></i>
          Environment
        </h3>
        <div className="space-y-4">
          <MiniGauge icon="fa-thermometer-half" value={temperature} min={10} max={40} color="#FB923C" label="Temperature" unit="°C" />
          <MiniGauge icon="fa-tint" value={humidity} min={0} max={100} color="#60A5FA" label="Humidity" unit="%" />
          <MiniGauge icon="fa-sun" value={light} min={0} max={1000} color="#FDE047" label="Light" unit=" lux" />
        </div>
      </div>
      <div className="glass-card-static px-3 py-2 mt-4 flex items-center justify-center gap-2">
        <i className={`fas ${comfort.icon} ${comfort.color} text-xs`}></i>
        <span className={`text-xs ${comfort.color}`}>{comfort.text}</span>
      </div>
    </div>
  );
};

export default EnvironmentCard;