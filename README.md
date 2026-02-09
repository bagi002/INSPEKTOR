# INSPEKTOR

INSPEKTOR je web aplikacija za interaktivno resavanje detektivskih/policijskih slucajeva.
Trenutno su implementirani javna pocetna stranica, registracija i prijava za neulogovane korisnike, kao i ulogovana pocetna koja prikazuje stvarne slucajeve iz SQLite baze.
Aktuelna verzija javnog interfejsa je desktop-only i predvidjena za sirinu ekrana od najmanje 1120px.

## Tehnologije
- Frontend: React + Vite
- Backend: Node.js + Express
- Baza podataka: SQLite
- Auth: JWT + bcrypt hash lozinki
- Dokumentacija: YAML requirements + PlantUML dijagrami

## Struktura projekta
- `frontend/` - React aplikacija (landing + auth stranice)
- `backend/` - Express backend (`/api/auth`, `/api/cases`, `/api/health`) i SQLite pristup
- `Instances/` - runtime podaci (npr. SQLite fajl baze)
- `Docs/requirements/` - high-level i softverski requirements
- `Docs/architecture/` - runtime, class i block PUML dijagrami
- `Automation/` - alati za izgradnju dokumentacije (`docs_builder.py`)

## Pokretanje projekta (frontend + backend)
1. `./setup.sh`
2. `./start.sh`
3. Frontend: `http://localhost:5173`
4. Backend health: `http://localhost:3001/api/health`

## Pokretanje preko skripti (root)
1. `./setup.sh` - priprema okruzenje, instalira backend + frontend zavisnosti, kreira `backend/.env` (ako ne postoji) i inicijalizuje bazu
2. `./start.sh` - pokrece backend (`3001`) i frontend (`5173`)

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

## Build i preview (frontend)
1. `cd frontend`
2. `npm run build`
3. `npm run preview`

## Koriscenje auth stranica
- Pocetna: `http://localhost:5173/`
- Registracija: `http://localhost:5173/registracija`
- Prijava: `http://localhost:5173/prijava`
- Ulogovana pocetna: `http://localhost:5173/app`

Tok koriscenja:
1. Otvori `/registracija` i kreiraj nalog.
2. Nakon uspesne registracije otvori `/prijava`.
3. Prijavi se istim podacima.
4. Nakon prijave automatski se otvara ulogovana pocetna (`/app`).

Napomena:
- Korisnici se trajno cuvaju u SQLite bazi (`Instances/inspektor.sqlite`).
- Slucajevi i povezani podaci (osobe, dokumenti, timeline, korisnicki napredak) cuvaju se u SQLite `case_*` tabelama.
- Pri uspesnoj prijavi backend vraca JWT token koji se cuva u `localStorage` na klijentu.
- Vite proxy prosledjuje `"/api/*"` zahteve ka backend-u (`http://localhost:3001`).

## Backend API
- `POST /api/auth/register`
  - body: `{ "firstName": "...", "lastName": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login`
  - body: `{ "email": "...", "password": "..." }`
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
  - pregled najocenjenijih javnih slucajeva iz baze
  - pregled slucajeva koje je korisnik kreirao (bez mock podataka)
  - prikaz loading, greske i praznih stanja
  - meni za ulogovane (`Pocetna`, `Kreiranje slucaja`, `Profil`, `Odjava`)
- Backend auth:
  - modularna Express struktura (routes/controller/service/repository)
  - SQLite migracije i maintenance podesavanja
- Backend slucajevi:
  - SQLite model za `cases`, `case_people`, `case_documents`, `case_timeline_items`, `case_user_progress`
  - JWT-zasticeni endpointi za cuvanje slucaja i prikaz ulogovane pocetne
