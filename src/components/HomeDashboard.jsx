import React from 'react';
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

export default function HomeDashboard({
  heroMetric,
  dashboardRange,
  setDashboardRange,
  dashboardTrendData,
  readinessScore,
  latestWeight,
  workoutsCount,
  workoutVolumeWeek,
  weeklyDuration,
  currentRank,
  recentActivity,
  goalCompletion,
  intensityGuidance,
  pointsToNextRank,
  nextRank,
  dutyMode,
  setActiveTab,
  readinessSignal,
  macroSignal,
  volumeSignal,
}) {
  return (
    <section className="ops-layout">
      <article className="ops-panel">
        <header className="ops-header-row">
          <span className="ops-icon">◀</span>
          <p>Daily Ops</p>
          <span className="ops-icon">⌁</span>
        </header>
        <p className="ops-hero-number">{heroMetric.toLocaleString()}</p>
        <p className="ops-support">Calories logged today</p>
        <div className="ops-segmented" role="tablist" aria-label="Trend range">
          {['7', '14', '30', '90'].map((range) => (
            <button key={range} type="button" className={dashboardRange === range ? 'active' : ''} onClick={() => setDashboardRange(range)}>
              {range}d
            </button>
          ))}
        </div>
        <div className="ops-chart-card">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={dashboardTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,155,60,0.12)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#9aa3ad" />
              <Tooltip />
              <Bar dataKey="calories" radius={[8, 8, 0, 0]} barSize={8}>
                {dashboardTrendData.map((entry, index) => (
                  <Cell key={`${entry.date}-${index}`} fill={index === dashboardTrendData.length - 1 ? '#c89b3c' : '#2b6fff'} fillOpacity={index === dashboardTrendData.length - 1 ? 0.95 : 0.55} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="muted">Readiness {readinessScore} · Weight {latestWeight} lb · Sessions {workoutsCount}</p>
      </article>

      <article className="ops-panel">
        <header className="ops-header-row">
          <span className="ops-icon">◀</span>
          <p>Intel Log</p>
          <span className="ops-icon">◎</span>
        </header>
        <div className="ops-metrics-row">
          <div><strong>{Math.round(workoutVolumeWeek).toLocaleString()}</strong><span>7d Volume</span></div>
          <div><strong>{weeklyDuration}</strong><span>Planned Min</span></div>
          <div><strong>{currentRank}</strong><span>Current Rank</span></div>
        </div>
        <div className="ops-chart-card medium">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dashboardTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,155,60,0.1)" />
              <XAxis dataKey="date" hide />
              <YAxis stroke="#9aa3ad" />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#c89b3c" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ul className="ops-activity-list">
          {recentActivity.length === 0 && <li><span>•</span><p>No activity yet.</p><strong>--</strong></li>}
          {recentActivity.map((item, idx) => (
            <li key={`${item.label}-${item.date}-${idx}`}>
              <span>●</span>
              <p>{item.label}</p>
              <strong>{item.detail}</strong>
            </li>
          ))}
        </ul>
      </article>

      <article className="ops-panel">
        <header className="ops-header-row">
          <span className="ops-icon">◀</span>
          <p>Mission Goal</p>
          <span className="ops-icon">⌂</span>
        </header>
        <div className="goal-ring-wrap">
          <div className="goal-ring" style={{ '--goal-pct': `${goalCompletion}%` }}>
            <div>
              <strong>{goalCompletion}%</strong>
              <span>Calorie Goal</span>
            </div>
          </div>
        </div>
        <p className="guidance">{intensityGuidance}</p>
        <p className="muted">{pointsToNextRank} points to {nextRank}. Duty mode: {dutyMode === 'on-duty' ? 'On-Duty' : 'Off-Duty'}.</p>
        <div className="stack-actions">
          <button type="button" className="btn" onClick={() => setActiveTab('macro')}>Log Intake</button>
          <button type="button" className="ghost-btn" onClick={() => setActiveTab('workouts')}>Begin Session</button>
        </div>
        <div className="signal-row">
          <span className={`signal-pill ${readinessSignal}`}>Readiness</span>
          <span className={`signal-pill ${macroSignal}`}>Macros</span>
          <span className={`signal-pill ${volumeSignal}`}>Load</span>
        </div>
      </article>
    </section>
  );
}
