export function toTypeSpecificErrorKey(fieldName) {
  return `typeSpecific.${fieldName}`;
}

export function getCaseDocumentError(formErrors, fieldName) {
  return typeof formErrors?.[fieldName] === "string" ? formErrors[fieldName] : "";
}

export function renderCaseDocumentFieldError(formErrors, fieldName) {
  const errorText = getCaseDocumentError(formErrors, fieldName);
  return errorText ? <span className="create-case-error">{errorText}</span> : null;
}
