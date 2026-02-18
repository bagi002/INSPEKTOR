import { useMemo } from "react";
import { formatTimelineUnlockAt, TIMELINE_ITEM_TYPES } from "./caseTimelineHelpers";
import CaseTimelineCreateForm from "./CaseTimelineCreateForm";
import CaseTimelineRoadmapItem from "./CaseTimelineRoadmapItem";
import CaseTimelineStatCard from "./CaseTimelineStatCard";
import { useCaseTimelineTabState } from "./useCaseTimelineTabState";

function CaseTimelineTab({ caseId, mode, onUnauthorized }) {
  const {
    timelineItems,
    timelineProgress,
    peopleDirectory,
    documentDirectory,
    isCreateMode,
    isLoading,
    errorMessage,
    isSaving,
    isAdvancing,
    saveErrorMessage,
    saveSuccessMessage,
    advanceErrorMessage,
    advanceSuccessMessage,
    formData,
    formErrors,
    sourceOptions,
    loadTimeline,
    handleFormFieldChange,
    handleAddTimelineItem,
    handleMoveTimelineItem,
    handleRemoveTimelineItem,
    handleTimelineItemFieldChange,
    handleSaveTimeline,
    handleAdvanceTimeline,
  } = useCaseTimelineTabState({ caseId, mode, onUnauthorized });

  const createStats = useMemo(() => {
    const peopleCount = timelineItems.filter((item) => item.itemType === TIMELINE_ITEM_TYPES.PERSON).length;
    const documentCount = timelineItems.filter((item) => item.itemType === TIMELINE_ITEM_TYPES.DOCUMENT).length;
    return {
      total: timelineItems.length,
      peopleCount,
      documentCount,
      availableSources: peopleDirectory.length + documentDirectory.length,
    };
  }, [documentDirectory.length, peopleDirectory.length, timelineItems]);

  const solveVisibleItems = useMemo(() => {
    const unlockedItems = timelineItems.slice(0, timelineProgress.unlockedCount);
    return [...unlockedItems].reverse();
  }, [timelineItems, timelineProgress.unlockedCount]);

  const solveRemainingCount = Math.max(0, timelineProgress.totalItems - timelineProgress.unlockedCount);
  const solveCurrentDateLabel =
    timelineProgress.unlockedCount > 0
      ? formatTimelineUnlockAt(timelineProgress.lastUnlockedTimelineAt)
      : "Nema otključanih";

  const visibleRoadmapItems = isCreateMode ? timelineItems : solveVisibleItems;

  if (isLoading) {
    return (
      <section className="card reveal delay-3">
        <p>Učitavam vremensku liniju...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="card reveal delay-3">
        <p className="error-banner">{errorMessage}</p>
        <button type="button" className="btn btn-primary inline-action" onClick={loadTimeline}>
          Pokušaj ponovo
        </button>
      </section>
    );
  }

  return (
    <div className="case-timeline-overview">
      <section className={`card case-timeline-hero-card ${isCreateMode ? "is-create" : "is-solve"}`}>
        <div className="case-timeline-hero-top">
          <div>
            <p className="eyebrow">Vremenska linija</p>
            <h3>Roadmap otključavanja tragova</h3>
            <p className="create-case-summary">
              {isCreateMode
                ? "Definiši redosled kojim se osobe i dokumenti otkrivaju tokom istrage."
                : "U modu rešavanja otključavaš sledeću stavku klikom na dugme Dalje, dok se iznad prikazuje trenutni datum istrage."}
            </p>
          </div>
          {isCreateMode ? (
            <button type="button" className="btn btn-primary case-timeline-save-btn" onClick={handleSaveTimeline} disabled={isSaving}>
              {isSaving ? "Čuvanje..." : "Sačuvaj vremensku liniju"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary case-timeline-save-btn" onClick={handleAdvanceTimeline} disabled={isAdvancing || !timelineProgress.hasNextItem}>
              {isAdvancing ? "Otključavam..." : timelineProgress.hasNextItem ? "Dalje" : "Sve je otključano"}
            </button>
          )}
        </div>

        <div className="case-timeline-stat-grid">
          {isCreateMode ? (
            <>
              <CaseTimelineStatCard value={createStats.total} label="Ukupno stavki" />
              <CaseTimelineStatCard value={createStats.peopleCount} label="Osobe" />
              <CaseTimelineStatCard value={createStats.documentCount} label="Dokumenti" />
              <CaseTimelineStatCard value={createStats.availableSources} label="Dostupni izvori" />
            </>
          ) : (
            <>
              <CaseTimelineStatCard value={`${timelineProgress.unlockedCount}/${timelineProgress.totalItems}`} label="Otključano" />
              <CaseTimelineStatCard value={`${timelineProgress.progressPercent}%`} label="Faza istrage" />
              <CaseTimelineStatCard value={solveCurrentDateLabel} label="Trenutni datum" />
              <CaseTimelineStatCard value={solveRemainingCount} label="Preostalo" />
            </>
          )}
        </div>

        {saveErrorMessage ? <p className="error-banner">{saveErrorMessage}</p> : null}
        {saveSuccessMessage ? <p className="case-timeline-success">{saveSuccessMessage}</p> : null}
        {advanceErrorMessage ? <p className="error-banner">{advanceErrorMessage}</p> : null}
        {advanceSuccessMessage ? <p className="case-timeline-success">{advanceSuccessMessage}</p> : null}
      </section>

      {isCreateMode ? (
        <CaseTimelineCreateForm
          formData={formData}
          formErrors={formErrors}
          sourceOptions={sourceOptions}
          onFieldChange={handleFormFieldChange}
          onSubmit={handleAddTimelineItem}
        />
      ) : null}

      <section className="card case-timeline-roadmap-card">
        <h3>{isCreateMode ? "Sekvenca otključavanja" : "Otključane stavke (najnovije gore)"}</h3>
        {isCreateMode && visibleRoadmapItems.length === 0 ? <p className="case-timeline-empty">Vremenska linija još nije definisana za ovaj slučaj.</p> : null}
        {!isCreateMode && visibleRoadmapItems.length === 0 ? <p className="case-timeline-empty">Nema otključanih stavki. Klikni na dugme Dalje da otključaš prvu.</p> : null}

        {visibleRoadmapItems.length > 0 ? (
          <ol className="case-timeline-roadmap-list">
            {visibleRoadmapItems.map((item, index) => (
              <CaseTimelineRoadmapItem
                key={item.localKey}
                item={item}
                index={index}
                totalItems={visibleRoadmapItems.length}
                isCreateMode={isCreateMode}
                onMove={handleMoveTimelineItem}
                onRemove={handleRemoveTimelineItem}
                onFieldChange={handleTimelineItemFieldChange}
              />
            ))}
          </ol>
        ) : null}
      </section>
    </div>
  );
}

export default CaseTimelineTab;
