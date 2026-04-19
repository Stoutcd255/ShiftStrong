import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ranges = ['Day', 'Week', 'Month', 'Year'];

function MobileHeader({ title }) {
  return (
    <header className="mobile-header-row">
      <button type="button" className="mobile-icon-btn" aria-label="Back">←</button>
      <h3>{title}</h3>
      <button type="button" className="mobile-icon-btn" aria-label="Options">⋯</button>
    </header>
  );
}

function Segmented({ value, onChange }) {
  return (
    <div className="mobile-segmented" role="tablist" aria-label="Time range">
      {ranges.map((range) => (
        <button
          key={range}
          type="button"
          className={value === range ? 'active' : ''}
          onClick={() => onChange(range)}
        >
          {range}
        </button>
      ))}
    </div>
  );
}

export default function MobileFitnessScreens({ todayTotals, goals, trendData, complianceData, exerciseLogs, workouts }) {
  const [screen, setScreen] = useState('overview');
  const [range, setRange] = useState('Week');

  const barData = useMemo(() => {
    const source = range === 'Day' ? complianceData.slice(-12) : range === 'Week' ? complianceData.slice(-14) : range === 'Month' ? complianceData.slice(-30) : complianceData;
    return source.map((row) => ({
      date: row.date.slice(5),
      score: row.score,
    }));
  }, [complianceData, range]);

  const lineData = useMemo(() => trendData.slice(-24).map((row) => ({ date: row.date.slice(5), volume: Math.round(row.volume || 0), calories: Math.round(row.calories || 0) })), [trendData]);

  const goalPct = goals.calories ? Math.max(0, Math.min(100, Math.round((todayTotals.calories / goals.calories) * 100))) : 0;

  const history = useMemo(() => exerciseLogs.slice(0, 5), [exerciseLogs]);

  return (
    <section className="mobile-suite card full-width">
      <div className="mobile-screen-switcher" role="tablist" aria-label="Mobile screens">
        <button type="button" className={screen === 'overview' ? 'active' : ''} onClick={() => setScreen('overview')}>Daily</button>
        <button type="button" className={screen === 'insights' ? 'active' : ''} onClick={() => setScreen('insights')}>Insights</button>
        <button type="button" className={screen === 'goals' ? 'active' : ''} onClick={() => setScreen('goals')}>Goals</button>
      </div>

      {screen === 'overview' && (
        <article className="mobile-frame">
          <MobileHeader title="Daily Stats" />
          <p className="mobile-hero-metric">{todayTotals.calories}</p>
          <p className="mobile-hero-label">Total Calories Logged</p>
          <Segmented value={range} onChange={setRange} />
          <div className="mobile-chart-card tall">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={3}>
                <CartesianGrid vertical={false} stroke="rgba(154,163,173,0.12)" />
                <XAxis dataKey="date" tick={{ fill: '#9AA3AD', fontSize: 10 }} />
                <YAxis hide domain={[0, 3]} />
                <Tooltip cursor={false} contentStyle={{ borderRadius: 14, border: '1px solid rgba(200,155,60,0.55)', background: '#1A1D24', color: '#E6EAF0' }} />
                <Bar dataKey="score" radius={[10, 10, 0, 0]} barSize={10}>
                  {barData.map((entry, idx) => <Cell key={`${entry.date}-${idx}`} fill={idx === barData.length - 1 ? '#C89B3C' : '#1F2A44'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mobile-footnote">{workouts.length} active training blocks this cycle.</p>
        </article>
      )}

      {screen === 'insights' && (
        <article className="mobile-frame">
          <MobileHeader title="Insights History" />
          <h4 className="mobile-section-title">Performance Insights</h4>
          <div className="mobile-mini-stats">
            <div><strong>{Math.round(todayTotals.protein)}</strong><span>Protein</span></div>
            <div><strong>{Math.round(todayTotals.carbs)}</strong><span>Carbs</span></div>
            <div><strong>{Math.round(todayTotals.fats)}</strong><span>Fats</span></div>
          </div>
          <div className="mobile-chart-card">
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={lineData}>
                <CartesianGrid vertical={false} stroke="rgba(154,163,173,0.08)" />
                <XAxis dataKey="date" tick={{ fill: '#9AA3AD', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(200,155,60,0.45)', background: '#1A1D24', color: '#E6EAF0' }} />
                <Line type="monotone" dataKey="volume" stroke="#C89B3C" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mobile-history-list">
            {history.map((entry) => (
              <div key={entry.id} className="mobile-history-item">
                <span className="mobile-history-icon">▣</span>
                <span>{entry.name}</span>
                <strong>{entry.sets}x{entry.reps}</strong>
              </div>
            ))}
          </div>
        </article>
      )}

      {screen === 'goals' && (
        <article className="mobile-frame">
          <MobileHeader title="Goal Progress" />
          <div className="mobile-goal-ring" style={{ '--pct': `${goalPct}%` }}>
            <div className="mobile-goal-ring-inner">
              <strong>{goalPct}%</strong>
              <span>Calorie Target</span>
            </div>
          </div>
          <p className="mobile-goal-message">Stay disciplined—your consistency is building operational endurance.</p>
          <p className="mobile-footnote">{Math.max(0, goals.calories - todayTotals.calories)} calories remaining to reach today&apos;s goal.</p>
          <div className="mobile-goal-actions">
            <button type="button" className="btn">Log Intake</button>
            <button type="button" className="ghost-btn">Begin Session</button>
          </div>
        </article>
      )}
    </section>
  );
}
