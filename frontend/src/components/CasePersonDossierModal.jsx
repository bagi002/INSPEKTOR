import {
  toEducationLabel,
  toEyeColorLabel,
  toGenderLabel,
  toHairColorLabel,
  toMaritalStatusLabel,
  toNationalityLabel,
  toRiskLabel,
  toRoleLabel,
} from "./casePeopleHelpers";
import { formatRecordedAt, toDocumentTypeLabel } from "./caseDocumentHelpers";
import { buildDocumentPreviewHref, buildInterrogationHref } from "./caseWorkspaceLinking";
import { CASE_WORKSPACE_MODES } from "../utils/routes";

function renderField(label, value) {
  return (
    <p>
      <strong>{label}:</strong> {value || "Nije evidentirano"}
    </p>
  );
}

function CasePersonDossierModal({
  caseId,
  mode,
  person,
  linkedDocuments,
  linkedDocumentsError,
  isCreateMode = false,
  onEditPerson = null,
  onClose,
}) {
  if (!person) {
    return null;
  }

  const dossier = person.dossier || {};
  const safeLinkedDocuments = Array.isArray(linkedDocuments) ? linkedDocuments : [];

  return (
    <div className="case-people-modal-overlay" role="dialog" aria-modal="true">
      <section className="case-people-modal case-people-modal-dossier">
        <div className="case-people-modal-header">
          <h3>Formalni dosije osobe</h3>
          <div className="case-people-modal-actions">
            {isCreateMode && typeof onEditPerson === "function" ? (
              <button type="button" className="btn btn-primary" onClick={onEditPerson}>
                Izmeni dosije
              </button>
            ) : null}
            <button type="button" className="btn btn-secondary case-people-modal-close" onClick={onClose}>
              Zatvori
            </button>
          </div>
        </div>

        <article className="dossier-document">
          <header className="dossier-document-header">
            <p className="dossier-document-kicker">MUP - Uprava kriminalisticke policije</p>
            <h4>DOSIJE LICA</h4>
            <p className="dossier-document-number">Broj dosijea: {dossier.dossierNumber}</p>
          </header>

          <section className="dossier-document-person">
            <div className="dossier-photo-frame">
              {dossier.photoDataUrl ? (
                <img src={dossier.photoDataUrl} alt={`Fotografija osobe ${person.fullName}`} />
              ) : (
                <span>Nema fotografije</span>
              )}
            </div>
            <div className="dossier-person-summary">
              {renderField("Ime i prežime", person.fullName)}
              {renderField("Uloga u slučaju", toRoleLabel(person.apparentRole))}
              {renderField("Status osobe", dossier.isAlive ? "Ziv/a" : "Preminuo/la")}
              {renderField("Nivo rizika", toRiskLabel(dossier.riskLevel))}
            </div>
          </section>

          <section className="dossier-document-meta">
            {renderField("Status dosijea", dossier.dossierStatus)}
            {renderField("Klasifikacija", dossier.classificationLevel)}
            {renderField("Revizija", dossier.revisionNumber)}
            {renderField("Generisan od korisnika ID", dossier.generatedByUserId)}
            {renderField("Vrijeme generisanja", dossier.generatedAt)}
            {renderField("Posljednja revizija", dossier.lastReviewedAt)}
          </section>

          <section className="dossier-document-grid">
            {renderField("Datum rodjenja", dossier.birthDate)}
            {renderField("Mjesto rodjenja", dossier.birthPlace)}
            {renderField("Nacionalnost", toNationalityLabel(dossier.nationality))}
            {renderField("Pol", toGenderLabel(dossier.gender))}
            {renderField("Bracni status", toMaritalStatusLabel(dossier.maritalStatus))}
            {renderField("Telefon", dossier.phoneNumber)}
            {renderField("Adresa", dossier.address)}
            {renderField("Visina", dossier.heightCm ? `${dossier.heightCm} cm` : "")}
            {renderField("Tezina", dossier.weightKg ? `${dossier.weightKg} kg` : "")}
            {renderField("Boja ociju", toEyeColorLabel(dossier.eyeColor))}
            {renderField("Boja kose", toHairColorLabel(dossier.hairColor))}
            {renderField("Zanimanje", dossier.occupation)}
            {renderField("Poslodavac", dossier.employer)}
            {renderField("Stepen obrazovanja", toEducationLabel(dossier.educationLevel))}
            {renderField("Posljednja poznata lokacija", dossier.lastKnownLocation)}
          </section>

          <section className="dossier-document-long">
            {renderField("Biografija", person.biography)}
            {renderField("Posebna obiljezja", dossier.identifyingMarks)}
            {renderField("Poznate veze", dossier.knownAssociates)}
            {renderField("Istorija dela", dossier.priorOffenses)}
            {renderField("Administrativne napomene", dossier.notes)}
          </section>

          <section className="dossier-document-linked-docs">
            <div className="dossier-linked-header">
              <h5>Povezani dokumenti i izjave</h5>
              <a
                className="btn btn-secondary dossier-interrogation-link"
                href={buildInterrogationHref(caseId, CASE_WORKSPACE_MODES.SOLVE, person.id)}
              >
                Saslušaj osobu
              </a>
            </div>
            {linkedDocumentsError ? (
              <p className="dossier-linked-error">{linkedDocumentsError}</p>
            ) : null}
            {safeLinkedDocuments.length === 0 ? (
              <p>Nema povezanih dokumenata ili izjava za ovu osobu.</p>
            ) : (
              <ul className="dossier-linked-list">
                {safeLinkedDocuments.map((document) => (
                  <li key={document.id}>
                    <a
                      className="dossier-linked-link"
                      href={buildDocumentPreviewHref(caseId, mode, document)}
                    >
                      <strong>{document.title || "Dokument bez naslova"}</strong>
                      <span>
                        {toDocumentTypeLabel(document.documentType)} |{" "}
                        {document.metadata?.documentNumber || "N/A"} |{" "}
                        {formatRecordedAt(document.metadata?.recordedAt)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </article>
      </section>
    </div>
  );
}

export default CasePersonDossierModal;
