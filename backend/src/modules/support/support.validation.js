const TICKET_TYPES = new Set(["bug_report", "improvement_suggestion"]);

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeTicketType(value) {
  const normalized = toText(value).toLowerCase();
  return TICKET_TYPES.has(normalized) ? normalized : null;
}

export function validateCreateSupportTicketPayload(payload) {
  const errors = {};
  const ticketType = sanitizeTicketType(payload?.ticketType);
  const title = toText(payload?.title);
  const description = toText(payload?.description);
  const appLocation = toText(payload?.appLocation);
  const appVersion = toText(payload?.appVersion);

  if (!ticketType) {
    errors.ticketType = "Tip tiketa mora biti bug_report ili improvement_suggestion.";
  }
  if (title.length < 4) {
    errors.title = "Naslov tiketa mora imati najmanje 4 karaktera.";
  }
  if (title.length > 120) {
    errors.title = "Naslov tiketa moze imati najvise 120 karaktera.";
  }
  if (description.length < 20) {
    errors.description = "Opis tiketa mora imati najmanje 20 karaktera.";
  }
  if (description.length > 5000) {
    errors.description = "Opis tiketa moze imati najvise 5000 karaktera.";
  }
  if (appLocation.length > 160) {
    errors.appLocation = "Lokacija u aplikaciji moze imati najvise 160 karaktera.";
  }
  if (appVersion.length > 40) {
    errors.appVersion = "Verzija aplikacije moze imati najvise 40 karaktera.";
  }

  return {
    errors,
    sanitized: {
      ticketType: ticketType || "bug_report",
      title,
      description,
      appLocation,
      appVersion,
    },
  };
}
