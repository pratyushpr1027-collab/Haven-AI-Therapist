import React from 'react';
import { Analysis } from '../types';

interface AnalysisPanelProps {
  analysis: Analysis | null;
  isLoading: boolean;
}

const AnalysisItem: React.FC<{ label: string; icon: string; value: string | number; color?: string; children?: React.ReactNode }> = ({ label, icon, value, color, children }) => (
    <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <i className={`fas ${icon} text-xs text-gray-500`}></i>
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
        </div>
        {children || <div className="text-lg font-semibold font-heading" style={{ color }}>{value}</div>}
    </div>
);

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ analysis, isLoading }) => {
    if (isLoading && !analysis) {
        return (
            <div>
                <h2 className="text-xl font-bold text-white mb-4 font-heading">Analysis</h2>
                <div className="space-y-3 animate-pulse">
                    <div className="glass-card-static p-4 h-20 rounded-2xl"></div>
                    <div className="glass-card-static p-4 h-20 rounded-2xl"></div>
                    <div className="glass-card-static p-4 h-20 rounded-2xl"></div>
                    <div className="glass-card-static p-4 h-24 rounded-2xl"></div>
                </div>
            </div>
        );
    }
    
    if (!analysis) {
        return (
            <div>
                <h2 className="text-xl font-bold text-white mb-4 font-heading">Analysis</h2>
                <div className="flex flex-col items-center justify-center h-64 text-gray-600 text-center animate-[fadeIn_0.5s_ease-out]">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                      <i className="fas fa-search-plus text-2xl text-gray-600"></i>
                    </div>
                    <p className="text-sm">Your message analysis will appear here once you send a message.</p>
                </div>
            </div>
        );
    }

    const sentimentColor = analysis.sentimentScore > 0.2 ? '#4ADE80' : analysis.sentimentScore < -0.2 ? '#F87171' : '#FBBF24';
    const sentimentLabel = analysis.sentimentScore > 0.2 ? 'Positive' : analysis.sentimentScore < -0.2 ? 'Negative' : 'Neutral';

    return (
        <div className="animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-xl font-bold text-white mb-4 font-heading">Analysis</h2>
            <div className="space-y-3">
                <AnalysisItem label="Mood" icon="fa-smile" value={analysis.mood} color={analysis.color} />

                <AnalysisItem label="Sentiment" icon="fa-chart-bar" value={analysis.sentimentScore.toFixed(2)}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold font-heading" style={{ color: sentimentColor }}>
                          {analysis.sentimentScore.toFixed(2)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${sentimentColor}15`, color: sentimentColor }}>
                          {sentimentLabel}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-700 ease-out" style={{ width: `${(analysis.sentimentScore + 1) / 2 * 100}%`, background: `linear-gradient(90deg, ${sentimentColor}88, ${sentimentColor})` }}></div>
                      </div>
                    </div>
                </AnalysisItem>

                <AnalysisItem label="Subject" icon="fa-tag" value={analysis.subject} color="#FFFFFF" />

                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="fas fa-align-left text-xs text-gray-500"></i>
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Summary</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
                </div>
            </div>
        </div>
    );
};

export default AnalysisPanel;