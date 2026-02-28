const THEME_OPTIONS = [
  {
    value: "light",
    label: "Svijetla tema",
    description: "Jasniji prikaz sa svijetlim povrsinama i plavim akcentima.",
  },
  {
    value: "dark",
    label: "Tamna tema",
    description: "Tamniji prikaz sa visokim kontrastom za rad u slabijem svjetlu.",
  },
];

function ProfileThemeForm({ themePreference, onThemeChange }) {
  return (
    <section className="card profile-theme-card reveal delay-3">
      <h3>Tema interfejsa</h3>
      <p className="profile-theme-description">
        Izaberi temu koja ti trenutno najvise odgovara.
      </p>

      <div className="profile-theme-options" role="group" aria-label="Izbor teme">
        {THEME_OPTIONS.map((option) => {
          const isActive = themePreference === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={`profile-theme-option${isActive ? " is-active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onThemeChange(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ProfileThemeForm;
