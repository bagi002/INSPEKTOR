function AdminAnnouncementPopup({
  announcement,
  pendingCount,
  isClosing,
  closeErrorMessage,
  onClose,
}) {
  function formatAnnouncementDate(value) {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString("sr-RS", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!announcement) {
    return null;
  }

  return (
    <div className="admin-announcement-popup-backdrop" role="presentation">
      <section
        className="admin-announcement-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-announcement-popup-title"
      >
        <header className="admin-announcement-popup-header">
          <p className="eyebrow">Hitno obavještenje admina</p>
          <h3 id="admin-announcement-popup-title">{announcement.title}</h3>
        </header>

        <p className="admin-announcement-popup-content">{announcement.content}</p>

        <p className="admin-announcement-popup-meta">
          Objavljeno: <strong>{formatAnnouncementDate(announcement.createdAt)}</strong> |
          Neprocitanih:{" "}
          <strong>{pendingCount}</strong>
        </p>

        {closeErrorMessage ? (
          <p className="admin-announcement-popup-error">{closeErrorMessage}</p>
        ) : null}

        <div className="admin-announcement-popup-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            disabled={isClosing}
          >
            {isClosing ? "Zatvaranje..." : "Zatvori obavještenje"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default AdminAnnouncementPopup;
