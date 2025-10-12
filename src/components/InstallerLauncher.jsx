import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaDownload,
  FaRocket,
  FaListOl,
  FaFolderOpen,
  FaCheckCircle,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";

const InstallerLauncher = ({
  patches = [],
  activePatch,
  installPreferences,
  onInstall,
  onSkip,
}) => {
  const recommendedPatch = useMemo(
    () => patches.find((patch) => patch.recommended) || patches[0],
    [patches]
  );

  const [selectedPatchId, setSelectedPatchId] = useState(
    activePatch?.id || recommendedPatch?.id
  );
  const [location, setLocation] = useState(
    installPreferences?.location || "C:/ShiftStrong Precinct"
  );
  const [desktopShortcut, setDesktopShortcut] = useState(
    installPreferences?.desktopShortcut ?? true
  );
  const [autoLaunch, setAutoLaunch] = useState(
    installPreferences?.autoLaunch ?? true
  );
  const [enableBetaStream, setEnableBetaStream] = useState(
    installPreferences?.enableBetaStream ?? false
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  const selectedPatch = useMemo(
    () => patches.find((patch) => patch.id === selectedPatchId),
    [patches, selectedPatchId]
  );

  const handleInstall = async () => {
    if (!selectedPatch || isInstalling) {
      return;
    }

    setIsInstalling(true);

    const payload = {
      patch: selectedPatch,
      options: {
        location,
        desktopShortcut,
        autoLaunch,
        enableBetaStream,
      },
    };

    // Simulate a short install delay for UX polish.
    await new Promise((resolve) => setTimeout(resolve, 800));

    onInstall?.(payload);

    setTimeout(() => {
      if (isMountedRef.current) {
        setIsInstalling(false);
      }
    }, 120);
  };

  const allowSkip = Boolean(onSkip) && Boolean(activePatch);

  return (
    <section className="screen installer-screen" aria-live="polite">
      <header className="installer-header">
        <div>
          <span className="installer-kicker">ShiftStrong Deployment</span>
          <h1>Personalized Installer & Launchpad</h1>
          <p>
            Choose the precinct patch that fits your squad&apos;s tempo, confirm
            your install bay, and roll straight into ShiftStrong with neon-trim
            precision.
          </p>
        </div>
        <div className="installer-meta">
          <span>Current Installation</span>
          {activePatch ? (
            <div>
              <strong>
                Patch {activePatch.version} · {activePatch.name}
              </strong>
              <small>
                {activePatch.installedAt
                  ? new Date(activePatch.installedAt).toLocaleString()
                  : "Awaiting deployment"}
              </small>
            </div>
          ) : (
            <div>
              <strong>No patch installed</strong>
              <small>Pick a release to get the diner spinning.</small>
            </div>
          )}
        </div>
      </header>

      <div className="installer-body">
        <div className="patch-picker">
          <h2>
            <FaDownload /> Select Your Patch
          </h2>
          <ul>
            {patches.map((patch) => {
              const isSelected = patch.id === selectedPatchId;
              return (
                <li key={patch.id}>
                  <button
                    type="button"
                    className={isSelected ? "patch-card selected" : "patch-card"}
                    onClick={() => setSelectedPatchId(patch.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="patch-card-header">
                      <span className="patch-version">{patch.version}</span>
                      <span className="patch-name">{patch.name}</span>
                      {patch.recommended && (
                        <span className="patch-recommended">
                          <FaStar /> Recommended
                        </span>
                      )}
                    </div>
                    <dl>
                      <div>
                        <dt>Codename</dt>
                        <dd>{patch.codename}</dd>
                      </div>
                      <div>
                        <dt>Release</dt>
                        <dd>{patch.releaseDate}</dd>
                      </div>
                      <div>
                        <dt>Size</dt>
                        <dd>{patch.size}</dd>
                      </div>
                    </dl>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="patch-details">
          <h3>
            <FaListOl /> Patch Briefing
          </h3>
          {selectedPatch ? (
            <div className="patch-notes">
              <h4>
                {selectedPatch.version} · {selectedPatch.name}
              </h4>
              <ul>
                {selectedPatch.notes?.map((note, index) => (
                  <li key={note}>
                    <FaCheckCircle aria-hidden="true" />
                    <span>
                      <strong>Highlight {index + 1}:</strong> {note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Select a patch to view release notes.</p>
          )}

          <div className="install-preferences">
            <h4>
              <FaFolderOpen /> Installation Bay
            </h4>
            <label className="input-label compact">
              <span>Destination</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="C:/ShiftStrong Precinct"
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={desktopShortcut}
                onChange={(event) => setDesktopShortcut(event.target.checked)}
              />
              <span>Create neon desktop shortcut</span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={autoLaunch}
                onChange={(event) => setAutoLaunch(event.target.checked)}
              />
              <span>Auto-launch after nightly updates</span>
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={enableBetaStream}
                onChange={(event) =>
                  setEnableBetaStream(event.target.checked)
                }
              />
              <span>Enroll in precinct beta stream</span>
            </label>
          </div>
        </aside>
      </div>

      <footer className="installer-footer">
        {allowSkip && (
          <button type="button" className="ghost-button" onClick={onSkip}>
            Skip & Return to Login
          </button>
        )}
        <button
          type="button"
          className="primary-button"
          onClick={handleInstall}
          disabled={!selectedPatch || isInstalling}
        >
          {isInstalling ? (
            <>
              <FaRocket /> Installing...
            </>
          ) : (
            <>
              <FaArrowRight /> Install & Launch
            </>
          )}
        </button>
      </footer>
    </section>
  );
};

export default InstallerLauncher;
