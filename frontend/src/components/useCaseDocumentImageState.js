import {
  MAX_DOCUMENT_IMAGE_COUNT,
  MAX_DOCUMENT_IMAGE_FILE_SIZE_BYTES,
  supportsImageEvidenceForDocumentType,
} from "./caseDocumentStateUtils";
import { readDocumentImageAsDataUrl } from "./caseDocumentUploadUtils";

export function useCaseDocumentImageState({ formData, setFormData, setFormErrors }) {
  async function handleDocumentImageUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) {
      return;
    }

    if (!supportsImageEvidenceForDocumentType(formData.documentType)) {
      setFormErrors((previous) => ({
        ...previous,
        imageEvidence: "Slike su dozvoljene samo za policijske i forenzičke dokumente.",
      }));
      return;
    }

    const existingCount = (formData.imageEvidence || []).length;
    const availableSlots = Math.max(0, MAX_DOCUMENT_IMAGE_COUNT - existingCount);
    if (availableSlots === 0) {
      setFormErrors((previous) => ({
        ...previous,
        imageEvidence: `Maksimalan broj slika je ${MAX_DOCUMENT_IMAGE_COUNT}.`,
      }));
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    if (selectedFiles.some((file) => file.size > MAX_DOCUMENT_IMAGE_FILE_SIZE_BYTES)) {
      setFormErrors((previous) => ({
        ...previous,
        imageEvidence: "Jedna ili više slika prelaze maksimalnu velicinu od 2MB.",
      }));
      return;
    }

    try {
      const images = await Promise.all(selectedFiles.map((file) => readDocumentImageAsDataUrl(file)));
      setFormData((previous) => ({
        ...previous,
        imageEvidence: [...(previous.imageEvidence || []), ...images],
      }));
      setFormErrors((previous) => {
        if (!previous.imageEvidence) {
          return previous;
        }
        const nextErrors = { ...previous };
        delete nextErrors.imageEvidence;
        return nextErrors;
      });
    } catch {
      setFormErrors((previous) => ({
        ...previous,
        imageEvidence: "Slike nije moguće učitati. Pokušaj ponovo.",
      }));
    }
  }

  function handleDocumentImageRemove(imageIndex) {
    setFormData((previous) => ({
      ...previous,
      imageEvidence: (previous.imageEvidence || []).filter((_, index) => index !== imageIndex),
    }));
    setFormErrors((previous) => {
      if (!previous.imageEvidence) {
        return previous;
      }
      const nextErrors = { ...previous };
      delete nextErrors.imageEvidence;
      return nextErrors;
    });
  }

  return {
    handleDocumentImageUpload,
    handleDocumentImageRemove,
  };
}
