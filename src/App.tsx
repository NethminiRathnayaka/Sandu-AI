import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from './store/useAppStore';
import { Layout } from './app/Layout';
import { HomeScreen } from './features/home/HomeScreen';
import { FlashcardsScreen } from './features/flashcards/FlashcardsScreen';
import { QuotesScreen } from './features/quotes/QuotesScreen';
import { FitnessScreen } from './features/fitness/FitnessScreen';
import { LanguageScreen } from './features/language/LanguageScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { HelpScreen } from './features/help/HelpScreen';
import { ChatDrawer } from './components/sandu/ChatDrawer';
import { FloatingSandu } from './components/sandu/FloatingSandu';
import { OnboardingTour } from './components/ui/OnboardingTour';
import { BackgroundEffect } from './components/ui/BackgroundEffect';
import { seedInitialDataIfNeeded } from './db';

export const App: React.FC = () => {
  const { i18n } = useTranslation();
  const {
    activeTab,
    themeMode,
    accentColor,
    sanduExpression,
    setSanduExpression
  } = useAppStore();

  // Seed DB on mount
  useEffect(() => {
    seedInitialDataIfNeeded();
  }, []);

  // Sync theme to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      themeMode === 'dark' ||
      (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set dynamic CSS variable for accent color
    root.style.setProperty('--color-accent-500', accentColor);
    root.style.setProperty('--color-accent-600', accentColor);
    root.style.setProperty('--color-accent-glow', `${accentColor}40`);
  }, [themeMode, accentColor]);

  // Night-time idle expression check: if late night idle, set sleepy
  useEffect(() => {
    const hour = new Date().getHours();
    if ((hour >= 23 || hour < 5) && sanduExpression === 'idle') {
      setSanduExpression('sleepy');
    }
  }, [sanduExpression]);

  // Render active feature screen
  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'flashcards':
        return <FlashcardsScreen />;
      case 'quotes':
        return <QuotesScreen />;
      case 'fitness':
        return <FitnessScreen />;
      case 'language':
        return <LanguageScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'help':
        return <HelpScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <>
      <BackgroundEffect />
      <Layout>
        {renderScreen()}
      </Layout>
      <FloatingSandu />
      <ChatDrawer />
      <OnboardingTour />
    </>
  );
};

export default App;
