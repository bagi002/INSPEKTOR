# INSPEKTOR

INSPEKTOR je web aplikacija za interaktivno resavanje detektivskih/policijskih slucajeva.
Trenutno su implementirani javna pocetna stranica, registracija i prijava za neulogovane korisnike, ulogovana pocetna sa stvarnim podacima iz SQLite baze, kao i zavrsni kviz kojim se potvrduje rjesenje slucaja i prelazak u `resolved`.
Aktuelna verzija javnog interfejsa je desktop-only i predvidjena za sirinu ekrana od najmanje 1120px.

## Tehnologije
- Frontend: React + Vite
- Backend: Node.js + Express
- Baza podataka: SQLite
- Auth: JWT + bcrypt hash lozinki
- Dokumentacija: YAML requirements + PlantUML dijagrami

## Struktura projekta
- `frontend/` - React aplikacija za korisnike (`landing`, auth, slucajevi, podrska)
- `admin-frontend/` - zaseban React admin panel (port `5174`)
- `backend/` - Express backend (`/api/auth`, `/api/cases`, `/api/support`, `/api/admin`, `/api/health`) i SQLite pristup
- `Instances/` - runtime podaci (npr. SQLite fajl baze)
- `Docs/requirements/` - high-level i softverski requirements
- `Docs/architecture/` - runtime, class i block PUML dijagrami
- `Automation/` - alati za izgradnju dokumentacije (`docs_builder.py`)

## Pokretanje projekta (frontend + backend + admin panel)
1. `./setup.sh`
2. `./start.sh`
3. Korisnicki frontend: `http://localhost:5173`
4. Admin panel: `http://localhost:5174`
5. Backend health: `http://localhost:3001/api/health`

## Pokretanje preko skripti (root)
1. `./setup.sh` - priprema okruzenje, instalira backend + frontend + admin frontend zavisnosti, kreira `backend/.env` (ako ne postoji) i inicijalizuje bazu
2. `./start.sh` - pokrece backend (`3001`), korisnicki frontend (`5173`) i admin frontend (`5174`)

## Pokretanje pojedinacno
Backend:
1. `cd backend`
2. `npm install`
3. `npm run db:init`
4. `npm run dev`

Frontend:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

Admin frontend:
1. `cd admin-frontend`
2. `npm install`
3. `npm run dev -- --port 5174`

Backend `.env` bitne promenljive za admin:
- `FRONTEND_ORIGINS=http://localhost:5173,http://localhost:5174`
- `ADMIN_PANEL_PASSWORD=<lozinka-admin-panela>`
- `ADMIN_BOOTSTRAP_EMAIL=<bootstrap-admin-email>`
- `ADMIN_BOOTSTRAP_PASSWORD=<bootstrap-admin-lozinka>`

## Build i preview (frontend)
1. `cd frontend`
2. `npm run build`
3. `npm run preview`

## Koriscenje auth stranica
- Pocetna: `http://localhost:5173/`
- Registracija: `http://localhost:5173/registracija`
- Prijava: `http://localhost:5173/prijava`
- Ulogovana pocetna: `http://localhost:5173/app`
- Podrska: `http://localhost:5173/podrska`
- Kreiranje slucaja (start): `http://localhost:5173/slucaj/novi`
- Workspace tab (kreiranje): `http://localhost:5173/slucaj/:id/kreiranje/:tab`
- Workspace tab (resavanje): `http://localhost:5173/slucaj/:id/resavanje/:tab`
- Admin panel login: `http://localhost:5174`

Tok koriscenja:
1. Otvori `/registracija` i kreiraj nalog.
2. Nakon uspesne registracije otvori `/prijava`.
3. Prijavi se istim podacima.
4. Nakon prijave automatski se otvara ulogovana pocetna (`/app`).
5. Klikni na `Kreiraj novi slucaj`, unesi naziv i opis, pa potvrdi kreiranje.
6. Nakon uspesnog cuvanja draft-a aplikacija automatski otvara prvi tab u creatorskom modu:
   `/slucaj/:id/kreiranje/vremenska-linija`.
7. U tabu `/slucaj/:id/kreiranje/vremenska-linija` mozes dodavati osobe i dokumente u
   sekvencu otkljucavanja, menjati redosled, unositi napomene i opcioni datum/vreme, pa
   snimiti celu roadmap konfiguraciju.
