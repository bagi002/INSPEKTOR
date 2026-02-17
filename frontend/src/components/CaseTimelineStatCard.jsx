function CaseTimelineStatCard({ value, label }) {
  return (
    <article className="case-timeline-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

export default CaseTimelineStatCard;
