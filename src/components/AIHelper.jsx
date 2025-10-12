import React, { useMemo, useState } from "react";
import { FaRobot, FaPaperPlane, FaLightbulb, FaBolt } from "react-icons/fa";
import {
  computeMacroStats,
  formatMacroLine,
  getDayLabel,
  upsertMacroEntry,
} from "../utils/macroAnalytics";

const baseSuggestionPresets = [
  "Break down tonight's macros",
  "Log patrol fuel: 45g protein, 65g carbs, 18g fats",
  "Adjust macro targets for a heavy lift night",
];

const normalize = (value) => value.trim().toLowerCase();

const logCommandRegex = /\b(log|record|track|note)\b/i;
const macroValueRegex = /(\d+(?:\.\d+)?)\s*(?:g|grams)?\s*(protein|proteins|carb|carbs|fat|fats)/gi;
const calorieRegex = /(\d+(?:\.\d+)?)\s*(?:cal|calorie|calories|kcal)/i;

const targetCommandRegex = /(set|adjust|update).*(target|macro|macros)/i;

const parseMacroValues = (prompt) => {
  const values = { protein: undefined, carbs: undefined, fats: undefined };
  let match = macroValueRegex.exec(prompt);

  while (match) {
    const amount = Math.round(parseFloat(match[1]));
    const nutrient = match[2].startsWith("prot")
      ? "protein"
      : match[2].startsWith("carb")
      ? "carbs"
      : "fats";
    values[nutrient] = amount;
    match = macroValueRegex.exec(prompt);
  }

  macroValueRegex.lastIndex = 0;

  return values;
};

const parseMacroLogCommand = (prompt, macroHistory, macroTargets) => {
  if (!logCommandRegex.test(prompt)) {
    return null;
  }

  logCommandRegex.lastIndex = 0;

  const values = parseMacroValues(prompt);
  const calorieMatch = calorieRegex.exec(prompt);
  const latestEntry =
    macroHistory && macroHistory.length > 0
      ? macroHistory[macroHistory.length - 1]
      : undefined;

  const resolvedEntry = {
    protein: values.protein ?? latestEntry?.protein ?? macroTargets?.protein ?? 0,
    carbs: values.carbs ?? latestEntry?.carbs ?? macroTargets?.carbs ?? 0,
    fats: values.fats ?? latestEntry?.fats ?? macroTargets?.fats ?? 0,
    calories: calorieMatch
      ? Math.round(parseFloat(calorieMatch[1]))
      : latestEntry?.calories ?? macroTargets?.calories,
  };

  const date = new Date();
  if (/yesterday/i.test(prompt)) {
    date.setDate(date.getDate() - 1);
  } else if (/tomorrow/i.test(prompt)) {
    date.setDate(date.getDate() + 1);
  }

  return {
    entry: {
      ...resolvedEntry,
      date: date.toISOString(),
    },
  };
};

const parseMacroTargetCommand = (prompt, macroTargets) => {
  if (!targetCommandRegex.test(prompt)) {
    return null;
  }

  targetCommandRegex.lastIndex = 0;

  const parsed = parseMacroValues(prompt);
  const updates = {};

  if (Number.isFinite(parsed.protein)) {
    updates.protein = parsed.protein;
  }
  if (Number.isFinite(parsed.carbs)) {
    updates.carbs = parsed.carbs;
  }
  if (Number.isFinite(parsed.fats)) {
    updates.fats = parsed.fats;
  }

  const calorieMatch = calorieRegex.exec(prompt);
  if (calorieMatch) {
    updates.calories = Math.round(parseFloat(calorieMatch[1]));
  }

  calorieRegex.lastIndex = 0;

  if (Object.keys(updates).length === 0) {
    return null;
  }

  return { updates: { ...macroTargets, ...updates } };
};

