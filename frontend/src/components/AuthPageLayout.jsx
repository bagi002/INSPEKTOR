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
      </main>
    </div>
  );
}

export default AuthPageLayout;
