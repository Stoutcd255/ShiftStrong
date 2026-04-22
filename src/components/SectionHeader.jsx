import React from 'react';

export default function SectionHeader({ eyebrow, title, right }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h3>{title}</h3>
      </div>
      {right && <div className="section-right">{right}</div>}
    </div>
  );
}
