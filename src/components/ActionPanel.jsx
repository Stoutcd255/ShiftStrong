import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import GlassCardModifier from './GlassCardModifier';

export default function ActionPanel({ icon, title, subtitle, badge, onClick, tone = 'blue' }) {
  return (
    <button type="button" className="action-panel-button" onClick={onClick}>
      <GlassCardModifier className={`action-panel tone-${tone}`}>
        <div className="action-icon-wrap">{icon}</div>
        <div>
          <p className="action-title">{title}</p>
          <p className="action-subtitle">{subtitle}</p>
        </div>
        <div className="action-trailing">
          {badge && <span className="action-badge">{badge}</span>}
          <FiChevronRight aria-hidden="true" />
        </div>
      </GlassCardModifier>
    </button>
  );
}
