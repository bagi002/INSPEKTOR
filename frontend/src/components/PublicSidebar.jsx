import { menuItems } from "../data/publicLandingContent";
import { PUBLIC_ROUTES, normalizePath } from "../utils/routes";

const DEFAULT_NOTE =
  "U neulogovanom rezimu dostupne su kljucne informacije i direktan ulaz ka registraciji i prijavi.";

function PublicSidebar({ activePath = PUBLIC_ROUTES.HOME, noteText = DEFAULT_NOTE }) {
  const normalizedActivePath = normalizePath(activePath);

  return (
    <aside className="left-sidebar reveal">
      <div className="brand-block">
        <p className="brand-kicker">INSPEKTOR</p>
        <h1>Platforma za istrazne slucajeve i takticko razmisljanje</h1>
      </div>

      <nav aria-label="Javni meni">
        <ul className="menu-list">
          {menuItems.map((item) => {
            const isActive = normalizePath(item.href) === normalizedActivePath;
            const linkClassName = `menu-link${isActive ? " is-active" : ""}`;

            return (
              <li key={item.label}>
                <a className={linkClassName} href={item.href}>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-note">
        <p>{noteText}</p>
      </div>
    </aside>
  );
}

export default PublicSidebar;
