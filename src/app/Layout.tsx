import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  BookOpen,
  Quote,
  Activity,
  Languages,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  MessageCircle,
  Flame,
  Award
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const {
    activeTab,
    setActiveTab,
    themeMode,
    setThemeMode,
    setChatDrawerOpen,
    streak,
    xp,
    level,
    fontSize,
    fontStyle,
    highContrast,
    dyslexiaFont
  } = useAppStore();

  const isDarkMode =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setThemeMode(isDarkMode ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'flashcards', label: t('nav.flashcards'), icon: BookOpen },
    { id: 'quotes', label: t('nav.quotes'), icon: Quote },
    { id: 'fitness', label: t('nav.fitness'), icon: Activity },
    { id: 'language', label: t('nav.language'), icon: Languages },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
    { id: 'help', label: t('nav.help'), icon: HelpCircle },
  ];

  // Font size classes
  const fontSizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }[fontSize];

  // Font family classes
  const fontStyleClass = {
    sans: 'font-sans',
    rounded: 'font-rounded',
    serif: 'font-serif',
    mono: 'font-mono'
  }[fontStyle];

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 ${fontSizeClass} ${fontStyleClass} ${
        highContrast ? 'contrast-125' : ''
      } ${dyslexiaFont ? 'tracking-wider leading-loose' : ''}`}
    >
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 shrink-0 justify-between select-none z-20">
        <div>
          {/* Logo & App Brand */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-accent-500/25">
              <span className="font-extrabold text-lg tracking-wider">S</span>
            </div>
            <div>
              <h1 className="font-extrabold text-lg bg-gradient-to-r from-accent-600 via-indigo-500 to-pink-500 bg-clip-text text-transparent">
                {t('app.name')}
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium transition-all text-sm ${
                    isActive
                      ? 'bg-accent-50 dark:bg-accent-950/50 text-accent-600 dark:text-accent-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar: User XP & Sandu Quick Launch */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Streak & XP pill */}
          <div className="bg-slate-100/80 dark:bg-slate-800/80 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{streak} {t('common.days')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 font-semibold text-xs">
              <Award className="w-4 h-4" />
              <span>{t('common.level')} {level} ({xp} XP)</span>
            </div>
          </div>

          {/* Open Chat Drawer Button */}
          <button
            onClick={() => setChatDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white font-medium text-sm shadow-md shadow-accent-500/20 transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with SANDU</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              S
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-accent-600 to-pink-500 bg-clip-text text-transparent">
              {t('app.name')}
            </span>
          </div>

          {/* Desktop welcome message */}
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t(`nav.${activeTab}`)}
            </h2>
          </div>

          {/* Header Controls: Streak, Language Selector, Theme Toggle, Chat Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>{streak}</span>
            </div>

            {/* Language Switcher Dropdown */}
            <select
              value={i18n.language?.startsWith('si') ? 'si' : i18n.language?.startsWith('ta') ? 'ta' : 'en'}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="en">English (EN)</option>
              <option value="si">සිංහල (SI)</option>
              <option value="ta">தமிழ் (TA)</option>
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Chat Icon Button (Mobile & quick header access) */}
            <button
              onClick={() => setChatDrawerOpen(true)}
              aria-label="Open Chat with SANDU"
              className="p-2 rounded-xl bg-accent-500/10 text-accent-600 dark:text-accent-400 hover:bg-accent-500/20 transition flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">SANDU</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (touch target >= 44px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-1 py-1 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition ${
                isActive
                  ? 'text-accent-600 dark:text-accent-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] mt-0.5 truncate max-w-[56px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
