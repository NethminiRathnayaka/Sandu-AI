import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Quote,
  RefreshCw,
  Heart,
  Copy,
  Share2,
  Volume2,
  Sparkles,
  MessageCircle,
  Check
} from 'lucide-react';
import { db, QuoteRecord } from '../../db';
import { useAppStore } from '../../store/useAppStore';
import { recommendNextQuote } from '../../ai/recommender';
import { speakText } from '../../utils/speech';
import quotesData from '../../data/quotes.json';

export const QuotesScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    sanduExpression,
    setSanduExpression,
    setChatDrawerOpen,
    addChatMessage,
    speechRate,
    speechPitch
  } = useAppStore();

  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Load quotes from IndexedDB
  const loadQuotes = async () => {
    const all = await db.quotes.toArray();
    if (all.length === 0) {
      const initialized = quotesData.map((q) => ({
        ...q,
        isFavorite: 0
      }));
      await db.quotes.bulkAdd(initialized);
      setQuotes(initialized);
      setCurrentQuote(initialized[0]);
    } else {
      setQuotes(all);
      // Guarantee initial random quote on open
      const firstRandom = all[Math.floor(Math.random() * all.length)];
      setCurrentQuote(firstRandom);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  const handleNextQuote = () => {
    if (quotes.length === 0) return;

    let pool = quotes;
    if (showFavoritesOnly) {
      pool = quotes.filter((q) => q.isFavorite === 1);
      if (pool.length === 0) {
        pool = quotes;
        setShowFavoritesOnly(false);
      }
    }

    const next = recommendNextQuote({
      quotes: pool,
      currentQuoteId: currentQuote?.id,
      preferredCategory: selectedCategory
    });

    if (next) {
      setCurrentQuote(next);
      setSanduExpression('happy');
    }
  };

  const toggleFavorite = async () => {
    if (!currentQuote) return;
    const newStatus = currentQuote.isFavorite === 1 ? 0 : 1;
    const updated = { ...currentQuote, isFavorite: newStatus };

    await db.quotes.update(currentQuote.id, { isFavorite: newStatus });
    setCurrentQuote(updated);
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));

    if (newStatus === 1) {
      setSanduExpression('celebrating');
    }
  };

  const handleCopy = () => {
    if (!currentQuote) return;
    navigator.clipboard.writeText(`"${currentQuote.text}" — ${currentQuote.author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!currentQuote) return;
    const text = `"${currentQuote.text}" — ${currentQuote.author} (via SANDU Hub)`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Daily Inspiration', text });
      } catch (e) {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const handleReadAloud = () => {
    if (!currentQuote) return;
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setSanduExpression('idle');
      return;
    }

    setIsSpeaking(true);
    setSanduExpression('talking');

    const textToSpeak = `${currentQuote.text}. By ${currentQuote.author}.`;
    speakText({
      text: textToSpeak,
      lang: 'en-US',
      rate: speechRate,
      pitch: speechPitch,
      onEnd: () => {
        setIsSpeaking(false);
        setSanduExpression('happy');
      },
      onError: () => {
        setIsSpeaking(false);
        setSanduExpression('idle');
      }
    });
  };

  const handleAskSanduExplanation = () => {
    if (!currentQuote) return;
    setSanduExpression('thinking');
    addChatMessage({
      sender: 'user',
      text: `SANDU, could you explain this quote: "${currentQuote.text}" by ${currentQuote.author}?`
    });
    addChatMessage({
      sender: 'sandu',
      text: `${currentQuote.sanduTip} When you reflect on ${currentQuote.author}'s words, remember that taking consistent small steps is where your true greatness begins! ✨`,
      expression: 'happy',
      quickReplies: ['Give me another quote', 'Quiz me on cards', 'Log a workout']
    });
    setChatDrawerOpen(true);
  };

  const categories = ['all', 'motivation', 'study', 'fitness', 'mindfulness'];

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <Quote className="w-6 h-6 text-accent-500" />
            <span>{t('quotes.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('quotes.subtitle')}
          </p>
        </div>

        {/* Favourites Only Filter Toggle */}
        <button
          onClick={() => {
            setShowFavoritesOnly((prev) => !prev);
            handleNextQuote();
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-center sm:self-auto ${
            showFavoritesOnly
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
          <span>{t('quotes.favoritesOnly')}</span>
        </button>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center justify-center sm:justify-start gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              handleNextQuote();
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-accent-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t(`quotes.categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Main Elegant Quote Display Card */}
      {currentQuote && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuote.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-accent-950/20 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-xl backdrop-blur-md overflow-hidden"
          >
            {/* Top Quote Icon Watermark */}
            <Quote className="absolute top-6 right-6 w-24 h-24 text-accent-500/10 pointer-events-none -rotate-12" />

            <div className="relative z-10 space-y-6">
              {/* Category Pill */}
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/60 px-3 py-1 rounded-full">
                {currentQuote.category}
              </span>

              {/* Quote Typography */}
              <blockquote className="text-xl sm:text-3xl font-serif italic text-slate-900 dark:text-slate-100 leading-relaxed sm:leading-loose">
                "{currentQuote.text}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-0.5 bg-accent-500 rounded-full" />
                <span className="text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-300">
                  {currentQuote.author}
                </span>
              </div>

              {/* SANDU's Personal Companion Reflection */}
              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-accent-50/50 dark:bg-accent-950/30 -mx-8 -mb-12 p-6 sm:p-8 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-accent-700 dark:text-accent-300 uppercase tracking-wider">
                    {t('quotes.sanduSays')}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {currentQuote.sanduTip}
                  </p>
                  <button
                    onClick={handleAskSanduExplanation}
                    className="mt-2 text-xs font-semibold text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('quotes.askExplanation')}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Quote Control Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Left Actions: Fav, Read Aloud, Copy, Share */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleFavorite}
            aria-label="Toggle Favourite"
            className={`p-3 rounded-2xl border transition shadow-2xs ${
              currentQuote?.isFavorite === 1
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-500'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${currentQuote?.isFavorite === 1 ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleReadAloud}
            aria-label="Read Aloud"
            className={`p-3 rounded-2xl border transition shadow-2xs ${
              isSpeaking
                ? 'bg-accent-50 dark:bg-accent-950/40 border-accent-300 text-accent-600 animate-pulse'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-accent-600'
            }`}
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleCopy}
            aria-label="Copy Quote"
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-accent-600 rounded-2xl transition shadow-2xs"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>

          <button
            onClick={handleShare}
            aria-label="Share Quote"
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-accent-600 rounded-2xl transition shadow-2xs"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Right Action: Next Random Quote Button (guaranteed no repeat) */}
        <button
          onClick={handleNextQuote}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-600 to-indigo-600 hover:from-accent-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-accent-500/25 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('quotes.newQuote')}</span>
        </button>
      </div>
    </div>
  );
};
