import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminCases,
  fetchAdminOverview,
  fetchAdminTickets,
  fetchAdminUsers,
  updateAdminCase,
  updateAdminTicketStatus,
  updateAdminUser,
} from "../services/adminApi";
import AdminCasesSection from "./AdminCasesSection";
import AdminTicketsSection from "./AdminTicketsSection";
import AdminUsersSection from "./AdminUsersSection";

const EMPTY_OVERVIEW = {
  usersCount: 0,
  adminsCount: 0,
  casesCount: 0,
  ticketsCount: 0,
  openTicketsCount: 0,
  inProgressTicketsCount: 0,
};

function AdminDashboard({ adminUser, onLogout }) {
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const [overviewResult, ticketsResult, usersResult, casesResult] = await Promise.all([
      fetchAdminOverview(),
      fetchAdminTickets(),
      fetchAdminUsers(),
      fetchAdminCases(),
    ]);
    const allResults = [overviewResult, ticketsResult, usersResult, casesResult];

    if (allResults.some((result) => !result.ok && result.unauthorized)) {
      onLogout();
      return;
    }

    const failedResult = allResults.find((result) => !result.ok);
    if (failedResult) {
      setErrorMessage(failedResult.message || "Ucitavanje admin podataka nije uspelo.");
      setIsLoading(false);
      return;
    }

    setOverview(overviewResult.data?.overview || EMPTY_OVERVIEW);
    setTickets(Array.isArray(ticketsResult.data?.tickets) ? ticketsResult.data.tickets : []);
    setUsers(Array.isArray(usersResult.data?.users) ? usersResult.data.users : []);
    setCases(Array.isArray(casesResult.data?.cases) ? casesResult.data.cases : []);
    setIsLoading(false);
  }, [onLogout]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  async function handleUpdateTicket(ticketId, payload) {
    const result = await updateAdminTicketStatus(ticketId, payload);
    if (result.ok) {
      await loadDashboardData();
    }
    if (!result.ok && result.unauthorized) {
      onLogout();
    }
    return result;
  }

  async function handleUpdateUser(userId, payload) {
    const result = await updateAdminUser(userId, payload);
    if (result.ok) {
      await loadDashboardData();
    }
    if (!result.ok && result.unauthorized) {
      onLogout();
    }
    return result;
  }

  async function handleUpdateCase(caseId, payload) {
    const result = await updateAdminCase(caseId, payload);
    if (result.ok) {
      await loadDashboardData();
    }
    if (!result.ok && result.unauthorized) {
      onLogout();
    }
    return result;
  }

  return (
    <main className="admin-shell">
      <section className="admin-card admin-header">
        <div>
          <p className="admin-eyebrow">INSPEKTOR ADMIN PANEL</p>
          <h1>Kontrola sistema</h1>
          <p>
            Ulogovan: <strong>{adminUser.firstName} {adminUser.lastName}</strong> ({adminUser.email})
          </p>
        </div>
        <div className="admin-row">
          <button type="button" className="admin-btn" onClick={() => void loadDashboardData()}>
            Osvezi
          </button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={onLogout}>
            Odjava
          </button>
        </div>
      </section>

      {isLoading ? (
        <section className="admin-card">
          <p>Ucitavanje admin podataka...</p>
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="admin-card">
          <p className="admin-feedback">{errorMessage}</p>
        </section>
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          <section className="admin-card">
            <h2>Brzi pregled</h2>
            <div className="admin-stats-grid">
              <article className="admin-stat"><span>Korisnici</span><strong>{overview.usersCount}</strong></article>
              <article className="admin-stat"><span>Admini</span><strong>{overview.adminsCount}</strong></article>
              <article className="admin-stat"><span>Slucajevi</span><strong>{overview.casesCount}</strong></article>
              <article className="admin-stat"><span>Ticketi</span><strong>{overview.ticketsCount}</strong></article>
              <article className="admin-stat"><span>Open</span><strong>{overview.openTicketsCount}</strong></article>
              <article className="admin-stat"><span>In progress</span><strong>{overview.inProgressTicketsCount}</strong></article>
            </div>
          </section>

          <AdminTicketsSection tickets={tickets} onUpdateTicket={handleUpdateTicket} />
          <AdminUsersSection users={users} onUpdateUser={handleUpdateUser} />
          <AdminCasesSection cases={cases} onUpdateCase={handleUpdateCase} />
        </>
      ) : null}
    </main>
  );
}

export default AdminDashboard;
