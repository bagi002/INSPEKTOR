import { menuItems } from "../data/publicLandingContent";
import { PUBLIC_ROUTES, normalizePath } from "../utils/routes";

function PublicSidebar({ activePath = PUBLIC_ROUTES.HOME, noteText = "" }) {
  const normalizedActivePath = normalizePath(activePath);
  const resolvedNoteText = typeof noteText === "string" ? noteText.trim() : "";

  return (
    <aside className="left-sidebar reveal">
      <div className="brand-block">
        <p className="brand-kicker">INSPEKTOR</p>
        <h1>Platforma za istražne slučajeve i taktičko razmišljanje</h1>
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

      {resolvedNoteText ? (
        <div className="sidebar-note">
          <p>{resolvedNoteText}</p>
        </div>
      ) : null}
    </aside>
  );
}

export default PublicSidebar;
