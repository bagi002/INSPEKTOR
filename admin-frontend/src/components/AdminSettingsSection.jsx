import { useEffect, useState } from "react";

function AdminSettingsSection({ settings, onUpdateActiveAppVersion }) {
  const [activeAppVersion, setActiveAppVersion] = useState(settings.activeAppVersion || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setActiveAppVersion(settings.activeAppVersion || "");
  }, [settings.activeAppVersion]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    const result = await onUpdateActiveAppVersion({
      activeAppVersion,
    });
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.message || "Čuvanje aktivne verzije nije uspelo.");
      return;
    }

    setMessage(result.message || "Aktivna verzija aplikacije je uspešno ažurirana.");
  }

  return (
    <section className="admin-card">
      <h2>Podešavanja</h2>
      <p>Aktivna verzija se automatski popunjava u korisničkoj formi za support tiket.</p>

      <form className="admin-inline-editor" onSubmit={handleSubmit} noValidate>
        <label htmlFor="adminActiveAppVersion">
          Aktivna verzija aplikacije
          <input
            id="adminActiveAppVersion"
            name="activeAppVersion"
            type="text"
            value={activeAppVersion}
            onChange={(event) => {
              setActiveAppVersion(event.target.value);
              setMessage("");
            }}
            placeholder="Npr. main-web-frontend-1.4.0"
          />
        </label>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={isSaving}>
          {isSaving ? "Čuvanje..." : "Sačuvaj aktivnu verziju"}
        </button>
      </form>

      {message ? <p className="admin-feedback">{message}</p> : null}
    </section>
  );
}

export default AdminSettingsSection;
