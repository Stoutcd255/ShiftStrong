import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, getReadinessScore, deserializeEnvelope, macroExamples, liftExamples } from '../lib/logic.js';

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

test('getReadinessScore returns bounded positive score', () => {
  const score = getReadinessScore({ sleep: 8, soreness: 3, stress: 3, restingHR: 56 });
  assert.ok(score >= 80);

  const lowScore = getReadinessScore({ sleep: 2, soreness: 9, stress: 9, restingHR: 92 });
  assert.ok(lowScore < score);
});


test('expands macro and lifting examples by 25x', () => {
  assert.equal(macroExamples.length, 150);
  assert.equal(liftExamples.length, 150);
});
