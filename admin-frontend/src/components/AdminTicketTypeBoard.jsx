import AdminTicketCard from "./AdminTicketCard";
import { getAdminTicketStatusLabel, getTicketTypeLabel } from "./adminHelpers";

function AdminTicketTypeBoard({
  ticketType,
  typeSummary,
  statusesToRender,
  groupedTickets,
  drafts,
  isSavingById,
  messageById,
  onTicketStatusChange,
  onTicketAdminNoteChange,
  onTicketAdminNoteBlur,
}) {
  return (
    <section className={`admin-ticket-type-board admin-ticket-type-${ticketType}`}>
      <div className="admin-ticket-type-board-head">
        <h3>{getTicketTypeLabel(ticketType)}</h3>
        <span className="admin-status-chip">{typeSummary?.total || 0}</span>
      </div>

      {typeSummary?.total === 0 ? (
        <p className="admin-ticket-empty">Nema tiketa ovog tipa za izabrane filtere.</p>
      ) : (
        <div className="admin-ticket-group-list">
          {statusesToRender.map((status) => {
            const statusTickets = groupedTickets[ticketType][status] || [];

            return (
              <section key={`${ticketType}-${status}`} className="admin-ticket-group">
                <div className="admin-ticket-group-head">
                  <h4>{getAdminTicketStatusLabel(status)}</h4>
                  <span className={`admin-status-chip admin-status-${status}`}>
                    {statusTickets.length}
                  </span>
                </div>

                {statusTickets.length === 0 ? (
                  <p className="admin-ticket-empty">Nema tiketa u ovoj statusnoj grupi.</p>
                ) : (
                  <div className="admin-ticket-list">
                    {statusTickets.map((ticket) => {
                      const draft = drafts[ticket.id] || {
                        status: ticket.status,
                        adminNote: ticket.adminNote || "",
                      };
                      const isSaving = Boolean(isSavingById[ticket.id]);

                      return (
                        <AdminTicketCard
                          key={ticket.id}
                          ticket={ticket}
                          draft={draft}
                          isSaving={isSaving}
                          message={messageById[ticket.id] || ""}
                          onStatusChange={(nextStatus) =>
                            onTicketStatusChange(ticket, nextStatus)
                          }
                          onAdminNoteChange={(nextAdminNote) =>
                            onTicketAdminNoteChange(ticket.id, nextAdminNote)
                          }
                          onAdminNoteBlur={(nextAdminNote) =>
                            onTicketAdminNoteBlur(ticket, nextAdminNote)
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminTicketTypeBoard;
