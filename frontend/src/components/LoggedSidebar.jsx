import { AUTH_ROUTES, normalizePath } from "../utils/routes";

const LOGGED_MENU_ITEMS = [
  { label: "Pocetna", href: AUTH_ROUTES.HOME },
  { label: "Kreiranje slucaja", href: AUTH_ROUTES.CREATE_CASE },
  { label: "Profil", href: AUTH_ROUTES.PROFILE },
];

function LoggedSidebar({ activePath, user, onLogout }) {
  const normalizedActivePath = normalizePath(activePath);

  return (
    <aside className="left-sidebar reveal">
      <div className="brand-block">
        <p className="brand-kicker">INSPEKTOR</p>
        <h1>Kontrolni centar istrazitelja</h1>
      </div>

      <section className="user-summary" aria-label="Ulogovani korisnik">
        <p className="user-summary-name">{user.firstName} {user.lastName}</p>
        <p className="user-summary-email">{user.email}</p>
      </section>

      <nav aria-label="Meni za ulogovanog korisnika">
        <ul className="menu-list">
          {LOGGED_MENU_ITEMS.map((item) => {
            const isActive = normalizePath(item.href) === normalizedActivePath;
            const className = `menu-link${isActive ? " is-active" : ""}`;

            return (
              <li key={item.label}>
                <a className={className} href={item.href}>
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
