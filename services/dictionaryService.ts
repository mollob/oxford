import { DictionaryEntry } from '../types';

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export class DictionaryService {
  async fetchDefinition(word: string): Promise<DictionaryEntry[]> {
    try {
      const response = await fetch(`${BASE_URL}/${word}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Word not found');
        }
        throw new Error('Network response was not ok');
      }
      const data: DictionaryEntry[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching definition:', error);
      throw error;
    }
  }
}

export const dictionaryService = new DictionaryService();
