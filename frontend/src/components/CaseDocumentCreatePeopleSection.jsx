import { toPersonRoleLabel } from "./caseDocumentHelpers";
import { renderCaseDocumentFieldError } from "./caseDocumentFormHelpers";

function CaseDocumentCreatePeopleSection({
  tabConfig,
  peopleDirectory,
  formData,
  formErrors,
  isSubmitting,
  onFieldChange,
  onRelatedPersonToggle,
}) {
  return (
    <>
      {tabConfig.requiresGiverPerson ? (
        <label className="create-case-field" htmlFor="case-doc-giver-person">
          Osoba koja daje izjavu
          <select
            id="case-doc-giver-person"
            className="create-case-input"
            name="giverPersonId"
            value={formData.giverPersonId}
            onChange={onFieldChange}
            disabled={isSubmitting}
          >
            <option value="">Odaberi osobu</option>
            {peopleDirectory.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName} ({toPersonRoleLabel(person.apparentRole)})
              </option>
            ))}
          </select>
          {renderCaseDocumentFieldError(formErrors, "giverPersonId")}
        </label>
      ) : null}

      <section className="case-doc-people-picker">
        <p>Povezane osobe</p>
        {peopleDirectory.length === 0 ? (
          <p className="case-doc-people-empty">Nema evidentiranih osoba u ovom slučaju.</p>
        ) : (
          <div className="case-doc-people-grid">
            {peopleDirectory.map((person) => (
              <label key={person.id} className="case-doc-person-option">
                <input
                  type="checkbox"
                  checked={formData.relatedPersonIds.includes(person.id)}
                  onChange={(event) => onRelatedPersonToggle(person.id, event.target.checked)}
                  disabled={isSubmitting}
                />
                <span>{person.fullName}</span>
                <small>{toPersonRoleLabel(person.apparentRole)}</small>
              </label>
            ))}
          </div>
        )}
        {renderCaseDocumentFieldError(formErrors, "relatedPersonIds")}
      </section>
    </>
  );
}

export default CaseDocumentCreatePeopleSection;
