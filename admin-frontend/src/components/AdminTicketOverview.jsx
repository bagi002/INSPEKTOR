import {
  ADMIN_TICKET_STATUS_ORDER,
  ADMIN_TICKET_TYPE_ORDER,
  getAdminTicketStatusLabel,
  getTicketTypeLabel,
} from "./adminHelpers";

function AdminTicketOverview({ summary }) {
  return (
    <>
      <div className="admin-ticket-board-head">
        <h2>Support ticketi</h2>
        <p>
          Ticketi su organizovani po tipu i statusu kako bi prioriteti i operativni backlog bili
          jasniji tokom administracije.
        </p>
      </div>

      <div className="admin-ticket-status-grid">
        {ADMIN_TICKET_STATUS_ORDER.map((status) => (
          <article key={status} className="admin-stat">
            <span>{getAdminTicketStatusLabel(status)}</span>
            <strong>{summary.byStatus[status] || 0}</strong>
          </article>
        ))}
      </div>

      <div className="admin-ticket-type-overview-grid">
        {ADMIN_TICKET_TYPE_ORDER.map((ticketType) => {
          const ticketTypeSummary = summary.byType[ticketType];
          return (
            <article
              key={ticketType}
              className={`admin-ticket-type-overview admin-ticket-type-${ticketType}`}
            >
              <h3>{getTicketTypeLabel(ticketType)}</h3>
              <p>
                Ukupno: <strong>{ticketTypeSummary?.total || 0}</strong>
              </p>
              <p>
                Aktivni: <strong>{ticketTypeSummary?.actionable || 0}</strong>
              </p>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default AdminTicketOverview;
