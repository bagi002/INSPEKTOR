function ProfileBasicForm({
  formData,
  formErrors,
  formMessage,
  isSubmitting,
  onFieldChange,
  onSubmit,
}) {
  return (
    <section className="card reveal delay-3">
      <h3>Izmena osnovnih podataka</h3>
      <form className="profile-form" onSubmit={onSubmit} noValidate>
        <label htmlFor="profile-first-name">
          Ime
          <input
            id="profile-first-name"
            name="firstName"
            value={formData.firstName}
            onChange={onFieldChange}
            autoComplete="given-name"
          />
          {formErrors.firstName ? (
            <span className="profile-field-error">{formErrors.firstName}</span>
          ) : null}
        </label>

        <label htmlFor="profile-last-name">
          Prežime
          <input
            id="profile-last-name"
            name="lastName"
            value={formData.lastName}
            onChange={onFieldChange}
            autoComplete="family-name"
          />
          {formErrors.lastName ? (
            <span className="profile-field-error">{formErrors.lastName}</span>
          ) : null}
        </label>

        <label htmlFor="profile-email">
          Email
          <input
            id="profile-email"
            name="email"
            value={formData.email}
            onChange={onFieldChange}
            autoComplete="email"
          />
          {formErrors.email ? (
            <span className="profile-field-error">{formErrors.email}</span>
          ) : null}
        </label>

        <button className="btn btn-primary profile-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Čuvanje..." : "Sačuvaj izmene"}
        </button>
        {formMessage ? (
          <p className={`profile-submit-feedback${Object.keys(formErrors).length > 0 ? " profile-submit-feedback-error" : ""}`}>
            {formMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}

export default ProfileBasicForm;
