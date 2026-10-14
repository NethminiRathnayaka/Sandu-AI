import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  BookOpen,
  CheckCircle,
  XCircle,
  Check,
  Undo
} from 'lucide-react';
import { db, FlashcardRecord } from '../../db';
import { useAppStore } from '../../store/useAppStore';
import { calculateSM2, mapQuizGradeToSM2Quality } from '../../ai/sm2';
import seedFlashcards from '../../data/seedFlashcards.json';

export const FlashcardsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { setSanduExpression, addXP } = useAppStore();

  const [cards, setCards] = useState<FlashcardRecord[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [mode, setMode] = useState<'browse' | 'quiz'>('browse');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardRecord | null>(null);
  const [formDeck, setFormDeck] = useState('General');
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formTags, setFormTags] = useState('');

  // Undo delete toast state
  const [recentlyDeleted, setRecentlyDeleted] = useState<FlashcardRecord | null>(null);

  // Load cards from DB
  const loadCards = async () => {
    const all = await db.flashcards.toArray();
    if (all.length === 0) {
      await db.flashcards.bulkAdd(seedFlashcards as FlashcardRecord[]);
      setCards(seedFlashcards as FlashcardRecord[]);
    } else {
      setCards(all);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // Filter cards by selected deck
  const filteredCards = selectedDeck === 'all'
    ? cards
    : cards.filter((c) => c.deck === selectedDeck);

  // Available unique decks
  const decks = Array.from(new Set(cards.map((c) => c.deck || 'General')));

  // Reset index when deck or mode changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedDeck, mode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpen) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards.length, isModalOpen]);

  const currentCard = filteredCards[currentIndex];

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setSanduExpression('happy');
  };

  // SM-2 Self Grading in Quiz Mode
  const handleGrade = async (grade: 'gotIt' | 'notYet' | 'hard' | 'easy') => {
    if (!currentCard) return;

    const quality = mapQuizGradeToSM2Quality(grade);
    const result = calculateSM2({
      quality,
      repetition: currentCard.repetition || 0,
      previousInterval: currentCard.interval || 1,
      previousEaseFactor: currentCard.easeFactor || 2.5
    });

    const updated: FlashcardRecord = {
      ...currentCard,
      repetition: result.repetition,
      interval: result.interval,
      easeFactor: result.easeFactor,
      nextReview: result.nextReviewDate,
      lastReviewed: Date.now()
    };

    await db.flashcards.put(updated);
    addXP(grade === 'gotIt' || grade === 'easy' ? 15 : 5);

    // Update in-memory cards
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));

    if (grade === 'gotIt' || grade === 'easy') {
      setSanduExpression('celebrating');
      if (currentIndex === filteredCards.length - 1) {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
      }
    } else {
      setSanduExpression('encouraging');
    }

    handleNext();
  };

  // Open modal for Create / Edit
  const openModal = (card?: FlashcardRecord) => {
    if (card) {
      setEditingCard(card);
      setFormDeck(card.deck || 'General');
      setFormQuestion(card.question);
      setFormAnswer(card.answer);
      setFormTags(card.tags?.join(', ') || '');
    } else {
      setEditingCard(null);
      setFormDeck(selectedDeck !== 'all' ? selectedDeck : 'General');
      setFormQuestion('');
      setFormAnswer('');
      setFormTags('');
    }
    setIsModalOpen(true);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) return;

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingCard) {
      const updated: FlashcardRecord = {
        ...editingCard,
        deck: formDeck.trim() || 'General',
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        tags: tagsArray
      };
      await db.flashcards.put(updated);
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const newCard: FlashcardRecord = {
        id: `fc-${Date.now()}`,
        deck: formDeck.trim() || 'General',
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        tags: tagsArray,
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReview: Date.now(),
        createdAt: Date.now()
      };
      await db.flashcards.add(newCard);
      setCards((prev) => [...prev, newCard]);
      addXP(20);
    }

    setIsModalOpen(false);
    setSanduExpression('happy');
  };

  const handleDeleteCard = async (cardId: string) => {
    const cardToDelete = cards.find((c) => c.id === cardId);
    if (!cardToDelete) return;

    if (!window.confirm(t('common.confirmDelete'))) return;

    await db.flashcards.delete(cardId);
    setRecentlyDeleted(cardToDelete);
    setCards((prev) => prev.filter((c) => c.id !== cardId));

    if (currentIndex >= filteredCards.length - 1 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    // Auto-dismiss undo toast after 6 seconds
    setTimeout(() => {
      setRecentlyDeleted(null);
    }, 6000);
  };

  const handleUndoDelete = async () => {
    if (!recentlyDeleted) return;
    await db.flashcards.add(recentlyDeleted);
    setCards((prev) => [...prev, recentlyDeleted]);
    setRecentlyDeleted(null);
  };

  // Compute stats
  const cardsMastered = cards.filter((c) => (c.repetition || 0) >= 3).length;
  const accuracy =
    cards.length > 0 ? Math.round((cardsMastered / cards.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent-500" />
            <span>{t('flashcards.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('flashcards.subtitle')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Browse / Quiz Mode Toggle */}
          <div className="flex p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl">
            <button
              onClick={() => setMode('browse')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'browse'
                  ? 'bg-white dark:bg-slate-900 text-accent-600 dark:text-accent-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('flashcards.browseMode')}
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'quiz'
                  ? 'bg-white dark:bg-slate-900 text-accent-600 dark:text-accent-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('flashcards.quizMode')}
            </button>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('flashcards.newCard')}</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 text-center">
        <div>
          <div className="text-xs text-slate-400 font-semibold">{t('flashcards.totalCards')}</div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{cards.length}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-semibold">{t('flashcards.cardsMastered')}</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">{cardsMastered}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-semibold">{t('flashcards.accuracy')}</div>
          <div className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400">{accuracy}%</div>
        </div>
      </div>

      {/* Deck Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedDeck('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            selectedDeck === 'all'
              ? 'bg-accent-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {t('flashcards.allDecks')} ({cards.length})
        </button>
        {decks.map((deck) => {
          const count = cards.filter((c) => c.deck === deck).length;
          return (
            <button
              key={deck}
              onClick={() => setSelectedDeck(deck)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedDeck === deck
                  ? 'bg-accent-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {deck} ({count})
            </button>
          );
        })}
      </div>

      {/* Main Flashcard Card Container */}
      {filteredCards.length > 0 && currentCard ? (
        <div className="space-y-4">
          {/* Card Top Info */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold text-accent-600 dark:text-accent-400 uppercase tracking-wider">
              {currentCard.deck || 'General'}
            </span>
            <span>
              {currentIndex + 1} / {filteredCards.length}
            </span>
          </div>

          {/* 3D Flip Card View */}
          <div
            className="w-full h-80 sm:h-96 [perspective:1000px] cursor-pointer"
            onClick={() => setIsFlipped((prev) => !prev)}
          >
            <motion.div
              className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-500 rounded-3xl shadow-xl"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
              {/* Front Side: Question */}
              <div className="absolute inset-0 [backface-visibility:hidden] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t('flashcards.question')}
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openModal(currentCard)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit card"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(currentCard.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="my-auto text-center px-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.question}
                  </h3>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {currentCard.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-semibold text-accent-500">
                    {t('flashcards.flipToAnswer')} ↻
                  </span>
                </div>
              </div>

              {/* Back Side: Answer */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950 border-2 border-indigo-200 dark:border-indigo-900/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    {t('flashcards.answer')}
                  </span>
                  <span className="text-xs text-slate-400">
                    EF: {currentCard.easeFactor?.toFixed(1) || '2.5'} • Reps: {currentCard.repetition || 0}
                  </span>
                </div>

                <div className="my-auto text-center px-4">
                  <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                    {currentCard.answer}
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <span className="text-xs font-semibold text-slate-400">
                    {t('flashcards.flipToQuestion')} ↺
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mode Controls: Browse vs Quiz Mode */}
          {mode === 'browse' ? (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('common.previous')}</span>
              </button>

              <button
                onClick={handleShuffle}
                className="p-2.5 text-slate-500 hover:text-accent-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition shadow-2xs"
                title="Shuffle cards"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition shadow-2xs"
              >
                <span>{t('common.next')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Quiz Mode: SM-2 Self Grading Buttons */
            <div className="space-y-2 pt-2">
              <div className="text-center text-xs font-semibold text-slate-400">
                {t('flashcards.sm2Grade')}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleGrade('notYet')}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-bold hover:bg-rose-100 transition shadow-2xs"
                >
                  {t('flashcards.notYet')}
                </button>
                <button
                  onClick={() => handleGrade('hard')}
                  className="py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-bold hover:bg-amber-100 transition shadow-2xs"
                >
                  {t('flashcards.hard')}
                </button>
                <button
                  onClick={() => handleGrade('gotIt')}
                  className="py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-bold hover:bg-indigo-100 transition shadow-2xs"
                >
                  {t('flashcards.good')}
                </button>
                <button
                  onClick={() => handleGrade('easy')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold hover:bg-emerald-100 transition shadow-2xs"
                >
                  {t('flashcards.easy')}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <p className="text-slate-500 dark:text-slate-400 text-base">
            {t('flashcards.noCards')}
          </p>
          <button
            onClick={() => loadCards()}
            className="px-4 py-2 bg-accent-600 text-white rounded-xl text-sm font-semibold shadow-md"
          >
            {t('flashcards.seedCardsBtn')}
          </button>
        </div>
      )}

      {/* Undo Delete Toast */}
      {recentlyDeleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm"
        >
          <span>{t('flashcards.cardDeleted')}</span>
          <button
            onClick={handleUndoDelete}
            className="text-amber-400 font-bold flex items-center gap-1 hover:underline"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>{t('common.undo')}</span>
          </button>
        </motion.div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                {editingCard ? t('common.edit') : t('flashcards.newCard')}
              </h3>

              <form onSubmit={handleSaveCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t('flashcards.deck')}
                  </label>
                  <input
                    type="text"
                    value={formDeck}
                    onChange={(e) => setFormDeck(e.target.value)}
                    required
                    placeholder="e.g. Science, Biology"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t('flashcards.question')}
                  </label>
                  <textarea
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    required
                    rows={3}
                    placeholder="Write the front question..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t('flashcards.answer')}
                  </label>
                  <textarea
                    value={formAnswer}
                    onChange={(e) => setFormAnswer(e.target.value)}
                    required
                    rows={3}
                    placeholder="Write the answer on the back..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t('flashcards.tags')}
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="tag1, tag2"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-accent-600 hover:bg-accent-700 text-white rounded-xl shadow-md transition"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
