# INSPEKTOR GUIDE

Ovaj dokument je user-friendly vodic kroz aplikaciju:
- sta je slucaj
- od cega se slucaj sastoji
- kako se slucaj rjesava
- kako se slucaj kreira

Web verzija ovog vodica je dostupna na ruti: `http://localhost:5173/wiki`.

## 1. Sta je slucaj?

Slucaj je istrazni scenario koji je pripremio kreator.
Igrac tokom resavanja dobija tragove postepeno i na kraju potvrduje rjesenje kroz kviz.

Svaki slucaj ima:
- naziv i opis
- autora
- prosjecnu ocjenu i broj recenzija

## 2. Od cega se slucaj sastoji?

### Vremenska linija
Odredjuje kojim redosledom se otkljucavaju osobe i dokumenti.

### Osobe i dosijei
Akteri slucaja sa formalnim dosijeima i povezanim dokumentima.

### Dokumenti
Policijski izvjestaji i forenzicki nalazi.

### Izjave
Izjave svjedoka, osumnjicenih i zrtava.

### Saslusanja
Razgovori kroz unaprijed definisano stablo pitanja i odgovora.

### Zavrsni kviz
Finalni korak za potvrdu rjesenja.
Prag prolaza je strogo veci od 80%.

## 3. Kako se slucaj rjesava? (korak po korak)

1. Na `/app` izaberi javni slucaj i klikni `Pokreni resavanje`.
2. U tabu `vremenska-linija` koristi `Dalje` za otkljucavanje novih tragova.
3. Analiziraj sve sto je otkljucano u tabovima:
   - osobe i dosijei
   - dokumenti
   - izjave
   - saslusanja
4. U solve modu dodijeli uloge osobama (`unknown/suspect/victim/witness`).
5. Kada su uslovi spremnosti ispunjeni, otvori tab `kviz`.
6. Predaj kviz. Ako je rezultat >80%, slucaj prelazi u `resolved`.
7. Nakon toga mozes poslati ocjenu i komentar.

## 4. Kako se slucaj kreira? (korak po korak)

1. Otvori `/slucaj/novi` i unesi naziv + opis.
2. Dodaj osobe i njihove dosijee.
3. Dodaj dokumente, izjave i saslusanja.
4. Sastavi vremensku liniju otkljucavanja.
5. Definisi zavrsni kviz.
6. Klikni `Objavi slucaj`.
7. Ako objava ne prodje, dopuni obavezne stavke i ponovi objavu.

## 5. Brza mapa ruta

- `/wiki` - glavni GUIDE
- `/registracija` - kreiranje naloga
- `/prijava` - prijava
- `/app` - ulogovana pocetna
- `/slucaj/novi` - pocetak kreiranja slucaja
- `/podrska` - prijava bugova i predloga

## 6. FAQ

### Zasto ne vidim sve dokumente odmah?
U solve modu se prikazuje samo ono sto je otkljucano trenutnim napretkom na vremenskoj liniji.

### Zasto ne mogu da predam kviz?
Najcesce nisu ispunjeni uslovi spremnosti (napredak kroz timeline i role assignment osoba).

### Zasto objava slucaja ne prolazi?
Nedostaju obavezni tipovi dokumenata/izjava ili nisu sve osobe/dokumenti pokriveni timeline-om.
