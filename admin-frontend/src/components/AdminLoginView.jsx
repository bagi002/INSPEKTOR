import { useState } from "react";
import { loginAdmin } from "../services/adminApi";

const initialFormData = {
  email: "",
  password: "",
};

function AdminLoginView({ onLoginSuccess }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors({});
    setMessage("");
    setIsSubmitting(true);

    const result = await loginAdmin(formData);
    setIsSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors || {});
      setMessage(result.message || "Admin prijava nije uspela.");
      return;
    }

    setFormData(initialFormData);
    setMessage("");
    onLoginSuccess(result.data);
  }

  return (
    <main className="admin-shell">
      <section className="admin-card admin-login-card">
        <p className="admin-eyebrow">INSPEKTOR ADMIN PANEL</p>
        <h1>Admin prijava</h1>
        <p>
          Koristi administratorski nalog (email + lozinka) da bi pristupio pregledima i izmenama podataka.
        </p>

        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="adminEmail">
            Email
            <input
              id="adminEmail"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="admin@inspektor.local"
            />
            {errors.email ? <span className="admin-error">{errors.email}</span> : null}
          </label>

          <label htmlFor="adminPassword">
            Lozinka
            <input
              id="adminPassword"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Unesi lozinku naloga"
            />
            {errors.password ? <span className="admin-error">{errors.password}</span> : null}
          </label>

          {message ? <p className="admin-feedback">{message}</p> : null}

          <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Prijava..." : "Uloguj admin panel"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLoginView;
