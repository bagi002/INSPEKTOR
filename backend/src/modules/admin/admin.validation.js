const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_ROLES = new Set(["user", "admin"]);
const CASE_PUBLICATION_STATUSES = new Set(["draft", "published"]);
const SUPPORT_TICKET_STATUSES = new Set(["open", "reviewed", "in_progress", "rejected", "closed"]);

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalText(value) {
  if (value === undefined || value === null) {
    return undefined;
  }
  return toText(value);
}

function toInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parsePositiveId(value) {
  const parsed = toInteger(value);
  if (!parsed || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function validateAdminLoginPayload(payload) {
  const errors = {};
  const email = toText(payload?.email).toLowerCase();
  const password = typeof payload?.password === "string" ? payload.password : "";
  const panelPassword = typeof payload?.panelPassword === "string" ? payload.panelPassword : "";

  if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Unesi ispravnu email adresu.";
  }
  if (password.length < 8) {
    errors.password = "Lozinka mora imati najmanje 8 karaktera.";
  }
  if (panelPassword.length < 4) {
    errors.panelPassword = "Unesi lozinku za admin panel.";
  }

  return { errors, sanitized: { email, password, panelPassword } };
}

export function validateAdminTicketStatusPayload(payload) {
  const errors = {};
  const normalizedStatus = toText(payload?.status).toLowerCase();
  const status = SUPPORT_TICKET_STATUSES.has(normalizedStatus) ? normalizedStatus : null;
  const adminNote = toText(payload?.adminNote);

  if (!status) {
    errors.status = "Status tiketa nije podržan.";
  }
  if (adminNote.length > 2000) {
    errors.adminNote = "Admin napomena može imati najviše 2000 karaktera.";
  }

  return { errors, sanitized: { status: status || "open", adminNote } };
}

export function validateAdminUserPatchPayload(payload) {
  const errors = {};
  const updates = {};

  const firstName = toOptionalText(payload?.firstName);
  if (firstName !== undefined) {
    if (firstName.length < 2) {
      errors.firstName = "Ime mora imati najmanje 2 karaktera.";
    } else if (firstName.length > 80) {
      errors.firstName = "Ime može imati najviše 80 karaktera.";
    } else {
      updates.firstName = firstName;
    }
  }

  const lastName = toOptionalText(payload?.lastName);
  if (lastName !== undefined) {
    if (lastName.length < 2) {
      errors.lastName = "Prezime mora imati najmanje 2 karaktera.";
    } else if (lastName.length > 80) {
      errors.lastName = "Prezime može imati najviše 80 karaktera.";
    } else {
      updates.lastName = lastName;
    }
  }

  const email = toOptionalText(payload?.email);
  if (email !== undefined) {
    const normalizedEmail = email.toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      errors.email = "Email nije validan.";
    } else {
      updates.email = normalizedEmail;
    }
  }

  const roleCandidate = toOptionalText(payload?.role);
  if (roleCandidate !== undefined) {
    const normalizedRole = roleCandidate.toLowerCase();
    if (!USER_ROLES.has(normalizedRole)) {
      errors.role = "Rola mora biti user ili admin.";
    } else {
      updates.role = normalizedRole;
    }
  }

  if (Object.keys(updates).length === 0 && Object.keys(errors).length === 0) {
    errors.general = "Potrebno je poslati bar jedno polje za izmenu.";
  }
  return { errors, sanitized: updates };
}

export function validateAdminCasePatchPayload(payload) {
  const errors = {};
  const updates = {};

  const title = toOptionalText(payload?.title);
  if (title !== undefined) {
    if (title.length < 3) {
      errors.title = "Naziv slučaja mora imati najmanje 3 karaktera.";
    } else if (title.length > 220) {
      errors.title = "Naziv slučaja može imati najviše 220 karaktera.";
    } else {
      updates.title = title;
    }
  }

  const description = toOptionalText(payload?.description);
  if (description !== undefined) {
    if (description.length < 20) {
      errors.description = "Opis slučaja mora imati najmanje 20 karaktera.";
    } else if (description.length > 15000) {
      errors.description = "Opis slučaja može imati najviše 15000 karaktera.";
    } else {
      updates.description = description;
    }
  }

  const publicationStatusCandidate = toOptionalText(payload?.publicationStatus);
  if (publicationStatusCandidate !== undefined) {
    const publicationStatus = publicationStatusCandidate.toLowerCase();
    if (!CASE_PUBLICATION_STATUSES.has(publicationStatus)) {
      errors.publicationStatus = "Status objave mora biti draft ili published.";
    } else {
      updates.publicationStatus = publicationStatus;
    }
  }

  if (payload?.averageRating !== undefined) {
    const averageRating = toNumber(payload.averageRating);
    if (averageRating === null || averageRating < 0 || averageRating > 5) {
      errors.averageRating = "Prosjecna ocjena mora biti broj između 0 i 5.";
    } else {
      updates.averageRating = averageRating;
    }
  }

  if (payload?.ratingCount !== undefined) {
    const ratingCount = toInteger(payload.ratingCount);
    if (ratingCount === null || ratingCount < 0) {
      errors.ratingCount = "Broj ocena mora biti ceo broj veci ili jednak nuli.";
    } else {
      updates.ratingCount = ratingCount;
    }
  }

  if (Object.keys(updates).length === 0 && Object.keys(errors).length === 0) {
    errors.general = "Potrebno je poslati bar jedno polje za izmenu.";
  }
  return { errors, sanitized: updates };
}

export function validateAdminActiveAppVersionPayload(payload) {
  const errors = {};
  const activeAppVersion = toText(payload?.activeAppVersion);

  if (activeAppVersion.length < 2) {
    errors.activeAppVersion = "Aktivna verzija aplikacije mora imati najmanje 2 karaktera.";
  } else if (activeAppVersion.length > 40) {
    errors.activeAppVersion = "Aktivna verzija aplikacije može imati najviše 40 karaktera.";
  }

  return {
    errors,
    sanitized: {
      activeAppVersion,
    },
  };
}
