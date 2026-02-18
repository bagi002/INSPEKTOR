import { useState } from "react";
import { formatAdminDate } from "./adminHelpers";

const initialFormState = {
  title: "",
  content: "",
};

function AdminAnnouncementsSection({ announcements, onCreateAnnouncement }) {
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormErrors((previous) => ({ ...previous, [name]: "" }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormErrors({});
    setMessage("");
    setIsSubmitting(true);

    const result = await onCreateAnnouncement(formData);
    setIsSubmitting(false);

    if (!result.ok) {
      setFormErrors(result.errors || {});
      setMessage(result.message || "Kreiranje obavjestenja nije uspelo.");
      return;
    }

    setFormData(initialFormState);
    setMessage(result.message || "Obavjestenje je uspesno kreirano.");
  }

  return (
    <section className="admin-card">
      <h2>Admin obavjestenja</h2>
      <p>Kreiraj popup poruku koja ce biti prikazana korisnicima.</p>

      <form className="admin-inline-editor" onSubmit={handleSubmit} noValidate>
        <label htmlFor="adminAnnouncementTitle">
          Naslov obavjestenja
          <input
            id="adminAnnouncementTitle"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleFieldChange}
            placeholder="Npr. Planirano odrzavanje sistema"
          />
        </label>
        {formErrors.title ? <p className="admin-error">{formErrors.title}</p> : null}

        <label htmlFor="adminAnnouncementContent">
          Sadrzaj obavjestenja
          <textarea
            id="adminAnnouncementContent"
            name="content"
            rows={4}
            value={formData.content}
            onChange={handleFieldChange}
            placeholder="Unesi bitne informacije koje korisnik treba odmah da vidi."
          />
        </label>
        {formErrors.content ? <p className="admin-error">{formErrors.content}</p> : null}

        <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Objava..." : "Objavi obavjestenje"}
        </button>
      </form>

      {message ? <p className="admin-feedback">{message}</p> : null}

      <div className="admin-announcement-list">
        {announcements.length === 0 ? <p>Nema prethodno objavljenih obavjestenja.</p> : null}

        {announcements.map((announcement) => (
          <article key={announcement.id} className="admin-announcement-item">
            <h3>#{announcement.id} - {announcement.title}</h3>
            <p>{announcement.content}</p>
            <p className="admin-meta">
              Kreirao:{" "}
              <strong>
                {announcement.createdByAdmin?.firstName} {announcement.createdByAdmin?.lastName}
              </strong>{" "}
              ({announcement.createdByAdmin?.email || "-"}) | Datum:{" "}
              <strong>{formatAdminDate(announcement.createdAt)}</strong>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminAnnouncementsSection;
