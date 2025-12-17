import React, { useState, useEffect } from 'react';
import { dbService } from '../services/db';
import { StoredWord } from '../types';
import { RotateCw, CheckCircle, XCircle, Brain, RefreshCw } from 'lucide-react';

export const Flashcards: React.FC = () => {
  const [deck, setDeck] = useState<StoredWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDeck();
  }, []);

  const initDeck = async () => {
    setLoading(true);
    const words = await dbService.getAllWords();
    // Simple shuffle
    const shuffled = words
      .sort(() => Math.random() - 0.5)
      .slice(0, 10); // Take random 10 for the session
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionStats({ correct: 0, total: 0 });
    setLoading(false);
  };

  const handleNext = (correct: boolean) => {
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
    
    if (currentIndex < deck.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      // End of session
      setCurrentIndex(deck.length); 
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Loading cards...</div>;
  }

  if (deck.length === 0) {
    return (
      <div className="text-center p-12 max-w-md mx-auto">
        <Brain size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700 mb-2">Not enough words</h3>
        <p className="text-slate-500">Look up some words first to build your flashcard deck.</p>
      </div>
    );
  }

  if (currentIndex >= deck.length) {
     return (
       <div className="flex flex-col items-center justify-center h-[60vh] max-w-md mx-auto p-6 text-center">
         <div className="bg-white rounded-full p-6 shadow-lg mb-6">
           <CheckCircle size={48} className="text-green-500" />
         </div>
         <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">Session Complete!</h2>
         <p className="text-slate-500 mb-8">You recalled {sessionStats.correct} out of {sessionStats.total} words correctly.</p>
         <button 
           onClick={initDeck}
           className="flex items-center bg-oxford-600 text-white px-8 py-3 rounded-full hover:bg-oxford-700 transition"
         >
           <RefreshCw className="mr-2" size={20} />
           Start New Session
         </button>
       </div>
     )
  }

  const currentCard = deck[currentIndex];

  return (
    <div className="max-w-xl mx-auto p-4 pb-24 h-[calc(100vh-100px)] flex flex-col justify-center">
      <div className="text-center mb-6">
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Card {currentIndex + 1} / {deck.length}</span>
      </div>

      <div 
        className="relative w-full aspect-[4/5] md:aspect-[3/2] perspective cursor-pointer group"
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div className={`w-full h-full relative preserve-3d transition-transform duration-500 ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 hover:border-oxford-200 transition-colors">
            <span className="text-sm text-slate-400 absolute top-6 uppercase tracking-wider font-semibold">Word</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 capitalize text-center">
              {currentCard.word}
            </h2>
            {currentCard.data.phonetic && (
              <p className="mt-4 font-mono text-slate-500 text-lg">{currentCard.data.phonetic}</p>
            )}
             <p className="absolute bottom-8 text-xs text-slate-400 italic">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-oxford-900 text-white rounded-2xl shadow-xl flex flex-col items-center justify-center p-8">
             <span className="text-sm text-oxford-300 absolute top-6 uppercase tracking-wider font-semibold">Definition</span>
             
             <div className="text-center overflow-y-auto max-h-[60%]">
               <p className="text-lg md:text-xl font-medium leading-relaxed">
                 {currentCard.data.meanings[0]?.definitions[0]?.definition}
               </p>
               {currentCard.aiNote && (
                 <div className="mt-4 pt-4 border-t border-oxford-700">
                    <p className="text-sm text-oxford-200 italic">"{currentCard.aiNote}"</p>
                 </div>
               )}
             </div>

             <div className="absolute bottom-8 flex space-x-4">
               <button 
                 onClick={(e) => { e.stopPropagation(); handleNext(false); }}
                 className="flex flex-col items-center space-y-1 text-red-300 hover:text-white transition"
               >
                 <XCircle size={32} />
                 <span className="text-xs font-medium">Forgot</span>
               </button>
               <div className="w-px bg-oxford-700 mx-4"></div>
               <button 
                 onClick={(e) => { e.stopPropagation(); handleNext(true); }}
                 className="flex flex-col items-center space-y-1 text-green-300 hover:text-white transition"
               >
                 <CheckCircle size={32} />
                 <span className="text-xs font-medium">Got it</span>
               </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
