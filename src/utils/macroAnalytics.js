const nutrientKeys = ["protein", "carbs", "fats"];

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const numericFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const defaultMacroTargets = {
  protein: 205,
  carbs: 230,
  fats: 72,
  calories: 2400,
};

export const defaultMacroHistory = [
  { date: "2024-07-01T12:00:00.000Z", protein: 188, carbs: 218, fats: 68, calories: 2320 },
  { date: "2024-07-02T12:00:00.000Z", protein: 192, carbs: 226, fats: 74, calories: 2395 },
  { date: "2024-07-03T12:00:00.000Z", protein: 204, carbs: 234, fats: 70, calories: 2410 },
  { date: "2024-07-04T12:00:00.000Z", protein: 210, carbs: 240, fats: 76, calories: 2475 },
  { date: "2024-07-05T12:00:00.000Z", protein: 199, carbs: 228, fats: 69, calories: 2360 },
  { date: "2024-07-06T12:00:00.000Z", protein: 208, carbs: 238, fats: 73, calories: 2440 },
  { date: "2024-07-07T12:00:00.000Z", protein: 214, carbs: 242, fats: 71, calories: 2455 },
];

export const normalizeDateKey = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

export const getDayLabel = (date) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Day";
  }

  return dayFormatter.format(parsed);
};

export const upsertMacroEntry = (history, entry) => {
  const nextHistory = Array.isArray(history) ? [...history] : [];
  const normalizedDate = normalizeDateKey(entry.date || new Date().toISOString());

  if (!normalizedDate) {
    return nextHistory;
  }

  const hydratedEntry = {
    protein: Number.isFinite(entry.protein) ? Math.round(entry.protein) : 0,
    carbs: Number.isFinite(entry.carbs) ? Math.round(entry.carbs) : 0,
    fats: Number.isFinite(entry.fats) ? Math.round(entry.fats) : 0,
    calories: Number.isFinite(entry.calories) ? Math.round(entry.calories) : undefined,
    date: new Date(`${normalizedDate}T12:00:00.000Z`).toISOString(),
  };

  const filteredHistory = nextHistory.filter(
    (item) => normalizeDateKey(item.date) !== normalizedDate
  );

  return [...filteredHistory, hydratedEntry].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const computeMacroStats = (history, targets = defaultMacroTargets) => {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      latestEntry: null,
      averages: null,
      complianceScore: null,
      deltaFromTargets: null,
    };
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const focusWindow = sortedHistory.slice(-7);

  const aggregates = focusWindow.reduce(
    (totals, entry) => {
      nutrientKeys.forEach((key) => {
        totals[key] += entry[key] || 0;
      });
      totals.calories += entry.calories || 0;
      return totals;
    },
    { protein: 0, carbs: 0, fats: 0, calories: 0 }
  );

  const averages = {
    protein: Math.round(aggregates.protein / focusWindow.length),
    carbs: Math.round(aggregates.carbs / focusWindow.length),
    fats: Math.round(aggregates.fats / focusWindow.length),
    calories: Math.round(aggregates.calories / focusWindow.length),
  };

  const deltaFromTargets = nutrientKeys.reduce((delta, key) => {
    const targetValue = targets[key] || 0;
    const latestValue = focusWindow[focusWindow.length - 1][key] || 0;
    delta[key] = Math.round(latestValue - targetValue);
    return delta;
  }, {});

  const compliance = nutrientKeys.map((key) => {
    const targetValue = targets[key] || 1;
    const averageValue = averages[key] || 0;
    const variance = Math.abs(averageValue - targetValue) / targetValue;
    return Math.max(0, 1 - variance);
  });

  const complianceScore = Math.round(
    (compliance.reduce((sum, value) => sum + value, 0) / compliance.length) * 100
  );

  return {
    latestEntry: sortedHistory[sortedHistory.length - 1],
    averages,
    complianceScore,
    deltaFromTargets,
  };
};

export const formatMacroLine = (label, value, unit = "g") => {
  if (value === null || value === undefined) {
    return `${label}: --`;
  }

  return `${label}: ${numericFormatter.format(value)}${unit}`;
};

export default {
  defaultMacroHistory,
  defaultMacroTargets,
  upsertMacroEntry,
  computeMacroStats,
  formatMacroLine,
  getDayLabel,
};
