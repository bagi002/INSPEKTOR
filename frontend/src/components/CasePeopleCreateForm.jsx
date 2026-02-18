import CasePeopleCreateBasics from "./CasePeopleCreateBasics";
import CasePeopleCreateTextareas from "./CasePeopleCreateTextareas";

function CasePeopleCreateForm({
  formData,
  formErrors,
  isSubmitting,
  submitError,
  submitSuccessMessage,
  onFieldChange,
  onPhotoUpload,
  onPhotoRemove,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="case-people-form" onSubmit={onSubmit} noValidate>
      <div className="case-people-modal-header">
        <h3>Kreiranje novog dosijea osobe</h3>
        <button type="button" className="btn btn-secondary case-people-modal-close" onClick={onCancel}>
          Zatvori
        </button>
      </div>

      <CasePeopleCreateBasics
        formData={formData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onFieldChange={onFieldChange}
        onPhotoUpload={onPhotoUpload}
        onPhotoRemove={onPhotoRemove}
      />

      <CasePeopleCreateTextareas
        formData={formData}
        formErrors={formErrors}
        onFieldChange={onFieldChange}
        isSubmitting={isSubmitting}
      />

      {submitError ? <p className="error-banner">{submitError}</p> : null}
      {submitSuccessMessage ? <p className="case-people-success">{submitSuccessMessage}</p> : null}

      <div className="cta-row">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Čuvanje u toku..." : "Sačuvaj osobu i dosije"}
        </button>
      </div>
    </form>
  );
}

export default CasePeopleCreateForm;
