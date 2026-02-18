export const CASE_WORKSPACE_TABS = [
  {
    slug: "vremenska-linija",
    label: "Vremenska linija",
    description:
      "Editor i pregled redosleda otključavanja osoba i dokumenata sa datumom/vremenom i napomenama.",
  },
  {
    slug: "osobe-i-dosijei",
    label: "Osobe i dosijei",
    description:
      "Lista osoba, prilagođen uvod po modu i modalni formalni dosije sa fotografijom; kreiranje je modalno u creatorskom modu.",
  },
  {
    slug: "dokumenti",
    label: "Dokumenti",
    description:
      "Kreiranje i pregled policijskih izvještaja i forenzičkih nalaza kroz formalne dokumente sa metapodacima.",
  },
  {
    slug: "izjave",
    label: "Izjave",
    description:
      "Kreiranje i pregled izjava svjedoka, osumnjičenih i žrtava sa povezivanjem na osobe u slučaju.",
  },
  {
    slug: "saslusanja",
    label: "Saslušanja",
    description:
      "Kreiranje saslušanja po osobi i pokretanje razgovora kroz chat pregled unapred definisanog stabla pitanja i odgovora.",
  },
  {
    slug: "kviz",
    label: "Kviz",
    description:
      "Kreiranje završnog kviza i potvrda rešenja slučaja kroz prag tačnosti veći od 80%.",
  },
];

export const CASE_WORKSPACE_TAB_SLUGS = CASE_WORKSPACE_TABS.map((tab) => tab.slug);

export const DEFAULT_CASE_WORKSPACE_TAB = CASE_WORKSPACE_TAB_SLUGS[0];

export function findCaseWorkspaceTab(tabSlug) {
  return CASE_WORKSPACE_TABS.find((tab) => tab.slug === tabSlug) || null;
}
