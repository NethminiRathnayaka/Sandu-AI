import { db, FlashcardRecord, FitnessLogRecord } from '../db';
import { useAppStore } from '../store/useAppStore';
import i18n from '../i18n/config';

export interface SanduActionPayload {
  action:
    | 'add_flashcard'
    | 'log_fitness'
    | 'new_quote'
    | 'switch_theme'
    | 'change_language'
    | 'navigate'
    | 'start_quiz'
    | 'drink_water'
    | 'reset_data';
  params?: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  message: string;
}

/**
 * Executes an in-app action triggered by user command or SANDU's brain
 */
export async function executeSanduAction(
  payload: SanduActionPayload
): Promise<ActionResult> {
  const store = useAppStore.getState();

  try {
    switch (payload.action) {
      case 'add_flashcard': {
        const question = payload.params?.question || 'New Question';
        const answer = payload.params?.answer || 'New Answer';
        const deck = payload.params?.deck || 'General';

        const newCard: FlashcardRecord = {
          id: `fc-${Date.now()}`,
          deck,
          question,
          answer,
          tags: ['chat-created'],
          interval: 1,
          repetition: 0,
          easeFactor: 2.5,
          nextReview: Date.now(),
          createdAt: Date.now()
        };

        await db.flashcards.add(newCard);
        store.addXP(20);
        return {
          success: true,
          message: `Created new flashcard in deck "${deck}": "${question}"`
        };
      }

      case 'log_fitness': {
        const type = payload.params?.type || 'walking';
        const duration = Number(payload.params?.duration) || 20;
        const calories = Number(payload.params?.calories) || Math.round(duration * 6.5);
        const steps = Number(payload.params?.steps) || Math.round(duration * 100);

        const todayStr = new Date().toISOString().split('T')[0];

        const logRecord: FitnessLogRecord = {
          id: `fit-${Date.now()}`,
          date: todayStr,
          type,
          duration,
          calories,
          steps,
          waterGlasses: 0,
          sleepHours: 0,
          notes: 'Logged via SANDU companion chat',
          createdAt: Date.now()
        };

        await db.fitnessLogs.add(logRecord);
        store.addXP(25);
        return {
          success: true,
          message: `Logged ${duration} min ${type} (${calories} kcal, ${steps} steps)! Keep it up!`
        };
      }

      case 'drink_water': {
        const count = Number(payload.params?.count) || 1;
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Find existing record today or create one
        const existing = await db.fitnessLogs.where('date').equals(todayStr).first();
        if (existing) {
          await db.fitnessLogs.update(existing.id, {
            waterGlasses: (existing.waterGlasses || 0) + count
          });
        } else {
          await db.fitnessLogs.add({
            id: `fit-${Date.now()}`,
            date: todayStr,
            type: 'walking',
            duration: 0,
            calories: 0,
            steps: 0,
            waterGlasses: count,
            sleepHours: 0,
            createdAt: Date.now()
          });
        }
        store.addXP(10);
        return {
          success: true,
          message: `Added ${count} glass(es) of water! Stay hydrated!`
        };
      }

      case 'switch_theme': {
        const mode = payload.params?.mode || 'dark';
        store.setThemeMode(mode);
        return {
          success: true,
          message: `Switched theme to ${mode} mode!`
        };
      }

      case 'change_language': {
        const lang = payload.params?.lang || 'en';
        if (['en', 'si', 'ta'].includes(lang)) {
          i18n.changeLanguage(lang);
          return {
            success: true,
            message: `Language updated to ${lang.toUpperCase()}!`
          };
        }
        return { success: false, message: 'Unsupported language requested.' };
      }

      case 'navigate': {
        const tab = payload.params?.tab || 'home';
        store.setActiveTab(tab);
        return {
          success: true,
          message: `Navigated to ${tab} screen!`
        };
      }

      case 'start_quiz': {
        store.setActiveTab('flashcards');
        return {
          success: true,
          message: 'Opened Flashcards Quiz mode! Good luck!'
        };
      }

      case 'reset_data': {
        await db.flashcards.clear();
        await db.quotes.clear();
        await db.fitnessLogs.clear();
        return {
          success: true,
          message: 'All local data has been reset to defaults.'
        };
      }

      default:
        return { success: false, message: 'Unrecognized action.' };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Action execution failed.' };
  }
}
