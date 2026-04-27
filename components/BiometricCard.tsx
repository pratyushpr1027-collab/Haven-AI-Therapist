import React, { useEffect, useRef } from 'react';
import { BiometricData, ActivityLevel } from '../types';

interface BiometricCardProps {
  data: BiometricData;
  activityLevel: ActivityLevel;
}

const CircularProgress: React.FC<{ value: number; max: number; color: string; size?: number; strokeWidth?: number }> = ({
  value, max, color, size = 80, strokeWidth = 6
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring-circle"
      />
    </svg>
  );
};

const BiometricCard: React.FC<BiometricCardProps> = ({ data, activityLevel }) => {
  const { heartRate, gsr } = data;
  const stressLevel = Math.round((gsr / 1023) * 100);

  const getStressColor = (level: number) => {
    if (level > 75) return '#F87171';
    if (level > 50) return '#FBBF24';
    return '#2DD4BF';
  };

  const getHrColor = (hr: number) => {
    if (hr > 100) return '#F87171';
    if (hr > 85) return '#FBBF24';
    return '#2DD4BF';
  };

  const activityConfig: Record<ActivityLevel, { icon: string; color: string }> = {
    'Sedentary': { icon: 'fa-person-sitting', color: 'text-gray-400' },
    'Light': { icon: 'fa-person-walking', color: 'text-teal-400' },
    'Active': { icon: 'fa-person-running', color: 'text-green-400' }
  };

  return (
    <div className="glass-card p-5 h-full flex flex-col justify-between">
      <div>
        <h3 className="font-semibold text-gray-300 mb-5 font-heading flex items-center gap-2">
          <i className="fas fa-heartbeat text-red-400 text-sm animate-[slow-pulse_2.5s_ease-in-out_infinite]"></i>
          Live Vitals
        </h3>
        <div className="flex items-center justify-around">
          {/* Heart Rate Ring */}
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <CircularProgress value={heartRate} max={140} color={getHrColor(heartRate)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white">{heartRate}</span>
                <span className="text-[9px] text-gray-500">BPM</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-2">Heart Rate</span>
          </div>

          {/* Stress Ring */}
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <CircularProgress value={stressLevel} max={100} color={getStressColor(stressLevel)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-white">{stressLevel}</span>
                <span className="text-[9px] text-gray-500">%</span>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 mt-2">Stress</span>
          </div>
        </div>
      </div>
      <div className="glass-card-static px-3 py-2 mt-4 flex items-center justify-center gap-2">
        <i className={`fas ${activityConfig[activityLevel].icon} ${activityConfig[activityLevel].color} text-sm`}></i>
        <span className="text-xs text-gray-400">{activityLevel}</span>
      </div>
    </div>
  );
};

export default BiometricCard;