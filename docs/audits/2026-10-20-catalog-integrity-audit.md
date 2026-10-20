# Kataloga integritātes audits — 2026-10-20

## B15 / B25 (Beechfield) — cēlonis pierādīts
- Avots: piegādātāja B15 lapa satur arī saistīto B15C (sandwich peak) attēlus.
- Mūsu kļūda: `beechfield-sync` filtrēja attēlus ar apakšvirkni `fname.includes(code)` → `b15c_…` atbilda `b15`, `b25c_white_french-navy` atbilda `b25`, `b673` atbilda `B67`, `bg542` atbilda `BG5`.
- Galerijā krāsas atlase ar apakšvirkni (`"bottlegreen"` ⊂ `"…bottle-green-white…"`) šos svešos kadrus ielika izvēlētajā krāsā.
- Labojums: `_shared/bbImageOwnership.ts` (+ identiska `src/lib` kopija) — vesela koda tokena piederība un krāsas vārdi kā veseli tokeni. Izmantots importētājā, produkta galerijā (`loadBB`) un kataloga kartītēs.
- Datu labojums: izdzēstas 57 modeļa līmeņa (`color_name IS NULL`) rindas 23 modeļos; neviena nebija primārā. Iepriekšējās vērtības: `2026-10-20-bb-foreign-images-removed.csv` (atjaunošanai INSERT no CSV).
- Pārlūks (Chromium, lokāli): B15 Bottle Green galerija = tikai `b15_bottle-green`; B25 White = `b25_white` + `b25_white_lifestyle`. Vizuāli pārbaudīts B15 ekrānattēls.

## Pārklājums (pilni skaiti, ne paraugi)
| Piegādātājs | Modeļi | Varianti | Attēli | Attēlu piederība | Cenu rindas (SKU/modeļi) |
|---|---|---|---|---|---|
| BB | 672 | 2963 | 8634→8577 | modeļa: 57 FAIL→labots; krāsu: 26 neatbilst (skat. zemāk) | 2931 / 658 |
| SS | 159 | 10657 | 28322 | 0 sveši (fname satur stilu) | 10651 / 159 |
| MF | 424 | 15584 | 11639 | 0 sveši; SKU prefikss 0 kļūdu | 15521 / 418 |
| PF | 2277 | 20717 | 111281 | 0 attēlu ar citu modeļa item_code | 19644 / 2121; 37 cenu SKU nav pf_variants |
| NWG | 14191 | 14323 | 106634 | 0 item_number ar citu product_number | 64419 / 2858 |
| Russell | 93 | — | 5487 | 0 ar citu modeļa ceļu | 93 / 93 |
| UTT | 564 | 20836 | 6820 | 40 bez pilna koda, visiem sakrīt ciparu daļa (Regatta re674↔RETRA674) → PASS | 18238 / 399 |
| F&R | 255 | 3030 | 872 | NEPĀRBAUDĀMS programmatiski (ceļi `347_68_200_f…` nesatur stila kodu) | 2617 / 255 |
| ETX | — | — | — | manuāli | 12 / 12 |
Visas `catalog_variant_prices` cenas > 0.

## Anomālijas, kas NAV labotas
- BB 26 krāsu rindas no piegādātāja „Available Colours” bloka rāda cita koda failu (B640B→b640, B645B→b645, B655B→b655, B320B→b320, W710→w701, BG75→bgg75, QS70→qss70, 4 UUID faili). Piegādātāja dati; vai foto vizuāli atšķiras — nav pārbaudīts. Saglabāti.
- SS: 1786 stila+krāsas kombinācijām ir attēli bez varianta (nepublicētas/vecas krāsas); UI krāsas ņem no variantiem, tāpēc netiek rādītas.
- PF: 37 cenu rindām nav atbilstoša pf_variants SKU (bāreņi; izvēlē neparādās).

## Nepārbaudīts
- Katra attēla vizuālā atbilstība (tikai B15/B25 skatīti ar aci).
- Cenu formulu pārrēķins pret iepirkuma cenām šajā auditā netika palaists (psql nevar izsaukt `price_audit_*`); izmantot admin „Cenu audits”.
- Salīdzinājums ar piegādātāju tiešsaistes datiem (izņemot B15 lapas struktūru, kas redzama importētāja HTML filtrā) — netika veikts.
- Izmēru piederība krāsai ārpus BB (BB variantiem izmērs = null).

