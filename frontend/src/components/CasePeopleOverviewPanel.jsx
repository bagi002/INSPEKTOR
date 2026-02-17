import { useMemo, useState } from "react";
import { toRoleLabel } from "./casePeopleHelpers";
import { CASE_PERSON_ROLE_OPTIONS } from "./casePeopleOptions";

const ROLE_FILTER_OPTIONS = [{ value: "all", label: "Sve uloge" }, ...CASE_PERSON_ROLE_OPTIONS];
const LIFE_FILTER_OPTIONS = [
  { value: "all", label: "Sve osobe" },
  { value: "alive", label: "Samo zive" },
  { value: "deceased", label: "Samo preminule" },
];

function buildStats(people) {
  return [
    { label: "Ukupno", value: people.length },
    { label: "Osumnjiceni", value: people.filter((person) => person.apparentRole === "suspect").length },
    { label: "Zrtve", value: people.filter((person) => person.apparentRole === "victim").length },
    { label: "Svjedoci", value: people.filter((person) => person.apparentRole === "witness").length },
    { label: "Zive osobe", value: people.filter((person) => person.dossier?.isAlive).length },
  ];
}

function matchesLifeFilter(person, lifeFilter) {
  if (lifeFilter === "alive") {
    return person.dossier?.isAlive;
  }
  if (lifeFilter === "deceased") {
    return !person.dossier?.isAlive;
  }
  return true;
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function CasePeopleOverviewPanel({ people, onOpenCreateModal, onOpenDossierModal, isCreateMode }) {
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [lifeFilter, setLifeFilter] = useState("all");

  const stats = useMemo(() => buildStats(people), [people]);
  const filteredPeople = useMemo(() => {
    const searchTerm = normalizeText(searchValue);

    return people.filter((person) => {
      if (roleFilter !== "all" && person.apparentRole !== roleFilter) {
        return false;
      }
      if (!matchesLifeFilter(person, lifeFilter)) {
        return false;
      }
      if (searchTerm.length === 0) {
        return true;
      }

      const personText = normalizeText(`${person.fullName} ${person.dossier?.dossierNumber || ""}`);
      return personText.includes(searchTerm);
    });
  }, [people, searchValue, roleFilter, lifeFilter]);

  return (
    <div className="case-people-overview">
      <section className={`card reveal delay-3 case-people-hero-card ${isCreateMode ? "is-create" : "is-solve"}`}>
        <div className="case-people-hero-top">
          <div>
            <p className="eyebrow">{isCreateMode ? "Creatorski centar" : "Rezavanje slucaja"}</p>
            <h3>{isCreateMode ? "Operativni centar dosijea" : "Arhiva dosijea slucaja"}</h3>
            <p className="create-case-summary">
              {isCreateMode
                ? "Kreiraj nova lica, odrzavaj formalne profile i otvaraj detaljan dosije klikom na red osobe."
                : "Pregledaj formalne dosijee i fotografije lica. Evidencija je zakljucana za izmjene u ovom modu."}
            </p>
          </div>
          {isCreateMode ? (
            <button type="button" className="btn btn-primary case-people-primary-action" onClick={onOpenCreateModal}>
              + Novo lice
            </button>
          ) : null}
        </div>

        <div className="case-people-stat-grid">
          {stats.map((item) => (
            <article className="case-people-stat-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card reveal delay-3 case-people-toolbar-card">
        <div className="case-people-toolbar">
          <label className="create-case-field">
            Pretraga (ime ili broj dosijea)
            <input
              className="create-case-input"
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="npr. DOS-0001-00001"
            />
          </label>

          <label className="create-case-field">
            Uloga
            <select className="create-case-input" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              {ROLE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="create-case-field">
            Status osobe
            <select className="create-case-input" value={lifeFilter} onChange={(event) => setLifeFilter(event.target.value)}>
              {LIFE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card reveal delay-3 case-people-directory-card">
        {filteredPeople.length === 0 ? (
          <p className="case-people-empty">Nema rezultata za zadate filtere.</p>
        ) : (
          <ul className="case-people-directory-list">
            {filteredPeople.map((person) => (
              <li key={person.id}>
                <button type="button" className="case-people-directory-row" onClick={() => onOpenDossierModal(person.id)}>
                  <span className="case-people-directory-main">
                    <strong>{person.fullName}</strong>
                    <small>{person.dossier?.dossierNumber || "N/A"}</small>
                  </span>
                  <span className="case-people-directory-meta">
                    <small>Uloga: {toRoleLabel(person.apparentRole)}</small>
                    <small>Status: {person.dossier?.isAlive ? "Ziva osoba" : "Preminula osoba"}</small>
                    <small>Lokacija: {person.dossier?.lastKnownLocation || "Nije evidentirano"}</small>
                  </span>
                  <span className="case-people-directory-action">Otvori dosije</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default CasePeopleOverviewPanel;
