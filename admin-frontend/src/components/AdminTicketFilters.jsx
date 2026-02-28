import { ADMIN_TICKET_STATUS_OPTIONS, ADMIN_TICKET_TYPE_OPTIONS } from "./adminHelpers";

function AdminTicketFilters({ filters, onFilterChange, onReset }) {
  return (
    <form className="admin-ticket-filters" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="adminTicketSearch">
        Pretraga tiketa
        <input
          id="adminTicketSearch"
          type="search"
          value={filters.query}
          onChange={(event) => onFilterChange("query", event.target.value)}
          placeholder="ID, naslov, opis, email, lokacija, verzija..."
        />
      </label>

      <label htmlFor="adminTicketTypeFilter">
        Tip
        <select
          id="adminTicketTypeFilter"
          value={filters.ticketType}
          onChange={(event) => onFilterChange("ticketType", event.target.value)}
        >
          <option value="all">Svi tipovi</option>
          {ADMIN_TICKET_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label htmlFor="adminTicketStatusFilter">
        Status
        <select
          id="adminTicketStatusFilter"
          value={filters.status}
          onChange={(event) => onFilterChange("status", event.target.value)}
        >
          <option value="all">Svi statusi</option>
          {ADMIN_TICKET_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="admin-ticket-inline-check" htmlFor="adminTicketOnlyActionable">
        <input
          id="adminTicketOnlyActionable"
          type="checkbox"
          checked={filters.onlyActionable}
          onChange={(event) => onFilterChange("onlyActionable", event.target.checked)}
        />
        Samo aktivni (open, pregledan, in progress)
      </label>

      <button type="button" className="admin-btn" onClick={onReset}>
        Reset filtera
      </button>
    </form>
  );
}

export default AdminTicketFilters;
