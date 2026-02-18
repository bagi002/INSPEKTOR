import CaseInterrogationTreePreview from "./CaseInterrogationTreePreview";

function CaseInterrogationNodeBuilderSection({
  nodes,
  nodeDraft,
  nodeDraftError,
  formErrors,
  isSubmitting,
  onNodeDraftChange,
  onAddNode,
  onRemoveNode,
}) {
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  const sourceNode =
    safeNodes.find((node) => node.nodeKey === String(nodeDraft.sourceNodeKey || "")) || null;
  const isSourceMode = Boolean(sourceNode);

  return (
    <section className="case-interrogation-node-builder">
      <h4>Stablo pitanja i odgovora</h4>

      <div className="case-interrogation-node-builder-grid">
        <label className="create-case-field">
          Nadredjeno pitanje
          <select
            className="create-case-input"
            name="parentKey"
            value={nodeDraft.parentKey}
            onChange={onNodeDraftChange}
            disabled={isSubmitting}
          >
            <option value="">Početno pitanje (root)</option>
            {safeNodes.map((node) => (
              <option key={node.nodeKey} value={node.nodeKey}>
                {node.nodeKey} - {node.question}
              </option>
            ))}
          </select>
        </label>

        <label className="create-case-field">
          Ponavljanje postojeceg pitanja (opciono)
          <select
            className="create-case-input"
            name="sourceNodeKey"
            value={nodeDraft.sourceNodeKey}
            onChange={onNodeDraftChange}
            disabled={isSubmitting}
          >
            <option value="">Novo pitanje</option>
            {safeNodes.map((node) => (
              <option key={node.nodeKey} value={node.nodeKey}>
                {node.nodeKey} - {node.question}
              </option>
            ))}
          </select>
        </label>

        {isSourceMode ? (
          <article className="case-interrogation-source-preview case-interrogation-field-full">
            <p>
              <strong>Ponavljas pitanje:</strong> {sourceNode.question}
            </p>
            <p>
              <strong>Odgovor:</strong> {sourceNode.answer}
            </p>
            <p className="case-interrogation-source-note">
              Ovo pitanje može biti dodato u drugu granu, ali ne i u istu granu toka.
            </p>
          </article>
        ) : (
          <>
            <label className="create-case-field case-interrogation-field-full">
              Pitanje
              <input
                className="create-case-input"
                type="text"
                name="question"
                value={nodeDraft.question}
                onChange={onNodeDraftChange}
                placeholder="Unesi pitanje koje korisnik može postaviti."
                maxLength={320}
                disabled={isSubmitting}
              />
            </label>

            <label className="create-case-field case-interrogation-field-full">
              Odgovor
              <textarea
                className="create-case-textarea"
                name="answer"
                value={nodeDraft.answer}
                onChange={onNodeDraftChange}
                rows={4}
                placeholder="Unesi odgovor osobe za ovo pitanje."
                maxLength={4000}
                disabled={isSubmitting}
              />
            </label>
          </>
        )}
      </div>

      {nodeDraftError ? <p className="create-case-error">{nodeDraftError}</p> : null}
      {formErrors.nodes ? <p className="create-case-error">{formErrors.nodes}</p> : null}

      <button type="button" className="btn btn-secondary" onClick={onAddNode} disabled={isSubmitting}>
        Dodaj pitanje u stablo
      </button>

      {safeNodes.length === 0 ? (
        <p className="case-interrogation-empty">Dodaj bar jedno pitanje da bi saslušanje moglo da se sačuva.</p>
      ) : (
        <ul className="case-interrogation-node-list">
          {safeNodes.map((node) => (
            <li key={node.nodeKey} className="case-interrogation-node-item">
              <div>
                <strong>{node.nodeKey}</strong>
                <p>
                  {node.parentKey ? `Nakon: ${node.parentKey}` : "Početno pitanje"} |{" "}
                  {node.questionReferenceKey !== node.nodeKey
                    ? `Ponavljanje pitanja ${node.questionReferenceKey}`
                    : node.question}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onRemoveNode(node.nodeKey)}
                disabled={isSubmitting}
              >
                Obriši
              </button>
            </li>
          ))}
        </ul>
      )}

      <CaseInterrogationTreePreview nodes={safeNodes} />
    </section>
  );
}

export default CaseInterrogationNodeBuilderSection;
