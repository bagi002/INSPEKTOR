import { supportsImageEvidenceForDocumentType } from "./caseDocumentStateUtils";
import { renderCaseDocumentFieldError } from "./caseDocumentFormHelpers";

function CaseDocumentImageSection({
  documentType,
  imageEvidence,
  formErrors,
  isSubmitting,
  onImageUpload,
  onImageRemove,
}) {
  if (!supportsImageEvidenceForDocumentType(documentType)) {
    return null;
  }

  return (
    <section className="case-doc-image-section">
      <h4>Fotodokumentacija</h4>
      <label className="create-case-field" htmlFor="case-doc-image-evidence">
        Dodaj slike dokaza
        <input
          id="case-doc-image-evidence"
          className="create-case-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          onChange={onImageUpload}
          disabled={isSubmitting}
        />
        {renderCaseDocumentFieldError(formErrors, "imageEvidence")}
      </label>

      {(imageEvidence || []).length > 0 ? (
        <div className="case-doc-image-grid">
          {(imageEvidence || []).map((imageDataUrl, index) => (
            <article className="case-doc-image-card" key={`${index + 1}`}>
              <img src={imageDataUrl} alt={`Dokaz ${index + 1}`} />
              <button
                type="button"
                className="btn btn-secondary inline-action"
                onClick={() => onImageRemove(index)}
                disabled={isSubmitting}
              >
                Ukloni
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="case-doc-image-empty">Nema dodatih slika.</p>
      )}
    </section>
  );
}

export default CaseDocumentImageSection;
