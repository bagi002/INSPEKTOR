export const CASE_WORKSPACE_TABS = [
  {
    slug: "vremenska-linija",
    label: "Vremenska linija",
    description:
      "Editor i pregled redosleda otkljucavanja osoba i dokumenata sa datumom/vremenom i napomenama.",
  },
  {
    slug: "osobe-i-dosijei",
    label: "Osobe i dosijei",
    description:
      "Lista osoba, prilagodjen uvod po modu i modalni formalni dosije sa fotografijom; kreiranje je modalno u creatorskom modu.",
  },
  {
    slug: "dokumenti",
    label: "Dokumenti",
    description:
      "Kreiranje i pregled policijskih izvjestaja i forenzickih nalaza kroz formalne dokumente sa metapodacima.",
  },
  {
    slug: "izjave",
    label: "Izjave",
    description:
      "Kreiranje i pregled izjava svjedoka, osumnjicenih i zrtava sa povezivanjem na osobe u slucaju.",
  },
  {
    slug: "saslusanja",
    label: "Saslusanja",
    description:
      "Kreiranje saslusanja po osobi i pokretanje razgovora kroz chat pregled unapred definisanog stabla pitanja i odgovora.",
  },
  {
    slug: "kviz",
    label: "Kviz",
    description:
      "Kreiranje zavrsnog kviza i potvrda rjesenja slucaja kroz prag tacnosti veci od 80%.",
  },
];

export const CASE_WORKSPACE_TAB_SLUGS = CASE_WORKSPACE_TABS.map((tab) => tab.slug);

export const DEFAULT_CASE_WORKSPACE_TAB = CASE_WORKSPACE_TAB_SLUGS[0];

export function findCaseWorkspaceTab(tabSlug) {
  return CASE_WORKSPACE_TABS.find((tab) => tab.slug === tabSlug) || null;
}
