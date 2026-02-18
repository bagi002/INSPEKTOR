import { useEffect, useMemo, useRef, useState } from "react";
import { buildInterrogationChildrenMap, sortInterrogationNodes } from "./caseInterrogationsHelpers";
import { toRoleLabel } from "./casePeopleHelpers";

function buildTimeLabel() {
  return new Date().toLocaleTimeString("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createMessage(id, role, text) {
  return {
    id,
    role,
    text,
    timeLabel: buildTimeLabel(),
  };
}

function buildOpeningMessages(interrogation) {
  const personName = interrogation?.person?.fullName || "Nepoznata osoba";
  const openingPrompt =
    interrogation?.openingPrompt || "Saslušanje je pokrenuto. Izaberi sledeće pitanje.";

  return [
    createMessage("system-open", "system", `Otvoreno saslušanje: ${personName}`),
    createMessage("system-prompt", "system", openingPrompt),
  ];
}

function resolveMessageAuthor(role, personLabel) {
  if (role === "investigator") {
    return "Ispitivac";
  }
  if (role === "person") {
    return personLabel;
  }
  return "Sistem";
}

function CaseInterrogationChatModal({ interrogation, onClose }) {
  const nodes = useMemo(() => sortInterrogationNodes(interrogation?.nodes), [interrogation?.nodes]);
  const childrenByParent = useMemo(() => buildInterrogationChildrenMap(nodes), [nodes]);
  const [messages, setMessages] = useState(() => buildOpeningMessages(interrogation));
  const [activeParentKey, setActiveParentKey] = useState("");
  const [isConcluded, setIsConcluded] = useState(false);
  const chatLogRef = useRef(null);

  useEffect(() => {
    setMessages(buildOpeningMessages(interrogation));
    setActiveParentKey("");
    setIsConcluded(false);
  }, [interrogation]);

  useEffect(() => {
    if (!chatLogRef.current) {
      return;
    }
    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [messages]);

  const options = childrenByParent.get(activeParentKey) || [];
  const personLabel = interrogation?.person?.fullName || "Nepoznata osoba";
  const roleLabel = toRoleLabel(interrogation?.person?.apparentRole || "unknown");
  const hasConversationStarted = messages.length > 2;
  const canConclude = options.length === 0 && hasConversationStarted && !isConcluded;

  function handleQuestionPick(node) {
    const questionMessage = createMessage(
      `${node.nodeKey}-q-${messages.length + 1}`,
      "investigator",
      node.question
    );
    const answerMessage = createMessage(`${node.nodeKey}-a-${messages.length + 2}`, "person", node.answer);
    setMessages((previous) => [...previous, questionMessage, answerMessage]);
    setActiveParentKey(node.nodeKey);
  }

  function handleConclude() {
    if (!canConclude) {
      return;
    }
    setMessages((previous) => [
      ...previous,
      createMessage(
        `system-close-${previous.length + 1}`,
        "system",
        "Saslušanje je zaključeno. Zapisnik razgovora je kompletiran."
      ),
    ]);
    setIsConcluded(true);
  }

  function handleRestart() {
    setMessages(buildOpeningMessages(interrogation));
    setActiveParentKey("");
    setIsConcluded(false);
  }

  if (!interrogation) {
    return null;
  }

  return (
    <div className="case-interrogation-modal-overlay" role="dialog" aria-modal="true">
      <section className="case-interrogation-chat-modal">
        <header className="case-interrogation-chat-header">
          <div className="case-interrogation-chat-profile">
            <span className="case-interrogation-chat-avatar" aria-hidden="true">
              {personLabel.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="eyebrow">Chat saslušanje</p>
              <h3>{interrogation.title || "Saslušanje"}</h3>
              <p className="create-case-summary">
                {personLabel} | {roleLabel}
              </p>
            </div>
          </div>
          <div className="case-interrogation-chat-actions">
            <button type="button" className="btn btn-secondary" onClick={handleRestart}>
              Kreni iz početka
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Zatvori
            </button>
          </div>
        </header>

        <div className="case-interrogation-chat-log" ref={chatLogRef}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`case-interrogation-bubble case-interrogation-bubble-${message.role}`}
            >
              <div className="case-interrogation-bubble-meta">
                <strong>{resolveMessageAuthor(message.role, personLabel)}</strong>
                <span>{message.timeLabel}</span>
              </div>
              <p>{message.text}</p>
            </article>
          ))}
        </div>

        <footer className="case-interrogation-chat-footer">
          <h4>Dostupna pitanja</h4>
          {options.length === 0 ? (
            <div className="case-interrogation-chat-end-state">
              <p className="case-interrogation-empty">
                {hasConversationStarted
                  ? "Nema dodatnih pitanja u ovoj grani."
                  : "Izaberi prvo pitanje da pokrenes saslušanje."}
              </p>
              {canConclude ? (
                <button type="button" className="btn btn-primary" onClick={handleConclude}>
                  Zakljuci saslušanje
                </button>
              ) : null}
              {isConcluded ? (
                <p className="case-interrogation-concluded-note">
                  Saslušanje je zaključeno. Možeš ga ponovo pokrenuti preko dugmeta Kreni iz početka.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="case-interrogation-option-grid">
              {options.map((node) => (
                <button
                  key={node.nodeKey}
                  type="button"
                  className="case-interrogation-option-btn"
                  onClick={() => handleQuestionPick(node)}
                  disabled={isConcluded}
                >
                  {node.question}
                </button>
              ))}
            </div>
          )}
        </footer>
      </section>
    </div>
  );
}

export default CaseInterrogationChatModal;
