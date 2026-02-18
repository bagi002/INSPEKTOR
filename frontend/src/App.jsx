import { useCallback, useEffect, useState } from "react";
import "./styles.css";
import AdminAnnouncementPopup from "./components/AdminAnnouncementPopup";
import CaseWorkspacePage from "./components/CaseWorkspacePage";
import CreateCasePage from "./components/CreateCasePage";
import DesktopGate from "./components/DesktopGate";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import LoggedHomePage from "./components/LoggedHomePage";
import ProfilePage from "./components/ProfilePage";
import RegistrationPage from "./components/RegistrationPage";
import SupportPage from "./components/SupportPage";
import WikiPage from "./components/WikiPage";
import {
  dismissAnnouncement,
  fetchPendingAnnouncements,
} from "./services/announcementsApi";
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
  AUTH_ROUTES.SUPPORT,
];

function App() {
  const currentPath = normalizePath(
    typeof window === "undefined" ? PUBLIC_ROUTES.HOME : window.location.pathname
  );
  const workspacePath = parseCaseWorkspacePath(currentPath);
  const isPrivatePath = PRIVATE_ROUTES.includes(currentPath) || Boolean(workspacePath);
  const session = getSession();
  const isLoggedIn = Boolean(session?.token && session?.user);
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [isClosingAnnouncement, setIsClosingAnnouncement] = useState(false);
  const [announcementErrorMessage, setAnnouncementErrorMessage] = useState("");

  const handleLogout = useCallback(() => {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = PUBLIC_ROUTES.HOME;
    }
  }, []);

  const loadPendingAnnouncements = useCallback(async () => {
    if (!isLoggedIn) {
      setPendingAnnouncements([]);
      setAnnouncementErrorMessage("");
      return;
    }

    const result = await fetchPendingAnnouncements();
    if (!result.ok) {
      if (result.unauthorized) {
        handleLogout();
      }
      return;
    }

    setPendingAnnouncements(
      Array.isArray(result.data?.announcements) ? result.data.announcements : []
    );
    setAnnouncementErrorMessage("");
  }, [handleLogout, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setPendingAnnouncements([]);
      setAnnouncementErrorMessage("");
      return undefined;
    }

    void loadPendingAnnouncements();
    if (typeof window === "undefined") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void loadPendingAnnouncements();
    }, 45000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isLoggedIn, loadPendingAnnouncements]);

  const activeAnnouncement =
    isLoggedIn && pendingAnnouncements.length > 0 ? pendingAnnouncements[0] : null;

  async function handleCloseAnnouncement() {
    if (!activeAnnouncement) {
      return;
    }

    setIsClosingAnnouncement(true);
    const result = await dismissAnnouncement(activeAnnouncement.id);
    setIsClosingAnnouncement(false);

    if (!result.ok) {
      if (result.unauthorized) {
        handleLogout();
        return;
      }
      setAnnouncementErrorMessage(result.message || "Zatvaranje obavjestenja nije uspelo.");
      return;
    }

    setAnnouncementErrorMessage("");
    setPendingAnnouncements((previous) =>
      previous.filter((announcement) => announcement.id !== activeAnnouncement.id)
    );
  }

  let activePage = <LandingPage />;
  if (currentPath === PUBLIC_ROUTES.WIKI) {
    activePage = (
      <WikiPage
        user={isLoggedIn ? session.user : null}
        onLogout={isLoggedIn ? handleLogout : null}
      />
    );
  } else if (!isLoggedIn) {
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
      activePage = <ProfilePage user={session.user} onLogout={handleLogout} />;
    } else if (currentPath === AUTH_ROUTES.SUPPORT) {
      activePage = <SupportPage user={session.user} onLogout={handleLogout} />;
    } else {
      activePage = <LoggedHomePage user={session.user} onLogout={handleLogout} />;
    }
  }

  return (
    <DesktopGate>
      {activePage}
      <AdminAnnouncementPopup
        announcement={activeAnnouncement}
        pendingCount={pendingAnnouncements.length}
        isClosing={isClosingAnnouncement}
        closeErrorMessage={announcementErrorMessage}
        onClose={() => void handleCloseAnnouncement()}
      />
    </DesktopGate>
  );
}

export default App;
