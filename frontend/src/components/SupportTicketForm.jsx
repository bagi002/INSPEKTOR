import { SUPPORT_TICKET_TYPES } from "./supportTicketHelpers";

function SupportTicketForm({
  formData,
  formErrors,
  formMessage,
  isSubmitting,
  onFieldChange,
  onSubmit,
}) {
  return (
    <form className="support-form" onSubmit={onSubmit} noValidate>
      <label>
        Tip tiketa
        <select name="ticketType" value={formData.ticketType} onChange={onFieldChange}>
          {SUPPORT_TICKET_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Naslov
        <input
          name="title"
          type="text"
          value={formData.title}
          onChange={onFieldChange}
          placeholder="Kratak naziv problema ili predloga"
        />
        {formErrors.title ? <span className="support-field-error">{formErrors.title}</span> : null}
      </label>

      <label>
        Lokacija u aplikaciji
        <input
          name="appLocation"
          type="text"
          value={formData.appLocation}
          onChange={onFieldChange}
          placeholder="Npr. /slucaj/12/kreiranje/vremenska-linija"
        />
        {formErrors.appLocation ? (
          <span className="support-field-error">{formErrors.appLocation}</span>
        ) : null}
      </label>

      <label>
        Verzija aplikacije
        <input name="appVersion" type="text" value={formData.appVersion} onChange={onFieldChange} />
        {formErrors.appVersion ? (
          <span className="support-field-error">{formErrors.appVersion}</span>
        ) : null}
      </label>

      <label>
        Opis
        <textarea
          name="description"
          rows={6}
          value={formData.description}
          onChange={onFieldChange}
          placeholder="Detaljno opisi sta se desava ili sta bi trebalo unaprediti."
        />
        {formErrors.description ? (
          <span className="support-field-error">{formErrors.description}</span>
        ) : null}
      </label>

      {formErrors.ticketType ? (
        <p className="support-submit-feedback support-submit-feedback-error">
          {formErrors.ticketType}
        </p>
      ) : null}
      {formMessage ? <p className="support-submit-feedback">{formMessage}</p> : null}

      <button type="submit" className="btn btn-primary support-submit" disabled={isSubmitting}>
        {isSubmitting ? "Slanje..." : "Kreiraj tiket"}
      </button>
    </form>
  );
}

export default SupportTicketForm;
