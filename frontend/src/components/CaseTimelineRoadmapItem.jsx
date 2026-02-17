import {
  formatTimelineUnlockAt,
  getDocumentTypeLabel,
  getPersonRoleLabel,
  getTimelineItemTypeLabel,
  TIMELINE_ITEM_TYPES,
} from "./caseTimelineHelpers";

function CaseTimelineRoadmapItem({
  item,
  index,
  totalItems,
  isCreateMode,
  onMove,
  onRemove,
  onFieldChange,
}) {
  const canMoveUp = index > 0;
  const canMoveDown = index < totalItems - 1;
  const orderLabel = Number.isInteger(item.unlockOrder) ? item.unlockOrder : index + 1;
  const sourceMetaText =
    item.itemType === TIMELINE_ITEM_TYPES.DOCUMENT
      ? getDocumentTypeLabel(item.sourceMeta?.documentType)
      : getPersonRoleLabel(item.sourceMeta?.apparentRole);

  return (
    <li className="case-timeline-roadmap-item">
      <div className="case-timeline-roadmap-marker" aria-hidden="true">
        {orderLabel}
      </div>

      <div className="case-timeline-roadmap-content">
        <div className="case-timeline-roadmap-top">
          <div>
            <p className="case-timeline-item-badge">{getTimelineItemTypeLabel(item.itemType)}</p>
            <h4>{item.sourceLabel || "Nepoznata stavka"}</h4>
            <p className="case-timeline-item-meta">{sourceMetaText}</p>
          </div>

          {isCreateMode ? (
            <div className="case-timeline-roadmap-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onMove(item.localKey, "up")}
                disabled={!canMoveUp}
              >
                Gore
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onMove(item.localKey, "down")}
                disabled={!canMoveDown}
              >
                Dole
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => onRemove(item.localKey)}>
                Ukloni
              </button>
            </div>
          ) : null}
        </div>

        {isCreateMode ? (
          <div className="case-timeline-roadmap-fields">
            <label className="create-case-field">
              Datum i vreme otkljucavanja
              <input
                className="create-case-input"
                type="datetime-local"
                value={item.unlockAt}
                onChange={(event) => onFieldChange(item.localKey, "unlockAt", event.target.value)}
              />
            </label>

            <label className="create-case-field">
              Operativna napomena
              <textarea
                className="create-case-textarea"
                value={item.unlockNote}
                onChange={(event) => onFieldChange(item.localKey, "unlockNote", event.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className="case-timeline-roadmap-readonly">
            <p>
              <strong>Datum:</strong> {formatTimelineUnlockAt(item.unlockAt)}
            </p>
            <p>
              <strong>Napomena:</strong> {item.unlockNote || "Nije definisana."}
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

export default CaseTimelineRoadmapItem;
