export interface Phonetic {
  text: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  sourceUrls: string[];
}

export interface StoredWord {
  word: string;
  data: DictionaryEntry;
  lookupCount: number;
  lastLookupDate: number; // timestamp
  isFavorite: boolean;
  aiNote?: string; // Optional AI generated mnemonic or note
}

export type SortOption = 'date' | 'count' | 'alpha';

export interface FlashcardSession {
  totalReviewed: number;
  correct: number;
}
