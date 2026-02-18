import { useCallback, useEffect, useMemo, useState } from "react";
import { createCasePerson, fetchCasePeople } from "../services/casePeopleApi";
import { CASE_WORKSPACE_MODES } from "../utils/routes";
import {
  INITIAL_PERSON_FORM_DATA,
  normalizePersonFormErrors,
  validatePersonForm,
} from "./casePeopleHelpers";
import {
  buildCreatePersonPayload,
  MAX_PHOTO_FILE_SIZE_BYTES,
  normalizeFieldValue,
  readPhotoDataUrl,
} from "./casePeopleStateUtils";
export function useCasePeopleTabState({ caseId, mode, onUnauthorized }) {
  const [people, setPeople] = useState([]);
  const [activePersonId, setActivePersonId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState("");
  const [formData, setFormData] = useState(INITIAL_PERSON_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const isCreateMode = mode === CASE_WORKSPACE_MODES.CREATE;
  const activePerson = useMemo(
    () => people.find((person) => person.id === activePersonId) || null,
    [people, activePersonId]
  );

  const loadPeople = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    const result = await fetchCasePeople(caseId, isCreateMode ? "create" : "solve");
    if (!result.ok) {
      if (result.unauthorized) {
        setIsLoading(false);
        onUnauthorized();
        return;
      }
      setErrorMessage(result.message || "Učitavanje osoba i dosijea nije uspelo.");
      setIsLoading(false);
      return;
    }

    const nextPeople = Array.isArray(result.data?.people) ? result.data.people : [];
    setPeople(nextPeople);
    setActivePersonId((previousActiveId) =>
      nextPeople.some((person) => person.id === previousActiveId) ? previousActiveId : null
    );
    setIsLoading(false);
  }, [caseId, isCreateMode, onUnauthorized]);
  useEffect(() => {
    void loadPeople();
  }, [loadPeople]);
  function handleFieldChange(event) {
    const { name, type, checked, value } = event.target;
    const nextValue = normalizeFieldValue({ name, type, checked, value });
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

  async function handlePhotoUpload(event) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      return;
    }
    if (file.size > MAX_PHOTO_FILE_SIZE_BYTES) {
      setFormErrors((previous) => ({
        ...previous,
        photoDataUrl: "Fotografija je prevelika. Maksimalna velicina je oko 2MB.",
      }));
      return;
    }
    try {
      const photoDataUrl = await readPhotoDataUrl(file);
      setFormData((previous) => ({ ...previous, photoDataUrl }));
      setFormErrors((previous) => {
        const nextErrors = { ...previous };
        delete nextErrors.photoDataUrl;
        return nextErrors;
      });
    } catch {
      setFormErrors((previous) => ({
        ...previous,
        photoDataUrl: "Fotografiju nije moguće učitati. Pokušaj ponovo.",
      }));
    } finally {
      event.target.value = "";
    }
  }

  function handlePhotoRemove() {
    setFormData((previous) => ({ ...previous, photoDataUrl: "" }));
    setFormErrors((previous) => {
      if (!previous.photoDataUrl) {
        return previous;
      }
      const nextErrors = { ...previous };
      delete nextErrors.photoDataUrl;
      return nextErrors;
    });
  }

  async function handleCreatePerson(event) {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccessMessage("");
    const nextErrors = validatePersonForm(formData);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setIsSubmitting(true);
    const payload = buildCreatePersonPayload(formData);
    const result = await createCasePerson(caseId, payload);
    if (!result.ok) {
      if (result.unauthorized) {
        setIsSubmitting(false);
        onUnauthorized();
        return;
      }
      const backendErrors = normalizePersonFormErrors(result.errors);
      if (Object.keys(backendErrors).length > 0) {
        setFormErrors((previous) => ({ ...previous, ...backendErrors }));
      }
      setSubmitError(result.message || "Čuvanje osobe nije uspelo.");
      setIsSubmitting(false);
      return;
    }

    setFormData(INITIAL_PERSON_FORM_DATA);
    setFormErrors({});
    setSubmitSuccessMessage(result.message || "Osoba i dosije su uspešno sačuvani.");
    await loadPeople();
    setIsCreateModalOpen(false);
    setActivePersonId(result.data?.person?.id || null);
    setIsDossierModalOpen(true);
    setIsSubmitting(false);
  }
  function openCreateModal() {
    setSubmitError("");
    setSubmitSuccessMessage("");
    setFormErrors({});
    setFormData(INITIAL_PERSON_FORM_DATA);
    setIsCreateModalOpen(true);
  }
  function closeCreateModal() {
    if (!isSubmitting) {
      setIsCreateModalOpen(false);
    }
  }
  function openDossierModal(personId) {
    setActivePersonId(personId);
    setIsDossierModalOpen(true);
  }
  function closeDossierModal() {
    setIsDossierModalOpen(false);
  }
  return {
    people,
    activePerson,
    isCreateMode,
    isCreateModalOpen,
    isDossierModalOpen,
    isLoading,
    errorMessage,
    isSubmitting,
    submitError,
    submitSuccessMessage,
    formData,
    formErrors,
    loadPeople,
    handleFieldChange,
    handlePhotoUpload,
    handlePhotoRemove,
    handleCreatePerson,
    openCreateModal,
    closeCreateModal,
    openDossierModal,
    closeDossierModal,
  };
}
