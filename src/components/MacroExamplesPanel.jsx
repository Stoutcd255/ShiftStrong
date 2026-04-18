import React from 'react';

export default function MacroExamplesPanel({
  filteredMacroExamples,
  macroExampleQuery,
  setMacroExampleQuery,
  applyMacroExample,
}) {
  return (
    <section className="card">
      <h2>Macro Examples ({filteredMacroExamples.length})</h2>
      <label>
        Search Macro Examples
        <input
          type="text"
          placeholder="Search macro plan"
          value={macroExampleQuery}
          onChange={(e) => setMacroExampleQuery(e.target.value)}
        />
      </label>
      <ul className="data-list compact">
        {filteredMacroExamples.length === 0 && <li>No macro examples match your search.</li>}
        {filteredMacroExamples.slice(0, 120).map((example) => (
          <li key={example.id}>
            <span>{example.plan}</span>
            <div className="inline-actions">
              <strong>{example.protein}P/{example.carbs}C/{example.fats}F • {example.calories} cal</strong>
              <button type="button" className="ghost-btn" onClick={() => applyMacroExample(example)}>
                Apply
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
