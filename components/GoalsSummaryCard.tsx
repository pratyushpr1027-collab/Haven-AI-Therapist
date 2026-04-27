import React from 'react';
import { Goal } from '../types';

interface GoalsSummaryCardProps {
  goals: Goal[];
  onNavigate: () => void;
}

const GoalsSummaryCard: React.FC<GoalsSummaryCardProps> = ({ goals, onNavigate }) => {
  const incompleteGoals = goals.filter(g => !g.completed).slice(0, 3);
  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) : 0;

  // Circular progress
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;
  
  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-300 font-heading flex items-center gap-2">
          <i className="fas fa-bullseye text-purple-400 text-sm"></i>
          Goal Progress
        </h3>
        {totalCount > 0 && (
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
              <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#A78BFA" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="progress-ring-circle" />
            </svg>
            <span className="absolute text-[10px] font-bold text-white">{completedCount}/{totalCount}</span>
          </div>
        )}
      </div>
      <div className="flex-grow space-y-2">
        {totalCount > 0 ? (
            incompleteGoals.length > 0 ? (
              incompleteGoals.map(goal => (
                <div key={goal.id} className="flex items-center text-sm text-gray-400 glass-card-static px-3 py-2">
                  <i className="far fa-circle mr-3 text-teal-400 text-xs"></i>
                  <span className="truncate">{goal.text}</span>
                </div>
              ))
            ) : (
                <div className="text-center text-gray-500 flex flex-col justify-center items-center h-full">
                    <i className="fas fa-check-double text-2xl mb-2 text-teal-500"></i>
                    <span className="text-sm">All goals complete!</span>
                </div>
            )
        ) : (
            <div className="text-center text-gray-600 flex flex-col justify-center items-center h-full">
                <i className="fas fa-bullseye text-2xl mb-2 opacity-30"></i>
                <span className="text-sm">No goals set yet</span>
            </div>
        )}
      </div>
      <button onClick={onNavigate} className="mt-3 w-full text-sm bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-all border border-white/5 hover:border-purple-400/30">
        <i className="fas fa-arrow-right mr-2 text-xs"></i>View All Goals
      </button>
    </div>
  );
};

export default GoalsSummaryCard;