import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MoodLog, BiometricHistoryEntry } from '../types';
import { moodMapping } from '../hooks/useIotData';

interface ChartCardProps {
  moodLogs: MoodLog[];
  biometricHistory: BiometricHistoryEntry[];
}

type ChartType = 'mood' | 'hr' | 'gsr';

interface ChartData {
  timestamp: string;
  value?: number;
  heartRate?: number;
  gsr?: number;
  mood?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ moodLogs, biometricHistory }) => {
  const [chartType, setChartType] = useState<ChartType>('mood');

  const formatYAxisMood = (value: number) => {
      const mood = Object.keys(moodMapping).find(key => moodMapping[key as keyof typeof moodMapping].value === value);
      return mood || '';
  }

  const chartConfig = {
      mood: {
          data: moodLogs,
          dataKey: "value",
          stroke: "#2DD4BF",
          gradientFrom: "#2DD4BF",
          gradientTo: "#0D9488",
          name: "Mood",
          icon: "fa-smile",
          domain: [0.5, 5.5],
          ticks: Object.values(moodMapping).map((m: { value: number }) => m.value),
          formatter: (value: number, name: string, props: any) => [props?.payload?.mood || value, 'Mood'],
          yAxisFormatter: formatYAxisMood,
      },
      hr: {
          data: biometricHistory,
          dataKey: "heartRate",
          stroke: "#F87171",
          gradientFrom: "#F87171",
          gradientTo: "#DC2626",
          name: "Heart Rate",
          icon: "fa-heartbeat",
          domain: [50, 120],
          ticks: [50, 70, 90, 110],
          formatter: (value: number) => [`${Math.round(value)} BPM`, 'Heart Rate'],
          yAxisFormatter: (value: number) => `${Math.round(value)}`,
      },
      gsr: {
          data: biometricHistory,
          dataKey: "gsr",
          stroke: "#FBBF24",
          gradientFrom: "#FBBF24",
          gradientTo: "#F59E0B",
          name: "Stress",
          icon: "fa-brain",
          domain: [200, 900],
          ticks: [200, 450, 700, 900],
          formatter: (value: number) => {
              const percentage = Math.round((value / 1023) * 100);
              return [`${percentage}%`, 'Stress Level']
          },
          yAxisFormatter: (value: number) => `${Math.round((value / 1023) * 100)}%`,
      }
  };

  const currentChart = chartConfig[chartType];
  const noData = !currentChart.data || currentChart.data.length === 0;
  const gradientId = `color-${chartType}`;

  // Ensure data has required fields
  const chartData = useMemo(() => {
    if (!currentChart.data) return [];
    return currentChart.data.map((item: any) => ({
      ...item,
      timestamp: item.timestamp || new Date().toLocaleTimeString(),
    }));
  }, [currentChart.data]);

  return (
    <div className="glass-card p-5 flex flex-col h-full min-h-96">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="font-semibold text-gray-300 font-heading flex items-center gap-2">
              <i className="fas fa-chart-area text-teal-400 text-sm"></i>
              Data History
            </h3>
            <div className="flex glass-card-static p-1 rounded-xl gap-1">
                {(Object.keys(chartConfig) as ChartType[]).map((type) => (
                     <button
                       key={type}
                       onClick={() => setChartType(type)}
                       className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                         chartType === type
                           ? 'bg-gradient-to-r from-teal-600/80 to-teal-500/60 text-white shadow-lg'
                           : 'text-gray-500 hover:text-gray-300'
                       }`}
                     >
                        <i className={`fas ${chartConfig[type].icon} text-[10px]`}></i>
                        {chartConfig[type].name}
                    </button>
                ))}
            </div>
        </div>
      
      <div className="flex-1 w-full relative">
        {noData ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                <i className="fas fa-chart-line text-4xl mb-3 opacity-30"></i>
                <span className="text-sm">Log data to see your history here</span>
            </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentChart.gradientFrom} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={currentChart.gradientTo} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#4A5568" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
                interval={Math.max(0, Math.floor(chartData.length / 5))}
              />
              <YAxis 
                stroke="#4A5568" 
                fontSize={11} 
                domain={currentChart.domain as [number, number]} 
                ticks={currentChart.ticks}
                tickFormatter={currentChart.yAxisFormatter}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                  borderColor: 'rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
                }} 
                labelStyle={{ color: '#E2E8F0' }}
                formatter={currentChart.formatter as any}
              />
              <Area 
                type="monotone" 
                dataKey={currentChart.dataKey} 
                name={currentChart.name} 
                stroke={currentChart.stroke} 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill={`url(#${gradientId})`} 
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: currentChart.stroke, fill: '#0F172A' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ChartCard;