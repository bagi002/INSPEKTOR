import { AUTH_ROUTES, PUBLIC_ROUTES, normalizePath } from "../utils/routes";

const ADMIN_PANEL_URL = "http://localhost:5174";

function LoggedSidebar({ activePath, user, onLogout }) {
  const normalizedActivePath = normalizePath(activePath);
  const menuItems = [
    { label: "Početna", href: AUTH_ROUTES.HOME },
    { label: "Kreiranje slučaja", href: AUTH_ROUTES.CREATE_CASE },
    { label: "Podrška", href: AUTH_ROUTES.SUPPORT },
    { label: "Wiki igre", href: PUBLIC_ROUTES.WIKI },
    { label: "Profil", href: AUTH_ROUTES.PROFILE },
  ];

  if (user?.role === "admin") {
    menuItems.push({
      label: "Admin panel",
      href: ADMIN_PANEL_URL,
      external: true,
    });
  }

  return (
    <aside className="left-sidebar reveal">
      <div className="brand-block">
        <p className="brand-kicker">INSPEKTOR</p>
        <h1>Kontrolni centar istražitelja</h1>
      </div>

      <section className="user-summary" aria-label="Ulogovani korisnik">
        <p className="user-summary-name">{user.firstName} {user.lastName}</p>
        <p className="user-summary-email">{user.email}</p>
      </section>

      <nav aria-label="Meni za ulogovanog korisnika">
        <ul className="menu-list">
          {menuItems.map((item) => {
            const isActive =
              !item.external && normalizePath(item.href) === normalizedActivePath;
            const className = `menu-link${isActive ? " is-active" : ""}`;

            return (
              <li key={item.label}>
                <a
                  className={className}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer noopener" : undefined}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <button type="button" className="btn btn-secondary logout-btn" onClick={onLogout}>
        Odjava
      </button>
    </aside>
  );
}

export default LoggedSidebar;
