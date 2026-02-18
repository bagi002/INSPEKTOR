function ProfilePasswordForm({
  formData,
  formErrors,
  formMessage,
  isSubmitting,
  onFieldChange,
  onSubmit,
}) {
  return (
    <section className="card reveal delay-3">
      <h3>Promena lozinke</h3>
      <form className="profile-form" onSubmit={onSubmit} noValidate>
        <label htmlFor="profile-current-password">
          Trenutna lozinka
          <input
            id="profile-current-password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={onFieldChange}
            autoComplete="current-password"
          />
          {formErrors.currentPassword ? (
            <span className="profile-field-error">{formErrors.currentPassword}</span>
          ) : null}
        </label>

        <label htmlFor="profile-new-password">
          Nova lozinka
          <input
            id="profile-new-password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={onFieldChange}
            autoComplete="new-password"
          />
          {formErrors.newPassword ? (
            <span className="profile-field-error">{formErrors.newPassword}</span>
          ) : null}
        </label>

        <label htmlFor="profile-confirm-password">
          Potvrda nove lozinke
          <input
            id="profile-confirm-password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onFieldChange}
            autoComplete="new-password"
          />
          {formErrors.confirmPassword ? (
            <span className="profile-field-error">{formErrors.confirmPassword}</span>
          ) : null}
        </label>

        <button className="btn btn-primary profile-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Čuvanje..." : "Promeni lozinku"}
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

export default ProfilePasswordForm;
