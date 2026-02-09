import "./styles.css";
import DesktopGate from "./components/DesktopGate";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegistrationPage from "./components/RegistrationPage";
import { PUBLIC_ROUTES, normalizePath } from "./utils/routes";

function App() {
  const currentPath = normalizePath(
    typeof window === "undefined" ? PUBLIC_ROUTES.HOME : window.location.pathname
  );

  let activePage = <LandingPage />;
  if (currentPath === PUBLIC_ROUTES.LOGIN) {
    activePage = <LoginPage />;
  } else if (currentPath === PUBLIC_ROUTES.REGISTRATION) {
    activePage = <RegistrationPage />;
  }

  return (
    <DesktopGate>
      {activePage}
    </DesktopGate>
  );
}

export default App;
