import React from 'react';
import { FiActivity, FiBell, FiCpu, FiDroplet, FiSettings, FiShield, FiTarget, FiTrendingUp } from 'react-icons/fi';
import DashboardHeroCard from './DashboardHeroCard';
import MetricCard from './MetricCard';
import ActionPanel from './ActionPanel';
import SectionHeader from './SectionHeader';
import TacticalBackground from './TacticalBackground';

// 1) Layout hierarchy
const LAYOUT_HIERARCHY = ['header-strip', 'hero-status-panel', 'quick-metrics-row', 'primary-action-panels', 'summary-activity'];
// 2) Reusable component system
const COMPONENT_SYSTEM = ['DashboardHeroCard', 'MetricCard', 'ActionPanel', 'SectionHeader', 'TacticalBackground', 'GlassCardModifier'];
// 3) Color / token system
const COLOR_TOKENS = {
  bg: '#0B0D10',
  surface: '#11161C',
  panel: 'rgba(255,255,255,0.035)',
  border: 'rgba(255,255,255,0.06)',
  text: '#E6EDF3',
  textSub: '#9AA4AE',
  muted: '#6E7681',
  blue: '#2F6DF6',
  red: '#A52626',
  steel: '#2A3138',
  green: '#2E8B57',
};
// 4) Spacing system
const SPACING_SYSTEM = [4, 8, 12, 16, 20, 24, 32];
// 5) Typography scale
const TYPOGRAPHY_SCALE = {
  hero: '32/1.05',
  section: '20/1.2',
  metric: '28/1',
  label: '12/1.2 uppercase',
  secondary: '14/1.4',
};

export default function HomeDashboard({
  readinessScore,
  latestWeight,
  workoutsCount,
  weeklyDuration,
  workoutVolumeWeek,
  currentRank,
  nextRank,
  pointsToNextRank,
  intensityGuidance,
  dutyMode,
  setActiveTab,
  todayTotals,
  goals,
  recentActivity,
}) {
  void LAYOUT_HIERARCHY;
  void COMPONENT_SYSTEM;
  void COLOR_TOKENS;
  void SPACING_SYSTEM;
  void TYPOGRAPHY_SCALE;

  const readinessStatus = readinessScore >= 85 ? 'success' : readinessScore >= 70 ? 'warning' : 'critical';
  const calorieProgress = goals.calories ? Math.round((todayTotals.calories / goals.calories) * 100) : 0;
  const proteinProgress = goals.protein ? Math.round((todayTotals.protein / goals.protein) * 100) : 0;
  const volumeProgress = Math.min(100, Math.round((workoutVolumeWeek / 7000) * 100));

  return (
    <section className="dashboard-home">
      <TacticalBackground />

      <header className="dashboard-header-strip glass-card">
        <div className="header-left">
          <div className="header-emblem"><FiShield aria-hidden="true" /></div>
          <div>
            <p className="header-eyebrow">Shift Status</p>
            <h2>Ready for Duty</h2>
          </div>
        </div>
        <div className="header-actions" aria-label="Header actions">
          <button type="button" className="icon-btn" onClick={() => setActiveTab('settings')}><FiSettings aria-hidden="true" /></button>
          <button type="button" className="icon-btn" onClick={() => setActiveTab('intel')}><FiBell aria-hidden="true" /></button>
        </div>
      </header>

      <DashboardHeroCard
        readinessScore={readinessScore}
        headline="Mission Readiness"
        subline={`${dutyMode === 'on-duty' ? 'On-duty profile active' : 'Off-duty recovery profile active'} · ${workoutsCount} sessions queued`}
        status={readinessStatus}
        progress={calorieProgress}
        guidance={intensityGuidance}
      />

      <div className="metrics-grid">
        <MetricCard
          label="Macros Today"
          value={`${todayTotals.calories}/${goals.calories || 0}`}
          subtitle={`Protein ${todayTotals.protein}g / ${goals.protein || 0}g`}
          progress={calorieProgress}
          tone="blue"
        />
        <MetricCard
          label="Workout Status"
          value={`${workoutsCount} Sessions`}
          subtitle={`${weeklyDuration} min planned`}
          progress={Math.min(100, Math.round((workoutsCount / Math.max(1, goals.sessionsPerWeek || 1)) * 100))}
          tone="steel"
        />
        <MetricCard
          label="Volume / Recovery"
          value={`${Math.round(workoutVolumeWeek).toLocaleString()} lb`}
          subtitle={`Latest weight ${latestWeight} lb`}
          progress={volumeProgress}
          tone="blue"
        />
      </div>

      <section className="actions-section">
        <SectionHeader eyebrow="Primary Controls" title="Action Panels" right={<span className="section-meta">{currentRank}</span>} />
        <div className="action-stack">
          <ActionPanel
            icon={<FiActivity aria-hidden="true" />}
            title="Start Workout"
            subtitle="Launch training plan and performance log"
            badge="Ready"
            onClick={() => setActiveTab('workouts')}
            tone="blue"
          />
          <ActionPanel
            icon={<FiTarget aria-hidden="true" />}
            title="Log Macros"
            subtitle={`Protein progress ${Math.max(0, proteinProgress)}%`}
            badge="Updated"
            onClick={() => setActiveTab('macro')}
            tone="steel"
          />
          <ActionPanel
            icon={<FiCpu aria-hidden="true" />}
            title="AI Assistant"
            subtitle="Open intel board for recommendations"
            badge="Standby"
            onClick={() => setActiveTab('intel')}
            tone="blue"
          />
        </div>
      </section>

      <section className="summary-grid">
        <div className="glass-card summary-card">
          <SectionHeader eyebrow="Today" title="Recent Activity" right={<FiTrendingUp aria-hidden="true" />} />
          <ul className="activity-list">
            {recentActivity.length === 0 && <li><span className="activity-dot" />No activity logged yet.</li>}
            {recentActivity.map((item, idx) => (
              <li key={`${item.label}-${item.date}-${idx}`}>
                <span className="activity-dot" />
                <div>
                  <p>{item.label}</p>
                  <small>{item.date}</small>
                </div>
                <strong>{item.detail}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card summary-card muted-panel">
          <SectionHeader eyebrow="Command Summary" title="Operational Notes" right={<FiDroplet aria-hidden="true" />} />
          <ul className="summary-list">
            <li>Current rank: <strong>{currentRank}</strong></li>
            <li>Next rank: <strong>{nextRank}</strong></li>
            <li>Points to promotion: <strong>{pointsToNextRank}</strong></li>
            <li>Macros completion: <strong>{Math.max(0, calorieProgress)}%</strong></li>
          </ul>
        </div>
      </section>
    </section>
  );
}
