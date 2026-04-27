import React, { useState } from 'react';
import { JournalEntry } from '../types';

interface JournalProps {
  onAddEntry: (text: string) => void;
  onEditEntry: (id: string, text: string) => void;
  onDeleteEntry: (id: string) => void;
  entries: JournalEntry[];
}

const Journal: React.FC<JournalProps> = ({ onAddEntry, onEditEntry, onDeleteEntry, entries }) => {
  const [text, setText] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (editingEntryId) {
      onEditEntry(editingEntryId, text);
      setEditingEntryId(null);
    } else {
      onAddEntry(text);
    }
    setText('');
  };
  
  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-y-auto">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold text-white mb-2 font-heading animate-[slideInUp_0.5s_ease-out]">Your Journal</h1>
        <p className="text-gray-500 text-sm mb-6 animate-[slideInUp_0.5s_ease-out]">A safe space for your thoughts and reflections</p>
        
        <div className="glass-card p-5 mb-6 animate-[slideInUp_0.5s_ease-out]" style={{ animationDelay: '100ms', animationFillMode: 'forwards', opacity: 0 }}>
          <h3 className="font-semibold text-gray-300 mb-3 font-heading flex items-center gap-2">
            <i className="fas fa-feather-alt text-teal-400 text-sm"></i>
            {editingEntryId ? 'Edit Entry' : 'New Entry'}
          </h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write about your thoughts and feelings..."
            className="bg-white/5 p-4 rounded-xl text-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-teal-400/30 border border-white/5 focus:border-teal-400/30 resize-none transition-all placeholder:text-gray-600"
            rows={6}
          ></textarea>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button 
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="w-full glow-button text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none ripple"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <i className={`fas ${editingEntryId ? 'fa-edit' : 'fa-save'}`}></i> {editingEntryId ? 'Update Entry' : 'Save Entry'}
              </span>
            </button>
            {editingEntryId && (
              <button
                type="button"
                onClick={() => { setEditingEntryId(null); setText(''); }}
                className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-semibold py-2.5 px-4 rounded-xl transition-all border border-white/5 hover:border-red-400/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <i className="fas fa-times-circle"></i> Cancel
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4 font-heading animate-[slideInUp_0.5s_ease-out] flex items-center gap-2" style={{ animationDelay: '200ms', animationFillMode: 'forwards', opacity: 0 }}>
          <i className="fas fa-history text-gray-500 text-sm"></i>
          Past Entries
        </h2>
        <div className="space-y-3">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <div 
                key={entry.id} 
                className={`glass-card p-4 ${index === 0 ? 'animate-[fadeIn_0.7s_ease-out]' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-calendar-alt text-gray-600 text-xs"></i>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEntryId(entry.id);
                        setText(entry.text);
                      }}
                      className="text-teal-300 hover:text-white text-sm px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <i className="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntry(entry.id)}
                      className="text-red-300 hover:text-white text-sm px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <i className="fas fa-trash-alt mr-1"></i>Delete
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{entry.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 p-12 glass-card-static animate-[fadeIn_0.7s_ease-out]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book-reader text-3xl text-gray-600"></i>
              </div>
              <p className="font-medium">Your journal is empty.</p>
              <p className="text-sm mt-1">Write your first entry above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;