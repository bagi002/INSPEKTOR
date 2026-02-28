import CaseDocumentCreateForm from "./CaseDocumentCreateForm";
import CaseDocumentModal from "./CaseDocumentModal";
import CaseDocumentsOverviewPanel from "./CaseDocumentsOverviewPanel";
import { getCaseDocumentTabConfig } from "./caseDocumentConfig";
import { useCaseDocumentsTabState } from "./useCaseDocumentsTabState";

function CaseDocumentsTab({ caseId, mode, category, onUnauthorized }) {
  const tabConfig = getCaseDocumentTabConfig(category);

  const {
    documents,
    peopleDirectory,
    activeDocument,
    isCreateMode,
    isCreateModalOpen,
    isPreviewModalOpen,
    isLoading,
    errorMessage,
    isSubmitting,
    submitError,
    submitSuccessMessage,
    isEditMode,
    formData,
    formErrors,
    loadDocuments,
    handleFieldChange,
    handleTypeSpecificFieldChange,
    handleRelatedPersonToggle,
    handleDocumentImageUpload,
    handleDocumentImageRemove,
    handleSaveDocument,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    openPreviewModal,
    closePreviewModal,
  } = useCaseDocumentsTabState({ caseId, mode, category, onUnauthorized });

  return (
    <>
      {isLoading ? (
        <section className="card reveal delay-3">
          <p>Učitavam dokumente...</p>
        </section>
      ) : null}

      {!isLoading && errorMessage ? (
        <section className="card reveal delay-3">
          <p className="error-banner">{errorMessage}</p>
          <button type="button" className="btn btn-primary inline-action" onClick={loadDocuments}>
            Pokušaj ponovo
          </button>
        </section>
      ) : null}

      {!isLoading && !errorMessage ? (
        <CaseDocumentsOverviewPanel
          documents={documents}
          tabConfig={tabConfig}
          isCreateMode={isCreateMode}
          onOpenCreateModal={openCreateModal}
          onOpenPreviewModal={openPreviewModal}
        />
      ) : null}

      {!isLoading && !errorMessage && isCreateMode && isCreateModalOpen ? (
        <div className="case-doc-modal-overlay" role="dialog" aria-modal="true">
          <section className="case-doc-modal">
            <CaseDocumentCreateForm
              tabConfig={tabConfig}
              peopleDirectory={peopleDirectory}
              formData={formData}
              formErrors={formErrors}
              isSubmitting={isSubmitting}
              submitError={submitError}
              submitSuccessMessage={submitSuccessMessage}
              onFieldChange={handleFieldChange}
              onTypeSpecificFieldChange={handleTypeSpecificFieldChange}
              onRelatedPersonToggle={handleRelatedPersonToggle}
              onImageUpload={handleDocumentImageUpload}
              onImageRemove={handleDocumentImageRemove}
              isEditMode={isEditMode}
              onSubmit={handleSaveDocument}
              onCancel={closeCreateModal}
            />
          </section>
        </div>
      ) : null}

      {!isLoading && !errorMessage && isPreviewModalOpen ? (
        <CaseDocumentModal
          caseId={caseId}
          mode={mode}
          document={activeDocument}
          tabConfig={tabConfig}
          isCreateMode={isCreateMode}
          onEditDocument={() => openEditModal(activeDocument?.id)}
          onClose={closePreviewModal}
        />
      ) : null}
    </>
  );
}

export default CaseDocumentsTab;
