# Parastās cenas saglabāšana — 2026-10-21

## Statuss
- **Nav pabeigts pilns izlaidums. Frontend nav publicēts.**
- Izvietots tikai esošais `malfini-sync`: rīks apstiprināja panākumu; iesniegtās paketes SHA-256 `0eaaea6a9d5ff58d81b7df5eda863cc06386d397080dd419193472b7c24ff6c4`.
- Šajā kārtā nav DB cenu/variantu rakstīšanas, refresh vai sync izsaukumu. Nav e-pastu/pasūtījumu.
- Kopīgā DB aizsardzība **tikai sagatavota**, ne pielietota: `docs/pending-migrations/009_regular_price_retention/01_apply.sql`, MD5 `0a9af41164d7d5a44e41630c7d0e708b`. Root byte-exact staging/pārskatīšana paliek obligāta.
- Pārējo importētāju labojumi sagatavoti, **nav atsevišķi izvietoti**. Izlaiduma secība: pārskatīta DB aizsardzība → pārējie importētāji; bez sinhronizācijas/pārcenošanas.

## Sakņu cēloņi
1. Iepriekš outlet tika kļūdaini izmantots preces/cenas izņemšanai. `refresh_catalog_prices()` dzēš un pārbūvē cenas; MF guard izslēdz modeļa/nomenklatūras outlet, UTT arī outlet un mediānas aizdomu filtru. Publiskais `catalog_items` slēpj MF outlet modeļus un UTT outlet krāsas.
2. Daudzuma pirmais līmenis nav pierādījums parastai ne-akcijas cenai. MF `/product/prices` laukos nav identificēts autoritatīvs normal/list-price lauks; ieteiktā mazumtirdzniecības cena NAV mūsu parastā iepirkuma bāze.
3. UTT/FR/SS masīvs vai lapa ar HTTP 200, NWG atlasītu modeļu atbildes/90% pārklājums un vecs PF manifests nav pilna autoritatīva kataloga pierādījums.

## MF139 faktiskie rezultāti
- Navy `02` un Blue Atoll `44`, precīzie S/M/L/XL/2XL SKU: saglabātā iepirkuma vērtība **5,25**, publiskā neto **9,19**, bruto **11,12**; pirms/pēc šīs kārtas nemainīti.
- Atoll XS `1394412`: saglabātā iepirkuma vērtība **4,73**, publiskās cenas nav; 5,25 no S nepiešķīrām.
- Diapazons saglabājas **8,96–9,80 neto**.
- Atrastā 2026-07-21 kopija satur 4,73 un vecu 7,80 publisko cenu, bet ne pierādītu regulāru cenu. `private.price_rollback_20261019` MF139 ierakstu nav. Šīs kopijas nav izmantojamas standarta cenas atjaunošanai.
- Tieši **24** neatrisinātie avota outlet SKU (jaunākā raw nomenklatūra):
  `1390412,1390413,1390414,1390415,1390416,1390417,1390712,1391212,1391512,1393912,1393913,1393914,1393915,1393916,1393917,1394012,1394312,1394412,1396312,1396313,1396316,1396317,1399312,1399512`.
- Precizējums: vecā kopsavilkuma `1396312–1396317` bija pārāk plašs; aktuālajā autoritatīvajā saglabātajā sarakstā nav `1396314/1396315`.
- **Atjaunotas 0/24 cenas**; bloķē tā paša SKU verificēta normālā bāze/pēdējā verificētā regulārā publicētā cena.

