import { buildInterrogationChildrenMap, sortInterrogationNodes } from "./caseInterrogationsHelpers";

function renderBranch(node, childrenByParent) {
  const children = childrenByParent.get(node.nodeKey) || [];
  const isReusedQuestion =
    String(node.questionReferenceKey || node.nodeKey) !== String(node.nodeKey || "");

  return (
    <li key={node.nodeKey} className="case-interrogation-tree-node">
      <article className="case-interrogation-tree-card">
        <div className="case-interrogation-tree-card-top">
          <span className="case-interrogation-tree-key">{node.nodeKey}</span>
          {isReusedQuestion ? (
            <span className="case-interrogation-tree-reused">
              Ponavljanje pitanja: {node.questionReferenceKey}
            </span>
          ) : (
            <span className="case-interrogation-tree-unique">Novo pitanje</span>
          )}
        </div>
        <p className="case-interrogation-tree-question">{node.question || "Prazno pitanje"}</p>
      </article>
      {children.length > 0 ? (
        <ul className="case-interrogation-tree-list">
          {children.map((childNode) => renderBranch(childNode, childrenByParent))}
        </ul>
      ) : null}
    </li>
  );
}

function CaseInterrogationTreePreview({ nodes }) {
  const sortedNodes = sortInterrogationNodes(nodes);
  if (sortedNodes.length === 0) {
    return (
      <section className="case-interrogation-tree-panel">
        <h5>Vizuelni tok saslušanja</h5>
        <p className="case-interrogation-empty">Stablo je prazno. Dodaj prvo pitanje da vidiš tok.</p>
      </section>
    );
  }

  const childrenByParent = buildInterrogationChildrenMap(sortedNodes);
  const rootNodes = childrenByParent.get("") || [];

  return (
    <section className="case-interrogation-tree-panel">
      <h5>Vizuelni tok saslušanja</h5>
      {rootNodes.length === 0 ? (
        <p className="case-interrogation-empty">
          Stablo nema početni čvor. Dodaj root pitanje da bi tok bio validan.
        </p>
      ) : (
        <ul className="case-interrogation-tree-list">
          {rootNodes.map((rootNode) => renderBranch(rootNode, childrenByParent))}
        </ul>
      )}
    </section>
  );
}

export default CaseInterrogationTreePreview;
