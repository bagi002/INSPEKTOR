export const CASE_WORKSPACE_TABS = [
  {
    slug: "vremenska-linija",
    label: "Vremenska linija",
    description:
      "Prazna stranica za uredjivanje i pregled redosleda dogadjaja i otkljucavanja stavki.",
  },
  {
    slug: "osobe-i-dosijei",
    label: "Osobe i dosijei",
    description:
      "Prazna stranica za listu osoba i povezane dosijee unutar slucaja.",
  },
  {
    slug: "dokumenti",
    label: "Dokumenti",
    description:
      "Prazna stranica za policijske izvjestaje, forenzicke nalaze i ostale dokumente.",
  },
  {
    slug: "izjave",
    label: "Izjave",
    description:
      "Prazna stranica za sve izjave (svjedoka, osumnjicenih i zrtava) kao odvojen tab.",
  },
  {
    slug: "saslusanja",
    label: "Saslusanja",
    description:
      "Prazna stranica za kreiranje i pregled stabala pitanja i odgovora za saslusanja.",
  },
  {
    slug: "kviz",
    label: "Kviz",
    description:
      "Prazna stranica za zavrsni kviz slucaja.",
  },
];

export const CASE_WORKSPACE_TAB_SLUGS = CASE_WORKSPACE_TABS.map((tab) => tab.slug);

export const DEFAULT_CASE_WORKSPACE_TAB = CASE_WORKSPACE_TAB_SLUGS[0];

export function findCaseWorkspaceTab(tabSlug) {
  return CASE_WORKSPACE_TABS.find((tab) => tab.slug === tabSlug) || null;
}