8. U tabu `/slucaj/:id/kreiranje/osobe-i-dosijei` mozes kreirati osobu i njen dosije,
   a zatim iz liste pregledati detalje za svaku evidentiranu osobu, ukljucujuci
   linkove ka povezanim izjavama i dokumentima.
9. U tabu `/slucaj/:id/kreiranje/izjave` mozes kreirati formalne izjave i otvoriti
   svaku kroz policijski pregled dokumenta, uz dodatna polja koja se menjaju po tipu izjave.
10. U tabu `/slucaj/:id/kreiranje/dokumenti` mozes kreirati policijske izvjestaje i
   forenzicke nalaze, sa formalnim pregledom svakog dokumenta i podrskom za dodavanje slika.
11. U tabu `/slucaj/:id/kreiranje/saslusanja` mozes izabrati osobu, kreirati stablo pitanja
    i odgovora uz vizuelni prikaz toka (tree preview), ponovo koristiti postojece pitanje
    u drugoj grani i odmah pokrenuti saslusanje kroz chat modal.
12. U tabu `/slucaj/:id/kreiranje/kviz` kreator definise zavrsna pitanja, ponudjene odgovore
    i objasnjenje za svako pitanje; taj kviz se koristi za potvrdu rjesenja slucaja.
13. Iz formalnog dosijea svake osobe mozes kliknuti `Saslusaj osobu`, sto otvara
    `/slucaj/:id/resavanje/saslusanja` i pokusava automatski da pokrene chat za tu osobu.
14. U tabu `/slucaj/:id/resavanje/vremenska-linija` koristi dugme `Dalje` za postepeno
    otkljucavanje sledece stavke; lista prikazuje najnovije otkljucano na vrhu, a
    `Trenutni datum` predstavlja datum poslednje otkljucane stavke.
15. Kada su sve timeline stavke otkljucane, kviz postoji i korisnik tacno postavi ulogu
    za svaku otkljucanu osobu (pocetno stanje je `unknown`), u lijevom meniju solve moda
    se pojavljuje opcija `Rijesi slucaj` koja vodi na `/slucaj/:id/resavanje/kviz`.
16. U solve tabu `kviz` korisnik vidi opis slucaja (naziv, opis, autor, ocjena, broj recenzija),
    odgovara na pitanja i predaje kviz; potrebno je ostvariti strogo vise od 80% tacnih odgovora.
17. Pri uspjesnom rezultatu slucaj prelazi u status `resolved` uz cuvanje vremena rjesavanja,
    prikaz tacnih odgovora i objasnjenja, i pomjeranje slucaja u sekciju `Reseni slucajevi`.
18. U lijevom meniju creatorskog moda postoji opcija `Vrati slucaj u resavanje` koja autoru
    vraca sopstveni progress iz `resolved` u `in_progress`.
19. U ruti `/podrska` mozes otvoriti novi tiket (bug/predlog), navesti lokaciju i verziju
    aplikacije, i pratiti statuse svih svojih tiketa.
20. Za admin panel koristi `http://localhost:5174` i prijavi se admin nalogom:
    email+lozinka naloga + lozinka admin panela (`ADMIN_PANEL_PASSWORD`).
21. Nakon admin prijave dostupni su pregledi i izmene korisnika, slucajeva i svih tiketa.

Napomena:
- Korisnici se trajno cuvaju u SQLite bazi (`Instances/inspektor.sqlite`).
- Slucajevi i povezani podaci (osobe, dokumenti, timeline, korisnicki napredak i zavrsni kviz) cuvaju se u SQLite `case_*` tabelama.
- Ticketi podrske se cuvaju u tabeli `support_tickets`.
- Pri uspesnoj prijavi backend vraca JWT token koji se cuva u `localStorage` na klijentu.
- Pri prvom pokretanju backend automatski obezbedjuje bootstrap admin nalog na osnovu `.env`
  promenljivih (`ADMIN_BOOTSTRAP_*`).
- Vite proxy prosledjuje `"/api/*"` zahteve ka backend-u (`http://localhost:3001`) i za
  korisnicki i za admin frontend.

## Backend API
- `POST /api/auth/register`
  - body: `{ "firstName": "...", "lastName": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login`
  - body: `{ "email": "...", "password": "..." }`
  - vraca korisnika sa `role` poljem (`user` ili `admin`) i JWT token sa korisnickim scope-om
