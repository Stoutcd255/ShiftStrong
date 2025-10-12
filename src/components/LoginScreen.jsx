import React, { useEffect, useState } from "react";
import {
  FaUserShield,
  FaIdBadge,
  FaKey,
  FaPlusCircle,
  FaEnvelopeOpenText,
  FaDownload,
  FaSyncAlt,
  FaFolderOpen,
  FaBullseye,
  FaHeartbeat,
  FaChartLine,
} from "react-icons/fa";

const briefingHighlights = [
  {
    id: "macros",
    icon: <FaBullseye />,
    title: "Macro Precision",
    copy: "Track patrol meals with diner-calibrated macros and instant compliance updates.",
  },
  {
    id: "recovery",
    icon: <FaHeartbeat />,
    title: "Recovery Radar",
    copy: "Monitor sleep, hydration, and stress cues to keep your squad mission ready.",
  },
  {
    id: "analytics",
    icon: <FaChartLine />,
    title: "Command Analytics",
    copy: "Surface squad streaks and monetization boosters directly from the neon dashboard.",
  },
];

const getInitials = (name, email) => {
  const source = name || email || "Officer";
  const parts = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0]);

  if (parts.length >= 2) {
    return `${parts[0]}${parts[1]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

const LoginScreen = ({
  onSubmit,
  credentials,
  onSignupClick,
  savedAccounts = [],
  activePatch,
  installPreferences,
  onPatchChange,
}) => {
  const [form, setForm] = useState({
    email: credentials.email || "",
    badgeNumber: credentials.badgeNumber || "",
    password: "",
    rememberMe: credentials.rememberMe ?? true,
  });
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: credentials.email || "",
      badgeNumber: credentials.badgeNumber || "",
    }));
    setLocalError("");
    setIsSubmitting(false);
  }, [credentials.email, credentials.badgeNumber]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (localError) {
      setLocalError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(form);
      if (!result?.success) {
        setLocalError(result?.message || "Unable to authenticate.");
        return;
      }

      setLocalError("");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      console.warn("Login submission failed", error);
      setLocalError("Something went wrong while signing you in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavedSelect = (account) => {
    setForm((prev) => ({
      ...prev,
      email: account.email,
      badgeNumber: account.badgeNumber || "",
    }));
  };

  const currentError = localError;
  const installLocation =
    installPreferences?.location || "C:/ShiftStrong Precinct";
  const installedStamp = activePatch?.installedAt
    ? new Date(activePatch.installedAt).toLocaleString()
    : null;

  return (
    <section className="screen login-screen">
      <div className="login-card">
        <header>
          <h2>Officer Check-In</h2>
          <p>
            Badge up to access precision macro planning, diner-fresh fueling
            guides, and shift-ready strength playbooks tailored to your beat.
          </p>
        </header>
        <div className="login-install-banner">
          <div className="banner-icon" aria-hidden="true">
            <FaDownload />
          </div>
          <div className="banner-copy">
            <span>Installed Patch</span>
            {activePatch ? (
              <>
                <strong>
                  {activePatch.version} · {activePatch.name}
                </strong>
                <div className="banner-meta">
                  <span>
                    <FaFolderOpen aria-hidden="true" /> {installLocation}
                  </span>
                  {installedStamp && <span>Installed {installedStamp}</span>}
                </div>
              </>
            ) : (
              <>
                <strong>Awaiting deployment</strong>
                <div className="banner-meta">
                  <span>Select a patch to personalize your diner deck.</span>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            className="ghost-button small"
            onClick={() => onPatchChange?.()}
            disabled={isSubmitting || !onPatchChange}
          >
            <FaSyncAlt /> Manage Patch
          </button>
        </div>
        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <label className="input-label">
            <span>
              <FaUserShield /> Department Email
            </span>
            <input
              type="email"
              name="email"
              placeholder="officer.jane@precinct.gov"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="input-label">
            <span>
              <FaIdBadge /> Badge Number
            </span>
            <input
              type="text"
              name="badgeNumber"
              placeholder="1234"
              value={form.badgeNumber}
              onChange={handleChange}
            />
          </label>
          <label className="input-label">
            <span>
              <FaKey /> Password
            </span>
            <input
              type="password"
              name="password"
              placeholder="Counter-side passphrase"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
            />
            <span>Keep me ready for next roll call</span>
          </label>
          {currentError && (
            <p className="form-error" role="alert" aria-live="assertive">
              {currentError}
            </p>
          )}
          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Dispatching..." : "Dispatch Me"}
          </button>
        </form>
        <button
          type="button"
          className="ghost-button alt"
          onClick={onSignupClick}
          disabled={isSubmitting}
        >
          <FaPlusCircle /> Enlist a New Officer
        </button>
        {savedAccounts.length > 0 && (
          <div className="saved-accounts">
            <h4>
              <FaEnvelopeOpenText /> Saved Credentials
            </h4>
            <ul>
              {savedAccounts.map((account) => (
                <li key={account.email}>
                  <button
                    type="button"
                    onClick={() => handleSavedSelect(account)}
                    disabled={isSubmitting}
                  >
                    <span className="saved-account-avatar" aria-hidden="true">
                      {getInitials(account.name, account.email)}
                    </span>
                    <span className="saved-account-meta">
                      <strong>{account.name || "Officer"}</strong>
                      <span>{account.email}</span>
                      {account.badgeNumber && <em>Badge {account.badgeNumber}</em>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="login-note">
          Authorized personnel only · Encrypted watch command access
        </p>
      </div>
      <aside className="login-briefing">
        <h3>Briefing Board</h3>
        <div className="briefing-grid">
          {briefingHighlights.map((highlight) => (
            <article key={highlight.id} className="briefing-card">
              <span className="briefing-icon" aria-hidden="true">
                {highlight.icon}
              </span>
              <div>
                <strong>{highlight.title}</strong>
                <p>{highlight.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
};

export default LoginScreen;
