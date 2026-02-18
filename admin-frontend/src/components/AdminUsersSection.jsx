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

function AdminUsersSection({ users, onUpdateUser, onDeleteUser }) {
  const [editingUserId, setEditingUserId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
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
      setMessage(result.message || "Čuvanje izmjena korisnika nije uspelo.");
      return;
    }

    setMessage(result.message || "Korisnik je uspešno izmenjen.");
    setEditingUserId(null);
    setDraft(null);
  }

  async function handleDelete(user) {
    if (!onDeleteUser) {
      return;
    }

    const confirmed = typeof window !== "undefined"
      ? window.confirm(`Da li sigurno želiš da obrišeš nalog korisnika ${user.email}?`)
      : true;
    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);
    const result = await onDeleteUser(user.id);
    setDeletingUserId(null);

    if (!result.ok) {
      setMessage(result.message || "Brisanje korisnika nije uspelo.");
      return;
    }

    if (editingUserId === user.id) {
      setEditingUserId(null);
      setDraft(null);
    }
    setMessage(result.message || "Korisnik je uspešno obrisan.");
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
                <th>Ime i prežime</th>
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
                    <div className="admin-table-actions">
                      <button
                        type="button"
                        className="admin-btn"
                        onClick={() => handleStartEdit(user)}
                      >
                        Izmeni
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => void handleDelete(user)}
                        disabled={deletingUserId === user.id}
                      >
                        {deletingUserId === user.id ? "Brisanje..." : "Obriši"}
                      </button>
                    </div>
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
            Prežime
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
              {isSaving ? "Čuvanje..." : "Sačuvaj korisnika"}
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
