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
    errors.title = `Naziv slučaja mora imati najmanje ${MIN_TITLE_LENGTH} karaktera.`;
  }

  if ((formData.description || "").trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Opis slučaja mora imati najmanje ${MIN_DESCRIPTION_LENGTH} karaktera.`;
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
      setSubmitError(result.message || "Kreiranje slučaja nije uspelo.");
      setIsSubmitting(false);
      return;
    }

    const createdCaseId = result.data?.case?.id;
    if (!createdCaseId) {
      setSubmitError("Slučaj je kreiran, ali nije vraćen validan identifikator.");
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
        publishStatusMessage="Objava postaje dostupna nakon što kreiraš slučaj."
      />

      <main className="content create-case-content">
        <section className="card logged-hero reveal delay-1" id="sekcija-početna">
          <p className="eyebrow">Kreiranje slučaja</p>
          <h2>Priprema novog istražnog scenarija</h2>
          <p>
            Unesi naziv i opis, klikni na kreiranje i sistem će odmah otvoriti
            creatorski mod novog slučaja sa tabovima menija.
          </p>
        </section>

        <section className="card reveal delay-2">
          <h3>Osnovni podaci slučaja</h3>
          <form className="create-case-form" onSubmit={handleCreateCase} noValidate>
            <label className="create-case-field" htmlFor="create-case-title">
              Naziv slučaja
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
              Opis slučaja
              <textarea
                id="create-case-description"
                name="description"
                className="create-case-textarea"
                placeholder="Ukratko opiši kontekst slučaja, aktere i početno stanje istrage."
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
                {isSubmitting ? "Kreiranje u toku..." : "Kreiraj slučaj"}
              </button>
            </div>
          </form>
        </section>

        <section className="card reveal delay-3">
          <h3>Šta se dešava nakon kreiranja?</h3>
          <p className="create-case-summary">
            Nakon uspešnog čuvanja draft slučaja bićeš automatski preusmeren na stranicu
            tog slučaja u creatorskom modu i prvi tab menija.
          </p>
        </section>
      </main>
    </div>
  );
}

export default CreateCasePage;
