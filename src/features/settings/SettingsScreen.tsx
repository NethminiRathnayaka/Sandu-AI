import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  User,
  Palette,
  Volume2,
  Globe,
  Sliders,
  Database,
  Eye,
  Check,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  Cloud
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../db';

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    userName,
    setUserName,
    userNickname,
    setUserNickname,
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    fontSize,
    setFontSize,
    fontStyle,
    setFontStyle,
    cardStyle,
    setCardStyle,
    backgroundEffect,
    setBackgroundEffect,
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    dyslexiaFont,
    setDyslexiaFont,
    voiceEnabled,
    setVoiceEnabled,
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    chatTone,
    setChatTone,
    sanduOutfitColor,
    setSanduOutfitColor,
    targetSteps,
    setTargetSteps,
    targetCalories,
    setTargetCalories,
    units,
    setUnits
  } = useAppStore();

  const [customHex, setCustomHex] = useState(accentColor);
  const [resetSuccess, setResetSuccess] = useState(false);

  const accentPresets = [
    { label: 'Indigo', hex: '#6366f1' },
    { label: 'Violet', hex: '#8b5cf6' },
    { label: 'Pink', hex: '#ec4899' },
    { label: 'Rose', hex: '#f43f5e' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Teal', hex: '#14b8a6' },
    { label: 'Amber', hex: '#f59e0b' },
    { label: 'Cyan', hex: '#06b6d4' }
  ];

  // Export full app database backup
  const handleExportAll = async () => {
    const flashcards = await db.flashcards.toArray();
    const quotes = await db.quotes.toArray();
    const fitnessLogs = await db.fitnessLogs.toArray();

    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      flashcards,
      quotes,
      fitnessLogs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `sandu_hub_full_backup_${Date.now()}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  // Import full app database backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.flashcards) {
          await db.flashcards.clear();
          await db.flashcards.bulkAdd(parsed.flashcards);
        }
        if (parsed.quotes) {
          await db.quotes.clear();
          await db.quotes.bulkAdd(parsed.quotes);
        }
        if (parsed.fitnessLogs) {
          await db.fitnessLogs.clear();
          await db.fitnessLogs.bulkAdd(parsed.fitnessLogs);
        }
        alert('Data imported successfully!');
        window.location.reload();
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Reset all user data
  const handleResetAll = async () => {
    if (!window.confirm('Are you sure you want to reset all data and preferences to defaults? This cannot be undone.')) {
      return;
    }

    await db.flashcards.clear();
    await db.quotes.clear();
    await db.fitnessLogs.clear();
    localStorage.clear();
    setResetSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent-500" />
          <span>{t('settings.title')}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* SECTION 1: Profile & Identity */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-accent-500" />
          <span>{t('settings.profileSection')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.userName')}
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.userNickname')}
            </label>
            <input
              type="text"
              value={userNickname}
              onChange={(e) => setUserNickname(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Appearance & Theme Customisation */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-accent-500" />
          <span>{t('settings.appearanceSection')}</span>
        </h3>

        {/* Theme mode: Light / Dark / System */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            {t('settings.themeMode')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: t('settings.light') },
              { id: 'dark', label: t('settings.dark') },
              { id: 'system', label: t('settings.system') }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setThemeMode(mode.id as any)}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  themeMode === mode.id
                    ? 'bg-accent-600 text-white border-accent-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color: 8 Presets + Custom Hex */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            {t('settings.accentColor')}
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            {accentPresets.map((preset) => {
              const isSelected = accentColor.toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.hex}
                  onClick={() => {
                    setAccentColor(preset.hex);
                    setCustomHex(preset.hex);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform shadow-sm ${
                    isSelected ? 'ring-2 ring-offset-2 ring-accent-500 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.label}
                >
                  {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                </button>
              );
            })}

            {/* Custom Hex input */}
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="color"
                value={customHex}
                onChange={(e) => {
                  setCustomHex(e.target.value);
                  setAccentColor(e.target.value);
                }}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-slate-400">{accentColor}</span>
            </div>
          </div>
        </div>

        {/* Font Family & Size */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.fontStyle')}
            </label>
            <select
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="sans">Clean Sans (Inter / Noto)</option>
              <option value="rounded">Friendly Rounded (Quicksand)</option>
              <option value="serif">Elegant Serif (Merriweather)</option>
              <option value="mono">Tech Monospace (Fira Code)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.fontSize')}
            </label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="small">{t('settings.small')}</option>
              <option value="medium">{t('settings.medium')}</option>
              <option value="large">{t('settings.large')}</option>
            </select>
          </div>
        </div>

        {/* Card Style & Background Effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.cardStyle')}
            </label>
            <select
              value={cardStyle}
              onChange={(e) => setCardStyle(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="rounded">{t('settings.rounded')}</option>
              <option value="sharp">{t('settings.sharp')}</option>
              <option value="glass">{t('settings.glass')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.backgroundEffect')}
            </label>
            <select
              value={backgroundEffect}
              onChange={(e) => setBackgroundEffect(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="sakura">{t('settings.bgSakura')}</option>
              <option value="particles">{t('settings.bgParticles')}</option>
              <option value="gradient">{t('settings.bgGradient')}</option>
              <option value="none">{t('settings.bgNone')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: SANDU AI Companion Persona */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-500" />
          <span>{t('settings.sanduSection')}</span>
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-semibold text-sm text-slate-900 dark:text-white">
              {t('settings.voiceEnabled')}
            </div>
            <div className="text-xs text-slate-400">
              SANDU speaks aloud responses and pronunciations
            </div>
          </div>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
            className="w-5 h-5 accent-accent-600 rounded cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.sanduTone')}
            </label>
            <select
              value={chatTone}
              onChange={(e) => setChatTone(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="cute">{t('settings.toneCute')}</option>
              <option value="calm">{t('settings.toneCalm')}</option>
              <option value="energetic">{t('settings.toneEnergetic')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              {t('settings.sanduOutfit')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={sanduOutfitColor}
                onChange={(e) => setSanduOutfitColor(e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-slate-400">{sanduOutfitColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Language & Internationalisation */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-accent-500" />
          <span>{t('settings.languageSection')}</span>
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { code: 'en', label: 'English' },
            { code: 'si', label: 'සිංහල (Sinhala)' },
            { code: 'ta', label: 'தமிழ் (Tamil)' }
          ].map((item) => {
            const isSelected = i18n.language?.startsWith(item.code);
            return (
              <button
                key={item.code}
                onClick={() => i18n.changeLanguage(item.code)}
                className={`py-3 px-2 text-xs font-bold rounded-xl border text-center transition ${
                  isSelected
                    ? 'bg-accent-600 text-white border-accent-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: Accessibility & Fitness Goals */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent-500" />
          <span>{t('settings.accessibilitySection')}</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('settings.reducedMotion')}
            </span>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-5 h-5 accent-accent-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('settings.highContrast')}
            </span>
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-5 h-5 accent-accent-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('settings.dyslexiaFont')}
            </span>
            <input
              type="checkbox"
              checked={dyslexiaFont}
              onChange={(e) => setDyslexiaFont(e.target.checked)}
              className="w-5 h-5 accent-accent-600 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 6: Data Management & Backup */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-accent-500" />
          <span>{t('settings.dataSection')}</span>
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            <span>{t('settings.exportAll')}</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{t('settings.importAll')}</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>

          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs sm:text-sm font-semibold rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('settings.resetAll')}</span>
          </button>
        </div>

        {/* Cloud Sync info */}
        <div className="p-3.5 bg-accent-50 dark:bg-accent-950/30 rounded-2xl flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <Cloud className="w-5 h-5 text-accent-500 shrink-0" />
          <span>{t('settings.cloudSyncNotice')} (Offline-first IndexedDB is active)</span>
        </div>
      </div>
    </div>
  );
};
