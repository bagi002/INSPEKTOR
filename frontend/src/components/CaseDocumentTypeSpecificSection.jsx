import { getTypeSpecificFieldsForDocumentType } from "./caseDocumentTypeSpecificConfig";
import {
  renderCaseDocumentFieldError,
  toTypeSpecificErrorKey,
} from "./caseDocumentFormHelpers";

function CaseDocumentTypeSpecificSection({
  documentType,
  typeSpecificData,
  formErrors,
  isSubmitting,
  onTypeSpecificFieldChange,
}) {
  const fields = getTypeSpecificFieldsForDocumentType(documentType);
  if (fields.length === 0) {
    return null;
  }

  return (
    <section className="case-doc-type-specific-section">
      <h4>Tip-specificka polja</h4>
      <div className="case-doc-form-grid">
        {fields.map((field) => {
          const fieldId = `case-doc-type-${documentType}-${field.name}`;
          const errorKey = toTypeSpecificErrorKey(field.name);
          const value = typeSpecificData?.[field.name];

          if (field.inputType === "textarea") {
            return (
              <label className="create-case-field case-doc-field-full" htmlFor={fieldId} key={field.name}>
                {field.label}
                <textarea
                  id={fieldId}
                  className="create-case-textarea"
                  value={value || ""}
                  onChange={(event) => onTypeSpecificFieldChange(field.name, event)}
                  disabled={isSubmitting}
                />
                {renderCaseDocumentFieldError(formErrors, errorKey)}
              </label>
            );
          }

          if (field.inputType === "select") {
            return (
              <label className="create-case-field" htmlFor={fieldId} key={field.name}>
                {field.label}
                <select
                  id={fieldId}
                  className="create-case-input"
                  value={value || ""}
                  onChange={(event) => onTypeSpecificFieldChange(field.name, event)}
                  disabled={isSubmitting}
                >
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {renderCaseDocumentFieldError(formErrors, errorKey)}
              </label>
            );
          }

          if (field.inputType === "checkbox") {
            return (
              <label className="create-case-field case-doc-unlock-toggle" htmlFor={fieldId} key={field.name}>
                <span>{field.label}</span>
                <input
                  id={fieldId}
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => onTypeSpecificFieldChange(field.name, event)}
                  disabled={isSubmitting}
                />
                {renderCaseDocumentFieldError(formErrors, errorKey)}
              </label>
            );
          }

          return (
            <label className="create-case-field" htmlFor={fieldId} key={field.name}>
              {field.label}
              <input
                id={fieldId}
                className="create-case-input"
                type={field.inputType === "number" ? "number" : "text"}
                min={field.inputType === "number" ? "0" : undefined}
                value={value || ""}
                onChange={(event) => onTypeSpecificFieldChange(field.name, event)}
                disabled={isSubmitting}
              />
              {renderCaseDocumentFieldError(formErrors, errorKey)}
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default CaseDocumentTypeSpecificSection;
