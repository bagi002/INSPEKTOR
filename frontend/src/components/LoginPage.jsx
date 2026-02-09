import { useState } from "react";
import AuthPageLayout from "./AuthPageLayout";
import { loginUser } from "../services/authStorage";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "../utils/routes";

const initialFormState = {
  email: "",
  password: "",
};

function LoginPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const result = await loginUser(formData);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    if (typeof window !== "undefined") {
      window.location.href = AUTH_ROUTES.HOME;
    }
  }

  return (
    <AuthPageLayout
      activePath={PUBLIC_ROUTES.LOGIN}
      eyebrow="Ulazak u sistem"
      title="Prijava korisnika"
      description="Prijavi se postojecim nalogom da bi nastavio sa analizom slucajeva."
      sidebarNote="Postojeci korisnici koriste email i lozinku za ulazak u aplikaciju."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="loginEmail">Email adresa</label>
          <input
            id="loginEmail"
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
          <label htmlFor="loginPassword">Lozinka</label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Unesi lozinku"
          />
          {errors.password ? <p className="field-error">{errors.password}</p> : null}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Prijava..." : "Prijavi se"}
          </button>
          <a className="btn btn-secondary auth-submit" href={PUBLIC_ROUTES.REGISTRATION}>
            Nemam nalog
          </a>
        </div>

        {errors.general ? <p className="form-feedback-error">{errors.general}</p> : null}
      </form>
    </AuthPageLayout>
  );
}

export default LoginPage;
