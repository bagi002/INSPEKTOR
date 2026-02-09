import PublicSidebar from "./PublicSidebar";

function AuthPageLayout({
  activePath,
  eyebrow,
  title,
  description,
  sidebarNote,
  children,
}) {
  return (
    <div className="app-shell app-shell-auth">
      <PublicSidebar activePath={activePath} noteText={sidebarNote} />

      <main className="content auth-content">
        <section className="card auth-hero reveal delay-1">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </section>

        <section className="card auth-form-card reveal delay-2">{children}</section>

        <section className="card auth-note-card reveal delay-3">
          <h3>Bezbednosna napomena</h3>
          <p>
            Autentifikacija koristi backend API sa SQLite bazom, dok se token
            uspesne prijave cuva lokalno u browseru radi odrzavanja sesije na
            klijentu.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AuthPageLayout;
