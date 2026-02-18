import { CASE_WORKSPACE_MODES } from "../utils/routes";

export function resolveModeTexts(mode) {
  if (mode === CASE_WORKSPACE_MODES.SOLVE) {
    return {
      label: "Režim rešavanja",
      description:
        "Otvori tragove, dokumente i izjave kroz iste tabove kao u kreiranju, ali u modu rešavanja.",
      placeholder:
        "Sadržaj za aktivni tab se učitava na osnovu podataka slučaja i napretka istrage.",
    };
  }

  return {
    label: "Creatorski mod",
    description:
      "U istom setu tabova pripremaš strukturu slučaja, dokumente, izjave, saslušanja i kviz.",
    placeholder:
      "Sadržaj za aktivni tab se učitava na osnovu podataka slučaja i creatorskog workflow-a.",
  };
}

export function resolveModeDescription(activeTabSlug, mode, fallbackDescription) {
  if (activeTabSlug === "vremenska-linija") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Postepeno otključavanje redosleda osoba i dokumenata kroz dugme Dalje, uz prikaz trenutnog datuma istrage."
      : "Operativni panel za definisanje redosleda, napomena i vremena otključavanja osoba i dokumenata.";
  }

  if (activeTabSlug === "kviz") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled opisa slučaja i završni kviz koji potvrđuje rešenje slučaja."
      : "Operativni panel za pripremu završnog kviza koji korisnik koristi za potvrdu rešenja.";
  }

  if (activeTabSlug === "dokumenti") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled policijskih izvještaja i forenzičkih nalaza u read-only režimu sa formalnim prikazom dokumenta."
      : "Operativni panel za kreiranje policijskih izvještaja i forenzičkih nalaza kroz formalni modalni workflow.";
  }

  if (activeTabSlug === "izjave") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled svih izjava u slučaju, povezivanje sa osobama i formalni read-only prikaz u policijskom formatu."
      : "Operativni panel za unos i pregled izjava svjedoka, osumnjičenih i žrtava kroz strukturisane dokumente.";
  }

  if (activeTabSlug === "saslusanja") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled i pokretanje saslušanja po osobi kroz chat prikaz sa unapred definisanim granama pitanja."
      : "Operativni panel za kreiranje stabla pitanja i odgovora po osobi i testiranje toka saslušanja kroz chat modal.";
  }

  if (activeTabSlug === "osobe-i-dosijei") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled formalnih dosijea lica u read-only režimu, sa fokusom na evidenciju i detalje profila."
      : "Operativni panel za kreiranje, uređivanje i pregled dosijea osoba kroz strukturisan modalni workflow.";
  }

  return fallbackDescription;
}

export function resolveSolveActionState(mode, progress, quizTotalQuestions, roleProgress = null) {
  if (mode !== CASE_WORKSPACE_MODES.SOLVE) {
    return {
      showSolveAction: false,
      solveActionLabel: "Reši slučaj",
      solveActionDisabled: true,
      solveStatusMessage: "",
    };
  }

  const isCaseResolved = progress?.progressStatus === "resolved";
  const areRolesResolved = Boolean(roleProgress?.allRolesResolved);
  const canResolveCase =
    !isCaseResolved &&
    areRolesResolved &&
    quizTotalQuestions > 0 &&
    Number(progress?.totalItems) > 0 &&
    !progress?.hasNextItem;

  if (!canResolveCase && !isCaseResolved) {
    return {
      showSolveAction: false,
      solveActionLabel: "Reši slučaj",
      solveActionDisabled: true,
      solveStatusMessage: "",
    };
  }

  return {
    showSolveAction: true,
    solveActionLabel: isCaseResolved ? "Pregledaj rešenje" : "Reši slučaj",
    solveActionDisabled: false,
    solveStatusMessage: isCaseResolved
      ? `Slučaj je rešen${progress?.resolvedAt ? ` (${new Date(progress.resolvedAt).toLocaleString("sr-Latn-RS")})` : ""}.`
      : "Pokreni završni kviz za potvrdu rešenja slučaja.",
  };
}
