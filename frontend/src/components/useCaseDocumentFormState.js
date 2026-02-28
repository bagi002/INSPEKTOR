import { useEffect, useState } from "react";
import {
  buildCreateCaseDocumentPayload,
  buildCaseDocumentFormDataFromDocument,
  buildInitialCaseDocumentFormData,
  normalizeCaseDocumentFieldValue,
  normalizeTypeSpecificFieldValue,
  supportsImageEvidenceForDocumentType,
  toggleRelatedPersonIds,
} from "./caseDocumentStateUtils";
import {
  normalizeCaseDocumentFormErrors,
  validateCaseDocumentForm,
} from "./caseDocumentValidationUtils";
import { buildTypeSpecificDefaults } from "./caseDocumentTypeSpecificConfig";
import { useCaseDocumentImageState } from "./useCaseDocumentImageState";

export function useCaseDocumentFormState({
  caseId,
  category,
  onUnauthorized,
  createDocumentApi,
  updateDocumentApi,
  refreshDocuments,
  onDocumentSaved,
}) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [formData, setFormData] = useState(() => buildInitialCaseDocumentFormData(category));
  const [formErrors, setFormErrors] = useState({});
  const [editingDocumentId, setEditingDocumentId] = useState(null);

  useEffect(() => {
    setFormData(buildInitialCaseDocumentFormData(category));
    setFormErrors({});
    setSubmitError("");
    setSubmitSuccessMessage("");
    setEditingDocumentId(null);
    setIsCreateModalOpen(false);
  }, [category, caseId]);

  function handleFieldChange(event) {
    const { name, type, checked, value } = event.target;
    const nextValue = normalizeCaseDocumentFieldValue({ type, checked, value });

    if (name === "documentType") {
      setFormData((previous) => ({
        ...previous,
        documentType: nextValue,
        typeSpecific: buildTypeSpecificDefaults(nextValue),
        imageEvidence: supportsImageEvidenceForDocumentType(nextValue) ? previous.imageEvidence : [],
      }));
      setFormErrors((previous) => {
        const nextErrors = { ...previous };
        delete nextErrors.documentType;
        delete nextErrors.imageEvidence;
        Object.keys(nextErrors).forEach((key) => {
          if (key.startsWith("typeSpecific.")) {
            delete nextErrors[key];
          }
        });
        return nextErrors;
      });
      return;
    }

    setFormData((previous) => ({ ...previous, [name]: nextValue }));
    setFormErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }
      const nextErrors = { ...previous };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  function handleTypeSpecificFieldChange(fieldName, event) {
    const { type, checked, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      typeSpecific: {
        ...(previous.typeSpecific || {}),
        [fieldName]: normalizeTypeSpecificFieldValue(previous.documentType, fieldName, {
          type,
          checked,
          value,
        }),
      },
    }));

    const errorKey = `typeSpecific.${fieldName}`;
    setFormErrors((previous) => {
      if (!previous[errorKey]) {
        return previous;
      }
      const nextErrors = { ...previous };
      delete nextErrors[errorKey];
      return nextErrors;
    });
  }

  function handleRelatedPersonToggle(personId, isChecked) {
    setFormData((previous) => ({
      ...previous,
      relatedPersonIds: toggleRelatedPersonIds(previous.relatedPersonIds, personId, isChecked),
    }));
    setFormErrors((previous) => {
      if (!previous.relatedPersonIds) {
        return previous;
      }
      const nextErrors = { ...previous };
      delete nextErrors.relatedPersonIds;
      return nextErrors;
    });
  }

  const { handleDocumentImageUpload, handleDocumentImageRemove } = useCaseDocumentImageState({
    formData,
    setFormData,
    setFormErrors,
  });

  async function handleSaveDocument(event) {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccessMessage("");

    const nextErrors = validateCaseDocumentForm(formData, category);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const payload = buildCreateCaseDocumentPayload(formData, category);
    const result =
      editingDocumentId && typeof updateDocumentApi === "function"
        ? await updateDocumentApi(caseId, editingDocumentId, payload)
        : await createDocumentApi(caseId, payload);

    if (!result.ok) {
      if (result.unauthorized) {
        setIsSubmitting(false);
        onUnauthorized();
        return;
      }

      const backendErrors = normalizeCaseDocumentFormErrors(result.errors);
      if (Object.keys(backendErrors).length > 0) {
        setFormErrors((previous) => ({ ...previous, ...backendErrors }));
      }

      setSubmitError(result.message || "Čuvanje dokumenta nije uspelo.");
      setIsSubmitting(false);
      return;
    }

    setFormData(buildInitialCaseDocumentFormData(category));
    setEditingDocumentId(null);
    setFormErrors({});
    setSubmitSuccessMessage(
      result.message ||
        (editingDocumentId
          ? "Dokument je uspešno ažuriran."
          : "Dokument je uspešno sačuvan.")
    );
    await refreshDocuments();
    setIsCreateModalOpen(false);
    if (typeof onDocumentSaved === "function") {
      onDocumentSaved(result.data?.document?.id || null);
    }
    setIsSubmitting(false);
  }

  function openCreateModal() {
    setFormData(buildInitialCaseDocumentFormData(category));
    setFormErrors({});
    setSubmitError("");
    setSubmitSuccessMessage("");
    setEditingDocumentId(null);
    setIsCreateModalOpen(true);
  }

  function openEditModal(document) {
    setFormData(buildCaseDocumentFormDataFromDocument(document, category));
    setFormErrors({});
    setSubmitError("");
    setSubmitSuccessMessage("");
    setEditingDocumentId(Number(document?.id) || null);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (!isSubmitting) {
      setIsCreateModalOpen(false);
    }
  }

  return {
    isCreateModalOpen,
    isSubmitting,
    submitError,
    submitSuccessMessage,
    isEditMode: Boolean(editingDocumentId),
    formData,
    formErrors,
    handleFieldChange,
    handleTypeSpecificFieldChange,
    handleRelatedPersonToggle,
    handleDocumentImageUpload,
    handleDocumentImageRemove,
    handleSaveDocument,
    openCreateModal,
    openEditModal,
    closeCreateModal,
  };
}
