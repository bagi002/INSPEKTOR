export const caseDefinition = {
  title: "Sta je slucaj u INSPEKTOR-u?",
  description:
    "Slucaj je istrazni scenario koji je kreirao drugi korisnik. Tvoj cilj je da kroz tragove, izjave i saslusanja rekonstruises sta se desilo i potvrdis rjesenje zavrsnim kvizom.",
  note:
    "Svaki slucaj ima autora, naziv, opis, ocjenu zajednice i broj recenzija.",
};

export const caseBuildingBlocks = [
  {
    title: "Vremenska linija",
    description:
      "Definise redosled otkljucavanja tragova. U solve modu klik na 'Dalje' otvara sledecu stavku.",
  },
  {
    title: "Osobe i dosijei",
    description:
      "Lista svih ljudi u slucaju sa formalnim dosijeima i povezanim dokumentima.",
  },
  {
    title: "Dokumenti",
    description:
      "Policijski izvjestaji i forenzicki nalazi sa metapodacima i dokazima.",
  },
  {
    title: "Izjave",
    description:
      "Formalne izjave svjedoka, osumnjicenih i zrtava povezane sa osobama.",
  },
  {
    title: "Saslusanja",
    description:
      "Razgovor kroz stablo pitanja i odgovora koje je unaprijed pripremio kreator.",
  },
  {
    title: "Zavrsni kviz",
    description:
      "Finalna potvrda rjesenja. Za prolaz je potreban rezultat strogo veci od 80%.",
  },
];

export const solveGuideSteps = [
  {
    title: "Izaberi javni slucaj",
    description:
      "Na /app u sekciji 'Najocenjeniji javni slucajevi' klikni 'Pokreni resavanje'.",
  },
  {
    title: "Otkljucavaj tragove redom",
    description:
      "U tabu 'Vremenska linija' koristi dugme 'Dalje' da postepeno dobijas nove informacije.",
  },
  {
    title: "Analiziraj sve tabove",
    description:
      "Povezi informacije iz osoba, dokumenata, izjava i saslusanja prije finalne odluke.",
  },
  {
    title: "Postavi uloge osobama",
    description:
      "U solve modu svakoj otkljucanoj osobi dodijeli procijenjenu ulogu (unknown/suspect/victim/witness).",
  },
  {
    title: "Predaj kviz",
    description:
      "Kada su uslovi spremnosti ispunjeni, otvori tab 'Kviz' i predaj odgovore.",
  },
  {
    title: "Potvrdi rjesenje i ostavi recenziju",
    description:
      "Ako je rezultat >80%, slucaj prelazi u resolved. Nakon toga mozes poslati ocjenu i komentar.",
  },
];

export const createGuideSteps = [
  {
    title: "Kreiraj draft",
    description: "Idi na /slucaj/novi, unesi naziv i opis slucaja.",
  },
  {
    title: "Dodaj osobe i dosijee",
    description:
      "Prvo formiraj aktere slucaja, jer ce se kasnije povezivati sa dokumentima i izjavama.",
  },
  {
    title: "Dodaj dokumente, izjave i saslusanja",
    description:
      "Popuni kljucni istrazni materijal i provjeri da su veze izmedju entiteta ispravne.",
  },
  {
    title: "Sastavi vremensku liniju",
    description:
      "Rasporedi sve osobe i dokumente po redosledu otkljucavanja.",
  },
  {
    title: "Definisi zavrsni kviz",
    description:
      "Kreiraj pitanja i tacne odgovore koji provjeravaju da li je igrac zaista razumio slucaj.",
  },
  {
    title: "Objavi slucaj",
    description:
      "Klikni 'Objavi slucaj'. Ako postoje blokade, dopuni obavezne stavke i ponovi objavu.",
  },
];

export const quickRoutes = [
  { label: "Wiki", route: "/wiki", purpose: "Glavni GUIDE za aplikaciju." },
  { label: "Registracija", route: "/registracija", purpose: "Kreiranje novog naloga." },
  { label: "Prijava", route: "/prijava", purpose: "Ulaz u aplikaciju." },
  { label: "Pocetna (ulogovan)", route: "/app", purpose: "Pregled slucajeva i statistike." },
  { label: "Kreiranje slucaja", route: "/slucaj/novi", purpose: "Start creatorskog toka." },
  { label: "Podrska", route: "/podrska", purpose: "Prijava buga/predloga i pracenje tiketa." },
];

export const guideFaq = [
  {
    question: "Zasto ne vidim sve dokumente odmah?",
    answer:
      "U solve rezimu vidis samo ono sto je trenutno otkljucano kroz vremensku liniju.",
  },
  {
    question: "Zasto ne mogu da predam kviz?",
    answer:
      "Najcesce nedostaju uslovi spremnosti: role assignment osoba i/ili dovoljan napredak kroz timeline.",
  },
  {
    question: "Zasto objava slucaja nije uspjela?",
    answer:
      "Backend provjerava obavezne tipove dokumenata, postojanje osoba i pokrivenost timeline-a.",
  },
];
