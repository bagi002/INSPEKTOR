function renderSimpleCaseCards(items, renderDetails, emptyMessage) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return items.map((item) => (
    <article className="case-card" key={item.id || item.title}>
      <h4>{item.title}</h4>
      {renderDetails(item)}
    </article>
  ));
}

function LoggedCaseSection({
  title,
  items,
  renderDetails,
  emptyMessage,
  gridClassName = "case-grid",
  delayClass = "delay-2",
}) {
  return (
    <section className={`card reveal ${delayClass}`.trim()}>
      <h3>{title}</h3>
      <div className={gridClassName}>{renderSimpleCaseCards(items, renderDetails, emptyMessage)}</div>
    </section>
  );
}

export default LoggedCaseSection;
