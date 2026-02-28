import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { advanceCaseTimeline, fetchCaseTimeline, replaceCaseTimeline } from "../services/caseTimelineApi";
import { CASE_WORKSPACE_MODES } from "../utils/routes";
import {
  buildTimelineSavePayload,
  formatTimelineSourceOption,
  INITIAL_TIMELINE_FORM_DATA,
  parseTimelineSourceId,
  TIMELINE_ITEM_TYPES,
  validateTimelineItemForm,
} from "./caseTimelineHelpers";
import {
  buildDefaultTimelineProgress,
  buildTimelineStateItem,
  mapTimelineItemForState,
  mapTimelineProgressForState,
  patchTimelineStateItemField,
  pickFirstValidationMessage,
  removeTimelineStateItem,
  reorderTimelineStateItems,
} from "./caseTimelineStateUtils";

export function useCaseTimelineTabState({ caseId, mode, onUnauthorized }) {
  const [timelineItems, setTimelineItems] = useState([]);
  const [timelineProgress, setTimelineProgress] = useState(buildDefaultTimelineProgress(0));
  const [peopleDirectory, setPeopleDirectory] = useState([]);
  const [documentDirectory, setDocumentDirectory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [advanceErrorMessage, setAdvanceErrorMessage] = useState("");
  const [advanceSuccessMessage, setAdvanceSuccessMessage] = useState("");
  const [formData, setFormData] = useState(INITIAL_TIMELINE_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const nextLocalKeyRef = useRef(1);
  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;

  const sourceOptions = useMemo(() => {
    const usedPeopleIds = new Set(
      timelineItems
        .filter((item) => item.itemType === TIMELINE_ITEM_TYPES.PERSON)
        .map((item) => item.sourceId)
    );
    const usedDocumentIds = new Set(
      timelineItems
        .filter((item) => item.itemType === TIMELINE_ITEM_TYPES.DOCUMENT)
        .map((item) => item.sourceId)
    );

    if (formData.itemType !== TIMELINE_ITEM_TYPES.DOCUMENT) {
      return peopleDirectory.filter((person) => !usedPeopleIds.has(person.id));
    }

    return documentDirectory.filter((document) => !usedDocumentIds.has(document.id));
  }, [documentDirectory, formData.itemType, peopleDirectory, timelineItems]);

  const loadTimeline = useCallback(async () => {
    setIsLoading(true); setErrorMessage(""); setSaveErrorMessage(""); setSaveSuccessMessage(""); setAdvanceErrorMessage(""); setAdvanceSuccessMessage("");
    const result = await fetchCaseTimeline(caseId);
    if (!result.ok) {
      if (result.unauthorized) { setIsLoading(false); onUnauthorized(); return; }
      setErrorMessage(result.message || "Učitavanje vremenske linije nije uspelo."); setIsLoading(false); return;
    }

    const mappedItems = (Array.isArray(result.data?.items) ? result.data.items : []).map(mapTimelineItemForState);
    const nextPeople = Array.isArray(result.data?.people) ? result.data.people : [];
    const nextDocuments = Array.isArray(result.data?.documents) ? result.data.documents : [];
    setTimelineItems(mappedItems); setTimelineProgress(mapTimelineProgressForState(result.data?.userProgress, mappedItems.length));
    setPeopleDirectory(nextPeople); setDocumentDirectory(nextDocuments);
    setFormData((previous) => {
      if (previous.itemType === TIMELINE_ITEM_TYPES.DOCUMENT && nextDocuments.length === 0) return { ...previous, itemType: TIMELINE_ITEM_TYPES.PERSON, sourceId: "" };
      if (previous.itemType === TIMELINE_ITEM_TYPES.PERSON && nextPeople.length === 0) return { ...previous, itemType: TIMELINE_ITEM_TYPES.DOCUMENT, sourceId: "" };
      return previous;
    });
    setIsLoading(false);
  }, [caseId, onUnauthorized]);

  useEffect(() => { void loadTimeline(); }, [loadTimeline]);

  function handleFormFieldChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => name === "itemType" ? { ...previous, itemType: value === TIMELINE_ITEM_TYPES.DOCUMENT ? TIMELINE_ITEM_TYPES.DOCUMENT : TIMELINE_ITEM_TYPES.PERSON, sourceId: "" } : { ...previous, [name]: value });
    setFormErrors((previous) => { if (!previous[name]) return previous; const nextErrors = { ...previous }; delete nextErrors[name]; return nextErrors; });
  }

  function handleAddTimelineItem(event) {
    event.preventDefault(); setSaveErrorMessage(""); setSaveSuccessMessage("");
    const validationErrors = validateTimelineItemForm(formData, timelineItems); setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const sourceId = parseTimelineSourceId(formData.sourceId); const source = sourceOptions.find((option) => option.id === sourceId);
    if (!sourceId || !source) { setFormErrors({ sourceId: "Izabrani zapis više nije dostupan. Osveži stranicu i pokušaj ponovo." }); return; }

    const localKey = `timeline-item-new-${nextLocalKeyRef.current}`; nextLocalKeyRef.current += 1;
    const sourceLabel = formatTimelineSourceOption(formData.itemType, source);
    setTimelineItems((previous) => [...previous, buildTimelineStateItem({ formData: { ...formData, sourceLabel }, source, localKey, unlockOrder: previous.length + 1 })]);
    setFormErrors({}); setFormData((previous) => ({ ...previous, sourceId: "", unlockNote: "", unlockAt: "" }));
  }

  function handleMoveTimelineItem(localKey, direction) { setTimelineItems((previous) => reorderTimelineStateItems(previous, localKey, direction)); }
  function handleRemoveTimelineItem(localKey) { setTimelineItems((previous) => removeTimelineStateItem(previous, localKey)); }
  function handleTimelineItemFieldChange(localKey, fieldName, value) { setTimelineItems((previous) => patchTimelineStateItemField(previous, localKey, fieldName, value)); }

  async function handleSaveTimeline() {
    if (!isCreateMode) return;
    setIsSaving(true); setSaveErrorMessage(""); setSaveSuccessMessage("");
    const result = await replaceCaseTimeline(caseId, buildTimelineSavePayload(timelineItems));
    if (!result.ok) {
      if (result.unauthorized) { setIsSaving(false); onUnauthorized(); return; }
      const validationMessage = pickFirstValidationMessage(result.errors);
      setSaveErrorMessage(validationMessage || result.message || "Čuvanje vremenske linije nije uspelo."); setIsSaving(false); return;
    }

    const updatedItems = Array.isArray(result.data?.items) ? result.data.items.map(mapTimelineItemForState) : [];
    setTimelineItems(updatedItems); setTimelineProgress((previous) => mapTimelineProgressForState(previous, updatedItems.length));
    setSaveSuccessMessage(result.message || "Vremenska linija je uspešno sačuvana."); setIsSaving(false);
  }

  async function handleAdvanceTimeline() {
    if (isCreateMode) return;
    setIsAdvancing(true); setAdvanceErrorMessage(""); setAdvanceSuccessMessage("");
    const result = await advanceCaseTimeline(caseId);
    if (!result.ok) {
      if (result.unauthorized) { setIsAdvancing(false); onUnauthorized(); return; }
      setAdvanceErrorMessage(result.message || "Otključavanje sledeće stavke nije uspelo."); setIsAdvancing(false); return;
    }

    const updatedItems = Array.isArray(result.data?.items) ? result.data.items.map(mapTimelineItemForState) : [];
    setTimelineItems(updatedItems); setTimelineProgress(mapTimelineProgressForState(result.data?.userProgress, updatedItems.length));
    setAdvanceSuccessMessage(result.message || "Sledeća timeline stavka je uspešno otključana."); setIsAdvancing(false);
  }

  return {
    timelineItems, timelineProgress, peopleDirectory, documentDirectory, isCreateMode, isLoading, errorMessage,
    isSaving, isAdvancing, saveErrorMessage, saveSuccessMessage, advanceErrorMessage, advanceSuccessMessage,
    formData, formErrors, sourceOptions, loadTimeline, handleFormFieldChange, handleAddTimelineItem,
    handleMoveTimelineItem, handleRemoveTimelineItem, handleTimelineItemFieldChange, handleSaveTimeline,
    handleAdvanceTimeline,
  };
}
