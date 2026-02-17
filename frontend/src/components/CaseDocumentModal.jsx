import {
  buildTypeSpecificRows,
  formatRecordedAt,
  toClassificationLabel,
  toDocumentTypeLabel,
  toPersonRoleLabel,
} from "./caseDocumentHelpers";
import { buildPersonDossierHref } from "./caseWorkspaceLinking";

function renderField(label, value) {
  return (
    <p>
      <strong>{label}:</strong> {value || "Nije evidentirano"}
    </p>
  );
}

function CaseDocumentModal({ caseId, mode, document, tabConfig, onClose }) {
  if (!document) {
    return null;
  }

  const metadata = document.metadata || {};
  const typeSpecificRows = buildTypeSpecificRows(document.documentType, metadata.typeSpecific);
  const imageEvidence = metadata.imageEvidence || [];

  return (
    <div className="case-doc-modal-overlay" role="dialog" aria-modal="true">
      <section className="case-doc-modal">
        <div className="case-people-modal-header">
          <h3>Formalni prikaz dokumenta</h3>
          <button type="button" className="btn btn-secondary case-people-modal-close" onClick={onClose}>
            Zatvori
          </button>
        </div>

        <article className="case-doc-file">
          <header className="case-doc-file-header">
            <p className="case-doc-file-kicker">MUP - Uprava kriminalisticke policije</p>
            <h4>{tabConfig.previewTitle}</h4>
            <p className="case-doc-file-number">Broj dokumenta: {metadata.documentNumber || "N/A"}</p>
          </header>

          <section className="case-doc-file-main">
            {renderField("Naslov", document.title)}
            {renderField("Tip", toDocumentTypeLabel(document.documentType))}
            {renderField("Klasifikacija", toClassificationLabel(metadata.classificationLevel))}
            {renderField("Datum i vrijeme", formatRecordedAt(metadata.recordedAt))}
            {renderField("Lokacija", metadata.location)}
            {renderField("Sluzbenik", metadata.officerName)}
            {renderField("Broj znacke", metadata.badgeNumber)}
            {renderField("Jedinica/Laboratorija", metadata.department)}
            {renderField("Referenca dokaza", metadata.evidenceReference)}
            {renderField("Pravna referenca", metadata.legalReference)}
            {document.giverPerson
              ? renderField(
                  "Davalac izjave",
                  `${document.giverPerson.fullName} (${toPersonRoleLabel(document.giverPerson.apparentRole)})`
                )
              : null}
          </section>

          <section className="case-doc-file-content">
            <h5>Sadrzaj</h5>
            <p>{document.content || "Nije evidentiran sadrzaj."}</p>
          </section>

          {typeSpecificRows.length > 0 ? (
            <section className="case-doc-file-type-specific">
              <h5>Tip-specificki podaci</h5>
              <div className="case-doc-file-main">
                {typeSpecificRows.map((row) => (
                  <p key={row.label}>
                    <strong>{row.label}:</strong> {row.value || "Nije evidentirano"}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          {imageEvidence.length > 0 ? (
            <section className="case-doc-file-images">
              <h5>Fotodokumentacija</h5>
              <div className="case-doc-image-grid">
                {imageEvidence.map((imageDataUrl, index) => (
                  <article className="case-doc-image-card" key={`${document.id}-${index + 1}`}>
                    <img src={imageDataUrl} alt={`Dokaz ${index + 1}`} />
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="case-doc-file-people">
            <h5>Povezane osobe</h5>
            {(document.relatedPeople || []).length === 0 ? (
              <p>Nema povezanih osoba.</p>
            ) : (
              <ul>
                {document.relatedPeople.map((person) => (
                  <li key={person.id}>
                    <a
                      className="case-doc-person-link"
                      href={buildPersonDossierHref(caseId, mode, person.id)}
                    >
                      {person.fullName} ({toPersonRoleLabel(person.apparentRole)})
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {metadata.notes ? (
            <section className="case-doc-file-notes">
              <h5>Napomene</h5>
              <p>{metadata.notes}</p>
            </section>
          ) : null}
        </article>
      </section>
    </div>
  );
}

export default CaseDocumentModal;
