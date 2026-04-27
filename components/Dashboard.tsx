import React, { useState } from 'react';
import useWellnessData from '../hooks/useIotData';
import Sidebar, { View } from './Sidebar';
import AiAssistant from './AiAssistant';
import AnalysisPanel from './AnalysisPanel';
import SensorCard from './SensorCard';
import BiometricCard from './BiometricCard';
import EnvironmentCard from './EnvironmentCard';
import ChartCard from './ChartCard';
import ActivityTracker from './ActivityTracker';
import Journal from './JournalPage';
import BreathingExercise from './BreathingExercise';
import GoalsSummaryCard from './GoalsSummaryCard';
import { Message, Analysis, Goal } from '../types';
import { analyzeAndRespond } from '../services/geminiService';

// --- Sub-component for Goals Page ---
interface GoalsPageProps {
  goals: Goal[];
  onAddGoal: (text: string) => void;
  onToggleGoal: (id: string) => void;
}
const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onAddGoal, onToggleGoal }) => {
  const [newGoalText, setNewGoalText] = useState('');
  const handleAddGoal = () => { if (newGoalText.trim()) { onAddGoal(newGoalText); setNewGoalText(''); } };
  const completedGoals = goals.filter(g => g.completed);
  const incompleteGoals = goals.filter(g => !g.completed);
  const progress = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-2 font-heading animate-[slideInUp_0.5s_ease-out]">Your Goals</h1>
      <p className="text-gray-500 text-sm mb-6 animate-[slideInUp_0.5s_ease-out]">Track and achieve your wellness milestones</p>
      
      {/* Progress Bar */}
      {goals.length > 0 && (
        <div className="glass-card p-4 mb-6 animate-[slideInUp_0.5s_ease-out]" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm font-semibold text-teal-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-teal-500 to-teal-300 h-2 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      <div className="glass-card p-5 mb-6 animate-[slideInUp_0.5s_ease-out]" style={{ animationDelay: '100ms', animationFillMode: 'forwards', opacity: 0 }}>
        <h2 className="text-lg font-semibold text-gray-200 mb-3 font-heading">Add a New Goal</h2>
        <div className="flex gap-3">
          <input type="text" value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()} placeholder="e.g., Meditate for 5 minutes daily" className="flex-grow bg-white/5 p-3 rounded-xl text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-teal-400/50 border border-white/5 focus:border-teal-400/30 transition-all placeholder:text-gray-600" />
          <button onClick={handleAddGoal} disabled={!newGoalText.trim()} className="glow-button text-white font-bold py-2 px-5 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none ripple">
            <span className="relative z-10 flex items-center gap-2">
              <i className="fas fa-plus"></i> Add
            </span>
          </button>
        </div>
      </div>
      <div className="space-y-6 animate-[slideInUp_0.5s_ease-out]" style={{ animationDelay: '200ms', animationFillMode: 'forwards', opacity: 0 }}>
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-3 font-heading flex items-center gap-2">
            <i className="fas fa-spinner text-teal-400 text-sm"></i>
            In Progress ({incompleteGoals.length})
          </h2>
          <div className="space-y-2">{incompleteGoals.length > 0 ? incompleteGoals.map(goal => (<GoalItem key={goal.id} goal={goal} onToggle={onToggleGoal} />)) : <p className="text-gray-600 italic text-sm glass-card-static p-4 text-center">No active goals. Add one above!</p>}</div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-3 font-heading flex items-center gap-2">
            <i className="fas fa-check-circle text-green-400 text-sm"></i>
            Completed ({completedGoals.length})
          </h2>
          <div className="space-y-2">{completedGoals.length > 0 ? completedGoals.map(goal => (<GoalItem key={goal.id} goal={goal} onToggle={onToggleGoal} />)) : <p className="text-gray-600 italic text-sm glass-card-static p-4 text-center">No completed goals yet.</p>}</div>
        </div>
      </div>
    </div>
  );
};

