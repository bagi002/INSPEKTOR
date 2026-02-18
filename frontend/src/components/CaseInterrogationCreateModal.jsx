import CaseInterrogationNodeBuilderSection from "./CaseInterrogationNodeBuilderSection";

function CaseInterrogationCreateModal({
  people,
  formData,
  formErrors,
  nodeDraft,
  nodeDraftError,
  isSubmitting,
  submitError,
  submitSuccessMessage,
  onFieldChange,
  onNodeDraftChange,
  onAddNode,
  onRemoveNode,
  onSubmit,
  onCancel,
}) {
  const availablePeople = (Array.isArray(people) ? people : []).filter((person) => person.isAlive !== false);
  const nodes = Array.isArray(formData?.nodes) ? formData.nodes : [];

  return (
    <form className="case-interrogation-form" onSubmit={onSubmit}>
      <header className="case-interrogation-create-header">
        <h3>Kreiranje saslušanja</h3>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Zatvori
        </button>
      </header>

      {submitError ? <p className="error-banner">{submitError}</p> : null}
      {submitSuccessMessage ? <p className="success-banner">{submitSuccessMessage}</p> : null}

      <div className="case-interrogation-form-grid">
        <label className="create-case-field">
          Osoba
          <select
            className="create-case-input"
            name="personId"
            value={formData.personId}
            onChange={onFieldChange}
            disabled={isSubmitting}
          >
            <option value="">Izaberi osobu</option>
            {availablePeople.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName}
              </option>
            ))}
          </select>
          {formErrors.personId ? <span className="create-case-error">{formErrors.personId}</span> : null}
        </label>

        <label className="create-case-field">
          Naslov saslušanja
          <input
            className="create-case-input"
            type="text"
            name="title"
            value={formData.title}
            onChange={onFieldChange}
            placeholder="npr. Operativno saslušanje osumnjičenog"
            maxLength={160}
            disabled={isSubmitting}
          />
          {formErrors.title ? <span className="create-case-error">{formErrors.title}</span> : null}
        </label>
      </div>

      <label className="create-case-field">
        Uvodna poruka
        <textarea
          className="create-case-textarea"
          name="openingPrompt"
          value={formData.openingPrompt}
          onChange={onFieldChange}
          rows={3}
          placeholder="Kratko objašnjenje toka saslušanja u chatu."
          disabled={isSubmitting}
        />
        {formErrors.openingPrompt ? (
          <span className="create-case-error">{formErrors.openingPrompt}</span>
        ) : null}
      </label>

      <CaseInterrogationNodeBuilderSection
        nodes={nodes}
        nodeDraft={nodeDraft}
        nodeDraftError={nodeDraftError}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onNodeDraftChange={onNodeDraftChange}
        onAddNode={onAddNode}
        onRemoveNode={onRemoveNode}
      />

      <div className="cta-row">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || availablePeople.length === 0}>
          {isSubmitting ? "Čuvam..." : "Sačuvaj saslušanje"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>
          Odustani
        </button>
      </div>
    </form>
  );
}

export default CaseInterrogationCreateModal;
