import React from 'react';

export default function GlassCardModifier({ className = '', children }) {
  return <div className={`glass-card ${className}`.trim()}>{children}</div>;
}