const buildMacroSummary = (macroStats, macroTargets) => {
  if (!macroStats?.averages) {
    return "No macro history logged yet. Ask me to record a meal to get rolling.";
  }

  const { averages, complianceScore, latestEntry } = macroStats;
  const dayLabel = latestEntry ? getDayLabel(latestEntry.date) : "today";

  return [
    `Targets sit at ${macroTargets.protein}g protein, ${macroTargets.carbs}g carbs, and ${macroTargets.fats}g fats.`,
    `Across the last seven logs you're averaging ${averages.protein}g/${averages.carbs}g/${averages.fats}g (${averages.calories} kcal).`,
    complianceScore
      ? `Compliance is tracking at ${complianceScore}% with ${dayLabel}'s plate already on file.`
      : `${dayLabel}'s plate is the first entry of the week—keep them coming for trend lines.`,
  ].join(" ");
};

const getAssistantResponse = (prompt, officerName, context) => {
  const sanitizedPrompt = normalize(prompt);
  const officerLabel = officerName ? officerName : "Officer";

  if (!sanitizedPrompt) {
    return {
      message: `I can break down macros, prep workouts, or map recovery so you roll into duty ready, ${officerLabel}.`,
    };
  }

  const { macroHistory, macroTargets } = context;
  const macroStats = computeMacroStats(macroHistory, macroTargets);

  const macroLog = parseMacroLogCommand(prompt, macroHistory, macroTargets);
  if (macroLog) {
    const projectedHistory = upsertMacroEntry(macroHistory, macroLog.entry);
    const projectedStats = computeMacroStats(projectedHistory, macroTargets);
    const summary = buildMacroSummary(projectedStats, macroTargets);
    const dayLabel = getDayLabel(macroLog.entry.date);
    return {
      message: `Log secured for ${dayLabel}: ${macroLog.entry.protein}g protein, ${macroLog.entry.carbs}g carbs, ${macroLog.entry.fats}g fats${
        macroLog.entry.calories ? ` (${macroLog.entry.calories} kcal)` : ""
      }. ${summary}`,
      action: { type: "logMacroEntry", payload: macroLog.entry },
    };
  }

  const macroTargetAdjust = parseMacroTargetCommand(prompt, macroTargets);
  if (macroTargetAdjust) {
    const updatedStats = computeMacroStats(macroHistory, macroTargetAdjust.updates);
    const summary = buildMacroSummary(updatedStats, macroTargetAdjust.updates);
    return {
      message: `Targets recalibrated: ${formatMacroLine(
        "Protein",
        macroTargetAdjust.updates.protein
      )}, ${formatMacroLine("Carbs", macroTargetAdjust.updates.carbs)}, ${formatMacroLine(
        "Fats",
        macroTargetAdjust.updates.fats
      )}. ${summary}`,
      action: { type: "adjustMacroTargets", payload: macroTargetAdjust.updates },
    };
  }

  if (sanitizedPrompt.includes("macro") || sanitizedPrompt.includes("nutrition")) {
    return {
      message: `${officerLabel}, here's how your macros look. ${buildMacroSummary(
        macroStats,
        macroTargets
      )} Ask me to log a meal or retune the targets if duty demands a change.`,
    };
  }

  if (sanitizedPrompt.includes("workout") || sanitizedPrompt.includes("strength")) {
    const compliance = macroStats?.complianceScore || 90;
    return {
      message: `Let's load the bar with intention. With nutrition compliance hovering around ${compliance}%, push a heavy triple wave tonight: 4×5 bench at 78% 1RM, 4×6 squat at 75%, and 3×4 deadlifts at 80%. Finish with prowler pushes and core shields. I can log post-lift macros when you're back.`,
    };
  }

  if (sanitizedPrompt.includes("recovery") || sanitizedPrompt.includes("sleep")) {
    return {
      message: `Run a recovery circuit: 10 minutes of mobility, contrast shower rotation, and a 5-minute guided breath with the squad calm track. Set your lights-out window for 7.5 hours so ShiftStrong can flag any sleep debt before roll call.`,
    };
  }

  if (sanitizedPrompt.includes("schedule") || sanitizedPrompt.includes("shift")) {
    return {
      message: `You're slated for Night Command. Front-load complex carbs by 1800, take your pre-shift strength primer at 2000, and schedule an intra-shift refuel around 2330. I'll pin reminders to your ShiftStrong timeline and we can log the meals after each break.`,
    };
  }

  if (sanitizedPrompt.includes("help") || sanitizedPrompt.includes("how")) {
    return {
      message: `Ask me for macro breakdowns, strength periodization, recovery tips, or schedule cues. I'm your on-duty AI dispatcher—ready to design the perfect patrol prep.`,
    };
  }

  return {
    message: `Logged your note, ${officerLabel}. I'll translate it into actionable macros and movement cues on your dashboard. Ask for macros, strength, or recovery guidance anytime.`,
  };
};