## Papildinājums 2026-10-20 (2. kārta)

### Laboti sistēmiski (kods)
- `loadBB`: vairs NEpievieno visus modeļa foto, ja krāsai nav atbilstoša faila. Modeļa foto piešķir krāsai tikai `bbAssignImageColor`: krāsas segmentam jāsākas tieši aiz precīzā modeļa koda tokena, jāsakrīt ar garāko PILNO krāsu no modeļa oficiālā variantu saraksta; ja aiz tās seko cits krāsas vārds (black_white bez krāsas "Black/White"), fails netiek piešķirts. Vecais `bbImageMentionsColor` dzēsts.
- Tā pati kategorija (krāsa bez sava foto → visi bezkrāsas modeļa foto) labota MF, UTT, F&R un PF galerijās: `neutralFallback` — bezkrāsas foto tikai vienkrāsas modelim, citādi "Bez attēla".
- BB simulācija ar reāliem datiem: 672 modeļi, 2 963 krāsas; 4 473 modeļa foto piešķirti, 1 177 nepiešķirti (vairs netiek rādīti krāsām); 36 krāsām nav pierādīta foto → `2026-10-20-bb-colours-without-proven-image.csv`.
- ETX trigeris `refresh_etx_catalog_prices` glabāja bruto cenu (pilnā atjaunošana glabā neto /1.21) → pēc jebkuras preces labošanas būtu dubults PVN. Trigeris izlabots (migrācija 0021); esošie 12 ETX ieraksti jau bija neto, dati netika pārrakstīti.

### Cenu pārrēķins (visi redzamie varianti, LEFT JOIN)
- `price_audit_*` RPC prasa `has_role(auth.uid(),'admin')`; `private` shēma sandbox lomai nav pieejama (`permission denied for schema private`), tāpēc nevar nolasīt pat definīciju; tā arī mainīta caur dinamisku `replace` migrācijā. Tādēļ formula pārrēķināta neatkarīgi no `refresh_catalog_prices()`/`refresh_utt_catalog_prices()` pašreizējās definīcijas: `sql/2026-10-20-price-recompute.sql`.
- Rezultāts `2026-10-20-price-recompute-summary.csv`: 134 583 redzami varianti; 0 neatbilstību, 0 nulles cenu, 0 trūkstošu cenu, kur bāze ir. Bez bāzes cenas (godīgi bez cenas): BB 32, F&R 308, PF 116, SS 6, UTT 44 (t.sk. outlier-aizsardzība pēc politikas) → `2026-10-20-price-nonok-variants.csv`. Bāreņu cenu rindas: PF 37, ETX 12 (ETX = produkts, nav varianta tabulas — PASS).
- Malfini pret oficiālo API (`/product/prices`, limit=1, tikai lasīšana): 15 565/15 584 sakrīt; 19 atšķiras (DB cena 1–4 % augstāka) → `2026-10-20-mf-source-price-diffs.csv`. Cēlonis: kopš 14.10. neviena piegādātāja sinhronizācija nav ierakstījusi žurnālu, lai gan cron 19.10. izpildījās "succeeded" (invoke_sync_function atgriežas bez kļūdas, ja trūkst vault atslēgas; HTTP atbildes jau dzēstas — cēlonis NEPIERĀDĪTS). Cenas netika rakstītas.

### Skaiti (raw / modeļi / redzami)
NWG: 70 602 SKU, 14 323 krāsu varianti, 14 191 `nwg_styles` rindas, 3 434 produkti ar SKU, redzami 2 858 modeļi / 64 419 SKU (iepriekšējais "14 191 modeļi" bija rindu skaits, nesalīdzināms). Redzami modeļi/varianti: BB 672/2 963, F&R 255/2 925, MF 418/15 521, PF 2 156/19 723, RU 93/93, SS 159/10 657, UTT 405/18 282.

### Relāciju pārbaudes (`2026-10-20-relational-checks.tsv`)
PASS (0): cenas modelis = varianta modelis (visi); cenas krāsa/izmērs = varianta (visi izņemot PF, kur atslēga ir item_code); SKU vairākos modeļos; NWG/MF/SS SKU prefikss; dublēti krāsa+izmērs BB/MF/SS/UTT/F&R; foto krāsa ∉ modelis MF/BB/UTT/F&R/PF/NWG.
Anomālijas: PF 104 item_code bez modeļa prefiksa (PF item kodi ir neatkarīgi numuri, piem. 100165→19549863 — informatīvi); PF 1 dublikāts = 22020095/22020099 (zināms, apzināti); NWG 3 = 649066 ×2 un 024165-949 XS/S (SKU-specifiski, kā paredzēts); SS 11 459 foto nepublicētām krāsām (galerijā netiek rādīti); RU 993 foto krāsām, kas nav `ru_variants` (filtrē `russellImagesForColor`); krāsas bez sava foto: BB 36, MF 12, UTT 47, F&R 3, NWG 52.

