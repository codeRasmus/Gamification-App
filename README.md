# Militeam | Lederspil udviklet til Hjemmeværnsskolen

Militeam er en digital applikation udviklet til brug på Hjemmeværnsskolens ledelseskurser. Formålet er at understøtte læring, samarbejde, refleksion og evaluering gennem interaktive opgaver og holdbaserede beslutningsprocesser. Applikationen bygger videre på principperne fra Quickfire Interactive og Kahoot, og er samtidig tilpasset Forsvarets og Hjemmeværnets ledelsesgrundlag. Der er også taget udgangspunkt i Forsvaret og Hjemmeværnets designmanual.

## Formål

At styrke deltagerens forståelse og evne til at arbejde med **situationsbestemt og værdibaseret ledelse i praksis**. Appen fungerer som et aktivt værktøj under kursusaktiviteter, hvor grupper træffer valg, løser opgaver og reflekterer over deres beslutninger.

## Sådan starter du

1. **Klon projektet**

```
git clone https://github.com/codeRasmus/Gamification-App
cd Gamification-App
```

2. **Installer afhængigheder**

```
npm install
```

3. **Start udviklingsserver**

```
npm run dev
```

3. **Åbn appen i din browser**
   Gå til http://localhost:5173

Projektet er bygget med **Vue 3** og bruger `Vite` som build tool.

## Målgruppe

- Deltagere på Hjemmeværnsskolens ledelseskurser
- Instruktører og undervisere

## Platform

- Responsiv web-app optimeret til **tablet og mobil**
- Offline-funktionalitet via lokal caching

## Funktionalitet (Implementeret)

### 1. Holdoprettelse og –styring

- Der er for-oprettede hold ved navn **Alpha**, **Beta**, **Delta**, **Sigma** og **Omega**.
- Hver spil (session) kan have 5 ovenstående hold med i alt

### 2. Dynamisk opgavebank

- Opgaver trækkes fra en database baseret på temaer fra **Lederskab i HJV**
- Kategorisering efter ledelsestemaer:
  - Kommunikation
  - Delegering
  - Konflikthåndtering
  - Motivation
  - Planlægning
  - Evaluering

### 3. Opgaveløsning

- Opgaver besvares med **tekstinput**
- Tidsbegrænsning på opgaver (visuel nedtælling)
- Manuel evaluering via instruktør (skal ske eksternt fra applikationen)

### 4. Refleksionsmodul

- Spørgsmål til holdet om ledelse, beslutningstagning og samarbejde

### 5. Vedligeholdelse og redigerbarhed

- Spørgsmålsbank kan vedligeholdes via struktur via. Admin panelet med mulighed for upload af regneark med spørgsmål
- Let at overdrage til nye undervisere eller udviklere uden teknisk baggrund

## Ikke implementeret (endnu)

- Pointsystem: **pointomkostning og pointgevinst**
- **Automatisk evaluering** af opgaver
- Opgaveformater med **video, billede og multiple choice**
- Desktopoptimering (webappen er pt. primært kun designet til **mobil** og **tablet**)

## Design og stil

- Følger Forsvarets designmanual (typografi, farver, ikoner)
- Brugercentreret UI med tydelig navigation og visuel feedback
- Designet til robusthed

## Datasikkerhed

- Beskyttet login (Bcrypt hashing samt JWT token)
- Lokalt cachede data ved offline-brug (Ved brug af localStorage)

## Fremtidige muligheder

- Statistik
- Eksportfunktion til kursusrapportering
- AI-styret adaptiv sværhedsgrad
