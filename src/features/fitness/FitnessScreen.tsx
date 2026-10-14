import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Activity,
  Plus,
  Flame,
  Footprints,
  Droplets,
  Moon,
  Trash2,
  Download,
  Upload,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';
import { db, FitnessLogRecord } from '../../db';
import { useAppStore } from '../../store/useAppStore';
import { estimateCalories } from '../../utils/calories';
import { generateFitnessForecast, TrendAnalysis } from '../../ai/forecast';

export const FitnessScreen: React.FC = () => {
  const { t } = useTranslation();
  const {
    targetSteps,
    targetCalories,
    targetWorkoutMinutes,
    setSanduExpression,
    addXP
  } = useAppStore();

  const [logs, setLogs] = useState<FitnessLogRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [formDate, setFormDate] = useState(todayStr);
  const [formType, setFormType] = useState('running');
  const [formDuration, setFormDuration] = useState('30');
  const [formCalories, setFormCalories] = useState('');
  const [formSteps, setFormSteps] = useState('3000');
  const [formNotes, setFormNotes] = useState('');

  // Load all fitness logs
  const loadFitnessData = async () => {
    const all = await db.fitnessLogs.toArray();
    setLogs(all);

    // Compute 7-day linear regression forecast based on history
    const historyPoints = all.map((l) => ({
      date: l.date,
      steps: l.steps || 0,
      calories: l.calories || 0
    }));

    const analysis = generateFitnessForecast(historyPoints);
    setTrendAnalysis(analysis);
  };

  useEffect(() => {
    loadFitnessData();
  }, []);

  // Today's summary
  const todayLogs = logs.filter((l) => l.date === todayStr);
  const todayTotalSteps = todayLogs.reduce((sum, l) => sum + (l.steps || 0), 0);
  const todayTotalCalories = todayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const todayTotalMinutes = todayLogs.reduce((sum, l) => sum + (l.duration || 0), 0);
  const todayWaterGlasses = todayLogs.reduce((sum, l) => sum + (l.waterGlasses || 0), 0);
  const todaySleep = todayLogs[0]?.sleepHours || 7.5;

  // Add water glass shortcut
  const handleAddWater = async () => {
    const existing = todayLogs[0];
    if (existing) {
      await db.fitnessLogs.update(existing.id, {
        waterGlasses: (existing.waterGlasses || 0) + 1
      });
    } else {
      await db.fitnessLogs.add({
        id: `fit-${Date.now()}`,
        date: todayStr,
        type: 'walking',
        duration: 0,
        calories: 0,
        steps: 0,
        waterGlasses: 1,
        sleepHours: 0,
        createdAt: Date.now()
      });
    }
    loadFitnessData();
    addXP(10);
    setSanduExpression('happy');
  };

  // Submit manual log form
  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(formDuration, 10) || 0;
    
    // Auto estimate calories using MET formula if left empty
    let calories = parseInt(formCalories, 10);
    if (isNaN(calories) || calories <= 0) {
      calories = estimateCalories({ type: formType, durationMinutes: duration });
    }

    const steps = parseInt(formSteps, 10) || 0;

    const newLog: FitnessLogRecord = {
      id: `fit-${Date.now()}`,
      date: formDate,
      type: formType,
      duration,
      calories,
      steps,
      waterGlasses: 0,
      sleepHours: 0,
      notes: formNotes.trim(),
      createdAt: Date.now()
    };

    await db.fitnessLogs.add(newLog);
    addXP(30);
    setSanduExpression('celebrating');
    setIsModalOpen(false);
    loadFitnessData();

    // Reset form fields
    setFormCalories('');
    setFormNotes('');
  };

  const handleDeleteLog = async (id: string) => {
    if (!window.confirm(t('common.confirmDelete'))) return;
    await db.fitnessLogs.delete(id);
    loadFitnessData();
  };

  // Prepare weekly chart data (last 7 days)
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter((l) => l.date === dStr);
    const daySteps = dayLogs.reduce((sum, l) => sum + (l.steps || 0), 0);
    const dayCalories = dayLogs.reduce((sum, l) => sum + (l.calories || 0), 0);

    const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
    return {
      day: dayName,
      date: dStr,
      steps: daySteps,
      calories: dayCalories
    };
  });

  // Export data as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sandu_fitness_logs_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export data as CSV
  const handleExportCSV = () => {
    const headers = 'id,date,type,duration,calories,steps,waterGlasses,notes\n';
    const rows = logs
      .map(
        (l) =>
          `"${l.id}","${l.date}","${l.type}",${l.duration},${l.calories},${l.steps},${l.waterGlasses || 0},"${l.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sandu_fitness_logs_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-accent-500" />
            <span>{t('fitness.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('fitness.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('fitness.logActivity')}</span>
          </button>
        </div>
      </div>

      {/* Today's Ring Progress Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Steps */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Footprints className="w-4 h-4 text-emerald-500" />
              {t('fitness.todaySteps')}
            </span>
            <span>{Math.round((todayTotalSteps / targetSteps) * 100)}%</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {todayTotalSteps.toLocaleString()}
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (todayTotalSteps / targetSteps) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {t('fitness.stepsGoal', { goal: targetSteps.toLocaleString() })}
          </div>
        </div>

        {/* Calories Burned */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-500" />
              {t('fitness.caloriesBurned')}
            </span>
            <span>{Math.round((todayTotalCalories / targetCalories) * 100)}%</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {todayTotalCalories}{' '}
            <span className="text-xs font-semibold text-slate-400">kcal</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (todayTotalCalories / targetCalories) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {t('fitness.caloriesGoal', { goal: targetCalories })}
          </div>
        </div>

        {/* Active Minutes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-500" />
              {t('fitness.activeMinutes')}
            </span>
            <span>{Math.round((todayTotalMinutes / targetWorkoutMinutes) * 100)}%</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {todayTotalMinutes}{' '}
            <span className="text-xs font-semibold text-slate-400">mins</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (todayTotalMinutes / targetWorkoutMinutes) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            Goal: {targetWorkoutMinutes} mins
          </div>
        </div>

        {/* Water Intake */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Droplets className="w-4 h-4 text-sky-500" />
              {t('fitness.waterIntake')}
            </span>
            <button
              onClick={handleAddWater}
              className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              {t('fitness.addGlass')}
            </button>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {todayWaterGlasses}{' '}
            <span className="text-xs font-semibold text-slate-400">{t('fitness.glasses')}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (todayWaterGlasses / 8) * 100)}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">Goal: 8 glasses (2.0L)</div>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('fitness.weeklyChart')}
          </h3>
          <span className="text-xs text-slate-400">Steps & Calories Burned</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7DaysData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar yAxisId="left" dataKey="steps" fill="#10b981" radius={[4, 4, 0, 0]} name="Steps" />
              <Bar yAxisId="right" dataKey="calories" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Calories (kcal)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ML Trend Forecast Card */}
      {trendAnalysis && trendAnalysis.forecastNext7Days.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-6 rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('fitness.mlForecast')}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('fitness.forecastNotice')}
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-accent-100 dark:bg-accent-950/60 text-accent-700 dark:text-accent-300 rounded-full">
              {trendAnalysis.summary}
            </div>
          </div>

          {/* Forecast Line Chart */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendAnalysis.forecastNext7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="predictedSteps"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  name="Predicted Steps"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedCalories"
                  stroke="#ec4899"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  name="Predicted Calories"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Workout Logs List & Export Options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {t('fitness.recentLogs')}
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="p-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-accent-600 rounded-xl flex items-center gap-1 transition shadow-2xs"
              title="Export as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-accent-600 rounded-xl flex items-center gap-1 transition shadow-2xs"
              title="Export as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {logs.length > 0 ? (
          <div className="space-y-2.5">
            {logs.slice(-6).reverse().map((log) => (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-950/50 flex items-center justify-center text-accent-600 dark:text-accent-400 font-bold capitalize text-sm">
                    {log.type.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                      {log.type} • {log.duration} mins
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{log.date}</span>
                      <span>•</span>
                      <span>{log.calories} kcal</span>
                      <span>•</span>
                      <span>{log.steps} steps</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {t('fitness.noLogs')}
          </div>
        )}
      </div>

      {/* Manual Activity Logging Modal */}
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
                {t('fitness.logActivity')}
              </h3>

              <form onSubmit={handleSaveLog} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t('fitness.activityType')}
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="running">{t('fitness.types.running')}</option>
                    <option value="walking">{t('fitness.types.walking')}</option>
                    <option value="cycling">{t('fitness.types.cycling')}</option>
                    <option value="gym">{t('fitness.types.gym')}</option>
                    <option value="yoga">{t('fitness.types.yoga')}</option>
                    <option value="swimming">{t('fitness.types.swimming')}</option>
                    <option value="custom">{t('fitness.types.custom')}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t('fitness.duration')}
                    </label>
                    <input
                      type="number"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      min="1"
                      required
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t('fitness.todaySteps')}
                    </label>
                    <input
                      type="number"
                      value={formSteps}
                      onChange={(e) => setFormSteps(e.target.value)}
                      min="0"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t('fitness.caloriesOptional')}
                  </label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(e.target.value)}
                    placeholder="Leave empty for auto-estimation"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {t('fitness.autoEstimateNotice')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t('fitness.date')}
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      {t('fitness.notes')}
                    </label>
                    <input
                      type="text"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="e.g. morning park"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
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
