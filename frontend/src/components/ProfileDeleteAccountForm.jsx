function ProfileDeleteAccountForm({
  formData,
  formErrors,
  formMessage,
  isSubmitting,
  onFieldChange,
  onSubmit,
}) {
  return (
    <section className="card profile-danger-card reveal delay-4">
      <h3>Brisanje naloga</h3>
      <p>
        Ova akcija trajno brise nalog i povezane podatke. Za potvrdu unesi lozinku i tekst
        <strong> OBRISI</strong>.
      </p>
      <form className="profile-form" onSubmit={onSubmit} noValidate>
        <label htmlFor="profile-delete-password">
          Lozinka
          <input
            id="profile-delete-password"
            type="password"
            name="password"
            value={formData.password}
            onChange={onFieldChange}
            autoComplete="current-password"
          />
          {formErrors.password ? (
            <span className="profile-field-error">{formErrors.password}</span>
          ) : null}
        </label>

        <label htmlFor="profile-delete-confirmation">
          Tekst potvrde
          <input
            id="profile-delete-confirmation"
            name="confirmationText"
            value={formData.confirmationText}
            onChange={onFieldChange}
            placeholder="OBRISI"
          />
          {formErrors.confirmationText ? (
            <span className="profile-field-error">{formErrors.confirmationText}</span>
          ) : null}
        </label>

        <button className="btn btn-secondary profile-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Brisanje..." : "Obriši nalog"}
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

export default ProfileDeleteAccountForm;
