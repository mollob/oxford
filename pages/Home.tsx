import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { dbService } from '../services/db';
import { dictionaryService } from '../services/dictionaryService';
import { StoredWord, DictionaryEntry } from '../types';
import { WordDisplay } from '../components/WordDisplay';

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentWord, setCurrentWord] = useState<StoredWord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentWord(null);

    const term = searchTerm.trim().toLowerCase();

    try {
      // 1. Try to increment lookup in DB first (this implies it exists)
      const existing = await dbService.incrementLookup(term);

      if (existing) {
        setCurrentWord(existing);
      } else {
        // 2. Fetch from API if not in DB
        const apiData = await dictionaryService.fetchDefinition(term);
        
        if (apiData && apiData.length > 0) {
          const newEntry: StoredWord = {
            word: apiData[0].word,
            data: apiData[0],
            lookupCount: 1,
            lastLookupDate: Date.now(),
            isFavorite: false,
          };
          await dbService.saveWord(newEntry);
          setCurrentWord(newEntry);
        } else {
          setError("No definitions found.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to lookup word. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrent = async () => {
    if (currentWord) {
      const updated = await dbService.getWord(currentWord.word);
      if (updated) setCurrentWord(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
      <div className="text-center mb-10 mt-6">
        <h2 className="text-3xl font-serif font-bold text-oxford-800 mb-2">Oxford Word Learner</h2>
        <p className="text-slate-500">Expand your vocabulary, one word at a time.</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a word..."
          className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-200 focus:border-oxford-500 focus:ring-4 focus:ring-oxford-100 outline-none transition-all shadow-sm text-lg"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={24} />
        <button 
          type="submit"
          disabled={loading || !searchTerm.trim()}
          className="absolute right-2 top-2 bottom-2 bg-oxford-600 text-white px-6 rounded-full font-medium hover:bg-oxford-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Look up'}
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto bg-red-50 text-red-700 p-4 rounded-lg flex items-center justify-center space-x-2 border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {currentWord && (
        <WordDisplay data={currentWord} onUpdate={refreshCurrent} />
      )}

      {!currentWord && !loading && !error && (
        <div className="text-center mt-20 opacity-40">
           <Search size={64} className="mx-auto text-slate-300 mb-4" />
           <p className="text-lg text-slate-500 font-serif italic">Start typing to explore the dictionary...</p>
        </div>
      )}
    </div>
  );
};
