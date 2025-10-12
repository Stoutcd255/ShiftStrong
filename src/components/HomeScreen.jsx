import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  YAxis,
} from "recharts";
import {
  FaUtensils,
  FaDumbbell,
  FaHistory,
  FaSignOutAlt,
  FaBullseye,
  FaHeartbeat,
  FaCalendarCheck,
  FaDownload,
  FaFolderOpen,
  FaSyncAlt,
  FaAppleAlt,
  FaBolt,
  FaCrown,
  FaStar,
  FaArrowRight,
  FaUserShield,
  FaClipboardCheck,
  FaFireAlt,
} from "react-icons/fa";
import AIHelper from "./AIHelper";
import AnatomyAtlas from "./AnatomyAtlas";
import {
  computeMacroStats,
  formatMacroLine,
  getDayLabel,
} from "../utils/macroAnalytics";

const strengthData = [
  { week: "Wk 1", bench: 245, deadlift: 335, squat: 295 },
  { week: "Wk 2", bench: 255, deadlift: 345, squat: 305 },
  { week: "Wk 3", bench: 260, deadlift: 350, squat: 315 },
  { week: "Wk 4", bench: 265, deadlift: 360, squat: 325 },
];

const complianceData = [
  { shift: "A", rate: 92 },
  { shift: "B", rate: 95 },
  { shift: "C", rate: 88 },
  { shift: "D", rate: 97 },
];

const quickActions = [
  {
    id: "log-meal",
    icon: <FaUtensils />,
    title: "Log a Meal",
    copy: "Snap tonight's patrol refuel to stay on target.",
  },
  {
    id: "scan-barcode",
    icon: <FaBolt />,
    title: "Scan Barcode",
    copy: "Fast-track packaged macros from the cruiser pantry.",
  },
  {
    id: "plan-workout",
    icon: <FaDumbbell />,
    title: "Plan Workout",
    copy: "Drop in a strength block tailored to your patch.",
  },
  {
    id: "ask-ai",
    icon: <FaAppleAlt />,
    title: "Ask Dispatch AI",
    copy: "Get real-time macro coaching with context from your logs.",
  },
];

const missionChecklist = [
  "Log three meals before curfew",
  "Complete silver shield conditioning block",
  "Hydrate 90 oz during shift",
  "Submit recovery check-in before 0700",
];

const premiumBundles = [
  {
    id: "macro-pro",
    badge: "Most Popular",
    title: "Macro Precision Coach",
    price: "$14/mo",
    perks: [
      "Adaptive macro prescriptions updated nightly",
      "1:1 AI dispatch with precinct nutritionist oversight",
      "Unlock silver-lining recipe vault & midnight diner drop-ins",
    ],
  },
  {
    id: "strength-ops",
    badge: "New",
    title: "Strength Ops Lab",
    price: "$19/mo",
    perks: [
      "Periodized lifting templates built for tactical teams",
      "Video breakdowns with form radar overlays",
      "Monthly readiness labs & mobility diagnostics",
    ],
  },
];

const trainingPrograms = [
  {
    id: "beat-burn",
    title: "Beat Burn 30",
    description: "High-intensity metabolic sessions for patrol conditioning.",
    focus: "Conditioning",
  },
  {
    id: "strength-shield",
    title: "Strength Shield Cycle",
    description: "12-week progressive strength wave with deload support.",
    focus: "Power",
  },
  {
    id: "mobility-roll",
    title: "Mobility Roll Call",
    description: "Daily joint care, fascia release, and cruiser-friendly drills.",
    focus: "Recovery",
  },
  {
    id: "macro-master",
    title: "Macro Mastery Lab",
    description: "Guided nutrition missions with weekly compliance audits.",
    focus: "Nutrition",
  },
];