### Avota pārbaudes
- BB 26 koda neatbilstības (`2026-10-20-bb-code-mismatch-images.csv`): visas 26 ir piegādātāja paša modeļa lapā kā šīs krāsas attēls → piegādātāja piešķirtas; vizuālā atbilstība (piem., B640B junior ar b640 failu, W710 ar w701) NEPĀRBAUDĪTA, nav apgalvots kā defekts.
- UTT Regatta 40: UTT Data Export (brand Regatta, 2 720 rindas) — visi 40 faili piešķirti tieši tam modelim/krāsai → piegādātāja eksplicīta piesaiste (`2026-10-20-utt-regatta-40-source-check.csv`).
- Nav veikts šajā kārtā: SS, NWG, PF, F&R tiešsaistes paraugi (piekļuves ir, bet nav salīdzināts); katras bildes vizuālā pārbaude.

## 3. kārta (2026-10-20 07:40–08:00 UTC)

### Labots
- Kataloga kartītes (BB): modeļa foto krāsu piešķir tas pats `bbAssignImageColor` ar modeļa aktīvo krāsu sarakstu; BB/UTT/F&R kartītes salīdzina veselus krāsu nosaukumus (agrāk "Off-White" → sufikss "white" varēja parādīties pie White). Izvēlētai krāsai bezkrāsas kadri netiek rādīti. Tests `useCatalogCardImages.test.ts`.
- 36 BB krāsas bez pierādīta foto (`2026-10-20-bb-colours-without-proven-image.csv`) rāda "Bez attēla" — apzināti konservatīvi.
- DROŠĪBA: `stanley-stella-sync`, `nwg-sync`, `nwg-price-sync`, `nwg-size-names`, `beechfield-sync` nebija nekādas piekļuves pārbaudes — ar publisko atslēgu varēja palaist pilnu sinhronizāciju. Pievienots `isSyncCallerAllowed` (servisa atslēga vai admins), izvietots; pēcpārbaude: publiskā atslēga → 401 visām 5.
  - Atklāšanas brīdī mana pārbaude ar publisko atslēgu NEJAUŠI palaida `stanley-stella:all` (07:39, success, parasts upsert) un `nwg:all` (07:40). Tas nebija plānots.
- Malfini 19 cenas: API `/product/prices` limit=1 vienības cena (viena vērtība katram SKU) → `wholesale_price`, `retail_price = ×1.65` (esošā formula), publiskā cena un modeļa diapazons; rezerves kopija `2026-10-20-mf-19-before.csv`. Pēcpārbaude: 15 584/15 584 sakrīt ar API; publiskās MF cenas 0 neatbilstību.
- ETX trigeris: migrācija PIEMĒROTA (`pg_get_functiondef` satur `/1.21`). Atceltā testa transakcijā preces atjaunošana deva stored=16.4463 = 19.90/1.21; viss atcelts. 12/12 ETX cenas neto.

### Sinhronizāciju apstāšanās (kopš 14.10.)
- Cron 19.10. visām darbībām "succeeded", bet tas nozīmē tikai, ka `invoke_sync_function` izpildījās. Žurnālu trūkums NEPIERĀDA, ka pieprasījums funkciju nesasniedza (edge žurnāli var būt nepilnīgi vai izdzēsti). Iespējamie cēloņi, neviens nav pierādīts: vault `email_queue_service_role_key` ir NULL (funkcija tad tikai `RAISE WARNING`), HTTP kļūda vai funkcijas kļūda pirms ieraksta `sync_logs`. Vault hipotēze ir aizdomas, nevis fakts.
- Nevar pārbaudīt: vault lasīšana bloķēta (`blocked_query: vault.decrypted_secrets`), `net._http_response` tukšs (TTL). Ieteikums: Lovable Cloud atbalstam pārbaudīt, vai `email_queue_service_role_key` vault eksistē un atbilst pašreizējai servisa atslēgai.

