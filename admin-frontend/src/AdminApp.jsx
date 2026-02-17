import { useMemo, useState } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AdminLoginView from "./components/AdminLoginView";
import { clearAdminSession, loadAdminSession } from "./services/adminApi";

function AdminApp() {
  const initialSession = useMemo(() => loadAdminSession(), []);
  const [session, setSession] = useState(initialSession);

  function handleLoginSuccess(resultData) {
    setSession({
      token: resultData?.token || "",
      user: resultData?.user || null,
    });
  }

  function handleLogout() {
    clearAdminSession();
    setSession(null);
  }

  if (!session?.token || !session?.user) {
    return <AdminLoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard adminUser={session.user} onLogout={handleLogout} />;
}

export default AdminApp;
