import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_TICKET_STATUS_ORDER,
  ADMIN_TICKET_STATUS_OPTIONS,
  formatAdminDate,
  getAdminTicketStatusLabel,
  getTicketTypeLabel,
} from "./adminHelpers";

function parseTicketSortValue(ticket) {
  const date = new Date(ticket?.createdAt || "");
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function AdminTicketsSection({ tickets, onUpdateTicket }) {
  const [drafts, setDrafts] = useState({});
  const [isSavingById, setIsSavingById] = useState({});
  const [messageById, setMessageById] = useState({});
  const groupedTickets = useMemo(() => {
    const byStatus = {};
    ADMIN_TICKET_STATUS_ORDER.forEach((status) => {
      byStatus[status] = [];
    });
    tickets.forEach((ticket) => {
      const status = ADMIN_TICKET_STATUS_ORDER.includes(ticket.status) ? ticket.status : "open";
      if (!byStatus[status]) {
        byStatus[status] = [];
      }
      byStatus[status].push(ticket);
    });
    Object.keys(byStatus).forEach((status) => {
      byStatus[status].sort((leftTicket, rightTicket) => {
        const dateDiff = parseTicketSortValue(rightTicket) - parseTicketSortValue(leftTicket);
        if (dateDiff !== 0) {
          return dateDiff;
        }
        return Number(rightTicket.id || 0) - Number(leftTicket.id || 0);
      });
    });
    return byStatus;
  }, [tickets]);

  useEffect(() => {
    const nextDrafts = {};
    tickets.forEach((ticket) => {
      nextDrafts[ticket.id] = {
        status: ticket.status || "open",
        adminNote: ticket.adminNote || "",
      };
    });
    setDrafts(nextDrafts);
  }, [tickets]);

  function handleDraftChange(ticketId, fieldName, value) {
    setDrafts((previous) => ({
      ...previous,
      [ticketId]: {
        ...(previous[ticketId] || {}),
        [fieldName]: value,
      },
    }));
    setMessageById((previous) => ({ ...previous, [ticketId]: "" }));
  }

  async function handleSave(ticketId) {
    const payload = drafts[ticketId];
    if (!payload) {
      return;
    }
    setIsSavingById((previous) => ({ ...previous, [ticketId]: true }));
    const result = await onUpdateTicket(ticketId, payload);
    setIsSavingById((previous) => ({ ...previous, [ticketId]: false }));
    if (!result.ok) {
      setMessageById((previous) => ({
        ...previous,
        [ticketId]: result.message || "Čuvanje izmjene nije uspelo.",
      }));
      return;
    }
    setMessageById((previous) => ({
      ...previous,
      [ticketId]: result.message || "Tiket je uspešno ažuriran.",
    }));
  }

  return (
    <section className="admin-card">
      <h2>Support ticketi</h2>
      <div className="admin-ticket-status-grid">
        {ADMIN_TICKET_STATUS_ORDER.map((status) => (
          <article key={status} className="admin-stat">
            <span>{getAdminTicketStatusLabel(status)}</span>
            <strong>{groupedTickets[status]?.length || 0}</strong>
          </article>
        ))}
      </div>

      {tickets.length === 0 ? <p>Nema prijavljenih tiketa.</p> : null}

      {tickets.length > 0 ? (
        <div className="admin-ticket-group-list">
          {ADMIN_TICKET_STATUS_ORDER.map((status) => {
            const statusTickets = groupedTickets[status] || [];

            return (
              <section key={status} className="admin-ticket-group">
                <div className="admin-ticket-group-head">
                  <h3>{getAdminTicketStatusLabel(status)}</h3>
                  <span className={`admin-status-chip admin-status-${status}`}>
                    {statusTickets.length}
                  </span>
                </div>
                {statusTickets.length === 0 ? (
                  <p>Nema tiketa u ovoj statusnoj grupi.</p>
                ) : (
                  <div className="admin-ticket-list">
                    {statusTickets.map((ticket) => {
                      const draft = drafts[ticket.id] || { status: "open", adminNote: "" };
                      const isSaving = Boolean(isSavingById[ticket.id]);

                      return (
                        <article key={ticket.id} className="admin-ticket-item">
                          <h3>#{ticket.id} - {ticket.title}</h3>
                          <p>{ticket.description}</p>
                          <p className="admin-meta">
                            Tip: <strong>{getTicketTypeLabel(ticket.ticketType)}</strong> |
                            Korisnik:{" "}
                            <strong>
                              {ticket.reporter?.firstName} {ticket.reporter?.lastName}
                            </strong>{" "}
                            ({ticket.reporter?.email})
                          </p>
                          <p className="admin-meta">
                            Lokacija: <strong>{ticket.appLocation || "-"}</strong> | Verzija:{" "}
                            <strong>{ticket.appVersion || "-"}</strong> | Datum:{" "}
                            <strong>{formatAdminDate(ticket.createdAt)}</strong>
                          </p>

                          <div className="admin-inline-editor">
                            <label>
                              Status
                              <select
                                value={draft.status}
                                onChange={(event) =>
                                  handleDraftChange(ticket.id, "status", event.target.value)
                                }
                              >
                                {ADMIN_TICKET_STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label>
                              Admin napomena
                              <textarea
                                rows={3}
                                value={draft.adminNote}
                                onChange={(event) =>
                                  handleDraftChange(ticket.id, "adminNote", event.target.value)
                                }
                                placeholder="Opciona interna napomena"
                              />
                            </label>

                            <button
                              type="button"
                              className="admin-btn admin-btn-primary"
                              onClick={() => void handleSave(ticket.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Čuvanje..." : "Sačuvaj status"}
                            </button>
                          </div>

                          {messageById[ticket.id] ? (
                            <p className="admin-feedback">{messageById[ticket.id]}</p>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

export default AdminTicketsSection;
