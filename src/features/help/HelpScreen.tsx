import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle,
  Search,
  Sparkles,
  Keyboard,
  Shield,
  Info,
  ChevronDown,
  MessageCircle,
  Play
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const HelpScreen: React.FC = () => {
  const { t } = useTranslation();
  const { setIsTourActive, setChatDrawerOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'What is the SM-2 algorithm used in Flashcards?',
      a: 'The SuperMemo 2 (SM-2) algorithm calculates the optimal review interval for each card based on your recall quality (from 0 to 5). Cards that are difficult are reviewed sooner, while well-memorized cards are scheduled days or weeks out, locking knowledge firmly into long-term memory.'
    },
    {
      q: 'How does the fitness calorie auto-estimator work?',
      a: 'When you log a workout without entering calories, SANDU applies the standard MET (Metabolic Equivalent of Task) formula: Calories = MET × Weight (kg) × (Duration in Minutes / 60). Different exercises have specific MET factors (e.g., Running: 8.3, Cycling: 6.8, Walking: 3.5).'
    },
    {
      q: 'Does SANDU work completely offline?',
      a: 'Yes! All flashcards, quotes, fitness logs, language lessons, and AI intent classification are processed directly in your browser using IndexedDB. You can install SANDU Hub as a Progressive Web App (PWA) and use it anywhere without an internet connection.'
    },
    {
      q: 'How can I command SANDU through the chat drawer?',
      a: 'You can type natural instructions like "add a flashcard: capital of Japan = Tokyo", "log 30 min running 300 kcal", "switch to dark mode", "change language to Sinhala", or "give me a quote". SANDU detects your intent and executes the corresponding action.'
    },
    {
      q: 'How do I pronounce vocabulary words in Sinhala and Tamil?',
      a: 'In the Language Learning Hub, each card has a speaker button that uses the Web Speech API with regional voice codes (si-LK for Sinhala, ta-IN for Tamil, en-US for English). Transliterated romanized phonetic guides are also provided.'
    },
    {
      q: 'Where is my data stored and is it private?',
      a: 'Your data stays 100% on your device in your browser’s IndexedDB storage. Nothing is sent to third-party tracking servers. You can export a full JSON backup anytime from Settings.'
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const shortcuts = [
    { key: '→ / Right Arrow', action: 'Next flashcard in Browse or Quiz mode' },
    { key: '← / Left Arrow', action: 'Previous flashcard' },
    { key: 'Space / Enter', action: 'Flip flashcard between Question and Answer' },
    { key: 'Esc', action: 'Close dialogs and chat drawer' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-accent-500" />
            <span>{t('help.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('help.subtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTourActive(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t('help.startTour')}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search FAQs, features, and guides..."
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          {t('help.faqs')}
        </h3>

        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;

            return (
              <div
                key={idx}
                className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180 text-accent-500' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-400 text-sm">
            No matching questions found. Try searching for "flashcards", "calories", or "offline".
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts List */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-accent-500" />
          <span>{t('help.keyboardShortcuts')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between text-xs"
            >
              <span className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300">
                {sc.key}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-right ml-2">
                {sc.action}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & About Note */}
      <div className="bg-accent-50/60 dark:bg-accent-950/30 p-5 rounded-2xl border border-accent-200/80 dark:border-accent-800/80 flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Privacy Guarantee:</strong> {t('help.privacy')}
        </div>
      </div>
    </div>
  );
};
