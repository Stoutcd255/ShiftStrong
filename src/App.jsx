import React, { useEffect, useMemo, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import InstallerLauncher from "./components/InstallerLauncher";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import HomeScreen from "./components/HomeScreen";
import {
  defaultMacroHistory,
  defaultMacroTargets,
  upsertMacroEntry,
} from "./utils/macroAnalytics";

const USERS_STORAGE_KEY = "shiftstrong.v1.users";
const REMEMBER_EMAIL_KEY = "shiftstrong.v1.rememberedEmail";
const PATCH_STORAGE_KEY = "shiftstrong.v1.installedPatch";
const INSTALL_OPTIONS_KEY = "shiftstrong.v1.installOptions";

const AVAILABLE_PATCHES = [
  {
    id: "1.2.0",
    version: "1.2.0",
    codename: "Silver Shield",
    name: "Silver Shield",
    notes: [
      "Ships the precinct-grade AI Dispatch upgrades for live macro questions.",
      "Adds neon-trimmed compliance dashboards and silver livery accents.",
      "Hardened credential hashing with automatic legacy migration.",
    ],
    size: "312 MB",
    releaseDate: "2024-02-22",
    recommended: true,
  },
  {
    id: "1.1.5",
    version: "1.1.5",
    codename: "Night Patrol",
    name: "Night Patrol",
    notes: [
      "Stabilizes macro logging sync for overnight patrols.",
      "Introduces squad streak tracking and compliance roll ups.",
      "Includes updated diner briefings for conditioning blocks.",
    ],
    size: "284 MB",
    releaseDate: "2023-12-18",
  },
  {
    id: "1.0.9",
    version: "1.0.9",
    codename: "Beat Classic",
    name: "Beat Classic",
    notes: [
      "Original ShiftStrong diner experience with macro tracking essentials.",
      "Baseline AI dispatcher with canned macro quick replies.",
      "Optimized for legacy squad room hardware.",
    ],
    size: "236 MB",
    releaseDate: "2023-07-03",
  },
];

const DEFAULT_INSTALL_OPTIONS = {
  location: "C:/ShiftStrong Precinct",
  desktopShortcut: true,
  autoLaunch: true,
  enableBetaStream: false,
};

const getGlobalCrypto = () => {
  if (typeof window !== "undefined" && window.crypto) {
    return window.crypto;
  }

  if (typeof globalThis !== "undefined" && globalThis.crypto) {
    return globalThis.crypto;
  }

  return undefined;
};

const textEncoder =
  typeof TextEncoder !== "undefined" ? new TextEncoder() : undefined;

const toBase64 = (input) => {
  const bytes =
    input instanceof Uint8Array ? input : new Uint8Array(input || new ArrayBuffer(0));

  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  return "";
};

const fromBase64 = (base64) => {
  if (!base64) {
    return new Uint8Array();
  }

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }

  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  return new Uint8Array();
};

const generateSalt = () => {
  const crypto = getGlobalCrypto();
  const salt = new Uint8Array(16);

  if (crypto?.getRandomValues) {
    crypto.getRandomValues(salt);
    return salt;
  }

  for (let index = 0; index < salt.length; index += 1) {
    salt[index] = Math.floor(Math.random() * 256);
  }

  return salt;
};

const digestSha256 = async (data) => {
  const crypto = getGlobalCrypto();

  if (crypto?.subtle?.digest) {
    return crypto.subtle.digest("SHA-256", data);
  }

  return undefined;
};

const derivePasswordHash = async (password, existingSalt) => {
  if (!password) {
    throw new Error("Password is required for hashing.");
  }

  const saltBytes = existingSalt ? fromBase64(existingSalt) : generateSalt();
  const encoder = textEncoder || new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const merged = new Uint8Array(saltBytes.length + passwordBytes.length);
  merged.set(saltBytes);
  merged.set(passwordBytes, saltBytes.length);

  const digest = await digestSha256(merged.buffer);

  if (digest) {
    return {
      hash: toBase64(new Uint8Array(digest)),
      salt: toBase64(saltBytes),
    };
  }

  // Fallback for environments without Web Crypto support.
  return {
    hash: toBase64(merged),
    salt: toBase64(saltBytes),
  };
};

const migrateLegacyUsers = async (users) => {
  const upgradedUsers = await Promise.all(
    users.map(async (user) => {
      if (user.password && (!user.passwordHash || !user.salt)) {
        try {
          const { hash, salt } = await derivePasswordHash(user.password);
          const { password, ...rest } = user;
          return { ...rest, passwordHash: hash, salt };
        } catch (error) {
          console.warn("Unable to migrate stored password for", user.email, error);
          return user;
        }
      }

      return user;
    })
  );

  return upgradedUsers;
};

