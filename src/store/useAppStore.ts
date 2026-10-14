import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SanduExpression =
  | 'idle'
  | 'happy'
  | 'thinking'
  | 'talking'
  | 'celebrating'
  | 'encouraging'
  | 'sleepy'
  | 'surprised';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sandu';
  text: string;
  timestamp: number;
  expression?: SanduExpression;
  quickReplies?: string[];
  actionPending?: {
    action: string;
    params: any;
    label: string;
  };
}

export interface AppState {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Appearance & Theme
  themeMode: 'light' | 'dark' | 'system';
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  fontStyle: 'sans' | 'rounded' | 'serif' | 'mono';
  setFontStyle: (style: 'sans' | 'rounded' | 'serif' | 'mono') => void;
  cardStyle: 'rounded' | 'sharp' | 'glass';
  setCardStyle: (style: 'rounded' | 'sharp' | 'glass') => void;
  backgroundEffect: 'none' | 'particles' | 'sakura' | 'gradient';
  setBackgroundEffect: (effect: 'none' | 'particles' | 'sakura' | 'gradient') => void;

  // Accessibility
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  dyslexiaFont: boolean;
  setDyslexiaFont: (val: boolean) => void;

  // User Profile
  userName: string;
  setUserName: (name: string) => void;
  userNickname: string;
  setUserNickname: (nick: string) => void;
  streak: number;
  incrementStreak: () => void;
  xp: number;
  addXP: (amount: number) => void;
  level: number;

  // SANDU Persona & Avatar
  sanduExpression: SanduExpression;
  setSanduExpression: (exp: SanduExpression) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speechPitch: number;
  setSpeechPitch: (pitch: number) => void;
  chatTone: 'cute' | 'calm' | 'energetic';
  setChatTone: (tone: 'cute' | 'calm' | 'energetic') => void;
  sanduOutfitColor: string;
  setSanduOutfitColor: (color: string) => void;

  // Chat Drawer
  isChatDrawerOpen: boolean;
  setChatDrawerOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;

  // Fitness Settings
  targetSteps: number;
  setTargetSteps: (steps: number) => void;
  targetCalories: number;
  setTargetCalories: (kcal: number) => void;
  targetWorkoutMinutes: number;
  setTargetWorkoutMinutes: (mins: number) => void;
  units: 'metric' | 'imperial';
  setUnits: (unit: 'metric' | 'imperial') => void;

  // Language Learning Settings
  nativeLanguage: 'en' | 'si' | 'ta';
  setNativeLanguage: (lang: 'en' | 'si' | 'ta') => void;
  targetLanguage: 'en' | 'si' | 'ta';
  setTargetLanguage: (lang: 'en' | 'si' | 'ta') => void;

  // First-run Tour
  hasCompletedTour: boolean;
  setHasCompletedTour: (val: boolean) => void;
  isTourActive: boolean;
  setIsTourActive: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
      accentColor: '#6366f1',
      setAccentColor: (color) => set({ accentColor: color }),
      fontSize: 'medium',
      setFontSize: (size) => set({ fontSize: size }),
      fontStyle: 'sans',
      setFontStyle: (style) => set({ fontStyle: style }),
      cardStyle: 'rounded',
      setCardStyle: (style) => set({ cardStyle: style }),
      backgroundEffect: 'sakura',
      setBackgroundEffect: (effect) => set({ backgroundEffect: effect }),

      reducedMotion: false,
      setReducedMotion: (val) => set({ reducedMotion: val }),
      highContrast: false,
      setHighContrast: (val) => set({ highContrast: val }),
      dyslexiaFont: false,
      setDyslexiaFont: (val) => set({ dyslexiaFont: val }),

      userName: 'Friend',
      setUserName: (name) => set({ userName: name }),
      userNickname: 'Champion',
      setUserNickname: (nick) => set({ userNickname: nick }),
      streak: 3,
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      xp: 120,
      level: 2,
      addXP: (amount) => {
        const currentXP = get().xp + amount;
        const newLevel = Math.floor(currentXP / 100) + 1;
        set({ xp: currentXP, level: newLevel });
      },

      sanduExpression: 'idle',
      setSanduExpression: (exp) => set({ sanduExpression: exp }),
      voiceEnabled: true,
      setVoiceEnabled: (val) => set({ voiceEnabled: val }),
      speechRate: 1.0,
      setSpeechRate: (rate) => set({ speechRate: rate }),
      speechPitch: 1.1,
      setSpeechPitch: (pitch) => set({ speechPitch: pitch }),
      chatTone: 'cute',
      setChatTone: (tone) => set({ chatTone: tone }),
      sanduOutfitColor: '#6366f1',
      setSanduOutfitColor: (color) => set({ sanduOutfitColor: color }),

      isChatDrawerOpen: false,
      setChatDrawerOpen: (open) => set({ isChatDrawerOpen: open }),
      chatMessages: [
        {
          id: 'welcome-msg',
          sender: 'sandu',
          text: "Kon'nichiwa! I'm SANDU, your study & wellness anime companion! Ready to learn, work out, or get motivated together?",
          timestamp: Date.now(),
          expression: 'happy',
          quickReplies: [
            'Quiz me on flashcards',
            'Give me a motivational quote',
            'Log today\'s workout',
            'Teach me a Sinhala word',
            'Show me around the app'
          ]
        }
      ],
      addChatMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: Date.now()
        };
        set((state) => ({ chatMessages: [...state.chatMessages, newMsg] }));
      },
      clearChatMessages: () => set({ chatMessages: [] }),

      targetSteps: 8000,
      setTargetSteps: (steps) => set({ targetSteps: steps }),
      targetCalories: 500,
      setTargetCalories: (kcal) => set({ targetCalories: kcal }),
      targetWorkoutMinutes: 30,
      setTargetWorkoutMinutes: (mins) => set({ targetWorkoutMinutes: mins }),
      units: 'metric',
      setUnits: (units) => set({ units }),

      nativeLanguage: 'en',
      setNativeLanguage: (lang) => set({ nativeLanguage: lang }),
      targetLanguage: 'si',
      setTargetLanguage: (lang) => set({ targetLanguage: lang }),

      hasCompletedTour: false,
      setHasCompletedTour: (val) => set({ hasCompletedTour: val }),
      isTourActive: false,
      setIsTourActive: (val) => set({ isTourActive: val })
    }),
    {
      name: 'sandu_hub_settings',
      partialize: (state) => ({
        themeMode: state.themeMode,
        accentColor: state.accentColor,
        fontSize: state.fontSize,
        fontStyle: state.fontStyle,
        cardStyle: state.cardStyle,
        backgroundEffect: state.backgroundEffect,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        dyslexiaFont: state.dyslexiaFont,
        userName: state.userName,
        userNickname: state.userNickname,
        streak: state.streak,
        xp: state.xp,
        level: state.level,
        voiceEnabled: state.voiceEnabled,
        speechRate: state.speechRate,
        speechPitch: state.speechPitch,
        chatTone: state.chatTone,
        sanduOutfitColor: state.sanduOutfitColor,
        targetSteps: state.targetSteps,
        targetCalories: state.targetCalories,
        targetWorkoutMinutes: state.targetWorkoutMinutes,
        units: state.units,
        nativeLanguage: state.nativeLanguage,
        targetLanguage: state.targetLanguage,
        hasCompletedTour: state.hasCompletedTour
      })
    }
  )
);
