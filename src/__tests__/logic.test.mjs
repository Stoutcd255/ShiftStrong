import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeState,
  getReadinessScore,
  deserializeEnvelope,
  loadState,
  isValidDate,
  isValidTime,
  macroExamples,
  liftExamples,
  selectTrendRange,
  buildRecentActivity,
} from '../lib/logic.js';

test('normalizeState filters invalid weight entries', () => {
  const state = normalizeState({
    weightLogs: [
      { id: 'ok', date: '2026-01-01', weight: 200 },
      { id: 'bad1', date: '2026-01-02', weight: -1 },
      { id: 'bad2', date: 'bad-date', weight: 190 },
    ],
  });

  assert.equal(state.weightLogs.length, 2);
  assert.ok(state.weightLogs.some((entry) => entry.date === '2026-01-01'));
});

test('deserializeEnvelope supports wrapped state payload', () => {
  const payload = JSON.stringify({
    version: 4,
    state: {
      macroLogs: [{ id: 'm1', date: '2026-04-01', protein: 200, carbs: 220, fats: 70 }],
    },
  });

  const state = deserializeEnvelope(payload);
  assert.equal(state.macroLogs.length, 1);
  assert.equal(state.macroLogs[0].calories, 2310);
});

test('deserializeEnvelope returns safe defaults for malformed json', () => {
  const state = deserializeEnvelope('{"broken":');
  assert.ok(Array.isArray(state.weightLogs));
  assert.ok(Array.isArray(state.workouts));
});

test('getReadinessScore returns bounded positive score', () => {
  const score = getReadinessScore({ sleep: 8, soreness: 3, stress: 3, restingHR: 56 });
  assert.ok(score >= 80);

  const lowScore = getReadinessScore({ sleep: 2, soreness: 9, stress: 9, restingHR: 92 });
  assert.ok(lowScore < score);
});

test('isValidDate and isValidTime enforce real calendar/time values', () => {
  assert.equal(isValidDate('2026-02-28'), true);
  assert.equal(isValidDate('2026-02-30'), false);
  assert.equal(isValidTime('09:30'), true);
  assert.equal(isValidTime('24:15'), false);
});

test('expands macro and lifting examples by 25x', () => {
  assert.equal(macroExamples.length, 150);
  assert.equal(liftExamples.length, 150);
});

test('loadState returns normalized defaults when primary storage is malformed', () => {
  const mainPayload = '{"corrupt":';
  const backupPayload = JSON.stringify({
    state: {
      macroLogs: [{ id: 'm2', date: '2026-04-02', protein: 180, carbs: 210, fats: 60 }],
    },
  });

  global.window = {
    localStorage: {
      getItem(key) {
        if (key.includes('backup')) return backupPayload;
        return mainPayload;
      },
    },
  };

  const loaded = loadState();
  assert.equal(loaded.recoveredFromBackup, false);
  assert.equal(loaded.state.macroLogs.length, 0);
});

test('selectTrendRange returns bounded recent entries', () => {
  const trend = Array.from({ length: 40 }, (_, i) => ({ date: `2026-04-${String(i + 1).padStart(2, '0')}`, calories: i + 100 }));
  assert.equal(selectTrendRange(trend, 7).length, 7);
  assert.equal(selectTrendRange(trend, 999).length, 40);
  assert.equal(selectTrendRange(trend, 0).length, 30);
});

test('buildRecentActivity aggregates and sorts latest entries', () => {
  const activity = buildRecentActivity({
    weightLogs: [{ date: '2026-04-10', weight: 200 }],
    macroLogs: [{ date: '2026-04-11', calories: 2300 }],
    workouts: [{ day: 'Mon', duration: 60 }],
    exerciseLogs: [{ date: '2026-04-12', name: 'Back Squat', sets: 4, reps: 5, load: 225 }],
    fallbackDate: '2026-04-09',
  });

  assert.equal(activity.length, 4);
  assert.equal(activity[0].date, '2026-04-12');
  assert.equal(activity[0].label, 'Back Squat');
});
