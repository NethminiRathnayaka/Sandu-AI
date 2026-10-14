import Dexie, { Table } from 'dexie';
import seedFlashcards from '../data/seedFlashcards.json';
import seedQuotes from '../data/quotes.json';

export interface FlashcardRecord {
  id: string;
  deck: string;
  question: string;
  answer: string;
  tags: string[];
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReview: number;
  createdAt: number;
  lastReviewed?: number;
}

export interface QuoteRecord {
  id: string;
  text: string;
  author: string;
  category: string;
  sanduTip: string;
  isFavorite: number; // 0 or 1
  likedCount?: number;
}

export interface FitnessLogRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  duration: number; // minutes
  calories: number;
  steps: number;
  waterGlasses: number;
  sleepHours: number;
  notes?: string;
  createdAt: number;
}

export interface LanguageWordProgress {
  id: string; // matches vocab item id
  learned: boolean;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReview: number;
  quizSuccessCount: number;
  quizFailureCount: number;
}

export class SanduDatabase extends Dexie {
  flashcards!: Table<FlashcardRecord, string>;
  quotes!: Table<QuoteRecord, string>;
  fitnessLogs!: Table<FitnessLogRecord, string>;
  languageProgress!: Table<LanguageWordProgress, string>;

  constructor() {
    super('sandu_hub_db');
    this.version(1).stores({
      flashcards: 'id, deck, nextReview, createdAt',
      quotes: 'id, category, isFavorite',
      fitnessLogs: 'id, date, type, createdAt',
      languageProgress: 'id, learned, nextReview'
    });
  }
}

export const db = new SanduDatabase();

// Seed initial database if empty
export async function seedInitialDataIfNeeded() {
  try {
    const flashcardCount = await db.flashcards.count();
    if (flashcardCount === 0) {
      await db.flashcards.bulkAdd(seedFlashcards as FlashcardRecord[]);
    }

    const quoteCount = await db.quotes.count();
    if (quoteCount === 0) {
      const initialQuotes = seedQuotes.map((q) => ({
        ...q,
        isFavorite: 0,
        likedCount: 0
      }));
      await db.quotes.bulkAdd(initialQuotes);
    }

    // Seed dummy fitness logs for last 14 days so linear regression ML forecast has rich trends out of the box
    const fitnessCount = await db.fitnessLogs.count();
    if (fitnessCount === 0) {
      const now = new Date();
      const dummyLogs: FitnessLogRecord[] = [];
      const types = ['walking', 'running', 'cycling', 'gym', 'yoga'];
      
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        // Progressive simulated steps and calories
        const baseSteps = 5500 + Math.floor(Math.random() * 3500) + (14 - i) * 150;
        const duration = 20 + Math.floor(Math.random() * 40);
        const calories = Math.round(duration * 6.5 + Math.random() * 50);

        dummyLogs.push({
          id: `fit-seed-${i}`,
          date: dateStr,
          type: types[i % types.length],
          duration,
          calories,
          steps: baseSteps,
          waterGlasses: 5 + (i % 4),
          sleepHours: 7 + (i % 2 === 0 ? 0.5 : -0.5),
          notes: i === 0 ? 'Feeling energized today!' : 'Consistent routine.',
          createdAt: d.getTime()
        });
      }
      await db.fitnessLogs.bulkAdd(dummyLogs);
    }
  } catch (err) {
    console.warn('Database seed error:', err);
  }
}
