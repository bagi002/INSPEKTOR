import { CASE_DOCUMENT_CLASSIFICATION_OPTIONS } from "./caseDocumentConfig";
import { renderCaseDocumentFieldError } from "./caseDocumentFormHelpers";

function CaseDocumentCreateFieldGrid({ tabConfig, formData, formErrors, isSubmitting, onFieldChange }) {
  return (
    <div className="case-doc-form-grid">
      <label className="create-case-field" htmlFor="case-doc-type">
        Tip dokumenta
        <select
          id="case-doc-type"
          className="create-case-input"
          name="documentType"
          value={formData.documentType}
          onChange={onFieldChange}
          disabled={isSubmitting}
        >
          {tabConfig.documentTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {renderCaseDocumentFieldError(formErrors, "documentType")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-title">
        Naslov
        <input
          id="case-doc-title"
          className="create-case-input"
          name="title"
          type="text"
          value={formData.title}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "title")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-recorded-at">
        Datum i vrijeme
        <input
          id="case-doc-recorded-at"
          className="create-case-input"
          name="recordedAt"
          type="datetime-local"
          value={formData.recordedAt}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "recordedAt")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-location">
        Lokacija
        <input
          id="case-doc-location"
          className="create-case-input"
          name="location"
          type="text"
          value={formData.location}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "location")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-classification">
        Klasifikacija
        <select
          id="case-doc-classification"
          className="create-case-input"
          name="classificationLevel"
          value={formData.classificationLevel}
          onChange={onFieldChange}
          disabled={isSubmitting}
        >
          {CASE_DOCUMENT_CLASSIFICATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {renderCaseDocumentFieldError(formErrors, "classificationLevel")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-sequence-order">
        Redosled
        <input
          id="case-doc-sequence-order"
          className="create-case-input"
          name="sequenceOrder"
          type="number"
          min="1"
          value={formData.sequenceOrder}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "sequenceOrder")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-officer">
        Sluzbenik
        <input
          id="case-doc-officer"
          className="create-case-input"
          name="officerName"
          type="text"
          value={formData.officerName}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "officerName")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-badge-number">
        Broj znacke
        <input
          id="case-doc-badge-number"
          className="create-case-input"
          name="badgeNumber"
          type="text"
          value={formData.badgeNumber}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "badgeNumber")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-department">
        Jedinica/Laboratorija
        <input
          id="case-doc-department"
          className="create-case-input"
          name="department"
          type="text"
          value={formData.department}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "department")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-evidence">
        Referenca dokaza
        <input
          id="case-doc-evidence"
          className="create-case-input"
          name="evidenceReference"
          type="text"
          value={formData.evidenceReference}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "evidenceReference")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-legal-reference">
        Pravna referenca
        <input
          id="case-doc-legal-reference"
          className="create-case-input"
          name="legalReference"
          type="text"
          value={formData.legalReference}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "legalReference")}
      </label>

      <label className="create-case-field case-doc-unlock-toggle" htmlFor="case-doc-unlock">
        <span>Otključan po default-u</span>
        <input
          id="case-doc-unlock"
          name="isUnlockedByDefault"
          type="checkbox"
          checked={formData.isUnlockedByDefault}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
      </label>
    </div>
  );
}

export default CaseDocumentCreateFieldGrid;
