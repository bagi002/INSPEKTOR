import CaseDocumentCreateFieldGrid from "./CaseDocumentCreateFieldGrid";
import CaseDocumentImageSection from "./CaseDocumentImageSection";
import CaseDocumentCreatePeopleSection from "./CaseDocumentCreatePeopleSection";
import CaseDocumentTypeSpecificSection from "./CaseDocumentTypeSpecificSection";
import { renderCaseDocumentFieldError } from "./caseDocumentFormHelpers";

function CaseDocumentCreateForm({
  tabConfig,
  peopleDirectory,
  formData,
  formErrors,
  isSubmitting,
  submitError,
  submitSuccessMessage,
  onFieldChange,
  onTypeSpecificFieldChange,
  onRelatedPersonToggle,
  onImageUpload,
  onImageRemove,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="case-doc-form" onSubmit={onSubmit} noValidate>
      <div className="case-people-modal-header">
        <h3>{tabConfig.createModalTitle}</h3>
        <button type="button" className="btn btn-secondary case-people-modal-close" onClick={onCancel}>
          Zatvori
        </button>
      </div>

      <CaseDocumentCreateFieldGrid
        tabConfig={tabConfig}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onFieldChange={onFieldChange}
      />

      <CaseDocumentCreatePeopleSection
        tabConfig={tabConfig}
        peopleDirectory={peopleDirectory}
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onFieldChange={onFieldChange}
        onRelatedPersonToggle={onRelatedPersonToggle}
      />

      <CaseDocumentTypeSpecificSection
        documentType={formData.documentType}
        typeSpecificData={formData.typeSpecific}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onTypeSpecificFieldChange={onTypeSpecificFieldChange}
      />

      <CaseDocumentImageSection
        documentType={formData.documentType}
        imageEvidence={formData.imageEvidence}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onImageUpload={onImageUpload}
        onImageRemove={onImageRemove}
      />

      <label className="create-case-field" htmlFor="case-doc-content">
        Sadržaj dokumenta
        <textarea
          id="case-doc-content"
          className="create-case-textarea"
          name="content"
          value={formData.content}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "content")}
      </label>

      <label className="create-case-field" htmlFor="case-doc-notes">
        Dodatne napomene
        <textarea
          id="case-doc-notes"
          className="create-case-textarea"
          name="notes"
          value={formData.notes}
          onChange={onFieldChange}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "notes")}
      </label>

      {submitError ? <p className="error-banner">{submitError}</p> : null}
      {submitSuccessMessage ? <p className="case-people-success">{submitSuccessMessage}</p> : null}

      <div className="cta-row">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Čuvanje u toku..." : "Sačuvaj dokument"}
        </button>
      </div>
    </form>
  );
}

export default CaseDocumentCreateForm;
