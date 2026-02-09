import { useState } from "react";
import AuthPageLayout from "./AuthPageLayout";
import { registerUser } from "../services/authStorage";
import { PUBLIC_ROUTES } from "../utils/routes";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function RegistrationPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSuccessMessage("");
    setErrors({});
    setIsSubmitting(true);

    const result = await registerUser(formData);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setFormData(initialFormState);
    setSuccessMessage(result.message || "Registracija je uspesna.");
  }

  return (
    <AuthPageLayout
      activePath={PUBLIC_ROUTES.REGISTRATION}
      eyebrow="Kreiranje naloga"
      title="Registracija korisnika"
      description="Unesi osnovne podatke za kreiranje naloga i pocetak rada na slucajevima."
      sidebarNote="Novi korisnici mogu kreirati nalog kroz formular i zatim nastaviti na prijavu."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field-group">
            <label htmlFor="firstName">Ime</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              placeholder="Marko"
            />
            {errors.firstName ? <p className="field-error">{errors.firstName}</p> : null}
          </div>

          <div className="field-group">
            <label htmlFor="lastName">Prezime</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              placeholder="Markovic"
            />
            {errors.lastName ? <p className="field-error">{errors.lastName}</p> : null}
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="registerEmail">Email adresa</label>
          <input
            id="registerEmail"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="ime.prezime@email.com"
          />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="registerPassword">Lozinka</label>
          <input
            id="registerPassword"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Najmanje 8 karaktera"
          />
          {errors.password ? <p className="field-error">{errors.password}</p> : null}
        </div>

        <div className="field-group">
          <label htmlFor="confirmPassword">Potvrda lozinke</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="Ponovi lozinku"
          />
          {errors.confirmPassword ? (
            <p className="field-error">{errors.confirmPassword}</p>
          ) : null}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Slanje..." : "Kreiraj nalog"}
          </button>
          <a className="btn btn-secondary auth-submit" href={PUBLIC_ROUTES.LOGIN}>
            Imam nalog
          </a>
        </div>

        {errors.general ? <p className="form-feedback-error">{errors.general}</p> : null}
        {successMessage ? <p className="form-success">{successMessage}</p> : null}
      </form>
    </AuthPageLayout>
  );
}

export default RegistrationPage;