## 4. kārta — PF 237 cenas
- Pilna PF cenu plūsma (izveidota 2026-10-17, 19 604 preces) nolasīta tikai lasīšanai. Visām 237: `clearance:"C"` + `promotion` bloks (startDate 2026-10-16). Zemākā cena ir izpārdošanas/akcijas cena, NE standarta. Klasifikācija: standarta 0, akcija/izpārdošana 237. Cenas NEMAINĪTAS.
- 160/237 mūsu esošā bāzes cena = plūsmas 1. līmeņa `standardPrice`; 77 atšķiras (nenoteikts, nemainīts).
- Sistēmiska kļūda: sinhronizācija ņēma `nettPrice`, tātad nākamā sinhronizācija ierakstītu izpārdošanas cenas (plūsmā 1 535 clearance, 2 220 promotion preces). Labots: `_shared/pfPrice.ts` — clearance/promotion precēm tikai 1. līmeņa `standardPrice`; ja tās nav → null, rinda izlaista, iepriekšējā cena saglabāta (nekad samazinātā `nettPrice`); parastām precēm 1. līmeņa `nettPrice`. Pieļauj atstarpes un lauku secību. 5 testi `src/lib/pfPrice.test.ts`. `pf-concept-sync` izvietota, NEpalaista.
- Frontend publicēts (root, f7c8a97). NWG `nwg:all` (sākta 07:40:32) 07:50 pārbaudē joprojām `running`, nav pabeigta; atjaunoto 0, kļūdu 0; cenu pēcpārbaude nav veikta.
- Sekas: PF paraugs (cenu plūsmas pirmie 1,5 MB, plūsma 17.10.): 2 733 preces, 237 bāzes cenas DB augstākas par plūsmu (piem. 1,69 → 1,39), visas atjaunotas 14.10. → `2026-10-20-pf-sample-price-diffs.csv`. NELABOTS (nav autorizēts; risinājums — salabot sinhronizāciju).

### Piegādātāju paraugi
- Malfini: pilns (15 584 SKU) — skat. augstāk.
- PF: 2 733 preces paraugs — 237 novecojušas, 0 trūkst.
- UTT Regatta: 40/40 eksplicīta piesaiste.
- SS: avota dati atjaunoti nejaušajā 07:39 sinhronizācijā; neatkarīgs paraugs NAV veikts.
- NWG: `nwg:all` palaists 07:40; paraugs NAV veikts.
- F&R: NAV pārbaudīts (avots ir vietnes pieteikšanās sesija, nevis API).

### Audita vaicājumi
`docs/audits/sql/2026-10-20-price-recompute.sql`, `docs/audits/sql/2026-10-20-relational-checks.sql`.

## 5. kārta (08:03 UTC, tikai lasīšana)
- NWG `nwg:all` (07:40:32): joprojām `running`, nav kļūdu ziņas; pēdējā progresa zīme `nwg_styles.last_synced_at` 07:43:26 (1 732 modeļi), pēc tam 20 min nekā → praktiski apstājies, nav beidzies. Nākamais `invoke_sync_function` to atzīmēs (reap 30 min). Pārrēķins visiem redzamajiem variantiem: NWG 64 419 ok, 0 neatbilstību; arī SS 10 603, MF 15 521, PF 19 607, BB 2 931, UTT 18 238, F&R 2 617, RU 93 ok; 0 neatbilstību, 0 nulles cenu.
- PF 77: visos 77 promotion bloka 1. līmeņa `standardPrice` ir AUGSTĀKS par mūsu 14.10. bāzi (×1,07–×4,68), viena akcija no 2026-10-16. Mūsu bāze = pēdējā novērotā parastā cena pirms akcijas. Akcijas "standardPrice" var būt atsauces/pārsvītrotā cena; tas, ka tā ir pašreizējā parastā vienības cena, NAV pierādīts → cenas NEmainītas.
- Grafiks: visi sinhronizācijas darbi ieplānoti tikai pirmdienās (`* * 1`). Cron ieraksti: SS ik dienu līdz 10-15, tad 10-19; `sync_logs` pēdējais 10-14 → 10-15 un 10-19 izsaukumi "succeeded", bet bez ieraksta. `vault.secrets` šai lomai rāda 0 rindu KOPĀ (arī citu noslēpumu nav redzams) → redzamība, nevis pierādījums, ka atslēgas nav. Cēlonis nepierādīts.
