import React, { useState, useEffect } from 'react';

export type View = 'dashboard' | 'assistant' | 'journal' | 'goals' | 'breathe';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const navItems: { id: View; name: string; icon: string }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: 'fa-th-large' },
  { id: 'assistant', name: 'AI Assistant', icon: 'fa-brain' },
  { id: 'journal', name: 'Journal', icon: 'fa-book-open' },
  { id: 'goals', name: 'Goals', icon: 'fa-bullseye' },
  { id: 'breathe', name: 'Breathe', icon: 'fa-wind' },
];

const getGreeting = (): { text: string; icon: string } => {
  const hour = new Date().getHours();
  if (hour < 6) return { text: 'Good Night', icon: '🌙' };
  if (hour < 12) return { text: 'Good Morning', icon: '🌤️' };
  if (hour < 17) return { text: 'Good Afternoon', icon: '☀️' };
  if (hour < 21) return { text: 'Good Evening', icon: '🌅' };
  return { text: 'Good Night', icon: '🌙' };
};

const SidebarContent: React.FC<{ activeView: View; setActiveView: (view: View) => void; onNavClick?: () => void }> = ({ activeView, setActiveView, onNavClick }) => {
  const greeting = getGreeting();

  const handleLogoClick = () => {
    setActiveView('dashboard');
    onNavClick?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <button
        onClick={handleLogoClick}
        className="flex items-center gap-3 mb-2 px-2 focus:outline-none"
        type="button"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0D9488, #2DD4BF)' }}>
          <i className="fas fa-spa text-white text-lg"></i>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white font-heading">Haven</h1>
      </button>

      {/* Greeting */}
      <div className="glass-card-static px-4 py-3 mb-6 mt-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Welcome back</p>
        <p className="text-sm font-medium text-gray-300">
          {greeting.icon} {greeting.text}
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-2 px-3">Navigate</p>
        {navItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              onNavClick?.();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-4 text-sm font-medium transition-all duration-300 ripple group
              ${activeView === item.id
                ? 'bg-gradient-to-r from-teal-600/80 to-teal-500/60 text-white shadow-lg shadow-teal-500/10'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            style={{
              animation: `slideInUp 0.4s ease-out ${index * 60}ms both`,
            }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
              activeView === item.id
                ? 'bg-white/20'
                : 'bg-white/5 group-hover:bg-white/10'
            }`}>
              <i className={`fas ${item.icon} text-sm ${activeView === item.id ? 'text-white' : 'text-gray-400 group-hover:text-teal-300'}`}></i>
            </div>
            <span>{item.name}</span>
            {activeView === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto glass-card-static px-4 py-3 text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider">Your Mental Wellness Companion</p>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className="w-1 h-1 rounded-full bg-green-400"></span>
          <span className="text-[10px] text-green-400/80">AI Online</span>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 glass-card-static p-4 flex-shrink-0 hidden md:flex md:flex-col border-r border-white/5 rounded-none">
        <SidebarContent activeView={activeView} setActiveView={setActiveView} />
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-72 glass-card-static p-4 flex flex-col border-r border-white/5 rounded-none animate-[slideDrawer_0.3s_ease-out]"
            style={{ background: 'rgba(15, 23, 42, 0.97)' }}
          >
            <button
              onClick={() => setIsMobileOpen(false)}
              className="self-end mb-2 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
            <SidebarContent activeView={activeView} setActiveView={setActiveView} onNavClick={() => setIsMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;