- `GET /api/cases/home` (autorizacija: `Bearer <JWT>`)
  - vraca sekcije i statistiku za ulogovanu pocetnu (`activeCases`, `resolvedCases`, `topRatedPublicCases`, `createdCases`)
- `POST /api/cases` (autorizacija: `Bearer <JWT>`)
  - cuva novi slucaj sa organizovanim podacima:
    - osnovni podaci: `title`, `description`, `publicationStatus`
    - osobe: `people[]`
    - dokumenti: `documents[]`
    - timeline: `timeline[]`
    - korisnicki napredak: `progress[]`
  - napomena: trenutno je podrzano cuvanje napretka za autora slucaja (ulogovanog korisnika)
- `GET /api/cases/:caseId/overview` (autorizacija: `Bearer <JWT>`)
  - vraca pregled slucaja za workspace (opis, autor, ocjenu, broj recenzija)
  - `?scope=create` vraca creatorski pregled samo autoru slucaja
  - `?scope=solve` vraca solve pregled (sa korisnickim progresom, brojem kviz pitanja
    i role readiness statusom) autoru, kao i korisnicima koji imaju pravo pristupa slucaju
- `GET /api/cases/:caseId/creator` (autorizacija: `Bearer <JWT>`)
  - vraca slucaj za creatorski mod samo ako je ulogovani korisnik autor tog slucaja
- `POST /api/cases/:caseId/progress/reset-to-solve` (autorizacija: `Bearer <JWT>`)
  - dostupno samo autoru slucaja; vraca njegov progress status sa `resolved` na
    `in_progress` i cisti `resolved_at`
  - koristi se iz menija creatorskog moda kroz akciju `Vrati slucaj u resavanje`
- `GET /api/cases/:caseId/timeline` (autorizacija: `Bearer <JWT>`)
  - vraca vremensku liniju slucaja (redosled stavki + napomene + datum/vreme)
    zajedno sa direktorijumom osoba i dokumenata dostupnih za timeline, kao i
    korisnicki timeline napredak (`unlockedCount`, `progressPercent`, `lastUnlockedTimelineAt`)
  - pristup imaju autor slucaja i korisnici koji imaju pravo pregleda slucaja
- `PUT /api/cases/:caseId/timeline` (autorizacija: `Bearer <JWT>`)
  - zamenjuje kompletnu vremensku liniju novim redosledom stavki kroz payload:
    `items[]` sa poljima `itemType`, `sourceId`, `unlockNote`, `unlockAt`
  - validira postojanje referenci, jedinstvenost stavki i format datuma/vremena
  - pristup je trenutno ogranicen na autora slucaja
- `POST /api/cases/:caseId/timeline/advance` (autorizacija: `Bearer <JWT>`)
  - otkljucava sledecu timeline stavku za trenutno ulogovanog korisnika i azurira
    `case_user_progress` (`unlocked_timeline_count`, `progress_percent`)
  - vraca azuriran korisnicki timeline napredak i poslednju otkljucanu stavku
- `GET /api/cases/:caseId/people` (autorizacija: `Bearer <JWT>`)
  - vraca listu osoba i njihove dosijee za trazeni slucaj
  - opciono `?scope=solve` vraca samo osobe otkljucane do trenutnog korisnickog
    progresa na vremenskoj liniji, sa korisnicki izabranim ulogama
    (inicijalno `unknown`) i role progress statusom
  - dosije ukljucuje auto-generisane administrativne podatke (`dossierNumber`,
    `classificationLevel`, `revisionNumber`, `generatedAt`)
  - bez `scope=solve` pristup je ogranicen na autora slucaja
- `PUT /api/cases/:caseId/people/:personId/role` (autorizacija: `Bearer <JWT>`)
  - menja procenjenu ulogu osobe u solve modu (`unknown`, `suspect`, `victim`, `witness`)
  - vraca azurirani role progress (`allRolesResolved`) koji je uslov za prikaz opcije
    `Rijesi slucaj` i predaju zavrsnog kviza
