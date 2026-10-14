import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SanduAvatar } from '../sandu/SanduAvatar';

export const OnboardingTour: React.FC = () => {
  const { t } = useTranslation();
  const {
    isTourActive,
    setIsTourActive,
    setHasCompletedTour,
    setActiveTab,
    sanduOutfitColor,
    userName
  } = useAppStore();

  const [currentStep, setCurrentStep] = useState(0);

  if (!isTourActive) return null;

  const steps = [
    {
      title: `Konnichiwa, ${userName}! 🌸`,
      description:
        "Welcome to SANDU Hub! I am SANDU, your personal anime companion for learning, wellness, and everyday motivation. Let me show you around our magical hub!",
      expression: 'happy' as const,
      tab: 'home'
    },
    {
      title: 'Flashcards & SM-2 Spaced Repetition 📚',
      description:
        'Supercharge your memory! Create decks, flip cards in 3D, and grade your recall. Our SM-2 spaced repetition algorithm schedules cards right when your brain needs them most.',
      expression: 'thinking' as const,
      tab: 'flashcards'
    },
    {
      title: 'Random Quotes & Mindfulness 💬',
      description:
        'Start every day inspired with over 60 curated quotes across study, fitness, and calm. I can read quotes aloud and provide reflections to brighten your day.',
      expression: 'happy' as const,
      tab: 'quotes'
    },
    {
      title: 'Fitness Tracking & ML Trend Forecast 🏃‍♀️',
      description:
        'Log workouts, steps, and water. Watch your weekly progress rings fill up, and check out our on-device linear regression ML model that forecasts your next 7 days of activity!',
      expression: 'celebrating' as const,
      tab: 'fitness'
    },
    {
      title: 'Language Learning Hub 🌏',
      description:
        'Master English, Sinhala (සිංහල), and Tamil (தமிழ்) with native pronunciation audio, romanized guides, and interactive quizzes (MCQ, fill-in-the-blank, match pairs)!',
      expression: 'thinking' as const,
      tab: 'language'
    },
    {
      title: 'Chat With Me Anytime! ✨',
      description:
        'Tap my floating avatar or the chat button to ask questions, practice flashcards, or command me like "log 30 min running" or "switch to dark mode". We are going to achieve great things together!',
      expression: 'celebrating' as const,
      tab: 'home'
    }
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setActiveTab(steps[next].tab);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setActiveTab(steps[prev].tab);
    }
  };

  const handleComplete = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    setActiveTab('home');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl overflow-hidden"
        >
          {/* Top Decorative Banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-accent-500 via-pink-500 to-indigo-500" />

          {/* Close / Skip button */}
          <button
            onClick={handleComplete}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Skip Tour"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Character & Speech Container */}
          <div className="flex flex-col items-center text-center mt-2">
            <div className="relative mb-3">
              <SanduAvatar
                size="lg"
                expression={step.expression}
                outfitColor={sanduOutfitColor}
              />
            </div>

            {/* Step Counter Pills */}
            <div className="flex items-center gap-1.5 mb-4">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-6 bg-accent-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {step.title}
            </h3>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between w-full pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.previous')}</span>
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-accent-500/25 transition"
              >
                <span>{currentStep === steps.length - 1 ? t('common.done') : t('common.next')}</span>
                {currentStep === steps.length - 1 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
