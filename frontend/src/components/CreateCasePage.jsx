import { useState } from "react";
import CreateCaseSidebar from "./CreateCaseSidebar";
import { DEFAULT_CASE_WORKSPACE_TAB } from "./caseWorkspaceTabs";
import { createCase } from "../services/casesApi";
import { buildCaseCreatorRoute } from "../utils/routes";

const MIN_TITLE_LENGTH = 3;
const MIN_DESCRIPTION_LENGTH = 20;

function validateDraftForm(formData) {
  const errors = {};

  if ((formData.title || "").trim().length < MIN_TITLE_LENGTH) {
    errors.title = `Naziv slucaja mora imati najmanje ${MIN_TITLE_LENGTH} karaktera.`;
  }

  if ((formData.description || "").trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Opis slucaja mora imati najmanje ${MIN_DESCRIPTION_LENGTH} karaktera.`;
  }

  return errors;
}

function pickFormErrorsFromBackend(errors) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  const mappedErrors = {};
  if (typeof errors.title === "string") {
    mappedErrors.title = errors.title;
  }
  if (typeof errors.description === "string") {
    mappedErrors.description = errors.description;
  }

  return mappedErrors;
}

function CreateCasePage({ user, onLogout }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFieldChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
    setFormErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      const nextErrors = { ...previous };
      delete nextErrors[name];
      return nextErrors;
    });
  }

  async function handleCreateCase(event) {
    event.preventDefault();

    const nextErrors = validateDraftForm(formData);
    setFormErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const payload = {
      title: (formData.title || "").trim(),
      description: (formData.description || "").trim(),
      publicationStatus: "draft",
    };
    const result = await createCase(payload);

    if (!result.ok) {
      if (result.unauthorized) {
        onLogout();
        return;
      }

      const backendFormErrors = pickFormErrorsFromBackend(result.errors);
      if (Object.keys(backendFormErrors).length > 0) {
        setFormErrors((previous) => ({
          ...previous,
          ...backendFormErrors,
        }));
      }
      setSubmitError(result.message || "Kreiranje slucaja nije uspelo.");
      setIsSubmitting(false);
      return;
    }

    const createdCaseId = result.data?.case?.id;
    if (!createdCaseId) {
      setSubmitError("Slucaj je kreiran, ali nije vracen validan identifikator.");
      setIsSubmitting(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.location.href = buildCaseCreatorRoute(createdCaseId);
    }
  }

  return (
    <div className="app-shell app-shell-create-case">
      <CreateCaseSidebar
        user={user}
        onLogout={onLogout}
        activeTabSlug={DEFAULT_CASE_WORKSPACE_TAB}
        publishDisabled={true}
        publishStatusMessage="Objava postaje dostupna nakon sto kreiras slucaj."
      />

      <main className="content create-case-content">
        <section className="card logged-hero reveal delay-1" id="sekcija-pocetna">
          <p className="eyebrow">Kreiranje slucaja</p>
          <h2>Priprema novog istraznog scenarija</h2>
          <p>
            Unesi naziv i opis, klikni na kreiranje i sistem ce odmah otvoriti
            creatorski mod novog slucaja sa tabovima menija.
          </p>
        </section>

        <section className="card reveal delay-2">
          <h3>Osnovni podaci slucaja</h3>
          <form className="create-case-form" onSubmit={handleCreateCase} noValidate>
            <label className="create-case-field" htmlFor="create-case-title">
              Naziv slucaja
              <input
                id="create-case-title"
                name="title"
                className="create-case-input"
                type="text"
                placeholder="Npr. Nestanak arhivskog zapisnika"
                value={formData.title}
                onChange={handleFieldChange}
                disabled={isSubmitting}
              />
              {formErrors.title ? <span className="create-case-error">{formErrors.title}</span> : null}
            </label>

            <label className="create-case-field" htmlFor="create-case-description">
              Opis slucaja
              <textarea
                id="create-case-description"
                name="description"
                className="create-case-textarea"
                placeholder="Ukratko opisi kontekst slucaja, aktere i pocetno stanje istrage."
                value={formData.description}
                onChange={handleFieldChange}
                disabled={isSubmitting}
              />
              {formErrors.description ? (
                <span className="create-case-error">{formErrors.description}</span>
              ) : null}
            </label>

            {submitError ? <p className="error-banner">{submitError}</p> : null}

            <div className="cta-row">
              <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Kreiranje u toku..." : "Kreiraj slucaj"}
              </button>
            </div>
          </form>
        </section>

        <section className="card reveal delay-3">
          <h3>Sta se desava nakon kreiranja?</h3>
          <p className="create-case-summary">
            Nakon uspesnog cuvanja draft slucaja bices automatski preusmeren na stranicu
            tog slucaja u creatorskom modu i prvi tab menija.
          </p>
        </section>
      </main>
    </div>
  );
}

export default CreateCasePage;
