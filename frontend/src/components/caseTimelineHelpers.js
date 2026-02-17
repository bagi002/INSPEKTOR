export const TIMELINE_ITEM_TYPES = {
  PERSON: "person",
  DOCUMENT: "document",
};

export const INITIAL_TIMELINE_FORM_DATA = {
  itemType: TIMELINE_ITEM_TYPES.PERSON,
  sourceId: "",
  unlockNote: "",
  unlockAt: "",
};

const DOCUMENT_TYPE_LABELS = {
  police_report: "Policijski izvjestaj",
  forensic_report: "Forenzicki nalaz",
  dossier: "Dosije",
  witness_statement: "Izjava svjedoka",
  suspect_statement: "Izjava osumnjicenog",
  victim_statement: "Izjava zrtve",
};

const PERSON_ROLE_LABELS = {
  unknown: "Nepoznato",
  suspect: "Osumnjiceni",
  victim: "Zrtva",
  witness: "Svjedok",
};

const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function getTimelineItemTypeLabel(itemType) {
  return itemType === TIMELINE_ITEM_TYPES.DOCUMENT ? "Dokument" : "Osoba";
}

export function getPersonRoleLabel(apparentRole) {
  return PERSON_ROLE_LABELS[apparentRole] || "Nepoznato";
}

export function getDocumentTypeLabel(documentType) {
  return DOCUMENT_TYPE_LABELS[documentType] || "Dokument";
}

export function parseTimelineSourceId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function formatTimelineSourceOption(itemType, source) {
  if (itemType === TIMELINE_ITEM_TYPES.DOCUMENT) {
    const documentTypeLabel = getDocumentTypeLabel(source.documentType);
    return `${source.title} (${documentTypeLabel})`;
  }

  return `${source.fullName} (${getPersonRoleLabel(source.apparentRole)})`;
}

export function validateTimelineItemForm(formData, existingItems) {
  const errors = {};
  const sourceId = parseTimelineSourceId(formData.sourceId);
  const normalizedNote = (formData.unlockNote || "").trim();
  const normalizedUnlockAt = (formData.unlockAt || "").trim();

  if (!sourceId) {
    errors.sourceId = "Izaberi osobu ili dokument koji dodajes u vremensku liniju.";
  }

  if (normalizedNote.length > 500) {
    errors.unlockNote = "Napomena moze imati najvise 500 karaktera.";
  }

  if (normalizedUnlockAt && !DATETIME_LOCAL_PATTERN.test(normalizedUnlockAt)) {
    errors.unlockAt = "Datum i vreme moraju biti u formatu YYYY-MM-DDTHH:mm.";
  }

  if (sourceId) {
    const duplicate = existingItems.some(
      (item) => item.itemType === formData.itemType && item.sourceId === sourceId
    );

    if (duplicate) {
      errors.sourceId = "Izabrana stavka je vec dodata u vremensku liniju.";
    }
  }

  return errors;
}

export function formatTimelineUnlockAt(unlockAt) {
  const normalized = typeof unlockAt === "string" ? unlockAt.trim() : "";
  if (!normalized) {
    return "Bez datuma";
  }

  const parsedDate = Number.isNaN(new Date(normalized).getTime())
    ? new Date(normalized.replace(" ", "T"))
    : new Date(normalized);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Bez datuma";
  }

  return parsedDate.toLocaleString("sr-Latn-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildTimelineSavePayload(items) {
  return {
    items: items.map((item) => ({
      itemType: item.itemType,
      sourceId: item.sourceId,
      unlockNote: (item.unlockNote || "").trim(),
      unlockAt: (item.unlockAt || "").trim(),
    })),
  };
}
