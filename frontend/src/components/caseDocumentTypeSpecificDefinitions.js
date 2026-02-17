export const TYPE_SPECIFIC_FIELDS_BY_DOCUMENT_TYPE = {
  witness_statement: [
    {
      name: "witnessPosition",
      label: "Polozaj svjedoka u odnosu na dogadjaj",
      inputType: "text",
      required: true,
    },
    {
      name: "observationDistanceMeters",
      label: "Procijenjena udaljenost posmatranja (m)",
      inputType: "number",
      required: false,
    },
    {
      name: "reliabilityAssessment",
      label: "Procjena pouzdanosti izjave",
      inputType: "select",
      required: true,
      options: [
        { value: "", label: "Odaberi procjenu" },
        { value: "low", label: "Niska" },
        { value: "medium", label: "Srednja" },
        { value: "high", label: "Visoka" },
      ],
    },
  ],
  suspect_statement: [
    {
      name: "rightsRead",
      label: "Prava procitana osumnjicenom",
      inputType: "checkbox",
      required: false,
    },
    {
      name: "lawyerPresent",
      label: "Prisutan advokat",
      inputType: "checkbox",
      required: false,
    },
    {
      name: "statementStance",
      label: "Stav osumnjicenog",
      inputType: "select",
      required: true,
      options: [
        { value: "", label: "Odaberi stav" },
        { value: "denies", label: "Negira" },
        { value: "partial", label: "Djelimicno priznanje" },
        { value: "full", label: "Priznaje" },
        { value: "silent", label: "Odbija iskaz" },
      ],
    },
    {
      name: "alibiDescription",
      label: "Opis alibija",
      inputType: "textarea",
      required: false,
    },
  ],
  victim_statement: [
    {
      name: "injuryLevel",
      label: "Stepen povreda",
      inputType: "select",
      required: true,
      options: [
        { value: "", label: "Odaberi stepen" },
        { value: "none", label: "Bez povreda" },
        { value: "minor", label: "Laksa povreda" },
        { value: "serious", label: "Teza povreda" },
        { value: "critical", label: "Kriticno" },
      ],
    },
    {
      name: "medicalAidProvided",
      label: "Pruzena medicinska pomoc",
      inputType: "checkbox",
      required: false,
    },
    {
      name: "threatPerception",
      label: "Procjena nivoa prijetnje",
      inputType: "select",
      required: true,
      options: [
        { value: "", label: "Odaberi procjenu" },
        { value: "low", label: "Nizak" },
        { value: "medium", label: "Srednji" },
        { value: "high", label: "Visok" },
        { value: "critical", label: "Kritican" },
      ],
    },
    {
      name: "lossDescription",
      label: "Opis stete/gubitaka",
      inputType: "textarea",
      required: false,
    },
  ],
  police_report: [
    {
      name: "incidentCategory",
      label: "Kategorija incidenta",
      inputType: "select",
      required: true,
      options: [
        { value: "", label: "Odaberi kategoriju" },
        { value: "theft", label: "Kradja" },
        { value: "assault", label: "Nasilje" },
        { value: "homicide", label: "Ubistvo" },
        { value: "fraud", label: "Prevara" },
        { value: "other", label: "Drugo" },
      ],
    },
    {
      name: "operationCode",
      label: "Operativni kod akcije",
      inputType: "text",
      required: false,
    },
    {
      name: "respondingUnit",
      label: "Interventna jedinica",
      inputType: "text",
      required: false,
    },
    {
      name: "immediateMeasures",
      label: "Neposredno preduzete mjere",
      inputType: "textarea",
      required: false,
    },
  ],
  forensic_report: [
    {
      name: "laboratoryName",
      label: "Naziv laboratorije",
      inputType: "text",
      required: true,
    },
    {
      name: "analysisMethod",
      label: "Metoda analize",
      inputType: "text",
      required: true,
    },
    {
      name: "sampleCount",
      label: "Broj obradjenih uzoraka",
      inputType: "number",
      required: false,
    },
    {
      name: "traceType",
      label: "Tip traga",
      inputType: "select",
      required: true,
      options: [
        { value: "", label: "Odaberi tip" },
        { value: "biological", label: "Bioloski" },
        { value: "chemical", label: "Hemijski" },
        { value: "digital", label: "Digitalni" },
        { value: "ballistic", label: "Balisticki" },
        { value: "mixed", label: "Mjesoviti" },
      ],
    },
    {
      name: "conclusionSummary",
      label: "Zakljucak vjestacenja",
      inputType: "textarea",
      required: true,
    },
  ],
};

export const IMAGE_EVIDENCE_SUPPORTED_TYPES = new Set([
  "police_report",
  "forensic_report",
]);
