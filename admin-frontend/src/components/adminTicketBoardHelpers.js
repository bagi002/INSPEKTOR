import { ADMIN_TICKET_STATUS_ORDER, ADMIN_TICKET_TYPE_ORDER } from "./adminHelpers";

export const ACTIONABLE_TICKET_STATUSES = new Set(["open", "reviewed", "in_progress"]);

function normalizeText(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function parseTicketSortValue(ticket) {
  const date = new Date(ticket?.createdAt || "");
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function normalizeAdminTicketStatus(value) {
  const normalized = normalizeText(value);
  return ADMIN_TICKET_STATUS_ORDER.includes(normalized) ? normalized : "open";
}

export function normalizeAdminTicketType(value) {
  const normalized = normalizeText(value);
  return ADMIN_TICKET_TYPE_ORDER.includes(normalized) ? normalized : "bug_report";
}

export function normalizeAdminTicketForBoard(ticket) {
  if (!ticket || typeof ticket !== "object") {
    return {
      id: 0,
      ticketType: "bug_report",
      status: "open",
      title: "",
      description: "",
      reporter: null,
      appLocation: "",
      appVersion: "",
      adminNote: "",
      createdAt: null,
    };
  }

  return {
    ...ticket,
    ticketType: normalizeAdminTicketType(ticket.ticketType),
    status: normalizeAdminTicketStatus(ticket.status),
  };
}

function createEmptyStatusMap() {
  const statusMap = {};
  ADMIN_TICKET_STATUS_ORDER.forEach((status) => {
    statusMap[status] = 0;
  });
  return statusMap;
}

function createEmptyMatrix() {
  const matrix = {};
  ADMIN_TICKET_TYPE_ORDER.forEach((ticketType) => {
    matrix[ticketType] = {};
    ADMIN_TICKET_STATUS_ORDER.forEach((status) => {
      matrix[ticketType][status] = [];
    });
  });
  return matrix;
}

function sortTicketsDescByCreatedAt(leftTicket, rightTicket) {
  const dateDiff = parseTicketSortValue(rightTicket) - parseTicketSortValue(leftTicket);
  if (dateDiff !== 0) {
    return dateDiff;
  }
  return Number(rightTicket.id || 0) - Number(leftTicket.id || 0);
}

export function buildTicketTypeStatusMatrix(tickets) {
  const matrix = createEmptyMatrix();

  tickets.forEach((ticket) => {
    const ticketType = normalizeAdminTicketType(ticket.ticketType);
    const status = normalizeAdminTicketStatus(ticket.status);
    matrix[ticketType][status].push(ticket);
  });

  ADMIN_TICKET_TYPE_ORDER.forEach((ticketType) => {
    ADMIN_TICKET_STATUS_ORDER.forEach((status) => {
      matrix[ticketType][status].sort(sortTicketsDescByCreatedAt);
    });
  });

  return matrix;
}

export function buildTicketSummary(tickets) {
  const byStatus = createEmptyStatusMap();
  const byType = {};

  ADMIN_TICKET_TYPE_ORDER.forEach((ticketType) => {
    byType[ticketType] = {
      total: 0,
      actionable: 0,
      byStatus: createEmptyStatusMap(),
    };
  });

  tickets.forEach((ticket) => {
    const ticketType = normalizeAdminTicketType(ticket.ticketType);
    const status = normalizeAdminTicketStatus(ticket.status);

    byStatus[status] += 1;
    byType[ticketType].total += 1;
    byType[ticketType].byStatus[status] += 1;
    if (ACTIONABLE_TICKET_STATUSES.has(status)) {
      byType[ticketType].actionable += 1;
    }
  });

  const actionable = ADMIN_TICKET_STATUS_ORDER.reduce((total, status) => {
    if (!ACTIONABLE_TICKET_STATUSES.has(status)) {
      return total;
    }
    return total + byStatus[status];
  }, 0);

  return {
    total: tickets.length,
    actionable,
    byStatus,
    byType,
  };
}

function buildTicketSearchText(ticket) {
  return [
    ticket.id,
    ticket.title,
    ticket.description,
    ticket.reporter?.firstName,
    ticket.reporter?.lastName,
    ticket.reporter?.email,
    ticket.appLocation,
    ticket.appVersion,
    ticket.adminNote,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function filterAdminTickets(tickets, filters) {
  const query = normalizeText(filters?.query);
  const selectedType = normalizeText(filters?.ticketType) || "all";
  const selectedStatus = normalizeText(filters?.status) || "all";
  const onlyActionable = Boolean(filters?.onlyActionable);

  return tickets.filter((ticket) => {
    const ticketType = normalizeAdminTicketType(ticket.ticketType);
    const status = normalizeAdminTicketStatus(ticket.status);

    if (selectedType !== "all" && selectedType !== ticketType) {
      return false;
    }

    if (selectedStatus !== "all" && selectedStatus !== status) {
      return false;
    }

    if (onlyActionable && !ACTIONABLE_TICKET_STATUSES.has(status)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return buildTicketSearchText(ticket).includes(query);
  });
}
