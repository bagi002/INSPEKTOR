# INSPEKTOR

INSPEKTOR je web aplikacija za interaktivno resavanje detektivskih/policijskih slucajeva.
Trenutno je implementirana javna pocetna stranica za neulogovane korisnike sa menijem i CTA
akcijama za registraciju i prijavu.
Aktuelna verzija javnog interfejsa je desktop-only i predvidjena za sirinu ekrana od najmanje 1120px.

## Tehnologije
- Frontend: React + Vite
- Dokumentacija: YAML requirements + PlantUML dijagrami
- Backend: rezervisan folder (`backend/`) za naredne faze

## Struktura projekta
- `frontend/` - React aplikacija (javna pocetna stranica)
- `backend/` - buduce backend komponente
- `Docs/requirements/` - high-level i softverski requirements
- `Docs/architecture/` - runtime, class i block PUML dijagrami
- `Automation/` - alati za izgradnju dokumentacije (`docs_builder.py`)

## Pokretanje projekta (frontend)
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Otvori adresu koju ispisuje Vite (standardno `http://localhost:5173`)

## Pokretanje preko skripti (root)
1. `./setup.sh` - priprema Python okruzenja i instalira frontend zavisnosti
2. `./start.sh` - pokrece frontend aplikaciju na `http://localhost:5173`

## Build i preview (frontend)
1. `cd frontend`
2. `npm run build`
3. `npm run preview`

## Dokumentacija requirements i arhitekture
1. `cd Automation`
2. `source docs_venv/bin/activate`
3. `python3 docs_builder.py`
4. Otvori `Docs/build/index.html`

## Trenutno implementirano
- Javna stranica za neulogovane korisnike:
  - levi meni (`Pocetna`, `Registracija`, `Prijava`)
  - desktop-only pristup (za manje ekrane se prikazuje informativna poruka)
  - hero sekcija sa opisom svrhe aplikacije
  - pregled kljucnih funkcionalnosti
  - CTA sekcija za registraciju/prijavu
