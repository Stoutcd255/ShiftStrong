import React from 'react';
import GlassCardModifier from './GlassCardModifier';

export default function MetricCard({ label, value, subtitle, progress = 0, tone = 'blue' }) {
  const bounded = Math.max(0, Math.min(100, progress));
  return (
    <GlassCardModifier className={`metric-card tone-${tone}`}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-subtitle">{subtitle}</p>
      <div className="metric-progress-track" aria-hidden="true">
        <span className="metric-progress-fill" style={{ width: `${bounded}%` }} />
      </div>
    </GlassCardModifier>
  );
}
