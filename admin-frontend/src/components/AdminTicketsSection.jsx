import { useEffect, useMemo, useState } from "react";
import AdminTicketFilters from "./AdminTicketFilters";
import AdminTicketOverview from "./AdminTicketOverview";
import AdminTicketTypeBoard from "./AdminTicketTypeBoard";
import {
  ADMIN_TICKET_STATUS_ORDER,
  ADMIN_TICKET_TYPE_ORDER,
} from "./adminHelpers";
import {
  buildTicketSummary,
  buildTicketTypeStatusMatrix,
  filterAdminTickets,
  normalizeAdminTicketForBoard,
} from "./adminTicketBoardHelpers";
import "./adminTickets.css";

const DEFAULT_FILTERS = {
  query: "",
  ticketType: "all",
  status: "all",
  onlyActionable: false,
};

function buildDraftsByTicketId(tickets) {
  const nextDrafts = {};
  tickets.forEach((ticket) => {
    nextDrafts[ticket.id] = {
      status: ticket.status || "open",
      adminNote: ticket.adminNote || "",
    };
  });
  return nextDrafts;
}

function resolveDraftForTicket(drafts, ticket) {
  const fallbackDraft = {
    status: ticket.status || "open",
    adminNote: ticket.adminNote || "",
  };
  return drafts[ticket.id] || fallbackDraft;
}

function AdminTicketsSection({ tickets, onUpdateTicket }) {
  const [drafts, setDrafts] = useState({});
  const [isSavingById, setIsSavingById] = useState({});
  const [messageById, setMessageById] = useState({});
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const normalizedTickets = useMemo(
    () => tickets.map((ticket) => normalizeAdminTicketForBoard(ticket)),
    [tickets]
  );
  const allSummary = useMemo(() => buildTicketSummary(normalizedTickets), [normalizedTickets]);

  const filteredTickets = useMemo(
    () => filterAdminTickets(normalizedTickets, filters),
    [normalizedTickets, filters]
  );
  const filteredSummary = useMemo(() => buildTicketSummary(filteredTickets), [filteredTickets]);
  const groupedTickets = useMemo(
    () => buildTicketTypeStatusMatrix(filteredTickets),
    [filteredTickets]
  );

  const statusesToRender =
    filters.status === "all" ? ADMIN_TICKET_STATUS_ORDER : [filters.status];

  useEffect(() => {
    setDrafts(buildDraftsByTicketId(normalizedTickets));
  }, [normalizedTickets]);

  function handleFilterChange(fieldName, value) {
    setFilters((previous) => ({
      ...previous,
      [fieldName]: value,
    }));
  }

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

  async function persistTicketUpdate(ticketId, payload, successMessage) {
    setIsSavingById((previous) => ({ ...previous, [ticketId]: true }));
    const result = await onUpdateTicket(ticketId, payload);
    setIsSavingById((previous) => ({ ...previous, [ticketId]: false }));

    if (!result.ok) {
      setMessageById((previous) => ({
        ...previous,
        [ticketId]: result.message || "Cuvanje izmjene nije uspelo.",
      }));
      return;
    }

    setMessageById((previous) => ({
      ...previous,
      [ticketId]: result.message || successMessage,
    }));
  }

  async function handleTicketStatusChange(ticket, nextStatus) {
    const currentDraft = resolveDraftForTicket(drafts, ticket);
    if (currentDraft.status === nextStatus) {
      return;
    }

    const nextDraft = {
      ...currentDraft,
      status: nextStatus,
    };

    handleDraftChange(ticket.id, "status", nextStatus);
    await persistTicketUpdate(
      ticket.id,
      nextDraft,
      "Status tiketa je automatski sacuvan."
    );
  }

  function handleTicketAdminNoteChange(ticketId, nextAdminNote) {
    handleDraftChange(ticketId, "adminNote", nextAdminNote);
  }

  async function handleTicketAdminNoteBlur(ticket, nextAdminNote) {
    const currentDraft = resolveDraftForTicket(drafts, ticket);
    const sanitizedNextAdminNote =
      typeof nextAdminNote === "string" ? nextAdminNote : currentDraft.adminNote;
    const nextDraft = {
      ...currentDraft,
      adminNote: sanitizedNextAdminNote,
    };
    const currentAdminNote = ticket.adminNote || "";
    if (nextDraft.adminNote === currentAdminNote) {
      return;
    }

    await persistTicketUpdate(
      ticket.id,
      nextDraft,
      "Admin napomena je automatski sacuvana."
    );
  }

  return (
    <section className="admin-card admin-ticket-board">
      <AdminTicketOverview summary={allSummary} />

      <AdminTicketFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <p className="admin-meta">
        Prikazano <strong>{filteredSummary.total}</strong> od ukupno <strong>{allSummary.total}</strong> tiketa.
      </p>

      {filteredSummary.total === 0 ? (
        <p className="admin-ticket-empty">Nema tiketa za izabrane filtere.</p>
      ) : (
        <div className="admin-ticket-type-board-list">
          {ADMIN_TICKET_TYPE_ORDER.map((ticketType) => (
            <AdminTicketTypeBoard
              key={ticketType}
              ticketType={ticketType}
              typeSummary={filteredSummary.byType[ticketType]}
              statusesToRender={statusesToRender}
              groupedTickets={groupedTickets}
              drafts={drafts}
              isSavingById={isSavingById}
              messageById={messageById}
              onTicketStatusChange={(ticket, nextStatus) =>
                void handleTicketStatusChange(ticket, nextStatus)
              }
              onTicketAdminNoteChange={handleTicketAdminNoteChange}
              onTicketAdminNoteBlur={(ticket, nextAdminNote) =>
                void handleTicketAdminNoteBlur(ticket, nextAdminNote)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminTicketsSection;
