export const ADMIN_TICKET_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "reviewed", label: "Pregledan" },
  { value: "in_progress", label: "In progress" },
  { value: "rejected", label: "Odbacen" },
  { value: "closed", label: "Zatvoren" },
];

const TICKET_TYPE_LABELS = {
  bug_report: "Prijava baga",
  improvement_suggestion: "Predlog poboljsanja",
};

export function formatAdminDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("sr-RS", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTicketTypeLabel(value) {
  return TICKET_TYPE_LABELS[value] || "Nepoznato";
}
