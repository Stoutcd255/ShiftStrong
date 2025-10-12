import React, { useState } from "react";
import {
  FaUserPlus,
  FaEnvelope,
  FaIdBadge,
  FaLock,
  FaArrowLeft,
  FaClipboardCheck,
} from "react-icons/fa";

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

const SignupScreen = ({ onSubmit, onBack, existingAccounts = [] }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    badgeNumber: "",
    password: "",
    confirmPassword: "",
    acceptPolicy: true,
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!form.acceptPolicy) {
      setError("Please acknowledge the ShiftStrong wellness pledge.");
      return;
    }

    if (form.password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(form);
      if (!result?.success) {
        setError(result?.message || "Unable to create your officer profile.");
        return;
      }

      setError("");
      setSuccessMessage("Account secured. Redirecting to your dashboard...");
    } catch (submissionError) {
      console.warn("Signup submission failed", submissionError);
      setError("We couldn\'t complete your enrollment. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="screen signup-screen">
      <div className="signup-card">
        <header>
          <button type="button" className="ghost-button" onClick={onBack}>
            <FaArrowLeft /> Back to login
          </button>
          <h2>
            <FaUserPlus /> Enlist in ShiftStrong
          </h2>
          <p>
            New to the midnight macro unit? Register below to receive personalized
            fueling plans, strength microcycles, and diner-inspired coaching
            tailored to your beat.
          </p>
        </header>
        <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
          <label className="input-label">
            <span>Call Sign / Name</span>
            <input
              type="text"
              name="name"
              placeholder="Detective Morgan"
              value={form.name}
              onChange={handleChange}
            />
          </label>
          <label className="input-label">
            <span>
              <FaEnvelope /> Department Email
            </span>
            <input
              type="email"
              name="email"
              placeholder="officer.you@precinct.gov"
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
              placeholder="8421"
              value={form.badgeNumber}
              onChange={handleChange}
            />
          </label>
          <div className="signup-password-grid">
            <label className="input-label">
              <span>
                <FaLock /> Password
              </span>
              <input
                type="password"
                name="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>
            <label className="input-label">
              <span>Confirm</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          </div>
          <label className="checkbox pledge">
            <input
              type="checkbox"
              name="acceptPolicy"
              checked={form.acceptPolicy}
              onChange={handleChange}
            />
            <span>
              I commit to the ShiftStrong wellness pledge and authorize secure
              storage of my operational macros.
            </span>
          </label>
          {error && (
            <p className="form-error" role="alert" aria-live="assertive">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="form-success" role="status" aria-live="polite">
              {successMessage}
            </p>
          )}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            <FaClipboardCheck /> {isSubmitting ? "Securing..." : "Secure My Account"}
          </button>
        </form>
      </div>
      <aside className="signup-spotlight">
        <h3>Active Roster</h3>
        <p>
          Join a squad of officers already fueling their shifts through
          ShiftStrong. Saved accounts are encrypted locally for rapid roll call.
        </p>
        <ul>
          {existingAccounts.map((account) => (
            <li key={account.email}>
              <span className="saved-account-avatar" aria-hidden="true">
                {getInitials(account.name, account.email)}
              </span>
              <div className="roster-meta">
                <strong>{account.name || "Officer"}</strong>
                <span>{account.email}</span>
                {account.badgeNumber && <em>Badge {account.badgeNumber}</em>}
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
};

export default SignupScreen;