- `POST /api/cases/:caseId/people` (autorizacija: `Bearer <JWT>`)
  - kreira novu osobu i pripadajuci dosije u okviru slucaja
  - podrzana polja: `fullName`, `apparentRole`, `biography`, `phoneNumber`, `address`,
    `birthDate`, `birthPlace`, `nationality`, `gender`, `maritalStatus`, `occupation`,
    `employer`, `educationLevel`, `eyeColor`, `hairColor`, `heightCm`, `weightKg`,
    `isAlive`, `identifyingMarks`, `knownAssociates`, `riskLevel`, `photoDataUrl`,
    `lastKnownLocation`, `priorOffenses`, `notes`
  - polja kao `apparentRole`, `riskLevel`, `gender`, `maritalStatus`, `nationality`,
    `educationLevel`, `eyeColor` i `hairColor` se validiraju kao enum vrijednosti
  - `photoDataUrl` prihvata uploadovanu fotografiju osobe kao `data:image/...;base64,...`
  - pristup je trenutno ogranicen na autora slucaja
- `GET /api/cases/:caseId/statements` (autorizacija: `Bearer <JWT>`)
  - vraca sve izjave u slucaju (`witness_statement`, `suspect_statement`, `victim_statement`)
    zajedno sa formalnim metapodacima i povezanim osobama
  - opciono `?scope=solve` vraca samo timeline-otkljucane izjave i filtrira prikaz
    povezanih osoba na timeline-otkljucane osobe
  - bez `scope=solve` pristup je ogranicen na autora slucaja
- `POST /api/cases/:caseId/statements` (autorizacija: `Bearer <JWT>`)
  - kreira novu izjavu sa formalnim poljima: `documentType`, `title`, `content`,
    `classificationLevel`, `recordedAt`, `location`, `officerName`, `badgeNumber`,
    `department`, `evidenceReference`, `legalReference`, `notes`, `giverPersonId`,
    `relatedPersonIds`, `sequenceOrder`, `isUnlockedByDefault`, `typeSpecific`
  - `typeSpecific` je objekat sa poljima zavisno od tipa izjave
    (`witness_statement`, `suspect_statement`, `victim_statement`)
  - validira da referencirane osobe postoje u trazenom slucaju
  - pristup je trenutno ogranicen na autora slucaja
- `GET /api/cases/:caseId/police-documents` (autorizacija: `Bearer <JWT>`)
  - vraca policijske izvjestaje i forenzicke nalaze sa formalnim metapodacima i
    povezanim osobama
  - opciono `?scope=solve` vraca samo timeline-otkljucane dokumente i filtrira prikaz
    povezanih osoba na timeline-otkljucane osobe
  - bez `scope=solve` pristup je ogranicen na autora slucaja
- `POST /api/cases/:caseId/police-documents` (autorizacija: `Bearer <JWT>`)
  - kreira novi policijski izvjestaj ili forenzicki nalaz sa istim formalnim setom
    metapodataka kao i kod izjava (osim obaveznog davaoca izjave),
    plus `typeSpecific` i `imageEvidence`
  - `typeSpecific` je objekat sa poljima zavisno od tipa dokumenta
    (`police_report`, `forensic_report`)
  - `imageEvidence` je niz `data:image/...;base64,...` slika (JPEG/PNG/WEBP),
    podrzan za policijske izvjestaje i forenzicke nalaze
  - pristup je trenutno ogranicen na autora slucaja
- `GET /api/cases/:caseId/interrogations` (autorizacija: `Bearer <JWT>`)
  - vraca sva saslusanja u slucaju zajedno sa stablom pitanja/odgovora i
    direktorijumom osoba
  - opciono `?scope=solve` vraca samo saslusanja za osobe otkljucane kroz vremensku liniju
  - bez `scope=solve` pristup je ogranicen na autora slucaja
- `POST /api/cases/:caseId/interrogations` (autorizacija: `Bearer <JWT>`)
  - kreira ili azurira saslusanje za konkretnu osobu (`personId`) sa poljima:
    `title`, `openingPrompt`, `nodes[]`
  - svaki cvor u `nodes[]` sadrzi: `nodeKey`, `parentKey`, `question`, `answer`,
    i opciono `questionReferenceKey` kada se koristi ponovno pitanje iz drugog cvora
  - validira strukturu stabla (jedinstveni cvorovi, validne roditeljske veze,
    bez ciklusa), pravilo da se isto pitanje ne moze ponoviti u istoj grani i
    pravilo da je saslusanje dozvoljeno samo za zive osobe
  - pristup je trenutno ogranicen na autora slucaja
