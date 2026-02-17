export function mapTimelineItemForState(item, index) {
  return {
    localKey: `timeline-item-${item.id || index + 1}`,
    persistedId: item.id || null,
    itemType: item.itemType,
    sourceId: item.sourceId,
    sourceLabel: item.sourceLabel || "",
    sourceMeta: item.sourceMeta || {},
    unlockNote: item.unlockNote || "",
    unlockAt: item.unlockAt || "",
    unlockOrder: item.unlockOrder || index + 1,
  };
}

export function buildDefaultTimelineProgress(totalItems = 0) {
  return {
    totalItems,
    unlockedCount: 0,
    progressPercent: 0,
    progressStatus: "in_progress",
    hasNextItem: false,
    lastUnlockedTimelineAt: "",
  };
}

export function mapTimelineProgressForState(rawProgress, totalItems) {
  const safeTotal = Number.isInteger(totalItems) && totalItems >= 0 ? totalItems : 0;
  if (!rawProgress || typeof rawProgress !== "object") {
    return buildDefaultTimelineProgress(safeTotal);
  }

  const rawUnlockedCount = Number.parseInt(rawProgress.unlockedCount, 10);
  const unlockedCount = Number.isInteger(rawUnlockedCount)
    ? Math.min(safeTotal, Math.max(0, rawUnlockedCount))
    : 0;

  const rawPercent = Number.parseInt(rawProgress.progressPercent, 10);
  const progressPercent = Number.isInteger(rawPercent)
    ? Math.min(100, Math.max(0, rawPercent))
    : safeTotal > 0
      ? Math.round((unlockedCount / safeTotal) * 100)
      : 0;

  const lastUnlockedTimelineAt =
    typeof rawProgress.lastUnlockedTimelineAt === "string"
      ? rawProgress.lastUnlockedTimelineAt.trim()
      : "";

  return {
    totalItems: safeTotal,
    unlockedCount,
    progressPercent,
    progressStatus: "in_progress",
    hasNextItem: unlockedCount < safeTotal,
    lastUnlockedTimelineAt,
  };
}

export function pickFirstValidationMessage(errors) {
  if (!errors || typeof errors !== "object") {
    return "";
  }

  for (const key of Object.keys(errors)) {
    const value = errors[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return "";
}

export function buildTimelineStateItem({ formData, source, localKey, unlockOrder }) {
  return {
    localKey,
    persistedId: null,
    itemType: formData.itemType,
    sourceId: source.id,
    sourceLabel: formData.sourceLabel,
    sourceMeta:
      formData.itemType === "document"
        ? { documentType: source.documentType || "" }
        : { apparentRole: source.apparentRole || "unknown" },
    unlockNote: (formData.unlockNote || "").trim(),
    unlockAt: (formData.unlockAt || "").trim(),
    unlockOrder,
  };
}

export function reorderTimelineStateItems(previousItems, localKey, direction) {
  const currentIndex = previousItems.findIndex((item) => item.localKey === localKey);
  if (currentIndex < 0) {
    return previousItems;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= previousItems.length) {
    return previousItems;
  }

  const nextItems = [...previousItems];
  const [movedItem] = nextItems.splice(currentIndex, 1);
  nextItems.splice(targetIndex, 0, movedItem);

  return nextItems.map((item, index) => ({
    ...item,
    unlockOrder: index + 1,
  }));
}

export function removeTimelineStateItem(previousItems, localKey) {
  return previousItems
    .filter((item) => item.localKey !== localKey)
    .map((item, index) => ({
      ...item,
      unlockOrder: index + 1,
    }));
}

export function patchTimelineStateItemField(previousItems, localKey, fieldName, value) {
  return previousItems.map((item) => {
    if (item.localKey !== localKey) {
      return item;
    }

    return {
      ...item,
      [fieldName]: fieldName === "unlockNote" ? value : value.trim(),
    };
  });
}
