import {
  CASE_PERSON_RISK_OPTIONS,
  CASE_PERSON_ROLE_OPTIONS,
} from "./casePeopleOptions";
import {
  CASE_PEOPLE_SELECT_FIELDS,
  CASE_PEOPLE_TEXT_FIELDS,
} from "./casePeopleFormFieldSets";

function renderFieldError(fieldName, formErrors) {
  if (!formErrors[fieldName]) {
    return null;
  }

  return <span className="create-case-error">{formErrors[fieldName]}</span>;
}

function renderSelectField({ id, name, label, options, value }, formErrors, onFieldChange, isSubmitting) {
  return (
    <label className="create-case-field" htmlFor={id} key={name}>
      {label}
      <select
        id={id}
        className="create-case-input"
        name={name}
        value={value}
        onChange={onFieldChange}
        disabled={isSubmitting}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {renderFieldError(name, formErrors)}
    </label>
  );
}

function CasePeopleCreateBasics({
  formData,
  formErrors,
  isSubmitting,
  onFieldChange,
  onPhotoUpload,
  onPhotoRemove,
}) {
  return (
    <>
      <div className="case-people-form-grid">
        <label className="create-case-field" htmlFor="case-person-full-name">
          Ime i prežime
          <input
            id="case-person-full-name"
            className="create-case-input"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={onFieldChange}
            disabled={isSubmitting}
          />
          {renderFieldError("fullName", formErrors)}
        </label>

        {renderSelectField(
          {
            id: "case-person-role",
            name: "apparentRole",
            label: "Uloga u slučaju",
            options: CASE_PERSON_ROLE_OPTIONS,
            value: formData.apparentRole,
          },
          formErrors,
          onFieldChange,
          isSubmitting
        )}

        <label className="create-case-field" htmlFor="case-person-birth-date">
          Datum rodjenja
          <input
            id="case-person-birth-date"
            className="create-case-input"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={onFieldChange}
            disabled={isSubmitting}
          />
          {renderFieldError("birthDate", formErrors)}
        </label>

        {renderSelectField(
          {
            id: "case-person-risk-level",
            name: "riskLevel",
            label: "Nivo rizika",
            options: CASE_PERSON_RISK_OPTIONS,
            value: formData.riskLevel,
          },
          formErrors,
          onFieldChange,
          isSubmitting
        )}
      </div>

      <div className="case-people-form-grid">
        {CASE_PEOPLE_TEXT_FIELDS.map((field) => (
          <label className="create-case-field" htmlFor={field.id} key={field.name}>
            {field.label}
            <input
              id={field.id}
              className="create-case-input"
              name={field.name}
              type="text"
              value={formData[field.name]}
              onChange={onFieldChange}
              disabled={isSubmitting}
            />
            {renderFieldError(field.name, formErrors)}
          </label>
        ))}

        {CASE_PEOPLE_SELECT_FIELDS.map((field) =>
          renderSelectField(
            {
              ...field,
              value: field.name === "isAlive" ? (formData.isAlive ? "true" : "false") : formData[field.name],
            },
            formErrors,
            onFieldChange,
            isSubmitting
          )
        )}
      </div>

      <div className="case-people-form-grid">
        <label className="create-case-field" htmlFor="case-person-height">
          Visina (cm)
          <input
            id="case-person-height"
            className="create-case-input"
            name="heightCm"
            type="number"
            min="50"
            max="260"
            value={formData.heightCm}
            onChange={onFieldChange}
            disabled={isSubmitting}
          />
          {renderFieldError("heightCm", formErrors)}
        </label>

        <label className="create-case-field" htmlFor="case-person-weight">
          Tezina (kg)
          <input
            id="case-person-weight"
            className="create-case-input"
            name="weightKg"
            type="number"
            min="25"
            max="300"
            value={formData.weightKg}
            onChange={onFieldChange}
            disabled={isSubmitting}
          />
          {renderFieldError("weightKg", formErrors)}
        </label>
      </div>

      <div className="case-people-photo-block">
        <label className="create-case-field" htmlFor="case-person-photo-file">
          Fotografija osobe
          <input
            id="case-person-photo-file"
            className="create-case-input"
            name="photoFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onPhotoUpload}
            disabled={isSubmitting}
          />
          {renderFieldError("photoDataUrl", formErrors)}
        </label>

        {formData.photoDataUrl ? (
          <div className="case-people-photo-preview">
            <img src={formData.photoDataUrl} alt="Fotografija osobe" />
            <button type="button" className="btn btn-secondary inline-action" onClick={onPhotoRemove}>
              Ukloni sliku
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default CasePeopleCreateBasics;
