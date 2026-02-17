function renderTextarea({ id, name, label }, formData, formErrors, onFieldChange, isSubmitting) {
  return (
    <label className="create-case-field" htmlFor={id} key={name}>
      {label}
      <textarea
        id={id}
        className="create-case-textarea"
        name={name}
        value={formData[name]}
        onChange={onFieldChange}
        disabled={isSubmitting}
      />
      {formErrors[name] ? <span className="create-case-error">{formErrors[name]}</span> : null}
    </label>
  );
}

function CasePeopleCreateTextareas({ formData, formErrors, onFieldChange, isSubmitting }) {
  const fields = [
    { id: "case-person-biography", name: "biography", label: "Biografija" },
    { id: "case-person-identifying-marks", name: "identifyingMarks", label: "Posebna obiljezja" },
    { id: "case-person-known-associates", name: "knownAssociates", label: "Poznate veze i saradnici" },
    { id: "case-person-prior-offenses", name: "priorOffenses", label: "Istorija dela" },
    { id: "case-person-notes", name: "notes", label: "Administrativne napomene" },
  ];

  return (
    <>
      {fields.map((field) =>
        renderTextarea(field, formData, formErrors, onFieldChange, isSubmitting)
      )}
    </>
  );
}

export default CasePeopleCreateTextareas;
