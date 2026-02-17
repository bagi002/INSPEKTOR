import CaseDocumentsTab from "./CaseDocumentsTab";
import { CASE_DOCUMENT_CATEGORIES } from "./caseDocumentConfig";

function CasePoliceDocumentsTab({ caseId, mode, onUnauthorized }) {
  return (
    <CaseDocumentsTab
      caseId={caseId}
      mode={mode}
      category={CASE_DOCUMENT_CATEGORIES.POLICE_DOCUMENTS}
      onUnauthorized={onUnauthorized}
    />
  );
}

export default CasePoliceDocumentsTab;