- `GET /api/cases/:caseId/quiz` (autorizacija: `Bearer <JWT>`)
  - `?scope=create` vraca creatorski payload za uredjivanje pitanja/odgovora i
    objasnjenja (samo autor slucaja)
  - `?scope=solve` vraca solve payload sa opisom slucaja, stanjem progresa, pravilima
    spremnosti za predaju (ukljucujuci proveru tacno postavljenih uloga osoba) i pitanjima
    kviza bez otkrivanja tacnih odgovora dok slucaj nije rijesen
- `PUT /api/cases/:caseId/quiz` (autorizacija: `Bearer <JWT>`)
  - cuva kompletan zavrsni kviz slucaja (`questions[]`, `options[]`, `isCorrect`, `explanationText`)
  - pristup je ogranicen na autora slucaja
- `POST /api/cases/:caseId/quiz/submit` (autorizacija: `Bearer <JWT>`)
  - predaje odgovore korisnika na zavrsni kviz i racuna rezultat
  - prag prolaza je strogo veci od 80% tacnih odgovora
  - uspjesan rezultat azurira `case_user_progress` na `resolved`, postavlja `resolved_at`
    i vraca review podatke sa tacnim odgovorima i objasnjenjima
  - neuspjesan rezultat ostavlja slucaj u `in_progress` bez prikaza tacnih odgovora
- `GET /api/support/tickets/me` (autorizacija: `Bearer <JWT>`)
  - vraca sve tikete trenutno ulogovanog korisnika, ukljucujuci status i admin napomenu
- `POST /api/support/tickets` (autorizacija: `Bearer <JWT>`)
  - kreira novi tiket za podrsku
  - body: `ticketType`, `title`, `description`, `appLocation`, `appVersion`
  - status tiketa se inicijalno postavlja na `open`
- `POST /api/admin/login`
  - body: `{ "email": "...", "password": "...", "panelPassword": "..." }`
  - pristup odobrava samo za korisnike sa `role=admin` i validnom lozinkom admin panela
  - vraca admin JWT token sa `scope=admin_panel`
- `GET /api/admin/overview` (autorizacija: `Bearer <ADMIN_JWT>`)
  - vraca agregirane metrike korisnika, slucajeva i tiketa
- `GET /api/admin/tickets` (autorizacija: `Bearer <ADMIN_JWT>`)
  - vraca sve tikete sa podacima naloga koji ih je prijavio
- `PATCH /api/admin/tickets/:ticketId/status` (autorizacija: `Bearer <ADMIN_JWT>`)
  - menja status tiketa i opcionu `adminNote`
- `GET /api/admin/users` (autorizacija: `Bearer <ADMIN_JWT>`)
  - vraca sve korisnike bez `password_hash` polja
- `PATCH /api/admin/users/:userId` (autorizacija: `Bearer <ADMIN_JWT>`)
  - menja korisnicke podatke (`firstName`, `lastName`, `email`, `role`)
- `GET /api/admin/cases` (autorizacija: `Bearer <ADMIN_JWT>`)
  - vraca sve slucajeve sa podacima autora
- `PATCH /api/admin/cases/:caseId` (autorizacija: `Bearer <ADMIN_JWT>`)
  - menja osnovna polja slucaja (`title`, `description`, `publicationStatus`, `averageRating`, `ratingCount`)
- `GET /api/health`
  - provera dostupnosti API-ja i baze

## Dokumentacija requirements i arhitekture
1. `cd Automation`
2. `source docs_venv/bin/activate`
3. `python3 docs_builder.py`
4. Otvori `Docs/build/index.html`

## Trenutno implementirano
- Javne stranice za neulogovane korisnike:
  - levi meni (`Pocetna`, `Registracija`, `Prijava`)
  - desktop-only pristup (za manje ekrane se prikazuje informativna poruka)
  - hero sekcija sa opisom svrhe aplikacije
  - pregled kljucnih funkcionalnosti
  - CTA sekcija za registraciju/prijavu
- Registracija (`/registracija`):
  - forma sa poljima ime, prezime, email, lozinka i potvrda lozinke
  - validacije za email format, duzinu lozinke i postojeci nalog
- Prijava (`/prijava`):
  - validacije kredencijala i poruke greske za neispravan unos
  - backend autentifikacija i cuvanje JWT tokena sesije u browseru
