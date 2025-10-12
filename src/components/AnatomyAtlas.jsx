import React, { useMemo, useState } from "react";

const MUSCLE_GROUPS = [
  {
    id: "chest",
    label: "Chest",
    shortLabel: "Pecs",
    description:
      "Front-line pectorals for strong pressing and cruiser posture during long patrols.",
    position: { top: "28%", left: "50%" },
    workouts: [
      {
        name: "Badge Bench Press",
        description:
          "Classic barbell bench press with controlled tempo to reinforce upper-body duty gear support.",
      },
      {
        name: "Precinct Push-Up Pyramid",
        description:
          "Ascending push-up ladder with tactical pauses to build muscular endurance across shifts.",
      },
      {
        name: "Shield Cable Fly",
        description:
          "Cable flys with staggered stance mimicking shield holds for balanced chest activation.",
      },
    ],
  },
  {
    id: "back",
    label: "Upper Back",
    shortLabel: "Back",
    description:
      "Lats, rhomboids, and spinal stabilizers that keep the duty belt secure and posture tall.",
    position: { top: "24%", left: "42%" },
    workouts: [
      {
        name: "Squadroom Pull-Down",
        description:
          "Wide-grip lat pull-down focusing on scapular depression to offset hours in the cruiser.",
      },
      {
        name: "Detective Row Series",
        description:
          "Single-arm cable rows with rotational finish to prime report-writing posture.",
      },
      {
        name: "Badge Face Pull",
        description:
          "High pulley face pulls emphasizing rear delts and mid-traps for radio vest support.",
      },
    ],
  },
  {
    id: "shoulders",
    label: "Shoulders",
    shortLabel: "Delts",
    description:
      "Multi-angle deltoids for confident arrest control and parade-ready stance.",
    position: { top: "21%", left: "57%" },
    workouts: [
      {
        name: "Patrol Press Ladder",
        description:
          "Seated dumbbell presses with descending reps to secure overhead strength.",
      },
      {
        name: "Signal Light Raises",
        description:
          "Lateral and front raise superset with neon tempo cues to bolster badge presence.",
      },
      {
        name: "Traffic Cone Arnold Press",
        description:
          "Arnold presses blending rotation and press for full-delt coverage on duty.",
      },
    ],
  },
  {
    id: "biceps",
    label: "Biceps",
    shortLabel: "Bi",
    description:
      "Elbow flexors for confident detainment and steady-duty flashlight handling.",
    position: { top: "35%", left: "58%" },
    workouts: [
      {
        name: "Patrol Curl Gauntlet",
        description:
          "Alternating dumbbell curls with pacing lights to simulate night shift tempo.",
      },
      {
        name: "Case File Hammer Curl",
        description:
          "Neutral-grip curls reinforcing grip durability for paperwork marathons.",
      },
      {
        name: "Squad Car Drag Curl",
        description:
          "Cable drag curls keeping elbows back to intensify peak contraction.",
      },
    ],
  },
  {
    id: "triceps",
    label: "Triceps",
    shortLabel: "Tri",
    description:
      "Arm extensors powering push-offs, suspect control, and shield deployment.",
    position: { top: "35%", left: "42%" },
    workouts: [
      {
        name: "Patrol Dip Circuit",
        description:
          "Assisted or weighted dips reinforcing lockout strength for barrier clears.",
      },
      {
        name: "Cuff Reach Kickbacks",
        description:
          "Cable kickbacks with torso support to mimic cuff applications.",
      },
      {
        name: "Siren Skull Crushers",
        description:
          "EZ-bar skull crushers with neon tempo to build controlled elbow extension.",
      },
    ],
  },
  {
    id: "forearms",
    label: "Forearms",
    shortLabel: "Grip",
    description:
      "Grip anchors for firearm retention, report writing, and baton control.",
    position: { top: "42%", left: "62%" },
    workouts: [
      {
        name: "Evidence Farmer Walk",
        description:
          "Heavy carry laps with case boxes to develop crush grip stamina.",
      },
      {
        name: "Ticket Roll Wrist Curl",
        description:
          "Seated wrist curls and extensions paired to balance patrol-ready grip strength.",
      },
      {
        name: "Flashlight Twists",
        description:
          "Pronated and supinated rotations using a weighted baton for rotational endurance.",
      },
    ],
  },
  {
    id: "core",
    label: "Core",
    shortLabel: "Core",
    description:
      "Abdominals and obliques safeguarding the spine during pursuits and cruiser duty.",
    position: { top: "45%", left: "50%" },
    workouts: [
      {
        name: "Precinct Plank Relay",
        description:
          "Timed planks with radio call challenges to reinforce anti-extension endurance.",
      },
      {
        name: "Evidence Locker Chop",
        description:
          "Cable wood chops promoting rotational power for breaching drills.",
      },
      {
        name: "Diner Booth Dead Bug",
        description:
          "Dead bug sequences with slow neon counts to dial in brace mechanics.",
      },
    ],
  },
  {
    id: "glutes",
    label: "Glutes",
    shortLabel: "Glutes",
    description:
      "Hip drivers fueling sprint pursuits, stable stances, and cruiser exits.",
    position: { top: "55%", left: "44%" },
    workouts: [
      {
        name: "Squad Sprint Step-Up",
        description:
          "Weighted step-ups with patrol belt to improve unilateral drive power.",
      },
      {
        name: "Precinct Hip Thrust",
        description:
          "Barbell hip thrusts with pause lockouts to secure posterior chain strength.",
      },
      {
        name: "Alleyway Lunge Walk",
        description:
          "Walking lunges through neon markers to strengthen stride control.",
      },
    ],
  },
  {
    id: "hamstrings",
    label: "Hamstrings",
    shortLabel: "Hams",
    description:
      "Posterior thigh support for braking, crouching, and cruiser-to-foot transitions.",
    position: { top: "60%", left: "56%" },
    workouts: [
      {
        name: "Night Shift RDL",
        description:
          "Romanian deadlifts with reflective markers to cue hinge depth.",
      },
      {
        name: "Detention Nordic Curl",
        description:
          "Partner-assisted nordic curls building eccentric hamstring armor.",
      },
      {
        name: "Cruiser Slide Leg Curl",
        description:
          "Slider leg curls replicating vehicle egress demands.",
      },
    ],
  },
  {
    id: "quads",
    label: "Quadriceps",
    shortLabel: "Quads",
    description:
      "Front thighs powering sprint starts, stair climbs, and rapid response pivots.",
    position: { top: "58%", left: "48%" },
    workouts: [
      {
        name: "Signal Light Front Squat",
        description:
          "Front squats with badge-high elbows to promote upright duty posture.",
      },
      {
        name: "Patrol Sled Push",
        description:
          "Weighted sled drives mimicking cruiser pushes and shield advances.",
      },
      {
        name: "Traffic Stop Split Squat",
        description:
          "Rear-foot elevated split squats to fortify unilateral stability.",
      },
    ],
  },
  {
    id: "calves",
    label: "Calves",
    shortLabel: "Calves",
    description:
      "Lower leg springs for foot pursuits, sprint takeoffs, and prolonged patrol standing.",
    position: { top: "68%", left: "52%" },
    workouts: [
      {
        name: "Siren Step Calf Raise",
        description:
          "Tempo calf raises on illuminated risers to build explosive plantar flexion.",
      },
      {
        name: "Beat Patrol Jump Rope",
        description:
          "Rhythmic rope intervals syncing with dispatch cadence for reactive spring.",
      },
      {
        name: "Cruiser Brake Iso Hold",
        description:
          "Isometric wall calf holds replicating emergency brake pressure.",
      },
    ],
  },
  {
    id: "traps",
    label: "Traps & Neck",
    shortLabel: "Traps",
    description:
      "Upper traps and neck armor stabilizing radio rigs and duty helmets.",
    position: { top: "16%", left: "50%" },
    workouts: [
      {
        name: "Beacon Shrug Pull",
        description:
          "Barbell shrugs with pulse holds to reinforce scapular elevation strength.",
      },
      {
        name: "Traffic Stand Neck Iso",
        description:
          "Band-resisted neck isometrics performed in four directions for balanced support.",
      },
      {
        name: "Duty Strap Carry",
        description:
          "Trap bar carries replicating gear carry-outs for resilience under load.",
      },
    ],
  },
];

