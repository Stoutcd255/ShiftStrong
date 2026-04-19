export const STORAGE_KEY = 'shiftstrong-state-v4';
export const STORAGE_BACKUP_KEY = 'shiftstrong-state-v4-backup';
export const CLOUD_MIRROR_KEY = 'shiftstrong-cloud-mirror-v1';
export const STORAGE_VERSION = 4;
export const FALLBACK_DATE = () => new Date().toISOString().slice(0, 10);

export const tabs = [
  { id: 'home', label: 'Command Center' },
  { id: 'weight-log', label: 'Weight Log' },
  { id: 'macro', label: 'Macro Tracker' },
  { id: 'workouts', label: 'Workout Planner' },
  { id: 'nutrition', label: 'Meal Builder' },
  { id: 'intel', label: 'Intel + Trends' },
  { id: 'mobile-hud', label: 'Mobile HUD' },
  { id: 'settings', label: 'Settings' },
  { id: 'lift-examples', label: 'Lift Examples' },
];

export const defaultState = {
  weightLogs: [
    { id: 'w-1', date: '2026-04-01', weight: 194.1 },
    { id: 'w-2', date: '2026-03-31', weight: 194.5 },
  ],
  macroLogs: [],
  workouts: [
    { id: 'wk-1', day: 'Monday', mission: 'Lower Body Strength', duration: 60 },
    { id: 'wk-2', day: 'Wednesday', mission: 'Conditioning + Core', duration: 45 },
  ],
  exerciseLogs: [],
  templates: [
    { id: 'tpl-1', name: 'Patrol Strength', day: 'Thursday', mission: 'Compound Lifts + Carry', duration: 55 },
    { id: 'tpl-2', name: 'Night Shift Conditioning', day: 'Saturday', mission: 'Intervals + Mobility', duration: 40 },
  ],
  foodLibrary: [
    { id: 'food-1', name: 'Chicken Breast 6oz', protein: 50, carbs: 0, fats: 3 },
    { id: 'food-2', name: 'Cooked Rice 1 cup', protein: 4, carbs: 45, fats: 0 },
  ],
  mealLogs: [],
  readinessLogs: [],
  goals: {
    targetWeight: 188,
    weeklyWeightChange: -0.6,
    protein: 190,
    carbs: 220,
    fats: 70,
    calories: 2300,
    sessionsPerWeek: 4,
  },
  periodization: {
    phase: 'Strength',
    week: 1,
    totalWeeks: 4,
  },
  reminders: [
    { id: 'r-1', time: '07:00', message: 'Log morning bodyweight.', enabled: true },
    { id: 'r-2', time: '21:00', message: 'Finish macro entry before end of shift.', enabled: true },
  ],
};

const liftExampleSeeds = [
  { name: 'Back Squat', focus: 'Power', cue: 'Brace hard, root your feet, and drive up with control.' },
  { name: 'Bench Press', focus: 'Upper Body', cue: 'Pin shoulder blades down, keep wrists stacked, explode up.' },
  { name: 'Deadlift', focus: 'Posterior Chain', cue: 'Pull slack, squeeze lats, push floor away every rep.' },
  { name: 'Overhead Press', focus: 'Shoulders + Core', cue: 'Glutes tight, ribs down, punch the bar straight overhead.' },
  { name: 'Barbell Row', focus: 'Back Strength', cue: 'Hinge stable, pull elbows to pockets, pause at top.' },
  { name: 'Bulgarian Split Squat', focus: 'Single-Leg Stability', cue: 'Stay tall, own the bottom, drive through front heel.' },
];

const trainingBlocks = [
  'Hypertrophy Block',
  'Strength Block',
  'Peak Block',
  'Deload Block',
  'Conditioning Block',
];

export const liftExamples = Array.from({ length: 25 }, (_, idx) => {
  const block = trainingBlocks[idx % trainingBlocks.length];
  const intensity = 60 + (idx % 6) * 5;
  const repRange = [5, 6, 8, 10, 12][idx % 5];

  return liftExampleSeeds.map((lift) => ({
    name: `${lift.name} • ${block} W${idx + 1}`,
    focus: `${lift.focus} | ${intensity}% effort`,
    cue: `${lift.cue} Suggested scheme: ${4 + (idx % 2)}x${repRange}.`,
  }));
}).flat();

const macroExampleSeeds = [
  { plan: 'Cutting Day', protein: 210, carbs: 170, fats: 55 },
  { plan: 'Maintenance Day', protein: 190, carbs: 230, fats: 70 },
  { plan: 'High Output Day', protein: 200, carbs: 300, fats: 65 },
  { plan: 'Night Shift Recovery', protein: 195, carbs: 200, fats: 75 },
  { plan: 'Low Carb Day', protein: 220, carbs: 130, fats: 85 },
  { plan: 'Deload Day', protein: 180, carbs: 180, fats: 70 },
];

