import { useEffect, useState } from "react";

const initialPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AdminSettingsSection({ settings, onUpdateActiveAppVersion, onUpdatePassword }) {
  const [activeAppVersion, setActiveAppVersion] = useState(settings.activeAppVersion || "");
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [versionMessage, setVersionMessage] = useState("");

  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setActiveAppVersion(settings.activeAppVersion || "");
  }, [settings.activeAppVersion]);

  async function handleActiveVersionSubmit(event) {
    event.preventDefault();
    setVersionMessage("");
    setIsSavingVersion(true);

    const result = await onUpdateActiveAppVersion({
      activeAppVersion,
    });
    setIsSavingVersion(false);

    if (!result.ok) {
      setVersionMessage(result.message || "Čuvanje aktivne verzije nije uspelo.");
      return;
    }

    setVersionMessage(result.message || "Aktivna verzija aplikacije je uspešno ažurirana.");
  }

  function handlePasswordInputChange(event) {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
    setPasswordErrors((previous) => ({ ...previous, [name]: "" }));
    setPasswordMessage("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordErrors({});
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({
        confirmPassword: "Potvrda lozinke mora biti ista kao nova lozinka.",
      });
      return;
    }

    setIsSavingPassword(true);
    const result = await onUpdatePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setIsSavingPassword(false);

    if (!result.ok) {
      setPasswordErrors(result.errors || {});
      setPasswordMessage(result.message || "Promjena lozinke nije uspela.");
      return;
    }

    setPasswordForm(initialPasswordForm);
    setPasswordMessage(result.message || "Lozinka je uspešno izmenjena.");
  }

  return (
    <section className="admin-card">
      <h2>Podešavanja</h2>
      <p>Aktivna verzija se automatski popunjava u korisničkoj formi za support tiket.</p>

      <form className="admin-inline-editor" onSubmit={handleActiveVersionSubmit} noValidate>
        <label htmlFor="adminActiveAppVersion">
          Aktivna verzija aplikacije
          <input
            id="adminActiveAppVersion"
            name="activeAppVersion"
            type="text"
            value={activeAppVersion}
            onChange={(event) => {
              setActiveAppVersion(event.target.value);
              setVersionMessage("");
            }}
            placeholder="Npr. main-web-frontend-1.4.0"
          />
        </label>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={isSavingVersion}>
          {isSavingVersion ? "Čuvanje..." : "Sačuvaj aktivnu verziju"}
        </button>
      </form>

      {versionMessage ? <p className="admin-feedback">{versionMessage}</p> : null}

      <hr />

      <h3>Promjena administratorske lozinke</h3>
      <form className="admin-inline-editor" onSubmit={handlePasswordSubmit} noValidate>
        <label htmlFor="adminCurrentPassword">
          Trenutna lozinka
          <input
            id="adminCurrentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordInputChange}
            placeholder="Unesi trenutnu lozinku"
          />
          {passwordErrors.currentPassword ? (
            <span className="admin-error">{passwordErrors.currentPassword}</span>
          ) : null}
        </label>

        <label htmlFor="adminNewPassword">
          Nova lozinka
          <input
            id="adminNewPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={passwordForm.newPassword}
            onChange={handlePasswordInputChange}
            placeholder="Unesi novu lozinku"
          />
          {passwordErrors.newPassword ? (
            <span className="admin-error">{passwordErrors.newPassword}</span>
          ) : null}
        </label>

        <label htmlFor="adminConfirmPassword">
          Potvrda nove lozinke
          <input
            id="adminConfirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordInputChange}
            placeholder="Ponovi novu lozinku"
          />
          {passwordErrors.confirmPassword ? (
            <span className="admin-error">{passwordErrors.confirmPassword}</span>
          ) : null}
        </label>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={isSavingPassword}>
          {isSavingPassword ? "Čuvanje..." : "Promjeni lozinku"}
        </button>
      </form>

      {passwordMessage ? <p className="admin-feedback">{passwordMessage}</p> : null}
    </section>
  );
}

export default AdminSettingsSection;
