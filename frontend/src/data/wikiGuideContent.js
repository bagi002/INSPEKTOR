export const caseDefinition = {
  title: "Šta je slučaj u INSPEKTOR-u?",
  description:
    "Slučaj je istražni scenario koji je kreirao drugi korisnik. Tvoj cilj je da kroz tragove, izjave i saslušanja rekonstruišeš šta se desilo i potvrdiš rešenje završnim kvizom.",
  note:
    "Svaki slučaj ima autora, naziv, opis, ocenu zajednice i broj recenzija.",
};

export const caseBuildingBlocks = [
  {
    title: "Vremenska linija",
    description:
      "Definiše redosled otključavanja tragova. U solve modu klik na dugme Dalje otvara sledeću stavku.",
  },
  {
    title: "Osobe i dosijei",
    description:
      "Lista svih ljudi u slučaju sa formalnim dosijeima i povezanim dokumentima.",
  },
  {
    title: "Dokumenti",
    description:
      "Policijski izvještaji i forenzički nalazi sa metapodacima i dokazima.",
  },
  {
    title: "Izjave",
    description:
      "Formalne izjave svjedoka, osumnjičenih i žrtava povezane sa osobama.",
  },
  {
    title: "Saslušanja",
    description:
      "Razgovor kroz stablo pitanja i odgovora koje je unaprijed pripremio kreator.",
  },
  {
    title: "Završni kviz",
    description:
      "Finalna potvrda rešenja. Za prolaz je potreban rezultat strogo veći od 80%.",
  },
];

export const solveGuideSteps = [
  {
    title: "Izaberi javni slučaj",
    description:
      "Na /app u sekciji `Najocenjeniji javni slučajevi` klikni `Pokreni rešavanje`.",
  },
  {
    title: "Otključavaj tragove redom",
    description:
      "U tabu `Vremenska linija` koristi dugme Dalje da postepeno dobijaš nove informacije.",
  },
  {
    title: "Analiziraj sve tabove",
    description:
      "Poveži informacije iz osoba, dokumenata, izjava i saslušanja pre finalne odluke.",
  },
  {
    title: "Postavi uloge osobama",
    description:
      "U solve modu svakoj otključanoj osobi dodijeli procijenjenu ulogu (unknown/suspect/victim/witness).",
  },
  {
    title: "Predaj kviz",
    description:
      "Kada su uslovi spremnosti ispunjeni, otvori tab `Kviz` i predaj odgovore.",
  },
  {
    title: "Potvrdi rešenje i ostavi recenziju",
    description:
      "Ako je rezultat >80%, slučaj prelazi u resolved. Nakon toga možeš poslati ocjenu i komentar.",
  },
];

export const createGuideSteps = [
  {
    title: "Kreiraj draft",
    description: "Idi na /slucaj/novi, unesi naziv i opis slučaja.",
  },
  {
    title: "Dodaj osobe i dosijee",
    description:
      "Prvo formiraj aktere slučaja, jer će se kasnije povezivati sa dokumentima i izjavama.",
  },
  {
    title: "Dodaj dokumente, izjave i saslušanja",
    description:
      "Popuni ključni istražni materijal i proveri da su veze između entiteta ispravne.",
  },
  {
    title: "Sastavi vremensku liniju",
    description:
      "Rasporedi sve osobe i dokumente po redosledu otključavanja.",
  },
  {
    title: "Definiši završni kviz",
    description:
      "Kreiraj pitanja i tačne odgovore koji proveravaju da li je igrač zaista razumeo slučaj.",
  },
  {
    title: "Objavi slučaj",
    description:
      "Klikni `Objavi slučaj`. Ako postoje blokade, dopuni obavezne stavke i ponovi objavu.",
  },
];

export const quickRoutes = [
  { label: "Wiki", route: "/wiki", purpose: "Glavni vodič za aplikaciju." },
  { label: "Registracija", route: "/registracija", purpose: "Kreiranje novog naloga." },
  { label: "Prijava", route: "/prijava", purpose: "Ulaz u aplikaciju." },
  { label: "Početna (ulogovan)", route: "/app", purpose: "Pregled slučajeva i statistike." },
  { label: "Kreiranje slučaja", route: "/slucaj/novi", purpose: "Start creatorskog toka." },
  { label: "Podrška", route: "/podrska", purpose: "Prijava buga/predloga i praćenje tiketa." },
];

export const guideFaq = [
  {
    question: "Zašto ne vidim sve dokumente odmah?",
    answer:
      "U solve režimu vidiš samo ono što je trenutno otključano kroz vremensku liniju.",
  },
  {
    question: "Zašto ne mogu da predam kviz?",
    answer:
      "Najčešće nedostaju uslovi spremnosti: role assignment osoba i/ili dovoljan napredak kroz timeline.",
  },
  {
    question: "Zašto objava slučaja nije uspela?",
    answer:
      "Backend proverava obavezne tipove dokumenata, postojanje osoba i pokrivenost timeline-a.",
  },
];
