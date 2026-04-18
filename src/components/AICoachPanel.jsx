import React from 'react';

export default function AICoachPanel({ aiMessages, aiInput, setAiInput, aiBusy, askAssistant, aiContext }) {
  return (
    <section className="grid two-col">
      <article className="card">
        <h2>AI Coach</h2>
        <p className="muted">Ask for tactical training plans, macro adjustments, recovery guidance, and weekly strategy.</p>
        <div className="ai-thread">
          {aiMessages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`ai-message ${message.role}`}>
              <strong>{message.role === 'assistant' ? 'Coach' : 'You'}:</strong> {message.content}
            </div>
          ))}
        </div>
        <div className="ai-compose">
          <textarea
            rows="4"
            placeholder="Example: Build a 4-day strength plan for this week based on my readiness."
            value={aiInput}
            onChange={(event) => setAiInput(event.target.value)}
          />
          <button type="button" className="btn" onClick={askAssistant} disabled={aiBusy}>
            {aiBusy ? 'Thinking...' : 'Ask AI Coach'}
          </button>
        </div>
      </article>
      <article className="card">
        <h2>AI Context Preview</h2>
        <p className="muted">This summarized data is sent with each question so answers are personalized to your logs.</p>
        <pre className="ai-context">{JSON.stringify(aiContext, null, 2)}</pre>
      </article>
    </section>
  );
}
