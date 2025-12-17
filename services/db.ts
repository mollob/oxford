import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StoredWord } from '../types';

interface WordDB extends DBSchema {
  words: {
    key: string;
    value: StoredWord;
    indexes: {
      'by-count': number;
      'by-date': number;
    };
  };
}

const DB_NAME = 'oxford-word-learner-db';
const STORE_NAME = 'words';

class DatabaseService {
  private dbPromise: Promise<IDBPDatabase<WordDB>>;

  constructor() {
    this.dbPromise = openDB<WordDB>(DB_NAME, 1, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'word' });
        store.createIndex('by-count', 'lookupCount');
        store.createIndex('by-date', 'lastLookupDate');
      },
    });
  }

  async getWord(word: string): Promise<StoredWord | undefined> {
    const db = await this.dbPromise;
    return db.get(STORE_NAME, word.toLowerCase());
  }

  async saveWord(wordEntry: StoredWord): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, wordEntry);
  }

  async incrementLookup(word: string): Promise<StoredWord | undefined> {
    const db = await this.dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const existing = await store.get(word.toLowerCase());
    if (existing) {
      existing.lookupCount += 1;
      existing.lastLookupDate = Date.now();
      await store.put(existing);
      await tx.done;
      return existing;
    }
    await tx.done;
    return undefined;
  }

  async getAllWords(): Promise<StoredWord[]> {
    const db = await this.dbPromise;
    return db.getAll(STORE_NAME);
  }

  async toggleFavorite(word: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const existing = await store.get(word.toLowerCase());
    if (existing) {
      existing.isFavorite = !existing.isFavorite;
      await store.put(existing);
    }
    await tx.done;
  }

  async saveAiNote(word: string, note: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    const existing = await store.get(word.toLowerCase());
    if (existing) {
      existing.aiNote = note;
      await store.put(existing);
    }
    await tx.done;
  }
}

export const dbService = new DatabaseService();
