import React, { useState } from 'react';
import { DictionaryEntry, StoredWord } from '../types';
import { Volume2, Star, BrainCircuit, BookOpen } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/db';

interface WordDisplayProps {
  data: StoredWord;
  onUpdate: () => void;
}

export const WordDisplay: React.FC<WordDisplayProps> = ({ data, onUpdate }) => {
  const entry = data.data;
  const [aiLoading, setAiLoading] = useState(false);

  const playAudio = (url?: string) => {
    if (url) {
      new Audio(url).play();
    }
  };

  const handleToggleFavorite = async () => {
    await dbService.toggleFavorite(data.word);
    onUpdate();
  };

  const handleGenerateMnemonic = async () => {
    setAiLoading(true);
    // Find first definition for context
    const firstDef = entry.meanings[0]?.definitions[0]?.definition || "";
    const mnemonic = await geminiService.generateMnemonic(data.word, firstDef);
    await dbService.saveAiNote(data.word, mnemonic);
    setAiLoading(false);
    onUpdate();
  };

  const audioUrl = entry.phonetics.find(p => p.audio && p.audio.length > 0)?.audio;

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mt-6">
      {/* Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 capitalize mb-2">{data.word}</h1>
          <div className="flex items-center space-x-3 text-slate-500">
            {entry.phonetic && <span className="font-mono text-lg">{entry.phonetic}</span>}
            {audioUrl && (
              <button 
                onClick={() => playAudio(audioUrl)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                title="Play pronunciation"
              >
                <Volume2 size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
           <button 
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition-colors ${data.isFavorite ? 'text-yellow-500 bg-yellow-50' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Star size={24} fill={data.isFavorite ? "currentColor" : "none"} />
          </button>
          <div className="text-xs font-semibold text-oxford-600 bg-oxford-100 px-3 py-1 rounded-full">
            Lookups: {data.lookupCount}
          </div>
        </div>
      </div>

      {/* AI Section */}
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="text-indigo-600" size={20} />
          <span className="text-sm text-indigo-900 font-medium">Smart Assistant</span>
        </div>
        {data.aiNote ? (
           <p className="text-indigo-800 text-sm italic flex-1 ml-4 border-l-2 border-indigo-300 pl-3">
             "{data.aiNote}"
           </p>
        ) : (
          <button 
            onClick={handleGenerateMnemonic}
            disabled={aiLoading}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {aiLoading ? 'Thinking...' : 'Generate Mnemonic'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {entry.meanings.map((meaning, idx) => (
          <div key={idx} className="group">
            <div className="flex items-center mb-3">
              <span className="italic font-bold text-slate-700 font-serif text-lg mr-3">{meaning.partOfSpeech}</span>
              <div className="h-px bg-slate-100 flex-grow"></div>
            </div>
            
            <ul className="space-y-4 pl-4">
              {meaning.definitions.map((def, dIdx) => (
                <li key={dIdx} className="text-slate-700 leading-relaxed list-disc marker:text-slate-400">
                  <span className="">{def.definition}</span>
                  {def.example && (
                    <p className="mt-1 text-slate-500 text-sm italic pl-2 border-l-2 border-slate-200">
                      "{def.example}"
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {meaning.synonyms.length > 0 && (
               <div className="mt-3 pl-4 flex flex-wrap gap-2">
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Synonyms:</span>
                 {meaning.synonyms.slice(0, 5).map(syn => (
                   <span key={syn} className="text-sm text-oxford-600 hover:underline cursor-pointer">
                     {syn}
                   </span>
                 ))}
               </div>
            )}
          </div>
        ))}

        {entry.sourceUrls && entry.sourceUrls.length > 0 && (
          <div className="pt-6 mt-6 border-t border-slate-100">
            <a 
              href={entry.sourceUrls[0]} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center text-xs text-slate-400 hover:text-slate-600 transition"
            >
              <BookOpen size={14} className="mr-1" />
              Source: {entry.sourceUrls[0]}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
