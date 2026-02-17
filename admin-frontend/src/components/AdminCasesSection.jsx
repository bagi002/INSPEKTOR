import { useState } from "react";
import { formatAdminDate } from "./adminHelpers";

function createDraftFromCase(caseItem) {
  return {
    title: caseItem.title || "",
    publicationStatus: caseItem.publicationStatus || "draft",
    averageRating: String(caseItem.averageRating ?? 0),
    ratingCount: String(caseItem.ratingCount ?? 0),
  };
}

function AdminCasesSection({ cases, onUpdateCase }) {
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleStartEdit(caseItem) {
    setEditingCaseId(caseItem.id);
    setDraft(createDraftFromCase(caseItem));
    setMessage("");
  }

  function handleCancelEdit() {
    setEditingCaseId(null);
    setDraft(null);
    setMessage("");
  }

  function handleDraftChange(event) {
    const { name, value } = event.target;
    setDraft((previous) => ({
      ...(previous || {}),
      [name]: value,
    }));
    setMessage("");
  }

  async function handleSave() {
    if (!editingCaseId || !draft) {
      return;
    }

    const payload = {
      title: draft.title,
      publicationStatus: draft.publicationStatus,
      averageRating: Number(draft.averageRating),
      ratingCount: Number.parseInt(draft.ratingCount, 10),
    };

    setIsSaving(true);
    const result = await onUpdateCase(editingCaseId, payload);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.message || "Cuvanje izmjena slucaja nije uspelo.");
      return;
    }

    setMessage(result.message || "Slucaj je uspesno izmenjen.");
    setEditingCaseId(null);
    setDraft(null);
  }

  return (
    <section className="admin-card">
      <h2>Slucajevi</h2>
      {cases.length === 0 ? <p>Nema kreiranih slucajeva.</p> : null}

      {cases.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Naziv</th>
                <th>Autor</th>
                <th>Status</th>
                <th>Ocena</th>
                <th>Kreiran</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>{caseItem.id}</td>
                  <td>{caseItem.title}</td>
                  <td>{caseItem.author?.email}</td>
                  <td>{caseItem.publicationStatus}</td>
                  <td>{Number(caseItem.averageRating || 0).toFixed(1)} ({caseItem.ratingCount})</td>
                  <td>{formatAdminDate(caseItem.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => handleStartEdit(caseItem)}
                    >
                      Izmeni
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {editingCaseId && draft ? (
        <div className="admin-inline-editor">
          <h3>Izmena slucaja #{editingCaseId}</h3>
          <label>
            Naziv
            <input name="title" type="text" value={draft.title} onChange={handleDraftChange} />
          </label>
          <label>
            Status objave
            <select
              name="publicationStatus"
              value={draft.publicationStatus}
              onChange={handleDraftChange}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
          <label>
            Prosecna ocena
            <input
              name="averageRating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={draft.averageRating}
              onChange={handleDraftChange}
            />
          </label>
          <label>
            Broj ocena
            <input
              name="ratingCount"
              type="number"
              min="0"
              step="1"
              value={draft.ratingCount}
              onChange={handleDraftChange}
            />
          </label>

          <div className="admin-row">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              {isSaving ? "Cuvanje..." : "Sacuvaj slucaj"}
            </button>
            <button type="button" className="admin-btn" onClick={handleCancelEdit}>
              Odustani
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="admin-feedback">{message}</p> : null}
    </section>
  );
}

export default AdminCasesSection;
