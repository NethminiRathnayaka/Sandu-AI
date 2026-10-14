import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Quote,
  Activity,
  Languages,
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { SanduAvatar } from '../../components/sandu/SanduAvatar';
import { SpeechBubble } from '../../components/sandu/SpeechBubble';
import { db, FlashcardRecord, FitnessLogRecord } from '../../db';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    userName,
    sanduExpression,
    setSanduExpression,
    sanduOutfitColor,
    setActiveTab,
    setChatDrawerOpen,
    streak,
    xp,
    level,
    targetSteps,
    hasCompletedTour,
    setIsTourActive
  } = useAppStore();

  const [cardsDueCount, setCardsDueCount] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0);
  const [todayQuote, setTodayQuote] = useState({
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    sanduTip: "Even a 5-minute study session is a victory today!"
  });

  // Calculate time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('sandu.greetingMorning', { name: userName });
    if (hour < 17) return t('sandu.greetingAfternoon', { name: userName });
    if (hour < 21) return t('sandu.greetingEvening', { name: userName });
    return t('sandu.greetingNight', { name: userName });
  };

  useEffect(() => {
    // Launch tour on first visit if not yet completed
    if (!hasCompletedTour) {
      setIsTourActive(true);
    }

    // Load home metrics
    const loadData = async () => {
      try {
        const now = Date.now();
        const due = await db.flashcards.where('nextReview').belowOrEqual(now).count();
        setCardsDueCount(due > 0 ? due : 3);

        const todayStr = new Date().toISOString().split('T')[0];
        const log = await db.fitnessLogs.where('date').equals(todayStr).first();
        if (log) {
          setTodaySteps(log.steps || 0);
        }

        const quote = await db.quotes.limit(1).first();
        if (quote) {
          setTodayQuote({
            text: quote.text,
            author: quote.author,
            sanduTip: quote.sanduTip
          });
        }
      } catch (e) {
        // Fallbacks already set
      }
    };

    loadData();
  }, [hasCompletedTour]);

  const quickActionCards = [
    {
      id: 'flashcards',
      title: t('home.startStudy'),
      subtitle: `${cardsDueCount} ${t('home.cardsToReview')}`,
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      badge: 'SM-2 Active'
    },
    {
      id: 'quotes',
      title: t('home.viewQuote'),
      subtitle: 'Daily Motivation & Wisdom',
      icon: Quote,
      color: 'from-amber-500 to-rose-500',
      badge: 'New'
    },
    {
      id: 'fitness',
      title: t('home.logSteps'),
      subtitle: `${todaySteps} / ${targetSteps} Steps`,
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Track'
    },
    {
      id: 'language',
      title: t('home.exploreLanguage'),
      subtitle: 'Sinhala, Tamil, English',
      icon: Languages,
      color: 'from-purple-500 to-pink-600',
      badge: 'Practice'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Hero Section: Large Animated Character + Speech Bubble */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white/90 via-accent-50/40 to-pink-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-accent-950/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: SANDU Large Avatar */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Glow Aura */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-accent-400/25 to-pink-400/25 rounded-full blur-2xl" />

            <SanduAvatar
              size="xl"
              expression={sanduExpression}
              outfitColor={sanduOutfitColor}
              onClick={() => {
                setSanduExpression('celebrating');
                setTimeout(() => setSanduExpression('happy'), 2500);
              }}
              className="z-10 cursor-pointer"
            />

            <span className="text-xs text-slate-400 mt-2 font-medium">
              Tap SANDU to cheer! ✨
            </span>
          </div>

          {/* Right: Companion Greeting & Speech */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-100/80 dark:bg-accent-950/60 text-accent-700 dark:text-accent-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('sandu.name')} • {t('sandu.title')}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {getGreeting()}
            </h2>

            {/* Interactive Typewriter Speech Bubble */}
            <SpeechBubble
              text={todayQuote.sanduTip}
              typewriter={true}
              speed={20}
              className="bg-white/95 dark:bg-slate-800/95"
            />

            {/* Quick Action Chips to Ask SANDU */}
            <div className="pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">
                {t('sandu.askQuestionPrompt')}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  t('sandu.quickReplies.quizMe'),
                  t('sandu.quickReplies.newQuote'),
                  t('sandu.quickReplies.logWorkout'),
                  t('sandu.quickReplies.learnSinhala')
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setChatDrawerOpen(true);
                    }}
                    className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-accent-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-accent-600 border border-slate-200 dark:border-slate-700 rounded-full font-medium shadow-2xs transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Progress & Motivation Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Streak & Consistency */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t('common.streak')}
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {streak} <span className="text-sm font-medium text-slate-500">{t('common.days')}</span>
            </div>
          </div>
        </div>

        {/* Level & XP */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>{t('common.level')} {level}</span>
              <span>{xp % 100} / 100 XP</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-accent-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, xp % 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Today's Fitness Goal */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>{t('fitness.todaySteps')}</span>
              <span>{Math.round((todaySteps / targetSteps) * 100)}%</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {todaySteps} <span className="text-xs font-normal text-slate-500">/ {targetSteps}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Jump In Quick Actions (The 4 Modules) */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{t('home.quickActions')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActionCards.map((card) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(card.id)}
                className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
              >
                {/* Top subtle gradient highlight */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`} />

                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {card.badge}
                  </span>
                </div>

                <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-accent-500 transition">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {card.subtitle}
                </p>

                <div className="mt-4 flex items-center text-xs font-semibold text-accent-600 dark:text-accent-400 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Quote Preview Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-accent-500/20 to-transparent pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-accent-400">
            {t('home.dailyMotivation')}
          </span>
          <blockquote className="text-lg sm:text-xl font-serif italic mt-2 leading-relaxed text-slate-100">
            "{todayQuote.text}"
          </blockquote>
          <p className="text-sm font-semibold text-slate-400 mt-2">
            — {todayQuote.author}
          </p>
        </div>
      </section>
    </div>
  );
};