const defaultUsers = [
  {
    email: "chief.avery@precinct.gov",
    badgeNumber: "7401",
    name: "Chief Avery",
    passwordHash: "vvR3Yzg3vfzBZpuQZRxawYIaPa2OiySlL21x/STR0H8=",
    salt: "6qg1Gmu3fD4J7nuQLxvP9Q==",
    createdAt: "2024-01-01T05:00:00.000Z",
  },
];

const App = () => {
  const [stage, setStage] = useState("splash");
  const [credentials, setCredentials] = useState({
    email: "",
    badgeNumber: "",
    name: "",
    rememberMe: true,
  });
  const [users, setUsers] = useState(defaultUsers);
  const [isHydrated, setIsHydrated] = useState(false);
  const [macroHistory, setMacroHistory] = useState(defaultMacroHistory);
  const [macroTargets, setMacroTargets] = useState(defaultMacroTargets);
  const [installedPatch, setInstalledPatch] = useState(null);
  const [installPreferences, setInstallPreferences] = useState(
    DEFAULT_INSTALL_OPTIONS
  );

  useEffect(() => {
    if (stage !== "splash") {
      return undefined;
    }

    const timer = setTimeout(() => {
      setStage(installedPatch ? "login" : "installer");
    }, 3500);

    return () => clearTimeout(timer);
  }, [stage, installedPatch]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isMounted = true;

    const hydrate = async () => {
      try {
        const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
        let parsedUsers = defaultUsers;

        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsedUsers = parsed;
          }
        }

        const upgradedUsers = await migrateLegacyUsers(parsedUsers);

        if (!isMounted) {
          return;
        }

        setUsers(upgradedUsers);
        setIsHydrated(true);

        if (storedUsers !== null || upgradedUsers !== defaultUsers) {
          window.localStorage.setItem(
            USERS_STORAGE_KEY,
            JSON.stringify(upgradedUsers)
          );
        }
      } catch (error) {
        console.warn("Unable to hydrate stored ShiftStrong users", error);
        setUsers(defaultUsers);
        setIsHydrated(true);
      }

      const rememberedEmail = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (rememberedEmail) {
        setCredentials((prev) => ({ ...prev, email: rememberedEmail }));
      }

      try {
        const storedPatch = window.localStorage.getItem(PATCH_STORAGE_KEY);
        if (storedPatch) {
          const parsedPatch = JSON.parse(storedPatch);
          if (parsedPatch && typeof parsedPatch === "object") {
            setInstalledPatch(parsedPatch);
          }
        }
      } catch (error) {
        console.warn("Unable to hydrate installed patch", error);
        setInstalledPatch(null);
      }

      try {
        const storedOptions = window.localStorage.getItem(INSTALL_OPTIONS_KEY);
        if (storedOptions) {
          const parsedOptions = JSON.parse(storedOptions);
          if (parsedOptions && typeof parsedOptions === "object") {
            setInstallPreferences((prev) => ({
              ...prev,
              ...parsedOptions,
            }));
          }
        }
      } catch (error) {
        console.warn("Unable to hydrate installer preferences", error);
        setInstallPreferences(DEFAULT_INSTALL_OPTIONS);
      }
    };

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) {
      return;
    }

    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users, isHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (installedPatch) {
      window.localStorage.setItem(
        PATCH_STORAGE_KEY,
        JSON.stringify(installedPatch)
      );
    } else {
      window.localStorage.removeItem(PATCH_STORAGE_KEY);
    }
  }, [installedPatch]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (installPreferences) {
      window.localStorage.setItem(
        INSTALL_OPTIONS_KEY,
        JSON.stringify(installPreferences)
      );
    }
  }, [installPreferences]);

  const savedAccounts = useMemo(
    () =>
      users.map((user) => ({
        email: user.email,
        badgeNumber: user.badgeNumber,
        name: user.name,
      })),
    [users]
  );

  const handleSplashContinue = () =>
    setStage(installedPatch ? "login" : "installer");

  const persistRememberedEmail = (email, remember) => {
    if (typeof window === "undefined") {
      return;
    }

    if (remember) {
      window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  };

  const handleLogin = async ({ email, badgeNumber, password, rememberMe }) => {
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!existingUser) {
      return {
        success: false,
        message: "We couldn\'t locate that precinct email. Please sign up.",
      };
    }

    if (existingUser.passwordHash && existingUser.salt) {
      try {
        const { hash } = await derivePasswordHash(password, existingUser.salt);
        if (hash !== existingUser.passwordHash) {
          return {
            success: false,
            message: "Password mismatch. Confirm your diner counter passphrase.",
          };
        }
      } catch (error) {
        console.warn("Unable to verify password hash", error);
        return {
          success: false,
          message: "We hit a snag verifying your credentials. Try again.",
        };
      }
    } else if (existingUser.password) {
      if (existingUser.password !== password) {
        return {
          success: false,
          message: "Password mismatch. Confirm your diner counter passphrase.",
        };
      }

      try {
        const { hash, salt } = await derivePasswordHash(password);
        setUsers((prev) =>
          prev.map((user) =>
            user.email.toLowerCase() === existingUser.email.toLowerCase()
              ? { ...user, passwordHash: hash, salt, password: undefined }
              : user
          )
        );
      } catch (error) {
        console.warn("Unable to upgrade officer credentials", error);
      }
    } else {
      return {
        success: false,
        message: "No password on record. Please enlist again to continue.",
      };
    }

    if (
      existingUser.badgeNumber &&
      badgeNumber &&
      existingUser.badgeNumber !== badgeNumber.trim()
    ) {
      return {
        success: false,
        message: "Badge number doesn\'t match our roll call ledger.",
      };
    }

    persistRememberedEmail(existingUser.email, rememberMe);
    setCredentials({
      email: existingUser.email,
      badgeNumber: existingUser.badgeNumber,
      name: existingUser.name,
      rememberMe,
    });
    setStage("home");
    return { success: true };
  };

  const handleSignup = async ({ name, email, badgeNumber, password }) => {
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedBadge = badgeNumber.trim();

    if (users.some((user) => user.email.toLowerCase() === sanitizedEmail)) {
      return { success: false, message: "That email is already enrolled." };
    }

    if (
      sanitizedBadge &&
      users.some((user) => user.badgeNumber === sanitizedBadge)
    ) {
      return { success: false, message: "Badge number already registered." };
    }

    let passwordRecord;

    try {
      passwordRecord = await derivePasswordHash(password);
    } catch (error) {
      console.warn("Unable to securely store officer password", error);
      return {
        success: false,
        message: "We weren\'t able to secure that password. Try again.",
      };
    }

    const newUser = {
      name: name.trim() || "Officer",
      email: sanitizedEmail,
      badgeNumber: sanitizedBadge,
      passwordHash: passwordRecord.hash,
      salt: passwordRecord.salt,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    persistRememberedEmail(newUser.email, true);
    setCredentials({
      email: newUser.email,
      badgeNumber: newUser.badgeNumber,
      name: newUser.name,
      rememberMe: true,
    });
    setStage("home");
    return { success: true };
  };

  const handleLogout = () => {
    setStage("login");
    setCredentials((prev) => ({
      email: prev.rememberMe ? prev.email : "",
      badgeNumber: "",
      name: "",
      rememberMe: prev.rememberMe,
    }));
  };

  const handleMacroLog = (entry) => {
    setMacroHistory((prev) => upsertMacroEntry(prev, entry));
  };

  const handleMacroTargetUpdate = (updates) => {
    setMacroTargets((prev) => ({ ...prev, ...updates }));
  };

  const handleInstallPatch = ({ patch, options }) => {
    if (!patch) {
      return;
    }

    const installRecord = {
      id: patch.id,
      version: patch.version,
      codename: patch.codename,
      name: patch.name,
      notes: patch.notes,
      size: patch.size,
      releaseDate: patch.releaseDate,
      installedAt: new Date().toISOString(),
    };

    setInstalledPatch(installRecord);
    const normalizedOptions =
      options && typeof options === "object" ? options : {};
    setInstallPreferences((prev) => ({ ...prev, ...normalizedOptions }));
    setStage("login");
  };

  return (
    <div className={`app-shell stage-${stage}`}>
      {stage === "splash" && (
        <SplashScreen onContinue={handleSplashContinue} />
      )}
      {stage === "installer" && (
        <InstallerLauncher
          patches={AVAILABLE_PATCHES}
          activePatch={installedPatch}
          installPreferences={installPreferences}
          onInstall={handleInstallPatch}
          onSkip={() => setStage("login")}
        />
      )}
      {stage === "login" && (
        <LoginScreen
          onSubmit={handleLogin}
          credentials={credentials}
          onSignupClick={() => setStage("signup")}
          savedAccounts={savedAccounts}
          activePatch={installedPatch}
          installPreferences={installPreferences}
          onPatchChange={() => setStage("installer")}
        />
      )}
      {stage === "signup" && (
        <SignupScreen
          onSubmit={handleSignup}
          onBack={() => setStage("login")}
          existingAccounts={savedAccounts}
        />
      )}
      {stage === "home" && (
        <HomeScreen
          officer={credentials}
          onLogout={handleLogout}
          macroHistory={macroHistory}
          macroTargets={macroTargets}
          onMacroLog={handleMacroLog}
          onMacroTargetUpdate={handleMacroTargetUpdate}
          activePatch={installedPatch}
          installPreferences={installPreferences}
          onPatchChange={() => setStage("installer")}
        />
      )}
    </div>
  );
};

export default App;