const HomeScreen = ({
  officer,
  onLogout,
  macroHistory,
  macroTargets,
  onMacroLog,
  onMacroTargetUpdate,
  activePatch,
  installPreferences,
  onPatchChange,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  const officerLabel = officer?.name
    ? officer.name
    : officer?.badgeNumber
    ? `Officer ${officer.badgeNumber}`
    : "Officer";

  const macroStats = useMemo(
    () => computeMacroStats(macroHistory, macroTargets),
    [macroHistory, macroTargets]
  );

  const macroProgress = useMemo(() => {
    const averages = macroStats?.averages || {};
    const deltas = macroStats?.deltaFromTargets || {};

    const entries = [
      { key: "protein", label: "Protein", accent: "#ff6b81" },
      { key: "carbs", label: "Carbs", accent: "#5ce1e6" },
      { key: "fats", label: "Fats", accent: "#ffd166" },
    ];

    return entries.map(({ key, label, accent }) => {
      const rawAverage = Number.isFinite(averages?.[key]) ? averages[key] : null;
      const average = rawAverage !== null ? Math.round(rawAverage) : null;
      const target = Number.isFinite(macroTargets?.[key]) ? macroTargets[key] : null;
      const rawDelta = Number.isFinite(deltas?.[key]) ? deltas[key] : null;
      const deltaValue = rawDelta !== null ? Math.round(rawDelta) : null;
      const progress = target && target > 0
        ? Math.max(0, Math.min(120, Math.round(((rawAverage ?? 0) / target) * 100)))
        : 0;

      let deltaCopy = "Log more meals to compare";
      if (deltaValue !== null) {
        if (deltaValue === 0) {
          deltaCopy = "Right on target";
        } else {
          const formatted = `${deltaValue > 0 ? "+" : ""}${deltaValue}g`;
          deltaCopy = `${formatted} ${deltaValue > 0 ? "over" : "under"}`;
        }
      }

      const deltaClass =
        deltaValue === null
          ? "macro-progress-delta-neutral"
          : deltaValue > 0
          ? "delta-positive"
          : deltaValue < 0
          ? "delta-negative"
          : "macro-progress-delta-zero";

      return {
        id: key,
        label,
        accent,
        average,
        target,
        progress,
        deltaCopy,
        deltaClass,
        averageRaw: rawAverage,
      };
    });
  }, [macroStats, macroTargets]);

  const chartData = useMemo(
    () =>
      (macroHistory || [])
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7)
        .map((entry) => ({
          day: getDayLabel(entry.date),
          protein: entry.protein,
          carbs: entry.carbs,
          fats: entry.fats,
        })),
    [macroHistory]
  );

  const installLocation =
    installPreferences?.location || "C:/ShiftStrong Precinct";
  const installedStamp = activePatch?.installedAt
    ? new Date(activePatch.installedAt).toLocaleString()
    : null;

  return (
    <section className="screen home-screen">
      <header className="home-header">
        <div className="home-header-main">
          <div className="home-headline">
            <h1>Welcome back, {officerLabel}</h1>
            <p className="home-subcopy">
              Your macro compliance and strength analytics are plated fresh. Dial
              in tonight&apos;s patrol prep with insights curated by the
              ShiftStrong diner design team.
            </p>
            <ul className="hero-badges">
              <li>
                <FaBullseye /> Macros locked · 94%
              </li>
              <li>
                <FaHeartbeat /> Recovery load · Balanced
              </li>
              <li>
                <FaCalendarCheck /> Streak · 12 nights
              </li>
            </ul>
          </div>
          <div className="hero-actions" aria-label="Quick monetized actions">
            {quickActions.map((action) => (
              <button key={action.id} type="button" className="hero-action-card">
                <span className="icon" aria-hidden="true">
                  {action.icon}
                </span>
                <span className="copy">
                  <strong>{action.title}</strong>
                  <small>{action.copy}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="hero-meta">
          <div className="hero-upgrade" role="complementary">
            <div className="upgrade-icon" aria-hidden="true">
              <FaCrown />
            </div>
            <div className="upgrade-copy">
              <strong>Precinct Pro Access</strong>
              <span>Unlock concierge coaching & neon diner exclusives.</span>
            </div>
            <button type="button" className="primary-button small">
              Start 14-day trial <FaArrowRight aria-hidden="true" />
            </button>
          </div>
          <div className="patch-status">
            <span className="patch-label">
              <FaDownload /> Installed Patch
            </span>
            {activePatch ? (
              <>
                <strong>
                  {activePatch.version} · {activePatch.name}
                </strong>
                <p className="patch-detail">
                  <FaFolderOpen aria-hidden="true" /> {installLocation}
                </p>
                {installedStamp && (
                  <p className="patch-detail">Installed {installedStamp}</p>
                )}
              </>
            ) : (
              <>
                <strong>Awaiting deployment</strong>
                <p className="patch-detail">
                  Launch the installer to deploy a precinct build.
                </p>
              </>
            )}
            <button
              type="button"
              className="ghost-button small"
              onClick={() => onPatchChange?.()}
            >
              <FaSyncAlt /> Manage Patch
            </button>
          </div>
          <div className="hero-meta-footer">
            <div>
              <span>Shift Status</span>
              <strong>Night Command</strong>
            </div>
            <span>{officer?.email || "Secure channel active"}</span>
            <button className="ghost-button" onClick={onLogout}>
              <FaSignOutAlt /> Log Out
            </button>
          </div>
        </div>
      </header>

      <nav className="home-tabs" aria-label="Dashboard view selection">
        <button
          type="button"
          className={activeTab === "overview" ? "active" : undefined}
          onClick={() => setActiveTab("overview")}
        >
          Analytics Overview
        </button>
        <button
          type="button"
          className={activeTab === "anatomy" ? "active" : undefined}
          onClick={() => setActiveTab("anatomy")}
        >
          Anatomy Workout Atlas
        </button>
      </nav>

      {activeTab === "overview" ? (
        <div className="home-layout">
          <div className="home-main">
            <article className="panel macro-panel">
              <header>
                <h2>
                  <FaUtensils /> Macro Intelligence
                </h2>
                <span className="panel-subtitle">
                  From station café specials to midnight cruiser snacks.
                </span>
              </header>
              <div className="macro-stat-cards">
                <div>
                  <span>Targets</span>
                  <strong>
                    {formatMacroLine("Protein", macroTargets.protein)} · {formatMacroLine("Carbs", macroTargets.carbs)} · {formatMacroLine("Fats", macroTargets.fats)}
                  </strong>
                  <small>{formatMacroLine("Calories", macroTargets.calories, " kcal")}</small>
                </div>
                <div>
                  <span>7-day avg</span>
                  <strong>
                    {formatMacroLine("Protein", macroStats?.averages?.protein)} · {formatMacroLine("Carbs", macroStats?.averages?.carbs)} · {formatMacroLine("Fats", macroStats?.averages?.fats)}
                  </strong>
                  <small>{formatMacroLine("Calories", macroStats?.averages?.calories, " kcal")}</small>
                </div>
                <div>
                  <span>Compliance</span>
                  <strong>{macroStats?.complianceScore ? `${macroStats.complianceScore}%` : "--"}</strong>
                  <small>
                    Delta today ·{" "}
                    <span
                      className={
                        macroStats?.deltaFromTargets
                          ? macroStats.deltaFromTargets.protein >= 0
                            ? "delta-positive"
                            : "delta-negative"
                          : undefined
                      }
                    >
                      {macroStats?.deltaFromTargets
                        ? `${macroStats.deltaFromTargets.protein >= 0 ? "+" : ""}${macroStats.deltaFromTargets.protein}g P`
                        : "--"}
                    </span>
                    ,{" "}
                    <span
                      className={
                        macroStats?.deltaFromTargets
                          ? macroStats.deltaFromTargets.carbs >= 0
                            ? "delta-positive"
                            : "delta-negative"
                          : undefined
                      }
                    >
                      {macroStats?.deltaFromTargets
                        ? `${macroStats.deltaFromTargets.carbs >= 0 ? "+" : ""}${macroStats.deltaFromTargets.carbs}g C`
                        : "--"}
                    </span>
                    ,{" "}
                    <span
                      className={
                        macroStats?.deltaFromTargets
                          ? macroStats.deltaFromTargets.fats >= 0
                            ? "delta-positive"
                            : "delta-negative"
                          : undefined
                      }
                    >
                      {macroStats?.deltaFromTargets
                        ? `${macroStats.deltaFromTargets.fats >= 0 ? "+" : ""}${macroStats.deltaFromTargets.fats}g F`
                        : "--"}
                    </span>
                  </small>
                </div>
              </div>
              <div className="macro-progress" role="list">
                {macroProgress.map((item) => (
                  <div key={item.id} className="macro-progress-row" role="listitem">
                    <div className="macro-progress-header">
                      <span>{item.label}</span>
                      <strong>{item.average !== null ? `${item.average}g` : "--"}</strong>
                    </div>
                    <div
                      className="macro-progress-bar"
                      role="progressbar"
                      aria-label={`${item.label} weekly average versus target`}
                      aria-valuemin={0}
                      aria-valuenow={item.averageRaw ?? 0}
                      aria-valuemax={item.target ?? undefined}
                    >
                      <span
                        className="macro-progress-fill"
                        style={{
                          "--progress-width": `${item.progress}%`,
                          "--progress-accent": item.accent,
                        }}
                      />
                    </div>
                    <div className="macro-progress-footer">
                      <span>Target {item.target ? `${item.target}g` : "--"}</span>
                      <span className={`macro-progress-delta ${item.deltaClass}`}>{item.deltaCopy}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="macro-chart-wrapper">
                <div className="macro-chart-copy">
                  <span className="chart-label">
                    <FaFireAlt aria-hidden="true" /> Trending compliance
                  </span>
                  <p>
                    Officers sustaining 90%+ compliance unlock concierge AI meal
                    planning and silver shield rewards.
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="proteinGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff6b81" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#ff6b81" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="carbGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5ce1e6" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#5ce1e6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                    <XAxis dataKey="day" stroke="#fff" />
                    <YAxis stroke="#fff" hide />
                    <Tooltip contentStyle={{ background: "#0a1b2a", border: "1px solid #ffebc6", color: "#fff" }} />
                    <Area type="monotone" dataKey="protein" stroke="#ff6b81" fill="url(#proteinGradient)" strokeWidth={3} />
                    <Area type="monotone" dataKey="carbs" stroke="#5ce1e6" fill="url(#carbGradient)" strokeWidth={3} />
                    <Area type="monotone" dataKey="fats" stroke="#ffd166" fill="#ffd16633" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel strength-panel">
              <header>
                <h2>
                  <FaDumbbell /> Strength Progression
                </h2>
                <span className="panel-subtitle">Vintage ironwork meets data precision.</span>
              </header>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={strengthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="week" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{ background: "#0a1b2a", border: "1px solid #5ce1e6", color: "#fff" }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "#fff" }} />
                  <Line type="monotone" dataKey="bench" stroke="#ff6b81" strokeWidth={3} dot />
                  <Line type="monotone" dataKey="deadlift" stroke="#ffd166" strokeWidth={3} dot />
                  <Line type="monotone" dataKey="squat" stroke="#5ce1e6" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </article>

            <article className="panel compliance-panel">
              <header>
                <h2>
                  <FaHistory /> Shift Compliance
                </h2>
                <span className="panel-subtitle">Squad adherence over the current rotation.</span>
              </header>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={complianceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="shift" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{ background: "#0a1b2a", border: "1px solid #ff6b81", color: "#fff" }} />
                  <Bar dataKey="rate" fill="#5ce1e6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </article>

            <section className="panel mission-panel">
              <header>
                <h2>
                  <FaClipboardCheck /> Tonight&apos;s Missions
                </h2>
                <span className="panel-subtitle">
                  Complete the checklist to earn precinct reward boosts.
                </span>
              </header>
              <ul>
                {missionChecklist.map((mission) => (
                  <li key={mission}>
                    <span className="mission-checkbox" aria-hidden="true" />
                    <span>{mission}</span>
                    <button type="button" className="ghost-button small">
                      Log progress
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel program-panel">
              <header>
                <h2>
                  <FaUserShield /> Featured Precinct Labs
                </h2>
                <span className="panel-subtitle">
                  Premium plans curated by ShiftStrong performance designers.
                </span>
              </header>
              <div className="program-grid">
                {trainingPrograms.map((program) => (
                  <article key={program.id} className="program-card">
                    <span className="program-focus">{program.focus}</span>
                    <h3>{program.title}</h3>
                    <p>{program.description}</p>
                    <button type="button" className="ghost-button">
                      Preview plan <FaArrowRight aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel diner-callout">
              <header>
                <h2>Midnight Diner Specials</h2>
                <span className="panel-subtitle">Retro refuels curated by the ShiftStrong kitchen.</span>
              </header>
              <ul>
                <li>
                  <strong>Blue Line Protein Stack</strong>
                  <span>Turkey patty melt · Sweet potato waffle fries · Vanilla casein shake.</span>
                </li>
                <li>
                  <strong>Beat Patrol Breakfast</strong>
                  <span>Egg-white omelette · Cinnamon oat waffles · Blueberry compote.</span>
                </li>
                <li>
                  <strong>Detective&apos;s Recovery</strong>
                  <span>Grilled salmon · Garlic green beans · Cherry cola BCAA spritzer.</span>
                </li>
              </ul>
            </section>
          </div>
          <aside className="home-sidebar" aria-label="Premium and assistant tools">
            <section className="panel premium-panel">
              <header>
                <h2>
                  <FaStar /> Monetize Your Momentum
                </h2>
                <span className="panel-subtitle">
                  Officers investing in Pro average 27% higher compliance.
                </span>
              </header>
              <div className="premium-bundles">
                {premiumBundles.map((bundle) => (
                  <article key={bundle.id} className="premium-card">
                    <span className="badge">{bundle.badge}</span>
                    <div className="premium-heading">
                      <h3>{bundle.title}</h3>
                      <strong>{bundle.price}</strong>
                    </div>
                    <ul>
                      {bundle.perks.map((perk) => (
                        <li key={perk}>{perk}</li>
                      ))}
                    </ul>
                    <button type="button" className="primary-button">
                      Upgrade now
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel testimonial-panel">
              <header>
                <h2>
                  <FaFireAlt /> Precinct Success
                </h2>
                <span className="panel-subtitle">
                  “ShiftStrong Pro helped our squad cut response lag by 18%.” – Lt. Vega
                </span>
              </header>
              <p>
                Unlock exclusive readiness labs, concierge macro audits, and AI
                dispatch escalations designed for monetized performance teams.
              </p>
            </section>

            <AIHelper
              officer={officer}
              macroHistory={macroHistory}
              macroTargets={macroTargets}
              onMacroLog={onMacroLog}
              onMacroTargetUpdate={onMacroTargetUpdate}
              className="home-ai-panel"
            />
          </aside>
        </div>
      ) : (
        <div className="home-layout anatomy-layout">
          <div className="home-main">
            <AnatomyAtlas />
          </div>
          <aside className="home-sidebar" aria-label="Assistant and premium tools">
            <section className="panel premium-panel">
              <header>
                <h2>
                  <FaStar /> Monetize Your Momentum
                </h2>
                <span className="panel-subtitle">
                  Officers investing in Pro average 27% higher compliance.
                </span>
              </header>
              <div className="premium-bundles">
                {premiumBundles.map((bundle) => (
                  <article key={bundle.id} className="premium-card">
                    <span className="badge">{bundle.badge}</span>
                    <div className="premium-heading">
                      <h3>{bundle.title}</h3>
                      <strong>{bundle.price}</strong>
                    </div>
                    <ul>
                      {bundle.perks.map((perk) => (
                        <li key={perk}>{perk}</li>
                      ))}
                    </ul>
                    <button type="button" className="primary-button">
                      Upgrade now
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <AIHelper
              officer={officer}
              macroHistory={macroHistory}
              macroTargets={macroTargets}
              onMacroLog={onMacroLog}
              onMacroTargetUpdate={onMacroTargetUpdate}
              className="home-ai-panel"
            />
          </aside>
        </div>
      )}
    </section>
  );
};

export default HomeScreen;
