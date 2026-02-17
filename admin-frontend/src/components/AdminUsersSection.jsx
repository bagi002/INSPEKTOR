import { useState } from "react";
import { formatAdminDate } from "./adminHelpers";

function createDraftFromUser(user) {
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    role: user.role || "user",
  };
}

function AdminUsersSection({ users, onUpdateUser }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleStartEdit(user) {
    setEditingUserId(user.id);
    setDraft(createDraftFromUser(user));
    setMessage("");
  }

  function handleCancelEdit() {
    setEditingUserId(null);
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
    if (!editingUserId || !draft) {
      return;
    }

    setIsSaving(true);
    const result = await onUpdateUser(editingUserId, draft);
    setIsSaving(false);

    if (!result.ok) {
      setMessage(result.message || "Cuvanje izmjena korisnika nije uspelo.");
      return;
    }

    setMessage(result.message || "Korisnik je uspesno izmenjen.");
    setEditingUserId(null);
    setDraft(null);
  }

  return (
    <section className="admin-card">
      <h2>Korisnici</h2>
      {users.length === 0 ? <p>Nema registrovanih korisnika.</p> : null}

      {users.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ime i prezime</th>
                <th>Email</th>
                <th>Rola</th>
                <th>Kreiran</th>
                <th>Akcija</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{formatAdminDate(user.createdAt)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn"
                      onClick={() => handleStartEdit(user)}
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

      {editingUserId && draft ? (
        <div className="admin-inline-editor">
          <h3>Izmena korisnika #{editingUserId}</h3>
          <label>
            Ime
            <input name="firstName" type="text" value={draft.firstName} onChange={handleDraftChange} />
          </label>
          <label>
            Prezime
            <input name="lastName" type="text" value={draft.lastName} onChange={handleDraftChange} />
          </label>
          <label>
            Email
            <input name="email" type="email" value={draft.email} onChange={handleDraftChange} />
          </label>
          <label>
            Rola
            <select name="role" value={draft.role} onChange={handleDraftChange}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <div className="admin-row">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
              {isSaving ? "Cuvanje..." : "Sacuvaj korisnika"}
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

export default AdminUsersSection;
