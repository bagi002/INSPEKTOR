import { useEffect, useState } from "react";
import {
  ADMIN_TICKET_STATUS_OPTIONS,
  formatAdminDate,
  getTicketTypeLabel,
} from "./adminHelpers";

function AdminTicketsSection({ tickets, onUpdateTicket }) {
  const [drafts, setDrafts] = useState({});
  const [isSavingById, setIsSavingById] = useState({});
  const [messageById, setMessageById] = useState({});

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
      {tickets.length === 0 ? <p>Nema prijavljenih tiketa.</p> : null}

      {tickets.length > 0 ? (
        <div className="admin-ticket-list">
          {tickets.map((ticket) => {
            const draft = drafts[ticket.id] || { status: "open", adminNote: "" };
            const isSaving = Boolean(isSavingById[ticket.id]);

            return (
              <article key={ticket.id} className="admin-ticket-item">
                <h3>#{ticket.id} - {ticket.title}</h3>
                <p>{ticket.description}</p>
                <p className="admin-meta">
                  Tip: <strong>{getTicketTypeLabel(ticket.ticketType)}</strong> | Korisnik:{" "}
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
      ) : null}
    </section>
  );
}

export default AdminTicketsSection;
