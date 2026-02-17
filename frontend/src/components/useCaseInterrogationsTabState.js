import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCaseInterrogations } from "../services/caseInterrogationsApi";
import { CASE_WORKSPACE_MODES } from "../utils/routes";
import {
  consumeWorkspaceLinkingQueryParams,
  parseInterrogationPersonIdFromLocationSearch,
} from "./caseWorkspaceLinking";
import {
  findInterrogationByPerson,
  sanitizeInterrogations,
} from "./caseInterrogationsHelpers";
import { resolveAlivePeople } from "./caseInterrogationsStateUtils";
import { useCaseInterrogationCreateState } from "./useCaseInterrogationCreateState";

export function useCaseInterrogationsTabState({ caseId, mode, onUnauthorized }) {
  const [interrogations, setInterrogations] = useState([]);
  const [peopleDirectory, setPeopleDirectory] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [activeInterrogationId, setActiveInterrogationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;
  const alivePeople = useMemo(() => resolveAlivePeople(peopleDirectory), [peopleDirectory]);

  const activeInterrogation = useMemo(
    () => interrogations.find((interrogation) => interrogation.id === activeInterrogationId) || null,
    [interrogations, activeInterrogationId]
  );

  const loadInterrogations = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    const result = await fetchCaseInterrogations(caseId, isCreateMode ? "create" : "solve");
    if (!result.ok) {
      if (result.unauthorized) {
        setIsLoading(false);
        onUnauthorized();
        return;
      }
      setErrorMessage(result.message || "Ucitavanje saslusanja nije uspelo.");
      setIsLoading(false);
      return;
    }

    const nextInterrogations = sanitizeInterrogations(result.data?.interrogations);
    const nextPeople = Array.isArray(result.data?.people) ? result.data.people : [];
    const nextAlivePeople = resolveAlivePeople(nextPeople);

    setInterrogations(nextInterrogations);
    setPeopleDirectory(nextPeople);
    setSelectedPersonId((previous) => {
      if (nextAlivePeople.some((person) => String(person.id) === String(previous))) {
        return String(previous);
      }
      return nextAlivePeople[0] ? String(nextAlivePeople[0].id) : "";
    });
    setActiveInterrogationId((previousId) =>
      nextInterrogations.some((interrogation) => interrogation.id === previousId) ? previousId : null
    );
    setIsLoading(false);
  }, [caseId, isCreateMode, onUnauthorized]);

  const createState = useCaseInterrogationCreateState({
    caseId,
    onUnauthorized,
    alivePeople,
    selectedPersonId,
    refreshInterrogations: loadInterrogations,
    onSaved: (interrogationId) => {
      setActiveInterrogationId(interrogationId);
      setIsChatModalOpen(true);
    },
  });

  useEffect(() => {
    void loadInterrogations();
  }, [loadInterrogations]);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) {
      return;
    }

    const linkedPersonId = parseInterrogationPersonIdFromLocationSearch(window.location.search);
    if (!linkedPersonId) {
      return;
    }

    const linkedInterrogation = findInterrogationByPerson(interrogations, linkedPersonId);
    if (linkedInterrogation) {
      setActiveInterrogationId(linkedInterrogation.id);
      setIsChatModalOpen(true);
    } else {
      setActionMessage("Za izabranu osobu jos nije evidentirano saslusanje.");
      if (isCreateMode) {
        createState.openCreateModal(linkedPersonId);
      }
    }
    consumeWorkspaceLinkingQueryParams(["interrogationPersonId"]);
  }, [interrogations, isCreateMode, isLoading]);

  useEffect(() => {
    setIsChatModalOpen(false);
    createState.setIsCreateModalOpen(false);
  }, [caseId, mode]);

  function openChatModal(interrogationId) {
    setActiveInterrogationId(interrogationId);
    setIsChatModalOpen(true);
  }

  function closeChatModal() {
    setIsChatModalOpen(false);
  }

  function handleSelectedPersonChange(event) {
    setSelectedPersonId(event.target.value);
    setActionMessage("");
  }

  function startInterrogationForSelectedPerson() {
    const interrogation = findInterrogationByPerson(interrogations, selectedPersonId);
    if (!interrogation) {
      if (isCreateMode) {
        setActionMessage("Za izabranu osobu nema saslusanja. Otvoren je modal za kreiranje.");
        createState.openCreateModal(selectedPersonId);
        return;
      }
      setActionMessage("Za izabranu osobu nije pronadjeno sacuvano saslusanje.");
      return;
    }
    setActionMessage("");
    openChatModal(interrogation.id);
  }

  return {
    interrogations,
    peopleDirectory,
    alivePeople,
    selectedPersonId,
    activeInterrogation,
    isCreateMode,
    isChatModalOpen,
    isLoading,
    errorMessage,
    actionMessage,
    loadInterrogations,
    openChatModal,
    closeChatModal,
    handleSelectedPersonChange,
    startInterrogationForSelectedPerson,
    ...createState,
  };
}
