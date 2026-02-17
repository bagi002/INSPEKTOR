import { useEffect, useMemo } from "react";
import CasePeopleCreateForm from "./CasePeopleCreateForm";
import CasePeopleOverviewPanel from "./CasePeopleOverviewPanel";
import CasePersonDossierModal from "./CasePersonDossierModal";
import {
  consumeWorkspaceLinkingQueryParams,
  parsePersonIdFromLocationSearch,
} from "./caseWorkspaceLinking";
import { useCasePeopleTabState } from "./useCasePeopleTabState";
import { useCasePeopleLinkedDocumentsState } from "./useCasePeopleLinkedDocumentsState";

function CasePeopleTab({ caseId, mode, onUnauthorized }) {
  const {
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
  } = useCasePeopleTabState({ caseId, mode, onUnauthorized });

  const { linkedDocumentsError, getLinkedDocumentsForPerson } =
    useCasePeopleLinkedDocumentsState({ caseId, onUnauthorized });
  const activePersonLinkedDocuments = useMemo(
    () => getLinkedDocumentsForPerson(activePerson?.id),
    [activePerson?.id, getLinkedDocumentsForPerson]
  );

  useEffect(() => {
    if (typeof window === "undefined" || people.length === 0) {
      return;
    }

    const linkedPersonId = parsePersonIdFromLocationSearch(window.location.search);
    if (!linkedPersonId) {
      return;
    }

    const exists = people.some((person) => person.id === linkedPersonId);
    if (!exists) {
      consumeWorkspaceLinkingQueryParams(["personId"]);
      return;
    }

    openDossierModal(linkedPersonId);
    consumeWorkspaceLinkingQueryParams(["personId"]);
  }, [people, openDossierModal]);

  return (
    <>
      {isLoading ? (
        <section className="card reveal delay-3">
          <p>Ucitavam osobe i dosijee...</p>
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="card reveal delay-3">
          <p className="error-banner">{errorMessage}</p>
          <button type="button" className="btn btn-primary inline-action" onClick={loadPeople}>
            Pokusaj ponovo
          </button>
        </section>
      ) : null}

      {!isLoading && !errorMessage ? (
        <CasePeopleOverviewPanel
          people={people}
          onOpenCreateModal={openCreateModal}
          onOpenDossierModal={openDossierModal}
          isCreateMode={isCreateMode}
        />
      ) : null}

      {!isLoading && !errorMessage && isCreateMode && isCreateModalOpen ? (
        <div className="case-people-modal-overlay" role="dialog" aria-modal="true">
          <section className="case-people-modal">
            <CasePeopleCreateForm
              formData={formData}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              submitError={submitError}
              submitSuccessMessage={submitSuccessMessage}
              onFieldChange={handleFieldChange}
              onPhotoUpload={handlePhotoUpload}
              onPhotoRemove={handlePhotoRemove}
              onSubmit={handleCreatePerson}
              onCancel={closeCreateModal}
            />
          </section>
        </div>
      ) : null}

      {!isLoading && !errorMessage && isDossierModalOpen ? (
        <CasePersonDossierModal
          caseId={caseId}
          mode={mode}
          person={activePerson}
          linkedDocuments={activePersonLinkedDocuments}
          linkedDocumentsError={linkedDocumentsError}
          onClose={closeDossierModal}
        />
      ) : null}
    </>
  );
}

export default CasePeopleTab;
