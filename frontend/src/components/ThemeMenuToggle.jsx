import { useCallback, useEffect, useMemo, useState } from "react";
import { getSession } from "../services/sessionStorage";
import {
  applyThemePreference,
  getStoredThemePreference,
  normalizeThemePreference,
  resolveThemePreferenceScope,
  setStoredThemePreference,
} from "../services/themeStorage";

function ThemeMenuToggle() {
  const session = getSession();
  const themeScope = useMemo(() => resolveThemePreferenceScope(session?.user || null), [
    session?.user?.id,
    session?.user?.email,
  ]);
  const [themePreference, setThemePreference] = useState(() => getStoredThemePreference(themeScope));

  useEffect(() => {
    const scopedThemePreference = getStoredThemePreference(themeScope);
    setThemePreference(scopedThemePreference);
    applyThemePreference(scopedThemePreference);
  }, [themeScope]);

  const isDarkTheme = themePreference === "dark";

  const handleThemeToggle = useCallback(() => {
    const nextThemePreference = isDarkTheme ? "light" : "dark";
    const normalizedThemePreference = normalizeThemePreference(nextThemePreference);

    setThemePreference(normalizedThemePreference);
    setStoredThemePreference(normalizedThemePreference, themeScope);
    applyThemePreference(normalizedThemePreference);
  }, [isDarkTheme, themeScope]);

  return (
    <section className="menu-theme-toggle" aria-label="Podesavanje teme interfejsa">
      <div className="menu-theme-toggle-head">
        <p className="menu-theme-toggle-label">Tema interfejsa</p>
        <span className="menu-theme-toggle-state" aria-live="polite">
          {isDarkTheme ? "Tamna" : "Svijetla"}
        </span>
      </div>
      <button
        type="button"
        className={`menu-theme-switch${isDarkTheme ? " is-dark" : ""}`}
        role="switch"
        aria-checked={isDarkTheme}
        aria-label={isDarkTheme ? "Prebaci na svijetlu temu" : "Prebaci na tamnu temu"}
        onClick={handleThemeToggle}
      >
        <span className="menu-theme-switch-icon menu-theme-switch-icon-sun" aria-hidden="true">
          ☀
        </span>
        <span className="menu-theme-switch-icon menu-theme-switch-icon-moon" aria-hidden="true">
          ☾
        </span>
        <span className="menu-theme-switch-thumb" aria-hidden="true" />
      </button>
    </section>
  );
}

export default ThemeMenuToggle;
