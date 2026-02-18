import { useState } from "react";
import AdminAnnouncementsSection from "./AdminAnnouncementsSection";
import AdminCasesSection from "./AdminCasesSection";
import AdminOverviewSection from "./AdminOverviewSection";
import AdminSettingsSection from "./AdminSettingsSection";
import AdminTicketsSection from "./AdminTicketsSection";
import AdminUsersSection from "./AdminUsersSection";
import { useAdminDashboardData } from "./useAdminDashboardData";

function AdminDashboard({ adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    overview,
    settings,
    tickets,
    announcements,
    users,
    cases,
    isLoading,
    errorMessage,
    dashboardTabs,
    loadDashboardData,
    handleUpdateTicket,
    handleUpdateUser,
    handleCreateAnnouncement,
    handleUpdateCase,
    handleDeleteUser,
    handleUpdateActiveAppVersion,
  } = useAdminDashboardData(onLogout);

  function renderTabSection() {
    switch (activeTab) {
      case "tickets":
        return <AdminTicketsSection tickets={tickets} onUpdateTicket={handleUpdateTicket} />;
      case "announcements":
        return (
          <AdminAnnouncementsSection
            announcements={announcements}
            onCreateAnnouncement={handleCreateAnnouncement}
          />
        );
      case "users":
        return (
          <AdminUsersSection
            users={users}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case "cases":
        return <AdminCasesSection cases={cases} onUpdateCase={handleUpdateCase} />;
      case "settings":
        return (
          <AdminSettingsSection
            settings={settings}
            onUpdateActiveAppVersion={handleUpdateActiveAppVersion}
          />
        );
      case "overview":
      default:
        return (
          <AdminOverviewSection
            overview={overview}
            activeAppVersion={settings.activeAppVersion}
          />
        );
    }
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
            Osveži
          </button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={onLogout}>
            Odjava
          </button>
        </div>
      </section>

      {isLoading ? (
        <section className="admin-card">
          <p>Učitavanje admin podataka...</p>
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
            <div className="admin-tabs" role="tablist" aria-label="Admin sekcije">
              {dashboardTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`admin-tab-btn ${activeTab === tab.key ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>
          {renderTabSection()}
        </>
      ) : null}
    </main>
  );
}

export default AdminDashboard;
