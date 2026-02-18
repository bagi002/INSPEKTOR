function AdminOverviewSection({ overview, activeAppVersion }) {
  return (
    <section className="admin-card">
      <h2>Brzi pregled</h2>
      <div className="admin-stats-grid">
        <article className="admin-stat"><span>Korisnici</span><strong>{overview.usersCount}</strong></article>
        <article className="admin-stat"><span>Admini</span><strong>{overview.adminsCount}</strong></article>
        <article className="admin-stat"><span>Slučajevi</span><strong>{overview.casesCount}</strong></article>
        <article className="admin-stat"><span>Ticketi</span><strong>{overview.ticketsCount}</strong></article>
        <article className="admin-stat"><span>Open</span><strong>{overview.openTicketsCount}</strong></article>
        <article className="admin-stat"><span>In progress</span><strong>{overview.inProgressTicketsCount}</strong></article>
      </div>
      <p className="admin-meta">
        Aktivna verzija aplikacije: <strong>{activeAppVersion || "-"}</strong>
      </p>
    </section>
  );
}

export default AdminOverviewSection;