export const macroExamples = Array.from({ length: 25 }, (_, idx) => {
  const delta = (idx % 5) * 10;
  return macroExampleSeeds.map((seed) => {
    const protein = Math.max(120, seed.protein + (idx % 2 === 0 ? delta : -delta));
    const carbs = Math.max(80, seed.carbs + ((idx + 2) % 3 === 0 ? 20 : -10));
    const fats = Math.max(40, seed.fats + ((idx + 1) % 4 === 0 ? 8 : -4));
    const calories = protein * 4 + carbs * 4 + fats * 9;

    return {
      id: `macro-example-${idx + 1}-${seed.plan.replace(/\s+/g, '-').toLowerCase()}`,
      plan: `${seed.plan} • Cycle ${idx + 1}`,
      protein,
      carbs,
      fats,
      calories,
    };
  });
}).flat();

export const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const isValidTime = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

export const newId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

export function normalizeState(raw) {
  const safe = raw && typeof raw === 'object' ? raw : {};

  const cleanWeight = Array.isArray(safe.weightLogs)
    ? safe.weightLogs.map((entry) => ({
      id: String(entry?.id ?? `w-${newId()}`),
      date: isValidDate(entry?.date) ? entry.date : FALLBACK_DATE(),
      weight: Number(toNumber(entry?.weight).toFixed(1)),
    })).filter((entry) => entry.weight > 0 && entry.weight < 1400).sort((a, b) => b.date.localeCompare(a.date))
    : defaultState.weightLogs;

  const cleanMacros = Array.isArray(safe.macroLogs)
    ? safe.macroLogs.map((entry) => {
      const protein = Math.max(0, Math.round(toNumber(entry?.protein)));
      const carbs = Math.max(0, Math.round(toNumber(entry?.carbs)));
      const fats = Math.max(0, Math.round(toNumber(entry?.fats)));
      return {
        id: String(entry?.id ?? `m-${newId()}`),
        date: isValidDate(entry?.date) ? entry.date : FALLBACK_DATE(),
        protein,
        carbs,
        fats,
        calories: protein * 4 + carbs * 4 + fats * 9,
      };
    }).filter((entry) => entry.protein + entry.carbs + entry.fats > 0).sort((a, b) => b.date.localeCompare(a.date))
    : defaultState.macroLogs;

  const cleanWorkouts = Array.isArray(safe.workouts)
    ? safe.workouts.map((entry) => ({
      id: String(entry?.id ?? `wk-${newId()}`),
      day: String(entry?.day ?? '').trim().slice(0, 24),
      mission: String(entry?.mission ?? '').trim().slice(0, 80),
      duration: Math.round(toNumber(entry?.duration)),
    })).filter((entry) => entry.day && entry.mission && entry.duration > 0 && entry.duration <= 360)
    : defaultState.workouts;

  const cleanExercises = Array.isArray(safe.exerciseLogs)
    ? safe.exerciseLogs.map((entry) => ({
      id: String(entry?.id ?? `ex-${newId()}`),
      date: isValidDate(entry?.date) ? entry.date : FALLBACK_DATE(),
      name: String(entry?.name ?? '').trim().slice(0, 60),
      sets: Math.max(0, Math.round(toNumber(entry?.sets))),
      reps: Math.max(0, Math.round(toNumber(entry?.reps))),
      load: Math.max(0, Number(toNumber(entry?.load).toFixed(1))),
      rpe: Math.max(0, Math.min(10, Number(toNumber(entry?.rpe).toFixed(1)))),
    })).filter((entry) => entry.name && entry.sets > 0 && entry.reps > 0).sort((a, b) => b.date.localeCompare(a.date))
    : defaultState.exerciseLogs;

  const cleanTemplates = Array.isArray(safe.templates)
    ? safe.templates.map((entry) => ({
      id: String(entry?.id ?? `tpl-${newId()}`),
      name: String(entry?.name ?? '').trim().slice(0, 40),
      day: String(entry?.day ?? '').trim().slice(0, 24),
      mission: String(entry?.mission ?? '').trim().slice(0, 80),
      duration: Math.max(1, Math.min(360, Math.round(toNumber(entry?.duration)))),
    })).filter((entry) => entry.name && entry.day && entry.mission)
    : defaultState.templates;

  const cleanFoods = Array.isArray(safe.foodLibrary)
    ? safe.foodLibrary.map((entry) => ({
      id: String(entry?.id ?? `food-${newId()}`),
      name: String(entry?.name ?? '').trim().slice(0, 60),
      protein: Math.max(0, Math.round(toNumber(entry?.protein))),
      carbs: Math.max(0, Math.round(toNumber(entry?.carbs))),
      fats: Math.max(0, Math.round(toNumber(entry?.fats))),
    })).filter((entry) => entry.name)
    : defaultState.foodLibrary;

  const cleanMeals = Array.isArray(safe.mealLogs)
    ? safe.mealLogs.map((entry) => ({
      id: String(entry?.id ?? `meal-${newId()}`),
      date: isValidDate(entry?.date) ? entry.date : FALLBACK_DATE(),
      name: String(entry?.name ?? '').trim().slice(0, 60),
      protein: Math.max(0, Math.round(toNumber(entry?.protein))),
      carbs: Math.max(0, Math.round(toNumber(entry?.carbs))),
      fats: Math.max(0, Math.round(toNumber(entry?.fats))),
    })).filter((entry) => entry.name)
    : defaultState.mealLogs;

  const cleanReadiness = Array.isArray(safe.readinessLogs)
    ? safe.readinessLogs.map((entry) => ({
      id: String(entry?.id ?? `ready-${newId()}`),
      date: isValidDate(entry?.date) ? entry.date : FALLBACK_DATE(),
      sleep: Math.max(0, Math.min(14, Number(toNumber(entry?.sleep).toFixed(1)))),
      soreness: Math.max(1, Math.min(10, Math.round(toNumber(entry?.soreness)))),
      stress: Math.max(1, Math.min(10, Math.round(toNumber(entry?.stress)))),
      restingHR: Math.max(30, Math.min(180, Math.round(toNumber(entry?.restingHR)))),
    })).sort((a, b) => b.date.localeCompare(a.date))
    : defaultState.readinessLogs;

  const goals = {
    targetWeight: Number(toNumber(safe?.goals?.targetWeight || defaultState.goals.targetWeight).toFixed(1)),
    weeklyWeightChange: Number(toNumber(safe?.goals?.weeklyWeightChange || defaultState.goals.weeklyWeightChange).toFixed(1)),
    protein: Math.max(0, Math.round(toNumber(safe?.goals?.protein || defaultState.goals.protein))),
    carbs: Math.max(0, Math.round(toNumber(safe?.goals?.carbs || defaultState.goals.carbs))),
    fats: Math.max(0, Math.round(toNumber(safe?.goals?.fats || defaultState.goals.fats))),
    calories: Math.max(0, Math.round(toNumber(safe?.goals?.calories || defaultState.goals.calories))),
    sessionsPerWeek: Math.max(1, Math.min(14, Math.round(toNumber(safe?.goals?.sessionsPerWeek || defaultState.goals.sessionsPerWeek)))),
  };

  const periodization = {
    phase: String(safe?.periodization?.phase || defaultState.periodization.phase),
    week: Math.max(1, Math.min(12, Math.round(toNumber(safe?.periodization?.week || defaultState.periodization.week)))),
    totalWeeks: Math.max(1, Math.min(12, Math.round(toNumber(safe?.periodization?.totalWeeks || defaultState.periodization.totalWeeks)))),
  };

  const reminders = Array.isArray(safe.reminders)
    ? safe.reminders.map((entry) => ({
      id: String(entry?.id ?? `r-${newId()}`),
      time: isValidTime(entry?.time) ? entry.time : '08:00',
      message: String(entry?.message ?? '').trim().slice(0, 120),
      enabled: Boolean(entry?.enabled),
    })).filter((entry) => entry.message)
    : defaultState.reminders;

  return { weightLogs: cleanWeight, macroLogs: cleanMacros, workouts: cleanWorkouts, exerciseLogs: cleanExercises, templates: cleanTemplates, foodLibrary: cleanFoods, mealLogs: cleanMeals, readinessLogs: cleanReadiness, goals, periodization, reminders };
}

export function deserializeEnvelope(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    return normalizeState(parsed?.state ?? parsed);
  } catch {
    return normalizeState(defaultState);
  }
}

export function loadState() {
  try {
    const main = window.localStorage.getItem(STORAGE_KEY);
    if (main) return { state: deserializeEnvelope(main), recoveredFromBackup: false };
  } catch {
    // fallback path below
  }

  try {
    const backup = window.localStorage.getItem(STORAGE_BACKUP_KEY);
    if (backup) return { state: deserializeEnvelope(backup), recoveredFromBackup: true };
  } catch {
    // ignore
  }

  return { state: defaultState, recoveredFromBackup: false };
}

export function getReadinessScore(entry) {
  const sleepScore = Math.min(100, (entry.sleep / 8) * 35);
  const sorenessScore = ((11 - entry.soreness) / 10) * 30;
  const stressScore = ((11 - entry.stress) / 10) * 25;
  const hrScore = entry.restingHR <= 60 ? 10 : Math.max(0, 10 - (entry.restingHR - 60) * 0.35);
  return Math.round(sleepScore + sorenessScore + stressScore + hrScore);
}