## Piegādātāju segums
| Avots | Sagatavotā aizsardzība | Atlikušais pierādījums/izlaidums |
|---|---|---|
| MF | Importā saglabā esošo exact-SKU cenu, outlet to nenullē; nezināmas jaunās cenas neizdomā | Importētājs izvietots. DB guard joprojām vecais līdz 009. Normālo cenu semantika nav pierādīta |
| UTT | Saglabā esošās cenas; aptur izņemšanu bez pilnas eksporta kvīts; frontend vairs nefiltrē outlet | Nav izvietots; DB outlet/mediānas filtrs jāaizstāj ar 009 |
| Falk&Ross | Bojāta/tukša krāsas matrica aptur modeli; nav izņemšanas pēc lapas/queue; saglabā cenas | Nav izvietots; scrape cenu normal semantika nav pierādīta |
| SS | Saglabā cenas; aptur automātisku arhivēšanu pēc masīva atbildes | Nav izvietots; supplier Published lauka faktiskā semantika un pilnīguma kvīts vēl nepārbaudīta |
| NWG | Saglabā cenu payload; atlasītas website atbildes neizņem/neatjauno slēptos; 90% heuristika nevar arhivēt; metadata saglabā publicēšanas stāvokli | Nav izvietots; active/discontinued semantika un pilnas avota kvīts vēl nepārbaudīta |
| PF | Saglabā precīzas iepirkuma/publiskās cenas; mark_stale prasa certified authoritative_complete | Nav izvietots; pašreizējais manifests šādu sertifikāciju neizdod — izņemšana droši bloķēta |
| BB/BagBase/Beechfield/Quadra/Westford Mill | Kodā nav atrasta bb_prices cenu importēšana vai pazudušo izņemšana; kopīgo public-price saglabāšanu aptver 009 | Pilna cenu avota semantika nav verificēta |
| Russell | Esošais model-wide cenu glabājums neskarts; ×1,70 nemainīts; kopīgo public-price saglabāšanu aptver 009 | Autorizēts aktuālās normal cenas importētājs nav atrasts |

## Persistence un drošība
- Sagatavotais exact-SKU evidence registry nošķir `held_legacy` no `verified_regular`; veca saglabāta cena NETIEK uzdota par standarta pierādījumu. Šaurs backfill tikai pašreizējām MF139 publicētajām vērtībām.
- Refresh vairs nevar dzēst cenu promocijas/atbildes kļūmes dēļ; jauna cena pieļaujama tikai ar pārskatītu exact-SKU evidence ierakstu. Formulas netiek pārrakstītas vai pārrēķinātas.
- Publiskā pieeja iepirkuma cenām netiek pievienota. Manuālie slēpumi/apavu aizliegumi netiek atcelti. Nav blanket unhide.
- Drošā aizturēšana apzināti iesaldē nepierādītus jaunus cenu kandidātus; **tas vēl nav pabeigts automatizēts normal-price imports**.

## Mainītie faili
- `supabase/functions/_shared/regularPricePolicy.ts`
- `supabase/functions/_shared/supplierFlags.ts`, `supplierFlags.test.ts`
- `supabase/functions/{malfini-sync,utt-sync,falkross-sync,stanley-stella-sync,nwg-sync,nwg-price-sync,pf-concept-sync}/index.ts`
- `src/components/catalog/CatalogItemDialog.tsx`
- `src/lib/regularPricePolicy.test.ts`, `src/lib/supplierFlags.test.ts`
- `docs/pending-migrations/009_regular_price_retention/01_apply.sql`
- `AGENTS.md`, `roadmap.md`, šis pārskats; precizētās biznesa atmiņas.

## Pārbaudes
- Pilnais Vitest: **357/357**, **57/57 faili**. Jaunie saglabāšanas/pilnīguma testi **11/11**; sākas/beidzas akcija, trūkst regular lauka, nulles/outlet klātbūtne, daļējs/neveiksmīgs avots, pilna prombūtne, manuāls slēpums, same-SKU un read kļūme.
- Harness žurnāls: **build OK** 14:20:51 UTC; atsevišķs manuāls typecheck/build nav palaists.
- Pārlūks `/catalog/item/mf/139?color=%221394412%22`: 15 krāsas, Atoll foto/paraugs saskan, S 9,19/11,12; XS bez izdomātas cenas; runtime kļūdu nav. Screenshot `/tmp/browser/regular-prices/mf139.png`.
- Migrācija nav palaista vai end-to-end izpildīta; nepieciešama root SQL pārskatīšana. Neviena piegādātāja pilna sinhronizācija nav veikta.