import {
  ADMIN_TICKET_STATUS_OPTIONS,
  formatAdminDate,
  getAdminTicketStatusLabel,
  getTicketTypeLabel,
} from "./adminHelpers";
import "./adminTicketCard.css";

function AdminTicketCard({
  ticket,
  draft,
  isSaving,
  message,
  onStatusChange,
  onAdminNoteChange,
  onAdminNoteBlur,
}) {
  const reporterFirstName = ticket.reporter?.firstName || "-";
  const reporterLastName = ticket.reporter?.lastName || "-";
  const reporterEmail = ticket.reporter?.email || "-";
  const cardClassName = [
    "admin-ticket-item",
    `admin-ticket-item-type-${ticket.ticketType}`,
    `admin-ticket-item-status-${ticket.status}`,
  ].join(" ");

  return (
    <article className={cardClassName}>
      <header className="admin-ticket-item-head">
        <h4>
          #{ticket.id} - {ticket.title}
        </h4>
        <div className="admin-ticket-chip-row">
          <span className={`admin-ticket-type-chip admin-ticket-type-${ticket.ticketType}`}>
            {getTicketTypeLabel(ticket.ticketType)}
          </span>
          <span className={`admin-status-chip admin-status-${ticket.status}`}>
            {getAdminTicketStatusLabel(ticket.status)}
          </span>
        </div>
      </header>

      <p>{ticket.description}</p>
      <p className="admin-meta">
        Korisnik: <strong>{reporterFirstName} {reporterLastName}</strong> ({reporterEmail})
      </p>
      <p className="admin-meta">
        Lokacija: <strong>{ticket.appLocation || "-"}</strong> | Verzija: <strong>{ticket.appVersion || "-"}</strong> | Datum: <strong>{formatAdminDate(ticket.createdAt)}</strong>
      </p>

      <div className="admin-inline-editor admin-ticket-inline-editor">
        <label>
          Status
          <select
            value={draft.status}
            onChange={(event) => onStatusChange(event.target.value)}
            disabled={isSaving}
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
            onChange={(event) => onAdminNoteChange(event.target.value)}
            onBlur={(event) => onAdminNoteBlur(event.target.value)}
            placeholder="Opciona interna napomena"
            disabled={isSaving}
          />
        </label>
      </div>

      {message ? <p className="admin-feedback">{message}</p> : null}
    </article>
  );
}

export default AdminTicketCard;
