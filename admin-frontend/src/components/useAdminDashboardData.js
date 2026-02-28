import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminAnnouncement,
  deleteAdminUser,
  fetchAdminAnnouncements,
  fetchAdminCases,
  fetchAdminOverview,
  fetchAdminSettings,
  fetchAdminTickets,
  fetchAdminUsers,
  updateAdminActiveAppVersion,
  updateAdminPassword,
  updateAdminCase,
  updateAdminTicketStatus,
  updateAdminUser,
} from "../services/adminApi";

const EMPTY_OVERVIEW = {
  usersCount: 0,
  adminsCount: 0,
  casesCount: 0,
  ticketsCount: 0,
  openTicketsCount: 0,
  inProgressTicketsCount: 0,
};
const EMPTY_SETTINGS = { activeAppVersion: "" };

function shouldLogout(allResults, onLogout) {
  const hasUnauthorized = allResults.some((result) => !result.ok && result.unauthorized);
  if (hasUnauthorized) {
    onLogout();
    return true;
  }
  return false;
}

export function useAdminDashboardData(onLogout) {
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const dashboardTabs = useMemo(
    () => [
      { key: "overview", label: "Pregled" },
      { key: "tickets", label: `Ticketi (${overview.ticketsCount})` },
      { key: "announcements", label: `Obavještenja (${announcements.length})` },
      { key: "users", label: `Korisnici (${overview.usersCount})` },
      { key: "cases", label: `Slučajevi (${overview.casesCount})` },
      { key: "settings", label: "Podešavanja" },
    ],
    [announcements.length, overview.casesCount, overview.ticketsCount, overview.usersCount]
  );

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const [
      overviewResult,
      settingsResult,
      ticketsResult,
      announcementsResult,
      usersResult,
      casesResult,
    ] = await Promise.all([
      fetchAdminOverview(),
      fetchAdminSettings(),
      fetchAdminTickets(),
      fetchAdminAnnouncements(),
      fetchAdminUsers(),
      fetchAdminCases(),
    ]);

    const allResults = [
      overviewResult,
      settingsResult,
      ticketsResult,
      announcementsResult,
      usersResult,
      casesResult,
    ];
    if (shouldLogout(allResults, onLogout)) {
      return;
    }

    const failedResult = allResults.find((result) => !result.ok);
    if (failedResult) {
      setErrorMessage(failedResult.message || "Učitavanje admin podataka nije uspelo.");
      setIsLoading(false);
      return;
    }

    setOverview(overviewResult.data?.overview || EMPTY_OVERVIEW);
    setSettings({
      activeAppVersion: settingsResult.data?.activeAppVersion || "",
    });
    setTickets(Array.isArray(ticketsResult.data?.tickets) ? ticketsResult.data.tickets : []);
    setAnnouncements(
      Array.isArray(announcementsResult.data?.announcements)
        ? announcementsResult.data.announcements
        : []
    );
    setUsers(Array.isArray(usersResult.data?.users) ? usersResult.data.users : []);
    setCases(Array.isArray(casesResult.data?.cases) ? casesResult.data.cases : []);
    setIsLoading(false);
  }, [onLogout]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);
  const handleUpdateTicket = useCallback(async (ticketId, payload) => {
    const result = await updateAdminTicketStatus(ticketId, payload);
    if (result.ok) {
      await loadDashboardData();
    } else if (result.unauthorized) {
      onLogout();
    }
    return result;
  }, [loadDashboardData, onLogout]);
  const handleUpdateUser = useCallback(async (userId, payload) => {
    const result = await updateAdminUser(userId, payload);
    if (result.ok) {
      await loadDashboardData();
    } else if (result.unauthorized) {
      onLogout();
    }
    return result;
  }, [loadDashboardData, onLogout]);
  const handleCreateAnnouncement = useCallback(async (payload) => {
    const result = await createAdminAnnouncement(payload);
    if (result.ok) {
      await loadDashboardData();
    } else if (result.unauthorized) {
      onLogout();
    }
    return result;
  }, [loadDashboardData, onLogout]);
  const handleUpdateCase = useCallback(async (caseId, payload) => {
    const result = await updateAdminCase(caseId, payload);
    if (result.ok) {
      await loadDashboardData();
    } else if (result.unauthorized) {
      onLogout();
    }
    return result;
  }, [loadDashboardData, onLogout]);
  const handleDeleteUser = useCallback(async (userId) => {
    const result = await deleteAdminUser(userId);
    if (result.ok) {
      await loadDashboardData();
    } else if (result.unauthorized) {
      onLogout();
    }
    return result;
  }, [loadDashboardData, onLogout]);
  const handleUpdateActiveAppVersion = useCallback(async (payload) => {
    const result = await updateAdminActiveAppVersion(payload);
    if (result.ok) {
      await loadDashboardData();
    } else if (result.unauthorized) {
      onLogout();
    }
    return result;
  }, [loadDashboardData, onLogout]);
  const handleUpdateAdminPassword = useCallback(async (payload) => {
    const result = await updateAdminPassword(payload);
    if (result.unauthorized) {
      onLogout();
    }
    return result;
  }, [onLogout]);
  return {
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
    handleUpdateAdminPassword,
  };
}
