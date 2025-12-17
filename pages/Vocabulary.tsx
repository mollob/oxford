import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { StoredWord, SortOption } from '../types';
import { Calendar, TrendingUp, SortAsc, Star, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Vocabulary: React.FC = () => {
  const [words, setWords] = useState<StoredWord[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('count');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    setLoading(true);
    const allWords = await dbService.getAllWords();
    setWords(allWords);
    setLoading(false);
  };

  const sortedWords = [...words].sort((a, b) => {
    if (sortBy === 'count') return b.lookupCount - a.lookupCount;
    if (sortBy === 'date') return b.lastLookupDate - a.lastLookupDate;
    return a.word.localeCompare(b.word);
  });

  const topWords = [...words]
    .sort((a, b) => b.lookupCount - a.lookupCount)
    .slice(0, 5)
    .map(w => ({ name: w.word, count: w.lookupCount }));

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Your Vocabulary</h2>
          <p className="text-slate-500 text-sm">You have looked up {words.length} unique words.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setSortBy('count')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sortBy === 'count' ? 'bg-white text-oxford-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <TrendingUp size={16} className="inline mr-2" />
            Freq
          </button>
          <button 
            onClick={() => setSortBy('date')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sortBy === 'date' ? 'bg-white text-oxford-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Calendar size={16} className="inline mr-2" />
            Recent
          </button>
          <button 
            onClick={() => setSortBy('alpha')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sortBy === 'alpha' ? 'bg-white text-oxford-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <SortAsc size={16} className="inline mr-2" />
            A-Z
          </button>
        </div>
      </header>

      {/* Stats Chart */}
      {words.length > 2 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Top Lookups</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topWords}>
                <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {topWords.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#486581' : '#9fb3c8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* List */}
      <div className="grid gap-3">
        {loading ? (
          <div className="text-center py-10 text-slate-400">Loading library...</div>
        ) : sortedWords.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-500">No words found. Start searching!</p>
          </div>
        ) : (
          sortedWords.map((word) => (
            <div key={word.word} className="bg-white p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-oxford-600 font-bold text-lg">
                   {word.word.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <h3 className="text-lg font-serif font-bold text-slate-800 capitalize flex items-center">
                     {word.word}
                     {word.isFavorite && <Star size={14} className="text-yellow-500 ml-2 fill-current" />}
                   </h3>
                   <p className="text-sm text-slate-500 truncate max-w-[200px] md:max-w-md">
                     {word.data.meanings[0]?.definitions[0]?.definition}
                   </p>
                 </div>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mb-1">
                  {word.lookupCount}x
                </span>
                <span className="text-xs text-slate-400">{formatDate(word.lastLookupDate)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