- Pocetna za ulogovane (`/app`):
  - ucitavanje realnih slucajeva preko `GET /api/cases/home`
  - pregled aktivnih i resenih slucajeva iz baze
  - akcija `Nastavi resavanje` za aktivne slucajeve
  - pregled slucajeva u fazi kreiranja sa akcijom `Nastavi kreiranje`
  - pregled najocenjenijih javnih slucajeva iz baze
  - pregled slucajeva koje je korisnik kreirao (bez mock podataka)
  - prikaz loading, greske i praznih stanja
  - meni za ulogovane (`Pocetna`, `Kreiranje slucaja`, `Podrska`, `Profil`, `Odjava`)
  - za admin korisnika dodatni link ka izdvojenom admin panelu (`http://localhost:5174`)
- Korisnicka podrska (`/podrska`):
  - forma za prijavu bug-a ili predloga poboljsanja (`ticketType`, `title`, `description`, `appLocation`, `appVersion`)
  - ucitavanje i prikaz svih tiketa trenutnog korisnika sa statusima
  - backend integracija preko `GET /api/support/tickets/me` i `POST /api/support/tickets`
- Admin panel (`http://localhost:5174`):
  - zaseban frontend i odvojena sesija (`admin_panel` JWT scope)
  - login zahteva admin nalog i lozinku admin panela
  - dashboard prikazuje aggregate metrike (`/api/admin/overview`)
  - upravljanje ticketima (pregled svih + promena statusa i admin napomene)
  - upravljanje korisnicima (pregled i izmena osnovnih podataka i role, bez lozinki)
  - upravljanje slucajevima (pregled i izmena osnovnih polja)
- Kreiranje slucaja (`/slucaj/novi`):
  - forma za unos naziva i opisa slucaja kao pocetni korak
  - nakon submit-a cuva draft slucaj preko backend API-ja
  - posle cuvanja automatski preusmerava na `/slucaj/:id/kreiranje/vremenska-linija`
- Case workspace tabovi:
  - rezim kreiranja: `/slucaj/:id/kreiranje/:tab`
  - rezim resavanja: `/slucaj/:id/resavanje/:tab`
  - isti skup tabova postoji u oba moda:
    - `vremenska-linija`
    - `osobe-i-dosijei`
    - `dokumenti`
    - `izjave`
    - `saslusanja`
    - `kviz`
  - tab `vremenska-linija`:
    - u creatorskom modu omogucava dodavanje osoba i dokumenata u redosled otkljucavanja,
      pomeranje stavki gore/dole, uklanjanje, unos napomena i opcionalnog datuma/vremena
    - cuvanje radi kroz `PUT /api/cases/:caseId/timeline`, a inicijalno ucitavanje kroz
      `GET /api/cases/:caseId/timeline`
    - u rezimu resavanja koristi dugme `Dalje` za postepeno otkljucavanje sledece stavke,
      prikazuje najnovije otkljucano na vrhu i prikazuje trenutni datum kao datum
      poslednje otkljucane stavke
  - tab `osobe-i-dosijei`:
    - na glavnom prikazu prikazuje listu osoba sa osnovnim podacima i prilagodjen uvodni panel po modu
    - klik na osobu otvara formalni dosije u iskacucem prozoru
    - u creatorskom modu kreiranje nove osobe i dosijea se radi kroz iskacuci prozor
    - u rezimu resavanja prikazuje samo osobe koje su trenutno otkljucane na vremenskoj liniji
      i omogucava korisniku da za svaku postavi procenjenu ulogu (pocetno `unknown`)
    - forma koristi padajuce liste za sva pogodna polja (ukljucujuci pol) i upload fotografije osobe
    - dosije prikazuje sve povezane izjave i dokumente kao direktne linkove ka formalnom prikazu
  - tab `izjave`:
    - prikazuje listu izjava sa pretragom/filterima i operativnom statistikom
    - u creatorskom modu omogucava modalno kreiranje formalne izjave sa tip-specificnim poljima po vrsti izjave
    - svaka izjava se otvara kroz formalni policijski pregled dokumenta
    - iz formalnog prikaza izjave moguce je otvoriti dosije svake povezane osobe
    - u rezimu resavanja tab radi u read-only nacinu i prikazuje samo timeline-otkljucane izjave
  - tab `dokumenti`:
    - prikazuje policijske izvjestaje i forenzicke nalaze sa pretragom/filterima
    - u creatorskom modu omogucava modalno kreiranje dokumenta sa tip-specificnim poljima
      i uploadom slika za forenzicke nalaze i policijske izvjestaje
    - pregled svakog dokumenta radi kroz formalni policijski prikaz sa sekcijom fotodokumentacije
    - iz formalnog prikaza dokumenta moguce je otvoriti dosije svake povezane osobe
    - u rezimu resavanja tab radi u read-only nacinu i prikazuje samo timeline-otkljucane dokumente
  - tab `saslusanja`:
    - prikazuje saslusanja po osobi i omogucava direktan izbor osobe za pokretanje saslusanja
    - u creatorskom modu omogucava modalno kreiranje stabla pitanja i odgovora
      za konkretnu osobu, sa vizuelnim prikazom stabla i reuse opcijom pitanja po granama
    - pokretanje saslusanja se vrsi kroz zaseban chat modal sa grananjem pitanja i
      opcijom `Zakljuci saslusanje` na kraju grane
    - u rezimu resavanja prikazuje samo saslusanja osoba koje su trenutno otkljucane na vremenskoj liniji
    - iz svakog dosijea postoji akcija `Saslusaj osobu` koja vodi na ovaj tab
      u rezimu pregleda i pokusava auto-otvaranje chat modala
  - tab `kviz`:
    - u creatorskom modu omogucava kreiranje zavrsnog kviza (pitanja, ponudjeni odgovori i objasnjenja)
    - u rezimu resavanja prikazuje opis slucaja i kviz za potvrdu rjesenja
    - prikaz tacnih odgovora i objasnjenja je dostupan tek nakon uspjesnog rjesavanja slucaja
