export const SUPPORT_TICKET_TYPES = [
  { value: "bug_report", label: "Prijava baga" },
  { value: "improvement_suggestion", label: "Predlog poboljsanja" },
];

const STATUS_LABELS = {
  open: "Open",
  reviewed: "Pregledan",
  in_progress: "In progress",
  rejected: "Odbacen",
  closed: "Zatvoren",
};

export function getSupportTicketStatusLabel(status) {
  return STATUS_LABELS[status] || "Nepoznato";
}

export function getSupportTicketTypeLabel(type) {
  const found = SUPPORT_TICKET_TYPES.find((item) => item.value === type);
  return found ? found.label : "Nepoznat tip";
}

export function formatSupportTicketDate(value) {
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
