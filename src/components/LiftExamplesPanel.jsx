import React from 'react';

export default function LiftExamplesPanel({
  filteredLiftExamples,
  liftExampleQuery,
  setLiftExampleQuery,
}) {
  return (
    <section className="card">
      <h2>Lifting Examples + Tactical Cues ({filteredLiftExamples.length})</h2>
      <label>
        Search Lifting Examples
        <input
          type="text"
          placeholder="Search lift name, focus, or cue"
          value={liftExampleQuery}
          onChange={(e) => setLiftExampleQuery(e.target.value)}
        />
      </label>
      <div className="lift-grid">
        {filteredLiftExamples.length === 0 && <p>No lifting examples match your search.</p>}
        {filteredLiftExamples.slice(0, 200).map((lift) => (
          <article key={lift.name} className="lift-card">
            <h3>{lift.name}</h3>
            <p><strong>Focus:</strong> {lift.focus}</p>
            <p><strong>Cue:</strong> {lift.cue}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