- Opcija objave:
  - u meniju rezima kreiranja postoji `Objavi slucaj` kao dugme
  - dugme ne vodi na novu rutu/stranicu
  - trenutno prikazuje placeholder status poruku (bez pune backend logike objave)
- Reset statusa za kreatora:
  - u meniju rezima kreiranja postoji opcija `Vrati slucaj u resavanje`
  - akcija poziva `POST /api/cases/:caseId/progress/reset-to-solve` i resetuje
    samo progress trenutno ulogovanog autora slucaja
- Creatorski workspace:
  - ucitava pregled slucaja preko `GET /api/cases/:caseId/overview?scope=create`
  - prikazuje osnovne podatke slucaja i funkcionalne operativne tabove
- Resavacki workspace:
  - koristi isti set tabova i istu navigacionu strukturu kao creatorski workspace
  - tab `vremenska-linija` je dostupan za postepeno otkljucavanje roadmap sekvence
    kroz akciju `Dalje`, uz automatsko azuriranje faze istrage (procenta)
  - tab `osobe-i-dosijei` je dostupan za read-only pregled samo timeline-otkljucanih osoba i dosijea
  - tabovi `izjave` i `dokumenti` su dostupni za read-only pregled samo timeline-otkljucanih dokumenata
  - tab `saslusanja` je dostupan za read-only pokretanje i pregled chat saslusanja samo za timeline-otkljucane osobe
  - tab `kviz` nije prikazan u solve meniju dok nisu tacno postavljene uloge osoba
  - opcija `Rijesi slucaj` se pojavljuje u meniju tek kada su ispunjeni svi uslovi:
    otkljucana timeline sekvenca, postojeci kviz i tacno postavljene uloge svih otkljucanih osoba
  - tab `kviz` omogucava predaju zavrsnog kviza; rezultat >80% prebacuje slucaj u `resolved`
    i cuva vrijeme rjesavanja (`resolved_at`)
- Backend auth:
  - modularna Express struktura (routes/controller/service/repository)
  - SQLite migracije i maintenance podesavanja
- Backend slucajevi:
  - SQLite model za `cases`, `case_people`, `case_person_dossiers`,
    `case_person_dossier_profiles`, `case_person_role_assignments`, `case_documents`, `case_interrogations`,
    `case_interrogation_nodes`, `case_timeline_items`, `case_user_progress`,
    `case_quiz_questions`, `case_quiz_options`, `case_quiz_user_results`
  - prosiren `case_documents` model sa `metadata_json` za formalna polja izjava i
    policijskih dokumenata
  - JWT-zasticeni endpointi za cuvanje slucaja, prikaz ulogovane pocetne, workspace overview,
    vremensku liniju, osobe/dosijee, izjave, policijska dokumenta, saslusanja i zavrsni kviz