const AnatomyAtlas = () => {
  const [expandedMuscles, setExpandedMuscles] = useState(() =>
    MUSCLE_GROUPS.reduce((accumulator, muscle, index) => {
      return { ...accumulator, [muscle.id]: index === 0 };
    }, {})
  );
  const [highlightMuscle, setHighlightMuscle] = useState(
    MUSCLE_GROUPS[0]?.id ?? null
  );

  const totalWorkouts = useMemo(
    () => MUSCLE_GROUPS.reduce((sum, muscle) => sum + muscle.workouts.length, 0),
    []
  );

  const activeMuscle = useMemo(
    () => MUSCLE_GROUPS.find((muscle) => muscle.id === highlightMuscle),
    [highlightMuscle]
  );

  const handleMuscleClick = (muscleId) => {
    setExpandedMuscles((previous) => ({
      ...previous,
      [muscleId]: !previous[muscleId],
    }));
    setHighlightMuscle(muscleId);
  };

  return (
    <article className="panel anatomy-panel">
      <header>
        <h2>ShiftStrong Anatomy Command</h2>
        <span className="panel-subtitle">
          Tap any muscle on the neon precinct body map to reveal curated duty-ready
          workouts. {totalWorkouts}+ exercises cover every squad necessity.
        </span>
      </header>

      <div className="anatomy-layout">
        <div className="anatomy-figure" role="img" aria-label="Muscular anatomy silhouette">
          <div className="figure-outline" />
          {MUSCLE_GROUPS.map((muscle) => (
            <button
              key={muscle.id}
              type="button"
              className={`muscle-node ${highlightMuscle === muscle.id ? "active" : ""}`.trim()}
              style={{ top: muscle.position.top, left: muscle.position.left }}
              onClick={() => handleMuscleClick(muscle.id)}
              aria-pressed={highlightMuscle === muscle.id}
            >
              <span>{muscle.shortLabel}</span>
            </button>
          ))}
        </div>
        <div className="anatomy-insight">
          <h3>{activeMuscle?.label ?? "Select a muscle"}</h3>
          <p>{activeMuscle?.description ?? "Choose a muscle group to review workouts."}</p>
        </div>
      </div>

      <div className="anatomy-dropdowns">
        {MUSCLE_GROUPS.map((muscle) => {
          const expanded = expandedMuscles[muscle.id];
          return (
            <div
              key={muscle.id}
              className={`muscle-dropdown ${expanded ? "open" : ""}`.trim()}
            >
              <button
                type="button"
                onClick={() => handleMuscleClick(muscle.id)}
                aria-expanded={expanded}
                aria-controls={`muscle-${muscle.id}-panel`}
              >
                <span>{muscle.label}</span>
                <span className="badge">{muscle.workouts.length}</span>
              </button>
              <div
                id={`muscle-${muscle.id}-panel`}
                className="muscle-dropdown-content"
                hidden={!expanded}
              >
                <p>{muscle.description}</p>
                <ul>
                  {muscle.workouts.map((workout) => (
                    <li key={`${muscle.id}-${workout.name}`}>
                      <strong>{workout.name}</strong>
                      <span>{workout.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default AnatomyAtlas;
