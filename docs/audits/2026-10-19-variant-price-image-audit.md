# Variantu cenu un attēlu audits — 2026-10-19 (DAĻĒJS)

Dzīvajā DB nekas nav rakstīts, nekas nav sinhronizēts, nekas nav publicēts. Formulas nav mainītas.

## Izlabots priekšskatījumā
- Kopīgā funkcija `catalogColorPrice` (`src/lib/catalogPriceSelection.ts`): Russell/ETX vienotā modeļa cena; Malfini krāsas kods ar burtiem (S30B539→B5, T21TC37→TC); kamēr cenas ielādējas, rāda „…”.
- Russell preces lapa: pārbaudīts pārlūkā — 0R013M0 Black→/36/, Bottle Green→/38/, Classic Red→/CR/ attēli.
- Kartītes attēlu kadri `cardImageFrames` (`src/hooks/useCatalogCardImages.ts`): modeļa vispārīgā bilde vairs neaizsedz izvēlētās krāsas foto; tests `useCatalogCardImages.test.ts`.

## NEATRISINĀTS (augsta nozīme)
- Russell kataloga kartīte 0R013M0: pēc krāsas maiņas nosaukums mainās, bet attēls paliek /36/ (Black). Atkārtots pārlūkā. Cēlonis: kataloga krāsām `u` = null (visām 7 krāsām), kartīte rāda modeļa `image_url`. Krāsu foto DB ir (9 katrai krāsai). Labojums hook līmenī ieviests, bet pārlūkā vēl neiedarbojas — jāpārbauda, kurš komponents patiešām zīmē /catalog kartīti.

## Nav pārbaudīts
- Pilnais piegādātāju salīdzinājums (SS, NWG pa zīmoliem, UTT, FR, MF, PF, BB, ETX): trūkstošās, liekās un dubultās krāsas/izmēri, attēli katrai krāsai.
- Avotu plūsmu pilnīgums (sinhronizācija nav atļauta).
- Salīdzinājums ar publicēto versiju.
