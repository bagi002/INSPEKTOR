import { useCallback, useEffect, useMemo, useState } from "react";
import {
  consumeWorkspaceLinkingQueryParams,
  parseDocumentIdFromLocationSearch,
} from "./caseWorkspaceLinking";
import { resolveCaseDocumentsApi } from "./caseDocumentsTabApiResolver";
import { useCaseDocumentFormState } from "./useCaseDocumentFormState";
import { CASE_WORKSPACE_MODES } from "../utils/routes";

export function useCaseDocumentsTabState({ caseId, mode, category, onUnauthorized }) {
  const [documents, setDocuments] = useState([]);
  const [peopleDirectory, setPeopleDirectory] = useState([]);
  const [activeDocumentId, setActiveDocumentId] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;
  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId) || null,
    [documents, activeDocumentId]
  );
  const api = useMemo(() => resolveCaseDocumentsApi(category), [category]);

  const loadDocuments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    const result = await api.fetchDocuments(caseId, isCreateMode ? "create" : "solve");
    if (!result.ok) {
      if (result.unauthorized) {
        setIsLoading(false);
        onUnauthorized();
        return;
      }

      setErrorMessage(result.message || "Ucitavanje dokumenata nije uspelo.");
      setIsLoading(false);
      return;
    }

    const nextDocuments = Array.isArray(result.data?.documents) ? result.data.documents : [];
    const nextPeople = Array.isArray(result.data?.people) ? result.data.people : [];
    setDocuments(nextDocuments);
    setPeopleDirectory(nextPeople);
    setActiveDocumentId((previousId) =>
      nextDocuments.some((document) => document.id === previousId) ? previousId : null
    );
    setIsLoading(false);
  }, [api, caseId, isCreateMode, onUnauthorized]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    setIsPreviewModalOpen(false);
  }, [category, caseId]);

  useEffect(() => {
    if (typeof window === "undefined" || documents.length === 0) {
      return;
    }

    const linkedDocumentId = parseDocumentIdFromLocationSearch(window.location.search);
    if (!linkedDocumentId) {
      return;
    }

    const exists = documents.some((document) => document.id === linkedDocumentId);
    if (!exists) {
      consumeWorkspaceLinkingQueryParams(["documentId"]);
      return;
    }

    setActiveDocumentId(linkedDocumentId);
    setIsPreviewModalOpen(true);
    consumeWorkspaceLinkingQueryParams(["documentId"]);
  }, [documents]);

  const formState = useCaseDocumentFormState({
    caseId,
    category,
    onUnauthorized,
    createDocumentApi: api.createDocument,
    refreshDocuments: loadDocuments,
    onDocumentCreated: (documentId) => {
      setActiveDocumentId(documentId);
      setIsPreviewModalOpen(true);
    },
  });

  function openPreviewModal(documentId) {
    setActiveDocumentId(documentId);
    setIsPreviewModalOpen(true);
  }

  function closePreviewModal() {
    setIsPreviewModalOpen(false);
  }

  return {
    documents,
    peopleDirectory,
    activeDocument,
    isCreateMode,
    isPreviewModalOpen,
    isLoading,
    errorMessage,
    loadDocuments,
    openPreviewModal,
    closePreviewModal,
    ...formState,
  };
}
