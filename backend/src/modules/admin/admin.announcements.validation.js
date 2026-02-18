function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateCreateAdminAnnouncementPayload(payload) {
  const errors = {};
  const title = toText(payload?.title);
  const content = toText(payload?.content);

  if (title.length < 3) {
    errors.title = "Naslov obavjestenja mora imati najmanje 3 karaktera.";
  } else if (title.length > 160) {
    errors.title = "Naslov obavjestenja moze imati najvise 160 karaktera.";
  }

  if (content.length < 10) {
    errors.content = "Sadrzaj obavjestenja mora imati najmanje 10 karaktera.";
  } else if (content.length > 4000) {
    errors.content = "Sadrzaj obavjestenja moze imati najvise 4000 karaktera.";
  }

  return {
    errors,
    sanitized: {
      title,
      content,
    },
  };
}
