import { CASE_WORKSPACE_MODES } from "../utils/routes";

export function resolveModeTexts(mode) {
  if (mode === CASE_WORKSPACE_MODES.SOLVE) {
    return {
      label: "Rezim resavanja",
      description:
        "Otvori tragove, dokumente i izjave kroz iste tabove kao u kreiranju, ali u modu resavanja.",
      placeholder:
        "Sadrzaj za aktivni tab se ucitava na osnovu podataka slucaja i napretka istrage.",
    };
  }

  return {
    label: "Creatorski mod",
    description:
      "U istom setu tabova pripremas strukturu slucaja, dokumente, izjave, saslusanja i kviz.",
    placeholder:
      "Sadrzaj za aktivni tab se ucitava na osnovu podataka slucaja i creatorskog workflow-a.",
  };
}

export function resolveModeDescription(activeTabSlug, mode, fallbackDescription) {
  if (activeTabSlug === "vremenska-linija") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Postepeno otkljucavanje redosleda osoba i dokumenata kroz akciju 'Dalje', uz prikaz trenutnog datuma istrage."
      : "Operativni panel za definisanje redosleda, napomena i vremena otkljucavanja osoba i dokumenata.";
  }

  if (activeTabSlug === "kviz") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled opisa slucaja i zavrsni kviz koji potvrdjuje rjesenje slucaja."
      : "Operativni panel za pripremu zavrsnog kviza koji korisnik koristi za potvrdu rjesenja.";
  }

  if (activeTabSlug === "dokumenti") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled policijskih izvjestaja i forenzickih nalaza u read-only rezimu sa formalnim prikazom dokumenta."
      : "Operativni panel za kreiranje policijskih izvjestaja i forenzickih nalaza kroz formalni modalni workflow.";
  }

  if (activeTabSlug === "izjave") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled svih izjava u slucaju, povezivanje sa osobama i formalni read-only prikaz u policijskom formatu."
      : "Operativni panel za unos i pregled izjava svjedoka, osumnjicenih i zrtava kroz strukturisane dokumente.";
  }

  if (activeTabSlug === "saslusanja") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled i pokretanje saslusanja po osobi kroz chat prikaz sa unapred definisanim granama pitanja."
      : "Operativni panel za kreiranje stabla pitanja i odgovora po osobi i testiranje toka saslusanja kroz chat modal.";
  }

  if (activeTabSlug === "osobe-i-dosijei") {
    return mode === CASE_WORKSPACE_MODES.SOLVE
      ? "Pregled formalnih dosijea lica u read-only rezimu, sa fokusom na evidenciju i detalje profila."
      : "Operativni panel za kreiranje, uredjivanje i pregled dosijea osoba kroz strukturisan modalni workflow.";
  }

  return fallbackDescription;
}

export function resolveSolveActionState(mode, progress, quizTotalQuestions, roleProgress = null) {
  if (mode !== CASE_WORKSPACE_MODES.SOLVE) {
    return {
      showSolveAction: false,
      solveActionLabel: "Rijesi slucaj",
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
      solveActionLabel: "Rijesi slucaj",
      solveActionDisabled: true,
      solveStatusMessage: "",
    };
  }

  return {
    showSolveAction: true,
    solveActionLabel: isCaseResolved ? "Pregledaj rjesenje" : "Rijesi slucaj",
    solveActionDisabled: false,
    solveStatusMessage: isCaseResolved
      ? `Slucaj je rijesen${progress?.resolvedAt ? ` (${new Date(progress.resolvedAt).toLocaleString("sr-Latn-RS")})` : ""}.`
      : "Pokreni zavrsni kviz za potvrdu rjesenja slucaja.",
  };
}
