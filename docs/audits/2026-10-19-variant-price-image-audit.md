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

## Offline koda audits (2026-10-19 12:35 UTC; DB nepieejama — SELECT 1 neizdevās)
Tikai kods + iepriekšējie DB skaitļi. Pārlūka un svaiga piegādātāju feed pārbaude BLOĶĒTA DB dīkstāves dēļ. Formulas/dati nav mainīti.

| Avots | Formula (kods) | Varianta atslēga | Izmēru izcelsme | Outlet filtrs | Apjoma cenas | Koda riski / DB pierādījumi |
|---|---|---|---|---|---|---|
| SS | partnera neto ×1,75, +21% PVN (`refresh_catalog_prices`; `stanley-stella-sync/index.ts` products/get_prices) | SKU (style+color+size_code) | `ss_sizes`, `size_code`/`size_sequence` (`:112-121`, `:201`) | nav avota pazīmes | nav | `ss_sku_retail_prices` MIN(style) fallback dzīvajā DB (6 STJW190 SKU, labojums 003 neizpildīts). Bez cenas 0. |
| NWG | `GREATEST(rec_price×0,37, purchase)`/zīmola koeficients ×1,75 (Clique), Craft/ProJob/C&B ×1,5, +21% (migr. `20260930123624`) | SKU `model-color-size` | `nwg_skus.size_name` (`nwg-size-names`) | nav | nav (customerprice pa SKU, `nwg-price-sync/index.ts:18`) | Augsts: 649066 Black S/M `-4`=15,30 / `-5`=16,83 — `size_name` dublējas, kartīte/izmērs var paņemt nepareizo SKU. Vēsturiski mainījusies GREATEST↔COALESCE loģika migrācijās — jāsalīdzina LIVE funkcija, kad DB pieejama. |
| PF | `price ×1,65` (`pf-concept-sync/index.ts:473`), PVN DB pusē; ×1,0165 kodā NAV | itemcode (`10650500`) | feed `size`/`sizeGrid` (`:131-132`) | nav | feed lasīts ar teksta skenu (`:406-473`) — jāpārbauda, ka ņem quantity=1 cenu | 29 konfliktējošas krāsa+izmērs grupas (106505 BLACK 89,08 vs 131,08; K1058H GREY 15,13 vs 14,42) — iespējami atšķirīgi atribūti, kas sakļauti zem vienas krāsas. 148 varianti bez cenas. |
| MF | wholesale ×1,65 +21% (`malfini-sync/index.ts:12`) | `productSizeCode` | API productSizeCode | Augsts: `:81-84` pārsauc OUTLET kategoriju → pazīme pazūd | **Augsts: `:57` ņem MIN cenu pār visiem `limit` līmeņiem** — var publicēt apjoma cenu kā vienības cenu; labots tikai `003_sync_code.patch` (neizpildīts) | 6 redzami OUTLET modeļi (X20,5Y1,X22,5X8,23Y,X35). |
| BB | ×1,65 +21% | SKU | gandrīz viss one-size | nav | nav | 36/2963 krāsām nav foto. |
| UTT | Gildan ×2, Kariban ×1,8, Regatta ×1,75, +21% | SKU (`utt-sync/index.ts:164`) | UTT stock export | `specialprice` saglabāts, bet outlet semantika nepierādīta | nav | Dzīvajā DB mediānas aizstāšana (003/004 neizpildīti); 3547/3547 krāsām nav krāsu foto URL; 15 varianti bez cenas. |
| FR | partnera cena ×1,55 +21% (`falkross-sync/index.ts:5`) | SKU, matrix line pa izmēriem (`:257`) | `uniqueSortedSizes` (`:61-69`) | nav | MatrixLine viena cena | **Pierādīts (root DB): 308 redzamiem variantiem nav avota cenas rindu** — sync nesaņem/neieraksta cenu, nevis frontend kļūda. 841/841 krāsām nav foto URL. |
| RU | model-wide bezkrāsas cena (atļauta tikai RU/ETX, `useVariants.ts`) | modelis (+krāsa foto) | **`sizesForColor` (`useVariants.ts:104`) ņem izmērus tikai no cenu rindām; RU cenas ir bez izmēra, `ru_styles.sizes` netiek lasīts** → piedāvājumā nav izmēru izvēles | nav | nav | Izmēri netiek izdomāti — jāpievieno `ru_styles.sizes` lasīšana (nākamais solis). 0R964M0 Light Blue nav foto. |
| ETX | manuālas cenas bez PVN, katalogs +21% | modelis | manuāli | n/a | nav | 12/12 ar cenu. |

### Lietotāja ziņotie atradumi
- Russell krāsas maiņa nemainīja foto — izlabots (proxy→oriģināls), pārbaudīts pārlūkā iepriekš.
- Russell/Malfini masveida „Cena pēc pieprasījuma” — frontend cenas meklēšana izlabota.

### Šajā solī izlabots (frontend)
- `CatalogModelCard.tsx`: rezerves bilde tiek lietota tikai, ja tā ir tas pats kadrs (`unproxyUrl`); citādi tukšs lauks, nekad citas krāsas foto. Kļūdas paslēpšana tiek atiestatīta nākamajam derīgajam kadram.
- `UnifiedCatalog.tsx`: `fallbackImage = unproxyUrl(cardImage)`; modeļa hover foto netiek rādīts izvēlētai krāsai bez savas bildes.
- Tests: pēc proxied un oriģinālā zaļā kļūdas nekad nerāda melno; nākamā krāsa nav paslēpta.