const AIHelper = ({
  officer,
  macroHistory,
  macroTargets,
  onMacroLog,
  onMacroTargetUpdate,
  className = "",
}) => {
  const officerName = officer?.name;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "I'm your ShiftStrong AI dispatcher. Ask for macro support, strength playbooks, or recovery cues and I'll have orders ready before your next shift.",
    },
  ]);

  const macroStats = useMemo(
    () => computeMacroStats(macroHistory, macroTargets),
    [macroHistory, macroTargets]
  );

  const suggestions = useMemo(() => {
    const dynamic = [];

    if (macroStats?.deltaFromTargets) {
      const { protein, carbs, fats } = macroStats.deltaFromTargets;
      if (protein < 0) {
        dynamic.push(`Plan a protein top-up (+${Math.abs(protein)}g)`);
      } else if (protein > 0) {
        dynamic.push(`Trim ${protein}g protein tonight`);
      }

      if (carbs < 0) {
        dynamic.push(`Design a carb-friendly patrol snack (+${Math.abs(carbs)}g)`);
      }

      if (dynamic.length === 0 && fats !== 0) {
        dynamic.push(
          fats > 0
            ? `Balance fats by easing ${fats}g at dinner`
            : `Add ${Math.abs(fats)}g healthy fats later`
        );
      }
    }

    return [...dynamic, ...baseSuggestionPresets].slice(0, 3);
  }, [macroStats]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const assistantResult = getAssistantResponse(trimmed, officerName, {
      macroHistory,
      macroTargets,
    });

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: assistantResult.message,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");

    if (assistantResult.action?.type === "logMacroEntry" && onMacroLog) {
      onMacroLog(assistantResult.action.payload);
    }

    if (assistantResult.action?.type === "adjustMacroTargets" && onMacroTargetUpdate) {
      onMacroTargetUpdate(assistantResult.action.payload);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <article
      className={`panel ai-helper-panel ${className}`.trim()}
      aria-label="ShiftStrong AI helper"
    >
      <header>
        <div className="ai-helper-title">
          <FaRobot />
          <div>
            <h2>AI Dispatch</h2>
            <span>ShiftStrong copilot for rapid-ready guidance.</span>
          </div>
        </div>
        <ul className="ai-helper-suggestions" aria-label="Quick suggestions">
          {suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button type="button" onClick={() => handleSuggestion(suggestion)}>
                <FaLightbulb /> {suggestion}
              </button>
            </li>
          ))}
        </ul>
      </header>

      <div className="ai-helper-feed" role="log" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`ai-message ai-message-${message.role}`}>
            <span className="ai-message-badge">
              {message.role === "assistant" ? <FaRobot /> : <FaBolt />}
            </span>
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      <form className="ai-helper-form" onSubmit={handleSubmit}>
        <label htmlFor="ai-helper-input" className="sr-only">
          Ask ShiftStrong AI for assistance
        </label>
        <textarea
          id="ai-helper-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about macros, workouts, or recovery."
          rows={2}
        />
        <button type="submit" className="primary-button">
          <FaPaperPlane /> Send
        </button>
      </form>
    </article>
  );
};

export default AIHelper;
