import {
  formatSupportTicketDate,
  getSupportTicketStatusLabel,
  getSupportTicketTypeLabel,
} from "./supportTicketHelpers";

function SupportTicketList({ isLoadingTickets, ticketErrorMessage, tickets }) {
  if (isLoadingTickets) {
    return <p>Ucitavanje tiketa...</p>;
  }

  if (ticketErrorMessage) {
    return <p className="support-submit-feedback support-submit-feedback-error">{ticketErrorMessage}</p>;
  }

  if (tickets.length === 0) {
    return <p className="empty-state">Jos uvek nemas kreiranih tiketa.</p>;
  }

  return (
    <div className="support-ticket-list">
      {tickets.map((ticket) => (
        <article key={ticket.id} className="support-ticket-item">
          <div className="support-ticket-head">
            <h4>{ticket.title}</h4>
            <span className={`support-status-chip support-status-${ticket.status}`}>
              {getSupportTicketStatusLabel(ticket.status)}
            </span>
          </div>
          <p>{ticket.description}</p>
          <p className="support-ticket-meta">
            Tip: <strong>{getSupportTicketTypeLabel(ticket.ticketType)}</strong> | Lokacija:{" "}
            <strong>{ticket.appLocation || "-"}</strong> | Verzija:{" "}
            <strong>{ticket.appVersion || "-"}</strong>
          </p>
          <p className="support-ticket-meta">
            Kreirano: <strong>{formatSupportTicketDate(ticket.createdAt)}</strong>
          </p>
        </article>
      ))}
    </div>
  );
}

export default SupportTicketList;
