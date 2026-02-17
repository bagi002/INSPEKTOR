import CaseDocumentsTab from "./CaseDocumentsTab";
import { CASE_DOCUMENT_CATEGORIES } from "./caseDocumentConfig";

function CaseStatementsTab({ caseId, mode, onUnauthorized }) {
  return (
    <CaseDocumentsTab
      caseId={caseId}
      mode={mode}
      category={CASE_DOCUMENT_CATEGORIES.STATEMENTS}
      onUnauthorized={onUnauthorized}
    />
  );
}

export default CaseStatementsTab;
