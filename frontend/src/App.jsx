import "./styles.css";
import CaseWorkspacePage from "./components/CaseWorkspacePage";
import CreateCasePage from "./components/CreateCasePage";
import DesktopGate from "./components/DesktopGate";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import LoggedHomePage from "./components/LoggedHomePage";
import LoggedPlaceholderPage from "./components/LoggedPlaceholderPage";
import RegistrationPage from "./components/RegistrationPage";
import { clearSession, getSession } from "./services/sessionStorage";
import {
  AUTH_ROUTES,
  PUBLIC_ROUTES,
  normalizePath,
  parseCaseWorkspacePath,
} from "./utils/routes";

const PRIVATE_ROUTES = [
  AUTH_ROUTES.HOME,
  AUTH_ROUTES.CREATE_CASE,
  AUTH_ROUTES.PROFILE,
];

function App() {
  const currentPath = normalizePath(
    typeof window === "undefined" ? PUBLIC_ROUTES.HOME : window.location.pathname
  );
  const workspacePath = parseCaseWorkspacePath(currentPath);
  const isPrivatePath = PRIVATE_ROUTES.includes(currentPath) || Boolean(workspacePath);
  const session = getSession();
  const isLoggedIn = Boolean(session?.token && session?.user);

  function handleLogout() {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = PUBLIC_ROUTES.HOME;
    }
  }

  let activePage = <LandingPage />;
  if (!isLoggedIn) {
    if (currentPath === PUBLIC_ROUTES.LOGIN || isPrivatePath) {
      activePage = <LoginPage />;
    } else if (currentPath === PUBLIC_ROUTES.REGISTRATION) {
      activePage = <RegistrationPage />;
    }
  } else {
    if (workspacePath) {
      activePage = (
        <CaseWorkspacePage
          user={session.user}
          onLogout={handleLogout}
          caseId={workspacePath.caseId}
          mode={workspacePath.mode}
          activeTabSlug={workspacePath.tabSlug}
        />
      );
    } else if (currentPath === AUTH_ROUTES.CREATE_CASE) {
      activePage = <CreateCasePage user={session.user} onLogout={handleLogout} />;
    } else if (currentPath === AUTH_ROUTES.PROFILE) {
      activePage = (
        <LoggedPlaceholderPage
          title="Profil korisnika"
          description="Ovde ce biti prikaz profila i aktivnosti ulogovanog korisnika."
          activePath={AUTH_ROUTES.PROFILE}
          user={session.user}
          onLogout={handleLogout}
        />
      );
    } else {
      activePage = <LoggedHomePage user={session.user} onLogout={handleLogout} />;
    }
  }

  return (
    <DesktopGate>
      {activePage}
    </DesktopGate>
  );
}

export default App;
