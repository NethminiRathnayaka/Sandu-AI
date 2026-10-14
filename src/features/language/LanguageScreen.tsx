import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  Languages,
  Volume2,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { speakText } from '../../utils/speech';
import vocabPacks from '../../data/vocabPacks.json';

export const LanguageScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    nativeLanguage,
    setNativeLanguage,
    targetLanguage,
    setTargetLanguage,
    setSanduExpression,
    addXP,
    speechRate,
    speechPitch
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'lessons' | 'quiz' | 'match'>('lessons');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillBlankInput, setFillBlankInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [weakWords, setWeakWords] = useState<any[]>([]);

  // Matching game state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  const categories = [
    'all',
    'Vocabulary',
    'Phrases',
    'Sentences',
    'Grammar',
    'Numbers',
    'Daily Conversation'
  ];

  const filteredItems = selectedCategory === 'all'
    ? vocabPacks
    : vocabPacks.filter((item) => item.category === selectedCategory);

  // Text retrieval by language
  const getItemText = (item: any, lang: 'en' | 'si' | 'ta') => {
    if (lang === 'si') return item.sinhala;
    if (lang === 'ta') return item.tamil;
    return item.english;
  };

  const getItemRomanized = (item: any, lang: 'en' | 'si' | 'ta') => {
    if (lang === 'si') return item.sinhalaRomanized;
    if (lang === 'ta') return item.tamilRomanized;
    return '';
  };

  const getItemExample = (item: any, lang: 'en' | 'si' | 'ta') => {
    if (lang === 'si') return item.exampleSi;
    if (lang === 'ta') return item.exampleTa;
    return item.exampleEn;
  };

  const getLangCode = (lang: 'en' | 'si' | 'ta') => {
    if (lang === 'si') return 'si-LK';
    if (lang === 'ta') return 'ta-IN';
    return 'en-US';
  };

  // Pronunciation handler
  const handlePronounce = (text: string, lang: 'en' | 'si' | 'ta', id: string) => {
    setPlayingVoiceId(id);
    setSanduExpression('talking');

    speakText({
      text,
      lang: getLangCode(lang),
      rate: speechRate,
      pitch: speechPitch,
      onEnd: () => {
        setPlayingVoiceId(null);
        setSanduExpression('happy');
      },
      onError: () => {
        setPlayingVoiceId(null);
        setSanduExpression('idle');
      }
    });
  };

  // Quiz items (take 6 from current selection)
  const quizItems = filteredItems.slice(0, 6);
  const currentQuizItem = quizItems[quizIndex];

  // Multiple choice options generation
  const options = React.useMemo(() => {
    if (!currentQuizItem) return [];
    const correct = getItemText(currentQuizItem, targetLanguage);
    const distractors = vocabPacks
      .filter((i) => i.id !== currentQuizItem.id)
      .map((i) => getItemText(i, targetLanguage))
      .slice(0, 3);

    return [...distractors, correct].sort(() => Math.random() - 0.5);
  }, [currentQuizItem, targetLanguage]);

  const handleSelectQuizOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opt);
    setIsAnswerChecked(true);

    const correct = getItemText(currentQuizItem, targetLanguage);
    if (opt.toLowerCase().trim() === correct.toLowerCase().trim()) {
      setQuizScore((prev) => prev + 1);
      setSanduExpression('celebrating');
    } else {
      setWeakWords((prev) => [...prev, currentQuizItem]);
      setSanduExpression('encouraging');
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    setFillBlankInput('');
    setIsAnswerChecked(false);

    if (quizIndex < quizItems.length - 1) {
      setQuizIndex((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
      const earnedXP = quizScore * 20 + 20;
      addXP(earnedXP);
      if (quizScore >= quizItems.length - 1) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        setSanduExpression('celebrating');
      }
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setWeakWords([]);
  };

  // Match pairs items (5 items)
  const matchItems = React.useMemo(() => {
    return filteredItems.slice(0, 5);
  }, [filteredItems]);

  const handleMatchSelect = (id: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setSelectedLeft(id);
    } else if (side === 'right' && selectedLeft) {
      if (selectedLeft === id) {
        // Matched!
        setMatchedPairs((prev) => [...prev, id]);
        setSelectedLeft(null);
        addXP(15);
        setSanduExpression('celebrating');
      } else {
        setSanduExpression('encouraging');
        setSelectedLeft(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Languages className="w-6 h-6 text-accent-500" />
            <span>{t('language.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('language.subtitle')}
          </p>
        </div>

        {/* Language Pair Selectors */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">{t('language.iSpeak')}:</span>
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          <span className="text-slate-300 dark:text-slate-700">→</span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-accent-500 font-semibold">{t('language.iAmLearning')}:</span>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as any)}
              className="bg-accent-50 dark:bg-accent-950 text-xs font-semibold px-2 py-1 rounded-lg border border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-300"
            >
              <option value="si">සිංහල (Sinhala)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs: Lessons, Quiz, Match Pairs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
            activeTab === 'lessons'
              ? 'bg-accent-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('language.dailyLesson')}
        </button>
        <button
          onClick={() => {
            setActiveTab('quiz');
            restartQuiz();
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
            activeTab === 'quiz'
              ? 'bg-accent-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('language.quizPractice')}
        </button>
        <button
          onClick={() => {
            setActiveTab('match');
            setMatchedPairs([]);
          }}
          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
            activeTab === 'match'
              ? 'bg-accent-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t('language.quizTypes.matchPairs')}
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t(`language.categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* VIEW A: Daily Lessons & Vocabulary Cards */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const nativeText = getItemText(item, nativeLanguage);
            const targetText = getItemText(item, targetLanguage);
            const romanized = getItemRomanized(item, targetLanguage);
            const exampleTarget = getItemExample(item, targetLanguage);
            const exampleNative = getItemExample(item, nativeLanguage);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:shadow-md transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-500 bg-accent-50 dark:bg-accent-950/60 px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      {targetText}
                    </h3>
                    {romanized && (
                      <p className="text-xs text-slate-400 italic">
                        ({romanized})
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handlePronounce(targetText, targetLanguage, item.id)}
                    className={`p-2.5 rounded-xl border transition ${
                      playingVoiceId === item.id
                        ? 'bg-accent-500 text-white animate-pulse'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-accent-600 border-slate-200 dark:border-slate-700'
                    }`}
                    title={t('language.pronounce')}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {nativeText}
                </div>

                {exampleTarget && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs space-y-0.5">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      "{exampleTarget}"
                    </div>
                    {exampleNative && (
                      <div className="text-slate-400 italic">
                        "{exampleNative}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW B: Interactive Practice Quiz */}
      {activeTab === 'quiz' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto">
          {!quizCompleted && currentQuizItem ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>
                  Question {quizIndex + 1} of {quizItems.length}
                </span>
                <span>Score: {quizScore}</span>
              </div>

              {/* Question */}
              <div className="text-center py-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  What is the {targetLanguage.toUpperCase()} translation for:
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {getItemText(currentQuizItem, nativeLanguage)}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt, i) => {
                  const correct = getItemText(currentQuizItem, targetLanguage);
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt === correct;

                  let btnStyle = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100';
                  if (isAnswerChecked) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswerChecked}
                      onClick={() => handleSelectQuizOption(opt)}
                      className={`p-4 rounded-2xl border text-sm font-semibold transition text-center shadow-2xs ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Next Question Button */}
              {isAnswerChecked && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuizQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-bold shadow-md transition"
                  >
                    <span>{quizIndex === quizItems.length - 1 ? t('common.done') : t('common.next')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed Result Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {t('language.quizScore')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t('language.quizSummary', {
                  score: quizScore,
                  total: quizItems.length,
                  xp: quizScore * 20 + 20
                })}
              </p>

              {weakWords.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-left max-w-sm mx-auto text-xs space-y-1.5">
                  <div className="font-bold text-slate-500 uppercase">
                    {t('language.weakWords')}:
                  </div>
                  {weakWords.map((w, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>{getItemText(w, nativeLanguage)}</span>
                      <span className="font-bold text-accent-500">{getItemText(w, targetLanguage)}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={restartQuiz}
                className="px-6 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-sm font-bold shadow-md transition"
              >
                {t('language.tryAgain')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW C: Match Pairs Game */}
      {activeTab === 'match' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('language.quizTypes.matchPairs')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a word on the left, then tap its matching translation on the right!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left Column (Native Language) */}
            <div className="space-y-2.5">
              {matchItems.map((item) => {
                const isMatched = matchedPairs.includes(item.id);
                const isSelected = selectedLeft === item.id;

                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchSelect(item.id, 'left')}
                    className={`w-full p-3.5 rounded-2xl border text-sm font-semibold transition text-left ${
                      isMatched
                        ? 'opacity-30 bg-emerald-50 text-emerald-600 border-emerald-300'
                        : isSelected
                        ? 'bg-accent-100 dark:bg-accent-950 border-accent-500 text-accent-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100'
                    }`}
                  >
                    {getItemText(item, nativeLanguage)}
                  </button>
                );
              })}
            </div>

            {/* Right Column (Target Language) */}
            <div className="space-y-2.5">
              {matchItems.map((item) => {
                const isMatched = matchedPairs.includes(item.id);

                return (
                  <button
                    key={item.id}
                    disabled={isMatched}
                    onClick={() => handleMatchSelect(item.id, 'right')}
                    className={`w-full p-3.5 rounded-2xl border text-sm font-semibold transition text-left ${
                      isMatched
                        ? 'opacity-30 bg-emerald-50 text-emerald-600 border-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:bg-slate-100'
                    }`}
                  >
                    {getItemText(item, targetLanguage)}
                  </button>
                );
              })}
            </div>
          </div>

          {matchedPairs.length === matchItems.length && (
            <div className="text-center pt-2">
              <span className="text-sm font-bold text-emerald-500">
                All pairs matched! +75 XP earned! 🌟
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
