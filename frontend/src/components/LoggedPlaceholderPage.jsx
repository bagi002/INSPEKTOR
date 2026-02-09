import LoggedSidebar from "./LoggedSidebar";

function LoggedPlaceholderPage({ title, description, activePath, user, onLogout }) {
  return (
    <div className="app-shell app-shell-logged">
      <LoggedSidebar activePath={activePath} user={user} onLogout={onLogout} />

      <main className="content logged-content">
        <section className="card logged-hero reveal delay-1">
          <p className="eyebrow">Modul u pripremi</p>
          <h2>{title}</h2>
          <p>{description}</p>
          <p>
            Ova sekcija je rezervisana za narednu fazu implementacije. Navigacija
            je vec spremna i povezana sa ulogovanim menijem.
          </p>
        </section>
      </main>
    </div>
  );
}

export default LoggedPlaceholderPage;
