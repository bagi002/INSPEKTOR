import {
  createCasePoliceDocument,
  createCaseStatement,
  fetchCasePoliceDocuments,
  fetchCaseStatements,
} from "../services/caseDocumentsApi";
import { CASE_DOCUMENT_CATEGORIES } from "./caseDocumentConfig";

export function resolveCaseDocumentsApi(category) {
  if (category === CASE_DOCUMENT_CATEGORIES.POLICE_DOCUMENTS) {
    return {
      fetchDocuments: fetchCasePoliceDocuments,
      createDocument: createCasePoliceDocument,
    };
  }

  return {
    fetchDocuments: fetchCaseStatements,
    createDocument: createCaseStatement,
  };
}