const GoalItem: React.FC<{ goal: Goal; onToggle: (id: string) => void }> = ({ goal, onToggle }) => (
  <div className={`glass-card-static flex items-center p-4 transition-all duration-300 group cursor-pointer ${goal.completed ? 'opacity-60' : 'hover:bg-white/5'}`} onClick={() => onToggle(goal.id)}>
    <button className={`flex-shrink-0 w-6 h-6 mr-4 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${goal.completed ? 'border-teal-400 bg-teal-400/20' : 'border-gray-600 group-hover:border-teal-400/50'}`}>
      {goal.completed && <i className="fas fa-check text-teal-400 text-xs"></i>}
    </button>
    <span className={`flex-grow text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>{goal.text}</span>
  </div>
);

// --- Main View Components ---
const WellnessDashboardView: React.FC<{ wellnessData: ReturnType<typeof useWellnessData>, setView: (view: View) => void }> = ({ wellnessData, setView }) => {
    const { data, addMoodLog, addActivityLog } = wellnessData;
    
    const cardClass = "card-glow-effect animate-[slideInUp_0.5s_ease-out] opacity-0 transition-all duration-300";
    const animFill = { animationFillMode: 'forwards' as const };

    return (
        <div className="p-4 md:p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-5 h-full overflow-y-auto" style={{ gridAutoRows: 'minmax(300px, 1fr)' }}>
            <div className={`${cardClass} lg:row-span-2`} style={{ ...animFill, animationDelay: '100ms' }}> <ChartCard moodLogs={data.moodLogs} biometricHistory={data.biometricHistory} /> </div>
            <div className={`${cardClass} lg:row-span-2`} style={{ ...animFill, animationDelay: '200ms' }}> <SensorCard onLogMood={addMoodLog} data={data} /> </div>
            <div className={cardClass} style={{ ...animFill, animationDelay: '300ms' }}> <BiometricCard data={data.biometrics} activityLevel={data.activityLevel} /> </div>
            <div className={cardClass} style={{ ...animFill, animationDelay: '400ms' }}> <EnvironmentCard data={data.environment} /> </div>
            <div className={`${cardClass} sm:col-span-2 lg:col-span-2`} style={{ ...animFill, animationDelay: '500ms' }}> <ActivityTracker onLogActivity={addActivityLog} /> </div>
             <div className={`${cardClass} sm:col-span-2 lg:col-span-2`} style={{ ...animFill, animationDelay: '700ms' }}>
                 <div className="glass-card p-5 flex flex-col h-full">
                    <h3 className="font-semibold text-gray-300 mb-3 font-heading flex items-center gap-2">
                      <i className="fas fa-feather-alt text-teal-400 text-sm"></i>
                      Latest Journal Entry
                    </h3>
                    {data.journalEntries.length > 0 ? (
                        <div className="text-sm text-gray-400 space-y-2 flex-grow overflow-hidden">
                             <p className="text-xs text-gray-500">{new Date(data.journalEntries[0].timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                             <p className="whitespace-pre-wrap line-clamp-3">{data.journalEntries[0].text}</p>
                        </div>
                    ) : <p className="text-gray-600 text-sm flex-grow flex items-center justify-center">No journal entries yet.</p>}
                    <button onClick={() => setView('journal')} className="mt-3 w-full text-sm bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-all border border-white/5 hover:border-teal-400/30">
                      <i className="fas fa-arrow-right mr-2 text-xs"></i>View Full Journal
                    </button>
                 </div>
            </div>
            <div className={`${cardClass} sm:col-span-2 lg:col-span-2`} style={{ ...animFill, animationDelay: '800ms' }}> <BreathingExercise isDashboardWidget={true} onNavigate={() => setView('breathe')} /> </div>
            <div className={`${cardClass} sm:col-span-2 lg:col-span-2`} style={{ ...animFill, animationDelay: '600ms' }}> <GoalsSummaryCard goals={data.goals} onNavigate={() => setView('goals')} /> </div>
        </div>
    );
};

const AssistantView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'model', text: 'Hello, I am your personal AI therapist. How are you feeling today?' }]);
    const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const handleSendMessage = async (text: string) => {
        setIsLoading(true);
        setCurrentAnalysis(null);
        const userMessage: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMessage]);
        try {
            const { response, analysis } = await analyzeAndRespond(messages, text);
            const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: response };
            setMessages(prev => [...prev, modelMessage]);
            setCurrentAnalysis(analysis);
        } catch (error) { console.error("Failed to get response from AI", error); setMessages(prev => [...prev, { id: 'err', role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]); } 
        finally { setIsLoading(false); }
    };
    return (
         <div className="flex-1 flex overflow-hidden h-full">
            <main className="flex-1 overflow-y-auto"> <AiAssistant messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} /> </main>
            <aside className="w-80 lg:w-96 glass-card-static border-l border-white/5 p-4 lg:p-6 overflow-y-auto hidden md:block rounded-none"> <AnalysisPanel analysis={currentAnalysis} isLoading={isLoading} /> </aside>
        </div>
    );
};

// --- Main Component ---
const ChatDashboard: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const wellnessData = useWellnessData();
    
    const renderContent = () => {
        let viewContent;
        switch (activeView) {
            case 'dashboard': viewContent = <WellnessDashboardView wellnessData={wellnessData} setView={setActiveView} />; break;
            case 'assistant': viewContent = <AssistantView />; break;
            case 'journal': viewContent = <Journal onAddEntry={wellnessData.addJournalEntry} onEditEntry={wellnessData.editJournalEntry} onDeleteEntry={wellnessData.deleteJournalEntry} entries={wellnessData.data.journalEntries} />; break;
            case 'goals': viewContent = <GoalsPage goals={wellnessData.data.goals} onAddGoal={wellnessData.addGoal} onToggleGoal={wellnessData.toggleGoal} />; break;
            case 'breathe': viewContent = <div className="p-4 md:p-8 h-full"><BreathingExercise isDashboardWidget={false} /></div>; break;
            default: viewContent = <WellnessDashboardView wellnessData={wellnessData} setView={setActiveView} />;
        }
        return (
          <div key={activeView} className="h-full w-full animate-[slideInFromRight_0.4s_ease-out]">
            {viewContent}
          </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-transparent text-gray-200">
            <Sidebar activeView={activeView} setActiveView={setActiveView} isMobileOpen={isMobileMenuOpen} setIsMobileOpen={setIsMobileMenuOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="glass-card-static border-b border-white/5 p-4 flex items-center justify-between md:hidden rounded-none">
                    <button
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <i className="fas fa-bars text-lg"></i>
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D9488, #2DD4BF)' }}>
                        <i className="fas fa-spa text-white text-sm"></i>
                      </div>
                      <h1 className="text-lg font-bold text-white font-heading">Haven</h1>
                    </div>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </header>
                {renderContent()}
            </div>
        </div>
    );
};

export default ChatDashboard;