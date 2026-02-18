function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCreateAdminAnnouncementPayload(payload) {
  const errors = {};
  const title = toText(payload?.title);
  const content = toText(payload?.content);

  if (title.length < 3) {
    errors.title = "Naslov obavještenja mora imati najmanje 3 karaktera.";
  } else if (title.length > 160) {
    errors.title = "Naslov obavještenja može imati najviše 160 karaktera.";
  }

  if (content.length < 10) {
    errors.content = "Sadržaj obavještenja mora imati najmanje 10 karaktera.";
  } else if (content.length > 4000) {
    errors.content = "Sadržaj obavještenja može imati najviše 4000 karaktera.";
  }

  return {
    errors,
    sanitized: {
      title,
      content,
    },
  };
}
