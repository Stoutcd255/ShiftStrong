import React from "react";
import { FaShieldAlt, FaMugHot, FaStar } from "react-icons/fa";

const SplashScreen = ({ onContinue }) => {
  return (
    <section className="screen splash-screen">
      <div className="splash-hero">
        <div className="splash-copy">
          <h1>ShiftStrong Command Diner</h1>
          <p>
            Precision nutrition intel and patrol-ready programming plated with
            neon diner flair. Designed for the officers who bring professionalism
            and heart to every beat.
          </p>
          <div className="splash-cta">
            <button className="primary-button" onClick={onContinue}>
              Clock In
            </button>
            <div className="splash-special" aria-live="polite">
              <span>Tonight&apos;s Feature</span>
              <strong>Blue Line Nitro Recovery Float</strong>
            </div>
          </div>
          <dl className="splash-stats">
            <div>
              <dt>Precincts onboard</dt>
              <dd>128</dd>
            </div>
            <div>
              <dt>Meals logged weekly</dt>
              <dd>24k</dd>
            </div>
            <div>
              <dt>Shift streak record</dt>
              <dd>47</dd>
            </div>
          </dl>
        </div>
        <div className="splash-emblem" aria-hidden="true">
          <FaShieldAlt className="badge-icon" />
          <span className="badge-title">ShiftStrong HQ</span>
          <FaMugHot size={36} color="var(--neon-yellow)" />
          <FaStar size={32} color="var(--neon-pink)" />
        </div>
      </div>
    </section>
  );
};

export default SplashScreen;
