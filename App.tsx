import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Vocabulary } from './pages/Vocabulary';
import { Flashcards } from './pages/Flashcards';
import { Book, Search, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'home' | 'vocab' | 'cards'>('home');

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <Home />;
      case 'vocab': return <Vocabulary />;
      case 'cards': return <Flashcards />;
      default: return <Home />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb shadow-lg z-50">
        <div className="flex justify-around items-center max-w-2xl mx-auto h-16">
          <button 
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center space-y-1 p-2 w-16 transition-colors ${currentTab === 'home' ? 'text-oxford-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Search size={24} strokeWidth={currentTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          <button 
            onClick={() => setCurrentTab('cards')}
            className={`flex flex-col items-center space-y-1 p-2 w-16 transition-colors ${currentTab === 'cards' ? 'text-oxford-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BrainCircuit size={24} strokeWidth={currentTab === 'cards' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Practice</span>
          </button>

          <button 
            onClick={() => setCurrentTab('vocab')}
            className={`flex flex-col items-center space-y-1 p-2 w-16 transition-colors ${currentTab === 'vocab' ? 'text-oxford-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Book size={24} strokeWidth={currentTab === 'vocab' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">List</span>
          </button>
        </div>
      </nav>
      
      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .perspective { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};

export default App;
