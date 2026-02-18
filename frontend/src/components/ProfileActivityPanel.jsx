import { formatProfileDate, formatProfileRating } from "./profileHelpers";

function ProfileActivityPanel({ activity }) {
  const summary = activity?.summary || {};
  const statCards = [
    { label: "Kreirani slučajevi", value: String(summary.createdCount || 0) },
    { label: "Objavljeni slučajevi", value: String(summary.publishedCreatedCount || 0) },
    { label: "Draft slučajevi", value: String(summary.draftCreatedCount || 0) },
    { label: "Aktivna rešavanja", value: String(summary.activeSolveCount || 0) },
    { label: "Rešeni slučajevi", value: String(summary.resolvedSolveCount || 0) },
    { label: "Date ocene", value: String(summary.ratingsGivenCount || 0) },
    { label: "Prosek datih ocena", value: formatProfileRating(summary.averageRatingGiven) },
  ];

  const createdCases = Array.isArray(activity?.createdCases) ? activity.createdCases : [];
  const resolvedCases = Array.isArray(activity?.resolvedCases) ? activity.resolvedCases : [];
  const ratingHistory = Array.isArray(activity?.ratingHistory) ? activity.ratingHistory : [];

  return (
    <section className="card reveal delay-2">
      <h3>Aktivnosti korisnika</h3>
      <div className="profile-stat-grid">
        {statCards.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </div>

      <div className="profile-activity-grid">
        <article className="profile-activity-card">
          <h4>Poslednje kreirani slučajevi</h4>
          {createdCases.length === 0 ? (
            <p className="empty-state">Nema kreiranih slučajeva.</p>
          ) : (
            <ul className="profile-activity-list">
              {createdCases.map((item) => (
                <li key={`created-${item.id}`}>
                  <p><strong>{item.title}</strong></p>
                  <p>Status: {item.publicationStatus === "published" ? "Objavljen" : "Draft"}</p>
                  <p>Ocena: {formatProfileRating(item.averageRating)} | Recenzija: {item.reviews || 0}</p>
                  <p>Kreiran: {formatProfileDate(item.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="profile-activity-card">
          <h4>Poslednje rešeni slučajevi</h4>
          {resolvedCases.length === 0 ? (
            <p className="empty-state">Nema rešenih slučajeva.</p>
          ) : (
            <ul className="profile-activity-list">
              {resolvedCases.map((item) => (
                <li key={`resolved-${item.id}`}>
                  <p><strong>{item.title}</strong></p>
                  <p>Ocena: {formatProfileRating(item.rating)}</p>
                  <p>Rešen: {formatProfileDate(item.resolvedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="profile-activity-card">
          <h4>Poslednje date ocene</h4>
          {ratingHistory.length === 0 ? (
            <p className="empty-state">Nema datih ocena.</p>
          ) : (
            <ul className="profile-activity-list">
              {ratingHistory.map((item) => (
                <li key={`rating-${item.caseId}-${item.ratedAt || ""}`}>
                  <p><strong>{item.caseTitle}</strong></p>
                  <p>Autor: {item.authorName || "-"}</p>
                  <p>Ocena: {formatProfileRating(item.rating)}</p>
                  {item.reviewComment ? <p>Komentar: {item.reviewComment}</p> : null}
                  <p>Datum: {formatProfileDate(item.ratedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
}

export default ProfileActivityPanel;
