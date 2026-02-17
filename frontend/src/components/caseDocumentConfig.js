export const CASE_DOCUMENT_CATEGORIES = {
  STATEMENTS: "statements",
  POLICE_DOCUMENTS: "police-documents",
};

export const CASE_DOCUMENT_CLASSIFICATION_OPTIONS = [
  { value: "interno", label: "Interno" },
  { value: "povjerljivo", label: "Povjerljivo" },
  { value: "strogo_povjerljivo", label: "Strogo povjerljivo" },
  { value: "javno", label: "Javno" },
];

const CASE_STATEMENT_TYPE_OPTIONS = [
  { value: "witness_statement", label: "Izjava svjedoka" },
  { value: "suspect_statement", label: "Izjava osumnjicenog" },
  { value: "victim_statement", label: "Izjava zrtve" },
];

const CASE_POLICE_DOCUMENT_TYPE_OPTIONS = [
  { value: "police_report", label: "Policijski izvjestaj" },
  { value: "forensic_report", label: "Forenzicki nalaz" },
];

const CASE_DOCUMENT_TAB_CONFIG = {
  [CASE_DOCUMENT_CATEGORIES.STATEMENTS]: {
    category: CASE_DOCUMENT_CATEGORIES.STATEMENTS,
    heroCreateTitle: "Operativni centar izjava",
    heroSolveTitle: "Arhiva izjava slucaja",
    heroCreateDescription:
      "Evidentiraj formalne izjave osoba u slucaju i otvaraj svaki dokument u sluzbenom formatu.",
    heroSolveDescription:
      "Pregledaj sve evidentirane izjave bez mogucnosti izmjene i prati povezanost sa osobama.",
    createButtonLabel: "+ Nova izjava",
    openButtonLabel: "Otvori izjavu",
    searchLabel: "Pretraga (naslov, broj dokumenta)",
    searchPlaceholder: "npr. IZS-0003-00012",
    typeFilterLabel: "Tip izjave",
    emptyMessage: "Nema evidentiranih izjava za zadate filtere.",
    createModalTitle: "Kreiranje formalne izjave",
    previewTitle: "IZJAVA",
    documentTypeOptions: CASE_STATEMENT_TYPE_OPTIONS,
    requiresGiverPerson: true,
  },
  [CASE_DOCUMENT_CATEGORIES.POLICE_DOCUMENTS]: {
    category: CASE_DOCUMENT_CATEGORIES.POLICE_DOCUMENTS,
    heroCreateTitle: "Operativni centar policijskih dokumenata",
    heroSolveTitle: "Arhiva policijskih dokumenata",
    heroCreateDescription:
      "Kreiraj policijske izvjestaje i forenzicke nalaze sa formalnim metapodacima i vezama ka osobama.",
    heroSolveDescription:
      "Pregledaj sluzbena dokumenta slucaja u read-only modu uz pun formalni prikaz.",
    createButtonLabel: "+ Novi dokument",
    openButtonLabel: "Otvori dokument",
    searchLabel: "Pretraga (naslov, broj dokumenta)",
    searchPlaceholder: "npr. PIR-0003-00018",
    typeFilterLabel: "Tip dokumenta",
    emptyMessage: "Nema evidentiranih policijskih dokumenata za zadate filtere.",
    createModalTitle: "Kreiranje policijskog dokumenta",
    previewTitle: "POLICIJSKI DOKUMENT",
    documentTypeOptions: CASE_POLICE_DOCUMENT_TYPE_OPTIONS,
    requiresGiverPerson: false,
  },
};

export function getCaseDocumentTabConfig(category) {
  return CASE_DOCUMENT_TAB_CONFIG[category] || CASE_DOCUMENT_TAB_CONFIG[CASE_DOCUMENT_CATEGORIES.STATEMENTS];
}
