import { formatTimelineSourceOption } from "./caseTimelineHelpers";

function CaseTimelineCreateForm({
  formData,
  formErrors,
  sourceOptions,
  onFieldChange,
  onSubmit,
}) {
  return (
    <section className="card case-timeline-form-card">
      <h3>Dodaj stavku na vremensku liniju</h3>
      <form className="case-timeline-form" onSubmit={onSubmit} noValidate>
        <label className="create-case-field">
          Tip stavke
          <select className="create-case-input" name="itemType" value={formData.itemType} onChange={onFieldChange}>
            <option value="person">Osoba</option>
            <option value="document">Dokument</option>
          </select>
        </label>

        <label className="create-case-field">
          Izvor
          <select className="create-case-input" name="sourceId" value={formData.sourceId} onChange={onFieldChange}>
            <option value="">Izaberi...</option>
            {sourceOptions.map((source) => (
              <option key={source.id} value={String(source.id)}>
                {formatTimelineSourceOption(formData.itemType, source)}
              </option>
            ))}
          </select>
          {formErrors.sourceId ? <span className="create-case-error">{formErrors.sourceId}</span> : null}
        </label>

        <label className="create-case-field">
          Datum i vreme otkljucavanja
          <input className="create-case-input" type="datetime-local" name="unlockAt" value={formData.unlockAt} onChange={onFieldChange} />
          {formErrors.unlockAt ? <span className="create-case-error">{formErrors.unlockAt}</span> : null}
        </label>

        <label className="create-case-field">
          Napomena
          <textarea className="create-case-textarea" name="unlockNote" value={formData.unlockNote} onChange={onFieldChange} />
          {formErrors.unlockNote ? <span className="create-case-error">{formErrors.unlockNote}</span> : null}
        </label>

        <button type="submit" className="btn btn-secondary" disabled={sourceOptions.length === 0}>
          Dodaj u redosled
        </button>
      </form>
    </section>
  );
}

export default CaseTimelineCreateForm;
