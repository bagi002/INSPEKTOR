const TIMELINE_ITEM_TYPES = new Set(["person", "document"]);
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const MAX_TIMELINE_NOTE_LENGTH = 500;

function toText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function sanitizeItemType(value) {
  const normalized = toText(value).toLowerCase();
  return TIMELINE_ITEM_TYPES.has(normalized) ? normalized : null;
}

function sanitizeUnlockAt(value) {
  const normalized = toText(value);
  if (!normalized) {
    return "";
  }

  if (!DATETIME_LOCAL_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export function validateReplaceCaseTimelinePayload(payload, availableSources) {
  const errors = {};
  const rawItems = payload?.items;

  if (!Array.isArray(rawItems)) {
    errors.items = "Timeline mora biti prosleđen kao niz stavki.";
    return { errors, sanitized: [] };
  }

  const usedSourceReferences = new Set();
  const sanitizedItems = rawItems.map((item, index) => {
    const itemType = sanitizeItemType(item?.itemType);
    const sourceId = toPositiveInteger(item?.sourceId);
    const unlockNote = toText(item?.unlockNote);
    const unlockAt = sanitizeUnlockAt(item?.unlockAt);

    if (!itemType) {
      errors[`items.${index}.itemType`] = "Timeline stavka mora biti tipa person ili document.";
    }

    if (!sourceId) {
      errors[`items.${index}.sourceId`] = "Timeline stavka mora referencirati validan zapis.";
    }

    if (unlockNote.length > MAX_TIMELINE_NOTE_LENGTH) {
      errors[`items.${index}.unlockNote`] =
        `Napomena timeline stavke može imati najviše ${MAX_TIMELINE_NOTE_LENGTH} karaktera.`;
    }

    if (unlockAt === null) {
      errors[`items.${index}.unlockAt`] =
        "Datum i vreme otključavanja moraju biti u formatu YYYY-MM-DDTHH:mm.";
    }

    if (itemType && sourceId) {
      const sourceSet =
        itemType === "person" ? availableSources.personIds : availableSources.documentIds;
      if (!sourceSet.has(sourceId)) {
        errors[`items.${index}.sourceId`] =
          "Timeline stavka referencira zapis koji ne postoji u traženom slučaju.";
      }

      const sourceReference = `${itemType}:${sourceId}`;
      if (usedSourceReferences.has(sourceReference)) {
        errors[`items.${index}.sourceId`] =
          itemType === "document"
            ? "Isti dokument ne može biti dodat više od jednom u vremensku liniju."
            : "Ista osoba ne može biti dodata više od jednom u vremensku liniju.";
      }
      usedSourceReferences.add(sourceReference);
    }

    return {
      itemType: itemType || "document",
      sourceId: sourceId || 0,
      unlockOrder: index + 1,
      unlockNote,
      unlockAt: unlockAt || "",
    };
  });

  return {
    errors,
    sanitized: sanitizedItems,
  };
}
