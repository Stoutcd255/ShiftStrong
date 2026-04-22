import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import './styles.css';
import LiftExamplesPanel from './src/components/LiftExamplesPanel';
import MacroExamplesPanel from './src/components/MacroExamplesPanel';
import HomeDashboard from './src/components/HomeDashboard';
import useKeyboardTabs from './src/hooks/useKeyboardTabs';

import {
  CLOUD_MIRROR_KEY,
  FALLBACK_DATE,
  STORAGE_BACKUP_KEY,
  STORAGE_KEY,
  STORAGE_VERSION,
  defaultState,
  deserializeEnvelope,
  getReadinessScore,
  isValidDate,
  isValidTime,
  liftExamples,
  macroExamples,
  loadState,
  newId,
  selectTrendRange,
  buildRecentActivity,
  tabs,
  toNumber,
} from './src/lib/logic';

function App() {
  const loaded = useMemo(loadState, []);
  const importInputRef = useRef(null);
  const reminderSentRef = useRef(new Set());

  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  const [weightLogs, setWeightLogs] = useState(loaded.state.weightLogs);
  const [macroLogs, setMacroLogs] = useState(loaded.state.macroLogs);
  const [workouts, setWorkouts] = useState(loaded.state.workouts);
  const [exerciseLogs, setExerciseLogs] = useState(loaded.state.exerciseLogs);
  const [templates, setTemplates] = useState(loaded.state.templates);
  const [foodLibrary, setFoodLibrary] = useState(loaded.state.foodLibrary);
  const [mealLogs, setMealLogs] = useState(loaded.state.mealLogs);
  const [readinessLogs, setReadinessLogs] = useState(loaded.state.readinessLogs);
  const [goals, setGoals] = useState(loaded.state.goals);
  const [periodization, setPeriodization] = useState(loaded.state.periodization);
  const [reminders, setReminders] = useState(loaded.state.reminders);

  const [bodyWeight, setBodyWeight] = useState('');
  const [weightDate, setWeightDate] = useState(FALLBACK_DATE());
  const [editingWeightId, setEditingWeightId] = useState('');

  const [macros, setMacros] = useState({ protein: '', carbs: '', fats: '' });
  const [macroDate, setMacroDate] = useState(FALLBACK_DATE());
  const [editingMacroId, setEditingMacroId] = useState('');

  const [workoutForm, setWorkoutForm] = useState({ day: '', mission: '', duration: '' });
  const [editingWorkoutId, setEditingWorkoutId] = useState('');

  const [exerciseForm, setExerciseForm] = useState({ date: FALLBACK_DATE(), name: '', sets: '', reps: '', load: '', rpe: '' });
  const [templateForm, setTemplateForm] = useState({ name: '', day: '', mission: '', duration: '' });
  const [foodForm, setFoodForm] = useState({ name: '', protein: '', carbs: '', fats: '' });
  const [mealForm, setMealForm] = useState({ date: FALLBACK_DATE(), foodId: '', servings: '1' });
  const [readinessForm, setReadinessForm] = useState({ date: FALLBACK_DATE(), sleep: '7.5', soreness: '4', stress: '4', restingHR: '62' });
  const [reminderForm, setReminderForm] = useState({ time: '08:00', message: '' });
  const [macroExampleQuery, setMacroExampleQuery] = useState('');
  const [liftExampleQuery, setLiftExampleQuery] = useState('');

  const [notice, setNotice] = useState(loaded.recoveredFromBackup ? 'Recovered data from backup snapshot.' : '');
  const [saveError, setSaveError] = useState('');
  const [undoAction, setUndoAction] = useState(null);
  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [cloudSyncAt, setCloudSyncAt] = useState('');
  const [dutyMode, setDutyMode] = useState('on-duty');
  const [dashboardRange, setDashboardRange] = useState('30');

  const fullState = useMemo(
    () => ({
      weightLogs,
      macroLogs,
      workouts,
      exerciseLogs,
      templates,
      foodLibrary,
      mealLogs,
      readinessLogs,
      goals,
      periodization,
      reminders,
    }),
    [exerciseLogs, foodLibrary, goals, macroLogs, mealLogs, periodization, readinessLogs, reminders, templates, weightLogs, workouts]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1700);
    return () => window.clearTimeout(timer);
  }, []);

  const persistState = useCallback((nextState) => {
    try {
      const previous = window.localStorage.getItem(STORAGE_KEY);
      if (previous) window.localStorage.setItem(STORAGE_BACKUP_KEY, previous);

      const envelope = { version: STORAGE_VERSION, savedAt: new Date().toISOString(), state: nextState };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      setSaveError('');
      setLastSavedAt(envelope.savedAt);
    } catch {
      setSaveError('Unable to save locally. Free up disk space or check browser storage settings.');
    }
  }, []);

  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => persistState(fullState));
      return () => window.cancelIdleCallback(id);
    }
    const timeoutId = window.setTimeout(() => persistState(fullState), 0);
    return () => window.clearTimeout(timeoutId);
  }, [fullState, persistState]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(''), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useKeyboardTabs(tabs, setActiveTab);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const todayKey = now.toISOString().slice(0, 10);

      reminders.forEach((reminder) => {
        if (!reminder.enabled || reminder.time !== nowTime) return;
        const key = `${todayKey}-${reminder.id}-${reminder.time}`;
        if (reminderSentRef.current.has(key)) return;

        reminderSentRef.current.add(key);
        setNotice(`Reminder: ${reminder.message}`);

        if (desktopAlertsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('ShiftStrong Reminder', { body: reminder.message });
        }
      });
    };

    tick();
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, [desktopAlertsEnabled, reminders]);

  const upsertByDate = (list, entry) => [entry, ...list.filter((item) => item.id !== entry.id)].sort((a, b) => b.date.localeCompare(a.date));

  const todayTotals = useMemo(() => {
    const today = FALLBACK_DATE();

    const macroFromManual = macroLogs.filter((entry) => entry.date === today).reduce(
      (acc, entry) => ({
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fats: acc.fats + entry.fats,
        calories: acc.calories + entry.calories,
      }),
      { protein: 0, carbs: 0, fats: 0, calories: 0 }
    );

    const macroFromMeals = mealLogs.filter((entry) => entry.date === today).reduce(
      (acc, entry) => ({
        protein: acc.protein + entry.protein,
        carbs: acc.carbs + entry.carbs,
        fats: acc.fats + entry.fats,
        calories: acc.calories + (entry.protein * 4 + entry.carbs * 4 + entry.fats * 9),
      }),
      { protein: 0, carbs: 0, fats: 0, calories: 0 }
    );

    return {
      protein: macroFromManual.protein + macroFromMeals.protein,
      carbs: macroFromManual.carbs + macroFromMeals.carbs,
      fats: macroFromManual.fats + macroFromMeals.fats,
      calories: macroFromManual.calories + macroFromMeals.calories,
    };
  }, [macroLogs, mealLogs]);

  const latestReadiness = readinessLogs[0];
  const readinessScore = latestReadiness ? getReadinessScore(latestReadiness) : 72;
  const intensityGuidance = readinessScore >= 85 ? 'High readiness: push heavy/intense training.' : readinessScore >= 70 ? 'Moderate readiness: normal training intensity.' : 'Low readiness: lower intensity and prioritize recovery.';

  const rankTiers = ['Cadet', 'Officer', 'Sergeant', 'Lieutenant', 'Captain'];
  const progressionPoints = workouts.length * 8 + exerciseLogs.length * 3 + macroLogs.length * 2 + mealLogs.length;
  const rankIndex = Math.min(rankTiers.length - 1, Math.floor(progressionPoints / 80));
  const currentRank = rankTiers[rankIndex];
  const nextRank = rankTiers[Math.min(rankTiers.length - 1, rankIndex + 1)];
  const pointsToNextRank = rankIndex === rankTiers.length - 1 ? 0 : Math.max(0, ((rankIndex + 1) * 80) - progressionPoints);

  const weeklyDuration = useMemo(() => workouts.reduce((sum, entry) => sum + entry.duration, 0), [workouts]);
  const latestWeight = weightLogs[0]?.weight ?? '--';

  const workoutVolumeWeek = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const floorDate = sevenDaysAgo.toISOString().slice(0, 10);
    return exerciseLogs.filter((entry) => entry.date >= floorDate).reduce((sum, entry) => sum + (entry.sets * entry.reps * entry.load), 0);
  }, [exerciseLogs]);

  const goalsProgress = useMemo(() => {
    const ratio = (value, goal) => (goal ? Math.min(150, Math.round((value / goal) * 100)) : 0);
    return {
      proteinPct: ratio(todayTotals.protein, goals.protein),
      carbsPct: ratio(todayTotals.carbs, goals.carbs),
      fatsPct: ratio(todayTotals.fats, goals.fats),
      caloriesPct: ratio(todayTotals.calories, goals.calories),
      sessionPct: ratio(workouts.length, goals.sessionsPerWeek),
    };
  }, [goals, todayTotals, workouts.length]);

  const trendData = useMemo(() => {
    const byDate = new Map();

    weightLogs.forEach((entry) => {
      byDate.set(entry.date, { ...(byDate.get(entry.date) || { date: entry.date, calories: 0, volume: 0 }), weight: entry.weight });
    });

    macroLogs.forEach((entry) => {
      byDate.set(entry.date, {
        ...(byDate.get(entry.date) || { date: entry.date, weight: null, volume: 0 }),
        calories: (byDate.get(entry.date)?.calories || 0) + entry.calories,
      });
    });

    mealLogs.forEach((entry) => {
      byDate.set(entry.date, {
        ...(byDate.get(entry.date) || { date: entry.date, weight: null, volume: 0 }),
        calories: (byDate.get(entry.date)?.calories || 0) + (entry.protein * 4 + entry.carbs * 4 + entry.fats * 9),
      });
    });

    exerciseLogs.forEach((entry) => {
      const vol = entry.sets * entry.reps * entry.load;
      byDate.set(entry.date, {
        ...(byDate.get(entry.date) || { date: entry.date, weight: null, calories: 0 }),
        volume: (byDate.get(entry.date)?.volume || 0) + vol,
      });
    });

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
  }, [exerciseLogs, macroLogs, mealLogs, weightLogs]);

  const heroMetric = Math.round(todayTotals.calories || 0);
  const dashboardTrendData = useMemo(() => selectTrendRange(trendData, dashboardRange), [dashboardRange, trendData]);
  const recentActivity = useMemo(
    () => buildRecentActivity({ weightLogs, macroLogs, workouts, exerciseLogs, fallbackDate: FALLBACK_DATE() }),
    [exerciseLogs, macroLogs, weightLogs, workouts]
  );

  const progressionSuggestions = useMemo(() => {
    const groups = new Map();

    exerciseLogs.forEach((entry) => {
      if (!groups.has(entry.name)) groups.set(entry.name, []);
      groups.get(entry.name).push(entry);
    });

    return Array.from(groups.entries()).map(([name, logs]) => {
      const sorted = logs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
      const avgLoad = sorted.reduce((sum, row) => sum + row.load, 0) / Math.max(1, sorted.length);
      const avgRpe = sorted.reduce((sum, row) => sum + row.rpe, 0) / Math.max(1, sorted.length);
      const suggestDelta = avgRpe <= 7 ? 5 : avgRpe <= 8.5 ? 2.5 : 0;
      return {
        name,
        avgLoad: Number(avgLoad.toFixed(1)),
        avgRpe: Number(avgRpe.toFixed(1)),
        nextLoad: Number((avgLoad + suggestDelta).toFixed(1)),
      };
    }).sort((a, b) => b.nextLoad - a.nextLoad);
  }, [exerciseLogs]);

  const complianceData = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    const month = start.getMonth();
    const rows = [];

    while (start.getMonth() === month) {
      const day = start.toISOString().slice(0, 10);
      const score =
        Number(weightLogs.some((entry) => entry.date === day)) +
        Number((macroLogs.some((entry) => entry.date === day) || mealLogs.some((entry) => entry.date === day))) +
        Number(exerciseLogs.some((entry) => entry.date === day));

      rows.push({ date: day, score });
      start.setDate(start.getDate() + 1);
    }

    return rows;
  }, [exerciseLogs, macroLogs, mealLogs, weightLogs]);

  const anomalyFlags = useMemo(() => {
    const flags = [];

    const sortedWeight = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < sortedWeight.length; i += 1) {
      const diff = Math.abs(sortedWeight[i].weight - sortedWeight[i - 1].weight);
      if (diff >= 4) {
        flags.push(`Weight shifted ${diff.toFixed(1)} lbs between ${sortedWeight[i - 1].date} and ${sortedWeight[i].date}.`);
      }
    }

    macroLogs.forEach((entry) => {
      if (entry.calories > 6000) flags.push(`Macro entry on ${entry.date} exceeds 6000 calories.`);
    });

    mealLogs.forEach((entry) => {
      const calories = entry.protein * 4 + entry.carbs * 4 + entry.fats * 9;
      if (calories > 2200) flags.push(`Single meal '${entry.name}' on ${entry.date} exceeds 2200 calories.`);
    });

    return flags.slice(0, 20);
  }, [macroLogs, mealLogs, weightLogs]);

  const autoProgramNextWeek = useCallback(() => {
    const dayTemplates = ['Monday', 'Tuesday', 'Thursday', 'Saturday'];
    const baseDuration = readinessScore >= 85 ? 65 : readinessScore >= 70 ? 55 : 45;
    const phaseFocus = periodization.phase === 'Strength' ? 'Heavy Compound Focus' : periodization.phase === 'Hypertrophy' ? 'Volume + Accessory Focus' : 'Recovery + Technique Focus';

    const generated = dayTemplates.slice(0, goals.sessionsPerWeek).map((day, idx) => ({
      id: `wk-${newId()}`,
      day,
      mission: `${phaseFocus} Session ${idx + 1}`,
      duration: Math.max(35, Math.min(90, baseDuration + idx * 3)),
    }));

    setWorkouts((prev) => [...generated, ...prev]);
    setNotice('Adaptive next-week program generated from readiness + goals.');
  }, [goals.sessionsPerWeek, periodization.phase, readinessScore]);

  const syncToCloudMirror = useCallback(() => {
    try {
      const envelope = {
        savedAt: new Date().toISOString(),
        checksumHint: `${weightLogs.length}-${macroLogs.length}-${workouts.length}-${exerciseLogs.length}`,
        state: fullState,
      };
      window.localStorage.setItem(CLOUD_MIRROR_KEY, JSON.stringify(envelope));
      setCloudSyncAt(envelope.savedAt);
      setNotice('Secure sync mirror updated.');
    } catch {
      setNotice('Sync mirror failed.');
    }
  }, [exerciseLogs.length, fullState, macroLogs.length, weightLogs.length, workouts.length]);

  const importCloudMirror = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(CLOUD_MIRROR_KEY);
      if (!raw) {
        setNotice('No cloud mirror snapshot exists.');
        return;
      }
      const next = deserializeEnvelope(raw);
      setWeightLogs(next.weightLogs);
      setMacroLogs(next.macroLogs);
      setWorkouts(next.workouts);
      setExerciseLogs(next.exerciseLogs);
      setTemplates(next.templates);
      setFoodLibrary(next.foodLibrary);
      setMealLogs(next.mealLogs);
      setReadinessLogs(next.readinessLogs);
      setGoals(next.goals);
      setPeriodization(next.periodization);
      setReminders(next.reminders);
      setNotice('Cloud mirror restored.');
    } catch {
      setNotice('Cloud mirror restore failed.');
    }
  }, []);

  const removeItemWithUndo = useCallback((collection, id) => {
    const map = {
      weight: [weightLogs, setWeightLogs],
      macro: [macroLogs, setMacroLogs],
      workout: [workouts, setWorkouts],
      exercise: [exerciseLogs, setExerciseLogs],
      template: [templates, setTemplates],
      reminder: [reminders, setReminders],
      food: [foodLibrary, setFoodLibrary],
      meal: [mealLogs, setMealLogs],
      readiness: [readinessLogs, setReadinessLogs],
    };

    const [list, setter] = map[collection];
    const target = list.find((entry) => entry.id === id);
    if (!target) return;

    setter((prev) => prev.filter((entry) => entry.id !== id));
    setUndoAction({ collection, entry: target });
    setNotice('Deleted. Use Undo Delete to restore.');
  }, [exerciseLogs, foodLibrary, macroLogs, mealLogs, readinessLogs, reminders, templates, weightLogs, workouts]);

  const undoLastDelete = useCallback(() => {
    if (!undoAction) return;

    const map = {
      weight: () => setWeightLogs((prev) => upsertByDate(prev, undoAction.entry)),
      macro: () => setMacroLogs((prev) => upsertByDate(prev, undoAction.entry)),
      workout: () => setWorkouts((prev) => [undoAction.entry, ...prev]),
      exercise: () => setExerciseLogs((prev) => upsertByDate(prev, undoAction.entry)),
      template: () => setTemplates((prev) => [undoAction.entry, ...prev]),
      reminder: () => setReminders((prev) => [undoAction.entry, ...prev]),
      food: () => setFoodLibrary((prev) => [undoAction.entry, ...prev]),
      meal: () => setMealLogs((prev) => upsertByDate(prev, undoAction.entry)),
      readiness: () => setReadinessLogs((prev) => upsertByDate(prev, undoAction.entry)),
    };

    map[undoAction.collection]?.();
    setUndoAction(null);
    setNotice('Undo complete.');
  }, [undoAction]);

  const clearAllData = useCallback(() => {
    if (!window.confirm('Clear all tracker data and reset to defaults?')) return;

    setWeightLogs(defaultState.weightLogs);
    setMacroLogs(defaultState.macroLogs);
    setWorkouts(defaultState.workouts);
    setExerciseLogs(defaultState.exerciseLogs);
    setTemplates(defaultState.templates);
    setFoodLibrary(defaultState.foodLibrary);
    setMealLogs(defaultState.mealLogs);
    setReadinessLogs(defaultState.readinessLogs);
    setGoals(defaultState.goals);
    setPeriodization(defaultState.periodization);
    setReminders(defaultState.reminders);
    setUndoAction(null);
    setNotice('Tracker reset to defaults.');
  }, []);

  const exportData = useCallback(() => {
    const payload = { version: STORAGE_VERSION, exportedAt: new Date().toISOString(), state: fullState };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `shiftstrong-backup-${FALLBACK_DATE()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Backup exported.');
  }, [fullState]);

  const importData = useCallback(async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const next = deserializeEnvelope(text);
      setWeightLogs(next.weightLogs);
      setMacroLogs(next.macroLogs);
      setWorkouts(next.workouts);
      setExerciseLogs(next.exerciseLogs);
      setTemplates(next.templates);
      setFoodLibrary(next.foodLibrary);
      setMealLogs(next.mealLogs);
      setReadinessLogs(next.readinessLogs);
      setGoals(next.goals);
      setPeriodization(next.periodization);
      setReminders(next.reminders);
      setNotice('Backup imported successfully.');
    } catch {
      setNotice('Import failed. Choose a valid ShiftStrong JSON backup.');
    }
  }, []);

  const requestDesktopAlerts = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setNotice('Desktop alerts are not supported in this environment.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setDesktopAlertsEnabled(true);
      setNotice('Desktop alerts enabled.');
    } else {
      setNotice('Desktop alerts were not enabled.');
    }
  }, []);

  const addOrUpdateWeight = (event) => {
    event.preventDefault();
    const value = Number(Number(bodyWeight).toFixed(1));
    if (!value || value <= 0 || value > 1400) return setNotice('Enter bodyweight between 1 and 1400 lbs.');

    const entry = {
      id: editingWeightId || `w-${newId()}`,
      date: isValidDate(weightDate) ? weightDate : FALLBACK_DATE(),
      weight: value,
    };

    setWeightLogs((prev) => upsertByDate(prev, entry));
    setBodyWeight('');
    setWeightDate(FALLBACK_DATE());
    setEditingWeightId('');
    setNotice(editingWeightId ? 'Weight updated.' : 'Weight entry added.');
  };

  const addOrUpdateMacro = (event) => {
    event.preventDefault();
    const protein = Math.max(0, Math.round(toNumber(macros.protein)));
    const carbs = Math.max(0, Math.round(toNumber(macros.carbs)));
    const fats = Math.max(0, Math.round(toNumber(macros.fats)));
    if (protein + carbs + fats === 0) return setNotice('Add at least one macro greater than 0.');

    const entry = {
      id: editingMacroId || `m-${newId()}`,
      date: isValidDate(macroDate) ? macroDate : FALLBACK_DATE(),
      protein,
      carbs,
      fats,
      calories: protein * 4 + carbs * 4 + fats * 9,
    };

    setMacroLogs((prev) => upsertByDate(prev, entry));
    setMacros({ protein: '', carbs: '', fats: '' });
    setMacroDate(FALLBACK_DATE());
    setEditingMacroId('');
    setNotice(editingMacroId ? 'Macro updated.' : 'Macro entry added.');
  };

  const addOrUpdateWorkout = (event) => {
    event.preventDefault();
    const duration = Math.round(toNumber(workoutForm.duration));
    const day = workoutForm.day.trim();
    const mission = workoutForm.mission.trim();
    if (!day || !mission || duration <= 0 || duration > 360) return setNotice('Workout requires valid day, mission, and duration.');

    const entry = { id: editingWorkoutId || `wk-${newId()}`, day, mission, duration };
    setWorkouts((prev) => [entry, ...prev.filter((item) => item.id !== entry.id)]);
    setWorkoutForm({ day: '', mission: '', duration: '' });
    setEditingWorkoutId('');
    setNotice(editingWorkoutId ? 'Workout updated.' : 'Workout added.');
  };

  const addExerciseLog = (event) => {
    event.preventDefault();
    const entry = {
      id: `ex-${newId()}`,
      date: isValidDate(exerciseForm.date) ? exerciseForm.date : FALLBACK_DATE(),
      name: exerciseForm.name.trim(),
      sets: Math.round(toNumber(exerciseForm.sets)),
      reps: Math.round(toNumber(exerciseForm.reps)),
      load: Number(toNumber(exerciseForm.load).toFixed(1)),
      rpe: Number(toNumber(exerciseForm.rpe).toFixed(1)),
    };

    if (!entry.name || entry.sets <= 0 || entry.reps <= 0) return setNotice('Exercise log needs movement, sets, and reps.');
    setExerciseLogs((prev) => upsertByDate(prev, entry));
    setExerciseForm({ date: FALLBACK_DATE(), name: '', sets: '', reps: '', load: '', rpe: '' });
    setNotice('Exercise log added.');
  };

  const addTemplate = (event) => {
    event.preventDefault();
    const duration = Math.max(1, Math.min(360, Math.round(toNumber(templateForm.duration))));
    const entry = {
      id: `tpl-${newId()}`,
      name: templateForm.name.trim(),
      day: templateForm.day.trim(),
      mission: templateForm.mission.trim(),
      duration,
    };

    if (!entry.name || !entry.day || !entry.mission) return setNotice('Template needs name/day/mission.');
    setTemplates((prev) => [entry, ...prev]);
    setTemplateForm({ name: '', day: '', mission: '', duration: '' });
    setNotice('Template saved.');
  };

  const addFood = (event) => {
    event.preventDefault();
    const entry = {
      id: `food-${newId()}`,
      name: foodForm.name.trim(),
      protein: Math.max(0, Math.round(toNumber(foodForm.protein))),
      carbs: Math.max(0, Math.round(toNumber(foodForm.carbs))),
      fats: Math.max(0, Math.round(toNumber(foodForm.fats))),
    };
    if (!entry.name) return setNotice('Food must have a name.');
    setFoodLibrary((prev) => [entry, ...prev]);
    setFoodForm({ name: '', protein: '', carbs: '', fats: '' });
    setNotice('Food item saved.');
  };

  const addMealLog = (event) => {
    event.preventDefault();
    const food = foodLibrary.find((entry) => entry.id === mealForm.foodId);
    if (!food) return setNotice('Select a valid food item.');

    const servings = Math.max(0.25, Number(toNumber(mealForm.servings).toFixed(2)));
    const entry = {
      id: `meal-${newId()}`,
      date: isValidDate(mealForm.date) ? mealForm.date : FALLBACK_DATE(),
      name: `${food.name} x${servings}`,
      protein: Math.round(food.protein * servings),
      carbs: Math.round(food.carbs * servings),
      fats: Math.round(food.fats * servings),
    };

    setMealLogs((prev) => upsertByDate(prev, entry));
    setMealForm({ date: FALLBACK_DATE(), foodId: '', servings: '1' });
    setNotice('Meal logged.');
  };

  const addReadinessLog = (event) => {
    event.preventDefault();
    const entry = {
      id: `ready-${newId()}`,
      date: isValidDate(readinessForm.date) ? readinessForm.date : FALLBACK_DATE(),
      sleep: Math.max(0, Math.min(14, Number(toNumber(readinessForm.sleep).toFixed(1)))),
      soreness: Math.max(1, Math.min(10, Math.round(toNumber(readinessForm.soreness)))),
      stress: Math.max(1, Math.min(10, Math.round(toNumber(readinessForm.stress)))),
      restingHR: Math.max(30, Math.min(180, Math.round(toNumber(readinessForm.restingHR)))),
    };

    setReadinessLogs((prev) => upsertByDate(prev, entry));
    setNotice(`Readiness logged. Score: ${getReadinessScore(entry)}`);
  };

  const addReminder = (event) => {
    event.preventDefault();
    if (!isValidTime(reminderForm.time) || !reminderForm.message.trim()) return setNotice('Reminder needs time and message.');

    const reminder = {
      id: `r-${newId()}`,
      time: reminderForm.time,
      message: reminderForm.message.trim(),
      enabled: true,
    };

    setReminders((prev) => [reminder, ...prev]);
    setReminderForm({ time: '08:00', message: '' });
    setNotice('Reminder created.');
  };

  const toggleReminder = (id) => {
    setReminders((prev) => prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  };

  const applyTemplate = (template) => {
    const workout = { id: `wk-${newId()}`, day: template.day, mission: template.mission, duration: template.duration };
    setWorkouts((prev) => [workout, ...prev]);
    setNotice(`Template applied: ${template.name}`);
  };

  const editWeightEntry = (entry) => {
    setBodyWeight(String(entry.weight));
    setWeightDate(entry.date);
    setEditingWeightId(entry.id);
    setActiveTab('weight-log');
  };

  const editMacroEntry = (entry) => {
    setMacros({ protein: String(entry.protein), carbs: String(entry.carbs), fats: String(entry.fats) });
    setMacroDate(entry.date);
    setEditingMacroId(entry.id);
    setActiveTab('macro');
  };

  const editWorkoutEntry = (entry) => {
    setWorkoutForm({ day: entry.day, mission: entry.mission, duration: String(entry.duration) });
    setEditingWorkoutId(entry.id);
    setActiveTab('workouts');
  };

  const macroCaloriesPreview = (toNumber(macros.protein) * 4) + (toNumber(macros.carbs) * 4) + (toNumber(macros.fats) * 9);

  const recommendedLoadList = progressionSuggestions.slice(0, 8);

  const filteredMacroExamples = useMemo(() => {
    const query = macroExampleQuery.trim().toLowerCase();
    if (!query) return macroExamples;
    return macroExamples.filter((example) => example.plan.toLowerCase().includes(query));
  }, [macroExampleQuery]);

  const filteredLiftExamples = useMemo(() => {
    const query = liftExampleQuery.trim().toLowerCase();
    if (!query) return liftExamples;
    return liftExamples.filter((example) =>
      example.name.toLowerCase().includes(query) ||
      example.focus.toLowerCase().includes(query) ||
      example.cue.toLowerCase().includes(query)
    );
  }, [liftExampleQuery]);

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-card">
          <p className="badge">POLICE PERFORMANCE SYSTEM</p>
          <h1>SHIFTSTRONG</h1>
          <p>Loading tactical command board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell neon-frame">
      <header className="hero silver-trim">
        <p className="badge">TACTICAL PERFORMANCE SYSTEM</p>
        <h1>SHIFTSTRONG COMMAND BOARD</h1>
        <p className="subtitle">Expert-grade workout + macro tracking with adaptive programming, readiness scoring, and analytics intelligence.</p>
        <div className="duty-toggle" role="group" aria-label="Shift mode">
          <button type="button" className={dutyMode === 'on-duty' ? 'ghost-btn active' : 'ghost-btn'} onClick={() => setDutyMode('on-duty')}>On-Duty</button>
          <button type="button" className={dutyMode === 'off-duty' ? 'ghost-btn active' : 'ghost-btn'} onClick={() => setDutyMode('off-duty')}>Off-Duty</button>
        </div>
      </header>

      {(notice || saveError || lastSavedAt || cloudSyncAt) && (
        <section className="status-bar" role="status" aria-live="polite">
          {notice && <p>{notice}</p>}
          {saveError && <p className="error-text">{saveError}</p>}
          {lastSavedAt && <p className="muted">Last saved: {lastSavedAt}</p>}
          {cloudSyncAt && <p className="muted">Mirror synced: {cloudSyncAt}</p>}
        </section>
      )}

      <section className="workspace">
        <aside className="side-nav-panel silver-trim">
          <nav className="tab-row side-tabs" aria-label="Main sections">
            {tabs.map((tab) => (
              <button key={tab.id} type="button" className={activeTab === tab.id ? 'tab active' : 'tab'} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
          </nav>

          <section className="quick-action-dock side-actions" aria-label="Quick actions">
            <button type="button" className="btn" onClick={() => setActiveTab('workouts')}>Begin Session</button>
            <button type="button" className="btn" onClick={() => setActiveTab('macro')}>Log Intake</button>
            <button type="button" className="btn" onClick={() => setActiveTab('weight-log')}>Log Weight</button>
            <button type="button" className="btn" onClick={() => setActiveTab('settings')}>Command Settings</button>
          </section>
        </aside>

        <main className="content-panel silver-trim">
        {activeTab === 'home' && (
          <HomeDashboard
            heroMetric={heroMetric}
            dashboardRange={dashboardRange}
            setDashboardRange={setDashboardRange}
            dashboardTrendData={dashboardTrendData}
            readinessScore={readinessScore}
            latestWeight={latestWeight}
            workoutsCount={workouts.length}
            workoutVolumeWeek={workoutVolumeWeek}
            weeklyDuration={weeklyDuration}
            currentRank={currentRank}
            recentActivity={recentActivity}
            intensityGuidance={intensityGuidance}
            pointsToNextRank={pointsToNextRank}
            nextRank={nextRank}
            dutyMode={dutyMode}
            setActiveTab={setActiveTab}
            todayTotals={todayTotals}
            goals={goals}
          />
        )}

        {activeTab === 'weight-log' && (
          <section className="grid two-col">
            <article className="card">
              <h2>{editingWeightId ? 'Edit Body Weight' : 'Log Body Weight'}</h2>
              <form className="form-grid" onSubmit={addOrUpdateWeight}>
                <label>Date
                  <input type="date" value={weightDate} onChange={(e) => setWeightDate(e.target.value)} required />
                </label>
                <label>Weight (lbs)
                  <input type="number" step="0.1" min="1" max="1400" value={bodyWeight} onChange={(e) => setBodyWeight(e.target.value)} required />
                </label>
                <button className="btn" type="submit">{editingWeightId ? 'Update Entry' : 'Add Weight Entry'}</button>
              </form>
            </article>

            <article className="card">
              <h2>Weight Timeline</h2>
              <ul className="data-list">
                {weightLogs.length === 0 && <li>No weight entries yet.</li>}
                {weightLogs.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.date}</span>
                    <div className="inline-actions">
                      <strong>{entry.weight} lbs</strong>
                      <button className="ghost-btn" type="button" onClick={() => editWeightEntry(entry)}>Edit</button>
                      <button className="ghost-btn" type="button" onClick={() => removeItemWithUndo('weight', entry.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}

        {activeTab === 'macro' && (
          <section className="grid two-col">
            <article className="card">
              <h2>{editingMacroId ? 'Edit Macros' : 'Track Daily Macros'}</h2>
              <form className="form-grid three" onSubmit={addOrUpdateMacro}>
                <label>Date
                  <input type="date" value={macroDate} onChange={(e) => setMacroDate(e.target.value)} required />
                </label>
                <label>Protein (g)
                  <input type="number" min="0" value={macros.protein} onChange={(e) => setMacros((prev) => ({ ...prev, protein: e.target.value }))} />
                </label>
                <label>Carbs (g)
                  <input type="number" min="0" value={macros.carbs} onChange={(e) => setMacros((prev) => ({ ...prev, carbs: e.target.value }))} />
                </label>
                <label>Fats (g)
                  <input type="number" min="0" value={macros.fats} onChange={(e) => setMacros((prev) => ({ ...prev, fats: e.target.value }))} />
                </label>
                <p className="stat">Projected Calories: {macroCaloriesPreview}</p>
                <button className="btn" type="submit">{editingMacroId ? 'Update Macro Entry' : 'Save Macro Entry'}</button>
              </form>
            </article>

            <article className="card">
              <h2>Macro Entries</h2>
              <ul className="data-list">
                {macroLogs.length === 0 && <li>No entries yet.</li>}
                {macroLogs.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.date}</span>
                    <div className="inline-actions">
                      <strong>{entry.protein}P/{entry.carbs}C/{entry.fats}F • {entry.calories} cal</strong>
                      <button className="ghost-btn" type="button" onClick={() => editMacroEntry(entry)}>Edit</button>
                      <button className="ghost-btn" type="button" onClick={() => removeItemWithUndo('macro', entry.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>


            <MacroExamplesPanel
              filteredMacroExamples={filteredMacroExamples}
              macroExampleQuery={macroExampleQuery}
              setMacroExampleQuery={setMacroExampleQuery}
              applyMacroExample={(example) => {
                setMacros({ protein: String(example.protein), carbs: String(example.carbs), fats: String(example.fats) });
                setActiveTab('macro');
                setNotice(`Applied macro example: ${example.plan}`);
              }}
            />
          </section>
        )}

        {activeTab === 'workouts' && (
          <section className="grid two-col">
            <article className="card">
              <h2>{editingWorkoutId ? 'Edit Workout Day' : 'Build a Workout Day'}</h2>
              <form className="form-grid" onSubmit={addOrUpdateWorkout}>
                <label>Day
                  <input type="text" value={workoutForm.day} onChange={(e) => setWorkoutForm((prev) => ({ ...prev, day: e.target.value }))} required />
                </label>
                <label>Mission
                  <input type="text" value={workoutForm.mission} onChange={(e) => setWorkoutForm((prev) => ({ ...prev, mission: e.target.value }))} required />
                </label>
                <label>Duration (min)
                  <input type="number" min="1" max="360" value={workoutForm.duration} onChange={(e) => setWorkoutForm((prev) => ({ ...prev, duration: e.target.value }))} required />
                </label>
                <button className="btn" type="submit">{editingWorkoutId ? 'Update Workout' : 'Add Workout Block'}</button>
              </form>
            </article>

            <article className="card">
              <h2>Workout Templates</h2>
              <form className="form-grid" onSubmit={addTemplate}>
                <label>Name
                  <input type="text" value={templateForm.name} onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))} required />
                </label>
                <label>Day
                  <input type="text" value={templateForm.day} onChange={(e) => setTemplateForm((prev) => ({ ...prev, day: e.target.value }))} required />
                </label>
                <label>Mission
                  <input type="text" value={templateForm.mission} onChange={(e) => setTemplateForm((prev) => ({ ...prev, mission: e.target.value }))} required />
                </label>
                <label>Duration
                  <input type="number" min="1" max="360" value={templateForm.duration} onChange={(e) => setTemplateForm((prev) => ({ ...prev, duration: e.target.value }))} required />
                </label>
                <button className="btn" type="submit">Save Template</button>
              </form>
              <ul className="data-list compact">
                {templates.map((template) => (
                  <li key={template.id}>
                    <span>{template.name} · {template.day}</span>
                    <div className="inline-actions">
                      <button type="button" className="ghost-btn" onClick={() => applyTemplate(template)}>Apply</button>
                      <button type="button" className="ghost-btn" onClick={() => removeItemWithUndo('template', template.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card full-width">
              <h2>Weekly Training Plan</h2>
              <ul className="data-list">
                {workouts.map((workout) => (
                  <li key={workout.id}>
                    <span>{workout.day}</span>
                    <div className="inline-actions">
                      <strong>{workout.mission} · {workout.duration} min</strong>
                      <button className="ghost-btn" type="button" onClick={() => editWorkoutEntry(workout)}>Edit</button>
                      <button className="ghost-btn" type="button" onClick={() => removeItemWithUndo('workout', workout.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card full-width">
              <h2>Exercise Performance Log</h2>
              <form className="form-grid five" onSubmit={addExerciseLog}>
                <label>Date
                  <input type="date" value={exerciseForm.date} onChange={(e) => setExerciseForm((prev) => ({ ...prev, date: e.target.value }))} required />
                </label>
                <label>Exercise
                  <input type="text" value={exerciseForm.name} onChange={(e) => setExerciseForm((prev) => ({ ...prev, name: e.target.value }))} required />
                </label>
                <label>Sets
                  <input type="number" min="1" value={exerciseForm.sets} onChange={(e) => setExerciseForm((prev) => ({ ...prev, sets: e.target.value }))} required />
                </label>
                <label>Reps
                  <input type="number" min="1" value={exerciseForm.reps} onChange={(e) => setExerciseForm((prev) => ({ ...prev, reps: e.target.value }))} required />
                </label>
                <label>Load
                  <input type="number" min="0" step="0.1" value={exerciseForm.load} onChange={(e) => setExerciseForm((prev) => ({ ...prev, load: e.target.value }))} />
                </label>
                <label>RPE
                  <input type="number" min="0" max="10" step="0.1" value={exerciseForm.rpe} onChange={(e) => setExerciseForm((prev) => ({ ...prev, rpe: e.target.value }))} />
                </label>
                <button className="btn" type="submit">Add Exercise Log</button>
              </form>

              <ul className="data-list">
                {exerciseLogs.slice(0, 20).map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.date} · {entry.name}</span>
                    <div className="inline-actions">
                      <strong>{entry.sets}x{entry.reps} @ {entry.load} lb · RPE {entry.rpe || '-'}</strong>
                      <button className="ghost-btn" type="button" onClick={() => removeItemWithUndo('exercise', entry.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}

        {activeTab === 'nutrition' && (
          <section className="grid two-col">
            <article className="card">
              <h2>Food Library</h2>
              <form className="form-grid" onSubmit={addFood}>
                <label>Name
                  <input type="text" value={foodForm.name} onChange={(e) => setFoodForm((prev) => ({ ...prev, name: e.target.value }))} required />
                </label>
                <label>Protein
                  <input type="number" min="0" value={foodForm.protein} onChange={(e) => setFoodForm((prev) => ({ ...prev, protein: e.target.value }))} />
                </label>
                <label>Carbs
                  <input type="number" min="0" value={foodForm.carbs} onChange={(e) => setFoodForm((prev) => ({ ...prev, carbs: e.target.value }))} />
                </label>
                <label>Fats
                  <input type="number" min="0" value={foodForm.fats} onChange={(e) => setFoodForm((prev) => ({ ...prev, fats: e.target.value }))} />
                </label>
                <button className="btn" type="submit">Save Food</button>
              </form>

              <ul className="data-list compact">
                {foodLibrary.map((food) => (
                  <li key={food.id}>
                    <span>{food.name}</span>
                    <div className="inline-actions">
                      <strong>{food.protein}P/{food.carbs}C/{food.fats}F</strong>
                      <button type="button" className="ghost-btn" onClick={() => removeItemWithUndo('food', food.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card">
              <h2>Meal Log</h2>
              <form className="form-grid" onSubmit={addMealLog}>
                <label>Date
                  <input type="date" value={mealForm.date} onChange={(e) => setMealForm((prev) => ({ ...prev, date: e.target.value }))} required />
                </label>
                <label>Food Item
                  <select value={mealForm.foodId} onChange={(e) => setMealForm((prev) => ({ ...prev, foodId: e.target.value }))} required>
                    <option value="">Select food</option>
                    {foodLibrary.map((food) => <option key={food.id} value={food.id}>{food.name}</option>)}
                  </select>
                </label>
                <label>Servings
                  <input type="number" min="0.25" step="0.25" value={mealForm.servings} onChange={(e) => setMealForm((prev) => ({ ...prev, servings: e.target.value }))} required />
                </label>
                <button className="btn" type="submit">Log Meal</button>
              </form>

              <ul className="data-list compact">
                {mealLogs.map((meal) => (
                  <li key={meal.id}>
                    <span>{meal.date} · {meal.name}</span>
                    <div className="inline-actions">
                      <strong>{meal.protein}P/{meal.carbs}C/{meal.fats}F</strong>
                      <button type="button" className="ghost-btn" onClick={() => removeItemWithUndo('meal', meal.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}

        {activeTab === 'intel' && (
          <section className="grid two-col">
            <article className="card">
              <h2>Readiness Log</h2>
              <form className="form-grid five" onSubmit={addReadinessLog}>
                <label>Date
                  <input type="date" value={readinessForm.date} onChange={(e) => setReadinessForm((prev) => ({ ...prev, date: e.target.value }))} required />
                </label>
                <label>Sleep (h)
                  <input type="number" min="0" max="14" step="0.1" value={readinessForm.sleep} onChange={(e) => setReadinessForm((prev) => ({ ...prev, sleep: e.target.value }))} required />
                </label>
                <label>Soreness
                  <input type="number" min="1" max="10" value={readinessForm.soreness} onChange={(e) => setReadinessForm((prev) => ({ ...prev, soreness: e.target.value }))} required />
                </label>
                <label>Stress
                  <input type="number" min="1" max="10" value={readinessForm.stress} onChange={(e) => setReadinessForm((prev) => ({ ...prev, stress: e.target.value }))} required />
                </label>
                <label>Resting HR
                  <input type="number" min="30" max="180" value={readinessForm.restingHR} onChange={(e) => setReadinessForm((prev) => ({ ...prev, restingHR: e.target.value }))} required />
                </label>
                <button className="btn" type="submit">Save Readiness</button>
              </form>

              <ul className="data-list compact">
                {readinessLogs.map((entry) => (
                  <li key={entry.id}>
                    <span>{entry.date}</span>
                    <div className="inline-actions">
                      <strong>Score {getReadinessScore(entry)}</strong>
                      <button type="button" className="ghost-btn" onClick={() => removeItemWithUndo('readiness', entry.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="card">
              <h2>Advanced Trend Board (30 Days)</h2>
              <div className="chart-wrap large">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,168,216,0.25)" />
                    <XAxis dataKey="date" stroke="#b7d6ff" />
                    <YAxis yAxisId="left" stroke="#90d5ff" />
                    <YAxis yAxisId="right" orientation="right" stroke="#ffd07f" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" dataKey="weight" stroke="#00f7ff" strokeWidth={2} dot={false} name="Weight" />
                    <Line yAxisId="left" dataKey="calories" stroke="#6db7ff" strokeWidth={2} dot={false} name="Calories" />
                    <Line yAxisId="right" dataKey="volume" stroke="#ffd157" strokeWidth={2} dot={false} name="Volume" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card full-width">
              <h2>Calendar Compliance Heatmap (Current Month)</h2>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,168,216,0.25)" />
                    <XAxis dataKey="date" hide />
                    <YAxis stroke="#90d5ff" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#1f8fff" name="Daily Compliance (0-3)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card full-width">
              <h2>Data Quality Guardrails</h2>
              <ul className="data-list compact">
                {anomalyFlags.length === 0 && <li>No anomalies detected in current data range.</li>}
                {anomalyFlags.map((flag, index) => (
                  <li key={`${flag}-${index}`}>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        )}



        {activeTab === 'settings' && (
          <section className="grid two-col">
            <article className="card">
              <h2>Data & Recovery</h2>
              <p className="muted">Control backups, restores, and emergency resets in one location.</p>
              <div className="utility-row">
                <button type="button" className="ghost-btn" onClick={exportData}>Export Backup</button>
                <button type="button" className="ghost-btn" onClick={() => importInputRef.current?.click()}>Import Backup</button>
                <button type="button" className="ghost-btn" onClick={undoLastDelete} disabled={!undoAction}>Undo Delete</button>
                <button type="button" className="ghost-btn" onClick={syncToCloudMirror}>Sync Mirror</button>
                <button type="button" className="ghost-btn" onClick={importCloudMirror}>Restore Mirror</button>
                <button type="button" className="ghost-btn danger" onClick={clearAllData}>Reset Tracker</button>
              </div>
              <input ref={importInputRef} type="file" accept="application/json" onChange={importData} className="hidden-input" />
            </article>
            <article className="card">
              <h2>Alert Controls</h2>
              <p className="muted">Desktop reminders help maintain routine while on shift.</p>
              <div className="utility-row">
                <button type="button" className="btn" onClick={requestDesktopAlerts}>Enable Alerts</button>
              </div>
            </article>
          </section>
        )}

        {activeTab === 'lift-examples' && (
          <LiftExamplesPanel
            filteredLiftExamples={filteredLiftExamples}
            liftExampleQuery={liftExampleQuery}
            setLiftExampleQuery={setLiftExampleQuery}
          />
        )}
        </main>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
