import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchCasePoliceDocuments,
  fetchCaseStatements,
} from "../services/caseDocumentsApi";

function toPositiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function buildPersonIdsFromDocument(document) {
  const ids = new Set();
  const giverPersonId = toPositiveInteger(document?.metadata?.giverPersonId);
  if (giverPersonId) {
    ids.add(giverPersonId);
  }

  const relatedPersonIds = Array.isArray(document?.metadata?.relatedPersonIds)
    ? document.metadata.relatedPersonIds
    : [];
  relatedPersonIds.forEach((personId) => {
    const parsedPersonId = toPositiveInteger(personId);
    if (parsedPersonId) {
      ids.add(parsedPersonId);
    }
  });

  return Array.from(ids);
}

function sortDocumentsBySequence(left, right) {
  const leftOrder = Number.parseInt(left?.sequenceOrder, 10);
  const rightOrder = Number.parseInt(right?.sequenceOrder, 10);
  const normalizedLeftOrder = Number.isInteger(leftOrder) ? leftOrder : 0;
  const normalizedRightOrder = Number.isInteger(rightOrder) ? rightOrder : 0;

  if (normalizedLeftOrder !== normalizedRightOrder) {
    return normalizedLeftOrder - normalizedRightOrder;
  }

  return (left?.id || 0) - (right?.id || 0);
}

export function useCasePeopleLinkedDocumentsState({ caseId, onUnauthorized }) {
  const [linkedDocuments, setLinkedDocuments] = useState([]);
  const [linkedDocumentsError, setLinkedDocumentsError] = useState("");

  const loadLinkedDocuments = useCallback(async () => {
    setLinkedDocumentsError("");

    const [statementsResult, policeDocumentsResult] = await Promise.all([
      fetchCaseStatements(caseId),
      fetchCasePoliceDocuments(caseId),
    ]);

    if (statementsResult.unauthorized || policeDocumentsResult.unauthorized) {
      onUnauthorized();
      return;
    }

    const nextDocuments = [];
    const nonFatalErrors = [];

    if (statementsResult.ok) {
      const statementDocuments = Array.isArray(statementsResult.data?.documents)
        ? statementsResult.data.documents
        : [];
      nextDocuments.push(...statementDocuments);
    } else {
      nonFatalErrors.push(statementsResult.message || "Izjave trenutno nisu dostupne.");
    }

    if (policeDocumentsResult.ok) {
      const policeDocuments = Array.isArray(policeDocumentsResult.data?.documents)
        ? policeDocumentsResult.data.documents
        : [];
      nextDocuments.push(...policeDocuments);
    } else {
      nonFatalErrors.push(policeDocumentsResult.message || "Policijski dokumenti trenutno nisu dostupni.");
    }

    setLinkedDocuments(nextDocuments);
    setLinkedDocumentsError(nonFatalErrors.join(" "));
  }, [caseId, onUnauthorized]);

  useEffect(() => {
    void loadLinkedDocuments();
  }, [loadLinkedDocuments]);

  const linkedDocumentsByPersonId = useMemo(() => {
    const map = new Map();

    linkedDocuments.forEach((document) => {
      const personIds = buildPersonIdsFromDocument(document);
      personIds.forEach((personId) => {
        const current = map.get(personId) || [];
        current.push(document);
        map.set(personId, current);
      });
    });

    map.forEach((documents, personId) => {
      const uniqueById = new Map();
      documents.forEach((document) => {
        const documentId = toPositiveInteger(document?.id);
        if (documentId) {
          uniqueById.set(documentId, document);
        }
      });
      map.set(personId, Array.from(uniqueById.values()).sort(sortDocumentsBySequence));
    });

    return map;
  }, [linkedDocuments]);

  function getLinkedDocumentsForPerson(personId) {
    const parsedPersonId = toPositiveInteger(personId);
    if (!parsedPersonId) {
      return [];
    }

    return linkedDocumentsByPersonId.get(parsedPersonId) || [];
  }

  return {
    linkedDocumentsError,
    getLinkedDocumentsForPerson,
  };
}
