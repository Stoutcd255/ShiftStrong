import React from 'react';
import GlassCardModifier from './GlassCardModifier';

export default function DashboardHeroCard({ readinessScore, headline, subline, status, progress, guidance }) {
  const bounded = Math.max(0, Math.min(100, progress));

  return (
    <GlassCardModifier className="hero-card tone-blue">
      <div className="hero-top">
        <div>
          <p className="hero-eyebrow">Operational Readiness</p>
          <h2>{headline}</h2>
          <p className="hero-subline">{subline}</p>
        </div>
        <div className="hero-ring" style={{ '--hero-progress': `${bounded}%` }}>
          <div>
            <strong>{readinessScore}</strong>
            <span>SCORE</span>
          </div>
        </div>
      </div>

      <div className="hero-status-row">
        <span className={`status-pill ${status}`}>{status.toUpperCase()}</span>
        <p>{guidance}</p>
      </div>

      <div className="hero-meter" aria-hidden="true">
        <span style={{ width: `${bounded}%` }} />
      </div>
    </GlassCardModifier>
  );
}
