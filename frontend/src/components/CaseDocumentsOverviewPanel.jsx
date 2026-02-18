import { useMemo, useState } from "react";
import { buildDocumentStats, normalizeSearchText, toClassificationLabel, toDocumentTypeLabel } from "./caseDocumentHelpers";

function CaseDocumentsOverviewPanel({
  documents,
  tabConfig,
  isCreateMode,
  onOpenCreateModal,
  onOpenPreviewModal,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [classificationFilter, setClassificationFilter] = useState("all");

  const stats = useMemo(() => buildDocumentStats(documents), [documents]);
  const filteredDocuments = useMemo(() => {
    const searchTerm = normalizeSearchText(searchValue);

    return documents.filter((document) => {
      if (typeFilter !== "all" && document.documentType !== typeFilter) {
        return false;
      }

      const classificationLevel = document.metadata?.classificationLevel || "interno";
      if (classificationFilter !== "all" && classificationLevel !== classificationFilter) {
        return false;
      }

      if (searchTerm.length === 0) {
        return true;
      }

      const searchableText = normalizeSearchText(
        `${document.title} ${document.metadata?.documentNumber || ""} ${document.metadata?.location || ""}`
      );
      return searchableText.includes(searchTerm);
    });
  }, [documents, searchValue, typeFilter, classificationFilter]);

  return (
    <div className="case-docs-overview">
      <section className={`card reveal delay-3 case-docs-hero-card ${isCreateMode ? "is-create" : "is-solve"}`}>
        <div className="case-docs-hero-top">
          <div>
            <p className="eyebrow">{isCreateMode ? "Creatorski centar" : "Rešavanje slučaja"}</p>
            <h3>{isCreateMode ? tabConfig.heroCreateTitle : tabConfig.heroSolveTitle}</h3>
            <p className="create-case-summary">
              {isCreateMode ? tabConfig.heroCreateDescription : tabConfig.heroSolveDescription}
            </p>
          </div>
          {isCreateMode ? (
            <button type="button" className="btn btn-primary case-docs-primary-action" onClick={onOpenCreateModal}>
              {tabConfig.createButtonLabel}
            </button>
          ) : null}
        </div>

        <div className="case-docs-stat-grid">
          {stats.map((item) => (
            <article className="case-docs-stat-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card reveal delay-3 case-docs-toolbar-card">
        <div className="case-docs-toolbar">
          <label className="create-case-field">
            {tabConfig.searchLabel}
            <input
              className="create-case-input"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={tabConfig.searchPlaceholder}
            />
          </label>

          <label className="create-case-field">
            {tabConfig.typeFilterLabel}
            <select className="create-case-input" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">Svi tipovi</option>
              {tabConfig.documentTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="create-case-field">
            Klasifikacija
            <select
              className="create-case-input"
              value={classificationFilter}
              onChange={(event) => setClassificationFilter(event.target.value)}
            >
              <option value="all">Sve klase</option>
              <option value="interno">Interno</option>
              <option value="povjerljivo">Povjerljivo</option>
              <option value="strogo_povjerljivo">Strogo povjerljivo</option>
              <option value="javno">Javno</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card reveal delay-3 case-docs-directory-card">
        {filteredDocuments.length === 0 ? (
          <p className="case-docs-empty">{tabConfig.emptyMessage}</p>
        ) : (
          <ul className="case-docs-directory-list">
            {filteredDocuments.map((document) => (
              <li key={document.id}>
                <button
                  type="button"
                  className="case-docs-directory-row"
                  onClick={() => onOpenPreviewModal(document.id)}
                >
                  <span className="case-docs-directory-main">
                    <strong>{document.title}</strong>
                    <small>{document.metadata?.documentNumber || "N/A"}</small>
                  </span>
                  <span className="case-docs-directory-meta">
                    <small>Tip: {toDocumentTypeLabel(document.documentType)}</small>
                    <small>Klasifikacija: {toClassificationLabel(document.metadata?.classificationLevel)}</small>
                    <small>Povezane osobe: {(document.relatedPeople || []).length}</small>
                  </span>
                  <span className="case-docs-directory-action">{tabConfig.openButtonLabel}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default CaseDocumentsOverviewPanel;
